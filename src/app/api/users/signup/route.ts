import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deleteUser,
  findFingerprint,
  findUserByName,
  saveFingerprint,
  saveUser,
} from "@/lib/database/users/users";
import { Password } from "@/lib/helpers/users/password";
import { createJWT } from "@/lib/helpers/users/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, password, fingerprint } = body;

    // Validate input
    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: "Name must be valid" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4 || password.length > 20) {
      return NextResponse.json(
        { error: "Password must be between 4 and 20 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await findUserByName(name);
    if (existingUser) {
      return NextResponse.json(
        { error: "No ha sido posible registrarse." },
        { status: 401 }
      );
    }

    // Check if fingerprint exists
    const existingFingerprint = await findFingerprint(fingerprint);
    if (existingFingerprint) {
      await deleteUser(name);
      return NextResponse.json(
        { error: "Este dispositivo ya está vinculado en otro usuario." },
        { status: 401 }
      );
    }

    // Hash password and save user
    const hashedPassword = await Password.toHash(password);
    const userToSave = {
      name,
      password: hashedPassword,
    };

    try {
      const user = await saveUser(userToSave);
      if (!user) {
        return NextResponse.json(
          { error: "No ha sido posible registrarse." },
          { status: 500 }
        );
      }

      // Save fingerprint
      const fingerprintToSave = {
        userId: user.id,
        hash: fingerprint,
      };
      await saveFingerprint(fingerprintToSave);

      // Generate JWT
      const userJwt = createJWT({
        id: user.id,
        name: user.name,
      });

      // Set cookie
      (await cookies()).set("session", userJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        path: "/",
      });

      return NextResponse.json(user, { status: 201 });
    } catch {
      await deleteUser(name);
      return NextResponse.json(
        { error: "No ha sido posible registrarse." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "No ha sido posible registrarse." },
      { status: 500 }
    );
  }
}
