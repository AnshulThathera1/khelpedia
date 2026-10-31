import { BaseFetcher } from '../BaseFetcher.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';
import { FailedRecordQueue } from '../FailedRecordQueue.js';
import { DataValidator } from '../DataValidator.js';
import IngestionLogger from '../IngestionLogger.js';
import { BatchTracker } from '../BatchTracker.js';
import { pool } from '../../db.js';

export default class ESportsAmazeEngine extends BaseFetcher {
  constructor(options = {}) {
    super({
      sourceName: 'esportsamaze',
      requestDelayMs: parseInt(process.env.ESPORTS_AMAZE_REQUEST_DELAY_MS || '2000', 10),
      maxConcurrency: 1,
      maxRetries: 5
    });
    this.upsertManager = new IdempotentUpsert();
  }

  /**
   * Main execution entry point for eSportsAmaze ingestion.
   * @param {Object} options Options like { slug: 'bgms-2026', batchTracker: ..., fixtureData: ... }
   */
  async run(options = {}) {
    const runStartTime = Date.now();
    const batchTracker = options.batchTracker || new BatchTracker({
      source: 'esportsamaze',
      targetSlug: options.slug || null
    });

    IngestionLogger.info('ESportsAmazeEngine', `Starting eSportsAmaze BGMI ingestion run [Batch: ${batchTracker.getBatchId()}]... Target slug: ${options.slug || 'ALL'}`);

    const targetSlug = options.slug;
    const tournamentsToProcess = targetSlug
      ? [`https://esportsamaze.com/tournaments/${targetSlug}`]
      : [
          'https://esportsamaze.com/tournaments/battlegrounds-mobile-india-showdown-2026',
          'https://esportsamaze.com/tournaments/battlegrounds-mobile-india-pro-series-2026',
          'https://esportsamaze.com/tournaments/battlegrounds-mobile-india-international-cup-2026',
          'https://esportsamaze.com/tournaments/battlegrounds-mobile-india-series-2025',
          'https://esportsamaze.com/tournaments/bgms-2026'
        ];

    let totalTournamentsProcessed = 0;
    let totalMatchesProcessed = 0;
    let totalTeamResultsProcessed = 0;
    let totalPlayerStatsProcessed = 0;
    let totalStageStandingsProcessed = 0;
    let totalErrorsCount = 0;

    try {
      for (const tourneyUrl of tournamentsToProcess) {
        let client = null;
        let txQueryFn = options.batchTracker?.queryFn || null;
        try {
          const slug = tourneyUrl.split('/').pop();
          IngestionLogger.info('ESportsAmazeEngine', `Processing BGMI Tournament: ${slug}`);

          let matchesExtracted = [];
          let standingsRows = [];

          // If offline fixture data is provided, use it directly without network calls
          if (options.fixtureData) {
            const fixture = options.fixtureData;
            matchesExtracted = fixture.sampleMatch ? [fixture.sampleMatch] : (fixture.matches || []);
            standingsRows = fixture.standings || [];
          } else {
            // 1. Fetch & ingest Tournament matches RSC payload
            const matchesUrl = `${tourneyUrl}/matches`;
            const response = await this.fetch(matchesUrl, { headers: { 'Accept': 'text/html,application/xhtml+xml,*/*' } });
            if (!response.ok || !response.data) {
              IngestionLogger.warn('ESportsAmazeEngine', `Empty or failed response for tournament: ${slug}`);
              continue;
            }
            matchesExtracted = this.parseMatchesFromRSCPayload(response.data, matchesUrl);

            // Fetch Standings
            const standingsUrl = `${tourneyUrl}/standings`;
            const standingsRes = await this.fetch(standingsUrl);
            if (standingsRes && standingsRes.ok && standingsRes.data) {
              standingsRows = this.parseStandingsFromRSCPayload(standingsRes.data);
            }
          }

          IngestionLogger.info('ESportsAmazeEngine', `Extracted ${matchesExtracted.length} match objects from payload for ${slug}`);

          // Upsert canonical Tournament entity first
          const tournamentPayload = {
            name: this.formatTournamentName(slug),
            slug: slug,
            game_id: '01dae6b9-7e1a-4a70-a452-648e441e2ca2',
            region: 'IN',
            status: 'completed'
          };

          const tournamentValidation = DataValidator.validateTournament(tournamentPayload);
          if (!tournamentValidation.valid) {
            await FailedRecordQueue.enqueue('esportsamaze', tourneyUrl, slug, tournamentValidation.error, tournamentPayload);
            totalErrorsCount++;
            continue;
          }

          // Acquire dedicated client from connection pool if DB execution is active
          const activePool = options.pool !== undefined ? options.pool : pool;
          const isLiveDB = !options.dryRun && (options.pool || (activePool && !options.fixtureData));

          if (isLiveDB) {
            try {
              client = await activePool.connect();
              await client.query('BEGIN;');
              txQueryFn = client.query.bind(client);
              batchTracker.queryFn = txQueryFn;
            } catch (connErr) {
              IngestionLogger.error('ESportsAmazeEngine', `Database connection failed for tournament ${slug}: ${connErr.message}`);
              totalErrorsCount++;
              await batchTracker.fail(connErr);
              continue;
            }
          }

          // Non-blocking transaction advisory lock to prevent concurrent worker collisions
          const lockAcquired = await batchTracker.tryAcquireTournamentLock('esportsamaze', slug, txQueryFn);
          if (!lockAcquired) {
            IngestionLogger.warn('ESportsAmazeEngine', `Lock contention: Tournament "${slug}" is currently locked by another worker. Skipping.`);
            if (client) {
              try { await client.query('ROLLBACK;'); } catch {}
              client.release();
              client = null;
              batchTracker.queryFn = null;
            }
            continue;
          }

          // Persist batch start within the active transaction
          if (txQueryFn) {
            await batchTracker.persistStart(txQueryFn);
          }

          const canonicalTournamentId = await this.upsertManager.upsertTournament(
            tournamentValidation.data,
            'esportsamaze',
            slug,
            tourneyUrl,
            null,
            batchTracker
          );

          if (!canonicalTournamentId) {
            throw new Error(`Failed to upsert canonical tournament entity for slug: ${slug}`);
          }

          totalTournamentsProcessed++;

          // 2. Ingest Matches & Multi-Team Results & Player Telemetry
          for (const matchObj of matchesExtracted) {
            try {
              const sourceMatchId = matchObj.id;
              const mapName = matchObj.mapName || null;
              const formatStr = matchObj.format || null;
              const rawScheduledAt = matchObj.scheduledAt || null;
              const scheduledAt = rawScheduledAt ? String(rawScheduledAt).replace(/^\$D/, '') : null;

              // Validate Match Payload
              const matchValidation = DataValidator.validateMatch({
                sourceMatchId,
                tournamentId: canonicalTournamentId,
                map: mapName,
                round: formatStr,
                playedAt: scheduledAt,
                isHeadToHead: false
              });

              if (!matchValidation.valid) {
                await FailedRecordQueue.enqueue('esportsamaze', tourneyUrl, sourceMatchId, matchValidation.reason || matchValidation.error, matchObj);
                totalErrorsCount++;
                continue;
              }

              // Upsert Canonical Match Entity
              const canonicalMatchId = await this.upsertManager.upsertMatch(
                {
                  tournament_id: canonicalTournamentId,
                  round: formatStr,
                  map: mapName,
                  played_at: scheduledAt ? new Date(scheduledAt).toISOString() : null
                },
                'esportsamaze',
                sourceMatchId,
                tourneyUrl,
                null,
                batchTracker
              );

              totalMatchesProcessed++;

              // Process Dynamic TeamResults returned for this match
              const teamResults = matchObj.teamResults || [];
              let matchTeamResultsCount = 0;

              for (const tr of teamResults) {
                try {
                  const sourceTeamResultId = tr.id;
                  const sourceTeamObj = tr.team || {};
                  const sourceTeamId = tr.teamId || sourceTeamObj.id;

                  if (!sourceTeamId || !sourceTeamResultId) {
                    IngestionLogger.warn('ESportsAmazeEngine', `Skipping malformed TeamResult without ID: ${JSON.stringify(tr)}`);
                    continue;
                  }

                  // Upsert Team entity
                  const canonicalTeamId = await this.upsertManager.upsertTeam(
                    {
                      name: sourceTeamObj.name || 'Unknown BGMI Team',
                      slug: sourceTeamObj.slug || `team-${sourceTeamId}`,
                      logo_url: sourceTeamObj.logoUrl || sourceTeamObj.imageDarkUrl || null,
                      region: 'IN'
                    },
                    'esportsamaze',
                    sourceTeamId,
                    `https://esportsamaze.com/teams/${sourceTeamObj.slug || sourceTeamId}`,
                    null,
                    batchTracker
                  );

                  // Extract bonus points with strict NULL semantics
                  const bonusPoints = typeof tr.bonusPoints === 'number'
                    ? tr.bonusPoints
                    : (typeof tr.bonusPts === 'number' ? tr.bonusPts : null);

                  // Build match_teams record
                  const matchTeamPayload = {
                    match_id: canonicalMatchId,
                    team_id: canonicalTeamId,
                    source_result_id: sourceTeamResultId,
                    placement: typeof tr.rank === 'number' ? tr.rank : null,
                    placement_points: typeof tr.placePoints === 'number' ? tr.placePoints : null,
                    elimination_points: typeof tr.elimsPoints === 'number' ? tr.elimsPoints : null,
                    num_points: (typeof tr.placePoints === 'number' && typeof tr.elimsPoints === 'number') 
                      ? (tr.placePoints + tr.elimsPoints + (bonusPoints || 0)) 
                      : null,
                    wwcd: typeof tr.wwcd === 'boolean' ? tr.wwcd : null,
                    kills: typeof tr.kills === 'number' ? tr.kills : null
                  };

                  // Upsert into match_teams
                  await this.upsertManager.upsertMatchTeam(matchTeamPayload, batchTracker);
                  matchTeamResultsCount++;
                  totalTeamResultsProcessed++;
                } catch (trErr) {
                  IngestionLogger.error('ESportsAmazeEngine', `Error ingesting TeamResult: ${trErr.message}`);
                  totalErrorsCount++;
                }
              }

              // Process Player Stats / Telemetry if present in match
              const playerStats = matchObj.playerStats || [];
              for (const ps of playerStats) {
                try {
                  const sourcePlayerId = ps.playerId || ps.player_id;
                  if (!sourcePlayerId) continue;

                  const statValidation = DataValidator.validateMatchPlayerStats({
                    match_id: canonicalMatchId,
                    player_id: sourcePlayerId,
                    kills: ps.kills,
                    damage: ps.damage,
                    assists: ps.assists,
                    survival_time_sec: ps.survivalTimeSec || ps.survivalTime
                  });

                  if (statValidation.valid) {
                    await this.upsertManager.upsertMatchPlayerStats({
                      match_id: canonicalMatchId,
                      player_id: sourcePlayerId,
                      team_id: ps.teamId || null,
                      kills: ps.kills ?? null,
                      damage: ps.damage ? Number(ps.damage) : null,
                      assists: ps.assists ?? null,
                      survival_time_sec: ps.survivalTimeSec || ps.survivalTime || null,
                      source_stat_id: ps.id || null
                    }, batchTracker);
                    totalPlayerStatsProcessed++;
                  }
                } catch (psErr) {
                  IngestionLogger.error('ESportsAmazeEngine', `Error ingesting player stat: ${psErr.message}`);
                }
              }

            } catch (mErr) {
              IngestionLogger.error('ESportsAmazeEngine', `Error ingesting match: ${mErr.message}`);
              totalErrorsCount++;
              if (client) throw mErr;
            }
          }

          // 3. Ingest Stage Standings
          for (const sRow of standingsRows) {
            try {
              const teamObj = sRow.team || {};
              const sourceTeamId = sRow.teamId || teamObj.id;
              if (!sourceTeamId) continue;

              const canonicalTeamId = await this.upsertManager.upsertTeam(
                {
                  name: sRow.teamName || teamObj.name || 'Unknown Team',
                  slug: sRow.teamSlug || teamObj.slug || `team-${sourceTeamId}`,
                  region: 'IN'
                },
                'esportsamaze',
                sourceTeamId,
                `https://esportsamaze.com/teams/${sRow.teamSlug || teamObj.slug || sourceTeamId}`,
                null,
                batchTracker
              );

              // Validate standings arithmetic & fields
              const standingsValidation = DataValidator.validateBGMIStandings({
                tournament_id: canonicalTournamentId,
                team_id: canonicalTeamId,
                rank_position: sRow.rankPosition,
                placement_pts: sRow.placementPts ?? sRow.placePoints ?? null,
                elimination_pts: sRow.eliminationPts ?? sRow.elimsPoints ?? null,
                bonus_pts: sRow.bonusPts ?? sRow.bonusPoints ?? null,
                total_pts: sRow.totalPts ?? sRow.totalPoints ?? null
              });

              if (!standingsValidation.valid) {
                IngestionLogger.warn('ESportsAmazeEngine', `Standings validation error for team ${sourceTeamId}: ${standingsValidation.reason}`);
                continue;
              }

              await this.upsertManager.upsertBGMIStageStandings({
                tournament_id: canonicalTournamentId,
                stage_name: sRow.stageName || 'Overall',
                team_id: canonicalTeamId,
                rank_position: sRow.rankPosition,
                matches_played: sRow.matchesPlayed ?? null,
                wwcd_count: sRow.wwcdCount ?? null,
                placement_pts: sRow.placementPts ?? sRow.placePoints ?? null,
                elimination_pts: sRow.eliminationPts ?? sRow.elimsPoints ?? null,
                total_pts: sRow.totalPts ?? sRow.totalPoints ?? null,
                bonus_pts: sRow.bonusPts ?? sRow.bonusPoints ?? null,
                tiebreaker_rule: sRow.tiebreakerRule || null
              }, batchTracker);

              totalStageStandingsProcessed++;
            } catch (sErr) {
              IngestionLogger.error('ESportsAmazeEngine', `Error ingesting stage standing row: ${sErr.message}`);
              totalErrorsCount++;
              if (client) throw sErr;
            }
          }

          // Commit batch ledger and transaction for this tournament
          if (txQueryFn) {
            await batchTracker.commit(txQueryFn);
          }
          if (client) {
            await client.query('COMMIT;');
            client.release();
            client = null;
            batchTracker.queryFn = null;
          }

        } catch (tErr) {
          IngestionLogger.error('ESportsAmazeEngine', `Error processing tournament ${tourneyUrl}: ${tErr.message}`);
          totalErrorsCount++;
          if (client) {
            try {
              await client.query('ROLLBACK;');
            } catch (rbErr) {
              IngestionLogger.error('ESportsAmazeEngine', `Rollback error: ${rbErr.message}`);
            } finally {
              client.release();
              client = null;
              batchTracker.queryFn = null;
            }
          }
          // Persist failure outside the rolled-back transaction so it survives in the ledger
          try {
            const fallbackQueryFn = (options.pool || pool)?.query?.bind(options.pool || pool);
            if (fallbackQueryFn) {
              await batchTracker.fail(tErr, fallbackQueryFn);
            } else {
              await batchTracker.fail(tErr);
            }
          } catch (failErr) {
            IngestionLogger.error('ESportsAmazeEngine', `Failed to persist batch failure: ${failErr.message}`);
          }
        } finally {
          if (client) {
            try { await client.query('ROLLBACK;'); } catch {}
            client.release();
            client = null;
            batchTracker.queryFn = null;
          }
        }
      }

      // Ensure final batch ledger status accurately reflects execution outcome
      if (batchTracker.status === 'IN_PROGRESS') {
        if (totalErrorsCount === 0 && totalTournamentsProcessed > 0) {
          await batchTracker.commit();
        } else {
          await batchTracker.fail(new Error(`Batch finished with ${totalErrorsCount} errors and ${totalTournamentsProcessed} tournaments processed`));
        }
      }
    } catch (unhandledErr) {
      if (batchTracker.status !== 'FAILED') {
        await batchTracker.fail(unhandledErr);
      }
      throw unhandledErr;
    }

    const durationSeconds = ((Date.now() - runStartTime) / 1000).toFixed(2);
    IngestionLogger.info('ESportsAmazeEngine', `Ingestion completed in ${durationSeconds}s. Tournaments: ${totalTournamentsProcessed}, Matches: ${totalMatchesProcessed}, TeamResults: ${totalTeamResultsProcessed}, PlayerStats: ${totalPlayerStatsProcessed}, Standings: ${totalStageStandingsProcessed}, Errors: ${totalErrorsCount}`);

    return {
      batchId: batchTracker.getBatchId(),
      batchStatus: batchTracker.status,
      manifest: batchTracker.getManifest(),
      tournaments: totalTournamentsProcessed,
      matches: totalMatchesProcessed,
      teamResults: totalTeamResultsProcessed,
      playerStats: totalPlayerStatsProcessed,
      standings: totalStageStandingsProcessed,
      errors: totalErrorsCount
    };
  }

