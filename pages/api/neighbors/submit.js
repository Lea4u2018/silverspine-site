import nodemailer from "nodemailer";
import { addPendingNeighbor, neighborsStorageMode } from "@/lib/neighborsStore";
import { captureFormSubmission } from "@/lib/launchAdminStore";
import {
  cleanWebsite,
  isAllowedCategory,
  isAllowedPurchaseSource,
  isValidEmail,
  looksLikeBookTrade,
  NEIGHBOR_PURCHASE_SOURCES,
  sanitizeStr,
} from "@/lib/neighborRules";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 4;
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

async function notifyStudio(listing) {
  const SMTP_HOST = normalizeSmtpHost(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || "").trim();
  const SMTP_USER = String(process.env.SMTP_USER || "").trim();
  const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
  const SMTP_SECURE = process.env.SMTP_SECURE;
  const MAIL_TO = String(process.env.MAIL_TO || "").trim();
  const MAIL_FROM = String(process.env.MAIL_FROM || "").trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    return;
  }
  if (!isValidEmail(SMTP_USER) || !isValidEmail(extractEmail(MAIL_FROM)) || !isValidEmail(extractEmail(MAIL_TO))) {
    return;
  }

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
    subject: `[NEIGHBOR] Pending approval — ${listing.businessName}`,
    text: [
      "REQUEST TYPE: STUDIO NEIGHBOR (PENDING APPROVAL)",
      "Outlook: Sort to [NEIGHBORS] folder (rule: subject contains [NEIGHBOR] — brackets required)",
      "",
      `ID: ${listing.id}`,
      `Business: ${listing.businessName}`,
      `Contact: ${listing.contactName}`,
      `Category: ${listing.category}`,
      `City: ${listing.city}`,
      `Website: ${listing.website || "(none)"}`,
      `Email: ${listing.email}`,
      `Phone: ${listing.phone || "(none)"}`,
      `Invested / purchased: ${listing.invested ? "yes" : "no"}`,
      `Purchased from: ${listing.purchaseSource || "(not given)"}`,
      `Purchase email (checkout): ${listing.purchaseEmail || "(same as contact or not given)"}`,
      `Order / receipt note: ${listing.purchaseReference || "(none)"}`,
      "",
      "About:",
      listing.description,
      "",
      "Approve or decline here:",
      "https://www.silverspinestudio.com/admin",
      "",
      `Storage: ${neighborsStorageMode()}`,
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
  const businessName = sanitizeStr(body.businessName, 80);
  const contactName = sanitizeStr(body.contactName, 80);
  const category = sanitizeStr(body.category, 60);
  const city = sanitizeStr(body.city, 80);
  const website = cleanWebsite(body.website);
  const email = sanitizeStr(body.email, 120).toLowerCase();
  const phone = sanitizeStr(body.phone, 40);
  const description = sanitizeStr(body.description, 800);
  const purchaseSource = sanitizeStr(body.purchaseSource, 80);
  const purchaseEmail = sanitizeStr(body.purchaseEmail, 120).toLowerCase();
  const purchaseReference = sanitizeStr(body.purchaseReference, 120);
  const notBooks = Boolean(body.notBooks);
  const invested = Boolean(body.invested);
  const hp = String(body.hp || "").trim();
  const startedAt = Number(body.startedAt || 0);

  if (hp) return res.status(200).json({ ok: true });
  if (!(Date.now() - (Number.isFinite(startedAt) ? startedAt : 0) >= 800)) {
    return res.status(400).json({ ok: false, error: "Submission too fast. Please try again." });
  }
  if (!businessName || businessName.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter the business name." });
  }
  if (!contactName || contactName.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter a contact name." });
  }
  if (!isAllowedCategory(category)) {
    return res.status(400).json({ ok: false, error: "Please choose a category." });
  }
  if (!city || city.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter a city or area." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }
  if (!description || description.length < 20) {
    return res.status(400).json({ ok: false, error: "Please tell us a little more about the business." });
  }
  if (!website && !phone) {
    return res.status(400).json({
      ok: false,
      error: "No website? Add a phone number so people can reach you from this card.",
    });
  }
  if (!invested) {
    return res.status(400).json({
      ok: false,
      error: "This wall is for those investing in the community — purchase first, then ask to be listed.",
    });
  }
  if (!isAllowedPurchaseSource(purchaseSource)) {
    return res.status(400).json({
      ok: false,
      error: "Please choose where you purchased from Silver Spine Studio™.",
    });
  }
  if (purchaseEmail && !isValidEmail(purchaseEmail)) {
    return res.status(400).json({
      ok: false,
      error: "Purchase email must be a valid email address, or leave it blank.",
    });
  }
  if (!notBooks) {
    return res.status(400).json({
      ok: false,
      error: "This porch is not for book publishers, bookstores, or book selling.",
    });
  }
  if (looksLikeBookTrade(businessName, category, description, website)) {
    return res.status(400).json({
      ok: false,
      error: "Book publishers, bookstores, and book-selling businesses are not listed here. Shop is for books.",
    });
  }

  try {
    const listing = await addPendingNeighbor({
      businessName,
      contactName,
      category,
      city,
      website,
      email,
      phone,
      description,
      invested: true,
      purchaseSource,
      purchaseEmail,
      purchaseReference,
    });
    try {
      await notifyStudio(listing);
    } catch (mailErr) {
      console.error("neighbor notify error:", mailErr);
    }
    try {
      await captureFormSubmission({
        kind: "neighbor",
        name: contactName,
        email,
        businessName,
        category,
        messagePreview: description.slice(0, 280),
      });
    } catch (capErr) {
      console.error("launch admin neighbor capture error:", capErr);
    }
    return res.status(200).json({
      ok: true,
      message: "Thank you. Your request is waiting for studio approval. Nothing goes live until Leameso says yes.",
    });
  } catch (err) {
    console.error("neighbor submit error:", err);
    const msg = String(err?.message || "");
    if (msg.includes("GITHUB_TOKEN")) {
      return res.status(503).json({
        ok: false,
        error: "The porch is not finished setting up yet. Please try again soon.",
      });
    }
    return res.status(500).json({ ok: false, error: "Sorry—something went wrong. Please try again." });
  }
}
