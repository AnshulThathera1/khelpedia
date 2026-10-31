-- ============================================================
-- KhelPediA — BGMI Battle Royale Extension & Ingestion Ledger Migration
-- Target: Architecture Remediation (Review-Only SQL — Do Not Execute Against Live DB)
-- Architecture: Reconciles Valorant (TEXT keys) & BGMI (UUID keys)
-- Idempotent | Strict NULL Semantics | Automated Updated_At Triggers | Atomic Rollback
-- ============================================================

-- 1. Helper Function: Automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. RECONCILE match_teams (Valorant + BGMI Polymorphic Support)
-- ============================================================

-- Ensure match_teams table exists (if not created by Valorant schema)
CREATE TABLE IF NOT EXISTS public.match_teams (
    match_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    won BOOLEAN DEFAULT FALSE,
    rounds_won INT DEFAULT NULL,
    rounds_played INT DEFAULT NULL,
    num_points INT DEFAULT NULL,
    PRIMARY KEY (match_id, team_id)
);

-- Relax Valorant-specific NOT NULL constraints to accommodate multi-team Battle Royale
ALTER TABLE public.match_teams ALTER COLUMN won DROP NOT NULL;
ALTER TABLE public.match_teams ALTER COLUMN won SET DEFAULT FALSE;
ALTER TABLE public.match_teams ALTER COLUMN rounds_won DROP NOT NULL;
ALTER TABLE public.match_teams ALTER COLUMN rounds_played DROP NOT NULL;
ALTER TABLE public.match_teams ALTER COLUMN num_points DROP NOT NULL;

-- Add Battle Royale telemetry & provenance columns
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS source_result_id TEXT DEFAULT NULL;
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS placement INT DEFAULT NULL;
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS kills INT DEFAULT NULL;
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS placement_points INT DEFAULT NULL;
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS elimination_points INT DEFAULT NULL;
ALTER TABLE public.match_teams ADD COLUMN IF NOT EXISTS wwcd BOOLEAN DEFAULT FALSE;

-- Drop legacy hard foreign key constraint referencing valorant_matches exclusively
ALTER TABLE public.match_teams DROP CONSTRAINT IF EXISTS match_teams_match_id_fkey;

-- Ensure performance index on source_result_id for provenance lookups
CREATE INDEX IF NOT EXISTS idx_match_teams_source_result 
ON public.match_teams(source_result_id) 
WHERE source_result_id IS NOT NULL;

-- Relational constraint on (match_id, team_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'match_teams_match_id_team_id_key'
    ) THEN
        ALTER TABLE public.match_teams ADD CONSTRAINT match_teams_match_id_team_id_key UNIQUE (match_id, team_id);
    END IF;
END $$;

-- Polymorphic Foreign Key Validation Trigger for match_teams
-- Validates that match_id exists in valorant_matches OR in canonical matches
-- Replaces catalog queries with fast to_regclass check and validates team_id
CREATE OR REPLACE FUNCTION public.check_match_teams_polymorphic_fk()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if parent match exists in canonical matches
    IF EXISTS (SELECT 1 FROM public.matches WHERE id::text = NEW.match_id) THEN
        -- If match is canonical BGMI, team_id should exist in canonical teams OR follow UUID syntax
        IF NEW.team_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id::text = NEW.team_id) THEN
                RAISE EXCEPTION 'Foreign key violation: team_id % does not exist in teams table', NEW.team_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Check if parent match exists in valorant_matches (using fast regclass check)
    IF to_regclass('public.valorant_matches') IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.valorant_matches WHERE match_id = NEW.match_id) THEN
            RETURN NEW;
        END IF;
    END IF;

    RAISE EXCEPTION 'Foreign key violation: match_id % does not exist in matches or valorant_matches', NEW.match_id;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_teams_polymorphic_fk'
    ) THEN
        CREATE TRIGGER trg_match_teams_polymorphic_fk
        BEFORE INSERT OR UPDATE ON public.match_teams
        FOR EACH ROW EXECUTE FUNCTION public.check_match_teams_polymorphic_fk();
    END IF;
END $$;

-- Cascading delete maintenance: Delete match_teams when canonical matches are deleted
CREATE OR REPLACE FUNCTION public.cascade_delete_matches_to_match_teams()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.match_teams WHERE match_id = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cascade_matches_delete_match_teams'
    ) THEN
        CREATE TRIGGER trg_cascade_matches_delete_match_teams
        AFTER DELETE ON public.matches
        FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_matches_to_match_teams();
    END IF;
END $$;

-- Cascading delete maintenance: Delete match_teams when canonical teams are deleted
CREATE OR REPLACE FUNCTION public.cascade_delete_teams_to_match_teams()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.match_teams WHERE team_id = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cascade_teams_delete_match_teams'
    ) THEN
        CREATE TRIGGER trg_cascade_teams_delete_match_teams
        AFTER DELETE ON public.teams
        FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_teams_to_match_teams();
    END IF;
