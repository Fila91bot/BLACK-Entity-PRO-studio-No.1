# 📊 SUPABASE DATABASE SETUP - Upute

## 🎯 IMAŠ 3 OPCIJE:

---

## ✅ OPCIJA 1: FIXED Schema (PREPORUČAM)

**Datoteka:** `supabase-schema-FIXED.sql`

**Što radi:**
- Koristi `uuid_generate_v4()` umjesto `gen_random_uuid()`
- Kreira sve tablice (users, sessions, messages, usage_logs)
- Postavlja RLS security policies
- Kreira funkcije za token tracking

**Kako izvršiti:**

1. Otvori Supabase Dashboard: https://supabase.com/dashboard
2. Odaberi projekt: **rbjctlpfzmchmcxtvbud**
3. Idi na **SQL Editor**
4. Kopiraj CIJELI sadržaj iz `supabase-schema-FIXED.sql`
5. Zalijepi u editor
6. Klikni **RUN** (ili Ctrl/Cmd + Enter)
7. Pričekaj da se izvrši (može trajati 5-10 sekundi)

**Očekivani rezultat:**
```
Database setup completed successfully!
```

---

## ⚡ OPCIJA 2: MINIMAL Schema (Za testiranje)

**Datoteka:** `supabase-schema-MINIMAL.sql`

**Što radi:**
- Kreira samo **users** tablicu (osnovno što ti treba)
- Kreira osnovne funkcije
- Nema UUID problema (koristi BIGSERIAL)
- Brže izvršavanje

**Kada koristiti:**
- Ako imaš problema s FIXED verzijom
- Ako želiš samo brzo testirati backend
- Kasnije možeš dodati ostale tablice

**Kako izvršiti:**
- Isti postupak kao OPCIJA 1, ali koristi `supabase-schema-MINIMAL.sql`

---

## 🔧 OPCIJA 3: Ručno kreiranje (Ako SQL ne radi)

Ako nijedna SQL skripta ne radi, evo kako ručno kreirati tablice:

### 1. Kreiraj Users tablicu:

```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_user_id ON users(user_id);
```

### 2. Kreiraj increment funkciju:

```sql
CREATE OR REPLACE FUNCTION increment_tokens_used(
  user_id_input UUID,
  tokens INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET tokens_used = tokens_used + tokens
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;
```

### 3. Omogući RLS:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🧪 TESTIRANJE - Provjeri da radi

Nakon što izvršiš SQL, testiraj:

### 1. Provjeri tablice:

U Supabase:
- Idi na **Table Editor**
- Trebao bi vidjeti tablicu **users**

### 2. Testiranje iz backend-a:

```bash
cd backend
npm run dev
```

Zatim testiraj:

```bash
curl http://localhost:3000/api/admin/stats \
  -H "x-admin-password: Martina91"
```

Trebao bi dobiti:
```json
{
  "overview": {
    "total_users": 0,
    "subscribed_users": 0,
    ...
  }
}
```

---

## ❌ TROUBLESHOOTING

### Problem: "relation users already exists"

**Rješenje:** Tablica već postoji! Preskoči kreiranje ili obriši staru:

```sql
DROP TABLE IF EXISTS users CASCADE;
-- Zatim ponovo pokreni CREATE TABLE...
```

### Problem: "function uuid_generate_v4 does not exist"

**Rješenje:** Instaliraj ekstenziju:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Problem: "permission denied"

**Rješenje:** Koristi **service_role** key umjesto **anon** key u Supabase SQL Editor-u.

---

## ✅ KAKO ZNAŠ DA JE SVE OK?

Nakon uspješnog izvršavanja, trebao bi vidjeti:

1. ✅ Tablica **users** u Table Editor-u
2. ✅ Backend se uspješno spaja (`npm run dev` radi bez greške)
3. ✅ Admin stats API vraća rezultate

---

**Javi mi koji SQL si koristio i što se dogodilo!** 😊
