import { LiKesAndDislikes } from "./likesAndDislikes";

interface VotesParties {
  for: number;
  party: string;
  noVote: number;
  abstain: number;
  against: number;
}

export interface RelatedPromise {
  promise_id: number;
  promise_text: string;
  fulfillment_status: "Supporting Evidence" | "Contradictory Evidence" | "Partial/Indirect Evidence";
  analysis_summary: string;
  party_name: string;
  campaign_year: number;
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
}

export interface Proposal {
  id: number;
  session: string;
  date: string;
  title: string;
  url: string;
  expedient_text: string;
  parliament_presence: number;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  no_vote: number;
  assent: boolean;
  votes_parties_json: VotesParties[];
  likes: number;
  dislikes: number;
  relatedPromises: RelatedPromise[];
}
