# Fatwa Agent

An AI assistant for **Ramadan Fiqh** questions, powered by Somali scholars’ fatwas and Google Gemini. Ask questions in Somali and get structured answers (ruling, explanation, scholarly differences, conclusion, and references) grounded in a curated dataset.

## Features

- **Semantic search** — Uses Gemini embeddings to find the most relevant fatwas for your question.
- **Evidence-based answers** — Responses are built only from retrieved scholar content; the model does not invent rulings.
- **Structured output** — Each answer includes: *Xukunka* (ruling), *Faahfaahin* (explanation), *Ikhtilaaf* (differences of opinion), *Gunaanad* (conclusion), and *Tixraac* (references, including YouTube links).
- **Domain guard** — Only Ramadan/Fiqh-related questions are answered; out-of-scope questions are politely declined.
- **Somali-first UI** — Landing page and chat interface in Somali (Af-Soomaali).

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **Google Gemini** — Embeddings (`gemini-embedding-001`) and generation (e.g. `gemini-2.5-flash-lite`)
- **TypeScript** — Full codebase
- **Tailwind CSS** — Styling

## Prerequisites

- **Node.js** 18+ (or Bun)
- **Google AI API key(s)** — [Create keys](https://aistudio.google.com/apikey) and set `GEMINI_API_KEYS` (recommended) or `GEMINI_API_KEY`

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd fatwa-agent
   npm install
   ```

2. **Environment**

   Create `.env.local` in the project root:

   ```env
   # Recommended (automatic failover / rotation list)
   GEMINI_API_KEYS=key1,key2,key3,key4,key5,key6,key7

   # Backward compatible (single key OR comma-separated list also works)
   GEMINI_API_KEY=key1
   ```

   Optional:

   ```env
   GEMINI_MODEL=gemini-2.5-flash-lite
   ```

3. **Data and index**

   - Place your fatwa dataset at **`data/suaalaha_soonka.json`** with this shape:

     ```json
     {
       "fatwas": [
         {
           "id": 1,
           "sheikh": "Sh. Maxamed Cumar Dirir",
           "question": "Injekshinku soonka ma jabiyaa?",
           "answer": "...",
           "source_url": "https://..."
         }
       ]
     }
     ```

   - Build the vector index (embeds each fatwa via Gemini and writes `data/fatwa_index.json`):

     ```bash
     npm run ingest
     ```

   The app expects **`data/fatwa_index.json`** to exist at runtime for search. If it’s missing, the API returns a “no data” style error.

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start Next.js dev server (e.g. :3000) |
| `npm run build`| Production build                     |
| `npm run start`| Run production server                |
| `npm run ingest`| Build `data/fatwa_index.json` from `data/suaalaha_soonka.json` |
| `npm run lint` | Run Next.js ESLint                   |

## Gemini Key Failover

- The app now automatically tries the next Gemini key when a key is rate-limited or quota-limited.
- Failover is applied to:
  - answer generation (`/api/ask`)
  - query embeddings (`lib/memory/search.ts`)
  - ingestion embeddings (`npm run ingest`)
- If all keys fail, the request returns the final error.

## Vercel Environment Variables

Set this in Vercel project settings (`Settings -> Environment Variables`) for each target environment (Production / Preview / Development):

```env
GEMINI_API_KEYS=key1,key2,key3,key4,key5,key6,key7
GEMINI_MODEL=gemini-2.5-flash-lite
```

Optional Vercel CLI flow:

```bash
vercel env add GEMINI_API_KEYS production
vercel env add GEMINI_API_KEYS preview
vercel env add GEMINI_API_KEYS development
vercel env add GEMINI_MODEL production
vercel env add GEMINI_MODEL preview
vercel env add GEMINI_MODEL development
```

Then redeploy so new env values are applied.

## How It Works

1. **User** asks a question on the `/chat` page (or via a pre-filled link from the landing page).
2. **Domain detection** — Question is checked against Ramadan/Fiqh keywords (Somali + Arabic). If out of scope, the user gets a short “we only answer Ramadan questions” message.
3. **Retrieval** — Query is embedded with Gemini; cosine similarity against `fatwa_index.json` returns the top-k fatwas (e.g. 6) as evidence.
4. **Safety** — If no evidence is found, the API refuses to answer.
5. **Prompt** — A fixed system prompt (rules + required answer format) is combined with the retrieved evidence and the user question.
6. **Generation** — Gemini produces a single structured answer (Xukunka, Faahfaahin, Ikhtilaaf, Gunaanad, Tixraac).
7. **Formatting** — The raw text is parsed into sections and returned as JSON; the chat UI shows the structured *FatwaCard* and optional YouTube embeds from *Tixraac*.

## Project Structure (high level)

```
fatwa-agent/
├── app/
│   ├── page.tsx           # Landing (Somali)
│   ├── chat/page.tsx      # Chat UI
│   └── api/ask/route.ts   # POST /api/ask
├── lib/
│   ├── ai/
│   │   ├── prompt.ts      # System rules + evidence → prompt
│   │   └── formatter.ts   # Parse Gemini output into fatwa sections
│   ├── domain/
│   │   └── detect.ts      # Ramadan/Fiqh domain check
│   └── memory/
│       ├── ingest.ts      # suaalaha_soonka.json → fatwa_index.json
│       └── search.ts      # Embed query, top-k by cosine similarity
├── data/
│   ├── suaalaha_soonka.json   # Input fatwas (you provide)
│   └── fatwa_index.json       # Vector index (from npm run ingest)
└── package.json
```

## Disclaimer

This system is an **assistant** that surfaces and structures existing scholar content. It does not replace scholars or issue independent religious rulings. Users are encouraged to verify with qualified scholars for binding religious guidance.
