-- ==============================================================================
-- KhelPediA — Non-Destructive BGMI Extension Schema Rollback
-- Target: Supabase / PostgreSQL Staging & Production Rollback
-- Mode: Safe DDL Reversion (Preserves Pre-Existing Tables & Legacy Standings)
-- ==============================================================================

BEGIN;

-- 1. Drop Stored Procedure
DROP FUNCTION IF EXISTS public.rollback_ingestion_batch(UUID);

-- 2. Drop Ingestion Batch Ledger (Newly created by migration)
DROP TABLE IF EXISTS public.ingestion_batch_ledger CASCADE;

-- 3. Drop Quarantine Identities (Newly created by migration)
DROP TABLE IF EXISTS public.quarantine_identities CASCADE;

-- 4. Drop Tournament-Level Player Stats (Newly created by migration)
DROP TABLE IF EXISTS public.tournament_player_stats CASCADE;

-- 5. Drop Match-Level Player Stats (Newly created by migration)
DROP TABLE IF EXISTS public.match_player_stats CASCADE;

-- 6. Drop Tournament Rosters (Newly created by migration)
DROP TABLE IF EXISTS public.tournament_rosters CASCADE;

-- 7. Non-Destructive Reversion of BGMI Stage Standings:
-- If the table pre-existed (from schema_bgmi.sql), DO NOT DROP TABLE CASCADE!
-- Only drop the newly added columns and triggers introduced by the migration.
DO $$
BEGIN
    IF to_regclass('public.bgmi_stage_standings') IS NOT NULL THEN
        -- Remove migration-added triggers
        DROP TRIGGER IF EXISTS trg_bgmi_stage_standings_updated_at ON public.bgmi_stage_standings;
        
        -- Drop migration-added columns
        ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS bonus_pts;
        ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS stage_type;
        ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS tiebreaker_rule;
        ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS tiebreaker_note;
        ALTER TABLE public.bgmi_stage_standings DROP COLUMN IF EXISTS source_attribution_url;
    END IF;
END $$;

-- 8. Drop Typed View (Safe: Views contain no storage data)
DROP VIEW IF EXISTS public.bgmi_match_teams CASCADE;

-- 9. Revert Triggers and Polymorphic Functions
DROP TRIGGER IF EXISTS trg_match_teams_polymorphic_fk ON public.match_teams;
DROP FUNCTION IF EXISTS public.check_match_teams_polymorphic_fk();

DROP TRIGGER IF EXISTS trg_cascade_matches_delete_match_teams ON public.matches;
DROP FUNCTION IF EXISTS public.cascade_delete_matches_to_match_teams();

DROP TRIGGER IF EXISTS trg_cascade_teams_delete_match_teams ON public.teams;
DROP FUNCTION IF EXISTS public.cascade_delete_teams_to_match_teams();

DROP TRIGGER IF EXISTS trg_cascade_val_delete_match_teams ON public.valorant_matches;
DROP FUNCTION IF EXISTS public.cascade_delete_valorant_matches_to_match_teams();

-- 10. Revert columns added to match_teams (if reverting match_teams extension)
DROP INDEX IF EXISTS public.uq_match_teams_source_result;
DROP INDEX IF EXISTS public.idx_match_teams_source_result;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS source_result_id;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS placement;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS kills;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS placement_points;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS elimination_points;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS wwcd;

-- 11. Conditionally restore Valorant match_teams foreign key constraint IF valorant_matches exists
DO $$
BEGIN
    IF to_regclass('public.valorant_matches') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'match_teams_match_id_fkey'
        ) THEN
            ALTER TABLE public.match_teams 
            ADD CONSTRAINT match_teams_match_id_fkey 
            FOREIGN KEY (match_id) REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

COMMIT;
