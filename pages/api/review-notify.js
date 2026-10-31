// Emails the studio when a new review is submitted (pending approval).
import nodemailer from "nodemailer";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 8;
const ipHits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (ipHits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  ipHits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function getClientIp(req) {
  const xfwd = req.headers["x-forwarded-for"];
  if (typeof xfwd === "string") return xfwd.split(",")[0].trim();
  if (Array.isArray(xfwd)) return xfwd[0];
  return req.socket?.remoteAddress || "unknown";
}

function normalizeSmtpHost(host) {
  if (typeof host !== "string") return "";
  let h = host.trim().replace(/^https?:\/\//i, "").replace(/^\/\//, "");
  if (!h) return "";
  const lower = h.toLowerCase();
  if (lower === "office365.com" || lower === "outlook.com" || lower === "microsoft.com") {
    return "smtp.office365.com";
  }
  if (lower.includes("office365") && !lower.startsWith("smtp.")) {
    return "smtp.office365.com";
  }
  return h;
}

function extractEmail(value) {
  if (typeof value !== "string") return "";
  const m = value.match(/<([^>]+)>/);
  return (m ? m[1] : value).trim();
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeStr(s, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\0/g, "").slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (rateLimited(getClientIp(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = sanitizeStr(body.name, 80).trim();
  const text = sanitizeStr(body.text, 2000).trim();
  const rating = Number(body.rating);

  if (!name || !text) {
    return res.status(400).json({ ok: false, error: "Missing review fields." });
  }

  const SMTP_HOST = normalizeSmtpHost(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || "").trim();
  const SMTP_USER = String(process.env.SMTP_USER || "").trim();
  const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
  const SMTP_SECURE = process.env.SMTP_SECURE;
  const MAIL_TO = String(process.env.MAIL_TO || "").trim();
  const MAIL_FROM = String(process.env.MAIL_FROM || "").trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    console.error("review-notify: mail env missing");
    return res.status(500).json({ ok: false, error: "Mail not configured." });
  }

  if (!isValidEmail(SMTP_USER) || !isValidEmail(extractEmail(MAIL_FROM)) || !isValidEmail(extractEmail(MAIL_TO))) {
    return res.status(500).json({ ok: false, error: "Mail not configured correctly." });
  }

  const stars = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : "?";
  const site = "https://www.silverspinestudio.com";

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: true },
  });

  const subject = `[REVIEW] Pending approval — ${name} (${stars}★)`;
  const bodyText = [
    "REQUEST TYPE: NEW REVIEW (PENDING APPROVAL)",
    "Outlook: Sort to [REVIEWS] folder (rule: subject contains [REVIEW] — brackets required)",
    "",
    `Name: ${name}`,
    `Rating: ${stars} / 5`,
    "",
    "Review:",
    text,
    "",
    "Approve or decline here:",
    `${site}/admin`,
    "",
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject,
      text: bodyText,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("review-notify send error:", err);
    return res.status(502).json({ ok: false, error: "Email service error." });
  }
}
