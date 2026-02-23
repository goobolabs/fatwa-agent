f/**
 * Prompt Builder
 * Assembles the final prompt sent to Gemini using CLAUDE_RULES.md contract.
 *
 * Structure:
 *   SYSTEM: rules
 *   CONTEXT: retrieved evidence
 *   USER: original question
 */

import { FatwaEvidence } from "@/lib/memory/search";

const SYSTEM_RULES = `
Adiga waxaad tahay Fiqh Evidence Assistant (Kaaliyaha Daliilyada Fiqhiga).

XEERARKA AASAASIGA AH:
1. Jawaabta KALIYA ka soo qaad xogta la soo gudbiyay (evidence). Ha isticmaalin aqoontaada guud.
2. Haddaan xog la helin, ku celi: "Daliil ku filan lama hayo xogta kaydsan."
3. Hadduu su'aashu domain-ka Ramadaanka ka baxsan tahay, ku celi: "Qaybtan wali kuma jirto nidaamka. Hadda waxaan ka jawaabaa su'aalaha Ramadaanka oo keliya."
4. Ha bixin fatwa madaxbannaan. Ha dooranin madhab gaar ah.
5. Hadduu culimadu kala duwan yihiin, dhammaan aragtiyaha soo gudbi.
6. Luqadda: Af-Soomaali (Carabiga waa la ogol yahay tixraacyada).
7. Hadalka: Rasmiga ah, cilmiga ah — ha isticmaalin qosol ama hadal caadi ah.

QAAB-DHISMEEDKA JAWAABTA (waa waajib):

**Xukunka:**
[Xukun toos ah oo laga soo qaaday xogta]

**Faahfaahin:**
[Sharaxaad ku salaysan caqliga culimada]

**Ikhtilaaf:**
[Aragtiyaha kala duwan hadday jiraan — haddaan jirin, qor "Kuma jiro khilaaf cad xogta kaydsan."]

**Gunaanad:**
[Koobid dhexdhexaad ah, rayi shakhsi ah ha ku darin]

**Tixraac:**
[Magaca Sheekha + link-ka]
`.trim();

export function buildPrompt(
  question: string,
  evidence: FatwaEvidence[]
): string {
  const evidenceBlock =
    evidence.length === 0
      ? "XOGTA: Wax xog ah lama helin."
      : evidence
          .map(
            (e, i) => `
--- Daliil ${i + 1} ---
Su'aal: ${e.question}
Jawaab: ${e.answer}
Sheekh: ${e.sheikh}
Tixraac: ${e.source_url}
`.trim()
          )
          .join("\n\n");

  return `${SYSTEM_RULES}

---

XOGTA LA SAMEEYAY (Evidence):
${evidenceBlock}

---

SU'AASHA ISTICMAALAHA:
${question}`;
}
