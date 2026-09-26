import fs from "fs";
import nodemailer from "nodemailer";
import { resolvePublicFilePath } from "@/lib/launchAdminStore";
import { renderEmailTemplate } from "@/lib/launchEmailTemplates";

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

function getMailConfig() {
  const SMTP_HOST = normalizeSmtpHost(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || "").trim();
  const SMTP_USER = String(process.env.SMTP_USER || "").trim();
  const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
  const SMTP_SECURE = process.env.SMTP_SECURE;
  const MAIL_FROM = String(process.env.MAIL_FROM || "").trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error("Mail server not configured (SMTP env vars missing).");
  }
  if (!isValidEmail(SMTP_USER) || !isValidEmail(extractEmail(MAIL_FROM))) {
    throw new Error("Mail server not configured correctly.");
  }

  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: true },
    }),
    mailFrom: MAIL_FROM,
  };
}

export function buildDistributionEmail({ copyType, name, fileLabel, templates }) {
  const key = copyType === "sneakPeek" || copyType === "fullDigital" || copyType === "arc" ? copyType : "arc";
  const tpl = templates?.distribution?.[key];
  if (tpl?.subject && tpl?.body) {
    return renderEmailTemplate(tpl, { name, product: fileLabel });
  }
  const first = String(name || "").split(/\s+/)[0] || "friend";
  return {
    subject: `Your ${fileLabel || "digital copy"} — Silver Spine Studio™`,
    text: `Hi ${first},\n\nAttached is your file from Silver Spine Studio™.\n\n© Leameso James. Personal use only.\n`,
  };
}

export function buildSelectionEmail({ noticeType, name, templates }) {
  const key = noticeType === "giveawayWinner" ? "giveawayWinner" : "arcSelected";
  const tpl = templates?.selection?.[key];
  if (!tpl?.subject || !tpl?.body) {
    throw new Error("Selection letter template is missing — save templates in Admin → Launch.");
  }
  return renderEmailTemplate(tpl, { name });
}

async function sendPlainEmail({ to, subject, text, attachments = [] }) {
  const { transporter, mailFrom } = getMailConfig();
  await transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    text,
    attachments,
  });
  return { subject, sentAt: new Date().toISOString() };
}

/**
 * Send one distribution email with attachment from public/ path.
 */
export async function sendDistributionEmail({ to, name, copyType, publicPath, fileLabel, templates }) {
  if (!isValidEmail(to)) throw new Error(`Invalid email: ${to}`);
  const diskPath = resolvePublicFilePath(publicPath);
  if (!diskPath) throw new Error(`File not found on server: ${publicPath}`);

  const filename = publicPath.split("/").pop() || "download";
  const { subject, text } = buildDistributionEmail({ copyType, name, fileLabel, templates });

  const sent = await sendPlainEmail({
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        path: diskPath,
        contentType: guessMime(filename),
      },
    ],
  });

  return { ...sent, filePath: publicPath };
}

/** Follow-up letter — no attachment. */
export async function sendFollowUpEmail({ to, person, followUpKey, templates }) {
  if (!isValidEmail(to)) throw new Error(`Invalid email: ${to}`);
  const { subject, text } = buildFollowUpEmail({ followUpKey, person, templates });
  return sendPlainEmail({ to, subject, text });
}

function buildFollowUpEmail({ followUpKey, person, templates }) {
  const tpl = templates?.followUp?.[followUpKey];
  if (!tpl?.subject || !tpl?.body) {
    throw new Error(`Follow-up letter “${followUpKey}” is missing — save templates in Admin → Launch.`);
  }
  return renderEmailTemplate(tpl, {
    name: person.name,
    outlet: person.outlet,
    businessName: person.businessName,
  });
}

/** Selection notice — no attachment (Aug 17 style). */
export async function sendSelectionEmail({ to, name, noticeType, templates }) {
  if (!isValidEmail(to)) throw new Error(`Invalid email: ${to}`);
  const { subject, text } = buildSelectionEmail({ noticeType, name, templates });
  return sendPlainEmail({ to, subject, text });
}

function guessMime(filename) {
  const ext = String(filename).split(".").pop()?.toLowerCase();
  if (ext === "epub") return "application/epub+zip";
  if (ext === "pdf") return "application/pdf";
  if (ext === "mobi") return "application/x-mobipocket-ebook";
  if (ext === "zip") return "application/zip";
  return "application/octet-stream";
}

/** Quick check that attachment path exists before bulk send. */
export function assertDistributionFile(publicPath) {
  const diskPath = resolvePublicFilePath(publicPath);
  if (!diskPath) throw new Error(`File not found: ${publicPath}`);
  const stat = fs.statSync(diskPath);
  if (!stat.isFile()) throw new Error(`Not a file: ${publicPath}`);
  return { diskPath, size: stat.size };
}
