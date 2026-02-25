-- ============================================================
-- KhelPediA — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. GAMES
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  banner_url TEXT,
  genre TEXT DEFAULT 'FPS',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  region TEXT DEFAULT 'Global',
  country TEXT,
  founded_year INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAYERS
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ign TEXT NOT NULL,  -- in-game name
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  role TEXT DEFAULT 'Player',
  image_url TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  earnings DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOURNAMENTS
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region TEXT DEFAULT 'Global',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('live', 'upcoming', 'completed')),
  prize_pool DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  format TEXT DEFAULT 'Double Elimination',
  tier TEXT DEFAULT 'A',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOURNAMENT ↔ TEAM (many-to-many with placement)
CREATE TABLE IF NOT EXISTS tournament_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  placement INT,
  prize_won DECIMAL(12, 2) DEFAULT 0,
  UNIQUE(tournament_id, team_id)
);

-- 6. PLAYER STATS (per game)
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  assists INT DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  matches_played INT DEFAULT 0,
  rating DECIMAL(4, 2) DEFAULT 0,
  headshot_pct DECIMAL(5, 2) DEFAULT 0,
  avg_damage DECIMAL(8, 2) DEFAULT 0,
  UNIQUE(player_id, game_id)
);

-- 7. MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  score1 INT DEFAULT 0,
  score2 INT DEFAULT 0,
  winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  round TEXT,
  map TEXT,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON tournament_teams(tournament_id);

-- ============================================================
-- ROW LEVEL SECURITY (public read access)
-- ============================================================
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read tournament_teams" ON tournament_teams FOR SELECT USING (true);
CREATE POLICY "Public read player_stats" ON player_stats FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
