import { getPromiseAnalysisByPromise } from "@/lib/database/parties/promises/promises-analysis/getPromiseAnalysisByPromise";
import { getPromiseAnalysisByCampaign } from "@/lib/database/parties/promises/promises-analysis/gtPromiseAnalysisByCampaign";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const party_id = Number(searchParams.get("party_id"));
  const promise_id = Number(searchParams.get("promise_id"));
  const campaign_year = Number(searchParams.get("campaign_year"));

  if (!party_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    if (promise_id) {
      const analysis = await getPromiseAnalysisByPromise(party_id, promise_id);
      return NextResponse.json(analysis);
    }

    if (campaign_year) {
      const analysis = await getPromiseAnalysisByCampaign(party_id, campaign_year);
      return NextResponse.json(analysis);
    }
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting PRomises Readiness data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}
