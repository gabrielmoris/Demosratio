import { Temporal } from "@js-temporal/polyfill";
import { Logger } from "tslog";

const log = new Logger();

export const getDateString = (daysLess: number = 0): string => {
  const today = Temporal.Now.plainDateISO();
  const targetDate = today.subtract({ days: daysLess });

  return targetDate.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const normalizeWrongSpanishDate = (dateString: string): string => {
  try {
    const [day, month, year] = dateString.split("/");
    const date = Temporal.PlainDate.from({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
    });

    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    log.error("Invalid date string:", dateString);
    return dateString; // Return original string if parsing fails
  }
};

export function getFormattedDateForDB(dateString: string): string {
  const [day, month, year] = dateString.split("/");
  const temporalDate = Temporal.PlainDate.from({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
  });

  return temporalDate.toString();
}

/**
 * The locale to format dates and numbers with. Browsers without data for a language
 * (some lack Basque or Galician) would fall back to English, so they get Spanish instead.
 */
export function intlLocale(locale: string): string {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0 ? locale : "es-ES";
  } catch {
    return "es-ES";
  }
}

export function formatDate(date: string, locale: string = "es-ES"): string {
  const dateToFormat = new Date(date);
  const dateTemporal = Temporal.PlainDate.from(dateToFormat.toISOString().slice(0, 10)); // Extract YYYY-MM-DD

  return dateTemporal.toLocaleString(intlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
