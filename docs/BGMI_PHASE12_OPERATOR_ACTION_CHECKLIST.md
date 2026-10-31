# Phase 12: Operator Action Checklist & Production Gate Execution Guide — KhelPediA BGMI

**Role:** Senior PostgreSQL DBA & Production Change-Control Auditor  
**Date:** 2026-10-22  
**Target Database:** PostgreSQL 15+ (Production Supabase / Managed PostgreSQL)  
**Deliverable File:** `docs/BGMI_PHASE12_OPERATOR_ACTION_CHECKLIST.md`  
**Purpose:** Actionable, step-by-step checklist to conclude preflight readiness, complete human change approval, execute migration safely, and prepare for canary ingestion.

---

## 1. Current Gate Status Summary

| Gate / Milestone | Current Status | Blocker Summary |
| :--- | :---: | :--- |
| **Gate 1: Production Preflight** | **BLOCKED** | Operator has not yet supplied the redacted execution log of `supabase/production_preflight_inspection.sql`. |
| **Gate 2 Prereq: Backup & PITR** | **BLOCKED** | Pre-migration storage snapshot ID, PITR timestamp, and named incident commander are unrecorded. |
| **Gate 2 Technical: DDL Scripts** | **VERIFIED PASS** | `proposed_migration_bgmi_standings_and_stats.sql`, `schema_provenance.sql`, and `safe_rollback_bgmi_standings_and_stats.sql` are transaction-safe, idempotent, and backward-compatible with Valorant. |
| **Gate 2 Release: Change Approval** | **NOT AUTHORIZED** | Awaiting operator preflight log and backup certification. |
| **Gate 3: Pilot Canary Ingestion** | **SEPARATELY BLOCKED** | Awaiting post-migration schema verification and separate executive canary authorization. |

### Operational Status Classifications
- `READY FOR CHANGE-APPROVAL`: **BLOCKED** (Missing preflight output log and backup snapshot identifier).
- `AUTHORIZED`: **NO** (No human approval record exists; tooling cannot authorize production changes).
- `EXECUTED AND VERIFIED`: **NO** (Zero DDL applied to production).

---

## 2. Actionable Operator Execution Checklist

To advance KhelPediA BGMI ingestion safely to production, the authorized operator must execute the following sequential actions:

---

### Phase A: Production Read-Only Preflight Inspection (Gate 1 Clearance)

> [!NOTE]
> Execute from an administrative shell with read-only database credentials. This script performs zero writes (`transaction_read_only = on`).

- [ ] **A.1 Connect with Read-Only Role:** Ensure the session user has read permissions on `matches`, `teams`, `tournaments`, and `match_teams`.
- [ ] **A.2 Execute Inspection Script:**
  ```bash
  psql "$PROD_DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    -X \
    -f supabase/production_preflight_inspection.sql \
    > preflight_execution.log 2>&1
  ```
- [ ] **A.3 Verify Exit Code:** Confirm command exited with code `0`.
- [ ] **A.4 Review Critical Checks:**
  - Check 1: Target database name confirmed as production; PostgreSQL version $\ge 15$.
  - Check 3: Check if `public.entity_source_mapping` exists. (If missing, note that `schema_provenance.sql` must run first).
  - Checks 5–10: Confirm orphan and duplicate counts are all **0**.
- [ ] **A.5 Redact & Supply Log:** Redact hostnames and credentials from `preflight_execution.log` and supply the log to the repository/team.

---

### Phase B: Backup & Disaster Recovery Certification (Gate 2 Prerequisite)

- [ ] **B.1 Generate Pre-Migration Snapshot:** Create a cloud storage snapshot or verify active Supabase Point-in-Time Recovery (PITR).
- [ ] **B.2 Record Recovery Metadata:**
  - Snapshot / Recovery Point ID: `__________________________________________________`
  - Snapshot Timestamp (UTC/IST): `__________________________________________________`
  - Scope: `public` schema (`matches`, `teams`, `tournaments`, `match_teams`, `bgmi_*`)
- [ ] **B.3 Verify Recovery SLA:** Confirm RPO $\le 15\text{ min}$ and RTO $\le 30\text{ min}$.
- [ ] **B.4 Designate Incident Commander:**
  - Lead On-Call Engineer: `________________________________________________________`
  - Confirmed authority to halt rollout and trigger restoration if needed.

---

### Phase C: Human Change Approval (Gate 2 Authorization)

