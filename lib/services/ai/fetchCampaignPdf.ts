// Gemini accepts PDFs sent inline in the request up to this size.
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

const DOWNLOAD_TIMEOUT_MS = 60_000;

export type PdfFetchErrorCode = "INVALID_URL" | "DOWNLOAD_FAILED" | "NOT_PDF" | "TOO_LARGE";

export class PdfFetchError extends Error {
  constructor(public code: PdfFetchErrorCode, message: string) {
    super(message);
    this.name = "PdfFetchError";
  }
}

const isPdf = (bytes: Uint8Array) =>
  bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // "%PDF"

const toMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

/**
 * Downloads a campaign PDF from a public link and returns it as base64.
 * Rejects links that are not a PDF or are bigger than MAX_PDF_BYTES without sending anything to the AI.
 */
export async function fetchCampaignPdf(pdfUrl: string): Promise<{ base64: string; sizeBytes: number }> {
  let url: URL;
  try {
    url = new URL(pdfUrl);
  } catch {
    throw new PdfFetchError("INVALID_URL", `The campaign link is not a valid URL: ${pdfUrl}`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new PdfFetchError("INVALID_URL", `The campaign link must be http(s): ${pdfUrl}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; Demosratio/1.0; +https://demosratio.es)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    });
  } catch (error) {
    throw new PdfFetchError("DOWNLOAD_FAILED", `Could not download the campaign PDF: ${(error as Error).message}`);
  }

  if (!response.ok || !response.body) {
    throw new PdfFetchError("DOWNLOAD_FAILED", `Could not download the campaign PDF (HTTP ${response.status}).`);
  }

  const declaredSize = Number(response.headers.get("content-length"));
  if (declaredSize > MAX_PDF_BYTES) {
    await response.body.cancel();
    throw new PdfFetchError("TOO_LARGE", `The PDF is ${toMb(declaredSize)} MB. The maximum is ${toMb(MAX_PDF_BYTES)} MB.`);
  }

  // Read the body in chunks so a server that lies about (or omits) content-length can't exceed the limit.
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    sizeBytes += value.byteLength;
    if (sizeBytes > MAX_PDF_BYTES) {
      await reader.cancel();
      throw new PdfFetchError("TOO_LARGE", `The PDF is bigger than ${toMb(MAX_PDF_BYTES)} MB.`);
    }
    chunks.push(value);
  }

  const bytes = Buffer.concat(chunks);
  if (!isPdf(bytes)) {
    throw new PdfFetchError("NOT_PDF", "The campaign link does not point to a PDF file (it may be a web page).");
  }

  return { base64: bytes.toString("base64"), sizeBytes };
}
