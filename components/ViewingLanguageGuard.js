import { useEffect } from "react";
import { readPreferredLang } from "@/lib/i18n";
import {
  isOnTranslateProxy,
  rewriteInternalHrefForTranslate,
} from "@/lib/viewingLanguage";

/**
 * Safe language follow-through: rewrite internal *clicks* only.
 * Never redirects on page load or routeChangeComplete.
 */
export default function ViewingLanguageGuard() {
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Prefer live proxy language; fall back to saved preference
      let pref = "en";
      if (isOnTranslateProxy()) {
        try {
          const params = new URLSearchParams(window.location.search);
          const tl = params.get("_x_tr_tl");
          const sl = params.get("_x_tr_sl");
          if (tl && tl !== "en") pref = tl;
          else if (sl && sl !== "en") pref = sl;
          else pref = readPreferredLang();
        } catch {
          pref = readPreferredLang();
        }
      } else {
        pref = readPreferredLang();
      }

      if (!pref || pref === "en") return;

      const a = e.target?.closest?.("a[href]");
      if (!a) return;
      // Don't rewrite the language control itself
      if (a.closest?.(".sss-lang-switcher, .sss-top-right-controls")) return;

      const href = a.getAttribute("href");
      const next = rewriteInternalHrefForTranslate(href, pref);
      if (!next) return;

      // Already a correct translate URL
      if (typeof href === "string" && href.includes("_x_tr_tl=")) return;

      e.preventDefault();
      e.stopPropagation();
      window.location.assign(next);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
