/**
 * KhelPediA Data Ingestion Engine Orchestrator
 * Command: node scripts/run_ingestion.js [engine_name] [--slug=tournament_slug]
 */

import dotenv from 'dotenv';
import path from 'path';
import { PandaScoreEngine } from '../src/lib/ingestion/engines/PandaScoreEngine.js';
import { OpenDotaEngine } from '../src/lib/ingestion/engines/OpenDotaEngine.js';
import { LiquipediaEngine } from '../src/lib/ingestion/engines/LiquipediaEngine.js';
import { VLRCompliancePolicy } from '../src/lib/ingestion/engines/VLRCompliancePolicy.js';
import ESportsAmazeEngine from '../src/lib/ingestion/engines/ESportsAmazeEngine.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Parse CLI arguments
const args = process.argv.slice(2);
const targetEngine = args[0] && !args[0].startsWith('--') ? args[0].toLowerCase() : null;

let slugArg = null;
for (const arg of args) {
  if (arg.startsWith('--slug=')) {
    slugArg = arg.split('=')[1];
  }
}

async function runIngestion() {
  console.log("==================================================");
  console.log("KHELPEDIA DATA INGESTION SUITE — STARTING");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Target Engine: ${targetEngine || 'ALL ENGINES'}`);
  if (slugArg) console.log(`Slug Filter: ${slugArg}`);
  console.log("==================================================\n");

  // 1. Compliance check
  VLRCompliancePolicy.checkCompliance();

  // Single engine target execution
  if (targetEngine === 'esportsamaze') {
    const esportsamaze = new ESportsAmazeEngine();
    await esportsamaze.run({ slug: slugArg });
    return;
  } else if (targetEngine === 'pandascore') {
    const pandascore = new PandaScoreEngine();
    await pandascore.run();
    return;
  } else if (targetEngine === 'opendota') {
    const opendota = new OpenDotaEngine();
    await opendota.run();
    return;
  } else if (targetEngine === 'liquipedia') {
    const liquipedia = new LiquipediaEngine();
    await liquipedia.run();
    return;
  }

  // Full suite execution
  try {
    const esportsamaze = new ESportsAmazeEngine();
    await esportsamaze.run({ slug: slugArg });
  } catch (e) {
    console.error("eSportsAmaze Engine Error:", e.message || e);
  }

  try {
    const pandascore = new PandaScoreEngine();
    await pandascore.run();
  } catch (e) {
    console.error("PandaScore Engine Error:", e.message || e);
  }

  try {
    const opendota = new OpenDotaEngine();
    await opendota.run();
  } catch (e) {
    console.error("OpenDota Engine Error:", e.message || e);
  }

  try {
    const liquipedia = new LiquipediaEngine();
    await liquipedia.run();
  } catch (e) {
    console.error("Liquipedia Engine Error:", e.message || e);
  }

  console.log("\n==================================================");
  console.log("KHELPEDIA INGESTION SUITE COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runIngestion();
