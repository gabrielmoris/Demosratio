import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { fetchAllsubjects } from "@/lib/database/parties/subjects/getAllSubjects";

const mockSubjects = [
  { id: 1, name: "Economía", description: "Policies related to economy" },
  { id: 2, name: "Salud", description: "Policies related to health" },
  { id: 3, name: "Educación", description: "Policies related to education" },
];

// vi.hoisted create mocks that can be referenced in vi.mock
const { mockSelect, mockFrom } = vi.hoisted(() => {
  const mockSelect: Mock<
    () => Promise<{
      data:
        | {
            id: number;
            name: string;
            description: string;
          }[]
        | null;
      error: null | Error;
    }>
  > = vi.fn(() => Promise.resolve({ data: mockSubjects, error: null }));
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

describe("fetchAllsubjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockResolvedValue({ data: mockSubjects, error: null });
  });

  it("should return subjects when fetch is successful", async () => {
    const result = await fetchAllsubjects();

    expect(result).toHaveProperty("subjects");
    expect(result.subjects).toEqual(mockSubjects);
  });

  it("should call supabaseAdmin.from with 'subjects'", async () => {
    await fetchAllsubjects();

    expect(mockFrom).toHaveBeenCalledWith("subjects");
  });

  it("should handle errors when fetch fails", async () => {
    mockSelect.mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    const result = await fetchAllsubjects();

    expect(result).toHaveProperty("error");
  });
});
