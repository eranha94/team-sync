"use client";

import useLanguage from "@/hooks/useLanguage";

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  return (
    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
      <button
        type="button"
        onClick={() => setLanguage("he")}
        className={`px-4 py-2 text-sm font-bold transition ${
          language === "he"
            ? "bg-purple-600 text-white"
            : "text-white/60 hover:bg-white/5"
        }`}
      >
        🇮🇱 {t.common.hebrew}
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-4 py-2 text-sm font-bold transition ${
          language === "en"
            ? "bg-purple-600 text-white"
            : "text-white/60 hover:bg-white/5"
        }`}
      >
        🇺🇸 {t.common.english}
      </button>
    </div>
  );
}