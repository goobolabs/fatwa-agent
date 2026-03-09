import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

type EmbeddingTaskType = "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT";

function parseKeys(raw: string): string[] {
  return raw
    .split(/[,\n]/g)
    .map((k) => k.trim())
    .filter(Boolean);
}

export function getGeminiApiKeys(): string[] {
  const sources = [process.env.GEMINI_API_KEYS, process.env.GEMINI_API_KEY].filter(
    Boolean
  ) as string[];

  const merged = sources.flatMap(parseKeys);
  return Array.from(new Set(merged));
}

function isRetryableStatus(status?: number): boolean {
  return status !== undefined && [429, 500, 502, 503, 504].includes(status);
}

function isRetryableMessage(message: string): boolean {
  return /(429|rate[\s-]*limit|quota|resource exhausted|too many requests|unavailable)/i.test(
    message
  );
}

function getErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const anyErr = err as { status?: unknown; response?: { status?: unknown } };
  const statusFromTop = anyErr.status;
  if (typeof statusFromTop === "number") return statusFromTop;
  const statusFromResponse = anyErr.response?.status;
  if (typeof statusFromResponse === "number") return statusFromResponse;
  return undefined;
}

function canFailOver(err: unknown): boolean {
  const status = getErrorStatus(err);
  if (isRetryableStatus(status)) return true;
  const message = err instanceof Error ? err.message : String(err ?? "");
  return isRetryableMessage(message);
}

async function runWithKeyFailover<T>(fn: (apiKey: string) => Promise<T>): Promise<T> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Set GEMINI_API_KEYS or GEMINI_API_KEY.");
  }

  const failureNotes: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      return await fn(key);
    } catch (err) {
      const note = err instanceof Error ? err.message : String(err);
      failureNotes.push(`key#${i + 1}: ${note}`);

      const hasMoreKeys = i < keys.length - 1;
      if (!hasMoreKeys || !canFailOver(err)) {
        throw new Error(`Gemini request failed. ${failureNotes.join(" | ")}`);
      }
    }
  }

  throw new Error("Gemini request failed after trying all API keys.");
}

export async function generateTextWithFailover(params: {
  prompt: string;
  modelId: string;
  generationConfig?: { temperature?: number; maxOutputTokens?: number };
}): Promise<string> {
  const response = await runWithKeyFailover(async (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: params.modelId,
      generationConfig: params.generationConfig,
    });
    const result = await model.generateContent(params.prompt);
    return result.response;
  });

  if (!response) throw new Error("Gemini returned no response");
  const text = response.text();
  if (!text.trim()) throw new Error("Gemini returned empty text");
  return text;
}

export async function embedTextWithFailover(
  text: string,
  taskType: EmbeddingTaskType
): Promise<number[]> {
  return runWithKeyFailover(async (apiKey) => {
    const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      const error = new Error(`Embed failed: ${res.status} ${errBody}`);
      (error as Error & { status?: number }).status = res.status;
      throw error;
    }

    const data = (await res.json()) as { embedding?: { values?: number[] } };
    const values = data.embedding?.values;
    if (!values || !Array.isArray(values)) {
      throw new Error("Invalid embed response");
    }
    return values;
  });
}
