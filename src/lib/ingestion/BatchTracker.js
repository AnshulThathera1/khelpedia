/**
 * KhelPediA Data Ingestion Engine — BatchTracker
 * Manages atomic ingestion batch lifecycles, manifest recording, and rollback provenance.
 */

import crypto from 'crypto';

export class BatchTracker {
  constructor(options = {}) {
    this.batchId = options.batchId || crypto.randomUUID();
    this.source = options.source || 'esportsamaze';
    this.targetSlug = options.targetSlug || null;
    this.status = 'IN_PROGRESS';
    this.startedAt = new Date().toISOString();
    this.completedAt = null;
    this.rolledBackAt = null;
    this.queryFn = options.queryFn || null; // Optional db query function

    this.manifest = {
      createdEntities: [],      // { table_name, id }
      linkedEntities: [],       // { table_name, id, source_id }
      updatedEntities: [],      // { table_name, id, previous_values }
      createdDependents: [],    // { table_name, id }
      quarantineRecords: [],    // { id, conflict_code }
      sourceMappings: []        // { id, entity_type, internal_entity_id, source_entity_id }
    };
  }

  getBatchId() {
    return this.batchId;
  }

  /**
   * Derive deterministic signed 64-bit BigInt string lock key matching PostgreSQL md5 logic:
   * ('x' || substr(md5(source || ':' || slug), 1, 16))::bit(64)::bigint
   */
  static computeLockKey(source, slug) {
    if (!source || !slug) return null;
    const hashHex = crypto.createHash('md5').update(`${source}:${slug}`).digest('hex').slice(0, 16);
    const unsigned = BigInt('0x' + hashHex);
    return BigInt.asIntN(64, unsigned).toString();
  }

  /**
   * Acquire non-blocking transaction-scoped advisory lock for tournament
   * @returns {Promise<boolean>} true if lock acquired, false if contended
   */
  async tryAcquireTournamentLock(source = this.source, slug = this.targetSlug, queryFn = this.queryFn) {
    if (!queryFn || !slug) return true; // Graceful offline unit test fallback
    try {
      const lockKey = BatchTracker.computeLockKey(source, slug);
      const res = await queryFn(`SELECT pg_try_advisory_xact_lock($1) as acquired;`, [lockKey]);
      return res.rows[0]?.acquired === true;
    } catch (err) {
      console.warn("⚠️ Warning acquiring tournament advisory lock:", err.message || err);
      return false;
    }
  }

  recordCreatedEntity(tableName, id) {
    if (!tableName || !id) return;
    const exists = this.manifest.createdEntities.some(e => e.table_name === tableName && e.id === id);
    if (!exists) {
      this.manifest.createdEntities.push({ table_name: tableName, id });
    }
  }

  recordLinkedEntity(tableName, id, sourceId = null) {
    if (!tableName || !id) return;
    const exists = this.manifest.linkedEntities.some(e => e.table_name === tableName && e.id === id);
    if (!exists) {
      this.manifest.linkedEntities.push({ table_name: tableName, id, source_id: sourceId });
    }
  }

  recordUpdatedEntity(tableName, id, previousValues = {}) {
    if (!tableName || !id) return;
    const existing = this.manifest.updatedEntities.find(e => e.table_name === tableName && e.id === id);
    if (!existing) {
      this.manifest.updatedEntities.push({
        table_name: tableName,
        id,
        previous_values: { ...previousValues }
      });
    }
  }

  recordCreatedDependent(tableName, id) {
    if (!tableName || !id) return;
    const exists = this.manifest.createdDependents.some(e => e.table_name === tableName && e.id === id);
    if (!exists) {
      this.manifest.createdDependents.push({ table_name: tableName, id });
    }
  }

  recordQuarantine(id, conflictCode, payload = {}) {
    this.manifest.quarantineRecords.push({ id, conflict_code: conflictCode, payload });
  }

  recordSourceMapping(id, entityType, internalEntityId, sourceEntityId) {
    this.manifest.sourceMappings.push({
      id,
      entity_type: entityType,
      internal_entity_id: internalEntityId,
      source_entity_id: sourceEntityId
    });
  }

  getSummary() {
    return {
      batchId: this.batchId,
      source: this.source,
      status: this.status,
      createdCount: this.manifest.createdEntities.length,
      linkedCount: this.manifest.linkedEntities.length,
      updatedCount: this.manifest.updatedEntities.length,
      dependentCount: this.manifest.createdDependents.length,
      quarantineCount: this.manifest.quarantineRecords.length,
      mappingCount: this.manifest.sourceMappings.length
    };
  }

  getManifest() {
    return { ...this.manifest };
  }

  async persistStart(queryFn = this.queryFn) {
    if (!queryFn) return;
    try {
      await queryFn(
        `INSERT INTO ingestion_batch_ledger (batch_id, source, target_tournament_slug, status, manifest, created_records_count, started_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (batch_id) DO UPDATE SET status = EXCLUDED.status, manifest = EXCLUDED.manifest`,
        [this.batchId, this.source, this.targetSlug, this.status, JSON.stringify(this.manifest), this.manifest.createdEntities.length]
      );
    } catch (err) {
      console.error("⚠️ Failed to persist batch start to ledger:", err.message || err);
    }
  }

  async commit(queryFn = this.queryFn) {
    this.status = 'COMMITTED';
    this.completedAt = new Date().toISOString();

    if (queryFn) {
      try {
        await queryFn(
          `INSERT INTO ingestion_batch_ledger (batch_id, source, target_tournament_slug, status, manifest, created_records_count, started_at, completed_at)
           VALUES ($1, $2, $3, 'COMMITTED', $4, $5, $6, NOW())
           ON CONFLICT (batch_id) DO UPDATE 
           SET status = 'COMMITTED', manifest = EXCLUDED.manifest, created_records_count = EXCLUDED.created_records_count, completed_at = NOW()`,
          [this.batchId, this.source, this.targetSlug, JSON.stringify(this.manifest), this.manifest.createdEntities.length, this.startedAt]
        );
      } catch (err) {
        console.error("⚠️ Failed to persist batch commit to ledger:", err.message || err);
      }
    }

    return this.getSummary();
  }

  async fail(error, queryFn = this.queryFn) {
    this.status = 'FAILED';
    this.completedAt = new Date().toISOString();

    if (queryFn) {
      try {
        await queryFn(
          `INSERT INTO ingestion_batch_ledger (batch_id, source, target_tournament_slug, status, manifest, created_records_count, started_at, completed_at)
           VALUES ($1, $2, $3, 'FAILED', $4, $5, $6, NOW())
           ON CONFLICT (batch_id) DO UPDATE 
           SET status = 'FAILED', manifest = EXCLUDED.manifest, completed_at = NOW()`,
          [this.batchId, this.source, this.targetSlug, JSON.stringify(this.manifest), this.manifest.createdEntities.length, this.startedAt]
        );
      } catch (err) {
        console.error("⚠️ Failed to persist batch failure to ledger:", err.message || err);
      }
    }

    return this.getSummary();
  }
}

export default BatchTracker;
