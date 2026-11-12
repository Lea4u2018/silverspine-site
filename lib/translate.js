/**
 * Server-side translation helpers for contact forms.
 * Preferred: DEEPL_AUTH_KEY
 * Optional: GOOGLE_TRANSLATE_API_KEY
 * Fallback: MyMemory (free, best-effort — no key)
 */

function truncate(s, max = 4500) {
  const t = String(s || "");
  return t.length > max ? t.slice(0, max) : t;
}

/** Map site codes → DeepL */
function toDeepL(code, forTarget = false) {
  const c = String(code || "en");
  if (c === "en") return forTarget ? "EN-US" : "EN";
  if (c === "pt") return "PT-BR";
  if (c === "zh-CN") return "ZH";
  const map = { es: "ES", de: "DE", nl: "NL", fr: "FR", it: "IT", ja: "JA", ko: "KO", ru: "RU" };
  return map[c] || null;
}

/** Map site codes → Google / MyMemory */
function toPair(code) {
  if (code === "zh-CN") return "zh-CN";
  return String(code || "en").split("-")[0];
}

async function translateDeepL(text, source, target) {
  const key = String(process.env.DEEPL_AUTH_KEY || "").trim();
  if (!key) return null;
  const src = source === "en" ? null : toDeepL(source, false);
  const tgt = toDeepL(target, true);
  if (!tgt) return null;
  // Arabic not on DeepL Free the same way — skip
  if (target === "ar" || source === "ar") return null;

  const endpoint = key.endsWith(":fx") || process.env.DEEPL_API_URL?.includes("api-free")
    ? "https://api-free.deepl.com/v2/translate"
    : String(process.env.DEEPL_API_URL || "https://api.deepl.com/v2/translate").trim();

  const body = new URLSearchParams();
  body.set("auth_key", key);
  body.set("text", text);
  body.set("target_lang", tgt.replace("EN-US", "EN"));
  if (src) body.set("source_lang", src);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    console.error("DeepL translate failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = await res.json();
  const out = data?.translations?.[0]?.text;
  return typeof out === "string" && out.trim() ? out.trim() : null;
}

async function translateGoogle(text, source, target) {
  const key = String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
  if (!key) return null;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: source === "en" ? "en" : toPair(source),
      target: toPair(target),
      format: "text",
    }),
  });
  if (!res.ok) {
    console.error("Google translate failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = await res.json();
  const out = data?.data?.translations?.[0]?.translatedText;
  return typeof out === "string" && out.trim() ? out.trim() : null;
}

async function translateMyMemory(text, source, target) {
  // Free tier — short messages only
  const q = truncate(text, 480);
  const langpair = `${toPair(source)}|${toPair(target)}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(langpair)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (typeof out !== "string" || !out.trim()) return null;
  // MyMemory sometimes returns "INVALID SOURCE LANGUAGE..." 
  if (/INVALID|MYMEMORY WARNING/i.test(out)) return null;
  return out.trim();
}

/**
 * @returns {{ text: string, translated: boolean, provider: string|null, note?: string }}
 */
export async function translateText(text, sourceLang, targetLang) {
  const source = String(sourceLang || "en");
  const target = String(targetLang || "en");
  const input = truncate(String(text || "").trim(), 4500);
  if (!input) return { text: "", translated: false, provider: null };
  if (source === target || (!source && target === "en")) {
    return { text: input, translated: false, provider: null };
  }

  try {
    const deepl = await translateDeepL(input, source, target);
    if (deepl) return { text: deepl, translated: true, provider: "deepl" };
  } catch (e) {
    console.error("DeepL error", e);
  }

  try {
    const google = await translateGoogle(input, source, target);
    if (google) return { text: google, translated: true, provider: "google" };
  } catch (e) {
    console.error("Google translate error", e);
  }

  try {
    const mm = await translateMyMemory(input, source, target);
    if (mm) return { text: mm, translated: true, provider: "mymemory", note: "best-effort free translation" };
  } catch (e) {
    console.error("MyMemory error", e);
  }

  return {
    text: input,
    translated: false,
    provider: null,
    note: "Translation unavailable — showing original only. Add DEEPL_AUTH_KEY or GOOGLE_TRANSLATE_API_KEY in Vercel for reliable English inbox copy.",
  };
}

export async function toEnglish(text, sourceLang) {
  const src = sourceLang && sourceLang !== "en" ? sourceLang : "auto";
  // MyMemory/DeepL need a source; if unknown use detect via translating with source omitted on DeepL
  if (!sourceLang || sourceLang === "en") {
    return { text: String(text || ""), translated: false, provider: null };
  }
  return translateText(text, sourceLang, "en");
}

export async function fromEnglish(text, targetLang) {
  if (!targetLang || targetLang === "en") {
    return { text: String(text || ""), translated: false, provider: null };
  }
  const input = String(text || "").trim();
  if (!input) return { text: "", translated: false, provider: null };

  // Prefer one-shot (DeepL / Google). If that fails on long mail, translate by paragraph.
  const whole = await translateText(input, "en", targetLang);
  if (whole.translated && whole.text) return whole;

  const parts = input.split(/\n{2,}/);
  if (parts.length < 2) return whole;

  const out = [];
  let provider = null;
  let any = false;
  for (const part of parts) {
    const piece = part.trim();
    if (!piece) {
      out.push("");
      continue;
    }
    const r = await translateText(piece, "en", targetLang);
    if (r.translated && r.text) {
      out.push(r.text);
      any = true;
      provider = r.provider || provider;
    } else {
      out.push(piece);
    }
  }
  if (!any) return whole;
  return { text: out.join("\n\n"), translated: true, provider: provider || "chunked", note: whole.note };
}
