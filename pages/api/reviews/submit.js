import nodemailer from "nodemailer";
import { addPendingReview, storageMode } from "@/lib/reviewsStore";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 6;
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

function sanitizeStr(s, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\0/g, "").slice(0, max).trim();
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
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function notifyStudio({ name, text, rating, id }) {
  const SMTP_HOST = normalizeSmtpHost(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || "").trim();
  const SMTP_USER = String(process.env.SMTP_USER || "").trim();
  const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
  const SMTP_SECURE = process.env.SMTP_SECURE;
  const MAIL_TO = String(process.env.MAIL_TO || "").trim();
  const MAIL_FROM = String(process.env.MAIL_FROM || "").trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    console.error("review submit: mail env missing");
    return;
  }
  if (!isValidEmail(SMTP_USER) || !isValidEmail(extractEmail(MAIL_FROM)) || !isValidEmail(extractEmail(MAIL_TO))) {
    return;
  }

  const stars = Number.isFinite(rating) ? rating : "?";
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: true },
  });

  await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject: `[REVIEW] Pending approval — ${name} (${stars}★)`,
    text: [
      "REQUEST TYPE: NEW REVIEW (PENDING APPROVAL)",
      "Outlook: Sort to [REVIEWS] folder (rule: subject contains [REVIEW] — brackets required)",
      "",
      `ID: ${id}`,
      `Name: ${name}`,
      `Rating: ${stars} / 5`,
      "",
      "Review:",
      text,
      "",
      "Approve or decline here:",
      "https://www.silverspinestudio.com/admin",
      "",
      `Storage: ${storageMode()}`,
      `Received: ${new Date().toISOString()}`,
    ].join("\n"),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (rateLimited(getClientIp(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = sanitizeStr(body.name, 80);
  const text = sanitizeStr(body.text, 2000);
  const rating = Number(body.rating);
  const hp = String(body.hp || "").trim();
  const startedAt = Number(body.startedAt || 0);

  if (hp) return res.status(200).json({ ok: true }); // honeypot
  if (!(Date.now() - (Number.isFinite(startedAt) ? startedAt : 0) >= 800)) {
    return res.status(400).json({ ok: false, error: "Submission too fast. Please try again." });
  }
  if (!name || name.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter your name." });
  }
  if (!text || text.length < 10) {
    return res.status(400).json({ ok: false, error: "Please enter a longer review." });
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ ok: false, error: "Please choose a rating." });
  }

  try {
    const review = await addPendingReview({ name, text, rating });
    try {
      await notifyStudio({ name, text, rating, id: review.id });
    } catch (mailErr) {
      console.error("review notify error:", mailErr);
    }
    return res.status(200).json({
      ok: true,
      message: "Thank you! Your review was submitted and is pending approval.",
    });
  } catch (err) {
    console.error("review submit error:", err);
    const msg = String(err?.message || "");
    if (msg.includes("GITHUB_TOKEN")) {
      return res.status(503).json({
        ok: false,
        error: "Review storage is not finished setting up yet. Please try again soon.",
      });
    }
    return res.status(500).json({ ok: false, error: "Sorry—something went wrong. Please try again." });
  }
}
