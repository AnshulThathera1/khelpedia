# KhelPediA BGMI Ingestion — Phase 5: Final Deployment Gate Audit

**Document:** `docs/BGMI_PHASE5_FINAL_DEPLOYMENT_GATE_AUDIT.md`  
**Auditor Roles:** Senior PostgreSQL Database Engineer, Backend Reliability Engineer, Production Security Auditor  
**Date:** 2026-10-22  
**Target Repository:** `e:\Projects\KhelPediA\khelpedia`  
**Pipeline:** BGMI Tournament & Match Ingestion Engine (`ESportsAmazeEngine`)  
**Audit Phase:** Phase 5 — Deployment Gate Audit & Concurrency Verification  

---

## 1. Executive Verdict

### Verdict: `CONDITIONAL GO`

#### Summary of Gate Decision:
1. **Code-Level Blockers Resolved:** The critical transaction-ownership defect in [src/lib/ingestion/engines/ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) has been remediated. The engine now checks out a dedicated `pg.Client` from the connection pool, explicitly executes `BEGIN;`, acquires a transaction-scoped advisory lock (`pg_try_advisory_xact_lock`), routes all mutations via the dedicated client's `queryFn`, commits atomically, releases the client in a `finally` block, and persists any failure status outside the rolled-back transaction to the `ingestion_batch_ledger`.
2. **Schema Rollback Safety Remediated:** The destructive `DROP TABLE IF EXISTS public.bgmi_stage_standings CASCADE;` in [supabase/rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql) has been isolated and replaced with [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql), which drops only migration-added columns (`bonus_pts`, `stage_type`, `tiebreaker_rule`, `tiebreaker_note`, `source_attribution_url`) to protect historical standings.
3. **Condition for Production Deployment:** Direct production database access was strictly prohibited during this audit. Therefore, the presence of prerequisite `public.entity_source_mapping`, table locks, and row integrity in live production remain **UNVERIFIED** until an authorized operator executes [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) in a read-only session and confirms all preflight gates pass.

---

## 2. Scope and Safety Boundaries

This audit was conducted strictly within offline and local staging boundaries:
- **Zero Production Access:** No connections to production Supabase, Neon, or remote PostgreSQL clusters were opened.
- **Zero Secret Exposure:** No `.env` credentials, tokens, or connection strings were logged or displayed.
- **Zero Live Ingestion:** No live network requests or scraping against `esportsamaze.com` or external endpoints were performed.
- **Zero Production Mutations:** No migrations, schema modifications, or rollback scripts were executed against any remote database.
- **Preservation of Working Tree:** All pre-existing user modifications in `src/app/bgmi/`, `DataValidator.js`, and `IdempotentUpsert.js` were preserved.
- **Local Database Verification Only:** Concurrency, locking, and transaction tests were executed exclusively against an isolated, disposable local PostgreSQL 18.6 instance at `127.0.0.1:5432` (`khelpedia_staging_fresh`).

---

## 3. Repository Files and Code Paths Actually Inspected

The following files were inspected directly from source:

