# Fatwa Agent — Setup Guide

## Step 1: Install Dependencies

Open a terminal and run:

```bash
cd /home/omartood/Desktop/AI-agents-project/fatwa-agent
npm install
```

## Step 2: Add Your Gemini API Key(s)

Edit `.env.local` and replace the placeholder:

```bash
# Recommended: multiple keys with automatic failover
GEMINI_API_KEYS=key1,key2,key3,key4,key5,key6,key7

# Backward compatible: single key or comma-separated list
GEMINI_API_KEY=key1
```

Get your key from: https://aistudio.google.com/app/apikey

The app will automatically switch to the next key when one key hits rate/quota limits.

## Step 3: Ingest the Fatwa Data

This creates `data/fatwa_index.json` with all 138 fatwas + embeddings:

```bash
npm run ingest
```

This takes ~5 minutes (138 fatwas × Gemini embedding API).

## Step 4: Run the App

```bash
npm run dev
```

Open: http://localhost:3000

## Step 5: Vercel Environment Variables

In Vercel project settings, add:

```bash
GEMINI_API_KEYS=key1,key2,key3,key4,key5,key6,key7
GEMINI_MODEL=gemini-2.5-flash-lite
```

Add the same variables for Production, Preview, and Development environments, then redeploy.

---

## Project Structure

```
fatwa-agent/
├── app/
│   ├── api/ask/route.ts     ← Agent API endpoint
│   ├── layout.tsx
│   ├── page.tsx             ← Frontend UI
│   └── globals.css
├── lib/
│   ├── ai/
│   │   ├── prompt.ts        ← Prompt builder (CLAUDE_RULES)
│   │   └── formatter.ts     ← Response parser
│   ├── memory/
│   │   ├── ingest.ts        ← JSON → embeddings → fatwa_index.json
│   │   └── search.ts        ← Cosine similarity search
│   └── domain/
│       └── detect.ts        ← Ramadan domain classifier
├── data/
│   ├── suaalaha_soonka.json ← Source data (138 fatwas)
│   └── fatwa_index.json     ← Generated after npm run ingest
├── docs/
│   └── CLAUDE_RULES.md      ← Agent behavior rules
└── .env.local               ← API keys
```

## How It Works

```
User Question
    ↓
Domain Detection (Ramadan only?)
    ↓
Gemini Embedding (question → vector)
    ↓
Cosine Similarity Search (fatwa_index.json)
    ↓
Top 6 Evidence Records
    ↓
Prompt Builder (CLAUDE_RULES + evidence + question)
    ↓
Gemini 1.5 Flash (reasoning)
    ↓
Structured Response:
  Xukunka / Faahfaahin / Ikhtilaaf / Gunaanad / Tixraac
```
