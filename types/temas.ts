import { Subject, PromiseAnalysis } from "./politicalParties";

export interface SubjectWithStats extends Subject {
  totalPromises: number;
  totalParties: number;
}

export interface SubjectProposal {
  id: number;
  title: string;
  expedient_text: string;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  no_vote: number;
  date: string;
  url: string;
  assent: boolean;
}

export interface SubjectPromiseEntry {
  id: number;
  promise: string;
  campaign_year: number;
  analyses: PromiseAnalysis[];
}

export interface SubjectPartyData {
  party_id: number;
  party_name: string;
  party_logo?: string;
  promises: SubjectPromiseEntry[];
}

export interface SubjectDeepDiveStats {
  totalPromises: number;
  totalParties: number;
  totalVotes: number;
  supporting: number;
  contradictory: number;
  partial: number;
  notAnalyzed: number;
}

export interface SubjectDeepDive {
  subject: Subject;
  stats: SubjectDeepDiveStats;
  parties: SubjectPartyData[];
  relatedProposals: SubjectProposal[];
}
