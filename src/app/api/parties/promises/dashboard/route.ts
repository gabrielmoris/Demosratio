import { getDashboardStats } from "@/lib/database/parties/promises/getDashboardStats";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get("party_id");

    if (!partyId) {
      return NextResponse.json({ error: "party_id is required" }, { status: 400 });
    }

    const stats = await getDashboardStats(Number(partyId));
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
