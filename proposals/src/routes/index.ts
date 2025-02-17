import express, { Request, Response } from "express";
import JSZip from "jszip";
import { ProposalData } from "../../types/proposal.types";

const router = express.Router();

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

      const html = (await response.text())
        .replaceAll("\n", "")
        .replaceAll("\t", "");

      if (html.includes("No hay votaciones")) {
        console.log(`No Votes`);
        resolve([]);
        return;
      }

      const zipLinkMatch = html.match(/href="([^"]+\.zip)"/);

      if (zipLinkMatch == null) {
        console.log(`no Link`);
        resolve([]);
        return;
      }

      const votationJson: ProposalData[] = await extractData(zipLinkMatch[1]);

      resolve(votationJson);
    } catch (error) {
      console.error("Error extracting text from website:", error);
      reject(error);
    }
  });
};

const extractData = async (link: string): Promise<ProposalData[]> => {
  try {
    const zipResponse = await fetch("https://www.congreso.es" + link);

    if (!zipResponse.ok) {
      throw new Error(`HTTP error! status: ${zipResponse.status}`);
    }

    // Check the content type
    const contentType = zipResponse.headers.get("content-type");
    if (
      contentType !== "application/zip" &&
      contentType !== "application/x-zip-compressed"
    ) {
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
      throw new Error("No data");
    }

    return jsonFiles;
  } catch (error) {
    console.error("Error extracting data from ZIP:", error);
    throw error;
  }
};

router.get("/api/proposals", async (req: Request, res: Response) => {
  const extractedData = await extractParliamentJson();

  if (!extractedData) {
    res.status(200).send([]);
    return;
  }

  const responseData = {
    ProposalData: extractedData,
  };

  res.status(200).send(responseData);
});

export { router as indexParliamentRouter };
