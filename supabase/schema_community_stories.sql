-- ============================================================
-- KhelPediA — Community Stories & Submissions Schema
-- ============================================================

-- 1. COMMUNITY STORIES TABLE
CREATE TABLE IF NOT EXISTS public.community_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich editorial HTML/text
  cover_image TEXT,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  game_name TEXT,
  category TEXT NOT NULL DEFAULT 'Player Story',
  
  -- Player Feature Specifics (Optional/Nullable)
  player_name TEXT,
  player_ign TEXT,
  player_uid TEXT,
  player_mode TEXT,
  player_profile_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  
  -- Stats Highlight (JSONB Array: [{ "label": "Matches", "value": "32,819" }, ...])
  stats_highlight JSONB,
  verification_notes TEXT,
  
  -- Editorial Authorship
  author_name TEXT DEFAULT 'KhelPediA Editorial',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Publishing & Workflow Controls
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- SEO & Metadata
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  views INT DEFAULT 0
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_community_stories_status ON public.community_stories(status);
CREATE INDEX IF NOT EXISTS idx_community_stories_published_at ON public.community_stories(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_community_stories_game ON public.community_stories(game_id);
CREATE INDEX IF NOT EXISTS idx_community_stories_category ON public.community_stories(category);
CREATE INDEX IF NOT EXISTS idx_community_stories_featured ON public.community_stories(featured) WHERE status = 'published';

-- 2. COMMUNITY STORY SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_story_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  game TEXT NOT NULL,
  ign TEXT,
  story TEXT NOT NULL,
  screenshots_notes TEXT,
  social_links TEXT,
  khelpedia_username TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  editorial_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_story_submissions_status ON public.community_story_submissions(status);
CREATE INDEX IF NOT EXISTS idx_community_story_submissions_created_at ON public.community_story_submissions(created_at DESC);
