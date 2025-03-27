import { deleteParty } from "@/lib/database/parties/deleteParty";
import { fetchAllParties } from "@/lib/database/parties/getAllParties";
import { saveParty } from "@/lib/database/parties/saveParty";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET() {
  try {
    const { parties } = await fetchAllParties();

    return NextResponse.json({ parties });
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
  const { name, logo_url } = await req.json();

  if (!name || !logo_url) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await saveParty(name, logo_url);
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
  const { party_id } = await req.json();

  if (!party_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await deleteParty(party_id);

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
