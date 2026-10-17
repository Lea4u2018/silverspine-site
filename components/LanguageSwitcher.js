import { useEffect, useState } from "react";
import { SITE_LANGUAGES, normalizeLang, writePreferredLang, readPreferredLang } from "@/lib/i18n";
import { clearGoogTransCookies } from "@/lib/chromeVars";
import {
  goToLanguage,
  isOnTranslateProxy,
  readTargetLangFromProxy,
} from "@/lib/viewingLanguage";

/**
 * Language control — dedicated English option always first.
 * Labels: English (original) | English → Spanish (Español)
 * Never auto-redirects on load; only navigates on explicit choice.
 */
export default function LanguageSwitcher({ embedded = false }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    clearGoogTransCookies();
    try {
      document.body.style.top = "0px";
      document.documentElement.classList.remove("translated-ltr", "translated-rtl");
      document.body.classList.remove("translated-ltr", "translated-rtl");
    } catch {
      /* ignore */
    }

    // Reflect where we are / what they last chose — do NOT redirect
    if (isOnTranslateProxy()) {
      setLang(readTargetLangFromProxy() || readPreferredLang() || "en");
      return;
    }
    setLang(readPreferredLang() || "en");
  }, []);

  const onChange = (e) => {
    const next = normalizeLang(e.target.value);
    const onProxy = isOnTranslateProxy();
    writePreferredLang(next);
    setLang(next);

    // Return to English: always hard-exit if still on translate.goog
    // (same-value early-return caused the “click English twice” bug)
    if (next === "en") {
      if (onProxy) goToLanguage("en");
      return;
    }

    if (next === lang && onProxy && readTargetLangFromProxy() === next) return;
    goToLanguage(next);
  };

  return (
    <div
      className={[
        "sss-lang-switcher shrink-0 notranslate",
        embedded ? "" : "fixed z-[201] right-2.5 top-3",
      ]
        .filter(Boolean)
        .join(" ")}
      translate="no"
    >
      <label className="sr-only" htmlFor="sss-lang-select">
        Choose language. English is always available.
      </label>
      <select
        id="sss-lang-select"
        value={lang}
        onChange={onChange}
        translate="no"
        title="Choose a language. English is always available. Your choice follows as you click through the site."
        className={[
          "notranslate min-w-[10rem] max-w-[15rem] sm:min-w-[12rem] sm:max-w-[17rem]",
          "rounded-full border border-[#dfcfb5]/70 bg-black/85 text-[#f5f0e4]",
          "px-2.5 py-1.5 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide",
          "shadow-[0_6px_16px_rgba(0,0,0,0.45)] outline-none",
          "focus:border-[#c5a059] focus:ring-2 focus:ring-[#dfcfb5]/35",
        ].join(" ")}
        aria-label="Choose language. First option is English."
      >
        {SITE_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-black text-white" translate="no">
            {l.code === "en"
              ? "English (original)"
              : `English → ${l.label} (${l.native})`}
          </option>
        ))}
      </select>
    </div>
  );
}
