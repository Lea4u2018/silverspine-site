// /pages/api/contact-safe.js
// Safe, vendor-free contact endpoint for Silver Spine Studio™
// - Validates inputs
// - Honeypot anti-bot
// - Simple time-to-submit check
// - Basic in-memory rate limit (per IP)
// - Sends email via Microsoft 365 (SMTP) using env vars
//
// This file does NOT affect your current /contact page.
// You'll test it later with /contact-safe on your branch.

import nodemailer from "nodemailer";

// ---------- Simple in-memory rate limiter (per runtime instance) ----------
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 5; // per IP per window
const ipHits = new Map(); // { ip: [timestamps...] }

function rateLimited(ip) {
  const now = Date.now();
  const arr = ipHits.get(ip) || [];
  const recent = arr.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  ipHits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

// ---------- Helpers ----------
function getClientIp(req) {
  const xfwd = req.headers["x-forwarded-for"];
  if (typeof xfwd === "string") return xfwd.split(",")[0].trim();
  if (Array.isArray(xfwd)) return xfwd[0];
  return req.socket?.remoteAddress || "unknown";
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  // Simple, practical email regex (not perfect, but good enough)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeStr(s, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\0/g, "").slice(0, max);
}

export default async function handler(req, res) {
  // Method guard
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Basic JSON body guard
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return res.status(400).json({ ok: false, error: "Expected application/json" });
  }

  // Extract client details
  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
  }

  let payload;
  try {
    payload = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  // Fields: name, email, message, hp (honeypot), startedAt (ms timestamp)
  const name = sanitizeStr(payload.name, 200).trim();
  const email = sanitizeStr(payload.email, 320).trim();
  const message = sanitizeStr(payload.message, 5000).trim();
  const hp = String(payload.hp || "").trim(); // bots often fill this
  const startedAt = Number(payload.startedAt || 0);

  // Honeypot: must be empty
  if (hp) {
    // Pretend success to not tip off bots
    return res.status(200).json({ ok: true });
  }

  // Time-to-submit: require at least ~800ms since form rendered
  const elapsed = Date.now() - (isFinite(startedAt) ? startedAt : 0);
  if (!(elapsed >= 800)) {
    return res.status(400).json({ ok: false, error: "Submission too fast. Please try again." });
  }

  // Validate human inputs
  if (!name || name.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter your name." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  }
  if (!message || message.length < 10) {
    return res.status(400).json({ ok: false, error: "Please enter a longer message." });
  }

  // Env vars (configure in Vercel → Settings → Environment Variables)
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE, // "true" or "false"
    MAIL_TO,     // where you want to receive messages (e.g., contact@silverspinestudio.com)
    MAIL_FROM,   // the from identity shown in emails (e.g., "Silver Spine Studio <contact@silverspinestudio.com>")
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    return res.status(500).json({ ok: false, error: "Mail server not configured." });
  }

  // Nodemailer transport (Microsoft 365 typical settings shown below)
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,               // e.g., "smtp.office365.com"
    port: Number(SMTP_PORT),       // e.g., 587
    secure: String(SMTP_SECURE).toLowerCase() === "true", // false for STARTTLS on 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // Require TLS on ports like 587
      rejectUnauthorized: true,
    },
  });

  // Compose message
  const ua = sanitizeStr(req.headers["user-agent"] || "", 512);
  const subject = `New message from ${name} via SilverSpineStudio.com`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
    "",
    `—`,
    `IP: ${ip}`,
    `User-Agent: ${ua}`,
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: `${name} <${email}>`,
      subject,
      text,
    });
    return res.status(200).json({ ok: true, message: "Thanks! Your message has been sent." });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(502).json({ ok: false, error: "Email service error. Please try again later." });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100kb",
    },
  },
};
