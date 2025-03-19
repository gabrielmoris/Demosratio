// src/app/api/users/delete-user/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { deleteUser } from "@/lib/database/users/users";

export async function GET() {
  try {
    const session = (await cookies()).get("session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "No ha sido posible borrar el usuario." },
        { status: 401 }
      );
    }

    const currentUser = verifyJWT(session.value);

    if (!currentUser) {
      return NextResponse.json(
        { error: "No ha sido posible borrar el usuario." },
        { status: 401 }
      );
    }

    await deleteUser(currentUser.name);

    // Clear session
    (await cookies()).delete("session");

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "No ha sido posible borrar el usuario." },
      { status: 500 }
    );
  }
}
