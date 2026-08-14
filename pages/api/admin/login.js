import { getAdminPassword, makeAdminToken, adminCookieHeader, studioCookieHeader } from "@/lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const password = getAdminPassword();
  if (!password) {
    return res.status(503).json({
      ok: false,
      error: "Admin password is not configured yet (set ADMIN_PASSWORD in Vercel).",
    });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const attempt = String(body.password || "");

  if (attempt !== password) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }

  const token = makeAdminToken();
  res.setHeader("Set-Cookie", [adminCookieHeader(token), studioCookieHeader()].filter(Boolean));
  return res.status(200).json({ ok: true });
}
