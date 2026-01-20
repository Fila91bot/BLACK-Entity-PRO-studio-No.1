-- ============================================
-- MINIMALNA VERZIJA - Za testiranje
-- ============================================
-- Ova verzija koristi BIGSERIAL umjesto UUID za PRIMARY KEY
-- gdje god je moguće, da izbjegnemo probleme s UUID funkcijama

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

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- FUNCTION: Increment tokens_used
-- ============================================
CREATE OR REPLACE FUNCTION increment_tokens_used(
  user_id_input UUID,
  tokens INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    tokens_used = tokens_used + tokens,
    tokens_used_24h = tokens_used_24h + tokens,
    updated_at = NOW()
  WHERE user_id = user_id_input;

  UPDATE users
  SET 
    tokens_used_24h = tokens,
    last_token_reset = NOW()
  WHERE user_id = user_id_input
    AND last_token_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Reset 24h counter
-- ============================================
CREATE OR REPLACE FUNCTION reset_tokens_used_24h()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    tokens_used_24h = 0,
    last_token_reset = NOW()
  WHERE last_token_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- GOTOVO!
-- ============================================
SELECT 'Minimal database setup completed!' as status;
