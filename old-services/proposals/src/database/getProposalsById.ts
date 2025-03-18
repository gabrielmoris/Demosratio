import { Pool } from "pg";
import { Logger } from "tslog";
import { dataToSpanishFormat } from "../helpers/dateFormatter";

const log = new Logger();

interface Proposal {
  session: string;
  date: string;
  title: string;
  url: string;
  expedient_text: string;
  parliament_presence: string;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  votes_parties_json: any;
  likes: number;
  dislikes: number;
}

export const getProposalsById = async (pool: Pool, id: number): Promise<Proposal> => {
  try {
    const proposalQuery = `
      SELECT * FROM proposals WHERE id = $1
    `;

    const proposalResult = await pool.query(proposalQuery, [id]);

    const proposal: Proposal = proposalResult.rows[0];

    if (proposal.votes_parties_json && proposal.votes_parties_json.votes) {
      proposal.votes_parties_json = proposal.votes_parties_json.votes;
    }
    if (proposal.date) {
      proposal.date = dataToSpanishFormat(proposal.date);
    }

    return proposal;
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
