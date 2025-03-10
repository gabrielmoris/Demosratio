import { Temporal } from "@js-temporal/polyfill";

export const dataToSpanishFormat = (date: string) => {
  const isoDate = new Date(date).toISOString();
  const temporalDate = Temporal.Instant.from(isoDate).toZonedDateTimeISO("Europe/Madrid");

  return temporalDate.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};