END $$;

-- Cascading delete maintenance: Delete match_teams when valorant_matches are deleted
CREATE OR REPLACE FUNCTION public.cascade_delete_valorant_matches_to_match_teams()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.match_teams WHERE match_id = OLD.match_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF to_regclass('public.valorant_matches') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cascade_val_delete_match_teams'
        ) THEN
            CREATE TRIGGER trg_cascade_val_delete_match_teams
            AFTER DELETE ON public.valorant_matches
            FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_valorant_matches_to_match_teams();
        END IF;
    END IF;
END $$;

-- Typed view for BGMI queries with safe UUID casting (guarded against Valorant TEXT keys)
CREATE OR REPLACE VIEW public.bgmi_match_teams AS
SELECT 
    CASE 
        WHEN mt.match_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN mt.match_id::uuid 
        ELSE NULL 
    END AS match_id,
    CASE 
        WHEN mt.team_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN mt.team_id::uuid 
        ELSE NULL 
    END AS team_id,
    mt.source_result_id,
    mt.placement,
    mt.placement_points,
    mt.elimination_points,
    mt.num_points,
    mt.wwcd,
    mt.kills,
    mt.won
FROM public.match_teams mt
WHERE mt.match_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id::text = mt.match_id);

-- ============================================================
-- 3. BGMI Stage Standings Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bgmi_stage_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL DEFAULT 'Overall',
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    rank_position INT NOT NULL,
    matches_played INT DEFAULT NULL,
    wwcd_count INT DEFAULT NULL,
    placement_pts INT DEFAULT NULL,
    elimination_pts INT DEFAULT NULL,
    total_pts INT DEFAULT NULL,
    bonus_pts INT DEFAULT NULL,
    stage_type VARCHAR(50) DEFAULT 'overall',
    tiebreaker_rule VARCHAR(50) DEFAULT NULL,
    tiebreaker_note TEXT DEFAULT NULL,
    source_attribution_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT bgmi_stage_standings_unique UNIQUE (tournament_id, stage_name, team_id)
);

-- Explicitly ensure columns exist even if table was pre-created by legacy schema_bgmi.sql
ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS bonus_pts INT DEFAULT NULL;
ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS stage_type VARCHAR(50) DEFAULT 'overall';
ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS tiebreaker_rule VARCHAR(50) DEFAULT NULL;
ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS tiebreaker_note TEXT DEFAULT NULL;
ALTER TABLE public.bgmi_stage_standings ADD COLUMN IF NOT EXISTS source_attribution_url TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_bgmi_stage_standings_tourney 
ON public.bgmi_stage_standings(tournament_id, rank_position);

CREATE INDEX IF NOT EXISTS idx_bgmi_stage_standings_team 
ON public.bgmi_stage_standings(team_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bgmi_stage_standings_updated_at'
    ) THEN
        CREATE TRIGGER trg_bgmi_stage_standings_updated_at
        BEFORE UPDATE ON public.bgmi_stage_standings
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
    END IF;
END $$;

-- ============================================================
-- 4. Tournament Rosters Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'player',
    joined_at DATE DEFAULT NULL,
    left_at DATE DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tournament_rosters_no_date 
ON public.tournament_rosters(tournament_id, team_id, player_id) 
WHERE joined_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tournament_rosters_with_date 
ON public.tournament_rosters(tournament_id, team_id, player_id, joined_at) 
WHERE joined_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tournament_rosters_lookup 
ON public.tournament_rosters(tournament_id, team_id, player_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tournament_rosters_updated_at'
    ) THEN
        CREATE TRIGGER trg_tournament_rosters_updated_at
        BEFORE UPDATE ON public.tournament_rosters
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
    END IF;
END $$;

-- ============================================================
-- 5. Match-Level Player Stats Table (Per Match Telemetry)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    kills INT DEFAULT NULL CHECK (kills IS NULL OR (kills >= 0 AND kills <= 30)),
    damage NUMERIC(10, 2) DEFAULT NULL CHECK (damage IS NULL OR (damage >= 0 AND damage <= 10000.0)),
    assists INT DEFAULT NULL CHECK (assists IS NULL OR (assists >= 0 AND assists <= 30)),
    survival_time_sec INT DEFAULT NULL CHECK (survival_time_sec IS NULL OR (survival_time_sec >= 0 AND survival_time_sec <= 2400)),
    source_stat_id TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_match_player UNIQUE (match_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_match_player_stats_match 
ON public.match_player_stats(match_id);

CREATE INDEX IF NOT EXISTS idx_match_player_stats_player 
ON public.match_player_stats(player_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_player_stats_updated_at'
    ) THEN
        CREATE TRIGGER trg_match_player_stats_updated_at
        BEFORE UPDATE ON public.match_player_stats
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
    END IF;
END $$;

-- ============================================================
-- 6. Tournament-Level Player Stats Table (Aggregates)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL DEFAULT 'Overall',
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    matches_played INT DEFAULT NULL CHECK (matches_played IS NULL OR matches_played >= 0),
    total_kills INT DEFAULT NULL CHECK (total_kills IS NULL OR total_kills >= 0),
    total_damage NUMERIC(10, 2) DEFAULT NULL CHECK (total_damage IS NULL OR total_damage >= 0),
    mvp_count INT DEFAULT 0 CHECK (mvp_count >= 0),
    is_derived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tournament_player_stage UNIQUE (tournament_id, stage_name, player_id)
);

