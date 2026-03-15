# 🔧 TROUBLESHOOTING GUIDE

## ❌ Error: "Missing Supabase environment variables"

Solution 1: Check your .env file

ls -la | grep .env
cat .env

If .env does not exist:

cp .env.example .env

Make sure the following variables are set:
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

✅Solution 2: Ensure dotenv is loading correctly

At the top of src/server.ts, make sure you have:

import dotenv from 'dotenv';
dotenv.config();

You can temporarily debug:

console.log('SUPABASE_URL:', !!process.env.SUPABASE_URL);
console.log('OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
console.log('GROQ_API_KEY:', !!process.env.GROQ_API_KEY);

✅ Solution 3: Run with explicit dotenv loading

node --require dotenv/config --loader tsx src/server.ts

✅ Solution 4: Set environment variables manually

Linux / macOS:
export SUPABASE_URL="https://PROJECT.supabase.co"
export SUPABASE_ANON_KEY="..."
npm run dev

Windows PowerShell:
$env:SUPABASE_URL="https://PROJECT.supabase.co"
$env:SUPABASE_ANON_KEY="..."
npm run dev

❌ Problem: nodemon crashes
✅ Solution: Use tsx instead of nodemon
Update package.json:

"scripts": {
  "dev": "tsx watch src/server.ts",
  "start": "node dist/server.js"
}
Then run:
npm run dev

❌ Error: “Cannot find module 'groq-sdk'”
✅ Solution:

npm install
# or
npm install groq-sdk

❌ TypeScript errors during development
✅ Solution:
Ignore TypeScript errors while running dev mode:

npm run dev -- --transpile-only

⚡ QUICK FIX (recommended)
If something still doesn’t work, run:

bash
chmod +x setup.sh
./setup.sh
npm run dev



