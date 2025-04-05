import { getPromisesReadiness } from "@/lib/database/parties/promises/promise-readiness/getPromisesReadiness";
import { getuserPromisesReadiness } from "@/lib/database/parties/promises/promise-readiness/getUSerPromisesReadiness";
import { setPromisesReadiness } from "@/lib/database/parties/promises/promise-readiness/setPromisesReadiness";
import { updatePromisesReadiness } from "@/lib/database/parties/promises/promise-readiness/updatePromisesReadiness";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaign_id = Number(searchParams.get("campaign_id"));

  if (!campaign_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const readiness = await getPromisesReadiness(campaign_id);
    return NextResponse.json(readiness);
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

export async function POST(req: NextRequest) {
  const { readiness_score, user_id, campaign_id } = await req.json();

  if (!readiness_score || !user_id || !campaign_id || !campaign_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    // Check if user already liked it
    const { readiness } = await getuserPromisesReadiness(campaign_id, user_id);

    if (readiness?.id) {
      const id = await updatePromisesReadiness(
        campaign_id,
        user_id,
        parseFloat(readiness_score)
      );
      return NextResponse.json(id, { status: 201 });
    }

    const id = await setPromisesReadiness(
      campaign_id,
      user_id,
      parseFloat(readiness_score)
    );

    return NextResponse.json(id, { status: 201 });
  } catch (error) {
    log.error("Error saving readiness data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving readiness data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}
