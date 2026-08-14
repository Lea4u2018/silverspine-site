import { requireAuth } from "@/lib/adminAuth";
import { readVisits, storageMode, summarizeVisits } from "@/lib/visitsStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAuth(req, res)) return;

  try {
    const store = await readVisits();
    return res.status(200).json({
      ok: true,
      storage: storageMode(),
      ...summarizeVisits(store),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Could not load visits." });
  }
}
