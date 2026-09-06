/** Safe language viewing via translate.goog — English → chosen language.

Rules:
- Never auto-redirect on cold page load (that caused jump loops).
- Preference only follows visitor *clicks* (link rewrite) or an explicit dropdown choice.
*/

import { normalizeLang } from "@/lib/i18n";
import { clearGoogTransCookies } from "@/lib/chromeVars";

export const CANONICAL_HOST = "www.silverspinestudio.com";
export const TRANSLATE_HOST = "www-silverspinestudio-com.translate.goog";

export function isOnTranslateProxy() {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".translate.goog");
}

export function readTargetLangFromProxy() {
  try {
    const params = new URLSearchParams(window.location.search);
    const sl = params.get("_x_tr_sl") || "";
    const tl = params.get("_x_tr_tl") || "";
    if (tl && (sl === "en" || sl === "")) return normalizeLang(tl);
    if (tl === "en" && sl && sl !== "en") return normalizeLang(sl);
    if (tl && tl !== "en") return normalizeLang(tl);
    if (sl && sl !== "en") return normalizeLang(sl);
  } catch {
    /* ignore */
  }
  return null;
}

export function buildTranslateUrl(path, code, hash = "") {
  const tl = normalizeLang(code) === "zh-CN" ? "zh-CN" : normalizeLang(code);
  const cleanPath = path || "/";
  return (
    `https://${TRANSLATE_HOST}${cleanPath}` +
    `?_x_tr_sl=en&_x_tr_tl=${encodeURIComponent(tl)}&_x_tr_hl=en&_x_tr_pto=wapp` +
    (hash || "")
  );
}

export function buildCanonicalUrl(path, hash = "") {
  return `https://${CANONICAL_HOST}${path || "/"}${hash || ""}`;
}

/** Hard navigation that can break out of Google’s translate wrapper. */
function navigateTop(url) {
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.replace(url);
      return;
    }
  } catch {
    /* cross-origin top — fall through */
  }
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_top";
    a.rel = "noopener noreferrer";
    a.setAttribute("translate", "no");
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Fallback if click is swallowed
    window.setTimeout(() => {
      try {
        if (window.location.href !== url && !String(window.location.href).startsWith(url.split("?")[0])) {
          window.location.replace(url);
        }
      } catch {
        window.location.replace(url);
      }
    }, 250);
    return;
  } catch {
    /* fall through */
  }
  window.location.replace(url);
}

/** Explicit dropdown choice only. */
export function goToLanguage(code) {
  if (typeof window === "undefined") return;
  clearGoogTransCookies();
  const path = window.location.pathname || "/";
  const hash = window.location.hash || "";
  const lang = normalizeLang(code);

  if (lang === "en") {
    // Leave translate.goog firmly — Google’s wrapper can intercept a soft href change
    navigateTop(buildCanonicalUrl(path, hash));
    return;
  }

  window.location.assign(buildTranslateUrl(path, lang, hash));
}

/** Rewrite internal same-site links so a chosen language follows the next click. */
export function rewriteInternalHrefForTranslate(href, pref) {
  if (!href || pref === "en") return null;
  try {
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return null;
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const u = new URL(href);
      if (
        u.hostname !== CANONICAL_HOST &&
        u.hostname !== "silverspinestudio.com" &&
        !u.hostname.endsWith(".translate.goog")
      ) {
        return null;
      }
      return buildTranslateUrl(u.pathname || "/", pref, u.hash || "");
    }
    const fake = new URL(href, `https://${CANONICAL_HOST}`);
    return buildTranslateUrl(fake.pathname || "/", pref, fake.hash || "");
  } catch {
    return null;
  }
}
