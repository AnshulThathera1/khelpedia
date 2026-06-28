import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the Next.js project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The exact same trimmer we added to your backend
function trimMatchData(data) {
    if (!data || !data.roundResults) return data;
    
    // Clone to avoid mutating original reference
    const trimmed = JSON.parse(JSON.stringify(data));

    // Root-level bloat
    delete trimmed.coaches;
    if (trimmed.matchInfo) {
      delete trimmed.matchInfo.premierMatchInfo;
      delete trimmed.matchInfo.provisioningFlowId;
      delete trimmed.matchInfo.gameVersion;
      delete trimmed.matchInfo.isCompleted;
      delete trimmed.matchInfo.customGameName;
    }
    
    trimmed.roundResults.forEach(round => {
      // Round-level bloat
      delete round.playerLocations;
      delete round.locations;
      delete round.plantSite;
      delete round.bombDefuser;
      delete round.bombPlanter;
      
      if (round.playerStats) {
        round.playerStats.forEach(ps => {
          // Player-round bloat
          delete ps.score;
          delete ps.ability;
          
          if (ps.economy) {
            ps.economy = { weapon: ps.economy.weapon }; // Keep only weapon
          }
          
          if (ps.kills) {
            ps.kills.forEach(k => {
              // Kill event bloat
              delete k.playerLocations; 
              delete k.victimLocation;
              delete k.finishingDamage;
              delete k.timeSinceGameStartMillis;
            });
          }
        });
      }
    });
    
    return trimmed;
}

async function shrinkDatabase() {
    console.log("🚀 Starting database shrink process...");
    
    const BATCH_SIZE = 10;
    let offset = 0;
    let totalProcessed = 0;
    let totalUpdated = 0;

    while (true) {
        // 1. Fetch a batch of matches
        const { data: matches, error: fetchError } = await supabase
            .from('valorant_matches')
            .select('*')
            .order('match_id') // Keyset/stable sort
            .range(offset, offset + BATCH_SIZE - 1);

        if (fetchError) {
            console.error("Error fetching matches:", fetchError.message);
            break;
        }

        if (!matches || matches.length === 0) {
            console.log("\n✅ Reached the end of the table.");
            break;
        }

        console.log(`Processing matches ${offset} to ${offset + matches.length - 1}...`);
        
        // 2. Trim and update each match
        const updates = [];
        for (const match of matches) {
            if (!match.match_info_json || !match.match_info_json.roundResults) continue;
            
            const originalLength = JSON.stringify(match.match_info_json).length;
            const trimmedData = trimMatchData(match.match_info_json);
            const trimmedLength = JSON.stringify(trimmedData).length;

            if (trimmedLength === originalLength) {
                continue; // Skip, it actually had nothing to trim
            }
            
            updates.push({
                ...match,
                match_info_json: trimmedData
            });
        }

        // 3. Bulk update (Supabase upsert)
        if (updates.length > 0) {
            const { error: updateError } = await supabase
                .from('valorant_matches')
                .upsert(updates, { onConflict: 'match_id' });
            
            if (updateError) {
                console.error("Error updating batch:", updateError.message);
            } else {
                totalUpdated += updates.length;
                console.log(`-> Shrunk ${updates.length} matches in this batch!`);
            }
        }

        totalProcessed += matches.length;
        offset += BATCH_SIZE;
        
        // Sleep to avoid overloading the DB
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🎉 Finished! Processed ${totalProcessed} matches, shrank ${totalUpdated} matches.`);
    console.log("IMPORTANT: You must run `VACUUM FULL public.valorant_matches;` in your Supabase SQL Editor to see the physical file size drop!");
}

shrinkDatabase();
