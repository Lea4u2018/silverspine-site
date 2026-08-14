import { isValidAdminToken, readAdminTokenFromReq } from "@/lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const token = readAdminTokenFromReq(req);
  return res.status(200).json({ ok: isValidAdminToken(token) });
}
