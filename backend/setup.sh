#!/bin/bash

echo "🚀 BLACK Entity Studio - Setup Script"
echo "======================================"
echo ""

# Provjeri je li .env prisutan
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env datoteka nije pronađena!"
    echo ""
    echo "Kopiraj .env.example u .env:"
    echo "  cp .env.example .env"
    exit 1
fi

echo "✅ .env datoteka pronađena"
echo ""

# Provjeri Node.js verziju
NODE_VERSION=$(node --version)
echo "📦 Node.js verzija: $NODE_VERSION"
echo ""

# Provjeri environment varijable
echo "🔍 Provjeravam environment varijable..."
if grep -q "SUPABASE_URL=" .env && grep -q "OPENAI_API_KEY=" .env; then
    echo "✅ Environment varijable izgledaju OK"
else
    echo "⚠️  WARNING: Neke environment varijable možda nedostaju"
    echo "   Provjeri .env datoteku!"
fi
echo ""

# Instaliraj dependencies
echo "📥 Instaliram dependencies..."
npm install

echo ""
echo "✅ Setup gotov!"
echo ""
echo "Pokreni server s:"
echo "  npm run dev"
echo ""