CREATE INDEX IF NOT EXISTS idx_tourney_player_stats_lookup 
ON public.tournament_player_stats(tournament_id, stage_name, total_kills DESC NULLS LAST);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tournament_player_stats_updated_at'
    ) THEN
        CREATE TRIGGER trg_tournament_player_stats_updated_at
        BEFORE UPDATE ON public.tournament_player_stats
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
    END IF;
END $$;

-- ============================================================
-- 7. Quarantine Identities Table (Conflict & Ambiguity Queue)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quarantine_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,
    source_entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('tournament', 'team', 'player', 'match')),
    external_name TEXT NOT NULL,
    candidate_internal_id UUID,
    conflict_code VARCHAR(50) NOT NULL,
    conflict_reason TEXT NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarantine_identities_status 
ON public.quarantine_identities(status, source);

-- ============================================================
-- 8. Ingestion Batch Ledger Table (Atomic Manifest & Rollback)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ingestion_batch_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL UNIQUE,
    source TEXT NOT NULL,
    target_tournament_slug TEXT,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMMITTED', 'ROLLED_BACK', 'FAILED')),
    manifest JSONB NOT NULL DEFAULT '{"createdEntities": [], "linkedEntities": [], "updatedEntities": [], "createdDependents": []}'::jsonb,
    created_records_count INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    rolled_back_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_batch_ledger_status 
ON public.ingestion_batch_ledger(status, source);

