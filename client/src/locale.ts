export const codeToLanguage = {
  // en: "English",
  // de: "Deutsch",
  es: "Español",
};

export const languageToCode = Object.fromEntries(Object.entries(codeToLanguage).map(([code, language]) => [language, code]));
