# Phase 8: Gate 1 Results Review & Gate 2 Migration Readiness Audit — KhelPediA BGMI

**Role:** Senior PostgreSQL DBA, Database Migration Engineer & Production Reliability Auditor  
**Date:** 2026-10-22  
**Database Target Engine:** PostgreSQL 15+ (Production Supabase / Managed PostgreSQL)  
**Target Migration Scripts:**
- `supabase/proposed_migration_bgmi_standings_and_stats.sql`
- `supabase/schema_provenance.sql`
- `supabase/production_preflight_inspection.sql`
- `supabase/safe_rollback_bgmi_standings_and_stats.sql`
- `supabase/rollback_bgmi_standings_and_stats.sql`  
**Execution Context:** Strictly static code analysis, local staging test verification, and operator preflight readiness audit. **NO PRODUCTION CONNECTION OR SQL EXECUTION AUTHORIZED.**

---

## 1. Executive Verdict: CONDITIONAL GO

| Gate | Assessment | Verdict | Rationale |
| :--- | :--- | :--- | :--- |
| **Gate 1** | Production Preflight Evidence | **NOT VERIFIED** | The actual redacted operator log from production execution has not yet been submitted into the repository. Local staging passed all 10/10 preflight checks, but production schema/data integrity remains unverified until the operator runs and provides the log. |
| **Gate 2** | Migration SQL & Schema Readiness | **CONDITIONAL GO** | The migration DDL, upgrade logic, transaction safety, idempotent triggers, foreign key integrity, and batch rollback stored procedures are statically verified and fully hardened. Migration execution is approved to proceed **ONLY AFTER** Gate 1 production preflight log is reviewed and physical backup snapshot is certified. |
| **Gate 3** | Pilot Canary Ingestion Gate | **SEPARATELY BLOCKED** | This audit explicitly does **NOT** authorize live canary ingestion. Canary execution remains gated on post-migration schema verification, explicit operator tournament selection, and separate executive authorization. |

### Summary of Conditions for Gate 2 Advancement
1. **Operator Preflight Output Submission:** The operator must run [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) in production, save the output, redact sensitive hostnames/credentials, and commit or supply the log for DBA sign-off.
2. **Prerequisite Execution Order:** If Gate 1 Check 3 reveals `public.entity_source_mapping` is absent, [supabase/schema_provenance.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/schema_provenance.sql) must be applied immediately prior to the main migration.
3. **Physical Snapshot Certification:** Named DBA must verify a point-in-time recovery (PITR) or storage snapshot taken within 15 minutes of the migration window.
4. **Maintenance Lock Timeout:** The migration must be executed with `SET lock_timeout = '5s';` during off-peak hours to prevent `AccessExclusiveLock` on `public.match_teams` from queueing behind long-running Valorant queries.

---

## 2. Gate 1 Evidence & Production Verification Status

### Status: NOT VERIFIED (Operator Evidence Pending)

In accordance with strict production audit rules, a Phase 7 rehearsal, local test report, or claimed pass **cannot substitute for actual operator output**.

- **Repository Search Status:** A thorough inspection of the repository root, `supabase/`, `scratch/`, and `docs/` directories reveals that no production execution output (e.g., `preflight_execution.log`) has been committed or provided by the operator.
- **Audit Decision:** All Gate 1 production verification items are formally classified as **NOT VERIFIED**. We do not assume passing status.

### Minimum Evidence Required from Operator to Clear Gate 1
The operator must provide the terminal/log output from executing `production_preflight_inspection.sql` containing:
1. Environment verification (Check 1): Redacted database name, server version string, current session user, and confirmation that `transaction_read_only = on`.
2. Effective privileges (Check 2): Confirmation of `has_table_privilege` for tables `matches`, `teams`, `tournaments`, `match_teams`.
3. Existence checks (Check 3 & 4): `to_regclass` returns for `public.entity_source_mapping` and confirmation of `gen_random_uuid()` availability.
4. Data integrity counts (Checks 5–10): Output numbers for orphaned `match_teams`, duplicate `(match_id, team_id)`, cross-game match collisions, standings duplicates, and source identity conflicts. All must return `0 rows` or explicit count `0`.

