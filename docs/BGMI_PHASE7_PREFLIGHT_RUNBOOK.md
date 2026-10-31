# KhelPediA BGMI Ingestion — Phase 7: Production Read-Only Preflight Operator Runbook (Gate 1)

**Document:** `docs/BGMI_PHASE7_PREFLIGHT_RUNBOOK.md`  
**Author:** Senior PostgreSQL Production DBA & Deployment Safety Auditor  
**Date:** 2026-10-22  
**Target Script:** `supabase/production_preflight_inspection.sql`  
**Execution Phase:** Gate 1 — Read-Only Production Preflight Inspection  
**Current Status:** Prepared, Verified Locally, Ready for Authorized Operator Execution  

---

## 1. Scope and Safety Boundaries

This runbook defines the mandatory protocol for an authorized production database administrator (DBA) to execute Gate 1 of the BGMI ingestion deployment.

### Strict Execution Constraints:
- **Zero Production Mutations:** Gate 1 is strictly read-only. No tables, rows, indexes, constraints, views, or configurations may be created, altered, updated, or deleted.
- **Zero Ingestion Execution:** No scraping, API fetches, or runner scripts (`scripts/run_ingestion.js`) may be executed.
- **Zero Migration Execution:** The forward migration (`supabase/proposed_migration_bgmi_standings_and_stats.sql`) is **NOT** authorized by this phase.
- **Zero Credential Exposure:** All connection strings, passwords, and host credentials must remain redacted in all submitted audit logs.
- **Transaction Safety Enclosure:** The preflight script executes entirely within `BEGIN TRANSACTION READ ONLY; ... ROLLBACK;`. Under no circumstances can it write to the database.

---

## 2. SQL Script Technical Review

