import { deleteCampaign } from "@/lib/database/parties/campaigns/deleteCampaign";
import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { fetchCampaign } from "@/lib/database/parties/campaigns/getCampaign";
import { saveCampaign } from "@/lib/database/parties/campaigns/saveCampaign";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const party_id = Number(searchParams.get("party_id"));

    if (party_id && !isNaN(party_id)) {
      const { campaign } = await fetchCampaign(party_id);
      return NextResponse.json({ campaign });
    } else {
      const { campaigns } = await fetchAllCampaigns();
      return NextResponse.json({ campaigns });
    }
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
  const { party_id, year } = await req.json();

  if (!party_id || !year) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await deleteCampaign(party_id, year);

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
