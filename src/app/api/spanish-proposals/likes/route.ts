/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
// import { Logger } from "tslog";

// const log = new Logger();

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: `It works fine`,
  });
}
