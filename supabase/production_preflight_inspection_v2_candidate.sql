-- ==============================================================================
-- KhelPediA — Production Preflight Read-Only Inspection Script v2 (CANDIDATE)
-- Target: Supabase / PostgreSQL Production Environment
-- Mode: STRICTLY READ-ONLY — Zero Mutations, Zero Side-Effects
-- Reviewed: 2026-10-31 as part of BGMI Migration Preflight Audit
-- 
-- OPERATOR INSTRUCTIONS:
--   1. Confirm host, port, dbname, and role in Section 1 output before proceeding.
--   2. If ANY field in Section 1 does not match the expected production target, STOP.
--   3. All checks run inside BEGIN TRANSACTION READ ONLY ... ROLLBACK.
--   4. PASS/FAIL tags appear in RAISE NOTICE output.
--   5. The script ends with ROLLBACK — no data is written.
--   6. Run with: psql -v ON_ERROR_STOP=1 ... -f this_file.sql 2>&1 | tee preflight.log
--   7. Review preflight.log fully before approving the migration.
--
-- SECURITY: This script does not modify data, schema, roles, or grants.
--   A failed CHECK constraint or missing object will produce a NOTICE, not a runtime error,
--   because all data checks are wrapped in the DO block with explicit RAISE NOTICE output.
-- ==============================================================================

BEGIN TRANSACTION READ ONLY;

-- ==============================================================================
-- SECTION 1: DATABASE IDENTITY & SESSION VERIFICATION
-- OPERATOR: Verify all values before continuing.
-- ==============================================================================
SELECT
    current_database()                                AS database_name,
    current_user                                      AS connected_user,
    version()                                         AS postgres_version,
    inet_server_addr()                                AS server_ip,
    inet_server_port()                                AS server_port,
    current_setting('transaction_read_only')          AS is_read_only_tx,
    pg_postmaster_start_time()                        AS server_start_time,
    now()                                             AS preflight_run_at;

-- 1.1 Explicit write-privilege audit via has_table_privilege()
-- NOTE: has_table_privilege() reflects effective privileges including role grants and superuser.
-- These results are NECESSARY but NOT SUFFICIENT: column-level privileges and RLS
-- can further restrict or expand effective access. See Section 6 for extended privilege checks.
SELECT
    current_user                                      AS role_name,
    CASE WHEN to_regclass('public.matches') IS NOT NULL
         THEN has_table_privilege(current_user, 'public.matches', 'INSERT')
         ELSE false
    END                                               AS can_insert_matches,
    CASE WHEN to_regclass('public.matches') IS NOT NULL
         THEN has_table_privilege(current_user, 'public.matches', 'UPDATE')
         ELSE false
    END                                               AS can_update_matches,
    CASE WHEN to_regclass('public.matches') IS NOT NULL
         THEN has_table_privilege(current_user, 'public.matches', 'DELETE')
         ELSE false
    END                                               AS can_delete_matches,
    CASE WHEN to_regclass('public.bgmi_stage_standings') IS NOT NULL
         THEN has_table_privilege(current_user, 'public.bgmi_stage_standings', 'INSERT')
         ELSE false
    END                                               AS can_insert_bgmi_standings,
    CASE WHEN to_regclass('public.entity_source_mapping') IS NOT NULL
         THEN has_table_privilege(current_user, 'public.entity_source_mapping', 'INSERT')
         ELSE false
    END                                               AS can_insert_entity_mapping;

-- 1.2 Role membership and superuser status
SELECT
    r.rolname                                         AS role_name,
    r.rolsuper                                        AS is_superuser,
    r.rolinherit                                      AS inherits_privs,
    r.rolcanlogin                                     AS can_login,
    r.rolcreaterole                                   AS can_create_role,
    r.rolcreatedb                                     AS can_create_db,
    ARRAY(
        SELECT pg_get_userbyid(m.roleid)
        FROM pg_auth_members m
        WHERE m.member = r.oid
    )                                                 AS member_of_roles
FROM pg_catalog.pg_roles r
WHERE r.rolname = current_user;

-- ==============================================================================
-- SECTION 2: EXTENSION & CAPABILITY AUDIT
-- ==============================================================================
SELECT
    extname                                           AS extension_name,
    extversion                                        AS installed_version,
    n.nspname                                         AS installed_in_schema
FROM pg_catalog.pg_extension e
JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- Check gen_random_uuid() availability (required for all UUID PKs in migration)
SELECT
    proname                                           AS function_name,
    pronamespace::regnamespace                        AS schema,
    pronargs                                          AS arg_count
