import { deleteSubject } from "@/lib/database/parties/subjects/deleteSubject";
import { fetchAllsubjects } from "@/lib/database/parties/subjects/getAllSubjects";
import { saveSubject } from "@/lib/database/parties/subjects/saveSubject";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function GET() {
  try {
    const { subjects } = await fetchAllsubjects();

    return NextResponse.json(subjects);
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Getting Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();

  if (!name || !description) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await saveSubject(name, description);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { subject_id } = await req.json();

  if (!subject_id) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const { id } = await deleteSubject(subject_id);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    log.error("Error encoding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Saving Parties data failed",
        error: String(error),
      },
      { status: 200 }
    );
  }
}
