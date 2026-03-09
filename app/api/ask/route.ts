/**
 * Fatwa Agent API Entrypoint
 * POST /api/ask
 *
 * Flow:
 *   1. Receive user question
 *   2. Domain detection
 *   3. Vector memory retrieval (top-k fatwas)
 *   4. Build prompt with evidence
 *   5. Gemini reasoning
 *   6. Return structured fatwa response
 */

import { NextRequest, NextResponse } from "next/server";
import { detectDomain } from "@/lib/domain/detect";
import { searchFatwas } from "@/lib/memory/search";
import { buildPrompt } from "@/lib/ai/prompt";
import { formatFatwaResponse } from "@/lib/ai/formatter";
import { generateTextWithFailover } from "@/lib/ai/gemini";

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
}

function normalizeRefLine(line: string): string {
  return line
    .replace(/^\s*[•\-\*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getEvidenceUrlToIndexMap(
  evidence: { source_url: string }[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < evidence.length; i++) {
    const url = extractFirstUrl(evidence[i].source_url ?? "");
    if (url) map.set(url, i);
  }
  return map;
}

function extractIndexFromRefLine(line: string): number | null {
  const cleaned = normalizeRefLine(line);
  if (!cleaned) return null;
  const match = cleaned.match(/\[\s*D\s*(\d+)\s*\]/i) ?? cleaned.match(/\bD\s*(\d+)\b/i);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed - 1;
}

function getSelectedEvidenceIndexes(
  modelRefs: string[],
  evidence: { source_url: string }[]
): number[] {
  const picked: number[] = [];
  const seen = new Set<number>();

  for (const line of modelRefs) {
    const idx = extractIndexFromRefLine(line);
    if (idx === null || idx < 0 || idx >= evidence.length || seen.has(idx)) continue;
    seen.add(idx);
    picked.push(idx);
  }

  if (picked.length > 0) return picked;

  // Fallback: if model did not provide [D#], match only URLs that exist in evidence.
  const urlToIndex = getEvidenceUrlToIndexMap(evidence);
  for (const line of modelRefs) {
    const url = extractFirstUrl(line);
    if (!url) continue;
    const idx = urlToIndex.get(url);
    if (idx === undefined || seen.has(idx)) continue;
    seen.add(idx);
    picked.push(idx);
  }

  return picked;
}

function buildEvidenceReferencesByIndex(
  evidence: { sheikh: string; source_url: string }[],
  selectedIndexes: number[]
): string[] {
  const refs: string[] = [];
  const seenUrls = new Set<string>();

  for (const idx of selectedIndexes) {
    const item = evidence[idx];
    if (!item) continue;
    const url = extractFirstUrl(item.source_url ?? "");
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    const label = item.sheikh?.trim() ? `Sheekh: ${item.sheikh.trim()}` : "Tixraac";
    refs.push(`${label} - ${url}`);
  }

  return refs;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Su'aal ma jirto. Fadlan su'aal geli." },
        { status: 400 }
      );
    }

    // Step 1: Domain detection
    const { isAllowed } = detectDomain(question);
    if (!isAllowed) {
      return NextResponse.json({
        success: false,
        outOfDomain: true,
        message:
          "Qaybtan wali kuma jirto nidaamka. Hadda waxaan ka jawaabaa su'aalaha Ramadaanka oo keliya.",
      });
    }

    // Step 2: Retrieve evidence from vector memory
    let evidence = [];
    try {
      evidence = await searchFatwas(question, 6);
    } catch (err) {
      console.error("Memory retrieval error:", err);
      return NextResponse.json(
        {
          success: false,
          error:
            "Xogta kaydsan lama heli karo. Fadlan maamulaha la xiriir si loo hagaajiyo.",
        },
        { status: 503 }
      );
    }

    // Step 3: Safety check — refuse if no evidence
    if (evidence.length === 0) {
      return NextResponse.json({
        success: false,
        noEvidence: true,
        message: "Su'aashan xog sugan lagama hayo kaydka fataawada.",
      });
    }

    // Step 4: Build prompt
    const prompt = buildPrompt(question, evidence);

    // Step 5: Call Gemini
    // Use model from env (confirmed available via ListModels)
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const rawText = await generateTextWithFailover({
      prompt,
      modelId,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    // Step 6: Format and return
    const formatted = formatFatwaResponse(rawText);

    const modelTixraacList = formatted.tixraac
      ? formatted.tixraac.split("\n").map((t) => t.trim()).filter(Boolean)
      : [];
    const selectedEvidenceIndexes = getSelectedEvidenceIndexes(modelTixraacList, evidence);
    const boundedIndexes =
      selectedEvidenceIndexes.length > 0
        ? selectedEvidenceIndexes.slice(0, 2)
        : [0];
    const tixraacList = buildEvidenceReferencesByIndex(evidence, boundedIndexes);

    return NextResponse.json({
      success: true,
      question,
      answer: rawText,
      fatwa: {
        xukun: formatted.xukunka,
        faahfaahin: formatted.faahfaahin,
        ikhtilaf: formatted.ikhtilaaf,
        gunaanad: formatted.gunaanad,
        tixraac: tixraacList,
      },
      evidenceCount: evidence.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Agent error:", err);
    return NextResponse.json(
      {
        error: "Khalad ka dhacay. Dib u isku day.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
