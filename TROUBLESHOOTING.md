# 🔧 TROUBLESHOOTING - Rješavanje Problema

## ❌ Problem: "Missing Supabase environment variables"

### Rješenje 1: Provjeri .env datoteku

```bash
# Provjeri postoji li .env
ls -la | grep .env

# Provjeri sadržaj
cat .env
```

**Ako ne postoji `.env`:**
```bash
cp .env.example .env
```

---

### Rješenje 2: Provjeri da dotenv radi

Otvori `src/server.ts` i dodaj na vrh (prije svega):

```typescript
import dotenv from 'dotenv';
dotenv.config();

// Debug - provjeri učitane varijable
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅' : '❌');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅' : '❌');
```

---

### Rješenje 3: Pokreni s explicit dotenv

```bash
# Umjesto npm run dev:
node --require dotenv/config --loader tsx src/server.ts
```

---

### Rješenje 4: Ručno postavi env varijable

```bash
# Linux/Mac:
export SUPABASE_URL="https://rbjctlpfzmchmcxtvbud.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
npm run dev

# Windows (PowerShell):
$env:SUPABASE_URL="https://rbjctlpfzmchmcxtvbud.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
npm run dev
```

---

## ❌ Problem: nodemon crash

### Rješenje: Koristi tsx direktno

Promijeni `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "start": "node dist/server.js"
}
```

Zatim:
```bash
npm run dev
```

---

## ❌ Problem: "Cannot find module 'groq-sdk'"

### Rješenje:

```bash
npm install
# ili
npm install groq-sdk
```

---

## ❌ Problem: TypeScript greške

### Rješenje:

```bash
# Ignoriraj TypeScript greške prilikom pokretanja
npm run dev -- --transpile-only
```

---

## ✅ QUICK FIX (brzo rješenje)

Pokreni ovaj setup script:

```bash
chmod +x setup.sh
./setup.sh
npm run dev
```

---

## 📧 Ako ništa ne radi:

Javi mi točan error message i ja ću ti pomoći! 😊
