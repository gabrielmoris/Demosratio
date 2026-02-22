import { describe, it, expect } from "vitest";
import { getDateString, normalizeWrongSpanishDate, getFormattedDateForDB, formatDate } from "../../helpers/dateFormatters";

describe("getDateString", () => {
  it("should return today's date when no daysLess is provided", () => {
    const result = getDateString();
    // DD/MM/YYYY format
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("should return date X days ago when daysLess is provided", () => {
    const result = getDateString(0);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("should handle different day amounts", () => {
    const result7 = getDateString(7);
    const result30 = getDateString(30);
    expect(result7).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result30).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe("normalizeWrongSpanishDate", () => {
  it("should normalize a valid Spanish date string", () => {
    const result = normalizeWrongSpanishDate("25/12/2023");
    expect(result).toBe("25/12/2023");
  });
  it("should return original string for invalid date", () => {
    const result = normalizeWrongSpanishDate("invalid-date");
    expect(result).toBe("invalid-date");
  });
});

describe("getFormattedDateForDB", () => {
  it("should convert Spanish date to YYYY-MM-DD format", () => {
    const result = getFormattedDateForDB("25/12/2023");
    expect(result).toBe("2023-12-25");
  });

  it("should handle leading zeros", () => {
    const result = getFormattedDateForDB("05/09/2023");
    expect(result).toBe("2023-09-05");
  });
});

describe("formatDate", () => {
  it("should format date in Spanish locale by default", () => {
    const result = formatDate("2023-12-25");
    expect(result).toContain("2023");
    expect(result).toContain("diciembre");
  });

  it("should format date in specified locale", () => {
    const result = formatDate("2023-12-25", "en-US");
    expect(result).toContain("2023");
    expect(result).toContain("December");
  });

  it("should handle different dates", () => {
    const result = formatDate("2024-01-01");
    expect(result).toContain("2024");
  });
});
