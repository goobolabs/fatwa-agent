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
    `\\*{0,2}${heading}\\*{0,2}[:\\s]*([\\s\\S]*?)(?=\\n\\*{0,2}(?:Xukunka|Faahfaahin|Ikhtilaaf|Gunaanad|Tixraac(?:yada)?)\\*{0,2}[:\\s]|$)`,
    "i"
  );
  const match = text.match(regex);
  if (!match) return "";
  return match[1]
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // remove **bold** / *italic*
    .replace(/^\s*[\*\-]\s+/gm, "• ")         // replace "* item" with "• item"
    .replace(/\*+/g, "")                       // strip any remaining asterisks
    .trim();
}

export function formatFatwaResponse(rawText: string): FatwaResponse {
  return {
    xukunka: extractSection(rawText, "Xukunka"),
    faahfaahin: extractSection(rawText, "Faahfaahin"),
    ikhtilaaf: extractSection(rawText, "Ikhtilaaf"),
    gunaanad: extractSection(rawText, "Gunaanad"),
    tixraac: extractSection(rawText, "Tixraac(?:yada)?"),
    raw: rawText,
  };
}
