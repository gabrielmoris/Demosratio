import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Validate parameters
  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    return NextResponse.json({ error: "Invalid page or pageSize parameters" }, { status: 400 });
  }

  try {
    // Calculate pagination values
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query Supabase with pagination
    const {
      data: proposals,
      error,
      count,
    } = await supabaseAdmin
      .from("proposals")
      .select("*", { count: "exact" })
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      log.error("Supabase error:", error);
      return NextResponse.json({ error: "Error fetching proposals" }, { status: 500 });
    }

    for (const proposal of proposals) {
      const proposalLikesAndDislikes = await fetchAllLikesAndDislikes(proposal.id);
      proposal.likesAndDislikes = proposalLikesAndDislikes.result;
    }

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
    log.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
