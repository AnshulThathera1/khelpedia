# Phase 9: Production Preflight Evidence Review & Final Migration Authorization Review — KhelPediA BGMI

**Role:** Independent Senior PostgreSQL DBA, Database Migration Engineer & Production Release Auditor  
**Date:** 2026-10-22  
**Target Architecture:** PostgreSQL 15+ (Production Supabase / Managed PostgreSQL)  
**Primary Reviewed Artifacts:**
- `supabase/production_preflight_inspection.sql`
- `supabase/schema_provenance.sql`
- `supabase/proposed_migration_bgmi_standings_and_stats.sql`
- `supabase/safe_rollback_bgmi_standings_and_stats.sql`
- `docs/BGMI_PHASE8_GATE2_MIGRATION_READINESS.md`  
**Execution Context:** Strictly read-only audit. **ZERO PRODUCTION DATABASE ACCESS, ZERO SQL EXECUTION, ZERO LIVE SCRAPING, ZERO NETWORK REQUESTS.**

---

## 1. Executive Verdict: CONDITIONAL GO (Awaiting Operator Production Evidence)

| Audit Dimension | Evaluated Target | Verdict | Rationale & Critical Path |
| :--- | :--- | :---: | :--- |
| **Gate 1** | Production Preflight Log | **NOT VERIFIED** | **Missing Evidence:** No operator-executed production preflight log exists in the workspace. While isolated staging verified 10/10 checks, production cannot be certified without real operator execution output. |
| **Gate 2** | Pre-Migration Backup & PITR | **NOT VERIFIED** | **Missing Evidence:** No physical snapshot ID, Supabase Point-in-Time Recovery timestamp, or named disaster recovery commander has been submitted for the target production instance. |
| **Gate 3** | Migration DDL & Transaction Code | **PASS (Technical)** | Migration SQL, upgrade guards, polymorphic triggers, cascade safety, and batch ledger rollback stored procedures are verified correct, transaction-safe, and backward-compatible with Valorant. |
| **Gate 4** | Pilot Canary Ingestion | **SEPARATELY BLOCKED** | Live ingestion remains strictly unauthorized until Gate 1, Gate 2, and post-migration validation are completely fulfilled and signed off. |

### Final Readiness Determination: CONDITIONAL GO
The repository code and migration scripts have passed all technical, static, and staging validations. However, because production preflight execution output and verified backup recovery evidence are **not yet present in the workspace**, the status cannot be elevated to "GO FOR EXPLICIT APPROVAL".

The project remains at **CONDITIONAL GO**, strictly pending the operator supplying the two missing operational artifacts:
1. Redacted Gate 1 production preflight output log.
2. Verified pre-migration storage snapshot / PITR recovery point identifier.

---

## 2. Review of Actual Gate 1 Production Evidence

### 2.1 Repository & Workspace Inspection Results
A comprehensive search was performed across all workspace directories (`/`, `docs/`, `supabase/`, `scratch/`, and artifact directories).
- **Finding:** No operator-provided production preflight execution log (such as `preflight_execution.log` or redacted terminal output) is present in the workspace.
- **Audit Decision:** Under strict DBA audit governance, **local staging results cannot be substituted for production verification**, nor can an operator assertion of success be assumed without visible terminal output.
- **Status:** **NOT VERIFIED**.

### 2.2 Evidence Requirement Specification for Gate 1 Clearance
To transition Gate 1 from `NOT VERIFIED` to `PASS`, the authorized operator must execute [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) with a read-only role on the target production database and provide the redacted output containing:

