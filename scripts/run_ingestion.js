/**
 * KhelPediA Data Ingestion Engine Orchestrator
 * Command: node scripts/run_ingestion.js [engine_name] [--slug=tournament_slug]
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // fallback
}

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

  const { VLRCompliancePolicy } = await import('../src/lib/ingestion/engines/VLRCompliancePolicy.js');
  const { PandaScoreEngine } = await import('../src/lib/ingestion/engines/PandaScoreEngine.js');
  const { OpenDotaEngine } = await import('../src/lib/ingestion/engines/OpenDotaEngine.js');
  const { LiquipediaEngine } = await import('../src/lib/ingestion/engines/LiquipediaEngine.js');
  const ESportsAmazeEngineModule = await import('../src/lib/ingestion/engines/ESportsAmazeEngine.js');
  const ESportsAmazeEngine = ESportsAmazeEngineModule.default;

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
