import { getSubjectsWithStats } from "@/lib/database/parties/subjects/getSubjectsWithStats";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET() {
  try {
    const { subjects, error } = await getSubjectsWithStats();
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