- [ ] **C.1 Review Evidence Package:** Confirm Gate 1 log and Gate 2 backup metadata are complete and verified.
- [ ] **C.2 Schedule Maintenance Window:** Designate low-traffic execution window (recommended: 02:00–04:00 IST).
- [ ] **C.3 Grant Formal Authorization:**
  ```
  CHANGE AUTHORIZATION RECORD:
  Approver Name: _____________________________________________
  Role / Authority: ___________________________________________
  Approval Decision: [ ] APPROVED   [ ] REJECTED
  Scheduled Window: ___________________________________________
  Signature / Token: __________________________________________
  ```

---

### Phase D: Migration Execution & Post-Migration Verification (Gate 2 Clearance)

> [!CAUTION]
> Execute only after Phases A, B, and C are completed and signed off. Do not execute without `--single-transaction` and `set -o pipefail`.

- [ ] **D.1 Apply Prerequisite Schema (If Check 3 indicated `entity_source_mapping` was absent):**
  ```bash
  set -o pipefail
  PGOPTIONS="-c lock_timeout=5000" psql "$PROD_DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    --single-transaction \
    -X \
    -f supabase/schema_provenance.sql \
    2>&1 | tee migration_provenance_$(date +%Y%m%d_%H%M%S).log
  ```
- [ ] **D.2 Apply Primary BGMI Extension Migration:**
  ```bash
  set -o pipefail
  PGOPTIONS="-c lock_timeout=5000" psql "$PROD_DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    --single-transaction \
    -X \
    -f supabase/proposed_migration_bgmi_standings_and_stats.sql \
    2>&1 | tee migration_bgmi_$(date +%Y%m%d_%H%M%S).log
  ```
- [ ] **D.3 Run Post-Migration Schema Verification:**
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
      'bgmi_player_match_stats', to_regclass('public.bgmi_player_match_stats') IS NOT NULL
  UNION ALL
  SELECT 
      'trg_match_teams_polymorphic_fk', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_teams_polymorphic_fk')
  UNION ALL
  SELECT 
      'fn_rollback_ingestion_batch', to_regproc('public.rollback_ingestion_batch(uuid)') IS NOT NULL;
  ```
  *Requirement:* All 6 checks return `verified = true`.
- [ ] **D.4 Run Valorant Regression Query:**
  ```sql
  SELECT m.id, mt.team_id, tr.game
  FROM public.matches m
  JOIN public.match_teams mt ON mt.match_id = m.id
  JOIN public.tournaments tr ON tr.id = m.tournament_id
  WHERE tr.game = 'valorant'
  LIMIT 5;
  ```
  *Requirement:* Returns rows successfully without schema or relational errors.

---

### Phase E: Separate Pilot Canary Ingestion Gate (Gate 3 Approval)

> [!IMPORTANT]
> Live ingestion is strictly blocked until Phase D verification is complete and Gate 3 is separately authorized.

- [ ] **E.1 Explicit Single-Tournament Designation:**
  - Pilot Tournament Slug / ID: `________________________________________________`
  - (Never assume default tournament slugs or use multi-tournament patterns).
- [ ] **E.2 Data Source Ingestion Authorization:** Confirm source licensing and operational authorization.
- [ ] **E.3 Execute Dry-Run First:**
  ```bash
  node scripts/run_ingestion.js --tournament="<pilot-slug>" --dry-run
  ```
  Confirm payload schema validation passes with 0 database write attempts.
- [ ] **E.4 Execute Live Pilot Canary:**
  ```bash
  node scripts/run_ingestion.js --tournament="<pilot-slug>"
  ```
- [ ] **E.5 Post-Canary Ledger & Data Quality Audit:**
  - Verify `ingestion_batch_ledger` contains exactly 1 record in `COMMITTED` status.
  - Verify `ingestion_batch_manifest` contains checksums, row counts, and 0 quarantine entries.
  - Check KhelPediA BGMI web portal: confirm standings, rosters, and match telemetry render accurately.
- [ ] **E.6 Rollback Drill Preparedness:**
  - If data issues are detected, execute surgical batch rollback:
    ```sql
    SELECT public.rollback_ingestion_batch('<batch_id>'::uuid);
    ```
  - **NEVER** run DDL rollback (`safe_rollback_*.sql`) or `DROP TABLE` to remediate ingested data bugs.

---

## 3. Summary of Exact Next Actions Required from Operator

To break the audit loop and unblock production rollout:

1. **Run the Preflight Script:** Execute `supabase/production_preflight_inspection.sql` using a read-only account on production and provide the redacted output log.
2. **Provide Backup Snapshot Metadata:** Supply the pre-migration snapshot ID / PITR timestamp and the designated incident commander's name.
3. **Sign Section C Authorization:** Once 1 and 2 are provided, record the scheduled maintenance window and sign off on change authorization.
