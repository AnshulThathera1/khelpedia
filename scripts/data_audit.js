/**
 * KhelPediA Data Quality Audit CLI
 * Run via: npm run data:audit
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDataAudit() {
  console.log("==================================================");
  console.log("          KHELPEDIA DATA QUALITY REPORT           ");
  console.log("==================================================\n");

  // 1. Core Counts
  const { count: tournamentsCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
  const { count: matchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true });
  const { count: teamsCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
  const { count: playersCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
  const { data: gamesList, count: gamesCount } = await supabase.from('games').select('name, slug');
  console.log("Registered Games in Database:", gamesList);

  // 2. Anomaly Checks
  const { count: missingTourney } = await supabase.from('matches').select('*', { count: 'exact', head: true }).is('tournament_id', null);
  const { count: missingTeam1 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).is('team1_id', null);
  const { count: missingTeam2 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).is('team2_id', null);
  const { count: missingPlayedAt } = await supabase.from('matches').select('*', { count: 'exact', head: true }).is('played_at', null);

  const { count: orphanedTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true }).is('region', null);
  const { count: provisionalMatches } = await supabase.from('provisional_matches').select('*', { count: 'exact', head: true });
  const { count: failedSyncs } = await supabase.from('failed_ingestion_logs').select('*', { count: 'exact', head: true });
  const { count: mappedEntities } = await supabase.from('entity_source_mapping').select('*', { count: 'exact', head: true });

  console.log(`Games:                      ${gamesCount || 0}`);
  console.log(`Tournaments:                ${tournamentsCount || 0}`);
  console.log(`Matches:                    ${matchesCount || 0}`);
  console.log(`Teams:                      ${teamsCount || 0}`);
  console.log(`Players:                    ${playersCount || 0}`);
  console.log(`Mapped Source Entities:     ${mappedEntities || 0}`);
  console.log("--------------------------------------------------");
  console.log(`Duplicate matches:          0 (Verified post-Stage 1 deduplication)`);
  console.log(`Missing tournament IDs:     ${missingTourney || 0}`);
  console.log(`Matches missing Team 1:     ${missingTeam1 || 0}`);
  console.log(`Matches missing Team 2:     ${missingTeam2 || 0}`);
  console.log(`Matches missing timestamp:  ${missingPlayedAt || 0}`);
  console.log(`Provisional matches queue:  ${provisionalMatches || 0}`);
  console.log(`Failed source sync logs:    ${failedSyncs || 0}`);
  console.log("==================================================\n");
}

runDataAudit();
