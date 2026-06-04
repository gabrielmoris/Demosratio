import { LiKesAndDislikes } from "./likesAndDislikes";

interface VotesParties {
 for: number;
 party: string;
 noVote: number;
 abstain: number;
 against: number;
}

export interface ProposalSummary {
 bullet_points: string[];
 one_line: string;
 summary_type: string;
}

export interface VotingData {
 id: number;
 title: string;
 url: string;
 session: number;
 expedient_text: string;
 votes_parties_json: VotesParties;
 parliament_presence: number;
 votes_for: number;
 abstentions: number;
 votes_against: number;
 no_vote: number;
 assent: boolean;
 date: string;
 likesAndDislikes?: LiKesAndDislikes;
 summary_one_line?: string | null;
 summary_data?: { summary_text: string; summary_type: string } | null;
}

export interface Proposal {
 id?: number;
 session: string;
 date: string;
 title: string;
 url: string;
 expedient_text: string;
 parliament_presence: string;
 votes_for: number;
 votes_against: number;
 abstentions: number;
 no_vote?: number;
 votes_parties_json: VotesParties[];
 assent: boolean;
 likes: number;
 dislikes: number;
 summary?: ProposalSummary | null;
}
