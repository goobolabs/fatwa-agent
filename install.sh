#!/bin/bash
# Run this script in your terminal to complete setup
# Usage: bash install.sh

set -e

echo "🚀 Fatwa Agent — Setup Script"
echo "================================"

cd "$(dirname "$0")"

echo ""
echo "📦 Step 1: Installing npm packages..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Step 2: Next steps:"
echo ""
echo "  1. Add your Gemini API key to .env.local:"
echo "     GEMINI_API_KEY=your_key_here"
echo ""
echo "  2. Run data ingestion (creates vector index):"
echo "     npm run ingest"
echo ""
echo "  3. Start the app:"
echo "     npm run dev"
echo ""
echo "  4. Open: http://localhost:3000"
