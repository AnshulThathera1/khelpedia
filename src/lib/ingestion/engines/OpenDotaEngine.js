/**
 * KhelPediA Data Ingestion Engine — OpenDota API
 * Ingests official Dota 2 pro matches using OpenDota cursor pagination.
 */

import { BaseFetcher } from '../BaseFetcher.js';
import { BasePaginator } from '../BasePaginator.js';
import { DataValidator } from '../DataValidator.js';
import { IngestionLogger } from '../IngestionLogger.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';
import { supabase } from '../../supabase.js';

const OPENDOTA_BASE_URL = 'https://api.opendota.com/api';

export class OpenDotaEngine {
  constructor() {
    this.logger = new IngestionLogger('opendota', 'SyncDota2Matches');
    this.fetcher = new BaseFetcher({
      userAgent: 'KhelPediA-OpenDotaEngine/2.0',
      logger: this.logger
    });
  }

  async run() {
    console.log("🚀 Starting OpenDota Ingestion Engine...");

    // 1. Get Dota 2 Game ID from DB
    const { data: gameData } = await supabase.from('games').select('id').eq('slug', 'dota-2').maybeSingle();
    if (!gameData) {
      console.warn("⚠️ Dota 2 game record not found in database.");
      return;
    }
    const dotaGameId = gameData.id;

    // 2. Fetch pro matches using cursor pagination (less_than_match_id)
    const matches = await BasePaginator.paginateOpenDota({
      fetchFn: async (lessThanMatchId) => {
        let url = `${OPENDOTA_BASE_URL}/proMatches`;
        if (lessThanMatchId) {
          url += `?less_than_match_id=${lessThanMatchId}`;
        }
        return await this.fetcher.fetch(url);
      },
      maxBatches: 5, // Fetch up to 500 pro matches
      logger: this.logger
    });

    console.log(`Processing ${matches.length} OpenDota pro matches...`);

    for (const m of matches) {
      try {
        const sourceMatchId = m.match_id;
        const team1Name = m.radiant_name || 'Radiant TBD';
        const team2Name = m.dire_name || 'Dire TBD';
        const tournamentName = m.league_name || 'Dota 2 Pro Circuit';

        if (team1Name === 'Radiant TBD' && team2Name === 'Dire TBD') {
          this.logger.logSkipped();
          continue;
        }

        // A. Upsert Tournament
        const tourneyId = await IdempotentUpsert.upsertTournament({
          source: 'opendota',
          source_tournament_id: m.leagueid || m.match_id,
          name: tournamentName,
          game_id: dotaGameId,
          region: 'Global',
          status: 'completed',
          tier: 'A',
          start_date: m.start_time ? new Date(m.start_time * 1000).toISOString() : null,
          logger: this.logger
        });

        if (!tourneyId) continue;

        // B. Upsert Teams
        const team1Id = await IdempotentUpsert.upsertTeam({
          source: 'opendota',
          source_team_id: m.radiant_team_id || team1Name,
          name: team1Name,
          logger: this.logger
        });

        const team2Id = await IdempotentUpsert.upsertTeam({
          source: 'opendota',
          source_team_id: m.dire_team_id || team2Name,
          name: team2Name,
          logger: this.logger
        });

        if (!team1Id || !team2Id) continue;

        // Determine scores & winner
        const score1 = m.radiant_score || 0;
        const score2 = m.dire_score || 0;
        const winnerId = m.radiant_win ? team1Id : team2Id;
        const playedAt = m.start_time ? new Date(m.start_time * 1000).toISOString() : null;

        // C. Validate Match Payload
        const matchPayload = {
          source_match_id: sourceMatchId,
          team1_name: team1Name,
          team2_name: team2Name,
          tournament_name: tournamentName,
          score1,
          score2,
          played_at: playedAt
        };

        const validation = DataValidator.validateMatch(matchPayload);
        if (!validation.valid) {
          this.logger.logValidationFailure();
          continue;
        }

        // D. Idempotent Upsert Match
        await IdempotentUpsert.upsertMatch({
          source: 'opendota',
          source_match_id: sourceMatchId,
          tournament_id: tourneyId,
          team1_id: team1Id,
          team2_id: team2Id,
          score1,
          score2,
          winner_id: winnerId,
          round: 'Pro Match',
          played_at: playedAt,
          raw_payload: m,
          logger: this.logger
        });

      } catch (err) {
        console.error(`Error processing OpenDota match ${m.match_id}:`, err.message);
      }
    }

    await this.logger.printReport();
  }
}
