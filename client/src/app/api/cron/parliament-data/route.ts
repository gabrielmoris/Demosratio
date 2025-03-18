// app/api/cron/parliament-data/route.ts
import { NextResponse } from "next/server";
import { Logger } from "tslog";

import { saveProposalToDb } from "@/lib/database/saveProposal";
import { extractParliamentJson } from "@/lib/functions/getParliamentData";
import { getDateString, getFormattedDateForDB } from "@/lib/helpers/dateFormatters";
import { mergeVotesByParty } from "@/lib/functions/votesPerParty";
import { createTables } from "@/lib/database/tables";
import { VotingData } from "@/types/proposal.types";

const log = new Logger();

// This is our main function that will be used by the Vercel cron job
export async function GET() {
  log.info("Running parliament data extractor...");

  try {
    await createTables();
    const yesterday = getDateString(1);

    await saveToDb(yesterday);

    log.info("Parliament data extraction completed successfully");
    return NextResponse.json({ success: true, message: "Parliament data extraction completed" });
  } catch (error) {
    log.error("Error in parliament data extraction:", error);
    return NextResponse.json({ success: false, message: "Parliament data extraction failed", error: String(error) }, { status: 500 });
  }
}

async function saveToDb(day: string) {
  const extractedParliamentData = await extractParliamentJson(day);

  for (const votation of extractedParliamentData) {
    // Get the important information
    const { sesion: session, fecha: date, titulo: title, textoExpediente: expedient_text } = votation.informacion;

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
