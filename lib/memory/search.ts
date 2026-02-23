/**
 * Memory Search — TypeScript only (no Python)
 * Loads data/fatwa_index.json, embeds query via Gemini API, returns top-k by cosine similarity.
 */

import * as fs from "fs";
import * as path from "path";

export interface FatwaEvidence {
  id: number;
  sheikh: string;
  question: string;
  answer: string;
  source_url: string;
  score: number;
}

interface IndexedFatwa {
  id: number;
  sheikh: string;
  question: string;
  answer: string;
  source_url: string;
  vector: number[];
}

const INDEX_PATH = path.resolve(process.cwd(), "data/fatwa_index.json");
const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

async function embedQuery(question: string, apiKey: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text: question }] },
      taskType: "RETRIEVAL_QUERY",
    }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
  const data = (await res.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!values || !Array.isArray(values)) throw new Error("Invalid embed response");
  return values;
}

function loadIndex(): IndexedFatwa[] {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error("fatwa_index.json not found. Run: npm run ingest");
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

export async function searchFatwas(
  question: string,
  topK: number = 6
): Promise<FatwaEvidence[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const index = loadIndex();
  const queryVec = await embedQuery(question, apiKey);

  const scored = index.map((f) => ({
    ...f,
    score: cosineSimilarity(queryVec, f.vector),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ vector: _, ...rest }) => ({
    ...rest,
    score: Math.round(rest.score * 1e4) / 1e4,
  }));
}
