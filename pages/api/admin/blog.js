import { requireAuth } from "@/lib/adminAuth";
import {
  createPost,
  deletePost,
  listAllForAdmin,
  saveUploadedMedia,
  storageMode,
  updatePost,
} from "@/lib/blogStore";
import { listPinnedForAdmin, pinnedStorageMode, updatePinned } from "@/lib/pinnedBlogStore";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4.5mb",
    },
  },
};

function requireOwner(req, res) {
  return requireAuth(req, res, { ownerOnly: true });
}

export default async function handler(req, res) {
  if (!requireOwner(req, res)) return;

  try {
    if (req.method === "GET") {
      const [posts, pinned] = await Promise.all([listAllForAdmin(), listPinnedForAdmin()]);
      return res.status(200).json({
        ok: true,
        posts,
        pinned,
        storage: storageMode(),
        pinnedStorage: pinnedStorageMode(),
      });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const action = String(body.action || "").trim();

      if (action === "upload") {
        const uploaded = await saveUploadedMedia({
          filename: body.filename,
          base64: body.base64,
          mimeType: body.mimeType,
        });
        return res.status(200).json({ ok: true, ...uploaded });
      }

      if (action === "update-pinned") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing pinned post id." });
        const bullets =
          typeof body.bulletsText === "string"
            ? body.bulletsText.split("\n").map((s) => s.trim()).filter(Boolean)
            : body.bullets;
        const post = await updatePinned(id, {
          category: body.category,
          dateISO: body.dateISO,
          title: body.title,
          body: body.body,
          bullets,
          mediaType: body.mediaType,
          mediaUrl: body.mediaUrl,
          mediaPoster: body.mediaPoster,
          mediaCaption: body.mediaCaption,
          videoLive: body.videoLive,
          figureKey: body.figureKey,
          expandBody: body.expandBody,
          expandLabel: body.expandLabel,
          published: body.published,
        });
        return res.status(200).json({ ok: true, post });
      }

      if (action === "publish-pinned" || action === "unpublish-pinned") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing pinned post id." });
        const post = await updatePinned(id, { published: action === "publish-pinned" });
        return res.status(200).json({ ok: true, post });
      }

      if (action === "create") {
        const post = await createPost({
          title: body.title,
          body: body.body,
          mediaType: body.mediaType,
          mediaUrl: body.mediaUrl,
          mediaCaption: body.mediaCaption,
          videoLive: body.videoLive,
          published: body.published !== false,
        });
        return res.status(200).json({ ok: true, post });
      }

      if (action === "update") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing post id." });
        const post = await updatePost(id, {
          title: body.title,
          body: body.body,
          mediaType: body.mediaType,
          mediaUrl: body.mediaUrl,
          mediaCaption: body.mediaCaption,
          videoLive: body.videoLive,
          published: body.published,
        });
        return res.status(200).json({ ok: true, post });
      }

      if (action === "delete") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing post id." });
        await deletePost(id);
        return res.status(200).json({ ok: true });
      }

      if (action === "publish" || action === "unpublish") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing post id." });
        const post = await updatePost(id, { published: action === "publish" });
        return res.status(200).json({ ok: true, post });
      }

      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("admin blog error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
