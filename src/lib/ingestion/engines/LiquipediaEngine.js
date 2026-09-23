/**
 * KhelPediA Data Ingestion Engine — Liquipedia MediaWiki API
 * Strictly complies with Liquipedia API User-Agent and 2.5s rate-limit requirements.
 */

import { BaseFetcher } from '../BaseFetcher.js';
import { DataValidator } from '../DataValidator.js';
import { IngestionLogger } from '../IngestionLogger.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';
import { supabase } from '../../supabase.js';

const LIQUIPEDIA_DELAY_MS = 2500; // 2.5 seconds rate limit requirement

const LIQUIPEDIA_SOURCES = [
  {
    game_name: "BGMI",
    game_slug: "bgmi",
    wiki: "pubgmobile",
    pages: ["Battlegrounds_Mobile_India"]
  },
  {
    game_name: "PUBG Mobile",
    game_slug: "pubg-mobile",
    wiki: "pubgmobile",
    pages: ["S-Tier_Tournaments", "A-Tier_Tournaments"]
  }
];

export class LiquipediaEngine {
  constructor() {
    this.logger = new IngestionLogger('liquipedia', 'SyncTournaments');
    this.fetcher = new BaseFetcher({
      userAgent: 'KhelPediA-DataEngine/2.0 (https://khelpedia.org; contact@khelpedia.org)',
      logger: this.logger
    });
  }

  async run() {
    console.log("🚀 Starting Liquipedia MediaWiki Ingestion Engine...");

    for (const src of LIQUIPEDIA_SOURCES) {
      const gSlug = src.game_slug;
      const gName = src.game_name;
      console.log(`\n--- Processing Liquipedia ${gName} ---`);

      // Ensure game exists
      const { data: gameData } = await supabase.from('games').select('id').eq('slug', gSlug).maybeSingle();
      let gameId = gameData ? gameData.id : null;

      if (!gameId) {
        const { data: newGame } = await supabase
          .from('games')
          .insert([{ name: gName, slug: gSlug, genre: 'Battle Royale' }])
          .select('id')
          .single();
        gameId = newGame ? newGame.id : null;
      }

      if (!gameId) continue;

      for (const pageName of src.pages) {
        console.log(`Fetching Liquipedia page: ${src.wiki} / ${pageName}...`);
        const apiUrl = `https://liquipedia.net/${src.wiki}/api.php?action=parse&page=${pageName}&prop=text&format=json`;

        // Strict 2.5s rate limit sleep before request
        await new Promise(resolve => setTimeout(resolve, LIQUIPEDIA_DELAY_MS));

        const res = await this.fetcher.fetch(apiUrl);
        if (!res.ok || !res.data) continue;

        const htmlContent = (res.data.parse && res.data.parse.text) ? res.data.parse.text['*'] : '';
        if (!htmlContent) continue;

        // Parse HTML text content for tournament tables safely
        const tournaments = this.parseTournamentsHtml(htmlContent);
        console.log(`Parsed ${tournaments.length} tournaments from ${pageName}.`);

        for (const t of tournaments) {
          const validation = DataValidator.validateTournament({
            name: t.name,
            source_tournament_id: `${src.wiki}_${t.name}`,
            start_date: t.start_date
          });

          if (!validation.valid) {
            this.logger.logValidationFailure();
            continue;
          }

          await IdempotentUpsert.upsertTournament({
            source: 'liquipedia',
            source_tournament_id: `${src.wiki}_${t.name}`,
            name: t.name,
            game_id: gameId,
            region: t.region || 'Global',
            status: t.status || 'upcoming',
            prize_pool: t.prize_pool || 0,
            tier: t.tier || 'B',
            start_date: t.start_date,
            end_date: t.end_date,
            logger: this.logger
          });
        }
      }
    }

    await this.logger.printReport();
  }

  parseTournamentsHtml(html) {
    const results = [];
    const tourneyRegex = /class="table2__row--body"[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<td class="column__tournament"[^>]*>([\s\S]*?)<\/td>/g;
    let match;

    while ((match = tourneyRegex.exec(html)) !== null) {
      try {
        const rawTier = match[1].replace(/<[^>]+>/g, '').trim();
        const rawNameHtml = match[2];
        const nameMatch = rawNameHtml.match(/<a[^>]*>(.*?)<\/a>/);
        const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        if (name) {
          results.push({
            name,
            tier: rawTier.includes('S') ? 'S' : (rawTier.includes('A') ? 'A' : 'B'),
            status: 'completed',
            prize_pool: 0,
            start_date: null,
            end_date: null
          });
        }
      } catch {
        continue;
      }
    }

    return results;
  }
}