  /**
   * Parses match definitions, teamResults, and playerStats from RSC HTML payload or fixture.
   */
  parseMatchesFromRSCPayload(html, sourceUrl) {
    if (typeof html === 'object' && html !== null) {
      return html.sampleMatch ? [html.sampleMatch] : (html.matches || []);
    }

    const cleanHtml = String(html).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const matchesIter = cleanHtml.matchAll(/\{"id":"(cmt[a-zA-Z0-9]+)".*?"mapName":"([^"]+)".*?"teamResults":\[(.*?)\]\s*,\s*"playerStats":\[(.*?)\]\}/g);
    
    const matches = [];
    const seenIds = new Set();

    for (const m of matchesIter) {
      const matchId = m[1];
      if (seenIds.has(matchId)) continue;
      seenIds.add(matchId);

      const mapName = m[2];
      const teamResultsRaw = m[3];
      const playerStatsRaw = m[4];

      // Parse nested match fields around matchId
      const formatMatch = cleanHtml.match(new RegExp(`"id":"${matchId}".*?"format":"([^"]+)"`));
      const scheduledMatch = cleanHtml.match(new RegExp(`"id":"${matchId}".*?"scheduledAt":"([^"]+)"`));

      // Parse teamResults array with bonusPoints extraction
      const teamResults = [];
      const trMatches = teamResultsRaw.matchAll(/\{([^{}]+)\}/g);
      
      for (const tr of trMatches) {
        const objStr = `{${tr[1]}}`;
        try {
          const parsed = JSON.parse(objStr);
          teamResults.push({
            id: parsed.id,
            teamId: parsed.teamId,
            rank: typeof parsed.rank === 'number' ? parsed.rank : parseInt(parsed.rank, 10),
            wwcd: parsed.wwcd === true || parsed.wwcd === 'true',
            placePoints: typeof parsed.placePoints === 'number' ? parsed.placePoints : parseInt(parsed.placePoints || 0, 10),
            elimsPoints: typeof parsed.elimsPoints === 'number' ? parsed.elimsPoints : parseInt(parsed.elimsPoints || 0, 10),
            bonusPoints: (parsed.bonusPoints !== undefined || parsed.bonusPts !== undefined)
              ? (parsed.bonusPoints ?? parsed.bonusPts)
              : null
          });
        } catch {
          const idMatch = objStr.match(/"id":"([^"]+)"/);
          const teamIdMatch = objStr.match(/"teamId":"([^"]+)"/);
          const rankMatch = objStr.match(/"rank":(\d+)/);
          const wwcdMatch = objStr.match(/"wwcd":(true|false)/);
          const placeMatch = objStr.match(/"placePoints":(\d+)/);
          const elimsMatch = objStr.match(/"elimsPoints":(\d+)/);
          const bonusMatch = objStr.match(/"bonusPoints":(\d+)/) || objStr.match(/"bonusPts":(\d+)/);

          if (idMatch && teamIdMatch) {
            teamResults.push({
              id: idMatch[1],
              teamId: teamIdMatch[1],
              rank: rankMatch ? parseInt(rankMatch[1], 10) : 0,
              wwcd: wwcdMatch ? wwcdMatch[1] === 'true' : false,
              placePoints: placeMatch ? parseInt(placeMatch[1], 10) : 0,
              elimsPoints: elimsMatch ? parseInt(elimsMatch[1], 10) : 0,
              bonusPoints: bonusMatch ? parseInt(bonusMatch[1], 10) : null
            });
          }
        }
      }

