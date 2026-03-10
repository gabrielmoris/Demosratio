import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractParliamentJson, extractParliamentZip } from "@/lib/helpers/spanishParliamentExtractor/getParliamentData";
import JSZipType from "jszip";

// Mocks
vi.mock("jszip", () => ({
  default: {
    loadAsync: vi.fn(),
  },
}));

vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

global.fetch = vi.fn();

describe("extractParliamentJson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no votes for the day", async () => {
    const mockHtml = "<html><body>No hay votaciones</body></html>";
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    } as unknown as Response);

    const result = await extractParliamentJson("2024-01-01");

    expect(result).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("2024-01-01"), expect.any(Object));
  });

  it("should reject when fetch fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response);

    await expect(extractParliamentJson("2024-01-01")).rejects.toThrow("HTTP error!");
  });

  it("should fetch and extract data from zip file", async () => {
    // First call returns HTML with zip link
    const mockHtml = '<html><body><a href="/some/file.zip">Download</a></body></html>';
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      } as unknown as Response)
      // Second call returns zip
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/zip" }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response);

    // Mock JSZip
    const mockFile = {
      async: vi.fn().mockResolvedValue('{"informacion":{"sesion":"1"},"totales":{},"votaciones":[]}'),
    };
    const mockZip = {
      files: {
        "data.json": mockFile,
      },
    };

    const JSZip = (await import("jszip")).default as unknown as typeof JSZipType;
    vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZipType);

    const result = await extractParliamentJson("2024-01-01");

    expect(result).toHaveLength(1);
    expect(result[0].informacion.sesion).toBe("1");
  });
});

describe("extractParliamentZip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);

    await expect(extractParliamentZip("/some/file.zip")).rejects.toThrow("HTTP error!");
  });

  it("should extract JSON files from zip", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/zip" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as unknown as Response);

    const mockFile = {
      async: vi.fn().mockResolvedValue(
        JSON.stringify({
          informacion: { sesion: "1", fecha: "2024-01-01", titulo: "Test", textoExpediente: "exp1" },
          totales: { presentes: 10, afavor: 5, enContra: 3, abstenciones: 2, noVotan: 0, asentimiento: "no" },
          votaciones: [],
        }),
      ),
    };
    const mockZip = {
      files: {
        "proposal1.json": mockFile,
      },
    };

    const JSZip = (await import("jszip")).default as unknown as typeof JSZipType;
    vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZipType);

    const result = await extractParliamentZip("/some/file.zip");

    expect(result).toHaveLength(1);
    expect(result[0].informacion.titulo).toBe("Test");
  });

  it("should throw when no JSON files in zip", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/zip" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as unknown as Response);

    const mockZip = {
      files: {
        "readme.txt": { async: vi.fn() },
      },
    };

    const JSZip = (await import("jszip")).default as unknown as typeof JSZipType;
    vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZipType);

    await expect(extractParliamentZip("/some/file.zip")).rejects.toThrow("No data");
  });
});
