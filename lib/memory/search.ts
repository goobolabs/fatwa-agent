/**
 * Memory Search — TypeScript only (no Python)
 * Loads data/fatwa_index.json, embeds query via Gemini API, returns top-k by cosine similarity.
 */

import * as fs from "fs";
import * as path from "path";
import { embedTextWithFailover } from "@/lib/ai/gemini";

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

async function embedQuery(question: string): Promise<number[]> {
  return embedTextWithFailover(question, "RETRIEVAL_QUERY");
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
  const index = loadIndex();
  const queryVec = await embedQuery(question);

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
