import {
  adminCookieHeader,
  getAdminPassword,
  getAssistantPassword,
  makeAdminToken,
  makeAssistantToken,
  studioCookieHeader,
} from "@/lib/adminAuth";
import { ADMIN_ROLE } from "@/lib/adminRoles";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const attempt = String(body.password || "");
  const role = String(body.role || ADMIN_ROLE.OWNER).trim();

  if (role === ADMIN_ROLE.ASSISTANT) {
    const assistantPassword = getAssistantPassword();
    if (!assistantPassword) {
      return res.status(503).json({
        ok: false,
        error: "Assistant login is not configured yet (set ASSISTANT_PASSWORD in Vercel).",
      });
    }
    if (attempt !== assistantPassword) {
      return res.status(401).json({ ok: false, error: "Incorrect assistant password." });
    }
    const token = makeAssistantToken();
    res.setHeader("Set-Cookie", adminCookieHeader(token));
    return res.status(200).json({ ok: true, role: ADMIN_ROLE.ASSISTANT });
  }

  const password = getAdminPassword();
  if (!password) {
    return res.status(503).json({
      ok: false,
      error: "Owner password is not configured yet (set ADMIN_PASSWORD in Vercel).",
    });
  }

  if (attempt !== password) {
    return res.status(401).json({ ok: false, error: "Incorrect owner password." });
  }

  const token = makeAdminToken();
  res.setHeader("Set-Cookie", [adminCookieHeader(token), studioCookieHeader()].filter(Boolean));
  return res.status(200).json({ ok: true, role: ADMIN_ROLE.OWNER });
}
