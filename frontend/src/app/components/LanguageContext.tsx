"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "ar";

type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Language | null) : null;
    if (stored === "en" || stored === "ar") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  const value = useMemo(() => ({ language, toggleLanguage, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


