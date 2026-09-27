/**
 * KhelPediA Data Ingestion Engine — IdempotentUpsert
 * Performs idempotent, safe database insertions/updates using entity_source_mapping and PostgreSQL queries.
 */

import { query } from '../db.js';
import { FailedRecordQueue } from './FailedRecordQueue.js';

function generateSlug(name) {
  if (!name) return 'unknown';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export class IdempotentUpsert {
  /**
   * Find internal entity UUID by source and source_entity_id
   */
  static async findEntityBySource(source, source_entity_id, entity_type) {
    if (!source || !source_entity_id || !entity_type) return null;

    try {
      const res = await query(
        `SELECT internal_entity_id FROM entity_source_mapping WHERE source = $1 AND source_entity_id = $2 AND entity_type = $3`,
        [source, String(source_entity_id), entity_type]
      );
      return res.rows[0]?.internal_entity_id || null;
    } catch {
      return null;
    }
  }

  /**
   * Register or update entity_source_mapping record
   */
  static async upsertEntityMapping(source, source_entity_id, entity_type, internal_entity_id, metadata = {}, source_url = null) {
    try {
      await query(
        `INSERT INTO entity_source_mapping (source, source_entity_id, entity_type, internal_entity_id, source_url, metadata, last_synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (source, source_entity_id, entity_type) 
         DO UPDATE SET internal_entity_id = EXCLUDED.internal_entity_id, source_url = EXCLUDED.source_url, metadata = EXCLUDED.metadata, last_synced_at = NOW()`,
        [source, String(source_entity_id), entity_type, internal_entity_id, source_url, JSON.stringify(metadata)]
      );
    } catch (e) {
      console.error("💥 Exception in upsertEntityMapping:", e.message || e);
    }
  }

  /**
   * Idempotent Upsert for Teams
   */
  static async upsertTeam(teamData, source = null, source_team_id = null, source_url = null, logger = null) {
    const name = typeof teamData === 'string' ? teamData : teamData.name;
    const logo_url = teamData.logo_url || teamData.logoUrl || null;
    const region = teamData.region || 'IN';
    const country = teamData.country || null;
    
    if (!name) return null;

    const sourceIdStr = source_team_id ? String(source_team_id) : null;
    
    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'team');
      if (existingId) {
        if (logger) logger.logUpdated();
        return existingId;
      }
    }

    const slug = teamData.slug || generateSlug(name);

    const existing = await query(`SELECT id FROM teams WHERE slug = $1`, [slug]);
    let internalTeamId = existing.rows[0]?.id;

    if (!internalTeamId) {
      try {
        const inserted = await query(
          `INSERT INTO teams (name, slug, logo_url, region, country) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [name, slug, logo_url, region, country]
        );
        internalTeamId = inserted.rows[0]?.id;
        if (logger) logger.logInserted();
      } catch (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'teams', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
    } else {
      if (logger) logger.logDuplicate();
    }

    if (source && sourceIdStr && internalTeamId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'team', internalTeamId, { name, slug }, source_url);
    }

    return internalTeamId;
  }

  /**
   * Idempotent Upsert for Tournaments
   */
  static async upsertTournament(tourneyData, source = null, source_tournament_id = null, source_url = null, logger = null) {
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

    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'tournament');
      if (existingId) {
        await query(
          `UPDATE tournaments SET status = $1, prize_pool = $2, start_date = $3, end_date = $4 WHERE id = $5`,
          [status, prize_pool, start_date, end_date, existingId]
        );
        if (logger) logger.logUpdated();
        return existingId;
      }
    }

    const slug = tourneyData.slug || generateSlug(name);

    const existing = await query(`SELECT id FROM tournaments WHERE slug = $1`, [slug]);
    let internalTourneyId = existing.rows[0]?.id;

    if (!internalTourneyId) {
      try {
        const inserted = await query(
          `INSERT INTO tournaments (name, slug, game_id, region, status, prize_pool, tier, start_date, end_date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [name, slug, game_id, region, status, prize_pool, tier, start_date, end_date]
        );
        internalTourneyId = inserted.rows[0]?.id;
        if (logger) logger.logInserted();
      } catch (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'tournaments', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
    } else {
      await query(
        `UPDATE tournaments SET status = $1, prize_pool = $2, start_date = $3, end_date = $4 WHERE id = $5`,
        [status, prize_pool, start_date, end_date, internalTourneyId]
      );
      if (logger) logger.logUpdated();
    }

    if (source && sourceIdStr && internalTourneyId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'tournament', internalTourneyId, { name, slug }, source_url);
    }

    return internalTourneyId;
  }

  /**
   * Idempotent Upsert for Matches
   */
  static async upsertMatch(matchData, source = null, source_match_id = null, source_url = null, logger = null) {
    const tournament_id = matchData.tournament_id || matchData.tournamentId;
    const team1_id = matchData.team1_id || matchData.team1Id || null;
    const team2_id = matchData.team2_id || matchData.team2Id || null;
    const score1 = matchData.score1 || 0;
    const score2 = matchData.score2 || 0;
    const winner_id = matchData.winner_id || matchData.winnerId || null;
    const round = matchData.round || 'Group Stage';
    const map = matchData.map || null;
    const played_at = matchData.played_at || matchData.playedAt || null;
    const raw_payload = matchData.raw_payload || matchData;

    source = source || matchData.source || null;
    const finalSourceMatchId = source_match_id || matchData.source_match_id || null;
    source_url = source_url || matchData.source_url || null;

    const sourceIdStr = finalSourceMatchId ? String(finalSourceMatchId) : null;

    if (source && sourceIdStr) {
      const existingMatchId = await this.findEntityBySource(source, sourceIdStr, 'match');
      if (existingMatchId) {
        await query(
          `UPDATE matches SET score1 = $1, score2 = $2, winner_id = $3, round = $4, map = $5, played_at = $6 WHERE id = $7`,
          [score1, score2, winner_id, round, map, played_at ? new Date(played_at).toISOString() : null, existingMatchId]
        );
        if (logger) logger.logUpdated();
        return existingMatchId;
      }
    }

    if (!sourceIdStr) {
      if (logger) logger.logSkipped();
      return await FailedRecordQueue.pushProvisionalMatch({
        source,
        raw_identifier: null,
        tournament_name: null,
        score1,
        score2,
        round,
        scheduled_at: played_at,
        payload: raw_payload
      });
    }

    try {
      const newMatch = await query(
        `INSERT INTO matches (tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map, played_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map,
          played_at ? new Date(played_at).toISOString() : null
        ]
      );

      const internalMatchId = newMatch.rows[0]?.id;
      if (logger) logger.logInserted();

      if (source && sourceIdStr && internalMatchId) {
        await this.upsertEntityMapping(source, sourceIdStr, 'match', internalMatchId, { tournament_id, team1_id, team2_id }, source_url);
      }

      return internalMatchId;
    } catch (error) {
      if (logger) logger.logValidationFailure();
      await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'matches', source_entity_id: sourceIdStr, error, payload: raw_payload });
      return null;
    }
  }

  /**
   * Upsert for Match Teams (BGMI multi-team results with result provenance)
   */
  static async upsertMatchTeam(matchTeamData) {
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
      const res = await query(
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
        [match_id, team_id, source_result_id, placement, placement_points, elimination_points, num_points, wwcd, kills, won]
      );
      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert match_teams:", error.message);
      return null;
    }
  }


  /**
   * Upsert BGMI Stage Standings
   */
  static async upsertBGMIStageStandings(standingsData) {
    const {
      tournament_id,
      stage_name = 'Overall',
      team_id,
      rank_position,
      matches_played = null,
      wwcd_count = null,
      placement_pts = null,
      elimination_pts = null,
      total_pts = null
    } = standingsData;

    if (!tournament_id || !team_id) return null;

    try {
      const res = await query(
        `INSERT INTO bgmi_stage_standings (tournament_id, stage_name, team_id, rank_position, matches_played, wwcd_count, placement_pts, elimination_pts, total_pts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tournament_id, stage_name, team_id)
         DO UPDATE SET rank_position = EXCLUDED.rank_position,
                       matches_played = EXCLUDED.matches_played,
                       wwcd_count = EXCLUDED.wwcd_count,
                       placement_pts = EXCLUDED.placement_pts,
                       elimination_pts = EXCLUDED.elimination_pts,
                       total_pts = EXCLUDED.total_pts
         RETURNING *`,
        [tournament_id, stage_name, team_id, rank_position, matches_played, wwcd_count, placement_pts, elimination_pts, total_pts]
      );
      return res.rows[0];
    } catch (error) {
      console.error("⚠️ Failed to upsert bgmi_stage_standings:", error.message);
      return null;
    }
  }

  // Instance wrappers for engine instances
  async upsertTeam(teamData, source, sourceId, sourceUrl, logger) {
    return IdempotentUpsert.upsertTeam(teamData, source, sourceId, sourceUrl, logger);
  }

  async upsertTournament(tourneyData, source, sourceId, sourceUrl, logger) {
    return IdempotentUpsert.upsertTournament(tourneyData, source, sourceId, sourceUrl, logger);
  }

  async upsertMatch(matchData, source, sourceId, sourceUrl, logger) {
    return IdempotentUpsert.upsertMatch(matchData, source, sourceId, sourceUrl, logger);
  }

  async upsertMatchTeam(matchTeamData) {
    return IdempotentUpsert.upsertMatchTeam(matchTeamData);
  }

  async upsertBGMIStageStandings(standingsData) {
    return IdempotentUpsert.upsertBGMIStageStandings(standingsData);
  }
}

export default IdempotentUpsert;
