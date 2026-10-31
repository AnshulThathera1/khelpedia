# Phase 10: Final Evidence Collection & Migration Command Safety Audit — KhelPediA BGMI

**Role:** Senior PostgreSQL DBA, Production Reliability Engineer & Change-Control Auditor  
**Date:** 2026-10-22  
**Database Target Engine:** PostgreSQL 15+ (Production Supabase / Managed PostgreSQL)  
**Deliverable Document:** `docs/BGMI_PHASE10_FINAL_READINESS_CHECKLIST.md`  
**Governing Standard:** Production Change-Control Standard & Safe DDL Rollout Specification  
**Audit Context:** Strictly offline inspection and command safety validation. **ZERO PRODUCTION CONNECTIONS, ZERO SQL EXECUTION, ZERO DATA MUTATION.**

---

## 1. Executive Verdict: NOT AUTHORIZED (CONDITIONAL GO FOR CHANGE-CONTROL REVIEW)

| Evaluation Area | Gate Status | Verdict | Explanation |
| :--- | :---: | :---: | :--- |
| **Production Preflight Evidence** | Gate 1 | **NOT VERIFIED** | The actual operator execution log from `supabase/production_preflight_inspection.sql` has not been provided. Production schema and data integrity cannot be assumed. |
| **Backup & Recovery Certification** | Gate 2 Prereq | **NOT VERIFIED** | No physical snapshot ID, Supabase Point-in-Time Recovery (PITR) window, or designated incident commander is recorded in the repository. |
| **Migration SQL & Command Safety** | Gate 2 Technical | **PASS** | The migration DDL, polymorphic constraint triggers, upgrade column logic, and invocation syntax (`--single-transaction`, `ON_ERROR_STOP=1`, `PGOPTIONS="-c lock_timeout=5000"`) are fully audited and safe. |
| **Migration Execution Authorization** | Gate 2 Release | **NOT AUTHORIZED** | Migration execution cannot be authorized by automated tooling or auditors. Only an explicitly authorized human operator may authorize and execute the migration once missing evidence is supplied. |
| **Pilot Canary Ingestion** | Gate 3 | **SEPARATELY BLOCKED** | Live ingestion remains strictly blocked until migration execution and post-migration validation are independently verified. |

### Summary Recommendation
The technical package (DDL scripts, rollback procedures, batch tracking, and shell command templates) is **production-ready and verified**. However, because actual production execution evidence and verified recovery identifiers have not yet been submitted by the operator, **the migration is NOT AUTHORIZED for execution at this time**. The evidence package is classified as **CONDITIONAL GO**, ready for human change-control evaluation upon delivery of the missing operational artifacts.

---

## 2. Evidence Inventory & Verification Checklist

In compliance with Phase 10 requirements, an exhaustive inspection of the repository root, `supabase/`, `scratch/`, and `docs/` directories was conducted. Below is the formal evidence status:

| Evidence Requirement | Operational Purpose | Status | Source / Note |
| :--- | :--- | :---: | :--- |
| **Production Preflight Log** | Verifies actual production session, privileges, tables, and constraint counts. | **MISSING** | No `preflight_execution.log` or redacted output found in repository. |
| **Database Identity Verified** | Confirms target is production PostgreSQL 15+ (not test, local, or dev). | **NOT VERIFIED** | Awaiting output of Preflight Check 1 (`current_database()`, version). |
| **Required Objects Verified** | Confirms 10 core tables and `gen_random_uuid()` exist in production. | **NOT VERIFIED** | Staging verified; production relation presence pending Check 3 log. |
| **Production Integrity Checks** | Confirms 0 orphaned `match_teams`, 0 duplicate match-teams, 0 collisions. | **NOT VERIFIED** | Staging verified 0; production data verification pending Checks 5–10 log. |
| **Backup / Recovery Evidence** | Confirms a restorable recovery point exists before DDL alterations. | **MISSING** | No storage snapshot ID, PITR timestamp, or cloud backup receipt provided. |
| **Restore Procedure Evidence** | Confirms that backup is verifiable and restoration steps are documented. | **MISSING** | Hosting provider restoration drill / SLA evidence not provided. |
| **Incident Commander Named** | Designates a single engineer with unilateral authority to abort rollout. | **MISSING** | Named operator role not yet documented. |
| **Maintenance Window Approved** | Off-peak execution window authorized by stakeholders. | **MISSING** | Execution window not yet scheduled. |
| **Explicit Migration Authorization** | Final human sign-off approving database DDL execution. | **MISSING** | Explicit human sign-off pending. |

