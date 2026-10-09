import { Logger } from "tslog";
import { ProposalData } from "@/types/proposal.types";

import JSZip from "jszip";

const log = new Logger();

/**
 * Legislature scraped by default. Override with the TARGET_LEGISLATURA env var,
 * e.g. set it to "XVI" once the new legislature starts after the Nov 2026 election.
 */
export const DEFAULT_LEGISLATURA = "XV";

/** Legislature to scrape, configurable via environment (defaults to XV). */
export const getTargetLegislatura = (): string => process.env.TARGET_LEGISLATURA || DEFAULT_LEGISLATURA;

const ROMAN_VALUES: [string, number][] = [
  ["M", 1000],
  ["CM", 900],
  ["D", 500],
  ["CD", 400],
  ["C", 100],
  ["XC", 90],
  ["L", 50],
  ["XL", 40],
  ["X", 10],
  ["IX", 9],
  ["V", 5],
  ["IV", 4],
  ["I", 1],
];

export const romanToInt = (roman: string): number => {
  let value = 0;
  let i = 0;
  while (i < roman.length) {
    for (const [symbol, num] of ROMAN_VALUES) {
      if (roman.startsWith(symbol, i)) {
        value += num;
        i += symbol.length;
        break;
      }
    }
  }
  return value;
};

export const intToRoman = (num: number): string => {
  let out = "";
  for (const [symbol, value] of ROMAN_VALUES) {
    while (num >= value) {
      out += symbol;
      num -= value;
    }
  }
  return out || "I";
};

/** Next legislature in Roman numerals (e.g. XV -> XVI, XLIX -> L). */
export const nextLegislatura = (legislatura: string): string => intToRoman(romanToInt(legislatura) + 1);

/** Builds the congreso.es open-data votations URL for a legislature and date. */
export const buildVotacionesUrl = (legislatura: string, date: string): string =>
  `https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=${legislatura}&targetDate=${date}`;

export const extractParliamentJson = async (date: string, legislatura: string = getTargetLegislatura()): Promise<ProposalData[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(buildVotacionesUrl(legislatura, date), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://www.congreso.es/",
            Origin: "https://www.congreso.es",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9",
          },
        }
      );

      if (!response.ok) {
        reject(`HTTP error! status from www.congreso.e: ${response.status}`);
        return;
      }

      const html = (await response.text()).replaceAll("\n", "").replaceAll("\t", "");

      if (html.includes("No hay votaciones")) {
        log.info(`No Votes for the day ${date}`);
        resolve([]);
        return;
      }

      const zipLinkMatch = html.match(/href="([^"]+\.zip)"/);

      if (zipLinkMatch == null) {
        log.info(`no Link`);
        resolve([]);
        return;
      }

      const votationJson: ProposalData[] = await extractParliamentZip(zipLinkMatch[1]);

      resolve(votationJson);
    } catch (error) {
      log.error("Error extracting text from website:", error);
      reject(error);
    }
  });
};

/**
 * Extracts the votations for a date, transparently handling legislature transitions.
 * If the configured legislature has no votes that day (e.g. after a general election,
 * when the new legislature starts), it retries with the next one (XV -> XVI).
 * Returns which legislatura actually produced the data, so callers can build correct URLs.
 */
export const extractParliamentDataForDay = async (date: string): Promise<{ legislatura: string; votations: ProposalData[] }> => {
  const legislatura = getTargetLegislatura();

  const votations = await extractParliamentJson(date, legislatura);
  if (votations.length > 0) {
    return { legislatura, votations };
  }

  const next = nextLegislatura(legislatura);
  log.info(`No votes for ${date} in Legislatura ${legislatura}; retrying with ${next}`);

  const nextVotations = await extractParliamentJson(date, next);
  return { legislatura: nextVotations.length > 0 ? next : legislatura, votations: nextVotations };
};

// EXTRACT DATA FROM ZIP
export const extractParliamentZip = async (link: string): Promise<ProposalData[]> => {
  try {
    const zipResponse = await fetch("https://www.congreso.es" + link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.congreso.es/",
        Origin: "https://www.congreso.es",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });

    if (!zipResponse.ok) {
      log.error(`HTTP error! status: ${zipResponse.status}`);
      throw new Error(`HTTP error! status: ${zipResponse.status}`);
    }

    // Check the content type
    const contentType = zipResponse.headers.get("content-type");
    if (contentType !== "application/zip" && contentType !== "application/x-zip-compressed") {
      log.error(`Unexpected content type: ${contentType}`);
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    // ArrayBuffer
    const zipArrayBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipArrayBuffer);

    const jsonFiles: ProposalData[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith(".json")) {
        const content = await file.async("text");
        jsonFiles.push(JSON.parse(content) as ProposalData);
      }
    }

    if (jsonFiles.length === 0) {
      log.error("No data");
      throw new Error("No data");
    }

    return jsonFiles;
  } catch (error) {
    log.error("Error extracting data from ZIP:", error);
    throw error;
  }
};
