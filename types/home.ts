import { VotingData } from './proposal';

export interface ContradictedPromise {
  promise_id: number;
  promise_text: string;
  party_id: number;
  party_name: string;
  subject_id: number;
  /** Votes of the period that contradict this promise */
  count: number;
  votes: { id: number; title: string }[];
}

export interface HomeOverview {
  counters: {
    totalVotes: number;
    analysedVotes: number;
    promiseChecks: number;
  };
  latestVotes: VotingData[];
  /** YYYY-MM-DD. Null when the legislatura has no votes yet */
  period: { from: string; to: string } | null;
  contradicted: ContradictedPromise[];
}
