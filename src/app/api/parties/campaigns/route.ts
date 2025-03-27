import { deleteCampaign } from "@/lib/database/parties/campaigns/deleteCampaign";
import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { saveCampaign } from "@/lib/database/parties/campaigns/saveCampaign";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET() {
  try {
    const { campaigns } = await fetchAllCampaigns();

    return NextResponse.json({ campaigns });
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
  const { year, party_name, campaign_pdf_url } = await req.json();

  if (!year || !party_name || !campaign_pdf_url) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await saveCampaign(year, party_name, campaign_pdf_url);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving Campaign data failed",
        error: error,
      },
      { status: 200 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { party_name, year } = await req.json();

  if (!party_name || !year) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await deleteCampaign(party_name, year);

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
