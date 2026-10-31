-- ==============================================================================
-- KhelPediA — Production Preflight Read-Only Inspection Script
-- Target: Supabase / PostgreSQL Production Environment
-- Mode: STRICTLY READ-ONLY (Zero Mutations, Zero Side-Effects)
-- Instructions for Operator:
--   1. Connect using a READ-ONLY role or execute inside a read-only transaction:
--        BEGIN TRANSACTION READ ONLY;
--   2. Review Section 1 outputs to verify you are connected to the correct database.
--   3. Review Section 2-5 catalog and data-integrity reports.
--   4. Close the session or run:
--        ROLLBACK;
-- ==============================================================================

BEGIN TRANSACTION READ ONLY;

-- ==============================================================================
-- SECTION 1: DATABASE IDENTITY & SESSION VERIFICATION
-- ==============================================================================
SELECT 
    current_database() AS database_name,
    current_user AS connected_user,
    version() AS postgres_version,
    inet_server_addr() AS server_ip,
    inet_server_port() AS server_port,
    current_setting('transaction_read_only') AS is_read_only_session;

-- Operator verification note:
-- STOP if database_name, server_ip, or connected_user does not match your intended project!

-- 1.1. Explicit Role Write Privilege Audit (Confirm zero write privileges)
SELECT 
    current_user AS role_name,
    CASE WHEN to_regclass('public.matches') IS NOT NULL 
         THEN has_table_privilege(current_user, 'public.matches', 'INSERT') 
         ELSE false 
    END AS can_insert_matches,
    CASE WHEN to_regclass('public.matches') IS NOT NULL 
         THEN has_table_privilege(current_user, 'public.matches', 'UPDATE') 
         ELSE false 
    END AS can_update_matches,
    CASE WHEN to_regclass('public.matches') IS NOT NULL 
         THEN has_table_privilege(current_user, 'public.matches', 'DELETE') 
         ELSE false 
    END AS can_delete_matches;

-- ==============================================================================
-- SECTION 2: EXTENSION & CAPABILITY AUDIT
-- ==============================================================================
SELECT 
    extname AS extension_name,
    extversion AS installed_version
FROM pg_catalog.pg_extension
WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- Check if gen_random_uuid() is callable natively
SELECT 
    proname AS native_uuid_function,
    prosrc AS function_source
FROM pg_catalog.pg_proc
WHERE proname = 'gen_random_uuid';

-- ==============================================================================
-- SECTION 3: CONDITIONAL OBJECT EXISTENCE AUDIT (CATALOG CHECKS)
-- ==============================================================================
SELECT 
    target_object,
    to_regclass(target_object) IS NOT NULL AS object_exists,
    c.relkind AS object_kind, -- 'r' = table, 'v' = view, 'm' = materialized view
    pg_size_pretty(pg_total_relation_size(to_regclass(target_object))) AS total_relation_size
FROM (
    VALUES 
        ('public.matches'),
        ('public.tournaments'),
        ('public.teams'),
        ('public.players'),
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
        ('public.bgmi_match_teams')
) AS objects(target_object)
LEFT JOIN pg_catalog.pg_class c ON c.oid = to_regclass(target_object);

-- ==============================================================================
-- SECTION 4: SCHEMA COMPATIBILITY & COLUMN INVENTORY
-- ==============================================================================

