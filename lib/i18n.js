/** Site language preference — viewing + form routing */

export const LANG_STORAGE_KEY = "sss-lang";
export const LANG_COOKIE = "sss-lang";

/** Codes used by Google Translate widget + our forms */
export const SITE_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "zh-CN", label: "Chinese", native: "中文" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ru", label: "Russian", native: "русский" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "pt", label: "Portuguese", native: "português" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "ko", label: "Korean", native: "한국어" },
];

export function languageLabel(code) {
  const hit = SITE_LANGUAGES.find((l) => l.code === code);
  return hit ? `${hit.label} (${hit.native})` : code || "English";
}

export function normalizeLang(code) {
  const raw = String(code || "en").trim();
  if (!raw) return "en";
  const lower = raw.toLowerCase();
  if (lower === "zh" || lower === "zh-cn" || lower === "zh_hans") return "zh-CN";
  const hit = SITE_LANGUAGES.find((l) => l.code.toLowerCase() === lower || l.code === raw);
  return hit ? hit.code : "en";
}

export function readPreferredLang() {
  if (typeof window === "undefined") return "en";
  try {
    const fromStore = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (fromStore) return normalizeLang(fromStore);
  } catch {}
  try {
    const m = document.cookie.match(/(?:^|; )sss-lang=([^;]*)/);
    if (m) return normalizeLang(decodeURIComponent(m[1]));
  } catch {}
  return "en";
}

export function writePreferredLang(code) {
  const lang = normalizeLang(code);
  if (typeof window === "undefined") return lang;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {}
  try {
    document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("sss-lang-change", { detail: { lang } }));
  } catch {}
  return lang;
}
