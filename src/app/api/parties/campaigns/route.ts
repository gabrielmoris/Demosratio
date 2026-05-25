import { deleteCampaign } from "@/lib/database/parties/campaigns/deleteCampaign";
import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { fetchCampaign } from "@/lib/database/parties/campaigns/getCampaign";
import { saveCampaign } from "@/lib/database/parties/campaigns/saveCampaign";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/src/middleware/isAuthorized";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const party_id = Number(searchParams.get("party_id"));

 if (party_id && !isNaN(party_id)) {
 const { campaignsOfParty } = await fetchCampaign(party_id);
 return NextResponse.json(campaignsOfParty);
 } else {
 const { campaigns } = await fetchAllCampaigns();
 return NextResponse.json(campaigns);
 }
 } catch (error) {
 log.error("Error fetching campaigns:", error);
 return NextResponse.json(
 { success: false, message: "Getting Campaign data failed" },
 { status: 500 }
 );
 }
}

export async function POST(req: NextRequest) {
 if (!(await isAuthorized(req))) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 const { year, party_id, campaign_pdf_url } = await req.json();

 if (!year || !party_id || !campaign_pdf_url) {
 return NextResponse.json({ error: "Bad Request" }, { status: 400 });
 }

 try {
 const { id } = await saveCampaign(year, party_id, campaign_pdf_url);
 return NextResponse.json({ id }, { status: 201 });
 } catch (error) {
 log.error("Error saving campaign:", error);
 return NextResponse.json(
 { success: false, message: "Saving Campaign data failed" },
 { status: 500 }
 );
 }
}

export async function DELETE(req: NextRequest) {
 if (!(await isAuthorized(req))) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 const { campaign_id } = await req.json();

 if (!campaign_id) {
 return NextResponse.json({ error: "Bad Request" }, { status: 400 });
 }

 try {
 const { id } = await deleteCampaign(campaign_id);
 return NextResponse.json({ id }, { status: 200 });
 } catch (error) {
 log.error("Error deleting campaign:", error);
 return NextResponse.json(
 { success: false, message: "Deleting Campaign data failed" },
 { status: 500 }
 );
 }
}
