export const codeToLanguage = {
  es: "Español",
  ga: "Galego",
  ca: "Català",
  eu: "Euskara",
};

export const languageToCode = Object.fromEntries(Object.entries(codeToLanguage).map(([code, language]) => [language, code]));
