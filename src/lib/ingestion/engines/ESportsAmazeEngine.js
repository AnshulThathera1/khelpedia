import { BaseFetcher } from '../BaseFetcher.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';
import { FailedRecordQueue } from '../FailedRecordQueue.js';
import { DataValidator } from '../DataValidator.js';
import IngestionLogger from '../IngestionLogger.js';

export default class ESportsAmazeEngine extends BaseFetcher {
  constructor() {
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
   * @param {Object} options Options like { slug: 'battlegrounds-mobile-india-showdown-2026' }
   */
  async run(options = {}) {
    const runStartTime = Date.now();
    IngestionLogger.info('ESportsAmazeEngine', `Starting eSportsAmaze BGMI ingestion run... Target slug filter: ${options.slug || 'ALL'}`);

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
    let totalStageStandingsProcessed = 0;
    let totalErrorsCount = 0;

    for (const tourneyUrl of tournamentsToProcess) {
      try {
        const slug = tourneyUrl.split('/').pop();
        IngestionLogger.info('ESportsAmazeEngine', `Processing BGMI Tournament: ${slug}`);

        // 1. Fetch & ingest Tournament matches RSC payload
        const matchesUrl = `${tourneyUrl}/matches`;
        const response = await this.fetch(matchesUrl, { headers: { 'Accept': 'text/html,application/xhtml+xml,*/*' } });
        if (!response.ok || !response.data) {
          IngestionLogger.warn('ESportsAmazeEngine', `Empty or failed response for tournament: ${slug}`);
          continue;
        }
        const html = response.data;

        const matchesExtracted = this.parseMatchesFromRSCPayload(html, matchesUrl);
        IngestionLogger.info('ESportsAmazeEngine', `Extracted ${matchesExtracted.length} match objects from RSC payload for ${slug}`);

        // Upsert canonical Tournament entity first
        const tournamentPayload = {
          name: this.formatTournamentName(slug),
          slug: slug,
          game: 'BGMI',
          region: 'IN',
          status: 'completed'
        };

        const tournamentValidation = DataValidator.validateTournament(tournamentPayload);
        if (!tournamentValidation.valid) {
          await FailedRecordQueue.enqueue('esportsamaze', matchesUrl, slug, tournamentValidation.error, tournamentPayload);
          totalErrorsCount++;
          continue;
        }

        const canonicalTournamentId = await this.upsertManager.upsertTournament(
          tournamentValidation.data,
          'esportsamaze',
          slug,
          tourneyUrl
        );

        totalTournamentsProcessed++;

        // 2. Ingest Matches & Multi-Team Results
        for (const matchObj of matchesExtracted) {
          try {
            const sourceMatchId = matchObj.id;
            const mapName = matchObj.mapName || null;
            const formatStr = matchObj.format || null;
            const rawScheduledAt = matchObj.scheduledAt || null;
            const scheduledAt = rawScheduledAt ? rawScheduledAt.replace(/^\$D/, '') : null;

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
              await FailedRecordQueue.enqueue('esportsamaze', matchesUrl, sourceMatchId, matchValidation.reason || matchValidation.error, matchObj);
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
              matchesUrl
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
                  `https://esportsamaze.com/teams/${sourceTeamObj.slug || sourceTeamId}`
                );

                // Build match_teams record (Strict NULL semantics for missing fields)
                const matchTeamPayload = {
                  match_id: canonicalMatchId,
                  team_id: canonicalTeamId,
                  source_result_id: sourceTeamResultId,
                  placement: typeof tr.rank === 'number' ? tr.rank : null,
                  placement_points: typeof tr.placePoints === 'number' ? tr.placePoints : null,
                  elimination_points: typeof tr.elimsPoints === 'number' ? tr.elimsPoints : null,
                  num_points: (typeof tr.placePoints === 'number' && typeof tr.elimsPoints === 'number') 
                    ? (tr.placePoints + tr.elimsPoints + (tr.bonusPoints || 0)) 
                    : null,
                  wwcd: typeof tr.wwcd === 'boolean' ? tr.wwcd : null,
                  kills: null // Strictly NULL: kills per player/team not explicitly published separately
                };

                // Upsert into match_teams
                await this.upsertManager.upsertMatchTeam(matchTeamPayload);
                matchTeamResultsCount++;
                totalTeamResultsProcessed++;
              } catch (trErr) {
                IngestionLogger.error('ESportsAmazeEngine', `Error ingesting TeamResult: ${trErr.message}`);
                totalErrorsCount++;
              }
            }

            // Assert dynamic TeamResult count matching source payload length
            if (matchTeamResultsCount !== teamResults.length) {
              IngestionLogger.warn('ESportsAmazeEngine', `Match ${sourceMatchId} ingested ${matchTeamResultsCount} TeamResults vs ${teamResults.length} in payload.`);
            }

          } catch (mErr) {
            IngestionLogger.error('ESportsAmazeEngine', `Error ingesting match: ${mErr.message}`);
            totalErrorsCount++;
          }
        }

        // 3. Ingest Stage Standings
        const standingsUrl = `${tourneyUrl}/standings`;
        const standingsRes = await this.fetch(standingsUrl);
        const standingsHtml = standingsRes && standingsRes.ok ? standingsRes.data : null;
        if (standingsHtml) {

          const standingsRows = this.parseStandingsFromRSCPayload(standingsHtml);
          for (const sRow of standingsRows) {
            try {
              if (!sRow.teamId) continue;
              const canonicalTeamId = await this.upsertManager.upsertTeam(
                {
                  name: sRow.teamName || 'Unknown Team',
                  slug: sRow.teamSlug || `team-${sRow.teamId}`,
                  region: 'IN'
                },
                'esportsamaze',
                sRow.teamId,
                `https://esportsamaze.com/teams/${sRow.teamSlug || sRow.teamId}`
              );

              await this.upsertManager.upsertBGMIStageStandings({
                tournament_id: canonicalTournamentId,
                stage_name: sRow.stageName || 'Overall',
                team_id: canonicalTeamId,
                rank_position: sRow.rankPosition,
                matches_played: sRow.matchesPlayed,
                wwcd_count: sRow.wwcdCount,
                placement_pts: sRow.placementPts,
                elimination_pts: sRow.eliminationPts,
                total_pts: sRow.totalPts
              });

              totalStageStandingsProcessed++;
            } catch (sErr) {
              IngestionLogger.error('ESportsAmazeEngine', `Error ingesting stage standing row: ${sErr.message}`);
            }
          }
        }

      } catch (tErr) {
        IngestionLogger.error('ESportsAmazeEngine', `Error processing tournament ${tourneyUrl}: ${tErr.message}`);
        totalErrorsCount++;
      }
    }

    const durationSeconds = ((Date.now() - runStartTime) / 1000).toFixed(2);
    IngestionLogger.info('ESportsAmazeEngine', `Ingestion completed in ${durationSeconds}s. Tournaments: ${totalTournamentsProcessed}, Matches: ${totalMatchesProcessed}, TeamResults: ${totalTeamResultsProcessed}, Standings: ${totalStageStandingsProcessed}, Errors: ${totalErrorsCount}`);

    // Dispatch metrics summary to Discord
    await IngestionLogger.dispatchDiscordReport({
      source: 'eSportsAmaze (BGMI)',
      tournaments: totalTournamentsProcessed,
      matches: totalMatchesProcessed,
      teamResults: totalTeamResultsProcessed,
      standings: totalStageStandingsProcessed,
      errors: totalErrorsCount,
      duration: `${durationSeconds}s`
    });

    return {
      tournaments: totalTournamentsProcessed,
      matches: totalMatchesProcessed,
      teamResults: totalTeamResultsProcessed,
      standings: totalStageStandingsProcessed,
      errors: totalErrorsCount
    };
  }

  /**
   * Parses match definitions and nested teamResults from eSportsAmaze Next.js RSC HTML stream payload.
   */
  parseMatchesFromRSCPayload(html, sourceUrl) {
    const cleanHtml = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
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

      // Parse teamResults array
      const teamResults = [];
      const trMatches = teamResultsRaw.matchAll(/\{"id":"([^"]+)".*?"teamId":"([^"]+)".*?"rank":(\d+).*?"wwcd":(true|false).*?"placePoints":(\d+).*?"elimsPoints":(\d+)/g);
      
      for (const tr of trMatches) {
        teamResults.push({
          id: tr[1],
          teamId: tr[2],
          rank: parseInt(tr[3], 10),
          wwcd: tr[4] === 'true',
          placePoints: parseInt(tr[5], 10),
          elimsPoints: parseInt(tr[6], 10),
          bonusPoints: 0
        });
      }

      matches.push({
        id: matchId,
        mapName: mapName,
        format: formatMatch ? formatMatch[1] : null,
        scheduledAt: scheduledMatch ? scheduledMatch[1] : null,
        teamResults: teamResults
      });
    }

    return matches;
  }

  /**
   * Parses stage standings leaderboard rows from RSC stream payload.
   */
  parseStandingsFromRSCPayload(html) {
    const cleanHtml = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const rowsIter = cleanHtml.matchAll(/\{"id":"([^"]+)".*?"teamId":"([^"]+)".*?"rankPosition":(\d+).*?"totalPoints":(\d+)/g);
    
    const rows = [];
    for (const r of rowsIter) {
      rows.push({
        id: r[1],
        teamId: r[2],
        rankPosition: parseInt(r[3], 10),
        totalPts: parseInt(r[4], 10),
        stageName: 'Overall'
      });
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
