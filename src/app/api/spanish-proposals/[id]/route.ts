/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest, { params }: { params: any }) {
  const readyParams = await params;
  const id = readyParams.id;

  if (!id) {
    return NextResponse.json({ error: "Proposal ID is required." }, { status: 400 });
  }

  try {
    const { data: proposal, error } = await supabaseAdmin.from("proposals").select("*").eq("id", parseInt(id)).single();

    if (error) {
      log.error("Supabase error:", error);
      return NextResponse.json({ error: "Error fetching proposal" }, { status: 500 });
    }

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    if (proposal && proposal.votes_parties_json && proposal.votes_parties_json.votes) {
      proposal.votes_parties_json = proposal.votes_parties_json.votes;
    }

    return NextResponse.json(proposal, { status: 200 });
  } catch (error) {
    log.error("Error fetching proposal:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
