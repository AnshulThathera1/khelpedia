require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const apiKey = process.env.RIOT_API_KEY;

async function run() {
  const puuid = 'tKpLXykO6X4ktcNSnIh2zBhLyLZ6WADER_X0MZo1F2Z3Q1lhuuDf74aLQVWdtw9iYnvUOCEZEr0mYg';

  const matchesRes = await pool.query(`
    SELECT DISTINCT match_id FROM match_players WHERE puuid = $1
  `, [puuid]);

  const matchIds = matchesRes.rows.map(r => r.match_id);
  console.log(`Starting backfill for ${matchIds.length} matches...`);

  let savedCount = 0;
  let matchesProcessed = 0;

  for (const matchId of matchIds) {
    try {
      const resp = await fetch(`https://ap.api.riotgames.com/val/match/v1/matches/${matchId}`, {
        headers: { 'X-Riot-Token': apiKey }
      });

      if (!resp.ok) {
        console.warn(`[${resp.status}] Match ${matchId}`);
        if (resp.status === 429) {
          console.log('Rate limited, waiting 10s...');
          await new Promise(r => setTimeout(r, 10000));
        }
        continue;
      }

      const matchData = await resp.json();
      for (const p of (matchData.players || [])) {
        if (p.puuid && p.gameName && p.tagLine) {
          await pool.query(`
            INSERT INTO valorant_accounts (puuid, game_name, tag_line, last_updated)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (puuid) DO UPDATE SET
              game_name = EXCLUDED.game_name,
              tag_line = EXCLUDED.tag_line,
              last_updated = EXCLUDED.last_updated
          `, [p.puuid, p.gameName, p.tagLine]);
          savedCount++;
        }
      }
      matchesProcessed++;
      if (matchesProcessed % 10 === 0) {
        console.log(`Processed ${matchesProcessed}/${matchIds.length} matches, saved/updated ${savedCount} player identities.`);
      }

      // Small delay to respect rate limit
      await new Promise(r => setTimeout(r, 120));
    } catch (e) {
      console.error(`Error processing match ${matchId}:`, e.message);
    }
  }

  console.log(`Backfill complete! Processed ${matchesProcessed} matches, updated ${savedCount} identities.`);
  await pool.end();
}

run().catch(console.error);
