-- ============================================================
-- KhelPediA — Fantasy Drafts (Pick'Ems) Schema
-- ============================================================

-- 1. Fantasy Leagues
-- Currently we'll just have one "Global Beta League"
CREATE TABLE IF NOT EXISTS public.fantasy_leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fantasy Teams (User's Org)
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    league_id UUID REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "Anshul's Avengers"
    total_points DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, league_id) -- One team per user per league
);

-- 3. Fantasy Rosters (The 5 drafted players)
CREATE TABLE IF NOT EXISTS public.fantasy_rosters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.fantasy_teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    slot_index INT NOT NULL CHECK (slot_index >= 1 AND slot_index <= 5),
    points_earned DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, slot_index), -- Ensure exactly 1 player per slot
    UNIQUE(team_id, player_id)   -- Ensure a user can't draft the same player twice
);

-- Seed the initial Global League
INSERT INTO public.fantasy_leagues (name, status) 
VALUES ('Global Beta League Season 1', 'active')
ON CONFLICT DO NOTHING;

-- Setup RLS
ALTER TABLE public.fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_rosters ENABLE ROW LEVEL SECURITY;

-- Policies for Fantasy Leagues
DROP POLICY IF EXISTS "Public can read leagues" ON public.fantasy_leagues;
CREATE POLICY "Public can read leagues" ON public.fantasy_leagues FOR SELECT USING (true);

-- Policies for Fantasy Teams
DROP POLICY IF EXISTS "Public can read fantasy teams" ON public.fantasy_teams;
CREATE POLICY "Public can read fantasy teams" ON public.fantasy_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own team" ON public.fantasy_teams;
CREATE POLICY "Users can insert own team" ON public.fantasy_teams FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own team" ON public.fantasy_teams;
CREATE POLICY "Users can update own team" ON public.fantasy_teams FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Fantasy Rosters
DROP POLICY IF EXISTS "Public can read rosters" ON public.fantasy_rosters;
CREATE POLICY "Public can read rosters" ON public.fantasy_rosters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert roster for own team" ON public.fantasy_rosters;
CREATE POLICY "Users can insert roster for own team" ON public.fantasy_rosters FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = team_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update roster for own team" ON public.fantasy_rosters;
CREATE POLICY "Users can update roster for own team" ON public.fantasy_rosters FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = team_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete roster for own team" ON public.fantasy_rosters;
CREATE POLICY "Users can delete roster for own team" ON public.fantasy_rosters FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = team_id AND user_id = auth.uid())
);
