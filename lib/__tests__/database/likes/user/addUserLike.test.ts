import { addUserLike } from "@/lib/database/likes/user/addUserLike";
import { describe, vi, beforeEach, Mock, it, expect } from "vitest";

const { mockInsert, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSingle: Mock<
    () => Promise<{
      data: { id: number } | null;
      error: null | Error;
    }>
  > = vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }));

  // .select() returns { single: mockSingle }
  const mockSelect = vi.fn(() => ({ single: mockSingle }));

  // .insert() returns { select: mockSelect }
  const mockInsert = vi.fn(() => ({ select: mockSelect }));

  // .from() returns { insert: mockInsert }
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));

  return { mockInsert, mockSelect, mockSingle, mockFrom };
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

describe("addUserLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not throw when insert succeeds", async () => {
    await expect(addUserLike(1, 1)).resolves.not.toThrow();
  });

  it("should call supabaseAdmin.from with 'proposal_likes'", async () => {
    await addUserLike(1, 1);

    expect(mockFrom).toHaveBeenCalledWith("proposal_likes");
  });

  it("should insert correct user_id and proposal_id", async () => {
    await addUserLike(42, 99);

    expect(mockInsert).toHaveBeenCalledWith([{ user_id: 99, proposal_id: 42 }]);
  });

  it("should throw error when database fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    await expect(addUserLike(1, 1)).rejects.toThrow("Error adding likes");
  });
});