FROM pg_catalog.pg_proc
WHERE proname = 'gen_random_uuid'
ORDER BY pronamespace;

-- ==============================================================================
-- SECTION 3: OBJECT EXISTENCE AUDIT (CATALOG CHECKS — READ ONLY)
-- ==============================================================================
SELECT
    obj.target_object,
    to_regclass(obj.target_object) IS NOT NULL        AS object_exists,
    c.relkind                                         AS kind,   -- r=table v=view m=matview
    CASE c.relkind
        WHEN 'r' THEN 'TABLE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
        ELSE c.relkind::text
    END                                               AS kind_label,
    pg_size_pretty(
        CASE WHEN to_regclass(obj.target_object) IS NOT NULL
             THEN pg_total_relation_size(to_regclass(obj.target_object))
             ELSE 0
        END
    )                                                 AS total_size,
    c.reltuples::bigint                               AS estimated_row_count
FROM (
    VALUES
        ('public.matches'),
        ('public.tournaments'),
        ('public.teams'),
        ('public.players'),
        ('public.games'),
        ('public.match_teams'),
        ('public.valorant_matches'),
        ('public.entity_source_mapping'),
        ('public.provisional_matches'),
        ('public.failed_ingestion_logs'),
        ('public.bgmi_stage_standings'),
        ('public.tournament_rosters'),
        ('public.match_player_stats'),
        ('public.tournament_player_stats'),
        ('public.quarantine_identities'),
        ('public.ingestion_batch_ledger'),
        ('public.bgmi_match_teams'),
        ('public.tournament_teams')
) AS obj(target_object)
LEFT JOIN pg_catalog.pg_class c
    ON c.oid = to_regclass(obj.target_object);

-- ==============================================================================
-- SECTION 4: SCHEMA COMPATIBILITY — COLUMN INVENTORY
-- ==============================================================================

-- 4.1 match_teams columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'match_teams'
ORDER BY ordinal_position;

-- 4.2 match_teams existing constraints (required: PK on (match_id,team_id), UNIQUE on source_result_id)
SELECT
    con.conname                                       AS constraint_name,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        ELSE con.contype::text
    END                                               AS constraint_type,
    pg_get_constraintdef(con.oid)                     AS definition
FROM pg_catalog.pg_constraint con
JOIN pg_catalog.pg_class rel     ON rel.oid = con.conrelid
JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public' AND rel.relname = 'match_teams'
ORDER BY con.contype;

-- 4.3 bgmi_stage_standings columns (critical: must include bonus_pts)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bgmi_stage_standings'
ORDER BY ordinal_position;

-- 4.4 bgmi_stage_standings constraints
SELECT
    con.conname                                       AS constraint_name,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        ELSE con.contype::text
    END                                               AS constraint_type,
    pg_get_constraintdef(con.oid)                     AS definition
FROM pg_catalog.pg_constraint con
JOIN pg_catalog.pg_class rel     ON rel.oid = con.conrelid
JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public' AND rel.relname = 'bgmi_stage_standings'
ORDER BY con.contype;

-- 4.5 entity_source_mapping columns (prerequisite for ingestion engine)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'entity_source_mapping'
ORDER BY ordinal_position;

-- 4.6 Active triggers on relevant tables
SELECT
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
      'match_teams', 'matches', 'teams', 'valorant_matches',
      'bgmi_stage_standings', 'tournament_rosters', 'match_player_stats'
  )
ORDER BY event_object_table, trigger_name;

-- 4.7 Functions installed by migration
SELECT
    p.proname                                         AS function_name,
    p.pronamespace::regnamespace                      AS schema,
    pg_get_function_identity_arguments(p.oid)         AS args,
    CASE p.provolatile WHEN 'i' THEN 'IMMUTABLE' WHEN 's' THEN 'STABLE' ELSE 'VOLATILE' END AS volatility
FROM pg_catalog.pg_proc p
WHERE p.proname IN (
    'set_updated_at_timestamp',
    'check_match_teams_polymorphic_fk',
    'cascade_delete_matches_to_match_teams',
    'cascade_delete_teams_to_match_teams',
    'cascade_delete_valorant_matches_to_match_teams',
    'rollback_ingestion_batch'
)
AND p.pronamespace::regnamespace = 'public'::regnamespace
ORDER BY p.proname;