| File Path | Existence | Inspection Focus |
| :--- | :--- | :--- |
| [src/lib/ingestion/BatchTracker.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/BatchTracker.js) | Confirmed | Advisory lock derivation (`computeLockKey`), manifest tracking, `persistStart`, `commit`, `fail`. |
| [src/lib/ingestion/engines/ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) | Confirmed | `run()` execution path, transaction boundaries, client checkout, lock contention handling. |
| [src/lib/ingestion/engines/BaseFetcher.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/BaseFetcher.js) | Confirmed | Rate limiting, HTTP retry policies, header normalization. |
| [src/lib/ingestion/DataValidator.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/DataValidator.js) | Confirmed | Strict point equation `placement + eliminations + bonus === total`, strict NULL semantics, telemetry bounds. |
| [src/lib/ingestion/IdempotentUpsert.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/IdempotentUpsert.js) | Confirmed | `executeQuery` routing to `batchTracker.queryFn`, pre-update snapshots, `entity_source_mapping`. |
| [src/lib/ingestion/FailedRecordQueue.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/FailedRecordQueue.js) | Confirmed | Failed record dead-letter queue, JSON payload quarantine. |
| [src/lib/ingestion/IngestionLogger.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/IngestionLogger.js) | Confirmed | Logging formatting, log level isolation. |
| [scripts/run_ingestion.js](file:///e:/Projects/KhelPediA/khelpedia/scripts/run_ingestion.js) | Confirmed | Production CLI entry point, argument parsing (`--slug`), engine dispatch. |
| [src/lib/bgmiQueries.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/bgmiQueries.js) | Confirmed | Read queries for standings, matches, rosters, and typed view `bgmi_match_teams`. |
| [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql) | Confirmed | Polymorphic trigger, table DDL, stored procedure `rollback_ingestion_batch`. |
| [supabase/rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql) | Confirmed | Original rollback DDL (Identified destructive `DROP TABLE` defect). |
| [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql) | Confirmed | Corrected non-destructive rollback DDL (Preserves pre-existing standings). |
| [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) | Confirmed | Strictly read-only preflight inspection script for authorized operator. |
| `scratch/test_real_engine_offline.mjs` | Confirmed | Unit test harness verifying real parser, validator, and batch ledger. |
| `scratch/test_concurrency_hardening.mjs` | Confirmed | Independent client advisory lock mutual exclusion and disconnect test. |
| `scratch/test_engine_transaction_ownership.mjs` | Confirmed | End-to-end dedicated client transaction test against local PostgreSQL 18.6. |

---

## 4. Critical Gate A: Transaction Ownership

### Defect Analysis
Prior to remediation, [ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) constructed `batchTracker` without a query function (`queryFn = null`). When executed from `scripts/run_ingestion.js`:
1. `batchTracker.tryAcquireTournamentLock()` returned `true` immediately as a graceful fallback without issuing any SQL lock against PostgreSQL.
2. In `IdempotentUpsert.js`, `executeQuery` fell back to `query(text, params)`, which called `pool.query()`.
3. Every individual insert/update checked out a connection from the pool, executed in an implicit auto-commit transaction, and immediately checked the connection back into the pool.
4. If `pg_try_advisory_xact_lock` had been invoked via `pool.query()`, PostgreSQL would have released the transaction-scoped advisory lock the microsecond that single query completed.
5. Midway failures left partial records in the database with no outer transaction rollback.

### Remediation Applied
In [src/lib/ingestion/engines/ESportsAmazeEngine.js:L98-L148](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L98-L148) and [L345-L395](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L345-L395):
1. **Dedicated Client Checkout:** Prior to writing tournament entities, the engine checks out a single dedicated client:
   ```javascript
   client = await activePool.connect();
   await client.query('BEGIN;');
   txQueryFn = client.query.bind(client);
   batchTracker.queryFn = txQueryFn;
   ```
2. **Lock Bound to Same Client:** The transaction advisory lock is acquired on that exact connection:
   ```javascript
   const lockAcquired = await batchTracker.tryAcquireTournamentLock('esportsamaze', slug, txQueryFn);
   ```
3. **Lock Contention Handling:** If contended, the transaction is immediately aborted with `ROLLBACK;`, the client is released, and the worker skips the tournament without performing any writes.
4. **All Writes Bound to Same Client:** All subsequent calls (`upsertTournament`, `upsertMatch`, `upsertMatchTeam`, `upsertPlayer`, `upsertMatchPlayerStats`, `upsertBGMIStageStandings`) pass `batchTracker`, routing every query through `txQueryFn` on the same open PostgreSQL transaction.
5. **Atomic Commit:** `await batchTracker.commit(txQueryFn);` updates the ledger to `COMMITTED`, followed by `await client.query('COMMIT;');`, which atomically commits all data and frees the advisory lock.
6. **Atomic Rollback & Out-of-Transaction Failure Persistence:** If an unhandled error occurs during mutation:
   - `await client.query('ROLLBACK;');` cleanly aborts all inserted rows.
   - `client.release();` returns the socket to the pool.
   - `await batchTracker.fail(tErr, fallbackQueryFn);` uses an independent pool query to write `status = 'FAILED'` and the error manifest to `ingestion_batch_ledger`. This guarantees the failure ledger row **survives** the rollback and is permanently auditable.

---

## 5. Critical Gate B: Advisory Locks and Concurrency

### Lock Key Derivation Parity
The 64-bit lock key derivation was verified for exact mathematical equivalence:
- **JavaScript Implementation** ([BatchTracker.js:L37-L42](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/BatchTracker.js#L37-L42)):
  ```javascript
  const hashHex = crypto.createHash('md5').update(`${source}:${slug}`).digest('hex').slice(0, 16);
  const unsigned = BigInt('0x' + hashHex);
  return BigInt.asIntN(64, unsigned).toString();
  ```
- **PostgreSQL Implementation** ([proposed_migration...sql:L413](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql#L413)):
  ```sql
  ('x' || substr(md5(v_batch.source || ':' || v_batch.target_tournament_slug), 1, 16))::bit(64)::bigint
  ```
- **Equivalence Result:** Both algorithms consume `${source}:${slug}`, compute 128-bit MD5, take the first 16 hex characters (64 bits), and interpret them as a signed two's-complement 64-bit integer. For `esportsamaze:bgms-2026`, both produce `-4598245860625749337`.

### Concurrency Scope & Limitation
- **Single-Source Protection:** Complete mutual exclusion is guaranteed between concurrent workers targeting the same source and tournament slug.
- **Cross-Source Concurrency Limitation:** If two distinct sources ingest the same canonical tournament under different slugs (e.g. `esportsamaze:bgms-2026` vs `liquipedia:bgms-season-3`), their lock keys differ. In this scenario, mutual exclusion relies on the canonical `UNIQUE(slug)` constraint on `public.tournaments`. To harden cross-source ingestion in future phases, an auxiliary lock on `hashtext('canonical_tourney:' || canonical_id::text)` is recommended once the internal UUID is resolved.
- **Rollback Lock Parity:** Stored procedure `rollback_ingestion_batch()` computes the identical lock key from `v_batch.source || ':' || v_batch.target_tournament_slug` and acquires `pg_advisory_xact_lock` before checking dependencies or executing deletions, completely blocking competing ingestion workers.

---

## 6. Critical Gate C: Rollback and Data-Loss Risks

### Distinction of Three Separate Operations
1. **Schema DDL Rollback:** Reverting database structure (tables, columns, views, triggers).
2. **Application Batch Rollback:** Reverting business data created by a specific ingestion batch via `rollback_ingestion_batch(UUID)`.
3. **Physical Backup Restoration:** Restoring a point-in-time snapshot or full database dump via `pg_restore`.

### Audit of Original Rollback Script ([rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql))
- **Critical Flaw:** Line 27 issued:
  ```sql
  DROP TABLE IF EXISTS public.bgmi_stage_standings CASCADE;
  ```
  If applied to a database where `bgmi_stage_standings` existed prior to the migration (created by `schema_bgmi.sql`), executing this script would **permanently drop the entire table and destroy all historical standings**.
- **Cascade Danger:** `CASCADE` drops any dependent foreign keys, views, or indexes without warning.

### Corrected Safe Rollback Script ([safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql))
- Non-destructively reverts `bgmi_stage_standings`:
  ```sql
  ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS bonus_pts;
  ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS stage_type;
  ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS tiebreaker_rule;
  ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS tiebreaker_note;
  ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS source_attribution_url;
  ```
- Drops only newly created tables (`match_player_stats`, `tournament_player_stats`, `tournament_rosters`, `ingestion_batch_ledger`, `quarantine_identities`).
- Safely removes triggers from `match_teams`, `matches`, `teams`, and `valorant_matches`.
- Restores the legacy Valorant FK constraint `match_teams_match_id_fkey` if `valorant_matches` exists.
- Completely preserves all pre-existing tournament, match, team, and standings data.

---

## 7. Critical Gate D: Migration and Preflight SQL

### Preflight Script Audit ([production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql))
- **Read-Only Verification:** The script is strictly non-mutating and executes inside:
  ```sql
  BEGIN TRANSACTION READ ONLY;
  ...
  ROLLBACK;
  ```
- **Catalog Safe:** Uses `to_regclass()` to conditionally inspect relations. Does not crash if optional relations (`valorant_matches`, `entity_source_mapping`) are missing.
- **Dynamic SQL Guards:** Data integrity checks (orphaned rows, format analysis, collision detection) are executed via `DO $$ ... EXECUTE ... $$` blocks guarded by `to_regclass()`.
- **Zero Exposure:** Does not select connection strings, passwords, or encrypted tokens.

### Migration Risks & Locking Characteristics
- `ALTER TABLE public.match_teams DROP CONSTRAINT IF EXISTS match_teams_match_id_fkey`: Requires `AccessExclusiveLock` on `match_teams`. Must be executed during a maintenance window with low traffic.
- `ALTER TABLE public.match_teams ALTER COLUMN won DROP NOT NULL`: In PostgreSQL 11+, metadata-only rewrite (near-instantaneous).
- `CREATE UNIQUE INDEX IF NOT EXISTS uq_match_teams_source_result`: Acquires `ShareLock` on `match_teams`. If table has millions of rows, `CONCURRENTLY` is recommended for high-write production.
- `ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS bonus_pts INT DEFAULT NULL`: Metadata update only; zero row rewrite.

---

## 8. Critical Gate E: Test Authenticity and Coverage

### Audit of Previous Claims vs Real Artifacts
1. **Phase 1 Claim (9/9 Offline Tests Passed):** Verified by running `scratch/test_real_engine_offline.mjs`. Tests real classes (`ESportsAmazeEngine`, `DataValidator`, `BatchTracker`, `IdempotentUpsert`) against synthetic fixtures. Note: `upsertManager` was mocked in test 9, so it did not test database connection pooling.
2. **Phase 2 Claim (29/29 Staging Tests Passed):** Verified via `scratch/staging_phase2_report.json` and inspection of `staging_validation_suite.mjs`. Tests executed against local PostgreSQL 18.6 with dedicated clients for both fresh schema and ALTER TABLE upgrade paths.
3. **Phase 3 Claim (6/6 Concurrency Tests Passed):** Verified via `scratch/concurrency_hardening_report.json`. Tests used two real independent `pg.Client` connections to verify mutual exclusion, rollback release, and socket disconnect cleanup.
4. **Phase 5 Verification (4/4 Engine Transaction Tests Passed):** Executed `scratch/test_engine_transaction_ownership.mjs` against local PostgreSQL 18.6. Verified dedicated client checkout, lock retention, lock contention rejection, and out-of-transaction failure ledger persistence.

---

## 9. Changes Made

| File | Type | Description |
| :--- | :--- | :--- |
| [src/lib/ingestion/engines/ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) | Code Fix | Added dedicated `pg.Client` checkout from pool, explicit `BEGIN;`, `pg_try_advisory_xact_lock` binding, atomic `COMMIT;`, `ROLLBACK;`, client release in `finally`, and out-of-transaction failure ledger persistence. |
| [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) | Script | Created read-only inspection script enclosed in `BEGIN TRANSACTION READ ONLY; ... ROLLBACK;`. |
| [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql) | Script | Created safe rollback DDL that avoids dropping `bgmi_stage_standings` and preserves historical data. |
| `scratch/test_engine_transaction_ownership.mjs` | Test Suite | Created automated suite verifying dedicated client checkout, transaction locking, and failure ledger persistence. |

---

## 10. Tests Run, Results, and Limitations

### 1. Engine Transaction Ownership Suite (`scratch/test_engine_transaction_ownership.mjs`)
- **Target:** Isolated local PostgreSQL 18.6 (`127.0.0.1:5432`, `khelpedia_staging_fresh`)
- **Command:** `node scratch/test_engine_transaction_ownership.mjs`
- **Result:** **4/4 PASSED (100%)**
  - Test 1: Dedicated client writes committed atomically with ledger update (`status: COMMITTED`) — **PASS**
  - Test 2: Advisory lock released automatically upon transaction commit — **PASS**
  - Test 3: Lock contention skips tournament without performing writes (`tournaments: 0`) — **PASS**
  - Test 4: Transaction failure rolls back writes and persists `FAILED` status in ledger — **PASS**

### 2. Real Engine Offline Unit Test Suite (`scratch/test_real_engine_offline.mjs`)
- **Command:** `node scratch/test_real_engine_offline.mjs`
- **Result:** **9/9 PASSED (100%)**
  - Points parsing, bonus telemetry, strict NULL semantics, arithmetic validator, telemetry bounds, quarantine identity detection, and manifest tracking all pass.

### 3. Concurrency Hardening Suite (`scratch/test_concurrency_hardening.mjs`)
- **Command:** `node scratch/test_concurrency_hardening.mjs`
- **Result:** **6/6 PASSED (100%)**
  - Verified mutual exclusion, independent slug concurrency, rollback cleanup, crashed worker disconnect cleanup, rollback mutual exclusion, and cross-batch dependency blocking.

### Limitations
- All database mutation tests were executed against local PostgreSQL 18.6. No tests connected to remote Supabase or production infrastructure.
- Network scraping of `esportsamaze.com` was not executed (fixtures only).

---

## 11. Remaining Blockers

| Blocker ID | Description | Severity | Evidence | Precondition to Clear |
| :--- | :--- | :--- | :--- | :--- |
| **B-01** | Production presence of `entity_source_mapping` table is unverified. | **HIGH** | `schema_provenance.sql` defines the table, but production schema was not queried. `rollback_ingestion_batch()` depends on this table. | Operator executes Section 3 of `production_preflight_inspection.sql` in production. |
| **B-02** | Production table lock impact on `match_teams`. | **MEDIUM** | `ALTER TABLE match_teams` requires `AccessExclusiveLock`. In a high-traffic system, long-running transactions could block. | Operator runs preflight Section 3 to verify relation size and schedules migration in low-traffic window. |
| **B-03** | Existing orphan records in `match_teams`. | **MEDIUM** | If production `match_teams` contains rows not matching canonical `matches` or `valorant_matches`, polymorphic trigger will reject updates. | Operator executes Section 5.1 of preflight script to confirm zero orphan rows. |
| **B-04** | Live network payload format drift. | **LOW** | RSC payload parser validated against offline fixtures only. Upstream structure changes could fail parser. | Perform single-tournament pilot ingestion with canary slug. |

---

## 12. Preconditions for Authorized Read-Only Production Verification

Before an authorized operator connects to production:
1. Operator must obtain read-only credentials (e.g. `SELECT`-only role) with zero `INSERT`, `UPDATE`, `DELETE`, or `ALTER` permissions.
2. Connection string must specify `sslmode=require` and point unambiguously to the target project.
3. Operator must execute `supabase/production_preflight_inspection.sql` inside a single session.
4. Operator must verify:
   - `server_ip` and `database_name` match the production target.
   - `gen_random_uuid()` is confirmed present.
   - `public.entity_source_mapping` exists (`object_exists = true`).
   - Duplicate `(match_id, team_id)` count in `match_teams` is `0`.
   - Cross-game match ID collision count is `0`.
   - Standings equation discrepancy count is `0`.

---

## 13. Preconditions for Migration Approval

Before running [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql):
1. Preflight inspection output must be reviewed and signed off by the lead database architect.
2. If `entity_source_mapping` is absent, deploy [supabase/schema_provenance.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/schema_provenance.sql) first.
3. Execute a physical snapshot / point-in-time recovery backup of the production database.
4. Schedule migration during the lowest traffic window (e.g., 03:00–04:00 UTC).
5. Execute migration wrapped in `BEGIN; ... COMMIT;` with `ON_ERROR_STOP=1`.

---

## 14. Preconditions for Pilot Ingestion

Before running live ingestion:
1. Migration must be successfully committed with triggers active.
2. Single-tournament pilot must be executed manually:
   ```bash
   node scripts/run_ingestion.js esportsamaze --slug=bgms-2026
   ```
3. Inspect `ingestion_batch_ledger` to confirm `status = 'COMMITTED'` and `created_records_count > 0`.
4. Inspect `/bgmi` frontend route to verify standings table renders correctly.
5. Confirm zero records in `quarantine_identities` with critical conflict codes.

---

## 15. Recovery, Backup, Monitoring, and Stop Conditions

### Stop Conditions (Immediate Abort)
- Preflight script detects missing `entity_source_mapping` or duplicate keys in `match_teams`.
- Migration DDL query blocks on table lock for greater than 10 seconds.
- Ingestion worker encounters repeated lock contention or foreign key violation.
- Error rate in `ingestion_batch_ledger` exceeds 0% on canary slug.

### Recovery Runbook
- **DDL Failure:** If migration aborts mid-execution, PostgreSQL automatically rolls back the transaction. If manual cleanup is required, execute [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql). **DO NOT execute the legacy `rollback_bgmi_standings_and_stats.sql`**.
- **Data Ingestion Failure:** If pilot ingestion ingests corrupted data, invoke the atomic batch rollback:
  ```sql
  SELECT public.rollback_ingestion_batch('<batch_id>');
  ```
  This restores tournament pre-update snapshots, purges dependents, deletes created matches/teams, and marks the batch `ROLLED_BACK`.

---

## 16. Final Deployment Gate Checklist

| Gate Item | Evaluation | Evidence & Location |
| :--- | :--- | :--- |
| **Transaction Ownership** | **PASS** | `ESportsAmazeEngine.run` acquires dedicated `client`, `BEGIN`, binds `batchTracker.queryFn`, commits, releases client. Verified in `test_engine_transaction_ownership.mjs` (4/4 passed). |
| **Advisory Lock Key Equivalence** | **PASS** | JS `computeLockKey` and PostgreSQL SQL md5 truncation produce identical 64-bit integer (`-4598245860625749337`). |
| **Advisory Lock Retention** | **PASS** | Verified held for entire transaction duration and freed upon commit/rollback. |
| **Lock Contention Handling** | **PASS** | Contention rejected worker cleanly rolls back client and skips tournament without writing. |
| **Out-of-Transaction Failure Ledger** | **PASS** | Rolled-back batch writes `status = 'FAILED'` to ledger via separate pool query. |
| **Schema Rollback Non-Destructiveness** | **PASS** | `safe_rollback_bgmi_standings_and_stats.sql` drops added columns only; preserves pre-existing standings. |
| **Strict NULL Bonus Points** | **PASS** | Missing bonus points remain `NULL`, not fabricated as `0`. Arithmetic validator enforces `placement + elims + bonus === total`. |
| **Telemetry Bounds Checking** | **PASS** | `DataValidator` rejects kills > 30, survival > 2400s. Table CHECK constraints enforce limits in SQL. |
| **Polymorphic FK Validation** | **PASS** | Trigger validates canonical `matches` and optional `valorant_matches` without breaking Valorant. |
| **Read-Only Preflight Script** | **PASS** | `production_preflight_inspection.sql` wrapped in `BEGIN TRANSACTION READ ONLY; ... ROLLBACK;`. |
| **Production Entity Source Mapping** | **NOT VERIFIED** | Requires authorized operator to run preflight check against live production database. |
| **Live Network Fetching** | **NOT RUN** | Live network requests to `esportsamaze.com` prohibited in this phase. |
| **Production Database Migration** | **NOT RUN** | Production migrations prohibited in this phase. |
