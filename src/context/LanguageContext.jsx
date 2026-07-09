import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations.js";

const LanguageContext = createContext(null);

function resolveLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return translations[browser] ? browser : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(resolveLanguage);

  const t = useCallback((key) => translations[lang][key] || key, [lang]);

  const setLang = useCallback((next) => {
    localStorage.setItem("lang", next);
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