-- ============================================================
-- 9. Stored Procedure: Execute Batch Rollback with Restore & Safety Checks
-- ============================================================
CREATE OR REPLACE FUNCTION public.rollback_ingestion_batch(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_batch RECORD;
    v_manifest JSONB;
    v_entity RECORD;
    v_conflict_batch UUID;
    v_purged_stats INT := 0;
    v_purged_match_teams INT := 0;
    v_purged_tourney_stats INT := 0;
    v_purged_standings INT := 0;
    v_purged_rosters INT := 0;
    v_purged_matches INT := 0;
    v_purged_tournaments INT := 0;
    v_purged_players INT := 0;
    v_purged_teams INT := 0;
    v_restored_entities INT := 0;
    v_purged_mappings INT := 0;
    v_purged_quarantine INT := 0;
BEGIN
    SELECT * INTO v_batch FROM public.ingestion_batch_ledger WHERE batch_id = p_batch_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch % not found in ingestion_batch_ledger', p_batch_id;
    END IF;

    -- Transaction-scoped advisory lock on tournament to prevent concurrent ingestion or rollback collisions
    IF v_batch.target_tournament_slug IS NOT NULL THEN
        PERFORM pg_advisory_xact_lock(('x' || substr(md5(v_batch.source || ':' || v_batch.target_tournament_slug), 1, 16))::bit(64)::bigint);
    END IF;

    IF v_batch.status = 'ROLLED_BACK' THEN
        RAISE NOTICE 'Batch % was already rolled back at %', p_batch_id, v_batch.rolled_back_at;
        RETURN jsonb_build_object('batch_id', p_batch_id, 'status', 'ALREADY_ROLLED_BACK');
    END IF;

    v_manifest := v_batch.manifest;

    -- Cross-Batch Dependency Check: Ensure subsequent committed batches do not link to entities created by this batch
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdEntities', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        SELECT batch_id INTO v_conflict_batch
        FROM public.ingestion_batch_ledger
        WHERE status = 'COMMITTED'
          AND batch_id != p_batch_id
          AND manifest->'linkedEntities' @> jsonb_build_array(jsonb_build_object('table_name', v_entity.table_name, 'id', v_entity.id))
        LIMIT 1;

        IF FOUND THEN
            RAISE EXCEPTION 'Cross-batch dependency block: Cannot rollback batch %. Entity % (%) is linked by subsequent committed batch %', 
                p_batch_id, v_entity.table_name, v_entity.id, v_conflict_batch;
        END IF;
    END LOOP;

    -- 1. Restore updated pre-existing entities to their pre-update snapshot values
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'updatedEntities', '[]'::jsonb)) AS x(table_name text, id uuid, previous_values jsonb)
    LOOP
        IF v_entity.table_name = 'tournaments' AND v_entity.previous_values IS NOT NULL THEN
            UPDATE public.tournaments
            SET status = COALESCE(v_entity.previous_values->>'status', status),
                prize_pool = COALESCE((v_entity.previous_values->>'prize_pool')::numeric, prize_pool),
                start_date = COALESCE((v_entity.previous_values->>'start_date')::date, start_date),
                end_date = COALESCE((v_entity.previous_values->>'end_date')::date, end_date)
            WHERE id = v_entity.id;
            v_restored_entities := v_restored_entities + 1;
        END IF;
    END LOOP;

    -- 2. Purge leaf player stats & dependents
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdDependents', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        IF v_entity.table_name = 'match_player_stats' THEN
            DELETE FROM public.match_player_stats WHERE id = v_entity.id;
            v_purged_stats := v_purged_stats + 1;
        ELSIF v_entity.table_name = 'tournament_player_stats' THEN
            DELETE FROM public.tournament_player_stats WHERE id = v_entity.id;
            v_purged_tourney_stats := v_purged_tourney_stats + 1;
        ELSIF v_entity.table_name = 'bgmi_stage_standings' THEN
            DELETE FROM public.bgmi_stage_standings WHERE id = v_entity.id;
            v_purged_standings := v_purged_standings + 1;
        ELSIF v_entity.table_name = 'tournament_rosters' THEN
            DELETE FROM public.tournament_rosters WHERE id = v_entity.id;
            v_purged_rosters := v_purged_rosters + 1;
        ELSIF v_entity.table_name = 'match_teams' THEN
            DELETE FROM public.match_teams WHERE match_id = v_entity.id::text;
            v_purged_match_teams := v_purged_match_teams + 1;
        END IF;
    END LOOP;

    -- 3. Purge created matches
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdEntities', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        IF v_entity.table_name = 'matches' THEN
            DELETE FROM public.match_teams WHERE match_id = v_entity.id::text;
            DELETE FROM public.matches WHERE id = v_entity.id;
            v_purged_matches := v_purged_matches + 1;
        END IF;
    END LOOP;

    -- 4. Purge created tournaments (cascades tournament_teams, etc.)
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdEntities', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        IF v_entity.table_name = 'tournaments' THEN
            DELETE FROM public.tournaments WHERE id = v_entity.id;
            v_purged_tournaments := v_purged_tournaments + 1;
        END IF;
    END LOOP;

    -- 5. Purge created players (ONLY IF newly created by this batch)
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdEntities', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        IF v_entity.table_name = 'players' THEN
            DELETE FROM public.players WHERE id = v_entity.id;
            v_purged_players := v_purged_players + 1;
        END IF;
    END LOOP;

    -- 6. Purge created teams (ONLY IF newly created by this batch; NEVER touch pre-existing canonical teams)
    FOR v_entity IN SELECT * FROM jsonb_to_recordset(COALESCE(v_manifest->'createdEntities', '[]'::jsonb)) AS x(table_name text, id uuid)
    LOOP
        IF v_entity.table_name = 'teams' THEN
            DELETE FROM public.teams WHERE id = v_entity.id;
            v_purged_teams := v_purged_teams + 1;
        END IF;
    END LOOP;

    -- 7. Purge source mappings associated with this batch
    DELETE FROM public.entity_source_mapping 
    WHERE (metadata->>'import_batch_id') = p_batch_id::text;
    GET DIAGNOSTICS v_purged_mappings = ROW_COUNT;

    -- 8. Purge quarantine identities associated with this batch
    DELETE FROM public.quarantine_identities 
    WHERE (payload->>'batch_id') = p_batch_id::text;
    GET DIAGNOSTICS v_purged_quarantine = ROW_COUNT;

    -- 9. Mark batch as ROLLED_BACK
    UPDATE public.ingestion_batch_ledger
    SET status = 'ROLLED_BACK',
        rolled_back_at = NOW()
    WHERE batch_id = p_batch_id;

    RETURN jsonb_build_object(
        'batch_id', p_batch_id,
        'status', 'ROLLED_BACK',
        'restored_entities', v_restored_entities,
        'purged_match_player_stats', v_purged_stats,
        'purged_match_teams', v_purged_match_teams,
        'purged_tournament_player_stats', v_purged_tourney_stats,
        'purged_bgmi_stage_standings', v_purged_standings,
        'purged_tournament_rosters', v_purged_rosters,
        'purged_matches', v_purged_matches,
        'purged_tournaments', v_purged_tournaments,
        'purged_players', v_purged_players,
        'purged_teams', v_purged_teams,
        'purged_entity_source_mappings', v_purged_mappings,
        'purged_quarantine_identities', v_purged_quarantine
    );
END;
$$ LANGUAGE plpgsql;
