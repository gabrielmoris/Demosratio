import { Logger } from "tslog";
import { intToRoman, romanToInt } from "./getParliamentData";

const log = new Logger();

const CONGRESO = "https://www.congreso.es";

// Undocumented JSON endpoint behind the "Búsqueda de iniciativas" page on congreso.es
const SEARCH_URL =
  `${CONGRESO}/es/busqueda-de-iniciativas?p_p_id=iniciativas&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view` +
  `&p_p_resource_id=filtrarListado&p_p_cacheability=cacheLevelPage`;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: `${CONGRESO}/`,
  "Accept-Language": "es-ES,es;q=0.9",
};

/** Minimum similarity between the vote text and the initiative title to accept a match. */
export const MIN_MATCH_SCORE = 0.5;
/** The best match must beat the runner-up by this much, otherwise it's ambiguous. */
export const MIN_MATCH_GAP = 0.1;
const MAX_QUERY_WORDS = 8;
export const EMPTY_SEARCH_RETRY_MS = 3000;

// Short or very common words that add noise to the search. "y", "o" and "no" are also
// operators in Congreso's search syntax, so they must never be sent.
const STOP_WORDS = new Set([
  "para", "sobre", "relativa", "relativo", "entre", "desde", "hasta", "como", "cual", "este", "esta",
  "estos", "estas", "todo", "toda", "todos", "todas", "donde", "hecho", "hecha", "parte", "otras", "otros",
  "medidas", "materia",
]);

export interface InitiativeSearchResult {
  id: string;
  title: string;
  type?: string;
}

/**
 * Initiative number prefixes (the "162" in "162/000769") the vote text can refer to.
 * null means a procedural vote with no initiative text worth summarising.
 */
export const expectedInitiativePrefixes = (expedientText: string): string[] | null => {
  const text = expedientText.trim();

  if (/^Proposici[oó]n no de Ley/i.test(text)) return ["161", "162"];
  if (/^Moci[oó]n consecuencia de interpelaci[oó]n/i.test(text)) return ["173"];
  if (/^(Acuerdo|Convenio|Protocolo|Canje de Notas|Tratado|Denuncia|Enmiendas? (al|a la|del))\b/i.test(text)) return ["110"];
  if (/Real Decreto-ley/i.test(text)) return ["130"];
  if (/Proyecto de Ley/i.test(text)) return ["121"];
  if (/Proposici[oó]n de Ley/i.test(text)) return ["122", "123", "124", "125"];

  return null;
};

/** Removes the parts of the vote text that never appear in the initiative title. */
export const cleanExpedientText = (expedientText: string): string =>
  expedientText
    .replace(/\s+/g, " ")
    .trim()
    // "(Votación separada por puntos. Punto 2.)" added by buildExpedientText
    .replace(/\s*\([^()]*Punto[^()]*\)\s*$/i, "")
    // "Votación de la enmienda a la totalidad de devolución al Proyecto de Ley ..." -> "Proyecto de Ley ..."
    .replace(/^Votaci[oó]n .*?(?=(Proyecto|Proposici[oó]n) de Ley)/i, "")
    .replace(/,?\s*presentad[ao]s? por .*$/i, "")
    .replace(/,\s*hech[oa] (ad referendum )?en .*$/i, "")
    .replace(/\s*del Grupo Parlamentario [^,]*,/i, "")
    .replace(/^(Proposici[oó]n no de Ley|Moci[oó]n consecuencia de interpelaci[oó]n urgente)\s*/i, "")
    .trim();

const normalizeWord = (word: string): string =>
  word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Meaningful words of a text, in order, without duplicates. */
export const contentWords = (text: string): string[] => {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const raw of text.split(/\s+/)) {
    const word = normalizeWord(raw);
    if (word.length <= 3 || STOP_WORDS.has(word) || seen.has(word)) continue;
    seen.add(word);
    words.push(word);
  }
  return words;
};

/** Search text sent to Congreso: the first meaningful words of the cleaned vote text. */
export const buildSearchQuery = (expedientText: string): string => {
  const cleaned = cleanExpedientText(expedientText);
  // Keep original spelling (accents) for the search; contentWords decides which words to keep
  const keep = new Set(contentWords(cleaned));
  const words: string[] = [];
  for (const raw of cleaned.split(/\s+/)) {
    const stripped = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    const key = normalizeWord(raw);
    if (keep.has(key)) {
      words.push(stripped);
      keep.delete(key);
    }
    if (words.length === MAX_QUERY_WORDS) break;
  }
  return words.join(" ");
};

/** Dice similarity between the meaningful words of two texts (0..1). */
export const similarity = (a: string, b: string): number => {
  const wordsA = new Set(contentWords(a));
  const wordsB = new Set(contentWords(b));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  wordsA.forEach((w) => wordsB.has(w) && shared++);
  return (2 * shared) / (wordsA.size + wordsB.size);
};

/**
 * Picks the initiative the vote refers to, or null when there is no single clear match.
 * Better to show no summary than the summary of the wrong initiative.
 */
