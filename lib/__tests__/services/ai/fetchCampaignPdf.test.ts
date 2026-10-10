import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchCampaignPdf, MAX_PDF_BYTES, PdfFetchError } from "@/lib/services/ai/fetchCampaignPdf";

const pdfBytes = new TextEncoder().encode("%PDF-1.7 fake content");

const mockFetch = (body: Uint8Array | null, init: { status?: number; headers?: Record<string, string> } = {}) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(body, { status: init.status ?? 200, headers: init.headers }));

const expectCode = async (promise: Promise<unknown>, code: string) => {
  const error = (await promise.catch((e) => e)) as PdfFetchError;
  expect(error).toBeInstanceOf(PdfFetchError);
  expect(error.code).toBe(code);
};

describe("fetchCampaignPdf", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the PDF as base64", async () => {
    mockFetch(pdfBytes);
    const result = await fetchCampaignPdf("https://example.com/programa.pdf");
    expect(result.sizeBytes).toBe(pdfBytes.length);
    expect(Buffer.from(result.base64, "base64").toString()).toBe("%PDF-1.7 fake content");
  });

  it("rejects invalid URLs without fetching", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expectCode(fetchCampaignPdf("not a url"), "INVALID_URL");
    await expectCode(fetchCampaignPdf("ftp://example.com/a.pdf"), "INVALID_URL");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects links that are not a PDF (e.g. a web page)", async () => {
    mockFetch(new TextEncoder().encode("<!doctype html><html></html>"), { headers: { "content-type": "text/html" } });
    await expectCode(fetchCampaignPdf("https://example.com/programa"), "NOT_PDF");
  });

  it("rejects when content-length is over 20 MB", async () => {
    mockFetch(pdfBytes, { headers: { "content-length": String(MAX_PDF_BYTES + 1) } });
    await expectCode(fetchCampaignPdf("https://example.com/big.pdf"), "TOO_LARGE");
  });

  it("rejects when the body is over 20 MB even without content-length", async () => {
    const big = new Uint8Array(MAX_PDF_BYTES + 1);
    big.set(pdfBytes);
    mockFetch(big);
    await expectCode(fetchCampaignPdf("https://example.com/big.pdf"), "TOO_LARGE");
  });

  it("reports HTTP errors and network failures as DOWNLOAD_FAILED", async () => {
    mockFetch(null, { status: 404 });
    await expectCode(fetchCampaignPdf("https://example.com/missing.pdf"), "DOWNLOAD_FAILED");

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNRESET"));
    await expectCode(fetchCampaignPdf("https://example.com/down.pdf"), "DOWNLOAD_FAILED");
  });
});
