import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { fetchAllParties } from "@/lib/database/parties/getAllParties";

const mockParties = [
  { id: 1, name: "PSOE", acronym: "PSOE" },
  { id: 2, name: "PP", acronym: "PP" },
  { id: 3, name: "VOX", acronym: "VOX" },
];

// vi.hoisted create mocks that can be referenced in vi.mock
const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect: Mock<
    () => Promise<{
      data:
        | {
            id: number;
            name: string;
            acronym: string;
          }[]
        | null;
      error: null | Error;
    }>
  > = vi.fn(() => Promise.resolve({ data: mockParties, error: null }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockSelect, mockFrom };
});

// Mock the supabase client
vi.mock("@/lib/supabaseClient", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

// Mock logger
vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
  },
}));

describe("fetchAllParties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockResolvedValue({ data: mockParties, error: null });
  });

  it("should return parties when fetch is successful", async () => {
    const result = await fetchAllParties();

    expect(result).toHaveProperty("parties");
    expect(result.parties).toEqual(mockParties);
  });

  it("should call supabaseAdmin.from with 'parties'", async () => {
    await fetchAllParties();

    expect(mockFrom).toHaveBeenCalledWith("parties");
  });

  it("should handle errors when fetch fails", async () => {
    mockSelect.mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    const result = await fetchAllParties();

    expect(result).toHaveProperty("error");
  });
});
