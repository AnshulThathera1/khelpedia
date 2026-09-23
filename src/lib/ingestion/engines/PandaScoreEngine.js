/**
 * KhelPediA Data Ingestion Engine — PandaScore API
 * Ingests tournaments, teams, and matches across CS2, Valorant, Dota 2, and LoL.
 * Implements complete pagination, exponential backoff retries, and idempotent source mapping.
 */

import { BaseFetcher } from '../BaseFetcher.js';
import { BasePaginator } from '../BasePaginator.js';
import { DataValidator } from '../DataValidator.js';
import { IngestionLogger } from '../IngestionLogger.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';
import { supabase } from '../../supabase.js';

const PANDASCORE_BASE_URL = 'https://api.pandascore.co';

export class PandaScoreEngine {
  constructor(apiKey = process.env.PANDASCORE_API_KEY) {
    this.apiKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : null;
    this.logger = new IngestionLogger('pandascore', 'SyncMatches');
    this.fetcher = new BaseFetcher({
      userAgent: 'KhelPediA-PandaScoreEngine/2.0',
      logger: this.logger
    });
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };
  }

  async run() {
    console.log("🚀 Starting PandaScore Ingestion Engine...");
    if (!this.apiKey) {
      console.warn("⚠️ PANDASCORE_API_KEY is not set. Skipping PandaScore ingestion.");
      this.logger.logRequest(false, false);
      this.logger.printReport();
      return;
    }

    // 1. Map database games
    const { data: games } = await supabase.from('games').select('id, slug');
    const gameMap = {};
    if (games) {
      games.forEach(g => {
        const slug = g.slug.replace('cs2', 'csgo');
        gameMap[slug] = g.id;
        gameMap[g.slug] = g.id;
      });
    }

    const supportedGames = ['valorant', 'csgo', 'dota-2', 'league-of-legends'];

    for (const gameSlug of supportedGames) {
      const dbGameId = gameMap[gameSlug];
      if (!dbGameId) continue;

      console.log(`\n--- Fetching PandaScore ${gameSlug.toUpperCase()} Matches ---`);

      // 2. Fetch matches using complete pagination
      const matches = await BasePaginator.paginatePandaScore({
        fetchFn: async (page, pageSize) => {
          const url = `${PANDASCORE_BASE_URL}/${gameSlug}/matches?page[number]=${page}&page[size]=${pageSize}&sort=-begin_at`;
          return await this.fetcher.fetch(url, { headers: this.getHeaders() });
        },
        pageSize: 100,
        maxPages: 10, // Fetch up to 1,000 matches per game
        logger: this.logger
      });

      console.log(`Processing ${matches.length} ${gameSlug} matches...`);

      for (const m of matches) {
        try {
          const sourceMatchId = m.id;
          const tourneyObj = m.tournament || {};
          const leagueObj = m.league || {};

          // Validate opponent count
          const opponents = m.opponents || [];
          if (opponents.length !== 2) {
            this.logger.logSkipped();
            continue; // Skip FFA or TBD non-binary team matches
          }

          // A. Upsert Tournament
          const tourneyName = `${leagueObj.name || ''} ${tourneyObj.name || ''}`.trim() || m.name || 'Unknown Tournament';
          const tourneySourceId = tourneyObj.id || m.id;

          const tourneyId = await IdempotentUpsert.upsertTournament({
            source: 'pandascore',
            source_tournament_id: tourneySourceId,
            name: tourneyName,
            game_id: dbGameId,
            region: tourneyObj.region || leagueObj.name || 'Global',
            status: m.status === 'finished' ? 'completed' : (m.status === 'running' ? 'live' : 'upcoming'),
            prize_pool: 0,
            tier: (tourneyObj.tier || 'b').toUpperCase(),
            start_date: tourneyObj.begin_at || m.begin_at,
            end_date: tourneyObj.end_at || m.end_at,
            logger: this.logger
          });

          if (!tourneyId) continue;

          // B. Upsert Teams
          const team1Obj = opponents[0]?.opponent || {};
          const team2Obj = opponents[1]?.opponent || {};

          const team1Id = await IdempotentUpsert.upsertTeam({
            source: 'pandascore',
            source_team_id: team1Obj.id,
            name: team1Obj.name,
            logo_url: team1Obj.image_url,
            logger: this.logger
          });

          const team2Id = await IdempotentUpsert.upsertTeam({
            source: 'pandascore',
            source_team_id: team2Obj.id,
            name: team2Obj.name,
            logo_url: team2Obj.image_url,
            logger: this.logger
          });

          if (!team1Id || !team2Id) continue;

          // Resolve scores & winner
          const results = m.results || [];
          const score1 = results[0]?.score || 0;
          const score2 = results[1]?.score || 0;
          let winnerId = null;
          if (m.winner_id === team1Obj.id) winnerId = team1Id;
          if (m.winner_id === team2Obj.id) winnerId = team2Id;

          // C. Validate Match object
          const matchPayload = {
            source_match_id: sourceMatchId,
            team1_name: team1Obj.name,
            team2_name: team2Obj.name,
            tournament_name: tourneyName,
            score1,
            score2,
            played_at: m.begin_at
          };

          const validation = DataValidator.validateMatch(matchPayload);
          if (!validation.valid) {
            this.logger.logValidationFailure();
            continue;
          }

          // D. Idempotent Match Upsert via entity_source_mapping
          await IdempotentUpsert.upsertMatch({
            source: 'pandascore',
            source_match_id: sourceMatchId,
            tournament_id: tourneyId,
            team1_id: team1Id,
            team2_id: team2Id,
            score1,
            score2,
            winner_id: winnerId,
            round: m.name || 'Group Stage',
            played_at: m.begin_at,
            raw_payload: m,
            logger: this.logger
          });

        } catch (err) {
          console.error(`Error processing PandaScore match ${m.id}:`, err.message);
        }
      }
    }

    await this.logger.printReport();
  }
}