---

## 3. Gate 1 Inspection Results Matrix

The table below contrasts **Local Staging Verification Evidence** (tested against isolated PostgreSQL 18.6 `khelpedia_staging_fresh`) against **Production Verification Status**.

| Check # | Inspection Category | Test Query Target | Local Staging Evidence | Production Status | Action Required If Failed on Prod |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Check 1** | Session & DB Identity | `current_database()`, `transaction_read_only` | PASS (`read_only=on`) | **NOT VERIFIED** | Verify connection string; ensure read-only session before running. |
| **Check 2** | User Write Privileges | `has_table_privilege` on core tables | PASS (granted) | **NOT VERIFIED** | Check role permissions; migration requires DDL admin (`postgres` or `supabase_admin`). |
| **Check 3** | Relation Existence | `to_regclass` for 10 tables | PASS (core tables present) | **NOT VERIFIED** | If `entity_source_mapping` is missing, schedule `schema_provenance.sql`. |
| **Check 4** | Extension Availability | `gen_random_uuid()` execution | PASS (native PG 13+) | **NOT VERIFIED** | If missing, enable `pgcrypto` or upgrade PostgreSQL. |
| **Check 5** | Orphaned `match_teams` | `SELECT ... LEFT JOIN matches/teams WHERE id IS NULL` | PASS (0 orphans) | **NOT VERIFIED** | Cleanse or backfill parent records before migration; polymorphic trigger will reject existing orphans. |
| **Check 6** | Duplicate Match Teams | `SELECT match_id, team_id HAVING COUNT(*) > 1` | PASS (0 duplicates) | **NOT VERIFIED** | Deduplicate rows prior to migration; `match_teams_match_team_unique` will fail. |
| **Check 7** | Cross-Game Collisions | `SELECT m.id ... JOIN matches o ON m.id = o.id` | PASS (0 collisions) | **NOT VERIFIED** | Re-key colliding matches; UUID collision indicates critical data corruption. |
| **Check 8** | Standings Duplicates | `bgmi_stage_standings (tournament_id, stage_id, team_id)` | PASS (0 duplicates) | **NOT VERIFIED** | Run deduplication query keeping most recent `created_at`. |
| **Check 9** | Standings Orphans | `bgmi_stage_standings` parent FK references | PASS (0 orphans) | **NOT VERIFIED** | Nullify or drop invalid stage rows before applying FK constraints. |
| **Check 10**| Duplicate Source Mappings | `entity_source_mapping (source_name, entity_type, source_id)` | PASS (0 duplicates) | **NOT VERIFIED** | Retain canonical mapping; delete duplicate stale bindings. |

---

## 4. Independent Migration SQL Inspection

Static analysis performed on [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql), [supabase/schema_provenance.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/schema_provenance.sql), [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql), and [supabase/rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql).

### 4.1 Safety for Existing Production Schema and Data
- **Evidence:** `proposed_migration_bgmi_standings_and_stats.sql` lines 27–43.
- **Finding:** The migration safely inspects existing constraints using `pg_constraint` prior to dropping:
  ```sql
  DO $$
  BEGIN
      IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'match_teams_team_id_fkey'
            AND conrelid = 'public.match_teams'::regclass
      ) THEN
          ALTER TABLE public.match_teams DROP CONSTRAINT match_teams_team_id_fkey;
      END IF;
  END $$;
  ```
- **Verdict:** Safe. Existing Valorant rows with `team_id` referencing `public.teams(id)` are preserved. Dropping the hard foreign key is required to allow polymorphic references (`teams` for Valorant vs `bgmi_teams` for BGMI), enforced safely via trigger.

### 4.2 Necessity and Correctness of New Objects
- **Tables:** `ingestion_batch_ledger` (line 45), `ingestion_batch_manifest` (line 72). Necessary for atomic batch tracking, failure diagnostics, and out-of-band manifest auditing.
- **Triggers & Functions:**
  - `fn_validate_match_team_polymorphic()` (lines 142–186): Validates parent tournament game type (`valorant` vs `bgmi`) and checks presence in `public.teams` or `public.bgmi_teams`. Correctly rejects orphans with informative error codes.
  - `trg_validate_match_team_polymorphic` (lines 190–193): Executes `BEFORE INSERT OR UPDATE ON public.match_teams FOR EACH ROW`.
  - `fn_prevent_committed_ledger_mutation()` (lines 100–120): Enforces append-only immutable semantics on committed batch records.
  - `rollback_ingestion_batch()` (lines 438–546): Stored procedure allowing clean surgical rollback of specific batch manifests without touching concurrent batches.