export const pickInitiative = (
  expedientText: string,
  results: InitiativeSearchResult[],
  prefixes: string[]
): InitiativeSearchResult | null => {
  const cleaned = cleanExpedientText(expedientText);
  const scored = results
    .filter((r) => prefixes.some((p) => r.id.startsWith(`${p}/`)))
    .map((r) => ({ result: r, score: similarity(cleaned, r.title) }))
    .sort((a, b) => b.score - a.score);

  const [best, second] = scored;
  if (!best || best.score < MIN_MATCH_SCORE) return null;
  if (second && best.score - second.score < MIN_MATCH_GAP) return null;
  return best.result;
};

/** "XV" or "15" -> "15"; reads targetLegislatura from a congreso.es votes URL. */
export const legislaturaFromVoteUrl = (url: string): string | null => {
  const match = url.match(/targetLegislatura=([IVXLCDM]+|\d+)/i);
  if (!match) return null;
  const value = match[1];
  return /^\d+$/.test(value) ? value : String(romanToInt(value.toUpperCase()));
};

type RawSearchResponse = {
  lista_iniciativas?: Record<string, { id_iniciativa?: string; titulo?: string; tipo?: string }> | null;
};

export const parseSearchResponse = (data: RawSearchResponse): InitiativeSearchResult[] =>
  Object.values(data?.lista_iniciativas ?? {})
    .filter((i) => i?.id_iniciativa && i?.titulo)
    .map((i) => ({ id: i.id_iniciativa as string, title: i.titulo as string, type: i.tipo }));

/** Searches initiatives by text in one legislature (first page of results only). */
export const searchInitiatives = async (query: string, legislatura: string): Promise<InitiativeSearchResult[]> => {
  const body = new URLSearchParams({
    _iniciativas_legislatura: legislatura,
    _iniciativas_texto: query,
    _iniciativas_paginaActual: "1",
  });

  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body,
  });

  if (!response.ok) throw new Error(`Congreso search failed: ${response.status}`);
  return parseSearchResponse((await response.json()) as RawSearchResponse);
};

/** First Congreso bulletin (BOCG) link in an initiative's detail page, or null. */
export const extractFirstBocgUrl = (html: string): string | null => {
  const match = html.match(/href="(\/public_oficiales\/L\d+\/CONG\/BOCG\/[^"]+?\.PDF(?:#page=\d+)?)"/i);
  return match ? `${CONGRESO}${match[1]}` : null;
};

/** legislatura is the number ("15"); the detail page only works with Roman numerals ("XV"). */
export const buildInitiativeDetailUrl = (initiativeId: string, legislatura: string): string => {
  const params = new URLSearchParams({
    p_p_id: "iniciativas",
    p_p_lifecycle: "0",
    p_p_state: "normal",
    p_p_mode: "view",
    _iniciativas_mode: "mostrarDetalle",
    _iniciativas_legislatura: intToRoman(Number(legislatura)),
    _iniciativas_id: initiativeId,
  });
  return `${CONGRESO}/es/busqueda-de-iniciativas?${params.toString()}`;
};

/** Link to the first official publication (BOCG PDF) of an initiative, or null if not published. */
export const fetchInitiativePdfUrl = async (initiativeId: string, legislatura: string): Promise<string | null> => {
  const response = await fetch(buildInitiativeDetailUrl(initiativeId, legislatura), { headers: HEADERS });
  if (!response.ok) throw new Error(`Congreso initiative page failed: ${response.status}`);
  return extractFirstBocgUrl(await response.text());
};

export type InitiativeLookup =
  | { status: "found"; initiative: InitiativeSearchResult; pdfUrl: string }
  | { status: "no_pdf"; initiative: InitiativeSearchResult }
  | { status: "not_applicable" }
  | { status: "no_match" };

/** Finds the initiative a vote is about and its official PDF. Network errors are thrown. */
export const lookupInitiative = async (expedientText: string, voteUrl: string): Promise<InitiativeLookup> => {
  const prefixes = expectedInitiativePrefixes(expedientText);
  if (!prefixes) return { status: "not_applicable" };

  const legislatura = legislaturaFromVoteUrl(voteUrl);
  const query = buildSearchQuery(expedientText);
  if (!legislatura || !query) return { status: "no_match" };

  let results = await searchInitiatives(query, legislatura);
  if (results.length === 0) {
    // The search sometimes answers empty for a query that works a moment later
    await new Promise((resolve) => setTimeout(resolve, EMPTY_SEARCH_RETRY_MS));
    results = await searchInitiatives(query, legislatura);
  }
  const initiative = pickInitiative(expedientText, results, prefixes);
  if (!initiative) {
    log.info(`No clear initiative for "${query}" (${results.length} results)`);
    return { status: "no_match" };
  }

  const pdfUrl = await fetchInitiativePdfUrl(initiative.id, legislatura);
  return pdfUrl ? { status: "found", initiative, pdfUrl } : { status: "no_pdf", initiative };
};
