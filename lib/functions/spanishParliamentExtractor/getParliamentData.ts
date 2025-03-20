import { Logger } from "tslog";
import { ProposalData } from "@/types/proposal.types";

import JSZip from "jszip";

const log = new Logger();

export const extractParliamentJson = async (date: string): Promise<ProposalData[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        "https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=XV&targetDate=" +
          date,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

// EXTRACT DATA FROM ZIP
export const extractParliamentZip = async (link: string): Promise<ProposalData[]> => {
  try {
    const zipResponse = await fetch("https://www.congreso.es" + link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