- **Indexes:** All indexes (`idx_match_teams_team_id`, `idx_bgmi_stage_standings_tournament`, etc.) use B-Tree indexes on queried foreign keys.
- **Verdict:** All objects are directly justified by ingestion integrity requirements and correctly typed.

### 4.3 Compatibility with Existing BGMI Standings and Valorant Records
- **Evidence:** `proposed_migration_bgmi_standings_and_stats.sql` lines 152–176.
- **Finding:** The polymorphic validation trigger inspects tournament `game`:
  ```sql
  IF v_game = 'valorant' THEN
      IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = NEW.team_id) THEN
          RAISE EXCEPTION 'Foreign key violation: team_id % not found in public.teams for Valorant match %', NEW.team_id, NEW.match_id;
      END IF;
  ELSIF v_game = 'bgmi' THEN
      IF NOT EXISTS (SELECT 1 FROM public.bgmi_teams WHERE id = NEW.team_id) THEN
          RAISE EXCEPTION 'Foreign key violation: team_id % not found in public.bgmi_teams for BGMI match %', NEW.team_id, NEW.match_id;
      END IF;
  ```
  If `v_game` is NULL (legacy unclassified matches), it verifies presence in either `teams` or `bgmi_teams`.
- **Verdict:** 100% backward compatible with existing Valorant records and queries.

### 4.4 Handling Existing Rows That Might Violate New Constraints
- **Evidence:** `proposed_migration_bgmi_standings_and_stats.sql` lines 272–280.
- **Finding:** Unique constraint `bgmi_stage_standings_tournament_stage_team_unique` is added directly. If duplicate standings exist prior to migration, `ALTER TABLE ... ADD CONSTRAINT` will abort.
- **Mitigation:** Preflight Check 8 explicitly inspects for duplicate rows beforehand.

