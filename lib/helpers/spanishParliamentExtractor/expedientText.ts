import { ProposalInfo } from "@/types/proposal.types";

/**
 * Builds the expedient_text we store for a votation.
 *
 * When Congress votes a motion point by point, every point comes with the same
 * textoExpediente and only tituloSubGrupo/textoSubGrupo tell them apart
 * (e.g. "Votación separada por puntos." / "Punto 2."). We append that label so each
 * point is saved as its own proposal instead of being skipped as a duplicate.
 *
 * Votes without a sub-group keep the original text untouched, so they still match
 * the rows already in the database.
 */
export const buildExpedientText = (info: ProposalInfo): string => {
  const subGroup = [info.tituloSubGrupo, info.textoSubGrupo]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  if (!subGroup) return info.textoExpediente;

  return `${info.textoExpediente.trim()} (${subGroup})`;
};

/** True when this votation is one point of a motion voted point by point. */
export const hasSubGroup = (info: ProposalInfo): boolean => Boolean(info.tituloSubGrupo?.trim() || info.textoSubGrupo?.trim());
