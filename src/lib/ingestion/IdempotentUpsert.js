/**
 * KhelPediA Data Ingestion Engine — IdempotentUpsert
 * Performs idempotent, safe database insertions/updates using entity_source_mapping,
 * batch tracker provenance, and PostgreSQL queries.
 */

import { query } from '../db.js';
import { FailedRecordQueue } from './FailedRecordQueue.js';

function generateSlug(name) {
  if (!name) return 'unknown';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export class IdempotentUpsert {
  static customQueryFn = null;
  static setQueryFn(fn) {
    this.customQueryFn = fn;
  }

  static async executeQuery(text, params, batchTracker = null) {
    if (batchTracker && typeof batchTracker.queryFn === 'function') {
      return batchTracker.queryFn(text, params);
    }
    if (this.customQueryFn) {
      return this.customQueryFn(text, params);
    }
    return query(text, params);
  }

  /**
   * Find internal entity UUID by source and source_entity_id
   */
  static async findEntityBySource(source, source_entity_id, entity_type, batchTracker = null) {
    if (!source || !source_entity_id || !entity_type) return null;

    try {
      const res = await this.executeQuery(
        `SELECT internal_entity_id FROM entity_source_mapping WHERE source = $1 AND source_entity_id = $2 AND entity_type = $3`,
        [source, String(source_entity_id), entity_type],
        batchTracker
      );
      return res.rows[0]?.internal_entity_id || null;
    } catch {
      return null;
    }
  }

  /**
   * Register or update entity_source_mapping record with batch provenance
   */
  static async upsertEntityMapping(source, source_entity_id, entity_type, internal_entity_id, metadata = {}, source_url = null, batchTracker = null) {
    try {
      const meta = {
        ...metadata,
        import_batch_id: batchTracker?.getBatchId() || metadata.import_batch_id || null
      };

      const res = await this.executeQuery(
        `INSERT INTO entity_source_mapping (source, source_entity_id, entity_type, internal_entity_id, source_url, metadata, last_synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (source, source_entity_id, entity_type) 
         DO UPDATE SET internal_entity_id = EXCLUDED.internal_entity_id, source_url = EXCLUDED.source_url, metadata = EXCLUDED.metadata, last_synced_at = NOW()
         RETURNING id`,
        [source, String(source_entity_id), entity_type, internal_entity_id, source_url, JSON.stringify(meta)],
        batchTracker
      );

      if (batchTracker && res.rows[0]?.id) {
        batchTracker.recordSourceMapping(res.rows[0].id, entity_type, internal_entity_id, String(source_entity_id));
      }
    } catch (e) {
      console.error("💥 Exception in upsertEntityMapping:", e.message || e);
    }
  }

  /**
   * Idempotent Upsert for Teams
   */
  static async upsertTeam(teamData, source = null, source_team_id = null, source_url = null, logger = null, batchTracker = null) {
    const name = typeof teamData === 'string' ? teamData : teamData.name;
    const logo_url = teamData.logo_url || teamData.logoUrl || null;
    const region = teamData.region || 'IN';
    const country = teamData.country || null;
    
    if (!name) return null;

    const sourceIdStr = source_team_id ? String(source_team_id) : null;
    
    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'team', batchTracker);
      if (existingId) {
        if (logger) logger.logUpdated();
        if (batchTracker) batchTracker.recordLinkedEntity('teams', existingId, sourceIdStr);
        return existingId;
      }
    }

    const slug = teamData.slug || generateSlug(name);

    const existing = await this.executeQuery(`SELECT id FROM teams WHERE slug = $1`, [slug], batchTracker);
    let internalTeamId = existing.rows[0]?.id;
    let isNewEntity = false;

    if (!internalTeamId) {
      try {
        const inserted = await this.executeQuery(
          `INSERT INTO teams (name, slug, logo_url, region, country) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [name, slug, logo_url, region, country],
          batchTracker
        );
        internalTeamId = inserted.rows[0]?.id;
        isNewEntity = true;
        if (logger) logger.logInserted();
        if (batchTracker) batchTracker.recordCreatedEntity('teams', internalTeamId);
      } catch (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'teams', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
    } else {
      if (logger) logger.logDuplicate();
      if (batchTracker) batchTracker.recordLinkedEntity('teams', internalTeamId, sourceIdStr);
    }

    if (source && sourceIdStr && internalTeamId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'team', internalTeamId, { name, slug, is_new_canonical: isNewEntity }, source_url, batchTracker);
    }

    return internalTeamId;
  }

  /**
   * Idempotent Upsert for Players
   */
  static async upsertPlayer(playerData, source = null, source_player_id = null, team_id = null, source_url = null, logger = null, batchTracker = null) {
    const name = typeof playerData === 'string' ? playerData : playerData.name || playerData.ign;
    const ign = playerData.ign || name;
    if (!name && !ign) return null;

    const sourceIdStr = source_player_id ? String(source_player_id) : null;
    const slug = playerData.slug || generateSlug(ign || name);

    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'player', batchTracker);
      if (existingId) {
        if (logger) logger.logUpdated();
        if (batchTracker) batchTracker.recordLinkedEntity('players', existingId, sourceIdStr);
        return existingId;
      }
    }

    const existingBySlug = await this.executeQuery(`SELECT id FROM players WHERE slug = $1`, [slug], batchTracker);
    let internalPlayerId = existingBySlug.rows[0]?.id;
    let isNewEntity = false;

    if (!internalPlayerId) {
      try {
        const inserted = await this.executeQuery(
          `INSERT INTO players (name, ign, slug, team_id, country, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [name || ign, ign, slug, team_id || null, playerData.country || 'India', playerData.role || 'Player'],
          batchTracker
        );
        internalPlayerId = inserted.rows[0]?.id;
        isNewEntity = true;
        if (logger) logger.logInserted();
        if (batchTracker) batchTracker.recordCreatedEntity('players', internalPlayerId);
      } catch (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'players', source_entity_id: sourceIdStr, error, payload: { name, ign, slug } });
        return null;
      }
    } else {
      if (logger) logger.logDuplicate();
      if (batchTracker) batchTracker.recordLinkedEntity('players', internalPlayerId, sourceIdStr);
    }

    if (source && sourceIdStr && internalPlayerId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'player', internalPlayerId, { name, ign, slug, is_new_canonical: isNewEntity }, source_url, batchTracker);
    }

    return internalPlayerId;
  }

  /**
   * Idempotent Upsert for Tournaments
   */
  static async upsertTournament(tourneyData, source = null, source_tournament_id = null, source_url = null, logger = null, batchTracker = null) {
    const name = typeof tourneyData === 'string' ? tourneyData : tourneyData.name;
    const game_id = tourneyData.game_id || tourneyData.gameId || null;
    const region = tourneyData.region || 'Global';
    const status = tourneyData.status || 'upcoming';
    const prize_pool = tourneyData.prize_pool || tourneyData.prizePool || 0;
    const tier = tourneyData.tier || 'A';
    const start_date = tourneyData.start_date || tourneyData.startDate || null;
    const end_date = tourneyData.end_date || tourneyData.endDate || null;
    
    if (!name) return null;

    const sourceIdStr = source_tournament_id ? String(source_tournament_id) : null;
    const slug = tourneyData.slug || generateSlug(name);

    const existingBySlug = await this.executeQuery(`SELECT id, status, prize_pool, start_date, end_date FROM tournaments WHERE slug = $1`, [slug], batchTracker);
    let existingRow = existingBySlug.rows[0];
    let internalTourneyId = existingRow?.id;

    if (source && sourceIdStr && !internalTourneyId) {
      const mappedId = await this.findEntityBySource(source, sourceIdStr, 'tournament', batchTracker);
      if (mappedId) {
        const mappedRes = await this.executeQuery(`SELECT id, status, prize_pool, start_date, end_date FROM tournaments WHERE id = $1`, [mappedId], batchTracker);
        existingRow = mappedRes.rows[0];
        internalTourneyId = mappedId;
      }
    }

    let isNewEntity = false;

    if (!internalTourneyId) {
      try {
        const inserted = await this.executeQuery(
          `INSERT INTO tournaments (name, slug, game_id, region, status, prize_pool, tier, start_date, end_date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [name, slug, game_id, region, status, prize_pool, tier, start_date, end_date],
          batchTracker
        );
        internalTourneyId = inserted.rows[0]?.id;
        isNewEntity = true;
        if (logger) logger.logInserted();
        if (batchTracker) batchTracker.recordCreatedEntity('tournaments', internalTourneyId);
      } catch (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'tournaments', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
    } else {
      // Record pre-update snapshot before updating
      if (batchTracker && existingRow) {
        batchTracker.recordUpdatedEntity('tournaments', internalTourneyId, {
          status: existingRow.status,
          prize_pool: existingRow.prize_pool,
          start_date: existingRow.start_date,
          end_date: existingRow.end_date
        });
        batchTracker.recordLinkedEntity('tournaments', internalTourneyId, sourceIdStr);
      }

      await this.executeQuery(
        `UPDATE tournaments SET status = $1, prize_pool = $2, start_date = $3, end_date = $4 WHERE id = $5`,
        [status, prize_pool, start_date, end_date, internalTourneyId],
        batchTracker
      );
      if (logger) logger.logUpdated();
    }

    if (source && sourceIdStr && internalTourneyId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'tournament', internalTourneyId, { name, slug, is_new_canonical: isNewEntity }, source_url, batchTracker);
    }

    return internalTourneyId;
  }

  /**
   * Idempotent Upsert for Matches
   */
  static async upsertMatch(matchData, source = null, source_match_id = null, source_url = null, logger = null, batchTracker = null) {
    const tournament_id = matchData.tournament_id || matchData.tournamentId;
    const team1_id = matchData.team1_id || matchData.team1Id || null;
    const team2_id = matchData.team2_id || matchData.team2Id || null;
    const score1 = matchData.score1 || 0;
    const score2 = matchData.score2 || 0;
    const winner_id = matchData.winner_id || matchData.winnerId || null;
    const round = matchData.round || 'Group Stage';
    const map = matchData.map || null;
    const played_at = matchData.played_at || matchData.playedAt || null;

    source = source || matchData.source || null;
    const finalSourceMatchId = source_match_id || matchData.source_match_id || null;
    source_url = source_url || matchData.source_url || null;

    if (!tournament_id) return null;

    const sourceIdStr = finalSourceMatchId ? String(finalSourceMatchId) : null;

    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'match', batchTracker);
      if (existingId) {
        if (logger) logger.logUpdated();
        if (batchTracker) batchTracker.recordLinkedEntity('matches', existingId, sourceIdStr);
        return existingId;
      }
    }

    try {
      const inserted = await this.executeQuery(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map, played_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map, played_at],
        batchTracker
      );
      const internalMatchId = inserted.rows[0]?.id;
      if (logger) logger.logInserted();
      if (batchTracker) batchTracker.recordCreatedEntity('matches', internalMatchId);

      if (source && sourceIdStr && internalMatchId) {
        await this.upsertEntityMapping(source, sourceIdStr, 'match', internalMatchId, { round, map }, source_url, batchTracker);
      }

      return internalMatchId;
    } catch (error) {
      if (logger) logger.logValidationFailure();
      await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'matches', source_entity_id: sourceIdStr, error, payload: matchData });
      return null;
    }
  }

  /**
   * Upsert Match Team Multi-Team Battle Royale Result
   */
  static async upsertMatchTeam(matchTeamData, batchTracker = null) {
    const {
      match_id,
      team_id,
      source_result_id = null,
      placement = null,
      placement_points = null,
      elimination_points = null,
      num_points = null,
      wwcd = null,
      kills = null
    } = matchTeamData;

    if (!match_id || !team_id) return null;

    const won = typeof matchTeamData.won === 'boolean'
      ? matchTeamData.won
      : (wwcd === true ? true : false);

    try {
      const res = await this.executeQuery(
        `INSERT INTO match_teams (match_id, team_id, source_result_id, placement, placement_points, elimination_points, num_points, wwcd, kills, won)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (match_id, team_id)
         DO UPDATE SET source_result_id = EXCLUDED.source_result_id,
                       placement = EXCLUDED.placement,
                       placement_points = EXCLUDED.placement_points,
                       elimination_points = EXCLUDED.elimination_points,
                       num_points = EXCLUDED.num_points,
                       wwcd = EXCLUDED.wwcd,
                       kills = EXCLUDED.kills,
                       won = EXCLUDED.won
         RETURNING *`,
        [match_id, team_id, source_result_id, placement, placement_points, elimination_points, num_points, wwcd, kills, won],
        batchTracker
      );

      if (batchTracker) {
        batchTracker.recordCreatedDependent('match_teams', match_id);
      }

      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert match_teams:", error.message);
      return null;
    }
  }

  /**
   * Upsert BGMI Stage Standings with bonus points and tiebreaker support
   */
  static async upsertBGMIStageStandings(standingsData, batchTracker = null) {
    const {
      tournament_id,
      stage_name = 'Overall',
      team_id,
      rank_position,
      matches_played = null,
      wwcd_count = null,
      placement_pts = null,
      elimination_pts = null,
      total_pts = null,
      bonus_pts = null,
      tiebreaker_rule = null,
      tiebreaker_note = null,
      source_attribution_url = null
    } = standingsData;

    if (!tournament_id || !team_id) return null;

    try {
      const res = await this.executeQuery(
        `INSERT INTO bgmi_stage_standings (
           tournament_id, stage_name, team_id, rank_position, matches_played, 
           wwcd_count, placement_pts, elimination_pts, total_pts, bonus_pts, 
           tiebreaker_rule, tiebreaker_note, source_attribution_url
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (tournament_id, stage_name, team_id)
         DO UPDATE SET rank_position = EXCLUDED.rank_position,
                       matches_played = EXCLUDED.matches_played,
                       wwcd_count = EXCLUDED.wwcd_count,
                       placement_pts = EXCLUDED.placement_pts,
                       elimination_pts = EXCLUDED.elimination_pts,
                       total_pts = EXCLUDED.total_pts,
                       bonus_pts = EXCLUDED.bonus_pts,
                       tiebreaker_rule = EXCLUDED.tiebreaker_rule,
                       tiebreaker_note = EXCLUDED.tiebreaker_note,
                       source_attribution_url = EXCLUDED.source_attribution_url
         RETURNING *`,
        [tournament_id, stage_name, team_id, rank_position, matches_played, wwcd_count, placement_pts, elimination_pts, total_pts, bonus_pts, tiebreaker_rule, tiebreaker_note, source_attribution_url],
        batchTracker
      );

      if (batchTracker && res.rows[0]?.id) {
        batchTracker.recordCreatedDependent('bgmi_stage_standings', res.rows[0].id);
      }

      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert bgmi_stage_standings:", error.message);
      return null;
    }
  }

  /**
   * Upsert Match-Level Player Stats (Scorecards)
   */
  static async upsertMatchPlayerStats(statData, batchTracker = null) {
    const {
      match_id,
      player_id,
      team_id = null,
      kills = null,
      damage = null,
      assists = null,
      survival_time_sec = null,
      source_stat_id = null
    } = statData;

    if (!match_id || !player_id) return null;

    try {
      const res = await this.executeQuery(
        `INSERT INTO match_player_stats (match_id, player_id, team_id, kills, damage, assists, survival_time_sec, source_stat_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (match_id, player_id)
         DO UPDATE SET team_id = EXCLUDED.team_id,
                       kills = EXCLUDED.kills,
                       damage = EXCLUDED.damage,
                       assists = EXCLUDED.assists,
                       survival_time_sec = EXCLUDED.survival_time_sec,
                       source_stat_id = EXCLUDED.source_stat_id
         RETURNING *`,
        [match_id, player_id, team_id, kills, damage, assists, survival_time_sec, source_stat_id],
        batchTracker
      );

      if (batchTracker && res.rows[0]?.id) {
        batchTracker.recordCreatedDependent('match_player_stats', res.rows[0].id);
      }

      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert match_player_stats:", error.message);
      return null;
    }
  }

  /**
   * Upsert Tournament-Level Player Stats (Aggregates)
   */
  static async upsertTournamentPlayerStats(statData, batchTracker = null) {
    const {
      tournament_id,
      stage_name = 'Overall',
      player_id,
      team_id = null,
      matches_played = null,
      total_kills = null,
      total_damage = null,
      mvp_count = 0,
      is_derived = false
    } = statData;

    if (!tournament_id || !player_id) return null;

    try {
      const res = await this.executeQuery(
        `INSERT INTO tournament_player_stats (tournament_id, stage_name, player_id, team_id, matches_played, total_kills, total_damage, mvp_count, is_derived)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tournament_id, stage_name, player_id)
         DO UPDATE SET team_id = EXCLUDED.team_id,
                       matches_played = EXCLUDED.matches_played,
                       total_kills = EXCLUDED.total_kills,
                       total_damage = EXCLUDED.total_damage,
                       mvp_count = EXCLUDED.mvp_count,
                       is_derived = EXCLUDED.is_derived
         RETURNING *`,
        [tournament_id, stage_name, player_id, team_id, matches_played, total_kills, total_damage, mvp_count, is_derived],
        batchTracker
      );

      if (batchTracker && res.rows[0]?.id) {
        batchTracker.recordCreatedDependent('tournament_player_stats', res.rows[0].id);
      }

      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert tournament_player_stats:", error.message);
      return null;
    }
  }

  /**
   * Record Quarantine Identity for ambiguous matches
   */
  static async upsertQuarantineIdentity(quarantineData, batchTracker = null) {
    const {
      source,
      source_entity_id,
      entity_type,
      external_name,
      candidate_internal_id = null,
      conflict_code,
      conflict_reason,
      payload = {}
    } = quarantineData;

    const enrichedPayload = {
      ...payload,
      batch_id: batchTracker?.getBatchId() || null
    };

    try {
      const res = await this.executeQuery(
        `INSERT INTO quarantine_identities (source, source_entity_id, entity_type, external_name, candidate_internal_id, conflict_code, conflict_reason, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [source, String(source_entity_id), entity_type, external_name, candidate_internal_id, conflict_code, conflict_reason, JSON.stringify(enrichedPayload)],
        batchTracker
      );

      if (batchTracker && res.rows[0]?.id) {
        batchTracker.recordQuarantine(res.rows[0].id, conflict_code, enrichedPayload);
      }

      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to insert quarantine_identity:", error.message);
      return null;
    }
  }

  // Instance wrappers for engine instances
  async upsertTeam(teamData, source, sourceId, sourceUrl, logger, batchTracker) {
    return IdempotentUpsert.upsertTeam(teamData, source, sourceId, sourceUrl, logger, batchTracker);
  }

  async upsertPlayer(playerData, source, sourceId, teamId, sourceUrl, logger, batchTracker) {
    return IdempotentUpsert.upsertPlayer(playerData, source, sourceId, teamId, sourceUrl, logger, batchTracker);
  }

  async upsertTournament(tourneyData, source, sourceId, sourceUrl, logger, batchTracker) {
    return IdempotentUpsert.upsertTournament(tourneyData, source, sourceId, sourceUrl, logger, batchTracker);
  }

  async upsertMatch(matchData, source, sourceId, sourceUrl, logger, batchTracker) {
    return IdempotentUpsert.upsertMatch(matchData, source, sourceId, sourceUrl, logger, batchTracker);
  }

  async upsertMatchTeam(matchTeamData, batchTracker) {
    return IdempotentUpsert.upsertMatchTeam(matchTeamData, batchTracker);
  }

  async upsertBGMIStageStandings(standingsData, batchTracker) {
    return IdempotentUpsert.upsertBGMIStageStandings(standingsData, batchTracker);
  }

  async upsertMatchPlayerStats(statData, batchTracker) {
    return IdempotentUpsert.upsertMatchPlayerStats(statData, batchTracker);
  }

  async upsertTournamentPlayerStats(statData, batchTracker) {
    return IdempotentUpsert.upsertTournamentPlayerStats(statData, batchTracker);
  }

  async upsertQuarantineIdentity(quarantineData, batchTracker) {
    return IdempotentUpsert.upsertQuarantineIdentity(quarantineData, batchTracker);
  }
}

export default IdempotentUpsert;