### 4.5 `CREATE TABLE IF NOT EXISTS` Supplemented by Column Upgrade Logic
- **Evidence:** `proposed_migration_bgmi_standings_and_stats.sql` lines 216–250.
- **Finding:** Unlike naive migrations that leave pre-existing tables un-altered, this migration explicitly supplements `CREATE TABLE IF NOT EXISTS` with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`:
  ```sql
  CREATE TABLE IF NOT EXISTS public.bgmi_stage_standings ( ... );
  -- Upgrade logic for pre-existing tables:
  ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS bonus_pts integer DEFAULT 0;
  ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS stage_type varchar(50) DEFAULT 'overall';
  ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS stage_name varchar(100);
  ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS rank_change integer DEFAULT 0;
  ```
- **Verdict:** Resilient against environments where a basic version of `bgmi_stage_standings` already exists from legacy scripts.

### 4.6 Rerun Safety (Idempotence)
- **Evidence:** Entire file uses `IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`, `CREATE OR REPLACE FUNCTION`, and conditional `DO $$ ... END $$` blocks for constraint creation.
- **Verdict:** Safe to rerun multiple times without schema corruption.

### 4.7 Transaction Support and Statement Compatibility
- **Evidence:** Zero instances of `CREATE INDEX CONCURRENTLY`, `VACUUM`, `CREATE DATABASE`, or `ALTER SYSTEM`.
- **Verdict:** Every statement in `proposed_migration_bgmi_standings_and_stats.sql` can safely execute inside a single transactional block (`BEGIN; ... COMMIT;`).

### 4.8 Lock Contention and Production Blocking Risks
- **Evidence:** Lines 33–42 (`ALTER TABLE public.match_teams DROP CONSTRAINT ...`), lines 298–304 (`ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS ...`).
- **Risk Analysis:** `ALTER TABLE` acquires an `AccessExclusiveLock` on `public.match_teams`. While dropping a constraint and adding nullable columns with metadata defaults is instantaneous in PostgreSQL 11+, acquiring the lock requires waiting for all active queries against `match_teams` to finish. If long-running analytical queries are active, the migration could block subsequent reads/writes.
- **Operational Requirement:** The execution script **must** specify `SET lock_timeout = '5s';` so that the migration fails fast rather than queueing production web requests.

### 4.9 `schema_provenance.sql` Requirement and Ordering
- **Evidence:** [supabase/schema_provenance.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/schema_provenance.sql) lines 13–24.
- **Finding:** `proposed_migration_bgmi_standings_and_stats.sql` stored procedure `rollback_ingestion_batch` (line 512) and ingestion runner `IdempotentUpsert.js` (line 120) depend on `public.entity_source_mapping`.
- **Ordering Rule:** `schema_provenance.sql` **MUST** be verified or applied prior to `proposed_migration_bgmi_standings_and_stats.sql`.

### 4.10 Ingestion Dependencies on Migration Objects
- **Evidence:** [src/lib/ingestion/engines/ESportsAmazeEngine.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/engines/ESportsAmazeEngine.js) lines 112, 175, 230; [src/lib/ingestion/BatchTracker.js](file:///e:/Projects/KhelPediA/khelpedia/src/lib/ingestion/BatchTracker.js) lines 30, 85.
- **Finding:** The application code relies on `ingestion_batch_ledger`, `ingestion_batch_manifest`, and the new columns on `match_teams` (`placement`, `kills`, `score`, `mvp`). Running the engine without the migration will fail immediately.

---

## 5. Schema and Data Compatibility Findings

1. **Polymorphic Match Teams Constraint:**
   The removal of `match_teams_team_id_fkey` and installation of `trg_validate_match_team_polymorphic` provides strict referential integrity without schema fragmentation. Valorant teams must exist in `public.teams`; BGMI teams must exist in `public.bgmi_teams`.
2. **Column Nullability Safety:**
   All newly added columns on `public.match_teams` (`placement`, `kills`, `score`, `mvp`, `mvp_player_id`, `details`) are nullable or have sensible defaults. No existing Valorant rows will fail null constraints.
3. **Rollback Script Isolation:**
   - [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql) safely restores `match_teams_team_id_fkey` with `NOT VALID` initially to avoid scanning millions of rows under lock, followed by `VALIDATE CONSTRAINT`.
   - Legacy script [supabase/rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/rollback_bgmi_standings_and_stats.sql) contains `DROP TABLE ... CASCADE` which is **strictly forbidden in production**; the safe rollback script must always be used instead.

---

## 6. Backup & Disaster Recovery Checklist

Before applying any migration to production, the authorized operator must review and confirm the following checklist:

| Checklist Item | Description & Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **BR-01: Snapshot Creation** | A full physical backup or Supabase Point-in-Time Recovery (PITR) snapshot exists. | Managed console confirmation / CLI snapshot ID | **REQUIRED BEFORE EXEC** |
| **BR-02: Target Compatibility** | Snapshot covers PostgreSQL 15+ managed instance containing `public` schema. | Confirm database cluster ID and timestamp | **REQUIRED BEFORE EXEC** |
| **BR-03: Scope Completeness** | Backup includes tables `matches`, `teams`, `tournaments`, `match_teams`, `bgmi_*`. | Validate logical/physical catalog inclusion | **REQUIRED BEFORE EXEC** |
| **BR-04: Credential Readiness** | Restoration credentials and management dashboard access verified for on-call DBA. | Operator authentication check | **REQUIRED BEFORE EXEC** |
| **BR-05: Procedure Tested** | Disaster recovery procedure tested in staging within the last 90 days. | Drill audit log reference | **REQUIRED BEFORE EXEC** |
| **BR-06: RPO / RTO Defined** | Recovery Point Objective $\le$ 15 min; Recovery Time Objective $\le$ 30 min. | Documented SLA agreement | **CONFIRMED** |
| **BR-07: Incident Commander** | Named operator designated to coordinate abort, rollback, or restore. | Operator identity recorded | **REQUIRED BEFORE EXEC** |

### Rollback Strategy Taxonomy: When to Use Which Method

```
                                  [ Incident Detected ]
                                             │
                  ┌──────────────────────────┴──────────────────────────┐
                  ▼                                                     ▼
     [ Migration Phase Failure ]                               [ Post-Ingestion Failure ]
  (DDL error during execution window)                       (Corrupted data / pipeline bug)
                  │                                                     │
                  ▼                                                     ▼
     ┌─────────────────────────┐                           ┌─────────────────────────┐
     │ 1. Transaction Abort    │                           │ 3. Batch Ledger Rollback│
     │    Automatic `ROLLBACK;`│                           │    Call stored proc:    │
     │    No schema change.    │                           │    rollback_ingestion_  │
     └────────────┬────────────┘                           │    batch(p_batch_id)    │
                  │                                        └────────────┬────────────┘
         If partially applied:                                          │
                  ▼                                        If schema bug requires fix:
     ┌─────────────────────────┐                                        ▼
     │ 2. Non-Destructive DDL  │                           ┌─────────────────────────┐
     │    Rollback             │                           │ 4. Forward-Fix Migration│
     │    safe_rollback_*.sql  │                           │    Apply corrective DDL │
     │    Restores FK / drops  │                           │    DO NOT DROP TABLES!  │
     │    unpopulated tables.  │                           └────────────┬────────────┘
     └─────────────────────────┘                                        │
                                                           Catastrophic failure only:
                                                                        ▼
                                                           ┌─────────────────────────┐
                                                           │ 5. PITR Backup Restore  │
                                                           │    Full database restore│
                                                           │    to pre-migration point│
                                                           └─────────────────────────┘
