import { listPublished, storageMode } from "@/lib/blogStore";
import { listPinnedPublished, pinnedStorageMode } from "@/lib/pinnedBlogStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const [posts, pinned] = await Promise.all([listPublished(), listPinnedPublished()]);
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({
      ok: true,
      posts,
      pinned,
      storage: storageMode(),
      pinnedStorage: pinnedStorageMode(),
    });
  } catch (err) {
    console.error("blog posts error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error", posts: [], pinned: [] });
  }
}
