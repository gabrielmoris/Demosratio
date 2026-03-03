import { describe, it, expect, vi, beforeEach } from "vitest";
import { findUserByName } from "@/lib/database/users/users";

// Custom error type with code property (like Supabase errors)
class NotFoundError extends Error {
  code: string;

  constructor(message: string, code: string = "PGRST116") {
    super(message);
    this.name = "NotFoundError";
    this.code = code;
  }
}

// vi.hoisted mocks - simple mock for findUserByName only
const { mockFrom, mockSingle } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSingle = vi.fn<() => Promise<{ data: any; error: Error | null }>>();

  // Chain: from("users").select("*").eq("name", "user").single()
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }));

  // Main from() mock
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
  }));

  return { mockFrom, mockSingle };
});

// Mock the supabase client
vi.mock("@/lib/supabaseClient", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

// Mock the logger
vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
    warn = vi.fn();
    info = vi.fn();
  },
}));

import { supabaseAdmin } from "@/lib/supabaseClient";

describe("users database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findUserByName", () => {
    it("should return user when found", async () => {
      const mockUser = { id: "1", name: "testuser" };
      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await findUserByName("testuser");

      expect(result).toEqual(mockUser);
      expect(supabaseAdmin.from).toHaveBeenCalledWith("users");
    });

    it("should return null when user not found (PGRST116)", async () => {
      const notFoundError = new NotFoundError("Not found", "PGRST116");
      mockSingle.mockResolvedValue({ data: null, error: notFoundError });

      const result = await findUserByName("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null on other errors", async () => {
      const serverError = new Error("Server error");
      mockSingle.mockResolvedValue({ data: null, error: serverError });

      const result = await findUserByName("testuser");

      expect(result).toBeNull();
    });
  });
});
