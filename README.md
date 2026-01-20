# 🌌 BLACK Entity Studio Pro

**Profesionalan AI SaaS** s chat-om, generiranjem slika, video mogućnostima, subscription sistemom i admin dashboardom.

---

## ✨ Features (Mogućnosti)

### 🤖 AI Chat
- **OpenAI GPT-4o Mini** - Brz i pametan chat
- **Groq Llama 3.3 70B** - Ultra-brz open-source model
- **Groq Mixtral 8x7B** - Moćan mixture-of-experts model
- Streaming responses (real-time)
- Multi-model support

### 🎨 Image Generation  
- **DALL·E 3** - Vrhunsko generiranje slika
- 1024x1024 rezolucija
- Natural language prompts

### 🎬 Video Generation
- Placeholder za buduću implementaciju
- Spremno za: Runway, Pika, Stability AI

### 💳 Subscription System
- **Lemon Squeezy** integracija
- €49/mjesec subscription
- 20 besplatnih poruka za nove korisnike
- Webhook automation

### 📊 Admin Dashboard
- Real-time statistike
- User management
- Token tracking
- Suspicious activity detection
- Manual overrides

---

## 📁 Struktura Projekta

```
black-entity-studio/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.ts          # OpenAI + Groq chat
│   │   │   ├── image.ts         # DALL·E image generation
│   │   │   ├── video.ts         # Video (placeholder)
│   │   │   ├── subscription.ts  # Lemon Squeezy
│   │   │   └── admin.ts         # Admin dashboard
│   │   ├── middleware/
│   │   │   └── auth.ts          # Auth + rate limiting
│   │   ├── supabase.ts          # Database client
│   │   └── server.ts            # Express server
│   ├── .env                     # API keys (VEĆ ISPUNJEN!)
│   ├── package.json
│   ├── tsconfig.json
│   └── supabase-schema.sql      # Database schema
│
├── .github/
│   └── workflows/
│       └── supabase-daily-reset.yml  # Auto token reset
│
└── README.md                    # Ove upute
```

---

## 🚀 QUICK START (Brzi početak)

### Preduvjeti
- Node.js 18+ instaliran
- Supabase račun (besplatno)
- OpenAI API key (~$5 kredit)
- Groq API key (besplatno!)

---

### 1️⃣ BACKEND SETUP

```bash
cd backend
npm install
```

**✅ `.env` JE VEĆ ISPUNJEN!** Sve tvoje API ključeve sam dodao:

```env
# OpenAI (GPT chat + DALL·E slike)
OPENAI_API_KEY=sk-proj-8To8o0... ✅

# Groq (Besplatni, brzi LLM modeli)
GROQ_API_KEY=gsk_OF8JmgfHpB... ✅

# Supabase (Baza podataka)
SUPABASE_URL=https://rbjctlpfzmchmcxtvbud.supabase.co ✅
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni... ✅

# Lemon Squeezy (Plaćanja)
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1Qi... ✅
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_4f8a2c9b1e7d ✅

# Admin
ADMIN_PASSWORD=Martina91 ✅

# Port
PORT=3000 ✅
```

---

### 2️⃣ POSTAVI SUPABASE BAZU

1. Otvori https://supabase.com/dashboard
2. Odaberi svoj projekt (rbjctlpfzmchmcxtvbud)
3. Idi na **SQL Editor**
4. Kopiraj cijeli sadržaj iz `backend/supabase-schema.sql`
5. Zalijepi u editor
6. Klikni **RUN**

✅ Ovo kreira sve tablice, funkcije i security policies!

---

### 3️⃣ POKRENI BACKEND

```bash
npm run dev
```

Trebao bi vidjeti:

```
🚀 BLACK Entity Studio Backend running on http://localhost:3000
📊 Admin dashboard: http://localhost:3000/api/admin/stats
💬 Chat endpoint: http://localhost:3000/api/chat
🎨 Image endpoint: http://localhost:3000/api/image
🎬 Video endpoint: http://localhost:3000/api/video
```

✅ **Backend radi!**

---

### 4️⃣ TESTIRAJ API

**Test health check:**
```bash
curl http://localhost:3000/api/health
```

**Test admin stats (koristi admin password):**
```bash
curl http://localhost:3000/api/admin/stats \
  -H "x-admin-password: Martina91"
```