-- 4.1. Inspect public.match_teams columns (if table exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'match_teams'
ORDER BY ordinal_position;

-- 4.2. Inspect public.match_teams existing constraints
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type, -- 'p' = pkey, 'f' = fkey, 'u' = unique, 'c' = check
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_catalog.pg_constraint con
JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public' AND rel.relname = 'match_teams';

-- 4.3. Inspect public.bgmi_stage_standings columns (if pre-existing)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bgmi_stage_standings'
ORDER BY ordinal_position;

-- 4.4. Inspect active triggers on relevant tables
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('match_teams', 'matches', 'teams', 'valorant_matches', 'bgmi_stage_standings')
ORDER BY event_object_table, trigger_name;

-- ==============================================================================
-- SECTION 5: DATA INTEGRITY & CONSTRAINT COMPATIBILITY AUDIT
-- (Runs dynamically to avoid syntax failures if tables do not exist yet)
-- ==============================================================================
DO $$
DECLARE
    v_has_match_teams BOOLEAN := to_regclass('public.match_teams') IS NOT NULL;
    v_has_matches BOOLEAN := to_regclass('public.matches') IS NOT NULL;
    v_has_val_matches BOOLEAN := to_regclass('public.valorant_matches') IS NOT NULL;
    v_has_standings BOOLEAN := to_regclass('public.bgmi_stage_standings') IS NOT NULL;
    v_has_mappings BOOLEAN := to_regclass('public.entity_source_mapping') IS NOT NULL;
    v_cnt INT;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'STARTING DYNAMIC INTEGRITY AUDIT';
    RAISE NOTICE '==================================================';

    -- 5.1. Orphaned match_teams match_id check
    IF v_has_match_teams AND v_has_matches THEN
        IF v_has_val_matches THEN
            EXECUTE 'SELECT COUNT(*) FROM public.match_teams mt 
                     WHERE NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id)
                       AND NOT EXISTS (SELECT 1 FROM public.valorant_matches vm WHERE vm.match_id = mt.match_id)'
            INTO v_cnt;
            RAISE NOTICE 'DATA CHECK: Orphaned match_teams (not in matches AND not in valorant_matches): %', v_cnt;
        ELSE
            EXECUTE 'SELECT COUNT(*) FROM public.match_teams mt 
                     WHERE NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id)'
            INTO v_cnt;
            RAISE NOTICE 'DATA CHECK: Orphaned match_teams (valorant_matches missing; not in matches): %', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'DATA CHECK: match_teams or matches does not exist yet. Skipping orphan check.';
    END IF;

    -- 5.1b. Orphaned team_id check in match_teams (UUIDs not found in canonical teams)
    IF v_has_match_teams AND to_regclass('public.teams') IS NOT NULL THEN
        EXECUTE 'SELECT COUNT(*) FROM public.match_teams mt 
                 WHERE mt.team_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''
                   AND NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.id::text = mt.team_id)'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: match_teams rows with UUID team_id missing from teams: % (Must be 0)', v_cnt;
    END IF;

    -- 5.2. Duplicate (match_id, team_id) pairs in match_teams
    IF v_has_match_teams THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT match_id, team_id, COUNT(*) 
                    FROM public.match_teams 
                    GROUP BY match_id, team_id 
                    HAVING COUNT(*) > 1
                 ) t'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: Duplicate (match_id, team_id) in match_teams: % (Must be 0 for UNIQUE constraint)', v_cnt;
    END IF;

    -- 5.3. Identifier format analysis on match_teams
    IF v_has_match_teams THEN
        EXECUTE 'SELECT COUNT(*) FROM public.match_teams 
                 WHERE match_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'''
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: match_teams rows using canonical UUID match_ids: %', v_cnt;

        EXECUTE 'SELECT COUNT(*) FROM public.match_teams 
                 WHERE NOT (match_id ~* ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'')'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: match_teams rows using non-UUID text match_ids (e.g. Valorant): %', v_cnt;
    END IF;

    -- 5.4. Cross-game ID collisions (match_id existing in BOTH matches and valorant_matches)
    IF v_has_matches AND v_has_val_matches THEN
        EXECUTE 'SELECT COUNT(*) FROM public.matches m 
                 JOIN public.valorant_matches vm ON vm.match_id = m.id::text'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: Cross-game match_id collisions (matches vs valorant_matches): % (Must be 0)', v_cnt;
    END IF;

    -- 5.5. Existing bgmi_stage_standings duplicates & point equation anomalies
    IF v_has_standings THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT tournament_id, stage_name, team_id, COUNT(*) 
                    FROM public.bgmi_stage_standings 
                    GROUP BY tournament_id, stage_name, team_id 
                    HAVING COUNT(*) > 1
                 ) t'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: Duplicate (tournament_id, stage_name, team_id) in bgmi_stage_standings: %', v_cnt;

        -- Point equation check (dynamically guarded if bonus_pts column is present)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'bgmi_stage_standings' 
              AND column_name = 'bonus_pts'
        ) THEN
            EXECUTE 'SELECT COUNT(*) FROM public.bgmi_stage_standings 
                     WHERE total_pts IS NOT NULL 
                       AND placement_pts IS NOT NULL 
                       AND elimination_pts IS NOT NULL 
                       AND (placement_pts + elimination_pts + COALESCE(bonus_pts, 0) != total_pts)'
            INTO v_cnt;
        ELSE
            EXECUTE 'SELECT COUNT(*) FROM public.bgmi_stage_standings 
                     WHERE total_pts IS NOT NULL 
                       AND placement_pts IS NOT NULL 
                       AND elimination_pts IS NOT NULL 
                       AND (placement_pts + elimination_pts != total_pts)'
            INTO v_cnt;
        END IF;
        RAISE NOTICE 'DATA CHECK: Point equation anomalies in bgmi_stage_standings: % (Must be 0)', v_cnt;
        -- 5.5b. Orphaned foreign keys in bgmi_stage_standings
        IF to_regclass('public.tournaments') IS NOT NULL THEN
            EXECUTE 'SELECT COUNT(*) FROM public.bgmi_stage_standings s
                     WHERE NOT EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = s.tournament_id)'
            INTO v_cnt;
            RAISE NOTICE 'DATA CHECK: Standings with orphaned tournament_id: % (Must be 0)', v_cnt;
        END IF;
        IF to_regclass('public.teams') IS NOT NULL THEN
            EXECUTE 'SELECT COUNT(*) FROM public.bgmi_stage_standings s
                     WHERE NOT EXISTS (SELECT 1 FROM public.teams t WHERE t.id = s.team_id)'
            INTO v_cnt;
            RAISE NOTICE 'DATA CHECK: Standings with orphaned team_id: % (Must be 0)', v_cnt;
        END IF;
    ELSE
        RAISE NOTICE 'DATA CHECK: bgmi_stage_standings does not exist yet. No legacy standings anomalies.';
    END IF;

    -- 5.6. entity_source_mapping unique constraint violations
    IF v_has_mappings THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT source, source_entity_id, entity_type, COUNT(*) 
                    FROM public.entity_source_mapping 
                    GROUP BY source, source_entity_id, entity_type 
                    HAVING COUNT(*) > 1
                 ) t'
        INTO v_cnt;
        RAISE NOTICE 'DATA CHECK: Duplicate mappings in entity_source_mapping: %', v_cnt;
    ELSE
        RAISE NOTICE 'DATA CHECK: entity_source_mapping does NOT exist in target database! (PREREQUISITE WARNING)';
    END IF;

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'PREFLIGHT AUDIT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '==================================================';
END $$;

-- End inspection cleanly without committing any changes
ROLLBACK;
