import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";
import { getAllProposals } from "@/lib/database/spanishParliament/getAllProposals";

const log = new Logger();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Validate parameters
    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: "Invalid page or pageSize parameters" },
        { status: 400 }
      );
    }

    const { proposals, count } = await getAllProposals(page, pageSize);

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
