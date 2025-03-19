// app/api/import-historical/route.ts
import { NextResponse } from "next/server";
import { Logger } from "tslog";
import { getDateString } from "@/lib/helpers/dateFormatters";
import { extractParliamentJson } from "@/lib/functions/getParliamentData";
import { mergeVotesByParty } from "@/lib/functions/votesPerParty";
import { saveProposalToDb } from "@/lib/database/saveProposal";
import { VotingData } from "@/types/proposal.types";
import { getFormattedDateForDB } from "@/lib/helpers/dateFormatters";

const log = new Logger();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");

    // Default to 7 days or use environment variable
    const daysToCheck = daysParam
      ? parseInt(daysParam, 10)
      : parseInt(process.env.DAYS_TO_CHECK_VOTATIONS || "7", 10);

    log.info(
      `Starting historical data import for the last ${daysToCheck} days...`
    );

    // Process historical data
    for (let i = daysToCheck; i > 0; i--) {
      const dateToCheck = getDateString(i);
      log.info(`Processing data for ${dateToCheck}...`);

      try {
        await saveToDb(dateToCheck);
        log.info(`Successfully processed data for ${dateToCheck}`);
      } catch (error) {
        log.error(`Error processing data for ${dateToCheck}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Historical data import completed for the last ${daysToCheck} days`,
    });
  } catch (error) {
    log.error("Error in historical data import:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Historical data import failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

async function saveToDb(day: string) {
  const extractedParliamentData = await extractParliamentJson(day);

  for (const votation of extractedParliamentData) {
    // Get the important information
    const {
      sesion: session,
      fecha: date,
      titulo: title,
      textoExpediente: expedient_text,
    } = votation.informacion;

    const {
      presentes: parliament_presence,
      afavor: votes_for,
      enContra: votes_against,
      abstenciones: abstentions,
      noVotan: no_vote,
      asentimiento: assent,
    } = votation.totales;

    const votes_parties_json = mergeVotesByParty(votation.votaciones);
    const isAccepted = assent === "Sí" ? true : false;

    const proposalData: VotingData = {
      session,
      date: getFormattedDateForDB(date),
      title,
      url: `https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=XV&targetDate=${day}`,
      expedient_text,
      parliament_presence,
      votes_for,
      votes_against,
      abstentions,
      no_vote,
      votes_parties_json,
      assent: isAccepted,
    };

    // Then save it in DB
    try {
      await saveProposalToDb(proposalData);
    } catch (error) {
      log.error(`Failed to save proposal "${title}":`, error);
    }
  }
}
