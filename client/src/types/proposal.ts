interface Votes {
  for: number;
  noVote: number;
  abstain: number;
  against: number;
}

interface VotesParties {
  GP?: Votes;
  GR?: Votes;
  GS?: Votes;
  GMx?: Votes;
  GVOX?: Votes;
  GJxCAT?: Votes;
  GSUMAR?: Votes;
  "GEH Bildu"?: Votes;
  "GV (EAJ-PNV)"?: Votes;
  //   [key: string]: Votes;  If there is new parties in future
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
  date: string;
}
