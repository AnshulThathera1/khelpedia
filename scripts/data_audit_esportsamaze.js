/**
 * eSportsAmaze BGMI Data Quality Audit Tool
 * Command: npm run data:audit:esportsamaze
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runAudit() {
  console.log("==================================================");
  console.log("eSportsAmaze BGMI DATA QUALITY AUDIT REPORT");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("==================================================\n");

  // 1. Tournaments Mapped
  const { data: tourneyMappings } = await supabase
    .from('entity_source_mapping')
    .select('internal_entity_id, source_entity_id')
    .eq('source', 'esportsamaze')
    .eq('entity_type', 'tournament');

  const tourneyCount = tourneyMappings ? tourneyMappings.length : 0;
  console.log(`Tournaments Imported / Mapped: ${tourneyCount}`);

  // 2. Teams Mapped
  const { data: teamMappings } = await supabase
    .from('entity_source_mapping')
    .select('internal_entity_id, source_entity_id')
    .eq('source', 'esportsamaze')
    .eq('entity_type', 'team');

  const teamCount = teamMappings ? teamMappings.length : 0;
  console.log(`Teams Imported / Mapped: ${teamCount}`);

  // 3. Matches Mapped
  const { data: matchMappings } = await supabase
    .from('entity_source_mapping')
    .select('internal_entity_id, source_entity_id')
    .eq('source', 'esportsamaze')
    .eq('entity_type', 'match');

  const matchCount = matchMappings ? matchMappings.length : 0;
  console.log(`Matches Imported / Mapped: ${matchCount}`);

  // 4. Match Teams Records & Provenance
  const { data: matchTeamsData } = await supabase
    .from('match_teams')
    .select('source_result_id, placement, placement_points, elimination_points, wwcd, kills');

  const matchTeamsCount = matchTeamsData ? matchTeamsData.length : 0;
  const esportsAmazeResultCount = matchTeamsData ? matchTeamsData.filter(mt => mt.source_result_id).length : 0;
  console.log(`Total match_teams Records in Database: ${matchTeamsCount}`);
  console.log(`eSportsAmaze match_teams Records (with source_result_id): ${esportsAmazeResultCount}`);

  // 5. Stage Standings Records
  const { count: stageStandingsCount } = await supabase
    .from('bgmi_stage_standings')
    .select('*', { count: 'exact', head: true });

  console.log(`bgmi_stage_standings Records: ${stageStandingsCount || 0}`);

  // 6. Check NULL Semantics
  let nullKillsCount = 0;
  if (matchTeamsData) {
    nullKillsCount = matchTeamsData.filter(mt => mt.kills === null).length;
  }
  console.log(`match_teams Records with kills = NULL: ${nullKillsCount} (Preserving strict NULL semantics)`);

  // 7. Check Failed Ingestion Logs
  const { data: failedLogs } = await supabase
    .from('failed_ingestion_logs')
    .select('*')
    .eq('source', 'esportsamaze');

  const failedCount = failedLogs ? failedLogs.length : 0;
  console.log(`Failed Ingestion Log Entries: ${failedCount}`);

  console.log("\n==================================================");
  console.log("AUDIT SUMMARY COMPLETE");
  console.log("==================================================");
}

runAudit();