**Test chat (s admin passwordom):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-admin-password: Martina91" \
  -d '{"messages": [{"role": "user", "content": "Pozdrav!"}], "model": "gpt-4o-mini"}'
```

**Test image generation:**
```bash
curl -X POST http://localhost:3000/api/image \
  -H "Content-Type: application/json" \
  -H "x-admin-password: Martina91" \
  -d '{"prompt": "cyberpunk city at night, neon lights"}'
```

---

## 🔧 API ENDPOINTS

### Chat
```http
POST /api/chat
Headers: 
  - x-admin-password: Martina91 (za admin)
  - Authorization: Bearer <token> (za korisnike)
Body: {
  "messages": [{"role": "user", "content": "..."}],
  "model": "gpt-4o-mini" | "llama-3.3-70b-versatile" | "mixtral-8x7b-32768"
}
```

### Image Generation
```http
POST /api/image
Headers: x-admin-password ili Authorization
Body: {
  "prompt": "your image description",
  "model": "dall-e-3",
  "size": "1024x1024"
}
```

### Admin Stats
```http
GET /api/admin/stats
Headers: x-admin-password: Martina91
Response: {
  "overview": {...},
  "flagged_users": [...],
  "top_users": [...]
}
```

### Subscription
```http
POST /api/subscription/create
Body: {"userId": "...", "email": "..."}

POST /api/subscription/webhook
(Za Lemon Squeezy webhook)

GET /api/subscription/status/:userId
```

---

## 💾 SUPABASE SHEMA

### Users tablica
```sql
- user_id (UUID)
- email
- is_subscribed (boolean)
- tokens_used (integer)
- tokens_used_24h (integer)
- last_token_reset (timestamp)
- suspicious (boolean)
- created_at, updated_at
```

### Sessions tablica
```sql
- id (UUID)
- user_id
- title
- created_at, updated_at
```

### Messages tablica
```sql
- id (UUID)
- session_id
- user_id
- role (user/assistant/system)
- content
- model
- tokens_used
- created_at
```

### Usage Logs tablica
```sql
- id (UUID)
- user_id
- action_type (chat/image/video)
- tokens_used
- suspicious
- metadata (JSONB)
- created_at
```

---

## 🤖 DOSTUPNI MODELI

### Chat modeli:

**OpenAI:**
- `gpt-4o-mini` - Brz, pametan, najbolji omjer cijene/kvalitete
- `gpt-4o` - Najmoćniji (skuplje)
- `gpt-3.5-turbo` - Stariji, jeftiniji

**Groq (BESPLATNO, ultra brzo!):**
- `llama-3.3-70b-versatile` - Meta Llama 3.3 70B (preporučam!)
- `llama-3.1-70b-versatile` - Meta Llama 3.1 70B
- `mixtral-8x7b-32768` - Mixtral 8x7B MoE
- `gemma2-9b-it` - Google Gemma 2 9B

### Image modeli:
- `dall-e-3` - OpenAI DALL·E 3 (najbolja kvaliteta)
- `dall-e-2` - Stariji, jeftiniji

---

## 📊 RATE LIMITING

**Besplatni korisnici:**
- 20 poruka/slika ukupno
- Zatim se pojavljuje SubscriptionModal

**Pretplaćeni korisnici:**
- Neograničeno

**Admin:**
- Neograničeno
- Password: `Martina91`

**Dnevni reset:**
- GitHub Action automatski resetira `tokens_used_24h` svaki dan u 02:00 UTC

---

## 🔐 AUTENTIFIKACIJA

### Admin
```javascript
Headers: {
  'x-admin-password': 'Martina91'
}
```

### Korisnici (Supabase Auth)
```javascript
Headers: {
  'Authorization': 'Bearer <supabase-jwt-token>'
}
```

---

## 🌐 DEPLOYMENT

### Backend - Railway.app (PREPORUČAM)

1. Push projekt na GitHub
2. Idi na https://railway.app
3. **New Project** → **Deploy from GitHub**
4. Odaberi repo
5. **Add variables** → kopiraj sve iz `.env`
6. Railway automatski deploya!

**Environment Variables za dodati:**
```
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
LEMONSQUEEZY_API_KEY=eyJ...
ADMIN_PASSWORD=Martina91
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Alternative: Render.com

1. New → Web Service
2. Connect GitHub repo
3. Build: `npm install`
4. Start: `npm start`
5. Dodaj env varijable

---

