"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  translations,
  type Language,
} from "@/lib/language/translations";

const LANGUAGE_STORAGE_KEY =
  "nightmareCampLanguage";

const LANGUAGE_CHANGE_EVENT =
  "nightmareCampLanguageChange";

function getStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return "he";
  }

  return localStorage.getItem(
    LANGUAGE_STORAGE_KEY
  ) === "en"
    ? "en"
    : "he";
}

export function useLanguage() {
  const [language, setLanguageState] =
    useState<Language>("he");

  useEffect(() => {
    setLanguageState(getStoredLanguage());

    function handleLanguageChange(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<Language>;

      const nextLanguage =
        customEvent.detail === "en"
          ? "en"
          : "he";

      setLanguageState(nextLanguage);
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key !== LANGUAGE_STORAGE_KEY
      ) {
        return;
      }

      setLanguageState(
        event.newValue === "en"
          ? "en"
          : "he"
      );
    }

    window.addEventListener(
      LANGUAGE_CHANGE_EVENT,
      handleLanguageChange
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        LANGUAGE_CHANGE_EVENT,
        handleLanguageChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      language;

    document.documentElement.dir =
      language === "he"
        ? "rtl"
        : "ltr";
  }, [language]);

  function setLanguage(
    nextLanguage: Language
  ) {
    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      nextLanguage
    );

    setLanguageState(nextLanguage);

    window.dispatchEvent(
      new CustomEvent<Language>(
        LANGUAGE_CHANGE_EVENT,
        {
          detail: nextLanguage,
        }
      )
    );
  }

  function toggleLanguage() {
    setLanguage(
      language === "he"
        ? "en"
        : "he"
    );
  }

  const t = useMemo(
    () => translations[language],
    [language]
  );
function tr(key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((current, part) => {
      if (
        current &&
        typeof current === "object" &&
        part in current
      ) {
        return (
          current as Record<string, unknown>
        )[part];
      }

      return undefined;
    }, translations[language]);

  return typeof value === "string"
    ? value
    : key;
}
  return {
    language,
    direction:
      language === "he"
        ? "rtl"
        : "ltr",
    isHebrew: language === "he",
    isEnglish: language === "en",
    setLanguage,
    toggleLanguage,
    t,
    tr,
  };
}

export default useLanguage;