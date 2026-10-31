# KhelPediA BGMI Ingestion — Phase 6: Independent Verification and Production Authorization Gate

**Document Path:** `docs/BGMI_PHASE6_INDEPENDENT_VERIFICATION.md`  
**Auditor Roles:** Independent Senior PostgreSQL Engineer, Backend Reliability Auditor, Production Security Auditor  
**Date:** 2026-10-22  
**Target Repository:** `e:\Projects\KhelPediA\khelpedia`  
**Pipeline:** BGMI Data Ingestion Engine (`ESportsAmazeEngine`)  
**Phase:** Phase 6 — Independent Verification & Final Authorization Audit  

---

## 1. Executive Verdict

### Final Verdict: `CONDITIONAL GO`

```
+---------------------------------------------------------------------------------------------+
|                                    GATE VERDICT: CONDITIONAL GO                             |
+---------------------------------------------------------------------------------------------+
| [X] All code-level transaction ownership and concurrency defects REMEDIATED & VERIFIED     |
| [X] 10/10 Failure Injection & Concurrency Scenarios PASSED on isolated local PostgreSQL    |
| [X] Rollback Data-Loss Risks Audited & Non-Destructive Post-Ingestion Policy Formulated     |
| [X] Production Read-Only Preflight SQL Audited and Confirmed Non-Mutating                  |
| [!] Production Catalog Prerequisite (entity_source_mapping) remains UNVERIFIED in Remote DB|
|                                                                                             |
| Next Action: Authorized Production Operator must execute production_preflight_inspection.sql|
+---------------------------------------------------------------------------------------------+
```

#### Detailed Justification:
1. **Transaction Ownership Proven:** Traced the complete execution path from `scripts/run_ingestion.js` through `ESportsAmazeEngine.run()`, `BatchTracker`, and `IdempotentUpsert`. Dedicated client checkout (`pool.connect()`), explicit transaction boundary (`BEGIN;`), advisory lock retention (`pg_try_advisory_xact_lock`), atomic single-client mutation, atomic rollback on failure, and out-of-transaction failure ledger persistence are **100% verified** by real tests against local PostgreSQL 18.6.
2. **False `COMMITTED` Ledger State Defect Remediated:** Identified and resolved a subtle vulnerability where a database connection failure (`connErr`) could leave `batchTracker.status` as `'IN_PROGRESS'` and inadvertently trigger `batchTracker.commit()` at the end of the run. The engine now explicitly fails the batch upon connection error and requires `totalErrorsCount === 0 && totalTournamentsProcessed > 0` before any batch commit.
3. **Rollback Data-Loss Boundaries Clarified:** Identified that executing any DDL rollback (even the non-destructive `safe_rollback_bgmi_standings_and_stats.sql`) after production ingestion begins will permanently destroy newly ingested columns (`bonus_pts`, `stage_type`, `tiebreaker_rule`, `tiebreaker_note`, `source_attribution_url`) and child tables. Formulated an explicit operational constraint: **Never execute schema DDL rollback after data ingestion begins; use application batch rollback (`rollback_ingestion_batch`) or forward-fix migrations instead.**
4. **Production Independence Preserved:** Zero remote database connections were established, zero live web scraping calls were initiated, zero migrations were executed against remote clusters, and zero uncommitted user modifications were destroyed.

---

## 2. Exact Files and Code Paths Inspected

