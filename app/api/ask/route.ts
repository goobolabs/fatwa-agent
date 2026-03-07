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
import { GoogleGenerativeAI } from "@google/generative-ai";

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

function buildEvidenceReferences(
  evidence: { sheikh: string; source_url: string }[]
): string[] {
  const refs: string[] = [];
  const seenUrls = new Set<string>();

  for (const e of evidence) {
    const url = extractFirstUrl(e.source_url ?? "");
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    const label = e.sheikh?.trim() ? `Sheekh: ${e.sheikh.trim()}` : "Tixraac";
    refs.push(`${label} - ${url}`);
  }

  return refs;
}

function mergeReferences(modelRefs: string[], evidenceRefs: string[]): string[] {
  const merged: string[] = [];
  const seenUrls = new Set<string>();

  for (const line of [...modelRefs, ...evidenceRefs]) {
    const cleaned = normalizeRefLine(line);
    if (!cleaned) continue;
    const url = extractFirstUrl(cleaned);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    merged.push(cleaned);
  }

  return merged;
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key la'aan. Server-ka waa in la hagaajiyo." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use model from env (confirmed available via ListModels)
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response) throw new Error("Gemini returned no response");
    const rawText = response.text();
    if (!rawText.trim()) throw new Error("Gemini returned empty text");

    // Step 6: Format and return
    const formatted = formatFatwaResponse(rawText);

    const modelTixraacList = formatted.tixraac
      ? formatted.tixraac.split("\n").map((t) => t.trim()).filter(Boolean)
      : [];
    const evidenceTixraacList = buildEvidenceReferences(evidence);
    const tixraacList = mergeReferences(modelTixraacList, evidenceTixraacList);

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