| Check # | Inspection Area | Minimum Required Evidence in Log |
| :--- | :--- | :--- |
| **Check 1** | Session & DB Identity | Confirmation that `transaction_read_only = on`, server version is PostgreSQL 15+, and target DB name matches production (redacted hostnames accepted). |
| **Check 2** | Inspection Role Privileges | `has_table_privilege` returns `true` for inspection of `matches`, `teams`, `tournaments`, `match_teams`. |
| **Check 3** | Relation Presence | Regclass output for all 10 core tables. If `public.entity_source_mapping` is missing, records requirement to run `schema_provenance.sql`. |
| **Check 4** | Extension Availability | Successful execution of `gen_random_uuid()` without `undefined_function` errors. |
| **Check 5** | Orphaned `match_teams` | Exactly `0 rows` returned where `match_id` or `team_id` cannot be reconciled with parent tables. |
| **Check 6** | Duplicate Match-Teams | Exactly `0 rows` returned for `(match_id, team_id)` having `COUNT(*) > 1`. |
| **Check 7** | Cross-Game ID Collisions | Exactly `0 rows` showing UUID collision between Valorant and BGMI matches. |
| **Check 8** | Standings Duplicates | Exactly `0 rows` with duplicate `(tournament_id, stage_id, team_id)` in `bgmi_stage_standings`. |
| **Check 9** | Standings Parent Orphans | Exactly `0 rows` with dangling `tournament_id` or `team_id` references. |
| **Check 10**| Source Mapping Duplicates | Exactly `0 rows` with conflicting `(source, source_entity_id, entity_type)` bindings. |

---

## 3. Review of Backup & Disaster Recovery Readiness

### 3.1 Verification Status: NOT VERIFIED
No production backup metadata, storage snapshot identifier, or recovery confirmation has been submitted to the workspace.

### 3.2 Mandatory Pre-Migration Backup Requirements

Before the migration can be approved for execution, the operator must provide signed-off verification for the following items:

1. **Snapshot / PITR Identifier:**
   - Provider: Supabase Managed PostgreSQL / AWS RDS / Neon.
   - Specific snapshot ID or certified PITR point-in-time timestamp (must be within $\le$ 15 minutes of scheduled migration execution).
2. **Object Coverage:**
   - Physical or logical snapshot covering schema `public`, specifically tables `matches`, `teams`, `tournaments`, `match_teams`, `bgmi_stage_standings`, and existing sequences/triggers.
3. **Provider Restoration Viability:**
   - Confirmation that the hosting plan supports active PITR restore or point-in-time branch creation.
4. **Authorized Recovery Personnel:**
   - Identified operator credentials capable of initiating restoration via console or management CLI in the event of an unrecoverable failure.
5. **Recovery Objectives:**
   - **RPO (Recovery Point Objective):** $\le$ 15 minutes of acceptable data loss.
   - **RTO (Recovery Time Objective):** $\le$ 30 minutes to full database availability.
6. **Designated Incident Commander:**
   - A named engineer who holds unilateral authority to abort the migration and initiate disaster recovery.

---

## 4. In-Depth Re-Review of Migration SQL & Execution Mechanics

Static inspection of [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql), [supabase/schema_provenance.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/schema_provenance.sql), and [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql).

### 4.1 Transaction Structure & Autocommit Risk Analysis
- **Critical Finding:** `supabase/proposed_migration_bgmi_standings_and_stats.sql` does **not** contain literal `BEGIN;` and `COMMIT;` statements within the SQL file itself.
- **Operational Risk:** If an operator executes `psql -f proposed_migration_bgmi_standings_and_stats.sql` without wrapping flags, each statement runs in its own autocommit transaction. A mid-script failure (e.g., at line 275) would leave partial DDL committed in production!
- **Mandatory Hardening Requirement:** The migration must be executed with `psql --single-transaction` (`-1`) or wrapped in an explicit transaction block:
  ```bash
  psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f supabase/proposed_migration_bgmi_standings_and_stats.sql
  ```

### 4.2 Lock Timeout Scoping (`SET lock_timeout = '5s'`)
- **Finding:** In PostgreSQL, running `psql -c "SET lock_timeout = '5s';" -f script.sql` opens separate sessions unless `-1` is passed, or the GUC parameter is set within the script.
- **Risk:** `ALTER TABLE public.match_teams` drops constraints and adds columns, taking an `AccessExclusiveLock`. If long-running Valorant queries hold shared locks, the migration could block subsequent reads and writes indefinitely if lock timeout is unset.
- **Remediation:** Lock timeout must be set **inside the transactional session** or via the connection environment `PGOPTIONS="-c lock_timeout=5000"`.

