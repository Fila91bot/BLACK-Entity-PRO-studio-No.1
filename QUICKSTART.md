# ⚡ QUICK START - BLACK Entity Studio

## 1️⃣ Instalacija (30 sekundi)

```bash
cd backend
npm install
```

✅ **`.env` je VEĆ ispunjen!** Nemaš ništa dodavati.

---

## 2️⃣ Postavi Supabase (2 minute)

1. Otvori: https://supabase.com/dashboard
2. Odaberi projekt: **rbjctlpfzmchmcxtvbud**
3. **SQL Editor** → Copy-paste `backend/supabase-schema.sql`
4. **RUN**

✅ Baza je spremna!

---

## 3️⃣ Pokreni server (5 sekundi)

```bash
npm run dev
```

Vidiš:
```
🚀 Backend running on http://localhost:3000
```

✅ **Radi!**

---

## 4️⃣ Testiraj (10 sekundi)

### Health check:
```bash
curl http://localhost:3000/api/health
```

### Chat test:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-admin-password: Martina91" \
  -d '{"messages": [{"role": "user", "content": "Pozdrav!"}]}'
```

### Admin stats:
```bash
curl http://localhost:3000/api/admin/stats \
  -H "x-admin-password: Martina91"
```

✅ **Sve radi!**

---

## 🎯 API ENDPOINTS

**Chat:**
```
POST /api/chat
Header: x-admin-password: Martina91
Body: {"messages": [...], "model": "gpt-4o-mini"}
```

**Image:**
```
POST /api/image
Header: x-admin-password: Martina91
Body: {"prompt": "cyberpunk city"}
```

**Admin:**
```
GET /api/admin/stats
Header: x-admin-password: Martina91
```

---

## 🤖 Dostupni Modeli

### Chat:
- `gpt-4o-mini` (OpenAI)
- `llama-3.3-70b-versatile` (Groq - besplatno!)
- `mixtral-8x7b-32768` (Groq - besplatno!)

### Image:
- `dall-e-3` (OpenAI)

---

## 🚀 Deploy na Railway.app

```bash
1. Push na GitHub
2. Railway → New Project → Deploy from GitHub
3. Dodaj env varijable iz .env
4. Done!
```

---

## ⚠️ Česti Problemi

**"Cannot find module"?**
```bash
npm install
```

**CORS error?**
```bash
# Dodaj u .env:
FRONTEND_URL=http://localhost:5173
```

**OpenAI error?**
```bash
# Dodaj kredit: https://platform.openai.com/account/billing
```

---

## 📚 Puna Dokumentacija

Vidi **README.md** za detaljne upute!

---

**Gotovo! Backend je spreman. Sad možeš raditi frontend.** 🎉
