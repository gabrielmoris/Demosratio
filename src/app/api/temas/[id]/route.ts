import { getSubjectDeepDive } from "@/lib/database/parties/subjects/getSubjectDeepDive";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET(_req: NextRequest, { params }: { params: any }) {
  const readyParams = await params;
  const subjectId = parseInt(readyParams.id, 10);

  if (isNaN(subjectId)) {
    return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
  }

  try {
    const { data, error } = await getSubjectDeepDive(subjectId);
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    log.error("Error fetching subject deep dive:", error);
    return NextResponse.json(
      { success: false, message: "Getting tema deep dive failed" },
      { status: 500 }
    );
  }
}