> [!CRITICAL]
> **DBA Audit Rule:** Local staging test logs (`scratch/final_offline_readiness_results.json`, `scratch/concurrency_hardening_report.json`) prove that the SQL and application code function correctly under PostgreSQL 18.6. They **do not** prove that the remote production database is free of duplicate keys, orphaned records, or lock contention. Production verification remains strictly **NOT VERIFIED**.

---

## 3. Migration Command Safety Audit

The proposed execution sequence from Phase 8 and Phase 9 uses the following command structure:

```bash
set -o pipefail
PGOPTIONS="-c lock_timeout=5000" psql "$PROD_DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  --single-transaction \
  -X \
  -f supabase/proposed_migration_bgmi_standings_and_stats.sql \
  2>&1 | tee migration_bgmi_$(date +%Y%m%d_%H%M%S).log
```

An independent DBA audit was conducted across every parameter and mechanism in this invocation:

### 3.1 `psql -v ON_ERROR_STOP=1`
- **Audit:** By default, `psql` logs SQL errors but continues executing subsequent statements in the script.
- **Verification:** Setting `ON_ERROR_STOP=1` guarantees that if any statement fails (e.g. a constraint violation or lock timeout), `psql` halts execution immediately and exits with code `3`.
- **Finding:** Correct and mandatory for production automation.

### 3.2 `psql --single-transaction` (`-1`)
- **Audit:** Inspecting [supabase/proposed_migration_bgmi_standings_and_stats.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/proposed_migration_bgmi_standings_and_stats.sql) reveals that it does **not** contain explicit `BEGIN;` and `COMMIT;` statements inside the file.
- **Verification:** If `--single-transaction` is omitted, each statement runs in its own autocommit transaction. A failure halfway through would leave half the DDL committed. Passing `--single-transaction` wraps the entire script execution inside an implicit `BEGIN` and `COMMIT`. Combined with `ON_ERROR_STOP=1`, any error causes `psql` to issue a full `ROLLBACK`.
- **Finding:** Statement-by-statement inspection confirms all 545 lines are transaction-safe (no `CREATE INDEX CONCURRENTLY`, `VACUUM`, `CREATE DATABASE`, or `ALTER SYSTEM`).

### 3.3 `PGOPTIONS="-c lock_timeout=5000"`
- **Audit:** `ALTER TABLE public.match_teams` drops constraints and adds columns, taking an `AccessExclusiveLock`. If long-running analytical queries are reading `match_teams`, DDL can queue behind them, blocking all subsequent reads and writes.
- **Verification:** Setting `lock_timeout=5000` via `PGOPTIONS` ensures that the database connection itself enforces a 5-second lock acquisition timeout. If the lock cannot be obtained within 5,000 milliseconds, PostgreSQL terminates the statement with error code `55P03` (`lock_not_available`), triggering immediate transaction rollback without blocking traffic.
- **Finding:** Superior to executing `-c "SET lock_timeout = '5s'"` because `PGOPTIONS` applies globally to the connection session before any SQL is parsed.

### 3.4 `-X` (`--no-psqlrc`)
- **Audit:** Prevents `psql` from loading local `~/.psqlrc` configuration files that might contain custom prompts, timing commands, or formatting settings that interfere with automation or logging.
- **Finding:** Verified best practice.

### 3.5 Shell Pipeline Exit-Status Preservation (`tee` Hazard & `pipefail`)
- **Critical Risk Analysis:** In Bash/sh, a pipeline such as:
  ```bash
  psql ... 2>&1 | tee output.log
  ```
  returns the exit status of the **last command in the pipeline** (`tee`). Because `tee` almost always exits with `0`, the overall command exits with `0` even if `psql` failed with error code 3! If an automated runner or operator checks `$?`, a failed migration would be falsely recorded as successful!
- **Mandatory Hardening Requirement:**
  1. In **Bash/Linux/macOS**, the shell must execute `set -o pipefail` before running the pipeline, ensuring that `$?` reflects the first non-zero failure in the pipeline.
  2. In **Windows PowerShell**, piping native commands to `Tee-Object` modifies exit code handling. Operators running PowerShell must use standard file redirection or check `$LASTEXITCODE`:
     ```powershell
     $env:PGOPTIONS = "-c lock_timeout=5000"
     psql $env:PROD_DATABASE_URL -v ON_ERROR_STOP=1 --single-transaction -X -f supabase/proposed_migration_bgmi_standings_and_stats.sql 2>&1 | Out-File -FilePath migration.log -Encoding utf8
     if ($LASTEXITCODE -ne 0) { Write-Error "Migration failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }
     ```

