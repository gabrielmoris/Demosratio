import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getLikesCount } from "@/lib/database/likes/likesCount";

// vi.hoisted create mocks that can be referenced in vi.mock
const { mockSelect, mockEq, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn(() => ({
    eq: vi.fn(),
  }));

  const mockEq: Mock<
    (
      column: string,
      value: unknown,
    ) => Promise<{
      data: unknown[] | null;
      count: number | null;
      error: null | Error;
    }>
  > = vi.fn(() => Promise.resolve({ data: [], count: 10, error: null }));

  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return { mockSelect, mockEq, mockFrom };
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

describe("getLikesCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ data: [], count: 10, error: null });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("should return likes count when fetch is successful", async () => {
    const result = await getLikesCount(1);

    expect(result).toBe(10);
  });

  it("should call supabaseAdmin.from with 'proposal_likes'", async () => {
    await getLikesCount(1);

    expect(mockFrom).toHaveBeenCalledWith("proposal_likes");
  });

  it("should call eq with 'proposal_id' and the provided id", async () => {
    const proposalId = 42;
    await getLikesCount(proposalId);

    expect(mockEq).toHaveBeenCalledWith("proposal_id", proposalId);
  });

  it("should return null count when data is null", async () => {
    mockEq.mockResolvedValue({ data: null, count: null, error: null });

    const result = await getLikesCount(1);

    expect(result).toBeNull();
  });

  it("should throw error when fetch fails", async () => {
    mockEq.mockResolvedValue({
      data: null,
      count: null,
      error: new Error("Database error"),
    });

    await expect(getLikesCount(1)).rejects.toThrow("Error fetching proposal_likes");
  });
});
