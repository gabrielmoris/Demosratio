import { supabaseAdmin } from "../supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export async function createTables() {
  try {
    const { error } = await supabaseAdmin.from("proposals").select("id").limit(1);

    if (error) {
      log.warn("Proposals table might not exist yet. Error:", error.message);
      log.info("Please create the proposals table in the Supabase dashboard with the following structure:");
      log.info(`
        id: uuid (primary key, default: uuid_generate_v4())
        title: text
        url: text
        session: text
        expedient_text: text
        parliament_presence: integer
        votes_for: integer
        abstentions: integer
        votes_against: integer
        no_vote: integer
        assent: boolean
        date: date
        votes_parties_json: jsonb
        created_at: timestamp with time zone (default: now())
      `);
      throw new Error("Proposals table not properly configured");
    }

    log.info("Database tables are properly configured");
    return true;
  } catch (error) {
    log.error("Error verifying tables:", error);
    throw error;
  }
}
