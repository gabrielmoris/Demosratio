import { describe, it, expect, vi } from "vitest";
import { Password } from "../../../helpers/users/password";

// Mock the crypto module - need to mock default export
vi.mock("crypto", async () => {
  const actual = await vi.importActual("crypto");
  return {
    ...actual,
    default: {
      ...actual,
      randomBytes: vi.fn(() => Buffer.from("mocked_salt_bytes")),
      scrypt: vi.fn((password: string, salt: string, bytes: number, callback: (err: Error | null, buffer: Buffer) => void) => {
        // Return a deterministic hash for testing
        const hash = Buffer.from(`hashed_${password}_${salt}`);
        callback(null, hash);
      }),
    },
    randomBytes: vi.fn(() => Buffer.from("mocked_salt_bytes")),
    scrypt: vi.fn((password: string, salt: string, bytes: number, callback: (err: Error | null, buffer: Buffer) => void) => {
      const hash = Buffer.from(`hashed_${password}_${salt}`);
      callback(null, hash);
    }),
  };
});

describe("Password", () => {
  describe("toHash", () => {
    it("should hash a password and return hash with salt", async () => {
      const hash = await Password.toHash("myPassword");

      // The format is "hash.salt" in hex
      expect(hash).toContain(".");
      const parts = hash.split(".");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeTruthy(); // hash
      expect(parts[1]).toBeTruthy(); // salt
    });

    it("should produce hash with salt appended", async () => {
      const hash = await Password.toHash("test");

      const parts = hash.split(".");
      // The hash part is based on password+salt, salt is the mocked 16 bytes
      expect(parts[0]).toContain("6861736865645f746573745f36643666363336623635363435663733363136633734356636323739373436353733");
      expect(parts[1]).toBe("6d6f636b65645f73616c745f6279746573");
    });
  });

  describe("compare", () => {
    it("should return true for matching password", async () => {
      const hash = await Password.toHash("myPassword");

      const result = await Password.compare(hash, "myPassword");
      expect(result).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hash = await Password.toHash("correctPassword");

      const result = await Password.compare(hash, "wrongPassword");
      expect(result).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const hash = await Password.toHash("");

      const result = await Password.compare(hash, "");
      expect(result).toBe(true);
    });

    it("should return false for completely different passwords", async () => {
      const hash = await Password.toHash("password123");

      const result = await Password.compare(hash, "password456");
      expect(result).toBe(false);
    });
  });
});
