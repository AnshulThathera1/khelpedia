/**
 * KhelPediA Data Ingestion Engine — FailedRecordQueue
 * Ensures failed or unresolvable records are recorded rather than silently discarded.
 */

import { supabase } from '../supabase.js';

export class FailedRecordQueue {
  /**
   * Log a failed ingestion payload
   */
  static async pushFailedRecord({ source, endpoint = null, source_entity_id = null, error, payload = {} }) {
    try {
      const errMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      
      const { error: insertErr } = await supabase
        .from('failed_ingestion_logs')
        .insert([{
          source,
          endpoint,
          source_entity_id: source_entity_id ? String(source_entity_id) : null,
          error_message: errMessage,
          payload,
          attempt_count: 1,
          last_attempt_at: new Date().toISOString()
        }]);

      if (insertErr) {
        console.error("⚠️ Failed to write to failed_ingestion_logs:", insertErr.message);
      }
    } catch (e) {
      console.error("💥 Exception in FailedRecordQueue.pushFailedRecord:", e.message || e);
    }
  }

  /**
   * Queue a provisional match for cross-source reconciliation
   */
  static async pushProvisionalMatch({ source, raw_identifier = null, tournament_name = null, team1_name = null, team2_name = null, score1 = 0, score2 = 0, round = null, scheduled_at = null, payload = {} }) {
    try {
      const { data, error } = await supabase
        .from('provisional_matches')
        .insert([{
          source,
          raw_identifier: raw_identifier ? String(raw_identifier) : null,
          tournament_name_raw: tournament_name,
          team1_name_raw: team1_name,
          team2_name_raw: team2_name,
          score1,
          score2,
          round_raw: round,
          scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
          payload,
          status: 'pending_reconciliation'
        }])
        .select('id');

      if (error) {
        console.error("⚠️ Failed to write to provisional_matches:", error.message);
        return null;
      }

      return data?.[0]?.id || null;
    } catch (e) {
      console.error("💥 Exception in FailedRecordQueue.pushProvisionalMatch:", e.message || e);
      return null;
    }
  }
}
