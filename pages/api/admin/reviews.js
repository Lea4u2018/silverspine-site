import { requireAuth } from "@/lib/adminAuth";
import { assistantCanReviewAction } from "@/lib/adminRoles";
import {
  approveReview,
  listAllForAdmin,
  rejectReview,
  storageMode,
  unpublishReview,
} from "@/lib/reviewsStore";

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

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

      if (!assistantCanReviewAction(action)) {
        const owner = requireAuth(req, res, { ownerOnly: true });
        if (!owner) return;
      }

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