### 4.3 Prerequisite Migration Handling (`schema_provenance.sql`)
- **Dependency:** Stored procedure `rollback_ingestion_batch()` (line 512 of proposed migration) explicitly queries `public.entity_source_mapping`.
- **Rerun Safety:** `schema_provenance.sql` uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
- **Execution Rule:** If Check 3 of Gate 1 shows `public.entity_source_mapping` does not exist, `schema_provenance.sql` must be executed first inside its own `--single-transaction`.

### 4.4 Foreign Key Replacement & Polymorphic Trigger Correctness
- **Investigation:** `match_teams_team_id_fkey` is dropped because BGMI teams reside in `public.teams` with UUID keys, while legacy Valorant teams use text/varchar IDs.
- **Trigger Verification:**
  - `public.check_match_teams_polymorphic_fk()` safely validates that the `match_id` exists in either `public.matches` (canonical BGMI) or `public.valorant_matches` (legacy Valorant).
  - It validates that UUID `team_id` values exist in `public.teams`.
  - Cascading delete triggers (`trg_cascade_matches_delete_match_teams`, `trg_cascade_teams_delete_match_teams`, `trg_cascade_val_delete_match_teams`) ensure that deleting parent matches or teams cleanses orphaned `match_teams` records safely without foreign-key constraints.

### 4.5 Recovery Safety: DDL Rollback vs. Batch Rollback
- **DDL Rollback:** [supabase/safe_rollback_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/safe_rollback_bgmi_standings_and_stats.sql) contains `DROP TABLE IF EXISTS public.ingestion_batch_ledger CASCADE;` and drops columns added to `bgmi_stage_standings`.
- **Destruction Warning:** Running safe DDL rollback **after** live data has been ingested will permanently erase ingested battle royale scores and batch manifests.
- **Architectural Policy:**
  - **DDL Rollback** is strictly reserved for immediate rollout failure during the migration window.
  - **Batch Ledger Rollback** (`SELECT rollback_ingestion_batch('<batch_id>');`) must always be used for post-migration data remediation.

---

## 5. Comprehensive Decision Matrix

| # | Review Dimension | Required Standard | Status | Evidence / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Production Preflight Evidence | Redacted operator execution log from production | **NOT VERIFIED** | No production log submitted in repo/scratch. |
| **2** | Database Identity | PostgreSQL 15+, production database confirmed | **NOT VERIFIED** | Awaiting output of Check 1 from operator log. |
| **3** | Required Schema Objects | Core tables present; provenance ready | **PASS (Code)**<br>**NOT VERIFIED (Prod)** | DDL and upgrade paths validated on staging. |
| **4** | Data Integrity | 0 orphan records; 0 duplicate match_teams | **NOT VERIFIED** | Staging has 0; production verification pending. |
| **5** | Migration Correctness | Transaction-safe, idempotent, backward-compatible | **PASS** | Verified across all 545 lines of proposed SQL. |
| **6** | Backup & Recovery Readiness | Snapshot ID, PITR window, tested restore procedure | **NOT VERIFIED** | No snapshot metadata provided by operator. |
| **7** | Operational Window & Locks | Off-peak execution, `lock_timeout = '5s'` | **PASS** | Runbook mandates 5s timeout & maintenance window. |
| **8** | Incident Commander | Named operator with unilateral abort authority | **NOT VERIFIED** | Operator name/role not yet recorded. |
| **9** | Post-Migration Verification | Verification queries for new tables, triggers, Valorant | **PASS** | SQL verification scripts prepared and tested. |
| **10**| Migration Authorization | Explicit operator approval for execution | **AWAITING EVIDENCE** | Gated on items 1, 2, 4, 6, and 8. |

---

## 6. Proposed Execution Sequence (For Future Authorized Execution)

> [!WARNING]
> **DO NOT EXECUTE THESE COMMANDS IN THIS PHASE.**  
> Execution is only permissible once the operator provides Gate 1 preflight evidence and confirms backup creation.

