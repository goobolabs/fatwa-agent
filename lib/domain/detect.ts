/**
 * Domain Detection Module
 * Determines if a user question falls within the allowed Ramadan Fiqh domain.
 */

const RAMADAN_KEYWORDS = [
  // Somali
  "soon", "soonka", "soomid", "soomaan", "soomaanayaa",
  "iftar", "suxuur", "sahuur", "ramadan", "ramadaan",
  "xayd", "xaayd", "ciid", "laylatul", "qadr",
  "taraweex", "tarawiix", "fidyo", "kafaarad", "kafaaro",
  "qadaa", "qadhaa", "xannibaad", "waa xaaraan", "waa xalaal",
  "biyaha", "cuntada", "daawo", "dawo", "tallaallo", "tallaal",
  "injectiin", "injekshan", "dhiig", "dhiigsiin",
  "jinsiga", "galmada", "galmo", "jimicsi",
  "toothpaste", "miswak", "miswaak", "afka",
  "indha", "ilkaha", "sanka", "neefta",
  "safar", "musaafir", "safarka", "socdaalka",
  "bukaan", "xanuun", "cudur", "bukaansan",
  "hayd", "nifaas", "caadada", "dhiiga",
  "miyir", "waalli", "da", "gaboobay",
  "kaniini", "contraceptive", "xabadda",
  "sigaar", "sigaarka", "sigaarka cabid",
  "qiiq", "buun", "dukhaan",
  "khamri", "khamriga", "alcohol",
  "wudhuu", "ghusl", "tahaarad", "nadiifnaan",
  "salaad", "salaadda", "tukasho",
  "zakat", "zakatul fitr", "sadaqada",
  "niyad", "niyada", "intention",

  // Arabic terms commonly used
  "sawm", "siyam", "iftaar", "suhoor",
  "fajr", "maghrib", "asr", "dhuhr", "isha",
  "haid", "nifas", "junub", "janaba",
  "wudhu", "tayammum", "ghusl",
  "fidyah", "kaffarah", "qada",
  "imsak", "imsaak",
];

export function detectDomain(question: string): {
  isAllowed: boolean;
  domain: string;
} {
  const lower = question.toLowerCase();

  const isRamadan = RAMADAN_KEYWORDS.some((kw) => lower.includes(kw));

  if (isRamadan) {
    return { isAllowed: true, domain: "ramadan" };
  }

  return { isAllowed: false, domain: "unknown" };
}
