"use client";

import { useEffect, useMemo, useState } from "react";

import {
  translations,
  type Language,
} from "@/lib/language/translations";

const LANGUAGE_STORAGE_KEY = "nightmareCampLanguage";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "he";
  }

  const storedLanguage = localStorage.getItem(
    LANGUAGE_STORAGE_KEY
  );

  return storedLanguage === "en" ? "en" : "he";
}

export function useLanguage() {
  const [language, setLanguageState] =
    useState<Language>("he");

  useEffect(() => {
    setLanguageState(getInitialLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "he" ? "rtl" : "ltr";
  }, [language]);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);

    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      nextLanguage
    );
  }

  function toggleLanguage() {
    setLanguage(language === "he" ? "en" : "he");
  }

  const t = useMemo(
    () => translations[language],
    [language]
  );

  function tr(path: string): string {
    const result = path
      .split(".")
      .reduce<unknown>((current, key) => {
        if (
          current &&
          typeof current === "object" &&
          key in current
        ) {
          return (
            current as Record<string, unknown>
          )[key];
        }

        return undefined;
      }, t);

    return typeof result === "string"
      ? result
      : path;
  }

  return {
    language,
    direction: language === "he" ? "rtl" : "ltr",
    isHebrew: language === "he",
    isEnglish: language === "en",
    setLanguage,
    toggleLanguage,
    t,
    tr,
  };
}

export default useLanguage;