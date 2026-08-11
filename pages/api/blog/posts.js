import { listPublished, storageMode } from "@/lib/blogStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const posts = await listPublished();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({ ok: true, posts, storage: storageMode() });
  } catch (err) {
    console.error("blog posts error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error", posts: [] });
  }
}
