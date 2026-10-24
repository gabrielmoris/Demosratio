// types/proposal.types.ts
export interface Votacion {
  grupo: string;
  voto: string;
}

export interface ProposalInfo {
  sesion: string;
  fecha: string;
  titulo: string;
  textoExpediente: string;
  /** e.g. "Votación separada por puntos." when a motion is voted point by point */
  tituloSubGrupo?: string;
  /** e.g. "Punto 2." */
  textoSubGrupo?: string;
}

export interface ProposalTotals {
  presentes: number;
  afavor: number;
  enContra: number;
  abstenciones: number;
  noVotan: number;
  asentimiento: string;
}

export interface ProposalData {
  informacion: ProposalInfo;
  totales: ProposalTotals;
  votaciones: Votacion[];
}

export interface VotingData {
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
  votes_parties_json: {
    votes: {
      party: string;
      against: number;
      for: number;
      abstain: number;
      noVote: number;
    }[];
  };
  assent: boolean;
  /** Legislatura that published the vote: 15 = XV */
  legislatura_id?: number;
  promise_analysis_status?: PromiseAnalysisStatus;
}

/**
 * - done: promises analysed against this vote
 * - pending: saved while its legislatura was not the current one; /api/cron/promise-analysis analyses it
 */
export type PromiseAnalysisStatus = "done" | "pending";

/** One language version of a vote's plain-language summary. */
export interface PlainSummaryText {
  /** What was voted, in simple words */
  summary: string;
  /** What a "yes" vote means in practice */
  yes_means: string;
  /** What a "no" vote means in practice */
  no_means: string;
}

/** Keyed by locale, e.g. "es". */
export type PlainSummary = Record<string, PlainSummaryText>;

/**
 * Result of trying to summarise a vote. null in the DB means "not tried yet".
 * - done: summary saved
 * - not_applicable: procedural vote (deadline extension, Statute ruling...) with no initiative text
 * - no_match: Congreso search gave no single clear match
 * - no_pdf: initiative found but it has no BOCG publication yet
 * - not_in_pdf: Gemini couldn't find the initiative inside the PDF
 * - error: something failed (network, Gemini); retried on the next run
 */
export type ProposalSummaryStatus = "done" | "not_applicable" | "no_match" | "no_pdf" | "not_in_pdf" | "error";
