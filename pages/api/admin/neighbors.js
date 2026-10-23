import { requireAuth } from "@/lib/adminAuth";
import { assistantCanNeighborAction } from "@/lib/adminRoles";
import {
  approveNeighbor,
  listAllNeighborsForAdmin,
  neighborsStorageMode,
  rejectNeighbor,
  unpublishNeighbor,
} from "@/lib/neighborsStore";

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const listings = await listAllNeighborsForAdmin();
      return res.status(200).json({ ok: true, listings, storage: neighborsStorageMode() });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const id = String(body.id || "").trim();
      const action = String(body.action || "").trim();
      if (!id) return res.status(400).json({ ok: false, error: "Missing listing id." });

      if (!assistantCanNeighborAction(action)) {
        const owner = requireAuth(req, res, { ownerOnly: true });
        if (!owner) return;
      }

      if (action === "approve") {
        await approveNeighbor(id);
        return res.status(200).json({ ok: true });
      }
      if (action === "reject") {
        await rejectNeighbor(id);
        return res.status(200).json({ ok: true });
      }
      if (action === "unpublish") {
        await unpublishNeighbor(id);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("admin neighbors error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
