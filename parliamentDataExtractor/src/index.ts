import verifyConnections, { writePool } from "./database/db";
import { createTables } from "./database/tables";
import { Logger } from "tslog";
import { mergeVotesByParty } from "./functions/votesPerParty";
import { saveProposalToDb } from "./database/saveProposal";
import { extractParliamentJson } from "./functions/getParliamentData";
import { getDateString, normalizeWrongSpanishDate } from "./helpers/getSpanishDate";

const log = new Logger();

// DB INIT

async function initializeDatabase() {
  try {
    await verifyConnections();
    await createTables();
    log.info("Database initialization complete.");
  } catch (error) {
    log.error("Database initialization failed:", error);
  }
}

const yesterday = getDateString(1);

const saveToDb = async () => {
  await initializeDatabase();
  const extractedParliamentData = await extractParliamentJson(yesterday);

  for (const votation of extractedParliamentData) {
    // Get the important information
    const { sesion: session, fecha: date, titulo: title, textoExpediente: expedient_text } = votation.informacion;
    const { presentes: parliament_presence, afavor: votes_for, enContra: votes_against, abstenciones: abstentions } = votation.totales;
    const votes_parties_json = mergeVotesByParty(votation.votaciones);

    const proposalData = {
      session,
      date: normalizeWrongSpanishDate(date),
      title,
      expedient_text,
      parliament_presence,
      votes_for,
      votes_against,
      abstentions,
      votes_parties_json,
      likes: 0,
      dislikes: 0,
    };

    // Then save it in DB
    try {
      await saveProposalToDb(writePool, proposalData);
    } catch (error) {
      log.error(`Failed to save proposal "${title}":`, error);
    }
  }
};

saveToDb();
