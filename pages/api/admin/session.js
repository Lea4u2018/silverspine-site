import { resolveAdminSession } from "@/lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const session = resolveAdminSession(req);
  return res.status(200).json({ ok: session.ok, role: session.role });
}
