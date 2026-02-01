import { getAllPromiseAnalysesByPromise } from "@/lib/database/parties/promises/promises-analysis/getAllPromiseAnalysesByPromise";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const party_id = Number(searchParams.get("party_id"));
  const promise_id = Number(searchParams.get("promise_id"));

  if (!party_id || !promise_id) {
    return NextResponse.json({ error: "Bad Request: party_id and promise_id are required" }, { status: 400 });
  }

  try {
    const analysis = await getAllPromiseAnalysesByPromise(party_id, promise_id);
    return NextResponse.json(analysis);
  } catch (error) {
    log.error("Error getting all promise analyses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting all promise analyses failed",
        error: String(error),
      },
      { status: 200 },
    );
  }
}
