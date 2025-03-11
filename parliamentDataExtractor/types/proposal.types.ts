// Define the types
export interface ProposalData {
  informacion: Informacion;
  totales: Totales;
  votaciones: Votacion[];
}

interface Informacion {
  sesion: number;
  numeroVotacion: number;
  fecha: string;
  titulo: string;
  textoExpediente: string;
  tituloSubGrupo: string;
  textoSubGrupo: string;
  votacionesConjuntas: [];
}

interface Totales {
  asentimiento: string;
  presentes: number;
  afavor: number;
  enContra: number;
  abstenciones: number;
  noVotan: number;
}

export interface Votacion {
  asiento: string;
  diputado: string;
  grupo: string;
  voto: string;
}

export interface VotingData {
  title: string;
  url: string;
  session: number;
  expedient_text: string;
  votes_parties_json: {
    votes: {
      against: number;
      for: number;
      abstain: number;
      noVote: number;
      party: string;
    }[];
  };
  parliament_presence: number;
  votes_for: number;
  abstentions: number;
  votes_against: number;
  no_vote: number;
  date: string;
}