      // Parse playerStats array
      const playerStats = [];
      if (playerStatsRaw && playerStatsRaw.trim().length > 0) {
        const psMatches = playerStatsRaw.matchAll(/\{([^{}]+)\}/g);
        for (const ps of psMatches) {
          const objStr = `{${ps[1]}}`;
          try {
            const parsed = JSON.parse(objStr);
            playerStats.push({
              id: parsed.id,
              playerId: parsed.playerId || parsed.player_id,
              teamId: parsed.teamId || parsed.team_id,
              kills: typeof parsed.kills === 'number' ? parsed.kills : parseInt(parsed.kills || 0, 10),
              damage: typeof parsed.damage === 'number' ? parsed.damage : parseFloat(parsed.damage || 0),
              assists: (parsed.assists !== undefined && parsed.assists !== null) ? Number(parsed.assists) : null,
              survivalTimeSec: (parsed.survivalTimeSec !== undefined || parsed.survivalTime !== undefined)
                ? (parsed.survivalTimeSec ?? parsed.survivalTime)
                : null
            });
          } catch {
            const idMatch = objStr.match(/"id":"([^"]+)"/);
            const playerIdMatch = objStr.match(/"playerId":"([^"]+)"/) || objStr.match(/"player_id":"([^"]+)"/);
            const teamIdMatch = objStr.match(/"teamId":"([^"]+)"/);
            const killsMatch = objStr.match(/"kills":(\d+)/);
            const dmgMatch = objStr.match(/"damage":([0-9.]+)/);
            const assistsMatch = objStr.match(/"assists":(\d+)/);
            const survivalMatch = objStr.match(/"survivalTime":(\d+)/) || objStr.match(/"survivalTimeSec":(\d+)/);

            if (playerIdMatch) {
              playerStats.push({
                id: idMatch ? idMatch[1] : null,
                playerId: playerIdMatch[1],
                teamId: teamIdMatch ? teamIdMatch[1] : null,
                kills: killsMatch ? parseInt(killsMatch[1], 10) : 0,
                damage: dmgMatch ? parseFloat(dmgMatch[1]) : 0,
                assists: assistsMatch ? parseInt(assistsMatch[1], 10) : null,
                survivalTimeSec: survivalMatch ? parseInt(survivalMatch[1], 10) : null
              });
            }
          }
        }
      }

      matches.push({
        id: matchId,
        mapName: mapName,
        format: formatMatch ? formatMatch[1] : null,
        scheduledAt: scheduledMatch ? scheduledMatch[1] : null,
        teamResults: teamResults,
        playerStats: playerStats
      });
    }

    return matches;
  }

  /**
   * Parses stage standings leaderboard rows from RSC stream payload with bonus and placement points.
   */
  parseStandingsFromRSCPayload(html) {
    if (typeof html === 'object' && html !== null) {
      return html.standings || [];
    }

    const cleanHtml = String(html).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const rowsIter = cleanHtml.matchAll(/\{([^{}]+)\}/g);
    const rows = [];

    for (const r of rowsIter) {
      const objStr = `{${r[1]}}`;
      try {
        const parsed = JSON.parse(objStr);
        if (parsed.teamId && (parsed.rankPosition !== undefined || parsed.rank !== undefined)) {
          rows.push({
            id: parsed.id,
            teamId: parsed.teamId,
            rankPosition: parsed.rankPosition ?? parsed.rank,
            totalPts: parsed.totalPoints ?? parsed.totalPts,
            matchesPlayed: parsed.matchesPlayed ?? null,
            wwcdCount: parsed.wwcdCount ?? null,
            placementPts: parsed.placementPts ?? parsed.placePoints ?? null,
            eliminationPts: parsed.eliminationPts ?? parsed.elimsPoints ?? null,
            bonusPts: (parsed.bonusPts !== undefined || parsed.bonusPoints !== undefined)
              ? (parsed.bonusPts ?? parsed.bonusPoints)
              : null,
            stageName: parsed.stageName || 'Overall'
          });
        }
      } catch {
        const idMatch = objStr.match(/"id":"([^"]+)"/);
        const teamIdMatch = objStr.match(/"teamId":"([^"]+)"/);
        const rankMatch = objStr.match(/"rankPosition":(\d+)/) || objStr.match(/"rank":(\d+)/);
        const totalMatch = objStr.match(/"totalPoints":(\d+)/) || objStr.match(/"totalPts":(\d+)/);

        if (teamIdMatch && rankMatch) {
          const matchesMatch = objStr.match(/"matchesPlayed":(\d+)/);
          const wwcdMatch = objStr.match(/"wwcdCount":(\d+)/);
          const placeMatch = objStr.match(/"placementPts":(\d+)/) || objStr.match(/"placePoints":(\d+)/);
          const elimsMatch = objStr.match(/"eliminationPts":(\d+)/) || objStr.match(/"elimsPoints":(\d+)/);
          const bonusMatch = objStr.match(/"bonusPts":(\d+)/) || objStr.match(/"bonusPoints":(\d+)/);

          rows.push({
            id: idMatch ? idMatch[1] : null,
            teamId: teamIdMatch[1],
            rankPosition: parseInt(rankMatch[1], 10),
            totalPts: totalMatch ? parseInt(totalMatch[1], 10) : 0,
            matchesPlayed: matchesMatch ? parseInt(matchesMatch[1], 10) : null,
            wwcdCount: wwcdMatch ? parseInt(wwcdMatch[1], 10) : null,
            placementPts: placeMatch ? parseInt(placeMatch[1], 10) : null,
            eliminationPts: elimsMatch ? parseInt(elimsMatch[1], 10) : null,
            bonusPts: bonusMatch ? parseInt(bonusMatch[1], 10) : null,
            stageName: 'Overall'
          });
        }
      }
    }
    return rows;
  }

  formatTournamentName(slug) {
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
