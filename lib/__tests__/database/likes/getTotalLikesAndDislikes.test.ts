import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";

// Mock the likesCount and dislikesCount functions
vi.mock("@/lib/database/likes/likesCount", () => ({
  getLikesCount: vi.fn(),
}));

vi.mock("@/lib/database/likes/dislikesCount", () => ({
  getDislikesCount: vi.fn(),
}));

// Mock logger
vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
  },
}));

import { getLikesCount } from "@/lib/database/likes/likesCount";
import { getDislikesCount } from "@/lib/database/likes/dislikesCount";

describe("fetchAllLikesAndDislikes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLikesCount).mockResolvedValue(10);
    vi.mocked(getDislikesCount).mockResolvedValue(5);
  });

  it("should return likes and dislikes when fetch is successful", async () => {
    const result = await fetchAllLikesAndDislikes(1);

    expect(result).toHaveProperty("result");
    expect(result.result).toEqual({
      likes: 10,
      dislikes: 5,
      proposal_id: 1,
    });
  });

  it("should call getLikesCount with the proposal id", async () => {
    await fetchAllLikesAndDislikes(42);

    expect(getLikesCount).toHaveBeenCalledWith(42);
  });

  it("should call getDislikesCount with the proposal id", async () => {
    await fetchAllLikesAndDislikes(42);

    expect(getDislikesCount).toHaveBeenCalledWith(42);
  });

  it("should handle null counts as zero", async () => {
    vi.mocked(getLikesCount).mockResolvedValue(null);
    vi.mocked(getDislikesCount).mockResolvedValue(null);

    const result = await fetchAllLikesAndDislikes(1);

    expect(result.result?.likes).toBe(0);
    expect(result.result?.dislikes).toBe(0);
  });

  it("should return error when getLikesCount fails", async () => {
    vi.mocked(getLikesCount).mockRejectedValue(new Error("Likes error"));

    const result = await fetchAllLikesAndDislikes(1);

    expect(result).toHaveProperty("error");
  });

  it("should return error when getDislikesCount fails", async () => {
    vi.mocked(getDislikesCount).mockRejectedValue(new Error("Dislikes error"));

    const result = await fetchAllLikesAndDislikes(1);

    expect(result).toHaveProperty("error");
  });
});
