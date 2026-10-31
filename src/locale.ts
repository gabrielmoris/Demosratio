/** Language names shown in the language switcher, each written in its own language. Keep in sync with routing.locales. */
export const codeToLanguage = {
  es: "Español",
  ca: "Català",
  eu: "Euskara",
  gl: "Galego",
  en: "English",
};

export const languageToCode = Object.fromEntries(Object.entries(codeToLanguage).map(([code, language]) => [language, code]));