-- ==============================================================================
-- SECTION 5: PRIVILEGE AUDIT — CATALOG & INFORMATION_SCHEMA LEVEL
-- NOTE: Supabase anon/service-role differ from Postgres superuser.
-- Results here reflect privileges for the CONNECTED role only.
-- These cannot establish production role privileges when run from staging.
-- ==============================================================================

-- 5.1 Schema-level usage privilege
SELECT
    nspname                                           AS schema_name,
    has_schema_privilege(current_user, nspname, 'USAGE') AS has_usage
FROM pg_catalog.pg_namespace
WHERE nspname = 'public';

-- 5.2 Table-level privileges for the connected role on migration target tables
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE grantee = current_user
  AND table_schema = 'public'
  AND table_name IN (
      'matches', 'teams', 'tournaments', 'match_teams',
      'bgmi_stage_standings', 'entity_source_mapping', 'ingestion_batch_ledger',
      'match_player_stats', 'tournament_player_stats', 'quarantine_identities',
      'tournament_rosters'
  )
ORDER BY table_name, privilege_type;

-- 5.3 Effective privileges including role inheritance and superuser override
-- (IMPORTANT: has_table_privilege checks effective privilege including superuser)
SELECT
    t.table_name,
    has_table_privilege(current_user, 'public.' || t.table_name, 'SELECT')    AS eff_select,
    has_table_privilege(current_user, 'public.' || t.table_name, 'INSERT')    AS eff_insert,
    has_table_privilege(current_user, 'public.' || t.table_name, 'UPDATE')    AS eff_update,
    has_table_privilege(current_user, 'public.' || t.table_name, 'DELETE')    AS eff_delete
FROM (VALUES
    ('matches'), ('teams'), ('tournaments'), ('match_teams'),
    ('bgmi_stage_standings'), ('entity_source_mapping'), ('ingestion_batch_ledger'),
    ('match_player_stats'), ('tournament_player_stats'), ('quarantine_identities'),
    ('tournament_rosters')
) AS t(table_name)
WHERE to_regclass('public.' || t.table_name) IS NOT NULL
ORDER BY t.table_name;

-- 5.4 Row Level Security status on all target tables
SELECT
    c.relname                                         AS table_name,
    c.relrowsecurity                                  AS rls_enabled,
    c.relforcerowsecurity                             AS rls_forced
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
      'matches', 'teams', 'tournaments', 'match_teams',
      'bgmi_stage_standings', 'entity_source_mapping', 'ingestion_batch_ledger',
      'match_player_stats', 'tournament_player_stats', 'quarantine_identities',
      'tournament_rosters', 'failed_ingestion_logs'
  )
  AND c.relkind = 'r'
ORDER BY c.relname;

