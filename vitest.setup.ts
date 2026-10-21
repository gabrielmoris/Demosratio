import "@testing-library/jest-dom/vitest";

// Gemini calls are spaced 12s apart in production (free-tier limit). Tests don't wait;
// geminiRequest.test.ts sets its own interval to test the spacing.
process.env.GEMINI_MIN_INTERVAL_MS = "0";
