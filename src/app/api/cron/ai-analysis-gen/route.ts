import { analyzePromisesWithGemini } from "@/lib/services/geminiClient";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

// This is our main function that will be used by the Vercel cron job
export async function GET() {
  log.info("Running ai analysis...");

  try {
    const analysis = await analyzePromisesWithGemini();

    return NextResponse.json({
      analysis,
      success: true,
      message: "Parliament data extraction completed",
    });
  } catch (error) {
    log.error("Error in parliament data extraction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Parliament data extraction failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
