/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/spanish-proposals/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: NextRequest, { params }: any) {
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { error: "Proposal ID is required." },
      { status: 400 }
    );
  }

  try {
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", parseInt(id))
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Error fetching proposal" },
        { status: 500 }
      );
    }

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found." },
        { status: 404 }
      );
    }

    proposal.votes_parties_json = proposal.votes_parties_json.votes;

    return NextResponse.json(proposal, { status: 200 });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
