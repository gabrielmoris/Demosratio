import { getUserDislikes } from "@/lib/database/likes/user/getUserDislikes";
import { describe, vi, beforeEach, Mock, it, expect } from "vitest";

const { mockFrom, mockCount } = vi.hoisted(() => {
  const mockCount: Mock<() => Promise<{ count: number | null; error: null | Error }>> = vi.fn(() => Promise.resolve({ count: 5, error: null }));
  const mockEq: Mock<() => { eq: typeof mockCount }> = vi.fn(() => ({ eq: mockCount }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return { mockFrom, mockSelect, mockEq, mockCount };
});

vi.mock("@/lib/supabaseClient", () => ({
  supabaseAdmin: { from: mockFrom },
}));

vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
  },
}));

describe("getUserDislikes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return count of likes", async () => {
    const result = await getUserDislikes(1, 1);
    expect(result).toBe(5);
  });

  it("should call supabaseAdmin.from with 'proposal_likes'", async () => {
    await getUserDislikes(1, 1);
    expect(mockFrom).toHaveBeenCalledWith("proposal_dislikes");
  });

  it("should throw error when database fails", async () => {
    mockCount.mockResolvedValue({ count: null, error: new Error("DB error") });
    await expect(getUserDislikes(1, 1)).rejects.toThrow();
  });
});
