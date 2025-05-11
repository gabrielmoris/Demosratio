import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { fetchAllParties } from "@/lib/database/parties/getAllParties";
import { analyzePromisesWithGemini } from "@/lib/services/geminiClient";
import { Party } from "@/types/politicalParties";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

// This is our main function that will be used by the Vercel cron job
export async function GET() {
  log.info("Running ai analysis...");

  try {
    const result = await fetchAllParties();
    if (!result.parties) throw new Error("Error fetching parties");
    const parties: Party[] = result.parties;
    const { campaigns } = await fetchAllCampaigns();
    if (!campaigns || !parties) throw new Error("Error fetching campaigns");

    let latestcampaign = 2018;

    campaigns.forEach((campaign) => {
      if (campaign.year > latestcampaign) latestcampaign = campaign.year;
    });

    const mappedCampaigns = campaigns.filter((campaign) => campaign.year === latestcampaign);

    parties.forEach((party) => {
      for (const campaign of mappedCampaigns) {
        if (party.id == campaign.party_id) {
          party.campaign_year = campaign.year;
          party.campaign_pdf_url = campaign.campaign_pdf_url;
          delete party.logo_url;
          delete party.created_at;
        }
      }
    });

    const analysis = await analyzePromisesWithGemini(parties);

    return NextResponse.json({
      analysis,
      success: true,
      message: "Parliament data extraction completed",
    });
  } catch (error) {
    log.error("Error in parliament data extraction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Parliament data extraction failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
