import { describe, it, expect } from "vitest";
import { getDateString, normalizeWrongSpanishDate, getFormattedDateForDB, formatDate } from "@/lib/helpers/dateFormatters";

describe("dateFormatters", () => {
  describe("getDateString", () => {
    it("should return today's date in DD/MM/YYYY format", () => {
      const result = getDateString(0);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("should return date with days offset", () => {
      const result = getDateString(7);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe("normalizeWrongSpanishDate", () => {
    it("should convert DD/MM/YYYY to proper format", () => {
      const result = normalizeWrongSpanishDate("01/01/2024");
      expect(result).toBe("01/01/2024");
    });

    it("should handle two-digit year", () => {
      const result = normalizeWrongSpanishDate("31/12/99");
      expect(result).toBe("31/12/99");
    });

    it("should return original string for invalid date", () => {
      const result = normalizeWrongSpanishDate("invalid-date");
      expect(result).toBe("invalid-date");
    });

    it("should handle empty string", () => {
      const result = normalizeWrongSpanishDate("");
      expect(result).toBe("");
    });
  });

  describe("getFormattedDateForDB", () => {
    it("should convert DD/MM/YYYY to YYYY-MM-DD", () => {
      const result = getFormattedDateForDB("01/01/2024");
      expect(result).toBe("2024-01-01");
    });

    it("should handle end of year dates", () => {
      const result = getFormattedDateForDB("31/12/2024");
      expect(result).toBe("2024-12-31");
    });
  });

  describe("formatDate", () => {
    it("should format date in Spanish locale by default", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("enero");
      expect(result).toContain("2024");
    });

    it("should format date in English locale", () => {
      const result = formatDate("2024-01-15", "en-US");
      expect(result).toContain("January");
      expect(result).toContain("2024");
    });
  });
});
