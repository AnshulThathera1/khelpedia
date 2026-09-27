/**
 * KhelPediA Data Ingestion Engine — FailedRecordQueue
 * Ensures failed or unresolvable records are recorded rather than silently discarded.
 */

import { query } from '../db.js';

export class FailedRecordQueue {
  /**
   * Log a failed ingestion payload
   */
  static async pushFailedRecord({ source, endpoint = null, source_entity_id = null, error, payload = {} }) {
    try {
      const errMessage = typeof error === 'string' 
        ? error 
        : (error?.message || error?.reason || (error ? JSON.stringify(error) : 'Unspecified error'));

      await query(
        `INSERT INTO failed_ingestion_logs (source, endpoint, source_entity_id, error_message, payload, attempt_count, last_attempt_at)
         VALUES ($1, $2, $3, $4, $5, 1, NOW())`,
        [source, endpoint, source_entity_id ? String(source_entity_id) : null, errMessage, JSON.stringify(payload)]
      );
    } catch (e) {
      console.error("💥 Exception in FailedRecordQueue.pushFailedRecord:", e.message || e);
    }
  }

  /**
   * Alias for pushFailedRecord matching engine callers
   */
  static async enqueue(source, endpoint, source_entity_id, error, payload = {}) {
    return this.pushFailedRecord({ source, endpoint, source_entity_id, error, payload });
  }

  /**
   * Queue a provisional match for cross-source reconciliation
   */
  static async pushProvisionalMatch({ source, raw_identifier = null, tournament_name = null, team1_name = null, team2_name = null, score1 = 0, score2 = 0, round = null, scheduled_at = null, payload = {} }) {
    try {
      const res = await query(
        `INSERT INTO provisional_matches (source, raw_identifier, tournament_name_raw, team1_name_raw, team2_name_raw, score1, score2, round_raw, scheduled_at, payload, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_reconciliation')
         RETURNING id`,
        [
          source,
          raw_identifier ? String(raw_identifier) : null,
          tournament_name,
          team1_name,
          team2_name,
          score1,
          score2,
          round,
          scheduled_at ? new Date(scheduled_at).toISOString() : null,
          JSON.stringify(payload)
        ]
      );
      return res.rows[0]?.id || null;
    } catch (e) {
      console.error("💥 Exception in FailedRecordQueue.pushProvisionalMatch:", e.message || e);
      return null;
    }
  }
}

