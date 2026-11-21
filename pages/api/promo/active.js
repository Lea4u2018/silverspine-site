import { discountSummary, isDiscountCodeLive } from "@/lib/discountCodes";
import { readLaunchAdminStore } from "@/lib/launchAdminStore";

/** Public — active discount codes for Shop banner (no secrets). */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const store = await readLaunchAdminStore();
    const codes = (store.discountCodes || [])
      .filter((c) => isDiscountCodeLive(c))
      .map((c) => ({
        code: c.code,
        label: c.label,
        summary: discountSummary(c),
        product: c.product,
        expiresAt: c.expiresAt || "",
      }));
    return res.status(200).json({ ok: true, codes });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Could not load promos." });
  }
}
