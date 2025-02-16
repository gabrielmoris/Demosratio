import { ParlamentData } from "@/types/parliament.types";
import JSZip from "jszip";

const extractPArlamentJson = async (): Promise<ParlamentData[]> => {
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
        reject(`No Votes`);
        return;
      }

      const zipLinkMatch = html.match(/href="([^"]+\.zip)"/);

      if (zipLinkMatch == null) {
        reject(`no Link`);
        return;
      }

      const votationJson: ParlamentData[] = await extractData(zipLinkMatch[1]);

      resolve(votationJson);
    } catch (error) {
      console.error("Error extracting text from website:", error);
      reject(error);
    }
  });
};

const extractData = async (link: string): Promise<ParlamentData[]> => {
  try {
    const zipResponse = await fetch("https://www.congreso.es" + link);

    if (!zipResponse.ok) {
      throw new Error(`HTTP error! status: ${zipResponse.status}`);
    }

    // Check the content type
    const contentType = zipResponse.headers.get("content-type");
    if (contentType !== "application/zip" && contentType !== "application/x-zip-compressed") {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    // ArrayBuffer
    const zipArrayBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipArrayBuffer);

    const jsonFiles: ParlamentData[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith(".json")) {
        const content = await file.async("text");
        jsonFiles.push(JSON.parse(content) as ParlamentData);
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

export async function GET() {
  const extractedData = await extractPArlamentJson();

  if (!extractedData) {
    return new Response(JSON.stringify({ parlamentData: null }), {
      status: 200,
    });
  }

  const responseData = {
    parlamentData: extractedData,
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
  });
}
