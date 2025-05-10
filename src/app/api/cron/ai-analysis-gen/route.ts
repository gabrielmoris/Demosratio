import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { fetchAllParties } from "@/lib/database/parties/getAllParties";
import { analyzePromisesWithGemini } from "@/lib/services/geminiClient";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

// This is our main function that will be used by the Vercel cron job
export async function GET() {
  log.info("Running ai analysis...");

  try {
    const { parties } = await fetchAllParties();
    const { campaigns } = await fetchAllCampaigns();
    if (!campaigns) throw new Error("Error fetching campaigns");

    let latestcampaign = 2018;

    campaigns.forEach((campaign) => {
      if (campaign.year > latestcampaign) latestcampaign = campaign.year;
    });

    const mappedCampaigns = campaigns.filter((campaign) => campaign.year === latestcampaign);

    const infoToCheck = { parties, campaigns: mappedCampaigns };

    const analysis = await analyzePromisesWithGemini(infoToCheck);

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
