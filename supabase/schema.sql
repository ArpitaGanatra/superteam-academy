-- Superteam Academy — Supabase schema
-- Run this in the Supabase SQL Editor to create the users table.

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  email TEXT,
  google_id TEXT,
  github_id TEXT,
  name TEXT NOT NULL DEFAULT 'Learner',
  username TEXT UNIQUE,
  bio TEXT DEFAULT '',
  initials TEXT DEFAULT 'SL',
  avatar_url TEXT,
  join_date TIMESTAMPTZ DEFAULT now(),
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'pt-BR', 'es')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  is_public BOOLEAN DEFAULT true,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_wallet ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google ON public.users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_github ON public.users(github_id) WHERE github_id IS NOT NULL;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public profiles are readable by anyone (anon key)
CREATE POLICY users_select ON public.users
  FOR SELECT USING (true);

-- Writes go through API routes using the service role key (bypasses RLS)
-- These policies exist so the service role key can still operate
CREATE POLICY users_insert ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY users_update ON public.users
  FOR UPDATE USING (true);

CREATE POLICY users_delete ON public.users
  FOR DELETE USING (true);
