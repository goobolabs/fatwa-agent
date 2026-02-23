/**
 * Fatwa Ingestion — TypeScript only (no Python)
 * Reads data/suaalaha_soonka.json, calls Gemini Embedding API, writes data/fatwa_index.json
 *
 * Run: npm run ingest
 */

import * as fs from "fs";
import * as path from "path";

// Load .env.local so GEMINI_API_KEY is available when run via npm run ingest
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const DATA_PATH = path.resolve(process.cwd(), "data/suaalaha_soonka.json");
const INDEX_PATH = path.resolve(process.cwd(), "data/fatwa_index.json");

interface FatwaRecord {
  id: number;
  sheikh: string;
  question: string;
  answer: string;
  source_url?: string;
}

interface IndexedFatwa extends FatwaRecord {
  vector: number[];
}

const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

async function embed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embed failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!values || !Array.isArray(values)) throw new Error("Invalid embed response");
  return values;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  console.log("Loading fatwa dataset...");
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const dataset: { fatwas: FatwaRecord[] } = JSON.parse(raw);
  const fatwas = dataset.fatwas.filter(
    (f) => f.question?.trim() && f.answer?.trim()
  );
  console.log(`Loaded ${fatwas.length} fatwas.`);

  const indexed: IndexedFatwa[] = [];

  for (let i = 0; i < fatwas.length; i++) {
    const f = fatwas[i];
    const text = `Su'aal: ${f.question}\nJawaab: ${f.answer}`;
    try {
      const vector = await embed(text, apiKey);
      indexed.push({
        id: f.id,
        sheikh: f.sheikh,
        question: f.question,
        answer: f.answer,
        source_url: f.source_url ?? "",
        vector,
      });
      console.log(`  ${indexed.length}/${fatwas.length}`);
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(`  Failed #${f.id}:`, e);
    }
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexed));
  console.log(`\nDone. Index saved: ${INDEX_PATH}`);
  console.log(`  Total: ${indexed.length} fatwas`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
