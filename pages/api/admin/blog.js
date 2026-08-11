import { isValidAdminToken, readAdminTokenFromReq } from "@/lib/adminAuth";
import {
  createPost,
  deletePost,
  listAllForAdmin,
  saveUploadedMedia,
  storageMode,
  updatePost,
} from "@/lib/blogStore";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4.5mb",
    },
  },
};

function requireAdmin(req, res) {
  const token = readAdminTokenFromReq(req);
  if (!isValidAdminToken(token)) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      const posts = await listAllForAdmin();
      return res.status(200).json({ ok: true, posts, storage: storageMode() });
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

      if (action === "create") {
        const post = await createPost({
          title: body.title,
          body: body.body,
          mediaType: body.mediaType,
          mediaUrl: body.mediaUrl,
          mediaCaption: body.mediaCaption,
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
