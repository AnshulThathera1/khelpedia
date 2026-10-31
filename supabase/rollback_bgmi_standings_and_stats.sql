-- ============================================================
-- KhelPediA — BGMI Battle Royale Extension Schema Rollback
-- Target: khelpedia_staging (and production when reverting)
-- Completely and cleanly reverts all tables, views, triggers, and functions
-- added by proposed_migration_bgmi_standings_and_stats.sql
-- ============================================================

-- 1. Drop Stored Procedure
DROP FUNCTION IF EXISTS public.rollback_ingestion_batch(UUID);

-- 2. Drop Ingestion Batch Ledger
DROP TABLE IF EXISTS public.ingestion_batch_ledger CASCADE;

-- 3. Drop Quarantine Identities
DROP TABLE IF EXISTS public.quarantine_identities CASCADE;

-- 4. Drop Tournament-Level Player Stats
DROP TABLE IF EXISTS public.tournament_player_stats CASCADE;

-- 5. Drop Match-Level Player Stats
DROP TABLE IF EXISTS public.match_player_stats CASCADE;

-- 6. Drop Tournament Rosters
DROP TABLE IF EXISTS public.tournament_rosters CASCADE;

-- 7. Drop BGMI Stage Standings
DROP TABLE IF EXISTS public.bgmi_stage_standings CASCADE;

-- 8. Drop Typed View
DROP VIEW IF EXISTS public.bgmi_match_teams CASCADE;

-- 9. Revert Triggers on match_teams and matches
DROP TRIGGER IF EXISTS trg_match_teams_polymorphic_fk ON public.match_teams;
DROP FUNCTION IF EXISTS public.check_match_teams_polymorphic_fk();

DROP TRIGGER IF EXISTS trg_cascade_matches_delete_match_teams ON public.matches;
DROP FUNCTION IF EXISTS public.cascade_delete_matches_to_match_teams();

DROP TRIGGER IF EXISTS trg_cascade_val_delete_match_teams ON public.valorant_matches;
DROP FUNCTION IF EXISTS public.cascade_delete_valorant_matches_to_match_teams();

-- Drop updated_at trigger helper if not used elsewhere
-- (Kept safely if needed by other tables)
-- DROP FUNCTION IF EXISTS public.set_updated_at_timestamp();

-- 10. Revert columns added to match_teams (if reverting match_teams extension)
DROP INDEX IF EXISTS public.uq_match_teams_source_result;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS source_result_id;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS placement;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS kills;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS placement_points;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS elimination_points;
ALTER TABLE public.match_teams DROP COLUMN IF EXISTS wwcd;

-- Restore Valorant match_teams foreign key constraint if valorant_matches exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'valorant_matches'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'match_teams_match_id_fkey'
        ) THEN
            ALTER TABLE public.match_teams 
            ADD CONSTRAINT match_teams_match_id_fkey 
            FOREIGN KEY (match_id) REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
