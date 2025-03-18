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
}
