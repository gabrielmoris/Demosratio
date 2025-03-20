import { LiKesAndDislikes } from "./likesAndDislikes";

interface VotesParties {
  for: number;
  party: string;
  noVote: number;
  abstain: number;
  against: number;
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
  session: string;
  date: string;
  title: string;
  url: string;
  expedient_text: string;
  parliament_presence: string;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  votes_parties_json: VotesParties[];
  likes: number;
  dislikes: number;
}
