import { isValidAdminToken, readAdminTokenFromReq } from "@/lib/adminAuth";
import {
  approveReview,
  listAllForAdmin,
  rejectReview,
  storageMode,
  unpublishReview,
} from "@/lib/reviewsStore";

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
      const reviews = await listAllForAdmin();
      return res.status(200).json({ ok: true, reviews, storage: storageMode() });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const id = String(body.id || "").trim();
      const action = String(body.action || "").trim();
      if (!id) return res.status(400).json({ ok: false, error: "Missing review id." });

      if (action === "approve") {
        await approveReview(id);
        return res.status(200).json({ ok: true });
      }
      if (action === "reject") {
        await rejectReview(id);
        return res.status(200).json({ ok: true });
      }
      if (action === "unpublish") {
        await unpublishReview(id);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("admin reviews error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