The target preflight script ([supabase/production_preflight_inspection.sql](file:///e:/Projects/KhelPediA/khelpedia/supabase/production_preflight_inspection.sql)) was audited statement-by-statement and tested against isolated local PostgreSQL 18.6:

```
[SQL SCRIPT ARCHITECTURE]
+---------------------------------------------------------------------------------------+
| 1. BEGIN TRANSACTION READ ONLY;                                                       |
|    - Forces PostgreSQL executor to reject any write command (INSERT/UPDATE/DELETE/DDL)|
+---------------------------------------------------------------------------------------+
| 2. Section 1: Session & Server Identity Verification                                  |
|    - Verifies database_name, connected_user, version, server_ip, and read_only setting|
|    - Audits role write permissions via has_table_privilege() (Must show false)        |
+---------------------------------------------------------------------------------------+
| 3. Section 2: Extension & UUID Generation Capability                                  |
|    - Checks pg_extension for pgcrypto / uuid-ossp                                      |
|    - Confirms gen_random_uuid() is present in pg_proc                                 |
+---------------------------------------------------------------------------------------+
| 4. Section 3: Catalog Relation Inventory via to_regclass()                            |
|    - Safely tests 16 relations without failing if optional objects are absent          |
|    - Captures table sizes and object kinds (r = table, v = view)                       |
+---------------------------------------------------------------------------------------+
| 5. Section 4: Schema Compatibility & Column Inventory                                 |
|    - Inspects information_schema for match_teams and bgmi_stage_standings columns     |
|    - Inspects existing constraints and active triggers                                |
+---------------------------------------------------------------------------------------+
| 6. Section 5: Dynamic Integrity Audit (DO $$ ... $$)                                  |
|    - Safe dynamic queries guarded by to_regclass() boolean flags                      |
|    - Calculates exact integer counts for orphans, duplicates, and collisions          |
+---------------------------------------------------------------------------------------+
| 7. ROLLBACK;                                                                          |
|    - Closes session cleanly without leaving open transaction locks                     |
+---------------------------------------------------------------------------------------+
```

### Safety Audit Findings:
- **Genuinely Read-Only:** Verified. Inside `BEGIN TRANSACTION READ ONLY;`, PostgreSQL enforces an engine-level lock against any write operation.
- **Catalog-Safe:** Verified. Uses `to_regclass()` to safely test relation presence without throwing `relation does not exist` syntax errors.
- **Dynamic SQL Safety:** Verified. All data-integrity checks in Section 5 are conditional. If an optional table (e.g. `valorant_matches` or `bgmi_stage_standings`) is absent, the corresponding query is safely bypassed and a notice is emitted.
- **Zero Sensitive Data Exposure:** Verified. The script selects catalog metadata and row counts only. It never reads auth tables, passwords, connection strings, or encrypted tokens.

---

## 3. Required Operator Role & Permission Verification

Prior to executing the preflight script, the operator must verify that the connected database role has strictly read-only permissions.

### Option A: Using an Existing Read-Only Role
If your production database has a dedicated read-only role (e.g. `readonly_analyst`), use it:
```bash
# Verify role privileges before running preflight
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin 
FROM pg_roles 
WHERE rolname = current_user;
```

### Option B: Creating a Temporary Read-Only Auditor Role (Supabase / RDS)
If creating a temporary read-only user for this audit:
```sql
-- Run as superuser/postgres in production:
CREATE ROLE bgmi_auditor WITH LOGIN PASSWORD '<secure_placeholder_password>';
GRANT CONNECT ON DATABASE <prod_db> TO bgmi_auditor;
GRANT USAGE ON SCHEMA public TO bgmi_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bgmi_auditor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bgmi_auditor;
-- Explicitly revoke write permissions:
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON ALL TABLES IN SCHEMA public FROM bgmi_auditor;
```

### Operator Pre-Run Verification Query
Run this check to prove write commands are blocked before launching the preflight:
```sql
SELECT 
    current_user AS connected_user,
    has_table_privilege(current_user, 'public.matches', 'INSERT') AS can_insert,
    has_table_privilege(current_user, 'public.matches', 'UPDATE') AS can_update,
    has_table_privilege(current_user, 'public.matches', 'DELETE') AS can_delete;
```
**Expected Result:** `can_insert`, `can_update`, and `can_delete` must all be **`false`**.

---

## 4. Preflight Execution Command Syntax

The operator should execute the inspection script using standard `psql`. Use the generic placeholder syntax below:

```bash
# Set connection parameters (REDACT secrets before sharing logs)
export PGHOST="<prod_database_host>"
export PGPORT="5432"
export PGDATABASE="<prod_database_name>"
export PGUSER="<read_only_user>"
export PGSSLMODE="require"

# Execute preflight script and capture both stdout and stderr
psql -h "$PGHOST" -p "$PGPORT" -d "$PGDATABASE" -U "$PGUSER" \
     -v ON_ERROR_STOP=1 \
     -f supabase/production_preflight_inspection.sql > preflight_execution.log 2>&1
```

### Redaction Instructions
Before saving or submitting `preflight_execution.log`:
1. Search and replace your actual host/domain with `<PROD_HOST>`.
2. Replace your database name with `<PROD_DB>`.
3. Replace username with `<AUDITOR_USER>`.
4. Ensure no IP addresses or credentials appear in the file.

---

## 5. Detailed Preflight Checks & Pass/Fail Criteria

| Section / Check | Query Target | Pass Condition | Failure Action / Stop Condition | Status in Repository |
| :--- | :--- | :--- | :--- | :---: |
| **Check 1: Database Identity** | `current_database()`, `server_ip`, `transaction_read_only` | `is_read_only_session = on`. Database identity confirmed. | **STOP IMMEDIATELY** if connected to wrong database or `is_read_only_session` is not `on`. | **PASS (Locally Verified)** |
| **Check 1.1: Role Privileges** | `has_table_privilege()` | All write privileges (`INSERT`, `UPDATE`, `DELETE`) return `false`. | **STOP** if role has write access. Switch to a read-only role. | **PASS (Locally Verified)** |
| **Check 2: UUID Capability** | `gen_random_uuid()` in `pg_proc` | Function exists natively or `pgcrypto`/`uuid-ossp` installed. | **FAIL:** Migration requires UUID generation. Install `pgcrypto` first. | **PASS (Locally Verified)** |
| **Check 3: Entity Source Mapping** | `to_regclass('public.entity_source_mapping')` | `object_exists = true`. | **BLOCKER:** Missing prerequisite. Deploy `supabase/schema_provenance.sql` before migration. | **NOT VERIFIED (Production)** |
| **Check 3: Canonical Tables** | `matches`, `teams`, `tournaments`, `players` | All 4 tables report `object_exists = true`. | **BLOCKER:** Core canonical tables missing. Database uninitialized. | **NOT VERIFIED (Production)** |
| **Check 4: `match_teams` Schema** | Existing column nullability on `match_teams` | Catalog returns existing columns and types. | If `match_teams` absent, migration will create it fresh. If present, columns are audited. | **NOT VERIFIED (Production)** |
| **Check 5.1: Orphaned `match_id`** | `match_teams.match_id` not in `matches` or `valorant_matches` | Count **MUST BE `0`**. | **BLOCKER:** Orphan records exist. Must clean or map orphans before applying polymorphic trigger. | **NOT VERIFIED (Production)** |
| **Check 5.1b: Orphaned `team_id`** | `match_teams.team_id` (UUIDs) not in `teams` | Count **MUST BE `0`**. | **BLOCKER:** Orphan team records exist. Trigger will reject writes. Resolve team mappings. | **NOT VERIFIED (Production)** |
| **Check 5.2: Duplicate `match_teams`**| `(match_id, team_id)` duplicate pairs | Count **MUST BE `0`**. | **BLOCKER:** Duplicate pairs will cause `ALTER TABLE ... ADD CONSTRAINT UNIQUE` to fail. Deduplicate first. | **NOT VERIFIED (Production)** |
| **Check 5.3: Match ID Formats** | Count of UUID vs non-UUID text strings in `match_teams` | Informational audit. | Documents baseline split between Valorant (text) and BGMI (UUID) keys. | **NOT VERIFIED (Production)** |
| **Check 5.4: Cross-Game Collisions** | `matches.id::text = valorant_matches.match_id` | Count **MUST BE `0`**. | **CRITICAL BLOCKER:** ID namespace collision between BGMI and Valorant. Stop immediately. | **NOT VERIFIED (Production)** |
| **Check 5.5: Standings Duplicates** | `(tournament_id, stage_name, team_id)` | Count **MUST BE `0`**. | **BLOCKER:** Existing standings violate unique constraint. Deduplicate before migration. | **NOT VERIFIED (Production)** |
| **Check 5.5b: Standings Orphans** | Standings referencing non-existent tournaments/teams | Count **MUST BE `0`**. | **BLOCKER:** Foreign key constraints will fail if orphan standings exist. | **NOT VERIFIED (Production)** |
| **Check 5.6: Mapping Duplicates** | `(source, source_entity_id, entity_type)` in `entity_source_mapping` | Count **MUST BE `0`**. | **BLOCKER:** Conflicting identity mappings. Deduplicate provenance mappings. | **NOT VERIFIED (Production)** |

---

## 6. Expected Console Output Structure

When executed via `psql`, the output should display clean tabular catalog queries followed by sequential `RAISE NOTICE` lines from Section 5:

```text
 database_name | connected_user |       postgres_version        | server_ip | server_port | is_read_only_session 
---------------+----------------+-------------------------------+-----------+-------------+----------------------
 <PROD_DB>     | <AUDITOR_USER> | PostgreSQL 15.x / 16.x ...    | <IP>      | 5432        | on

 role_name      | can_insert_matches | can_update_matches | can_delete_matches 
----------------+--------------------+--------------------+--------------------
 <AUDITOR_USER> | f                  | f                  | f

... [Section 2, 3, 4 Catalog Tables Output] ...

NOTICE:  ==================================================
NOTICE:  STARTING DYNAMIC INTEGRITY AUDIT
NOTICE:  ==================================================
NOTICE:  DATA CHECK: Orphaned match_teams (not in matches AND not in valorant_matches): 0
NOTICE:  DATA CHECK: match_teams rows with UUID team_id missing from teams: 0 (Must be 0)
NOTICE:  DATA CHECK: Duplicate (match_id, team_id) in match_teams: 0 (Must be 0 for UNIQUE constraint)
NOTICE:  DATA CHECK: match_teams rows using canonical UUID match_ids: <N>
NOTICE:  DATA CHECK: match_teams rows using non-UUID text match_ids (e.g. Valorant): <M>
NOTICE:  DATA CHECK: Cross-game match_id collisions (matches vs valorant_matches): 0 (Must be 0)
NOTICE:  DATA CHECK: Duplicate (tournament_id, stage_name, team_id) in bgmi_stage_standings: 0
NOTICE:  DATA CHECK: Standings with orphaned tournament_id: 0 (Must be 0)
NOTICE:  DATA CHECK: Standings with orphaned team_id: 0 (Must be 0)
NOTICE:  DATA CHECK: Duplicate mappings in entity_source_mapping: 0
NOTICE:  ==================================================
NOTICE:  PREFLIGHT AUDIT COMPLETED SUCCESSFULLY
NOTICE:  ==================================================
ROLLBACK
```

---

## 7. Failure Handling & Triage Protocols

### Scenario 1: `entity_source_mapping does NOT exist in target database`
- **Root Cause:** Provenance schema (`supabase/schema_provenance.sql`) was never applied to this database.
- **Resolution:**
  1. Do NOT execute the BGMI migration yet.
  2. Review `supabase/schema_provenance.sql`.
  3. Deploy `supabase/schema_provenance.sql` as a separate, pre-approved prerequisite migration.
  4. Re-run preflight inspection.

### Scenario 2: `Duplicate (match_id, team_id) in match_teams > 0`
- **Root Cause:** Legacy Valorant ingestion allowed duplicate rows with differing payloads.
- **Resolution:**
  1. Run a read-only query to inspect the colliding rows:
     ```sql
     SELECT match_id, team_id, count(*) 
     FROM public.match_teams 
     GROUP BY match_id, team_id 
     HAVING count(*) > 1;
     ```
  2. Prepare an authorized deduplication script (keeping the row with `rounds_played IS NOT NULL`).
  3. Re-run preflight inspection after deduplication.

### Scenario 3: `Cross-game match_id collisions > 0`
- **Root Cause:** A BGMI match UUID matches an existing Valorant match ID string.
- **Resolution:**
  1. Identify colliding matches.
  2. Stop migration. Cross-game collision requires architectural namespace reconciliation.

### Scenario 4: `Orphaned match_teams > 0`
- **Root Cause:** `match_teams` rows exist referencing match IDs not found in `matches` or `valorant_matches`.
- **Resolution:**
  1. Query orphaned rows to determine source:
     ```sql
     SELECT * FROM public.match_teams mt 
     WHERE NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id)
       AND NOT EXISTS (SELECT 1 FROM public.valorant_matches vm WHERE vm.match_id = mt.match_id);
     ```
  2. Delete or archive orphaned rows before applying `trg_match_teams_polymorphic_fk`.

---

## 8. Required Operator Evidence to Return for Audit Review

After running the preflight script, the operator must provide:
1. **Redacted Execution Log:** The complete stdout/stderr output from `psql` (with credentials and real hostnames redacted).
2. **Catalog Confirmation:** Specific confirmation that:
   - `public.entity_source_mapping` reports `object_exists: true`.
   - `gen_random_uuid` exists.
   - All Section 5 counts marked `(Must be 0)` returned strictly `0`.
3. **Relation Sizes:** Total size reported for `public.match_teams` in Section 3 (to evaluate lock wait time during migration).

---

## 9. Explicit Authorization Boundary & Next Decision

> [!WARNING]
> **GATE 1 COMPLETION DOES NOT AUTHORIZE MIGRATION OR INGESTION.**  
> A successful preflight inspection confirms only that the production environment is compatible with the proposed schema changes. It does **NOT** grant authorization to execute DDL migrations, rollback scripts, or start data ingestion workers.

### Exact Next Decision Required from Operator:
Upon reviewing the preflight output log:
1. **If all checks return PASS (all critical counts = 0 and `entity_source_mapping` exists):**  
   The DBA may sign off on Gate 1. The project advances to **Gate 2 Review (Migration Approval Window Planning)**.
2. **If any check returns FAIL (missing tables, orphan rows, or duplicates):**  
   The deployment is **BLOCKED**. Follow the triage protocols in Section 7 to remediate the identified discrepancy. Do not proceed to Gate 2.