-- ==============================================================================
-- SECTION 6: DATA INTEGRITY CHECKS (DYNAMIC — SKIPS MISSING OBJECTS GRACEFULLY)
-- All checks output explicit PASS/FAIL/SKIPPED tags in RAISE NOTICE
-- ==============================================================================
DO $$
DECLARE
    v_has_match_teams    BOOLEAN := to_regclass('public.match_teams') IS NOT NULL;
    v_has_matches        BOOLEAN := to_regclass('public.matches') IS NOT NULL;
    v_has_val_matches    BOOLEAN := to_regclass('public.valorant_matches') IS NOT NULL;
    v_has_standings      BOOLEAN := to_regclass('public.bgmi_stage_standings') IS NOT NULL;
    v_has_mappings       BOOLEAN := to_regclass('public.entity_source_mapping') IS NOT NULL;
    v_has_teams          BOOLEAN := to_regclass('public.teams') IS NOT NULL;
    v_has_tournaments    BOOLEAN := to_regclass('public.tournaments') IS NOT NULL;
    v_has_bonus_col      BOOLEAN := FALSE;
    v_cnt                INT;
    v_cnt2               INT;
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'BGMI MIGRATION PREFLIGHT — DATA INTEGRITY CHECKS';
    RAISE NOTICE 'Run at: %', now();
    RAISE NOTICE '=================================================================';

    -- ----------------------------------------------------------------
    -- CHECK 6.1: Orphaned match_id references in match_teams
    -- ----------------------------------------------------------------
    IF v_has_match_teams AND v_has_matches THEN
        IF v_has_val_matches THEN
            EXECUTE
                'SELECT COUNT(*) FROM public.match_teams mt
                 WHERE NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id)
                   AND NOT EXISTS (SELECT 1 FROM public.valorant_matches vm WHERE vm.match_id = mt.match_id)'
            INTO v_cnt;
            IF v_cnt = 0 THEN
                RAISE NOTICE 'CHECK 6.1 [PASS]: Orphaned match_teams.match_id = 0 (checked against matches + valorant_matches)';
            ELSE
                RAISE NOTICE 'CHECK 6.1 [FAIL]: Orphaned match_teams.match_id = % (Must be 0)', v_cnt;
            END IF;
        ELSE
            EXECUTE
                'SELECT COUNT(*) FROM public.match_teams mt
                 WHERE NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id)'
            INTO v_cnt;
            IF v_cnt = 0 THEN
                RAISE NOTICE 'CHECK 6.1 [PASS]: Orphaned match_teams.match_id = 0 (valorant_matches absent; checked against matches only)';
            ELSE
                RAISE NOTICE 'CHECK 6.1 [WARN]: Orphaned match_teams.match_id = % (valorant_matches not present; may be Valorant TEXT keys)', v_cnt;
            END IF;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.1 [SKIPPED]: match_teams or matches table does not exist yet.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.2: Orphaned team_id references in match_teams (UUID rows only)
    -- ----------------------------------------------------------------
    IF v_has_match_teams AND v_has_teams THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.match_teams mt
             WHERE mt.team_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''
               AND NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.id::text = mt.team_id)'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.2 [PASS]: Orphaned match_teams UUID team_id = 0';
        ELSE
            RAISE NOTICE 'CHECK 6.2 [FAIL]: Orphaned match_teams UUID team_id = % (Must be 0)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.2 [SKIPPED]: match_teams or teams table missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.3: Duplicate (match_id, team_id) pairs in match_teams
    -- ----------------------------------------------------------------
    IF v_has_match_teams THEN
        EXECUTE
            'SELECT COUNT(*) FROM (
                SELECT match_id, team_id
                FROM public.match_teams
                GROUP BY match_id, team_id
                HAVING COUNT(*) > 1
             ) sub'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.3 [PASS]: No duplicate (match_id, team_id) pairs in match_teams';
        ELSE
            RAISE NOTICE 'CHECK 6.3 [FAIL]: % duplicate (match_id, team_id) pairs in match_teams (blocks UNIQUE constraint)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.3 [SKIPPED]: match_teams table missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.4: match_id format distribution in match_teams
    -- ----------------------------------------------------------------
    IF v_has_match_teams THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.match_teams
             WHERE match_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'''
        INTO v_cnt;
        EXECUTE
            'SELECT COUNT(*) FROM public.match_teams
             WHERE NOT (match_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'')'
        INTO v_cnt2;
        RAISE NOTICE 'CHECK 6.4 [INFO]: match_teams UUID match_ids: % | Non-UUID (Valorant TEXT): %', v_cnt, v_cnt2;
    ELSE
        RAISE NOTICE 'CHECK 6.4 [SKIPPED]: match_teams table missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.5: Cross-game ID collisions (same match_id in both tables)
    -- ----------------------------------------------------------------
    IF v_has_matches AND v_has_val_matches THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.matches m
             JOIN public.valorant_matches vm ON vm.match_id = m.id::text'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.5 [PASS]: No cross-game match_id collisions between matches and valorant_matches';
        ELSE
            RAISE NOTICE 'CHECK 6.5 [FAIL]: % cross-game match_id collisions (Must be 0)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.5 [SKIPPED]: matches or valorant_matches table missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.6: bgmi_stage_standings — duplicate unique key violations
    -- ----------------------------------------------------------------
    IF v_has_standings THEN
        EXECUTE
            'SELECT COUNT(*) FROM (
                SELECT tournament_id, stage_name, team_id
                FROM public.bgmi_stage_standings
                GROUP BY tournament_id, stage_name, team_id
                HAVING COUNT(*) > 1
             ) sub'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.6 [PASS]: No duplicate (tournament_id, stage_name, team_id) in bgmi_stage_standings';
        ELSE
            RAISE NOTICE 'CHECK 6.6 [FAIL]: % duplicate groups in bgmi_stage_standings (blocks UNIQUE constraint)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.6 [SKIPPED]: bgmi_stage_standings table does not exist yet — expected pre-migration.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.7: bgmi_stage_standings — point equation validation
    -- Dynamically guards bonus_pts column presence (the "bonus_pts fix")
    -- ----------------------------------------------------------------
    IF v_has_standings THEN
        -- Determine if bonus_pts column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'bgmi_stage_standings'
              AND column_name = 'bonus_pts'
        ) INTO v_has_bonus_col;

        IF v_has_bonus_col THEN
            EXECUTE
                'SELECT COUNT(*) FROM public.bgmi_stage_standings
                 WHERE total_pts IS NOT NULL
                   AND placement_pts IS NOT NULL
                   AND elimination_pts IS NOT NULL
                   AND (placement_pts + elimination_pts + COALESCE(bonus_pts, 0) != total_pts)'
            INTO v_cnt;
            RAISE NOTICE 'CHECK 6.7 [INFO]: bonus_pts column EXISTS in bgmi_stage_standings';
        ELSE
            EXECUTE
                'SELECT COUNT(*) FROM public.bgmi_stage_standings
                 WHERE total_pts IS NOT NULL
                   AND placement_pts IS NOT NULL
                   AND elimination_pts IS NOT NULL
                   AND (placement_pts + elimination_pts != total_pts)'
            INTO v_cnt;
            RAISE NOTICE 'CHECK 6.7 [WARN]: bonus_pts column ABSENT — point equation cannot include bonus. Migration required.';
        END IF;

        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.7 [PASS]: Point equation anomalies in bgmi_stage_standings = 0';
        ELSE
            RAISE NOTICE 'CHECK 6.7 [FAIL]: % point equation anomalies in bgmi_stage_standings (Must be 0)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.7 [SKIPPED]: bgmi_stage_standings does not exist yet.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.8: bgmi_stage_standings — orphaned tournament_id references
    -- ----------------------------------------------------------------
    IF v_has_standings AND v_has_tournaments THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.bgmi_stage_standings s
             WHERE NOT EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = s.tournament_id)'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.8 [PASS]: No orphaned tournament_id in bgmi_stage_standings';
        ELSE
            RAISE NOTICE 'CHECK 6.8 [FAIL]: % rows with orphaned tournament_id in bgmi_stage_standings', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.8 [SKIPPED]: bgmi_stage_standings or tournaments missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.9: bgmi_stage_standings — orphaned team_id references
    -- ----------------------------------------------------------------
    IF v_has_standings AND v_has_teams THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.bgmi_stage_standings s
             WHERE NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.id = s.team_id)'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.9 [PASS]: No orphaned team_id in bgmi_stage_standings';
        ELSE
            RAISE NOTICE 'CHECK 6.9 [FAIL]: % rows with orphaned team_id in bgmi_stage_standings', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.9 [SKIPPED]: bgmi_stage_standings or teams missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.10: entity_source_mapping existence and constraint
    -- ----------------------------------------------------------------
    IF v_has_mappings THEN
        EXECUTE
            'SELECT COUNT(*) FROM (
                SELECT source, source_entity_id, entity_type
                FROM public.entity_source_mapping
                GROUP BY source, source_entity_id, entity_type
                HAVING COUNT(*) > 1
             ) sub'
        INTO v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.10 [PASS]: No duplicate (source, source_entity_id, entity_type) in entity_source_mapping';
        ELSE
            RAISE NOTICE 'CHECK 6.10 [FAIL]: % duplicate mappings in entity_source_mapping (violates uq_source_entity)', v_cnt;
        END IF;

        -- Check import_batch_id provenance column present in metadata
        EXECUTE 'SELECT COUNT(*) FROM public.entity_source_mapping WHERE metadata ? ''import_batch_id''' INTO v_cnt;
        RAISE NOTICE 'CHECK 6.10b [INFO]: entity_source_mapping rows with import_batch_id in metadata: %', v_cnt;

    ELSE
        RAISE NOTICE 'CHECK 6.10 [FAIL]: entity_source_mapping DOES NOT EXIST — prerequisite for ingestion engine (BLOCKER)';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.11: ingestion_batch_ledger existence
    -- ----------------------------------------------------------------
    IF to_regclass('public.ingestion_batch_ledger') IS NOT NULL THEN
        EXECUTE 'SELECT COUNT(*) FROM public.ingestion_batch_ledger' INTO v_cnt;
        RAISE NOTICE 'CHECK 6.11 [PASS]: ingestion_batch_ledger exists with % rows', v_cnt;
    ELSE
        RAISE NOTICE 'CHECK 6.11 [INFO]: ingestion_batch_ledger not present — expected pre-migration (migration creates it).';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.12: Conflicting legacy constraint — match_teams_match_id_fkey
    -- Migration drops this constraint. Verify current state.
    -- ----------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_constraint
        WHERE conname = 'match_teams_match_id_fkey'
    ) THEN
        RAISE NOTICE 'CHECK 6.12 [WARN]: match_teams_match_id_fkey constraint STILL EXISTS — migration will DROP it. Confirm this is safe.';
    ELSE
        RAISE NOTICE 'CHECK 6.12 [PASS]: match_teams_match_id_fkey constraint absent — already removed or never existed.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.13: wwcd column existence in match_teams (required by engine)
    -- ----------------------------------------------------------------
    IF v_has_match_teams THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'match_teams' AND column_name = 'wwcd'
        ) THEN
            RAISE NOTICE 'CHECK 6.13 [PASS]: match_teams.wwcd column EXISTS';
        ELSE
            RAISE NOTICE 'CHECK 6.13 [FAIL]: match_teams.wwcd column MISSING — required by ingestion engine (BLOCKER)';
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.13 [SKIPPED]: match_teams missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.14: source_result_id column and unique index in match_teams
    -- ----------------------------------------------------------------
    IF v_has_match_teams THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'match_teams' AND column_name = 'source_result_id'
        ) THEN
            RAISE NOTICE 'CHECK 6.14 [PASS]: match_teams.source_result_id column EXISTS';
        ELSE
            RAISE NOTICE 'CHECK 6.14 [FAIL]: match_teams.source_result_id column MISSING — required for idempotent upsert (BLOCKER)';
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.14 [SKIPPED]: match_teams missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.15: Tournaments with BGMI game_id (sanity: does it exist?)
    -- ----------------------------------------------------------------
    IF v_has_tournaments THEN
        EXECUTE
            'SELECT COUNT(*) FROM public.tournaments WHERE game_id = ''01dae6b9-7e1a-4a70-a452-648e441e2ca2''::uuid'
        INTO v_cnt;
        RAISE NOTICE 'CHECK 6.15 [INFO]: BGMI tournaments in DB (game_id=01dae6b9...): %', v_cnt;
        IF v_cnt = 0 THEN
            RAISE NOTICE 'CHECK 6.15 [WARN]: No BGMI tournaments found — ingestion will create them on first run.';
        END IF;
    ELSE
        RAISE NOTICE 'CHECK 6.15 [SKIPPED]: tournaments table missing.';
    END IF;

    -- ----------------------------------------------------------------
    -- CHECK 6.16: Verify bgmi_match_teams VIEW existence (created by migration)
    -- ----------------------------------------------------------------
    IF to_regclass('public.bgmi_match_teams') IS NOT NULL THEN
        RAISE NOTICE 'CHECK 6.16 [PASS]: bgmi_match_teams VIEW exists (migration step already applied or pre-applied)';
    ELSE
        RAISE NOTICE 'CHECK 6.16 [INFO]: bgmi_match_teams VIEW not present — expected pre-migration.';
    END IF;

    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DATA INTEGRITY CHECKS COMPLETED';
    RAISE NOTICE 'Review all FAIL and WARN notices above before approving migration.';
    RAISE NOTICE '=================================================================';
END $$;

-- ==============================================================================
-- SECTION 7: INDEXES INVENTORY — MIGRATION PREREQUISITE CHECK
-- ==============================================================================
SELECT
    i.relname                                         AS index_name,
    t.relname                                         AS table_name,
    ix.indisunique                                    AS is_unique,
    ix.indisprimary                                   AS is_primary,
    pg_get_indexdef(ix.indexrelid)                    AS index_definition
FROM pg_catalog.pg_index ix
JOIN pg_catalog.pg_class i  ON i.oid = ix.indexrelid
JOIN pg_catalog.pg_class t  ON t.oid = ix.indrelid
JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname IN (
      'match_teams', 'bgmi_stage_standings', 'entity_source_mapping',
      'ingestion_batch_ledger', 'match_player_stats', 'tournament_player_stats',
      'tournament_rosters', 'quarantine_identities'
  )
ORDER BY t.relname, i.relname;

-- ==============================================================================
-- END OF INSPECTION — ROLLBACK (no data written)
-- ==============================================================================
ROLLBACK;

-- Final operator reminder:
-- This script completed with ROLLBACK. No data was modified.
-- Review ALL sections above — especially FAIL and WARN notices in Section 6.
-- Do NOT proceed with migration until all required checks show PASS.

