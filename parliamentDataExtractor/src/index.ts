import { writePool } from "./database/db";
import { createTables } from "./database/tables";
import { Logger } from "tslog";
import { mergeVotesByParty } from "./functions/votesPerParty";
import { saveProposalToDb } from "./database/saveProposal";
import { extractParliamentJson } from "./functions/getParliamentData";
import { getDateString, getFormattedDateForDB } from "./helpers/dateFormatters";
import cron from "node-cron";
import { VotingData } from "../types/proposal.types";

const log = new Logger();

const saveToDb = async (day: string) => {
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
      await saveProposalToDb(writePool, proposalData);
    } catch (error) {
      log.error(`Failed to save proposal "${title}":`, error);
    }
  }
};

// Schedule everyday at 23:30
const scheduledJob = cron.schedule("30 23 * * *", () => {
  log.info("Running data extractor...");

  createTables()
    .then(() => {
      const yesterday = getDateString(1);
      saveToDb(yesterday).catch((e) => log.error("Error saving parliamentdata to DB", e));
    })
    .finally(() => log.info("Cron job finished."));
});

// I run the script Once and start the scheduledJob
log.info("Starting scheduler...");

// First time Will fetch the last X days from the parliament website
const daysToCheck = Number(process.env.DAYS_TO_CHECK_VOTATIONS);

createTables()
  .then(async () => {
    for (let i = daysToCheck; i > 1; i--) {
      const dateToCheck = getDateString(i);
      await saveToDb(dateToCheck).catch((e) => log.error("Error saving parliamentdata to DB", dateToCheck, "=>", e));
    }
  })
  .finally(() => {
    writePool.end(() => {
      // Close connection only after the loop is done
      log.info("Database connection closed after historical data load.");
    });
  });

scheduledJob.start();

// Keep the process running
process.stdin.resume();

log.info("Scheduler started successfully.");

// Graceful shutdown
process.on("SIGINT", () => {
  log.info("Shutting down gracefully...");
  scheduledJob.stop();
  writePool.end(() => {
    log.info("Database connection closed.");
    process.exit(0);
  });
});
