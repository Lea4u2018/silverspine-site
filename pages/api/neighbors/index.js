import { listApprovedNeighbors } from "@/lib/neighborsStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    const listings = await listApprovedNeighbors();
    const publicList = listings.map((n) => ({
      id: n.id,
      businessName: n.businessName,
      contactName: n.contactName || "",
      category: n.category,
      city: n.city,
      website: n.website || "",
      email: n.email || "",
      phone: n.phone || "",
      description: n.description,
    }));
    return res.status(200).json({ ok: true, listings: publicList });
  } catch (err) {
    console.error("neighbors list error:", err);
    return res.status(500).json({ ok: false, error: "Could not load neighbors." });
  }
}
