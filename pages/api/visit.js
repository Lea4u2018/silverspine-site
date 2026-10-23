import crypto from "crypto";
import { isStudioMachine } from "@/lib/adminAuth";
import { recordVisit } from "@/lib/visitsStore";

const VID_COOKIE = "sss_vid";

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const p = part.trim();
    if (p.startsWith(`${name}=`)) return decodeURIComponent(p.slice(name.length + 1));
  }
  return "";
}

function isBot(req) {
  const ua = String(req.headers["user-agent"] || "").toLowerCase();
  if (!ua) return true;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|pingdom|ahrefs|semrush|yandex|bingpreview|vercel/.test(
    ua
  );
}

function visitorCookieHeader(id) {
  const maxAge = 60 * 60 * 24 * 400;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${VID_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  if (isStudioMachine(req) || isBot(req)) {
    return res.status(204).end();
  }

  let vid = readCookie(req, VID_COOKIE);
  if (!vid || vid.length < 8) {
    vid = crypto.randomBytes(16).toString("hex");
    res.setHeader("Set-Cookie", visitorCookieHeader(vid));
  }

  try {
    await recordVisit(vid);
  } catch {
    // Never block the public site if counting fails.
  }
  return res.status(204).end();
}
