import { intToRoman, romanToInt } from './romanNumerals';

/** Used when the database has no current legislatura and TARGET_LEGISLATURA is not set. */
export const DEFAULT_LEGISLATURA_ID = 15;

/** "16", 16 or "XVI" -> 16. Anything else -> null. */
export const parseLegislatura = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const n = /^\d+$/.test(text) ? Number(text) : /^[IVXLCDM]+$/i.test(text) ? romanToInt(text) : NaN;
  return Number.isInteger(n) && n > 0 && n < 1000 ? n : null;
};

/** 16 -> "XVI" */
export const legislaturaLabel = (id: number): string => intToRoman(id);

/** Legislatura from the TARGET_LEGISLATURA env var ("XVI" or "16"), else XV. */
export const envLegislaturaId = (): number =>
  parseLegislatura(process.env.TARGET_LEGISLATURA) ?? DEFAULT_LEGISLATURA_ID;

/** Adds ?legislatura=16 (or &legislatura=16) to an API url. Without an id the API uses the current one. */
export const withLegislatura = (url: string, id?: number | null): string =>
  id ? `${url}${url.includes('?') ? '&' : '?'}legislatura=${id}` : url;