### 3.6 Multi-File Atomicity Boundary Analysis
- **Audit:** If `supabase/schema_provenance.sql` is run first, followed by `supabase/proposed_migration_bgmi_standings_and_stats.sql`, do they form one atomic transaction?
- **Finding:** **NO.** They are two distinct `psql` invocations. Each has its own transaction boundary.
  - If `schema_provenance.sql` succeeds and commits, but `proposed_migration_bgmi_standings_and_stats.sql` fails and rolls back, the provenance tables (`entity_source_mapping`, `provisional_matches`, `failed_ingestion_logs`) remain committed.
  - **DBA Safety Evaluation:** This is acceptable because `schema_provenance.sql` is purely additive. It adds new isolated tables and does not modify existing Valorant data or constraints. However, operators must understand that rolling back the primary migration does not automatically un-apply the provenance schema.

---

## 4. Backup & Disaster Recovery Architecture

The operator must distinguish among six distinct recovery mechanisms and confirm that appropriate procedures are in place before migration:

| Recovery Mechanism | Scope & Granularity | Recovery Point Objective (RPO) | Recovery Time Objective (RTO) | When to Use | Destruction Risk |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **1. Cloud Storage Snapshot** | Entire DB storage volume | Snapshot timestamp | 15–30 min | Catastrophic host failure or unrecoverable database corruption. | High (replaces all tables) |
| **2. Point-in-Time Recovery (PITR)** | Entire DB cluster to precise second | Within $\le$ 5 min | 10–20 min | Migration causes widespread corruption noticed immediately. | High (replaces cluster state) |
| **3. Logical Backup (`pg_dump`)** | Specific tables or schemas | Dump timestamp | 10–20 min | Offline table restoration into staging or archival analysis. | Moderate |
| **4. Transaction Auto-Rollback** | Current migration batch | 0 min (Immediate) | 0 min | DDL fails during execution window with `ON_ERROR_STOP=1`. | Zero (atomic reversion) |
| **5. Non-Destructive DDL Rollback** (`safe_rollback_*.sql`) | Migration-added schema objects | Rollout window | $\le$ 2 min | Migration succeeded but system test reveals regression before ingestion starts. | Erases new columns/tables |
| **6. Batch Ledger Rollback** (`rollback_ingestion_batch`) | Single ingestion batch rows | Current state | $\le$ 30 sec | Post-migration data ingestion failure or data quality issue. | Zero schema impact |

> [!CAUTION]
> **Routine Recovery Rule:** **NEVER execute DDL Rollback (`safe_rollback_*.sql`) or `DROP TABLE` to remediate ingested data bugs.** DDL rollback permanently deletes table definitions and erases all historical battle royale scores. Use `SELECT rollback_ingestion_batch(p_batch_id);` to surgically remove corrupted batch records using the batch manifest.

---

## 5. Objective Stop Conditions & Escalation Procedures

The operator must immediately abort the deployment and stop all activity if any of the following conditions occur:

| Stop Condition | Trigger Event | Immediate Operator Action | Escalation Path |
| :--- | :--- | :--- | :--- |
| **SC-01: Preflight Missing** | Preflight output log is absent or incomplete. | Halt rollout. Do not run migration. | Request DBA or authorized operator run preflight. |
| **SC-02: DB Identity Mismatch** | `current_database()` or version does not match production specification. | Abort immediately. Connection string is pointing to wrong environment. | Security & Operations Lead. |
| **SC-03: Preflight Integrity Failure** | Checks 5–10 return $> 0$ orphaned or duplicate rows. | Halt rollout. Do not apply migration constraints. | Authorize data cleansing script in separate ticket. |
| **SC-04: Cross-Game Collisions** | Check 7 returns $> 0$ matches where UUID collision occurs. | Halt rollout. Critical identity corruption risk. | Core Database Architect. |
| **SC-05: Backup Unconfirmed** | Snapshot ID or PITR window cannot be verified. | Abort migration. No safety net exists. | Infrastructure / Cloud Administrator. |
| **SC-06: Lock Timeout Tripped** | `psql` returns error `55P03` (canceling statement due to lock timeout). | Transaction auto-rolled back. Do not loop retry. | Inspect `pg_stat_activity` for blocking queries; reschedule to off-peak. |
| **SC-07: Prerequisite Failure** | `schema_provenance.sql` fails with non-zero exit code. | Stop. Do not attempt primary migration. | Investigate provenance error log. |
| **SC-08: Valorant Regression** | Post-migration validation query on Valorant match-teams fails. | Execute `safe_rollback_bgmi_standings_and_stats.sql` immediately within maintenance window. | DBA and Incident Commander. |
| **SC-09: Unnamed Incident Commander**| No single operator has explicit authority to abort rollout. | Halt change window. | Engineering Leadership. |

