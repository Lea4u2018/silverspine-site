import { readLaunchAdminStore } from "@/lib/launchAdminStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const store = await readLaunchAdminStore();
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({
      ok: true,
      countdownMatrix: store.countdownMatrix,
      countdownTargets: store.countdownTargets,
    });
  } catch (err) {
    console.error("launch public error:", err);
    return res.status(500).json({ ok: false, error: "Could not load launch schedule." });
  }
}
