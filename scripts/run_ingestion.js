/**
 * KhelPediA Data Ingestion Engine Orchestrator
 * Command: node scripts/run_ingestion.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { PandaScoreEngine } from '../src/lib/ingestion/engines/PandaScoreEngine.js';
import { OpenDotaEngine } from '../src/lib/ingestion/engines/OpenDotaEngine.js';
import { LiquipediaEngine } from '../src/lib/ingestion/engines/LiquipediaEngine.js';
import { VLRCompliancePolicy } from '../src/lib/ingestion/engines/VLRCompliancePolicy.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runAll() {
  console.log("==================================================");
  console.log("KHELPEDIA DATA INGESTION SUITE — STARTING ALL ENGINES");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("==================================================\n");

  // 1. Compliance check
  VLRCompliancePolicy.checkCompliance();

  // 2. Run PandaScore Engine
  try {
    const pandascore = new PandaScoreEngine();
    await pandascore.run();
  } catch (e) {
    console.error("PandaScore Engine Error:", e.message || e);
  }

  // 3. Run OpenDota Engine
  try {
    const opendota = new OpenDotaEngine();
    await opendota.run();
  } catch (e) {
    console.error("OpenDota Engine Error:", e.message || e);
  }

  // 4. Run Liquipedia Engine
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

runAll();