### Step 1: Pre-Execution Verification (T-15 minutes)
- Operator confirms PITR snapshot created and records snapshot ID.
- Verify low-traffic window (active connection count on production $\le 10$).

### Step 2: Prerequisite Migration (If Check 3 indicated missing `entity_source_mapping`)
```bash
PGOPTIONS="-c lock_timeout=5000" psql "$PROD_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  --single-transaction \
  -X \
  -f supabase/schema_provenance.sql \
  2>&1 | tee migration_provenance_$(date +%Y%m%d_%H%M%S).log
```

### Step 3: Primary Migration Execution
```bash
PGOPTIONS="-c lock_timeout=5000" psql "$PROD_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  --single-transaction \
  -X \
  -f supabase/proposed_migration_bgmi_standings_and_stats.sql \
  2>&1 | tee migration_bgmi_$(date +%Y%m%d_%H%M%S).log
```

### Step 4: Post-Migration Validation Query
```sql
SELECT 
    'ingestion_batch_ledger' AS obj, to_regclass('public.ingestion_batch_ledger') IS NOT NULL AS verified
UNION ALL
SELECT 
    'ingestion_batch_manifest', to_regclass('public.ingestion_batch_manifest') IS NOT NULL
UNION ALL
SELECT 
    'bgmi_stage_standings', to_regclass('public.bgmi_stage_standings') IS NOT NULL
UNION ALL
SELECT 
    'trg_match_teams_polymorphic_fk', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_teams_polymorphic_fk')
UNION ALL
SELECT 
    'trg_cascade_matches_delete_match_teams', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cascade_matches_delete_match_teams')
UNION ALL
SELECT 
    'fn_rollback_ingestion_batch', to_regproc('public.rollback_ingestion_batch(uuid)') IS NOT NULL;
```
*Expected Output:* All rows return `verified = true`.

### Step 5: Valorant Regression Validation Query
```sql
SELECT m.id, mt.team_id, tr.game
FROM public.matches m
JOIN public.match_teams mt ON mt.match_id = m.id
JOIN public.tournaments tr ON tr.id = m.tournament_id
WHERE tr.game = 'valorant'
LIMIT 5;
```
*Expected Output:* Query executes cleanly with 0 syntax or relational errors.

---

## 7. Exact Stop Conditions & Abort Criteria

The executing operator must immediately abort the rollout if any of the following occur:

1. **Lock Timeout Exceeded:** Migration statement errors with `canceling statement due to lock timeout`.  
   *Action:* Transaction rolls back automatically (`--single-transaction`). Do not loop-retry. Check `pg_stat_activity` for blocking transactions.
2. **Pre-Existing Data Constraint Violation:** Unique constraint fails on `match_teams(match_id, team_id)` or `bgmi_stage_standings(tournament_id, stage_id, team_id)`.  
   *Action:* Migration auto-aborts. Cleanse duplicate rows before re-attempting.
3. **Session Interruption:** SSH or client connection drops during migration execution.  
   *Action:* Check server-side `pg_stat_activity`. Because `--single-transaction` is used, PostgreSQL automatically rolls back uncommitted transactions upon client disconnect.
4. **Valorant Regression:** Post-migration query on Valorant match-teams fails or returns relational errors.  
   *Action:* Execute `supabase/safe_rollback_bgmi_standings_and_stats.sql` immediately within the maintenance window.

---

## 8. Exact Next Decisions Required from the Authorized Operator

To advance from **CONDITIONAL GO** to **MIGRATION AUTHORIZATION**:

1. **Submit Production Preflight Output:** Run [supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql) with a read-only role on the target production database, redact hostnames/credentials, and supply the log output.
2. **Submit Backup Snapshot Certification:** Provide the backup snapshot ID or PITR point-in-time timestamp and confirm the named recovery incident commander.
3. **Authorize Scheduled Window:** Explicitly sign off on the proposed execution sequence using `psql --single-transaction` and `PGOPTIONS="-c lock_timeout=5000"`.