```

> [!CAUTION]
> **Never drop newly populated tables as routine recovery:** If bad BGMI data is ingested after migration, **DO NOT run DDL rollback or DROP TABLE**. Running DDL rollback deletes table structures and permanently destroys valid data. Use `SELECT rollback_ingestion_batch('<batch_id>');` to surgically remove bad rows using the batch manifest.

---

## 7. Proposed Migration Runbook (Gate 2 Execution)

> [!IMPORTANT]
> **THIS RUNBOOK IS FOR FUTURE AUTHORIZED EXECUTION ONLY.**  
> Do not execute these commands during Phase 8.

### 7.1 Preconditions
- [ ] Gate 1 Preflight Inspection output reviewed and signed off with 0 errors.
- [ ] Physical backup snapshot verified (BR-01 to BR-07 completed).
- [ ] Low-traffic maintenance window established (recommended: 02:00–04:00 IST).
- [ ] Operator connected via psql with `ON_ERROR_STOP=1`.

### 7.2 Execution Steps

#### Step 1: Prerequisite Migration (If Check 3 indicated missing `entity_source_mapping`)
```bash
psql "$PROD_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -X \
  -f supabase/schema_provenance.sql \
  2>&1 | tee -a migration_provenance_$(date +%Y%m%d_%H%M%S).log
```

#### Step 2: Primary BGMI Standings & Stats Migration
Execute within a single transaction wrapped with a strict lock timeout:
```bash
psql "$PROD_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -X \
  -c "SET lock_timeout = '5s';" \
  -f supabase/proposed_migration_bgmi_standings_and_stats.sql \
  2>&1 | tee -a migration_bgmi_$(date +%Y%m%d_%H%M%S).log
```

#### Step 3: Post-Migration Schema Verification Query
Immediately verify new relation existence and trigger attachment:
```sql
SELECT 
    c.relname AS object_name,
    c.relkind AS object_type
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('ingestion_batch_ledger', 'ingestion_batch_manifest', 'bgmi_stage_standings', 'bgmi_player_match_stats')
UNION ALL
SELECT 
    tgname AS object_name,
    'trigger' AS object_type
