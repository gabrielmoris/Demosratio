import { Pool } from "pg";
import { Logger } from "tslog";

const log = new Logger();

export async function saveProposalToDb(pool: Pool, proposalData: any) {
  try {
    const {
      session,
      date,
      title,
      expedient_text,
      parliament_presence,
      is_accepted,
      votes_for,
      votes_against,
      abstentions,
      votes_parties_json,
      likes,
      dislikes,
    } = proposalData;

    // First I check if the expedient_text is already saved (It seems they upload a lot of redundant files)
    const checkQuery = `SELECT id FROM proposals WHERE expedient_text = $1`;
    const checkValues = [expedient_text];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      log.warn(`Proposal with expedient_text "${expedient_text}" already exists. Skipping.`);
      return null; // Or return the existing ID if you need it
    }

    // Then save
    const query = `
        INSERT INTO proposals (title, session, expedient_text, parliament_presence, is_accepted, votes_for, abstentions, votes_against, date,votes_parties_json, likes,dislikes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id;  -- Return the inserted ID if needed
      `;

    const values = [
      title,
      session,
      expedient_text,
      parliament_presence,
      is_accepted,
      votes_for,
      abstentions,
      votes_against,
      date,
      votes_parties_json,
      likes,
      dislikes,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      log.info(`Proposal "${title}" saved with ID: ${result.rows[0].id}`);
      return result.rows[0].id; // Return the ID if you need it
    } else {
      log.warn(`Proposal "${title}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error(`Error saving proposal to database:`, error);
    throw error; // Re-throw the error for handling at a higher level
  }
}
