🔧 Environment Variables (Backend)

# Lemon Squeezy (Payments)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Admin
ADMIN_PASSWORD=

# Server
PORT=3000

🗄️ Supabase Setup
Open https://supabase.com/dashboard

Select your project

Go to SQL Editor

Open backend/supabase-schema.sql

Copy/paste the entire file

Click RUN

This creates:

all tables

all functions

all triggers

all RLS policies

Your database is now ready.

🚀 Start Backend

npm run dev
Expected output:

🚀 BLACK Entity Studio Backend running on http://localhost:3000
📊 Admin dashboard: http://localhost:3000/api/admin/stats
💬 Chat endpoint: http://localhost:3000/api/chat
🎨 Image endpoint: http://localhost:3000/api/image
🎬 Video endpoint: http://localhost:3000/api/video

🧪 API Testing

Health Check

curl http://localhost:3000/api/health

Admin Stats

curl http://localhost:3000/api/admin/stats \
  -H "x-admin-password: <YOUR_ADMIN_PASSWORD>"

Chat (Admin)

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-admin-password: <YOUR_ADMIN_PASSWORD>" \
  -d '{"messages":[{"role":"user","content":"Hello!"}],"model":"gpt-4o-mini"}'

Image Generation

curl -X POST http://localhost:3000/api/image \
  -H "Content-Type: application/json" \
  -H "x-admin-password: YOUR_ADMIN_PASSWORD" \
  -d '{"prompt":"cyberpunk city at night"}'

📡 API Endpoints

Chat

POST /api/chat
Headers:
  x-admin-password: ...
  Authorization: Bearer <token>
Body:
  {
    "messages": [...],
    "model": "gpt-4o-mini" | "llama-3.3-70b-versatile" | "mistral-large-latest" | "mistral-small-latest"
  }

Image Generation

POST /api/image
Headers: x-admin-password OR Authorization
Body:
  {
    "prompt": "...",
    "model": "dall-e-3",
    "size": "1024x1024"
  }

Admin Stats

GET /api/admin/stats
Headers:
  x-admin-password: ...

Subscription

POST /api/subscription/create
POST /api/subscription/webhook
GET  /api/subscription/status/:userId

🧠 Available Models

Chat Models
OpenAI

gpt-4o-mini

Groq

llama-3.3-70b-versatile

Mistral

mistral-large-latest

mistral-small-latest

Image Models
dall-e-3

📊 Rate Limiting
Free users

20 total messages/images

Subscribers

Unlimited

Admin

Unlimited

Daily reset

GitHub Action resets tokens_used_24h every day at 02:00 UTC

🔐 Authentication
Admin

x-admin-password: YOUR_ADMIN_PASSWORD

Users (Supabase Auth)
Authorization: Bearer <supabase-jwt-token>

🌐 Deployment (Railway Recommended)
Push repo to GitHub

Go to https://railway.app

Create new project → Deploy from GitHub

Add all environment variables

Deploy

Required variables:

OPENAI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
ADMIN_PASSWORD=
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app

### Optional: Run setup script

chmod +x setup.sh
./setup.sh

“You are allowed to use this software to build and monetize your own SaaS platform. You may charge users, sell subscriptions, and deploy commercially. You may not redistribute or resell the source code.”
