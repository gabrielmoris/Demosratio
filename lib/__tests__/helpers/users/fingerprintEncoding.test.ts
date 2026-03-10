import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { encodeFingerprint, decodeFingerprint } from "@/lib/helpers/users/fingerprintEncoding";
import { Fingerprint } from "@/types/fingerprint";

// Mockups
const { mockCreateDecipheriv, mockUpdate } = vi.hoisted(() => {
  const mockUpdate = vi.fn().mockReturnValue(Buffer.from('{"c":"test","wg":"test","h":"test"}'));
  const mockFinal = vi.fn().mockReturnValue(Buffer.from(""));
  const mockCreateDecipheriv = vi.fn(() => ({
    update: mockUpdate,
    final: mockFinal,
  }));
  return { mockCreateDecipheriv, mockUpdate, mockFinal };
});

global.fetch = vi.fn();

vi.mock("crypto", async () => {
  const actualCrypto = await vi.importActual<typeof import("crypto")>("crypto");
  return {
    __esModule: true,
    default: {
      ...actualCrypto,
      createDecipheriv: mockCreateDecipheriv,
    },
    createDecipheriv: mockCreateDecipheriv,
  };
});

vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

const mockFingerprint: Fingerprint = {
  c: "canvas_fingerprint",
  wg: {
    p1: "GPU1",
    p2: "GPU2",
    p3: "p3",
    p4: "p4",
    p5: "p5",
    p6: "p6",
    p7: "p7",
    p8: "8",
    p9: "p9",
    p10: "p10",
    p11: "p11",
    p12: "12",
    p13: "p13",
    p14: "p14",
    p15: "p15",
    p16: "p16",
    p17: "p17",
    p18: "p18",
  },
  h: '{"h1":8,"h2":"1920x1080","h3":24,"h4":"Europe/Madrid"}',
};

process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("encodeFingerprint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return encoded fingerprint on successful response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ fingerprint: "encoded_fp_123" }),
    } as unknown as Response);

    const result = await encodeFingerprint(mockFingerprint);

    expect(result).toBe("encoded_fp_123");
    expect(fetch).toHaveBeenCalledWith("/api/fingerprint-encoder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fingerprintData: mockFingerprint }),
    });
  });

  it("should throw error when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response);

    await expect(encodeFingerprint(mockFingerprint)).rejects.toThrow("Failed to encode fingerprint");
  });

  it("should throw error when fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    await expect(encodeFingerprint(mockFingerprint)).rejects.toThrow();
  });
});

describe("decodeFingerprint", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should decode fingerprint successfully", async () => {
    mockUpdate.mockReturnValue(Buffer.from(JSON.stringify(mockFingerprint)));

    const result = await decodeFingerprint("iv_hex:encoded_base64");

    expect(result).toEqual(mockFingerprint);
  });

  it("should throw error when fingerprint format is invalid", async () => {
    await expect(decodeFingerprint("invalid_format")).rejects.toThrow("Invalid encoded fingerprint format");
  });

  it("should throw error when fingerprint has wrong number of parts", async () => {
    await expect(decodeFingerprint("part1:part2:part3")).rejects.toThrow("Invalid encoded fingerprint format");
  });

  it("should throw error when ENCRYPTION_KEY is missing", async () => {
    delete process.env.ENCRYPTION_KEY;
    await expect(decodeFingerprint("some_fingerprint")).rejects.toThrow("No ENCRYPTION_KEY in .env");
  });
});