| File Path | Inspected Functions / Locations | Verification Scope |
| :--- | :--- | :--- |
| [src/lib/ingestion/engines/ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) | `run()` (Lines 23–420) | Client checkout (`activePool.connect()`), `BEGIN`, lock acquisition, write routing, atomic commit, client release in `finally`, out-of-tx failure ledger update. |
| [src/lib/ingestion/BatchTracker.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/BatchTracker.js) | `computeLockKey()` (L37-42), `tryAcquireTournamentLock()` (L48-58), `persistStart()` (L127-139), `commit()` (L141-160), `fail()` (L162-181) | 64-bit BigInt signed integer parity, SQL `pg_try_advisory_xact_lock` execution, manifest durability, error recording. |
| [src/lib/ingestion/IdempotentUpsert.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/IdempotentUpsert.js) | `executeQuery()` (L21-29), `upsertTournament()` (L235-305), `upsertMatch()` (L307-350), `upsertMatchTeam()` (L352-378), `upsertBGMIStageStandings()` (L380-422) | Query delegation to `batchTracker.queryFn`, ensuring zero queries bypass the open transaction. |
| [scripts/run_ingestion.js](file:///e:/Projects/KhelPediA/khelpedia/scripts/run_ingestion.js) | `runIngestion()` (L32-101) | CLI option parsing (`--slug`), engine instantiation, error trapping, exit behavior. |
| [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql) | Lines 1–545 | Polymorphic trigger `check_match_teams_polymorphic_fk`, cascade triggers, table definitions, stored procedure `rollback_ingestion_batch(UUID)`. |
| [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql) | Lines 1–85 | Reversion DDL, column-drop inspection, trigger cleanups, Valorant FK restoration. |
| [supabase/rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql) | Line 27 (`DROP TABLE ... CASCADE`) | Defect analysis: destructive deletion of historical standings table. |
| [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) | Lines 1–185 | Statement-by-statement read-only verification, dynamic SQL inspection, `to_regclass` safety. |
| `scratch/test_phase6_failure_scenarios.mjs` | 10 Scenarios (Lines 1–250) | Failure injection, connection loss, contention, idempotency, rollback race conditions. |

---

## 3. Verified Fixes vs Claims that Remain Unverified

| Claim / Component | Prior Status | Phase 6 Verification Result | Evidence & Location |
| :--- | :--- | :--- | :--- |
| **Transaction Ownership on Single Client** | Flagged as Critical Risk | **PASS (Verified by Test)** | Dedicated `pg.Client` checked out at [ESportsAmazeEngine.js:L109](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L109); `txQueryFn` bound to `batchTracker.queryFn`. All upserts execute on open transaction. |
| **Advisory Lock Retention** | Unverified in Engine | **PASS (Verified by Test)** | Lock acquired on dedicated transaction client; verified held across all writes and released automatically on `COMMIT` or `ROLLBACK`. |
| **Lock Contention Abort** | Assumed | **PASS (Verified by Test)** | Contention detected worker immediately executes `ROLLBACK;`, releases client, performs zero writes, and does not record `COMMITTED`. |
| **Out-of-Transaction Failure Persistence** | Incomplete | **PASS (Verified by Test)** | Failed batch rolls back client transaction, then persists `status = 'FAILED'` to ledger via separate pool query ([ESportsAmazeEngine.js:L381-L389](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L381-L389)). |
| **Connection Failure False-Commit Prevention** | Vulnerable | **PASS (Remediated & Verified)** | `connErr` sets `batchTracker.status = 'FAILED'`. Line 400 requires `totalErrorsCount === 0 && totalTournamentsProcessed > 0` before any batch commit. |
| **Guaranteed Client Socket Release** | Unverified | **PASS (Verified by Test)** | `finally` blocks in [ESportsAmazeEngine.js:L373-L377](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L373-L377) and [L390-L397](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js#L390-L397) guarantee socket is returned to pool even if rollback fails. |
| **Remote Production Object Presence** | Unverified | **UNVERIFIED (Prohibited)** | Direct connection to production is prohibited. Presence of `entity_source_mapping` and production table sizes must be confirmed by authorized operator via preflight SQL. |
| **Live Upstream Scraping Stability** | Unverified | **NOT RUN (Prohibited)** | Network requests to `esportsamaze.com` prohibited in this phase. Verified against synthetic offline RSC fixtures. |

---

## 4. Failure-Injection Test Results (10 Scenarios)

The failure injection suite was executed against local PostgreSQL 18.6 (`127.0.0.1:5432 / khelpedia_staging_fresh / bgmi_staging`):
**Command:** `node scratch/test_phase6_failure_scenarios.mjs`  
**Exit Code:** `0`  
**Score:** **10/10 PASSED (100%)**

```
================================================================
KhelPediA BGMI Ingestion — Phase 6 Failure Injection Audit Suite
================================================================

✅ Scenario 1: Failure before lock acquisition — PASS (Tournaments created: 0, Batch status: FAILED)
✅ Scenario 2: Lock contention skips tournament without writes — PASS (Tournaments written: 0, Batch status: FAILED)
✅ Scenario 3: Failure after first mutation triggers complete rollback — PASS (Tournament row survived: false, Ledger status: FAILED)
✅ Scenario 4: Failure immediately before commit rolls back all writes — PASS (Tournament survived: false, Ledger status: FAILED)
✅ Scenario 5: Connection loss cleans up transaction and advisory lock — PASS (Tournament survived: false, Lock freed: true)
✅ Scenario 6: Failure while recording failure status handles gracefully — PASS (Exception caught cleanly, status: FAILED)
✅ Scenario 7: Concurrent workers on same tournament mutually excluded — PASS (Worker 1 acquired: true, Worker 2 contention rejected: true)
✅ Scenario 8: Cross-source entity conflict resolved to same canonical entity without duplicates — PASS (Canonical ID matched: true, Team count: 1, Mapping count: 2)
✅ Scenario 9: Rollback holds advisory lock preventing concurrent ingestion race — PASS (Concurrent ingestion locked out during rollback: true)
✅ Scenario 10: Repeated execution of same batch is strictly idempotent — PASS (Matched UUID: true, Total rows in DB: 1)

================================================================
PHASE 6 FAILURE SCENARIO AUDIT: 10/10 PASSED
================================================================
```

### Scenario Breakdown & Evidence:
1. **Failure Before Lock Acquisition:** Invalid tournament payload rejected by `DataValidator`. Zero database connections opened in transaction mode, zero rows inserted into `tournaments`, ledger cleanly marked `FAILED`.
2. **Lock Contention:** Competing worker holds `pg_try_advisory_xact_lock`. Engine attempts acquisition, receives `acquired = false`, rolls back dedicated client, releases socket, skips tournament, zero rows inserted.
3. **Failure After First Mutation (Atomic Rollback):** Tournament inserted successfully into `tournaments`. Standings upsert forced to fail with simulated SQL corruption. Dedicated client issued `ROLLBACK;`. Query verified tournament was **completely wiped** from `tournaments`. Zero partial writes survived. Ledger recorded `FAILED`.
4. **Failure Immediately Before Commit:** All mutations succeeded in transaction. Simulated crash before `COMMIT;`. Verified transaction was rolled back by PostgreSQL; zero rows survived in database.
5. **Connection Loss During Transaction:** Worker opened transaction, acquired lock, inserted tournament, then executed abrupt socket termination (`dropClient.end()`). Verified PostgreSQL cleaned up uncommitted data and freed advisory lock immediately.
6. **Failure While Recording Batch Failure Status:** Simulated secondary database error during `batchTracker.fail()`. Caught cleanly; engine logged error without crashing unhandledly.
7. **Two Concurrent Ingestion Workers (Same Slug):** Worker 1 acquired lock; Worker 2 was rejected by `pg_try_advisory_xact_lock` and skipped.
8. **Cross-Source Entity Conflict:** Source A (`esportsamaze`) and Source B (`liquipedia`) ingested teams with identical slug `shared-team`. Canonical `teams` row created once; two distinct mappings created in `entity_source_mapping`. Zero duplicate teams created.
9. **Rollback Racing Ingestion:** Stored procedure `rollback_ingestion_batch` acquired `pg_advisory_xact_lock` and locked batch ledger row `FOR UPDATE`. Competing ingestion worker locked out.
10. **Repeated Execution (Idempotency):** Re-running identical batch returned exact same tournament UUID and produced zero duplicate rows.

---

## 5. Rollback Data-Loss Assessment

### Detailed Column & Table Inventory

| Object | Type | Pre-existed Migration? | Data Loss on DDL Rollback | Recovery Recommendation |
| :--- | :---: | :---: | :--- | :--- |
| `public.bgmi_stage_standings` | Table | **YES** (from `schema_bgmi.sql`) | **CATASTROPHIC** in original rollback script (`DROP TABLE CASCADE` destroys all historical standings). | **REMEDIATED:** Original script replaced with safe rollback script. |
| `bgmi_stage_standings.bonus_pts` | Column | **NO** (Added by migration) | **HIGH:** All bonus points ingested after migration will be permanently deleted. | Do not drop column post-ingestion. Forward-fix schema if deprecated. |
| `bgmi_stage_standings.stage_type` | Column | **NO** (Added by migration) | **MEDIUM:** Stage categorization ('overall', 'league', 'finals') deleted. | Archive data prior to DDL change. |
| `bgmi_stage_standings.tiebreaker_rule` | Column | **NO** (Added by migration) | **MEDIUM:** Tiebreaker justification strings deleted. | Archive data prior to DDL change. |
| `bgmi_stage_standings.tiebreaker_note` | Column | **NO** (Added by migration) | **LOW:** Supplementary notes deleted. | Archive data prior to DDL change. |
| `bgmi_stage_standings.source_attribution_url`| Column | **NO** (Added by migration) | **LOW:** Provenance URL deleted. | Preserved in `entity_source_mapping`. |
| `public.match_player_stats` | Table | **NO** (Added by migration) | **HIGH:** All per-match player kills, damage, and survival telemetry deleted. | Use batch rollback (`rollback_ingestion_batch`) instead of DDL drop. |
| `public.tournament_player_stats` | Table | **NO** (Added by migration) | **HIGH:** All tournament aggregate player stats deleted. | Use batch rollback instead of DDL drop. |
| `public.tournament_rosters` | Table | **NO** (Added by migration) | **HIGH:** All tournament player-team rosters deleted. | Use batch rollback instead of DDL drop. |
| `public.ingestion_batch_ledger` | Table | **NO** (Added by migration) | **CRITICAL:** Audit trail and batch manifests permanently deleted. | Never drop in production. |
| `public.quarantine_identities` | Table | **NO** (Added by migration) | **HIGH:** Ambiguity queue and conflict records deleted. | Never drop in production. |

### Operational Rule: DDL Rollback vs Batch Rollback
- **DDL Rollback Script (`safe_rollback_bgmi_standings_and_stats.sql`):** Safe to run **ONLY** if the forward migration aborts during deployment before any ingestion runs.
- **Application Batch Rollback (`rollback_ingestion_batch(UUID)`):** Safe to run **AT ANY TIME** after ingestion. Purges specific bad data from a batch, restores snapshot values for pre-existing entities, and preserves the schema, other batches, and all historical data.

---

## 6. Preflight SQL Safety Assessment

Inspected [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) statement-by-statement:

1. **Transaction Safety:** Enclosed in `BEGIN TRANSACTION READ ONLY; ... ROLLBACK;`. Zero database mutations can occur under any failure condition.
2. **Catalog Queries:** Uses `to_regclass(target_object) IS NOT NULL` across all 16 inspected objects. If an optional relation (`valorant_matches`, `entity_source_mapping`) does not exist, the script returns `false` without throwing an error.
3. **Dynamic SQL Execution:** Integrity checks in Section 5 use `DO $$ ... EXECUTE ... $$` guarded by `IF v_has_match_teams AND v_has_matches`. Statements targeting missing tables are skipped, preventing premature abortion.
4. **Credential Isolation:** The script queries `current_database()`, `current_user`, `version()`, and `inet_server_addr()`. It does not query `pg_shadow`, connection strings, or encrypted secrets.
5. **Real Count Reporting:** All orphan, duplicate, and collision checks use `SELECT COUNT(*)` on actual relations, returning real integer tallies.

---

## 7. Schema and Valorant Compatibility Findings

1. **Shared `public.match_teams` Polymorphism:**
   - Relaxed constraints: `won`, `rounds_won`, `rounds_played`, and `num_points` converted from `NOT NULL` to nullable with defaults.
   - Battle Royale columns added: `source_result_id`, `placement`, `kills`, `placement_points`, `elimination_points`, `wwcd`.
   - Hard FK dropped: `match_teams_match_id_fkey` removed to allow both UUID and text keys.
   - Validation Trigger: `check_match_teams_polymorphic_fk()` validates that `match_id` exists in canonical `matches` OR in `valorant_matches`. If `match_id` belongs to canonical BGMI, it validates `team_id` against canonical `teams`.
   - Cascade Maintenance: Separate triggers on `matches`, `teams`, and `valorant_matches` delete corresponding `match_teams` rows upon deletion of the parent, maintaining strict relational integrity.
2. **Valorant Application Query Compatibility:**
   - Existing Valorant queries in `src/app/actions/valorant.js` select standard Valorant columns (`match_id`, `team_id`, `won`, `rounds_won`, `rounds_played`, `num_points`). All columns, types, and primary key `(match_id, team_id)` remain fully intact and backward-compatible.
3. **`entity_source_mapping` Prerequisite:**
   - Stored procedure `rollback_ingestion_batch()` lines 512–514 execute `DELETE FROM public.entity_source_mapping WHERE (metadata->>'import_batch_id') = p_batch_id::text;`.
   - If `entity_source_mapping` does not exist in production, creating the stored procedure will fail. `schema_provenance.sql` must be deployed if preflight reports `object_exists = false`.

---

## 8. Remaining Blockers and Severity

| Blocker ID | Severity | Description | Precondition to Resolve |
| :--- | :---: | :--- | :--- |
| **B-01** | **HIGH** | Production presence of `public.entity_source_mapping` is UNVERIFIED. | Authorized operator runs Section 3 of `production_preflight_inspection.sql` in production. |
| **B-02** | **MEDIUM** | `ALTER TABLE match_teams` acquires `AccessExclusiveLock`. In high-traffic systems, this could block concurrent reads. | Operator checks relation size via preflight Section 3 and schedules migration during maintenance window. |
| **B-03** | **MEDIUM** | Potential orphan rows in production `match_teams` before polymorphic trigger attach. | Operator checks Section 5.1 of preflight SQL to confirm orphan count is 0. |

---

## 9. Requirements for Authorized Read-Only Production Verification

1. Operator must obtain read-only production connection credentials.
2. Operator must execute `supabase/production_preflight_inspection.sql`.
3. Operator must verify and record:
   - `database_name` and `server_ip` match the intended target.
   - `gen_random_uuid()` is callable natively.
   - `public.entity_source_mapping` reports `object_exists: true`.
   - Section 5.1 (Orphaned `match_teams` count) is `0`.
   - Section 5.2 (Duplicate `(match_id, team_id)` count) is `0`.
   - Section 5.4 (Cross-game match ID collisions) is `0`.

---

## 10. Requirements for Migration Approval

1. Review and sign-off on preflight inspection outputs by Lead Database Architect.
2. If `entity_source_mapping` is absent, deploy `supabase/schema_provenance.sql` first.
3. Complete full physical backup (Supabase PITR snapshot or `pg_dump -Fc`).
4. Schedule migration window during lowest platform traffic.
5. Execute `supabase/proposed_migration_bgmi_standings_and_stats.sql` in a single transaction with `ON_ERROR_STOP=1`.

---

## 11. Requirements for Canary Pilot Ingestion

1. Migration committed successfully with triggers active.
2. Run single-tournament canary pilot:
   ```bash
   node scripts/run_ingestion.js esportsamaze --slug=bgms-2026
   ```
3. Query `ingestion_batch_ledger` to confirm `status = 'COMMITTED'` and `created_records_count > 0`.
4. Inspect `/bgmi` frontend route to verify standings table and scorecard components render without errors.
5. Verify `quarantine_identities` table has zero critical conflict records.

---

## 12. Recovery and Stop Conditions

### Stop Conditions (Immediate Abort)
- Preflight script detects missing `entity_source_mapping`, orphan rows, or primary key collisions.
- Migration DDL blocks on lock wait for greater than 10 seconds.
- Ingestion worker encounters foreign key violation or lock contention timeout.
- Ingestion ledger records `status = 'FAILED'`.

### Recovery Protocol
- **During Migration:** If migration aborts, transaction rolls back automatically. If manual cleanup is required, run `supabase/safe_rollback_bgmi_standings_and_stats.sql`. **Never run legacy `rollback_bgmi_standings_and_stats.sql`**.
- **After Ingestion:** If pilot data is corrupted, execute atomic batch rollback:
  ```sql
  SELECT public.rollback_ingestion_batch('<batch_id>');
  ```
  This restores tournament snapshots, purges batch-inserted rows, and marks the batch `ROLLED_BACK`.

---

## 13. Final Decision and Authorization Sign-off

### Verdict: `CONDITIONAL GO`

All code-level transaction ownership, advisory locking, concurrency, and rollback safety blockers have been remediated, verified, and proven by 10/10 failure scenario tests. Deployment to production is **CONDITIONALLY APPROVED** subject to the completion and sign-off of the authorized read-only preflight inspection ([supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql)).
