import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByName } from "@/lib/database/users/users";
import { Password } from "@/lib/helpers/users/password";
import { createJWT } from "@/lib/helpers/users/jwt";
import { findFingerprint, saveFingerprint } from "@/lib/database/users/fingerprint";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, password, fingerprint } = body;

    // Validate input
    if (!name || name.length < 3) {
      return NextResponse.json({ error: "Name must be valid" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "You must apply a password" }, { status: 400 });
    }

    // Find user
    const existingUser = await findUserByName(name);
    if (!existingUser) {
      return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
    }

    // Check fingerprint
    const fingerprintFromUser = await findFingerprint(fingerprint);

    if (!fingerprintFromUser || fingerprintFromUser.user_id !== existingUser.id) {
      const existingFingerprint = await findFingerprint(fingerprint);

      if (existingFingerprint) {
        return NextResponse.json({ error: "Este dispositivo no está vinculado a tu usuario." }, { status: 401 });
      } else {
        // Save new fingerprint for this user
        const fingerprintToSave = {
          userId: existingUser.id,
          hash: fingerprint,
        };
        await saveFingerprint(fingerprintToSave);
      }
    }

    // Verify password
    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
    }

    // Generate JWT
    const userJwt = createJWT({
      id: existingUser.id,
      name: existingUser.name,
    });

    const cookieExpiryDate = new Date();
    cookieExpiryDate.setDate(cookieExpiryDate.getDate() + 30);

    (await cookies()).set("session", userJwt, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: cookieExpiryDate,
    });

    return NextResponse.json(existingUser, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid Credentials" }, { status: 500 });
  }
}