FROM pg_trigger
WHERE tgname = 'trg_validate_match_team_polymorphic';
```
*Expected Result:* 5 rows returned.

#### Step 4: Existing Valorant Query Regression Check
Verify that Valorant match querying functions without error:
```sql
SELECT m.id, m.name, mt.team_id, t.name AS team_name
FROM public.matches m
JOIN public.match_teams mt ON mt.match_id = m.id
JOIN public.teams t ON t.id = mt.team_id
JOIN public.tournaments tr ON tr.id = m.tournament_id
WHERE tr.game = 'valorant'
LIMIT 5;
```
*Expected Result:* Successful return of existing Valorant match rows without schema errors.

### 7.3 Stop Conditions & Immediate Abort Criteria
Halt execution and abort if any of the following occur:
1. Lock timeout error (`canceling statement due to lock timeout`): Do not retry immediately; inspect `pg_stat_activity` for blocking transactions.
2. Unique constraint violation on `bgmi_stage_standings_tournament_stage_team_unique`: Abort transaction; deduplicate standings prior to retrying.
3. Network disconnection during migration: Run `SELECT * FROM pg_stat_activity WHERE query LIKE '%proposed_migration%';` to determine if backend transaction aborted or committed.

---

## 8. Separate Canary-Ingestion Approval Gate (Gate 3 Requirements)

Approval of Gate 2 (Database Migration) **does not** authorize Gate 3 (Canary Ingestion). Gate 3 requires separate executive authorization and fulfillment of the following prerequisites:

1. **Gate 2 Post-Migration Verification:** Confirmation that all tables, columns, indexes, and triggers exist in production.
2. **Transaction & Advisory Lock Integrity:** Verified adherence to the dedicated client checkout and `pg_try_advisory_xact_lock` pattern implemented in `ESportsAmazeEngine.js`.
3. **Approved Data Source & Permission:** Verified license/authorization to ingest from the external esports data source.
4. **Explicit Single-Tournament Selection:** The operator must explicitly designate **one** tournament identifier for the canary run (e.g., pilot tournament designated in writing; do not default or assume `bgms-2026`).
5. **Dry-Run Mode Execution First:** Execute the canary runner with `--dry-run` to log parsed manifests without issuing SQL mutations.
6. **Telemetry & Ledger Verification:** Post-canary confirmation that:
   - `ingestion_batch_ledger` contains exactly 1 record with status `COMMITTED`.
   - `ingestion_batch_manifest` contains checksums and row counts.
   - 0 quarantined rows in `ingestion_batch_manifest` with error status.
   - UI leaderboard displays accurate standings, match scores, and player statistics for the pilot tournament.

---

## 9. Outstanding Blockers & Severity Matrix

| Blocker ID | Description | Severity | Resolution Requirement |
| :--- | :--- | :--- | :--- |
| **B-01** | **Gate 1 Production Preflight Evidence Missing:** Operator has not provided the redacted execution log of `production_preflight_inspection.sql`. | **HIGH** | Operator must execute the read-only preflight script against production and supply the redacted log. |
| **B-02** | **Physical Backup Snapshot Uncertified:** Production recovery snapshot not yet verified for the scheduled migration window. | **HIGH** | Operator/DBA must generate and record PITR snapshot ID prior to DDL execution. |
| **B-03** | **Lock Contention on `match_teams`:** DDL on high-traffic table requires `AccessExclusiveLock`. | **MEDIUM** | Migration runbook specifies `SET lock_timeout = '5s';` during an off-peak maintenance window. |

---

## 10. Exact Next Decisions Required from Authorized Operator

1. **Action 1 (Gate 1 Execution):** Connect to production with a read-only role, execute `supabase/production_preflight_inspection.sql`, and provide the redacted output.
2. **Action 2 (Backup Confirmation):** Execute storage snapshot or verify Supabase PITR window, recording the timestamp and operator name in the preflight log.
3. **Action 3 (Schedule Maintenance Window):** Authorize a 15-minute off-peak window for Step 1 & Step 2 migration execution.
4. **Action 4 (Canary Pilot Selection):** Designate the single target tournament slug for the post-migration canary dry-run.

---

**Audit Conclusion:** Static code analysis and local PostgreSQL staging confirm that the proposed BGMI migration is safe, transaction-clean, and backward-compatible with Valorant. Because actual production preflight output has not yet been supplied, the production state is **NOT VERIFIED**. The overall migration readiness status is **CONDITIONAL GO**, strictly pending the operator's Gate 1 output and backup certification.
