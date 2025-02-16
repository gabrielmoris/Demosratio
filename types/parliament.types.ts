// Define the types
export interface ParlamentData {
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

interface Votacion {
  asiento: string;
  diputado: string;
  grupo: string;
  voto: string;
}
