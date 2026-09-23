/**
 * KhelPediA Data Ingestion Engine — IdempotentUpsert
 * Performs idempotent, safe database insertions/updates using entity_source_mapping.
 */

import { supabase } from '../supabase.js';
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
      const { data, error } = await supabase
        .from('entity_source_mapping')
        .select('internal_entity_id')
        .eq('source', source)
        .eq('source_entity_id', String(source_entity_id))
        .eq('entity_type', entity_type)
        .maybeSingle();

      if (error || !data) return null;
      return data.internal_entity_id;
    } catch {
      return null;
    }
  }

  /**
   * Register or update entity_source_mapping record
   */
  static async upsertEntityMapping(source, source_entity_id, entity_type, internal_entity_id, metadata = {}, source_url = null) {
    try {
      const payload = {
        source,
        source_entity_id: String(source_entity_id),
        entity_type,
        internal_entity_id,
        source_url,
        metadata,
        last_synced_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('entity_source_mapping')
        .upsert(payload, { onConflict: 'source,source_entity_id,entity_type' });

      if (error) {
        console.error("⚠️ Failed to upsert entity_source_mapping:", error.message);
      }
    } catch (e) {
      console.error("💥 Exception in upsertEntityMapping:", e.message || e);
    }
  }

  /**
   * Idempotent Upsert for Teams
   */
  static async upsertTeam({ source, source_team_id, name, logo_url = null, region = 'Global', country = null, logger = null }) {
    if (!name) return null;

    const sourceIdStr = source_team_id ? String(source_team_id) : null;
    
    // 1. Check existing source mapping
    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'team');
      if (existingId) {
        if (logger) logger.logUpdated();
        return existingId;
      }
    }

    const slug = generateSlug(name);

    // 2. Check existing team by slug
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    let internalTeamId = existingTeam?.id;

    if (!internalTeamId) {
      // Create new team
      const { data: newTeam, error } = await supabase
        .from('teams')
        .insert([{ name, slug, logo_url, region, country }])
        .select('id')
        .single();

      if (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'teams', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
      internalTeamId = newTeam.id;
      if (logger) logger.logInserted();
    } else {
      if (logger) logger.logDuplicate();
    }

    // 3. Register source mapping
    if (source && sourceIdStr && internalTeamId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'team', internalTeamId, { name, slug });
    }

    return internalTeamId;
  }

  /**
   * Idempotent Upsert for Tournaments
   */
  static async upsertTournament({ source, source_tournament_id, name, game_id, region = 'Global', status = 'upcoming', prize_pool = 0, tier = 'A', start_date = null, end_date = null, logger = null }) {
    if (!name) return null;

    const sourceIdStr = source_tournament_id ? String(source_tournament_id) : null;

    // 1. Check existing source mapping
    if (source && sourceIdStr) {
      const existingId = await this.findEntityBySource(source, sourceIdStr, 'tournament');
      if (existingId) {
        // Update status and dates
        await supabase
          .from('tournaments')
          .update({ status, prize_pool, start_date, end_date })
          .eq('id', existingId);
        
        if (logger) logger.logUpdated();
        return existingId;
      }
    }

    const slug = generateSlug(name);

    // 2. Check existing tournament by slug
    const { data: existingTourney } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    let internalTourneyId = existingTourney?.id;

    if (!internalTourneyId) {
      // Create new tournament
      const { data: newTourney, error } = await supabase
        .from('tournaments')
        .insert([{ name, slug, game_id, region, status, prize_pool, tier, start_date, end_date }])
        .select('id')
        .single();

      if (error) {
        if (logger) logger.logValidationFailure();
        await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'tournaments', source_entity_id: sourceIdStr, error, payload: { name, slug } });
        return null;
      }
      internalTourneyId = newTourney.id;
      if (logger) logger.logInserted();
    } else {
      // Update existing tournament metadata
      await supabase
        .from('tournaments')
        .update({ status, prize_pool, start_date, end_date })
        .eq('id', internalTourneyId);

      if (logger) logger.logUpdated();
    }

    // 3. Register source mapping
    if (source && sourceIdStr && internalTourneyId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'tournament', internalTourneyId, { name, slug });
    }

    return internalTourneyId;
  }

  /**
   * Idempotent Upsert for Matches
   */
  static async upsertMatch({ source, source_match_id, tournament_id, team1_id, team2_id, score1 = 0, score2 = 0, winner_id = null, round = 'Group Stage', map = null, played_at = null, raw_payload = {}, logger = null }) {
    const sourceIdStr = source_match_id ? String(source_match_id) : null;

    // 1. If source_match_id exists, check entity_source_mapping
    if (source && sourceIdStr) {
      const existingMatchId = await this.findEntityBySource(source, sourceIdStr, 'match');
      if (existingMatchId) {
        // Update existing match details
        await supabase
          .from('matches')
          .update({ score1, score2, winner_id, round, map, played_at })
          .eq('id', existingMatchId);

        if (logger) logger.logUpdated();
        return existingMatchId;
      }
    }

    // 2. If no source_match_id, route to provisional_matches queue rather than inserting unverified matches
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

    // 3. Create new canonical match record
    const { data: newMatch, error } = await supabase
      .from('matches')
      .insert([{
        tournament_id,
        team1_id,
        team2_id,
        score1,
        score2,
        winner_id,
        round,
        map,
        played_at: played_at ? new Date(played_at).toISOString() : null
      }])
      .select('id')
      .single();

    if (error) {
      if (logger) logger.logValidationFailure();
      await FailedRecordQueue.pushFailedRecord({ source, endpoint: 'matches', source_entity_id: sourceIdStr, error, payload: raw_payload });
      return null;
    }

    const internalMatchId = newMatch.id;
    if (logger) logger.logInserted();

    // 4. Register entity_source_mapping
    if (source && sourceIdStr && internalMatchId) {
      await this.upsertEntityMapping(source, sourceIdStr, 'match', internalMatchId, { tournament_id, team1_id, team2_id });
    }

    return internalMatchId;
  }
}
