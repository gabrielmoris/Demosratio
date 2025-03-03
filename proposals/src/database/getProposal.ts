import { Pool } from "pg";
import { Logger } from "tslog";

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
  votes_parties_json: string;
  likes: number;
  dislikes: number;
}

export const getProposalsFromDb = async (pool: Pool, page: number, pageSize: number): Promise<{ proposals: Proposal[]; totalCount: number }> => {
  try {
    const offset = (page - 1) * pageSize;

    const proposalQuery = `
      SELECT * FROM proposals
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM proposals
    `;

    const [proposalResult, countResult] = await Promise.all([pool.query(proposalQuery, [pageSize, offset]), pool.query(countQuery)]);

    const proposals: Proposal[] = proposalResult.rows;
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return { proposals, totalCount };
  } catch (error) {
    log.error(`Error fetching proposals from database:`, error);
    throw error;
  }
};
