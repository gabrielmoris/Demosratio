import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";
import crypto from "crypto";

const log = new Logger();
const algorithm = "aes-256-cbc";

export async function POST(req: NextRequest) {
  try {
    const fingerprint = await req.json();
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error("No ENCRYPTION_KEY in .env");

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv);

    let encrypted = cipher.update(JSON.stringify(fingerprint), "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encodedFingerprint = iv.toString("hex") + ":" + encrypted.toString("base64");

    return NextResponse.json({
      fingerprint: encodedFingerprint,
    });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Encoding data failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
