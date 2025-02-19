import JSZip from "jszip";
import { ProposalData } from "../types/proposal.types";
import verifyConnections from "./database/db";
import { createTables } from "./database/tables";
import { Logger } from "tslog";

const log = new Logger();

async function initializeDatabase() {
  try {
    await verifyConnections();
    await createTables();
    log.info("Database initialization complete.");
  } catch (error) {
    log.error("Database initialization failed:", error);
  }
}

const extractParliamentJson = async (): Promise<ProposalData[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        "https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=XV&targetDate=11/02/2025"
      );

      if (!response.ok) {
        reject(`HTTP error! status: ${response.status}`);
        return;
      }

      const html = (await response.text()).replaceAll("\n", "").replaceAll("\t", "");

      if (html.includes("No hay votaciones")) {
        log.info(`No Votes`);
        resolve([]);
        return;
      }

      const zipLinkMatch = html.match(/href="([^"]+\.zip)"/);

      if (zipLinkMatch == null) {
        log.info(`no Link`);
        resolve([]);
        return;
      }

      const votationJson: ProposalData[] = await extractData(zipLinkMatch[1]);

      resolve(votationJson);
    } catch (error) {
      log.error("Error extracting text from website:", error);
      reject(error);
    }
  });
};

const extractData = async (link: string): Promise<ProposalData[]> => {
  try {
    const zipResponse = await fetch("https://www.congreso.es" + link);

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

const saveToDb = async () => {
  // await initializeDatabase();
  const res = await extractParliamentJson();

  res.forEach((votation) => {
    const { sesion: session, fecha: date, titulo: title, textoExpediente: expedient_text } = votation.informacion;
    const { presentes: parliament_presence, afavor: votes_for, enContra: votes_against, abstenciones: abstentions } = votation.totales;
    console.log(session, date, title, expedient_text, parliament_presence, votes_for, votes_against, abstentions);
  });
};

saveToDb();
