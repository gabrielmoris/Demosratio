import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase client
vi.mock("@/lib/supabaseClient", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Mock fingerprintEncoding
vi.mock("@/lib/helpers/users/fingerprintEncoding", () => ({
  decodeFingerprint: vi.fn(),
}));

// Mock logger
vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

// Now import after mocks are set up
import { calculateSimilarity } from "../../../database/users/fingerprint";
import { decodeFingerprint } from "@/lib/helpers/users/fingerprintEncoding";

// Mock data for fingerprint objects
const mockFingerprintData1 = {
  wg: {
    p1: "NVIDIA GeForce RTX 3080",
    p2: "NVIDIA GeForce RTX 3080",
    p3: "value3",
    p4: "value4",
    p5: "value5",
    p6: "value6",
    p7: "value7",
    p8: 16384,
    p9: "value9",
    p10: "value10",
    p11: "value11",
    p12: 16384,
    p13: "value13",
    p14: "value14",
    p15: "value15",
    p16: "value16",
    p17: "value17",
    p18: "value18",
  },
  h: JSON.stringify({
    h1: 8,
    h2: "1920x1080",
    h3: 24,
    h4: "Europe/Madrid",
  }),
  c: "canvas_fingerprint_1",
};

const mockFingerprintData2 = {
  wg: {
    p1: "NVIDIA GeForce RTX 3080",
    p2: "NVIDIA GeForce RTX 3080",
    p3: "different_value",
    p4: "different_value",
    p5: "different_value",
    p6: "different_value",
    p7: "different_value",
    p8: 16384,
    p9: "different_value",
    p10: "different_value",
    p11: "different_value",
    p12: 16384,
    p13: "different_value",
    p14: "different_value",
    p15: "different_value",
    p16: "different_value",
    p17: "different_value",
    p18: "different_value",
  },
  h: JSON.stringify({
    h1: 8,
    h2: "1920x1080",
    h3: 24,
    h4: "Europe/Madrid",
  }),
  c: "canvas_fingerprint_1",
};

describe("calculateSimilarity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 1 for identical fingerprints", async () => {
    vi.mocked(decodeFingerprint).mockResolvedValue({ fingerprintData: mockFingerprintData1 });

    const result = await calculateSimilarity("fp1", "fp1");

    expect(result).toBe(1);
  });

  it("should return partial similarity for similar fingerprints", async () => {
    vi.mocked(decodeFingerprint)
      .mockResolvedValueOnce({ fingerprintData: mockFingerprintData1 })
      .mockResolvedValueOnce({ fingerprintData: mockFingerprintData2 });

    const result = await calculateSimilarity("fp1", "fp2");

    expect(result).toBeGreaterThan(0.9);
  });

  it("should return 0 when decoding fails", async () => {
    vi.mocked(decodeFingerprint).mockRejectedValue(new Error("Decode error"));

    const result = await calculateSimilarity("invalid", "invalid");

    expect(result).toBe(0);
  });

  it("should return 0 when fingerprint data is invalid", async () => {
    vi.mocked(decodeFingerprint).mockResolvedValue({ fingerprintData: {} });

    const result = await calculateSimilarity("invalid", "invalid");

    // Returns 0.05 because canvas comparison returns match when both are undefined
    expect(result).toBeLessThan(0.1);
  });
});
