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
import { languageLabel, normalizeLang } from "@/lib/i18n";
import { fromEnglish, toEnglish } from "@/lib/translate";
import { NOVEL_PRICING } from "@/lib/store";
import { captureFormSubmission } from "@/lib/launchAdminStore";

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

/** Fix common bad SMTP host values like "://office365.com" or "https://smtp.office365.com". */
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

  // Fields: name, email, message, kind, hp (honeypot), startedAt (ms timestamp)
  // Optional ARC fields: format, reviewSpot
  // Optional media fields: outlet, deadline
  // Only these kinds are allowed — unknown values become contact (never mis-tagged).
  const rawKind = sanitizeStr(payload.kind, 40).trim().toLowerCase();
  const kind =
    rawKind === "arc" ||
    rawKind === "list" ||
    rawKind === "contact" ||
    rawKind === "sites" ||
    rawKind === "media" ||
    rawKind === "press" ||
    rawKind === "interview"
      ? rawKind === "press" || rawKind === "interview"
        ? "media"
        : rawKind
      : "contact";
  const name = sanitizeStr(payload.name, 200).trim();
  const email = sanitizeStr(payload.email, 320).trim();
  let message = sanitizeStr(payload.message, 5000).trim();
  const preferredLang = normalizeLang(sanitizeStr(payload.language || payload.lang || "en", 16));
  const format = kind === "arc" ? sanitizeStr(payload.format, 40).trim() : "";
  const reviewSpot = kind === "arc" ? sanitizeStr(payload.reviewSpot, 80).trim() : "";
  const outlet = kind === "media" ? sanitizeStr(payload.outlet, 200).trim() : "";
  const deadline = kind === "media" ? sanitizeStr(payload.deadline, 120).trim() : "";
  const hp = String(payload.hp || "").trim(); // bots often fill this
  const startedAt = Number(payload.startedAt || 0);

  if (kind === "list" && !message) {
    message =
      "Please add me to the Silver Spine Studio launch email list for updates on The Beautiful Beast and the seven-fold chronicle.";
  }

  if (kind === "arc" && !message) {
    message = [
      "Early-release ARC request for The Beautiful Beast.",
      format ? `Preferred format: ${format}` : "",
      reviewSpot ? `Where they'll review: ${reviewSpot}` : "",
      "Agreed to personal-review-only license terms on the site form.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (kind === "sites" && !message) {
    message =
      "I'm interested in a custom website built in the Silver Spine Studio style (author / brand / business site). Please tell me about availability and next steps.";
  }

  if (kind === "media" && !message) {
    message = [
      "Media / interview / press-kit request for Silver Spine Studio™.",
      outlet ? `Outlet / publication: ${outlet}` : "",
      deadline ? `Deadline: ${deadline}` : "",
      "Agreed to confidential materials terms on the site form.",
    ]
      .filter(Boolean)
      .join("\n");
  }

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
  const SMTP_HOST = normalizeSmtpHost(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || "").trim();
  const SMTP_USER = String(process.env.SMTP_USER || "").trim();
  const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
  const SMTP_SECURE = process.env.SMTP_SECURE; // "true" or "false"
  const MAIL_TO = String(process.env.MAIL_TO || "").trim();
  const MAIL_FROM = String(process.env.MAIL_FROM || "").trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    console.error("Mail config missing required env vars");
    return res.status(500).json({ ok: false, error: "Mail server not configured." });
  }

  // Catch mangled credentials early (production had host "://office365.com" and non-email identities).
  if (!isValidEmail(SMTP_USER) || !isValidEmail(extractEmail(MAIL_FROM)) || !isValidEmail(extractEmail(MAIL_TO))) {
    console.error("Mail config invalid: SMTP_USER / MAIL_FROM / MAIL_TO must be real email addresses");
    return res.status(500).json({
      ok: false,
      error: "Mail server not configured correctly. Please contact the site owner.",
    });
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

  // Compose message to the studio inbox — one config per kind so titles never cross.
  const ua = sanitizeStr(req.headers["user-agent"] || "", 512);
  const firstName = name.split(/\s+/)[0] || name;

  const mailByKind = {
    arc: {
      studioSubject: `[ARC REQUEST] Early-release request — ${name}`,
      typeLabel: "EARLY-RELEASE ARC REQUEST",
      typeTag: "[ARC REQUEST]",
      folderHint: "Sort to: [ARC] folder (Outlook rule: subject contains [ARC REQUEST])",
      successMessage:
        "Thanks — your ARC request was received. Check your email for confirmation.",
      customerSubject: "We received your early-release request — Silver Spine Studio™",
      customerText: [
        `Hi ${firstName},`,
        "",
        "Thank you for requesting an early-release ARC for The Beautiful Beast from Silver Spine Studio™. We’re glad you’re interested in reading with us — that means a lot.",
        "",
        "WHAT YOU APPLIED FOR",
        "• An Advanced Review Copy (ARC) of The Beautiful Beast for personal review use",
        `• Preferred format on file: ${format || "EPUB or PDF"}`,
        "• This is separate from the paid Extended Sneak Peek (Prologue + Chapters 1–2)",
        "",
        "WHAT HAPPENS NEXT",
        "1) ARC sign-up window: August 7–14, 2026",
        "2) Selection emails go out: August 17, 2026 (25 sleuths)",
        "3) If selected, ARC delivery window: September 21–23, 2026",
        "4) Official release day: November 1, 2026",
        "",
        "Applying does not guarantee a spot. If you’re selected, you’ll get a separate email with download details.",
        "",
        "REMINDER",
        "ARC / early-release files are licensed for your personal review only. Please do not copy, upload, resell, or share the files (or substantial excerpts), except as part of a fair review.",
        "",
        "With appreciation,",
        "Leameso James",
        "Silver Spine Studio™",
        "contact@silverspinestudio.com",
        "https://www.silverspinestudio.com",
      ].join("\n"),
    },
    list: {
      studioSubject: `[LAUNCH LIST] Email list signup — ${name}`,
      typeLabel: "LAUNCH EMAIL LIST SIGNUP",
      typeTag: "[LAUNCH LIST]",
      folderHint: "Sort to: [LAUNCH LIST] folder (Outlook rule: subject contains [LAUNCH LIST])",
      successMessage: "Thanks! You're on the list. Watch your inbox for a confirmation.",
      customerSubject: "You're on the launch list — Silver Spine Studio™",
      customerText: [
        `Hi ${firstName},`,
        "",
        "You’re on the Silver Spine Studio™ launch list. Thank you for joining us.",
        "",
        `You’ll get updates on The Beautiful Beast sneak peek news, the Sep 30 full DIGITAL Insider preorder window, hardcover alerts for ${NOVEL_PRICING.hardcoverOrderFromLabel}, and release-day news.`,
        "",
        "BONUS — THREE FREE FULL DIGITAL COPIES:",
        "Three lucky sleuths will win a free digital copy of the FULL novel (readable on your devices).",
        "Your launch-list signup enters you. Winners will be announced mid-October 2026 by email inbox and on Silver Spine socials.",
        "",
        "This list is separate from ARC / early-release review requests.",
        "",
        "With appreciation,",
        "Leameso James",
        "Silver Spine Studio™",
        "https://www.silverspinestudio.com",
      ].join("\n"),
    },
    contact: {
      studioSubject: `[CONTACT-SSS] Website message — ${name}`,
      typeLabel: "CONTACT FORM MESSAGE",
      typeTag: "[CONTACT-SSS]",
      folderHint: "Sort to: [CONTACT-SSS] folder (Outlook rule: subject contains [CONTACT-SSS])",
      successMessage: "Thanks! Your message has been sent. Check your email for a confirmation.",
      customerSubject: "Thank you for contacting Silver Spine Studio™",
      customerText: [
        `Hi ${firstName},`,
        "",
        "Thank you for contacting Silver Spine Studio™.",
        "",
        "Your message arrived safely, and it matters to us. I’ll review what you sent and follow up as soon as I can.",
        "",
        "If your note is about a purchase, file access, or something time-sensitive, please keep this email handy so we can continue the conversation in one thread.",
        "",
        "With appreciation,",
        "Leameso James",
        "Silver Spine Studio™",
        "contact@silverspinestudio.com",
        "https://www.silverspinestudio.com",
      ].join("\n"),
    },
    sites: {
      studioSubject: `[WEBSITE INQUIRY] Custom site / website question — ${name}`,
      typeLabel: "WEBSITE BUILD INQUIRY",
      typeTag: "[WEBSITE INQUIRY]",
      folderHint: "Sort to: [WEBSITE INQUIRY] folder (Outlook rule: subject contains [WEBSITE INQUIRY])",
      successMessage:
        "Thanks — your website inquiry was received. Check your email for a confirmation; I’ll reply as soon as I can.",
      customerSubject: "Thank you for contacting Silver Spine Studio™ — website inquiry",
      customerText: [
        `Hi ${firstName},`,
        "",
        "Thank you for contacting Silver Spine Studio™ about a website / custom site question.",
        "",
        "Your inquiry arrived safely. Book launch comes first, and projects are considered by inquiry, fit, and timing — I’ll review what you sent and reply as soon as I can.",
        "",
        "If you haven’t already, you can include: what you’re launching, pages you need, and your preferred timing.",
        "",
        "With appreciation,",
        "Leameso James",
        "Silver Spine Studio™",
        "contact@silverspinestudio.com",
        "https://www.silverspinestudio.com",
      ].join("\n"),
    },
    media: {
      studioSubject: `[MEDIA REQUEST] Press / interview — ${name}${outlet ? ` (${outlet})` : ""}`,
      typeLabel: "MEDIA / INTERVIEW / PRESS REQUEST",
      typeTag: "[MEDIA REQUEST]",
      folderHint: "Sort to: [MEDIA REQUEST] folder (Outlook rule: subject contains [MEDIA REQUEST])",
      successMessage:
        "Thanks — your media / interview request was received. Check your email for a confirmation; I’ll reply as soon as I can.",
      customerSubject: "We received your media request — Silver Spine Studio™",
      customerText: [
        `Hi ${firstName},`,
        "",
        "Thank you for reaching out to Silver Spine Studio™ about media, interviews, or press materials for The Beautiful Beast / Seven-Fold Chronicle.",
        "",
        "Your request arrived safely. I’ll review outlet details, timing, and what you need, then follow up as soon as I can.",
        "",
        "If your deadline is tight, reply to this email with the date and any interview format notes (podcast, written Q&A, live, etc.).",
        "",
        "Materials shared for press use (if any) are confidential and not for redistribution without written consent.",
        "",
        "With appreciation,",
        "Leameso James",
        "Silver Spine Studio™",
        "contact@silverspinestudio.com",
        "https://www.silverspinestudio.com",
      ].join("\n"),
    },
  };

  const mail = mailByKind[kind];
  const AUTO_REPLY_TAG = "[AUTO-REPLY SENT]";

  // Visitor chose a language: translate THEIR message → English for the studio inbox.
  // Keep the original below so nothing is lost.
  let englishMessage = message;
  let inboundMeta = "Language: English (no translation needed)";
  if (preferredLang !== "en") {
    const inbound = await toEnglish(message, preferredLang);
    if (inbound.translated && inbound.text) {
      englishMessage = inbound.text;
      inboundMeta = `Visitor language: ${languageLabel(preferredLang)} · inbound translated to English via ${inbound.provider || "unknown"}`;
    } else {
      inboundMeta = `Visitor language: ${languageLabel(preferredLang)} · ENGLISH TRANSLATION UNAVAILABLE (${inbound.note || "add DEEPL_AUTH_KEY or GOOGLE_TRANSLATE_API_KEY in Vercel"}) — original shown below`;
    }
  }

  // What YOU will see in the AUTO REPLIED folder (visitor never sees these tags)
  const autoReplySubjectPreview = `${AUTO_REPLY_TAG} ${mail.typeTag} Auto-confirmation sent → ${email}`;

  const text = [
    `REQUEST TYPE: ${mail.typeLabel}`,
    `Outlook: ${mail.folderHint}`,
    inboundMeta,
    "",
    `AUTO-REPLY TO VISITOR: WILL SEND (clean email — no internal tags)`,
    `YOUR RECORD subject (for AUTO REPLIED folder): ${autoReplySubjectPreview}`,
    `How to spot already-answered confirmations: subject contains ${AUTO_REPLY_TAG}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Reply language for this visitor: ${languageLabel(preferredLang)}`,
    preferredLang !== "en"
      ? `TO REPLY IN THEIR LANGUAGE: write English at https://www.silverspinestudio.com/admin?replyLang=${encodeURIComponent(preferredLang)}&to=${encodeURIComponent(email)} → Reply translator → Copy / open email`
      : "Visitor is reading in English — reply normally.",
    kind === "arc" && format ? `Preferred format: ${format}` : "",
    kind === "arc" && reviewSpot ? `Review spot: ${reviewSpot}` : "",
    kind === "media" && outlet ? `Outlet / publication: ${outlet}` : "",
    kind === "media" && deadline ? `Deadline: ${deadline}` : "",
    "",
    preferredLang !== "en" ? "Message (ENGLISH for you):" : "Message:",
    englishMessage,
    preferredLang !== "en" ? "" : null,
    preferredLang !== "en" ? "Message (ORIGINAL as typed by visitor):" : null,
    preferredLang !== "en" ? message : null,
    "",
    `—`,
    `IP: ${ip}`,
    `User-Agent: ${ua}`,
    `Received: ${new Date().toISOString()}`,
  ]
    .filter((line) => line !== "" && line !== null)
    .join("\n");

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: `${name} <${email}>`,
      subject: mail.studioSubject,
      text,
      headers: {
        "X-SilverSpine-Request-Type": mail.typeTag,
        "X-SilverSpine-Kind": kind,
      },
    });

    // Auto-acknowledge to the visitor — in THEIR language whenever translation works.
    if (mail.customerSubject && mail.customerText) {
      try {
        let customerSubjectBody = mail.customerSubject;
        let customerText = mail.customerText;
        let replyLangNote = "en";
        if (preferredLang !== "en") {
          const sub = await fromEnglish(mail.customerSubject, preferredLang);
          const body = await fromEnglish(mail.customerText, preferredLang);
          if (sub.translated && sub.text) customerSubjectBody = sub.text;
          if (body.translated && body.text) {
            customerText = body.text;
            replyLangNote = preferredLang;
          } else {
            console.error(
              `Customer auto-reply stayed English (${kind}) for lang=${preferredLang}:`,
              body.note || "no translation"
            );
          }
        }

        // Clean message for the visitor (no internal tags in the body)
        const customerSubject = customerSubjectBody;
        const customerTextFinal = customerText;

        await transporter.sendMail({
          from: MAIL_FROM,
          to: email,
          replyTo: extractEmail(MAIL_TO) || extractEmail(MAIL_FROM),
          subject: customerSubject,
          text: customerTextFinal,
          headers: {
            "X-SilverSpine-Reply-Language": replyLangNote,
            "X-SilverSpine-Auto-Reply": "true",
            "X-SilverSpine-Request-Type": mail.typeTag,
            "X-Auto-Response-Suppress": "All",
            "Auto-Submitted": "auto-replied",
          },
        });

        // Separate copy to YOU only — for Outlook AUTO REPLIED folder (customers never see this)
        try {
          await transporter.sendMail({
            from: MAIL_FROM,
            to: extractEmail(MAIL_TO),
            subject: `${AUTO_REPLY_TAG} ${mail.typeTag} Auto-confirmation sent → ${email}`,
            text: [
              "INTERNAL — AUTO-REPLY RECORD (not sent to the visitor as this message)",
              "",
              `Tag: ${AUTO_REPLY_TAG}`,
              `Request type: ${mail.typeTag}`,
              `Visitor: ${name} <${email}>`,
              `Visitor-facing subject: ${customerSubject}`,
              `Sent at: ${new Date().toISOString()}`,
              "",
              "Outlook: subject contains [AUTO-REPLY SENT] → move to [AUTO REPLIED] folder.",
              "",
              "— End of record —",
            ].join("\n"),
            headers: {
              "X-SilverSpine-Auto-Reply": "true",
              "X-SilverSpine-Request-Type": mail.typeTag,
              "X-Auto-Response-Suppress": "All",
              "Auto-Submitted": "auto-replied",
            },
          });
        } catch (bccErr) {
          console.error(`Studio auto-reply record error (${kind}):`, bccErr);
        }
      } catch (autoErr) {
        console.error(`Customer auto-reply error (${kind}):`, autoErr);
        // Studio notification already sent — don't fail the whole request.
      }
    }

    try {
      await captureFormSubmission({
        kind,
        name,
        email,
        format,
        reviewSpot,
        outlet,
        deadline,
        messagePreview: message.slice(0, 280),
      });
    } catch (capErr) {
      console.error("launch admin capture error:", capErr);
    }

    return res.status(200).json({
      ok: true,
      message: mail.successMessage,
    });
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