---

## 6. Pre-Migration Operator Approval Checklist

The migration execution may only proceed after an authorized human operator signs off on each item below:

```
[ ] OPERATOR APPROVAL 1: Production preflight executed and redacted log reviewed (0 errors).
[ ] OPERATOR APPROVAL 2: Storage snapshot or Supabase PITR recovery point verified.
    - Snapshot / Recovery ID: ____________________________________
    - Timestamp: _________________________________________________
[ ] OPERATOR APPROVAL 3: Incident Commander designated.
    - Named Commander: ___________________________________________
[ ] OPERATOR APPROVAL 4: Low-traffic maintenance window scheduled.
    - Scheduled Time (UTC/IST): __________________________________
[ ] OPERATOR APPROVAL 5: Execution command reviewed with --single-transaction and PGOPTIONS lock timeout.
[ ] OPERATOR APPROVAL 6: Explicit authorization to execute DDL granted.
    - Signature / Auth Token: ____________________________________
```

---

## 7. Separate Post-Migration Verification Checklist (Gate 2 Clearance)

Immediately following execution of `proposed_migration_bgmi_standings_and_stats.sql`, run the following validation suite:

```sql
-- Post-Migration Schema Verification
SELECT 
    'ingestion_batch_ledger' AS object_name,
    to_regclass('public.ingestion_batch_ledger') IS NOT NULL AS verified
UNION ALL
SELECT 
    'ingestion_batch_manifest',
    to_regclass('public.ingestion_batch_manifest') IS NOT NULL
UNION ALL
SELECT 
    'bgmi_stage_standings',
    to_regclass('public.bgmi_stage_standings') IS NOT NULL
UNION ALL
SELECT 
    'bgmi_player_match_stats',
    to_regclass('public.bgmi_player_match_stats') IS NOT NULL
UNION ALL
SELECT 
    'trg_match_teams_polymorphic_fk',
    EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_teams_polymorphic_fk')
UNION ALL
SELECT 
    'trg_cascade_matches_delete_match_teams',
    EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cascade_matches_delete_match_teams')
UNION ALL
SELECT 
    'fn_rollback_ingestion_batch',
    to_regproc('public.rollback_ingestion_batch(uuid)') IS NOT NULL;
```
*Pass Criteria:* Every row returns `verified = true`.

```sql
-- Valorant Regression Test Query
SELECT m.id, mt.team_id, tr.game
FROM public.matches m
JOIN public.match_teams mt ON mt.match_id = m.id
JOIN public.tournaments tr ON tr.id = m.tournament_id
WHERE tr.game = 'valorant'
LIMIT 5;
```
*Pass Criteria:* Query succeeds in $\le 50\text{ms}$ returning existing Valorant match records.

---

## 8. Separate Pilot Canary-Ingestion Authorization Checklist (Gate 3)

> [!IMPORTANT]
> **COMPLETION OF THE MIGRATION DOES NOT AUTHORIZE INGESTION.**  
> Gate 3 (Canary Ingestion) is a completely separate operational gate requiring distinct authorization.

The following prerequisites must be verified before canary ingestion can begin:

- [ ] Gate 2 post-migration schema verification completed and signed off.
- [ ] Dedicated client checkout and advisory locking verified in ingestion engine code.
- [ ] Legal and operational authorization to ingest from the external data source confirmed.
- [ ] Explicit selection of **one single pilot tournament** (slug/identifier documented in writing; never assume defaults).
- [ ] Ingestion dry-run (`--dry-run`) executed to parse and validate payload schemas without issuing database writes.
- [ ] Ingestion batch ledger verified: 1 batch record created in status `IN_PROGRESS` and transitioned to `COMMITTED`.
- [ ] Batch manifest verified: checksums, row counts, and 0 quarantine records.
- [ ] KhelPediA BGMI portal UI checked to confirm standings, rosters, and match telemetry render accurately.

---

## 9. Exact Next Action for the Authorized Operator

The technical review is complete. To advance the project, the operator must execute the following two read-only steps:

1. **Execute Preflight Inspection:**  
   Connect to the production database with a read-only role and run:
   ```bash
   psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 -X -f supabase/production_preflight_inspection.sql > preflight_execution.log 2>&1
   ```
   Redact passwords/hostnames, review that checks 5–10 return 0 errors, and commit or supply the log to the repository.

2. **Supply Backup & Recovery Metadata:**  
   Provide the storage snapshot ID / PITR timestamp and record the designated incident commander name in Section 6.
