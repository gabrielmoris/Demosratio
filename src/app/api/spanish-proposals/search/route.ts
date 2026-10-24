import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";
import { getAllProposalsByExpedient } from "@/lib/database/spanishParliament/getAllProposalsByExpedient";
import { resolveLegislaturaId } from "@/lib/database/legislaturas/getLegislaturas";

const log = new Logger();

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
    const legislaturaId = await resolveLegislaturaId(request);
    const { count, proposals } = await getAllProposalsByExpedient(
      expedient_text,
      page,
      pageSize,
      legislaturaId
    );

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
    log.error("Error searching proposals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
