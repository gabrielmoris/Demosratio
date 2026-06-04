import { NextRequest, NextResponse } from "next/server";
import { getProposalSummary } from "@/lib/database/spanishParliament/proposalSummaries/getProposalSummary";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { id } = await params;
 const proposalId = Number(id);

 if (!proposalId || isNaN(proposalId)) {
 return NextResponse.json({ error: "Invalid proposal ID" }, { status: 400 });
 }

 try {
 const { summary } = await getProposalSummary(proposalId);

 if (!summary) {
 return NextResponse.json({ summary: null }, { status: 200 });
 }

 return NextResponse.json({ summary }, { status: 200 });
 } catch (error) {
 log.error("Error fetching proposal summary:", error);
 return NextResponse.json(
 { error: "Failed to fetch proposal summary" },
 { status: 500 }
 );
 }
}
