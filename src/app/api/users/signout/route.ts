// src/app/api/users/signout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("session");

  return NextResponse.json({}, { status: 200 });
}
