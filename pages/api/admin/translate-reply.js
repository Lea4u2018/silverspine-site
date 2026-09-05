import { requireAuth } from "@/lib/adminAuth";
import { languageLabel, normalizeLang } from "@/lib/i18n";
import { fromEnglish, toEnglish } from "@/lib/translate";

/**
 * Studio helper: translate YOUR English reply → visitor language
 * (or visitor message → English if direction is "in").
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAuth(req, res)) return;

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const text = String(body.text || "").trim().slice(0, 8000);
  const lang = normalizeLang(body.lang || body.targetLang || "en");
  const direction = String(body.direction || "out").toLowerCase() === "in" ? "in" : "out";

  if (!text) {
    return res.status(400).json({ ok: false, error: "Paste some text to translate." });
  }

  try {
    const result =
      direction === "in"
        ? await toEnglish(text, lang === "en" ? "auto" : lang)
        : await fromEnglish(text, lang);

    return res.status(200).json({
      ok: true,
      lang,
      languageLabel: languageLabel(lang),
      direction,
      translated: Boolean(result.translated),
      provider: result.provider || null,
      note: result.note || null,
      text: result.text || text,
    });
  } catch (e) {
    console.error("translate-reply error", e);
    return res.status(502).json({ ok: false, error: "Translation failed. Try again." });
  }
}
