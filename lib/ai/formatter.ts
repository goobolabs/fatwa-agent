/**
 * Response Formatter
 * Parses Gemini's raw text output into structured fatwa sections.
 */

export interface FatwaResponse {
  xukunka: string;
  faahfaahin: string;
  ikhtilaaf: string;
  gunaanad: string;
  tixraac: string;
  raw: string;
}

function extractSection(text: string, heading: string): string {
  const regex = new RegExp(
    `\\*{0,2}${heading}\\*{0,2}[:\\s]*([\\s\\S]*?)(?=\\n\\*{0,2}(?:Xukunka|Faahfaahin|Ikhtilaaf|Gunaanad|Tixraac)\\*{0,2}[:\\s]|$)`,
    "i"
  );
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

export function formatFatwaResponse(rawText: string): FatwaResponse {
  return {
    xukunka: extractSection(rawText, "Xukunka"),
    faahfaahin: extractSection(rawText, "Faahfaahin"),
    ikhtilaaf: extractSection(rawText, "Ikhtilaaf"),
    gunaanad: extractSection(rawText, "Gunaanad"),
    tixraac: extractSection(rawText, "Tixraac"),
    raw: rawText,
  };
}
