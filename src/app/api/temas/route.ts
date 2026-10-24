import { getSubjectsWithStats } from "@/lib/database/parties/subjects/getSubjectsWithStats";
import { NextRequest, NextResponse } from "next/server";
import { resolveLegislaturaId } from "@/lib/database/legislaturas/getLegislaturas";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(request: NextRequest) {
  try {
    const { subjects, error } = await getSubjectsWithStats(await resolveLegislaturaId(request));
    if (error) throw error;
    return NextResponse.json({ subjects });
  } catch (error) {
    log.error("Error fetching subjects with stats:", error);
    return NextResponse.json(
      { success: false, message: "Getting temas data failed" },
      { status: 500 }
    );
  }
}