## 🎯 FRONTEND INTEGRACIJA

Backend je **API-only**, što znači da možeš koristiti bilo koji frontend:

- **React** (s Vite)
- **Next.js**
- **Vue**
- **Svelte**
- ili čak vanilla HTML/JS

Primjer frontend poziva:

```javascript
// Chat
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-password': 'Martina91' // ili Authorization: Bearer <token>
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'gpt-4o-mini'
  })
});

// Stream odgovor
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = new TextDecoder().decode(value);
  console.log(text);
}
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot find module 'groq-sdk'"
```bash
cd backend
npm install
```

### Problem: "Invalid Supabase credentials"
- Provjeri `.env` da su URL i KEY točni
- URL mora biti `https://xxx.supabase.co` (bez trailing slash)

### Problem: "OpenAI API error: Insufficient credits"
- Dodaj kredit na OpenAI: https://platform.openai.com/account/billing
- Minimum je $5

### Problem: Backend ne startuje
```bash
# Provjeri Node.js verziju
node --version  # Mora biti 18+

# Reinstaliraj dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: CORS error
- Dodaj frontend URL u `.env`:
```
FRONTEND_URL=http://localhost:5173
```

---

## 📈 MONITORING

### Supabase Dashboard
- Vidi broj korisnika: **Table Editor** → **users**
- Vidi poruke: **Table Editor** → **messages**
- Vidi API usage: **Settings** → **Usage**

### OpenAI Dashboard
- https://platform.openai.com/usage
- Praćenje troškova

### Groq Dashboard
- https://console.groq.com
- Besplatno, ali ima rate limite

### Lemon Squeezy Dashboard
- https://app.lemonsqueezy.com
- Praćenje prihoda i subskripcija

---

## 🔒 SIGURNOST

### ✅ ŠTO JE IMPLEMENTIRANO:
- JWT token provjera (Supabase Auth)
- Admin password zaštita
- Rate limiting (20 poruka za free)
- Row Level Security (RLS) u Supabasei
- Webhook signature verification
- Input validation
- CORS zaštita

### ⚠️ PRODUKCIJSKA SIGURNOST:
1. **Promijeni admin password** u `.env`!
2. **Nikad ne commitaj `.env`** na GitHub!
3. **Implementiraj HTTPS** u productionu
4. **Dodaj rate limiting middleware** (express-rate-limit)
5. **Logiraj sve API pozive** u Supabase

---

## 🎨 PRIMJER FRONTEND KOMPONENTE

```tsx
import { useState } from 'react';

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': 'Martina91'
      },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: input }],
        model: 'gpt-4o-mini'
      })
    });

    const reader = res.body.getReader();
    let aiMessage = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiMessage += new TextDecoder().decode(value);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: aiMessage }
      ]);
    }
  };

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i}>{m.role}: {m.content}</div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

---

## 📝 TODO (Buduća poboljšanja)

- [ ] Frontend aplikacija (React/Next.js)
- [ ] Video generiranje (Runway/Pika API)
- [ ] Email notifikacije
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice chat (Whisper + TTS)
- [ ] File upload support
- [ ] Team collaboration features
- [ ] Custom fine-tuned models

---

## 🆘 PODRŠKA

Imaš problema? Provjeri:

1. **Backend logove:** Terminal gdje je `npm run dev` pokrenut
2. **Supabase logs:** Dashboard → Logs & Reports
3. **OpenAI usage:** https://platform.openai.com/usage
4. **Groq console:** https://console.groq.com

---

## ✨ FEATURES SUMMARY

✅ Multi-model AI chat (OpenAI + Groq)  
✅ DALL·E 3 image generation  
✅ Lemon Squeezy subscription  
✅ Admin dashboard s statistikama  
✅ Rate limiting (20 free messages)  
✅ Supabase integracija  
✅ Webhook automation  
✅ TypeScript  
✅ Modular architecture  
✅ Production-ready  

---

## 🎉 ČESTITAM!

Imaš **kompletan, profesionalan AI SaaS backend** spreman za produkciju! 

**Što sad?**

1. ✅ Pokreni backend (`npm run dev`)
2. ✅ Testiraj sve endpointe
3. 🎨 Napravi frontend (ili koristi postojeće komponente)
4. 🚀 Deploya na Railway/Render
5. 💰 Zaradjuj! 

**Sretno! 💪🚀**

---

*Made with ❤️ for Martina*
