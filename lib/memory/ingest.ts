/**
 * Fatwa Ingestion — TypeScript only (no Python)
 * Reads data/suaalaha_soonka.json, calls Gemini Embedding API, writes data/fatwa_index.json
 *
 * Run: npm run ingest
 */

import * as fs from "fs";
import * as path from "path";
import { embedTextWithFailover, getGeminiApiKeys } from "@/lib/ai/gemini";

function loadEnvFile(fileName: string): void {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
// Load local env files for direct script execution.
loadEnvFile(".env");
loadEnvFile(".env.local");

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

async function embed(text: string): Promise<number[]> {
  return embedTextWithFailover(text, "RETRIEVAL_DOCUMENT");
}

async function main() {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    console.error("No Gemini keys found. Set GEMINI_API_KEYS or GEMINI_API_KEY.");
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
      const vector = await embed(text);
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
