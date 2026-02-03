import { getAllPromiseAnalysesByParty } from "@/lib/database/parties/promises/promises-analysis/getAllPromiseAnalysesByParty";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const partyId = Number(searchParams.get("party_id"));

  if (!partyId) {
    return NextResponse.json({ error: "party_id is required" }, { status: 400 });
  }

  try {
    const { analysis, error } = await getAllPromiseAnalysesByParty(partyId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ analysis: analysis || [] });
  } catch (error) {
    log.error("Error getting all promise analyses by party:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting all promise analyses by party failed",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
