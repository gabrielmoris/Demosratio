import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const expedient_text = searchParams.get("expedient_text");

  if (
    isNaN(page) ||
    isNaN(pageSize) ||
    page < 1 ||
    pageSize < 1 ||
    !expedient_text
  ) {
    return NextResponse.json(
      { error: "Invalid parameters or missing expedient_text" },
      { status: 400 }
    );
  }

  try {
    // Calculate pagination values
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query Supabase for proposals matching the expedient text
    const {
      data: proposals,
      error,
      count,
    } = await supabaseAdmin
      .from("proposals")
      .select("*", { count: "exact" })
      .ilike("expedient_text", `%${expedient_text}%`)
      .range(from, to);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Error searching proposals" },
        { status: 500 }
      );
    }

    for (const proposal of proposals) {
      const proposalLikesAndDislikes = await fetchAllLikesAndDislikes(
        proposal.id
      );
      proposal.likesAndDislikes = proposalLikesAndDislikes.result;
    }

    // Return proposals with pagination metadata
    return NextResponse.json(
      {
        proposals,
        pagination: {
          page,
          pageSize,
          totalCount: count,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error searching proposals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
