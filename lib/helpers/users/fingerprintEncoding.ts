import { Fingerprint } from "@/types/fingerprint";
import crypto from "crypto";
import { Logger } from "tslog";

const log = new Logger();

export async function encodeFingerprint(fingerprintData: Fingerprint): Promise<string> {
  try {
    const response = await fetch("/api/fingerprint/encoder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fingerprintData }),
    });

    if (!response.ok) {
      throw new Error("Failed to encode fingerprint");
    }

    const data = await response.json();

    return data.fingerprint;
  } catch (error) {
    log.error("Error encoding fingerprint:", error);
    throw error;
  }
}

export async function decodeFingerprint(encodedFingerprint: string) {
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error("No ENCRYPTION_KEY in .env");

    const textParts = encodedFingerprint.split(":");
    if (!textParts || textParts.length !== 2) throw new Error("Invalid encoded fingerprint format");

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts[1], "base64"); // Decode from base64

    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv);
    let decrypted = decipher.update(encryptedText); // Remove utf8 encoding from update.
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString("utf8")); // Decode the buffer to utf8 string.
  } catch (error) {
    log.error("Error decoding fingerprint:", error);
    throw new Error("Error decoding: " + error);
  }
}
