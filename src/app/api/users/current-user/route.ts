// src/app/api/users/current-user/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/helpers/users/jwt";

export async function GET() {
  try {
    const session = (await cookies()).get("session");

    if (!session?.value) {
      return NextResponse.json({ currentUser: null }, { status: 200 });
    }

    const currentUser = verifyJWT(session.value);

    return NextResponse.json(
      { currentUser: currentUser || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json({ currentUser: null }, { status: 200 });
  }
}
