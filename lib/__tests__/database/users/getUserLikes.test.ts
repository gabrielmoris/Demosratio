import { getUserLikes } from "@/lib/database/likes/user/getUserLikes";
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

describe("getUserLikes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return count of likes", async () => {
    const result = await getUserLikes(1, 1);
    expect(result).toBe(5);
  });

  it("should call supabaseAdmin.from with 'proposal_likes'", async () => {
    await getUserLikes(1, 1);
    expect(mockFrom).toHaveBeenCalledWith("proposal_likes");
  });

  it("should throw error when database fails", async () => {
    mockCount.mockResolvedValue({ count: null, error: new Error("DB error") });
    await expect(getUserLikes(1, 1)).rejects.toThrow();
  });
});
