import { deletePromise } from "@/lib/database/parties/promises/deletePromise";
import { fetchPartyPromises } from "@/lib/database/parties/promises/getPartyPromises";
import { savePartyPromise } from "@/lib/database/parties/promises/savePartyPromise";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url); // Extract search params
    const party_id = Number(searchParams.get("party_id"));
    const campaign_id = Number(searchParams.get("campaign_id"));

    if (!party_id || !campaign_id || isNaN(campaign_id) || isNaN(party_id))
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });

    const { promises } = await fetchPartyPromises(party_id, campaign_id);

    return NextResponse.json(promises);
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { promise, subject_id, campaign_id, party_id } = await req.json();

  if (!promise || !subject_id || !campaign_id || !party_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await savePartyPromise(
      party_id,
      campaign_id,
      subject_id,
      promise
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { promise_id } = await req.json();

  if (!promise_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await deletePromise(promise_id);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}
