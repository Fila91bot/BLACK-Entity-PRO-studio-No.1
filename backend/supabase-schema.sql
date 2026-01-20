-- ============================================
-- GEMINI STUDIO PRO - Supabase Database Schema
-- ============================================
-- Ove SQL naredbe izvrši u Supabase SQL Editoru
-- Execute these SQL commands in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- ============================================
-- USERS TABLE (Korisnici)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_subscribed BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER DEFAULT 0,
  tokens_used_24h INTEGER DEFAULT 0,
  last_token_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index za brže pretrage
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscribed ON users(is_subscribed);

-- ============================================
-- SESSIONS TABLE (Chat sesije)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- MESSAGES TABLE (Poruke u chatu)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- ============================================
-- USAGE LOGS TABLE (Logovi korištenja)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'chat', 'image', 'subscription'
  tokens_used INTEGER DEFAULT 0,
  suspicious BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- ============================================
-- FUNCTION: Increment tokens_used
-- ============================================
CREATE OR REPLACE FUNCTION increment_tokens_used(
  user_id_input UUID,
  tokens INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  -- Ažuriraj tokens_used za korisnika
  UPDATE users
  SET 
    tokens_used = tokens_used + tokens,
    tokens_used_24h = tokens_used_24h + tokens,
    updated_at = NOW()
  WHERE user_id = user_id_input;

  -- Reset 24h counter ako je prošlo više od 24 sata
  UPDATE users
  SET 
    tokens_used_24h = tokens,
    last_token_reset = NOW()
  WHERE user_id = user_id_input
    AND last_token_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Auto update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggeri za auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) - VAŽNO za sigurnost!
-- ============================================

-- Omogući RLS na svim tablicama
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies za users tablicu
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies za sessions tablicu
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies za messages tablicu
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies za usage_logs tablicu
CREATE POLICY "Users can view own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (true); -- Backend može insertat bilo što

-- ============================================
-- SAMPLE DATA (Testni podaci - opciono)
-- ============================================
-- Ovo je samo za testiranje, možeš izbrisati

-- INSERT INTO users (user_id, email, is_subscribed, tokens_used)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   false,
--   5
-- );

-- ============================================
-- GOTOVO! 
-- ============================================
-- Nakon izvršavanja ovog SQL-a, tvoja baza je spremna.
-- After running this SQL, your database is ready.
