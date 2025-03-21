// src/app/api/users/current-user/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { findUserByName } from "@/lib/database/users/users";

export async function GET() {
  try {
    const session = (await cookies()).get("session");

    if (!session?.value) {
      return NextResponse.json({ currentUser: null }, { status: 200 });
    }

    const currentUser = verifyJWT(session.value);

    if (!currentUser) throw new Error("No user from JWT");

    const user = await findUserByName(currentUser.name);

    if (!user) throw new Error("No user in DB");

    currentUser.is_admin = user.is_admin;

    return NextResponse.json(
      { currentUser: currentUser || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json({ currentUser: null }, { status: 200 });
  }
}
