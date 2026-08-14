/**
 * Launch admin — countdown matrix, ARC/list recipients, distribution tracking.
 * Production: GitHub Contents API · Local: data/launch-admin.json
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { defaultLaunchAdminStore, mergeLaunchAdminStore } from "@/lib/launchAdminDefaults";
import { mergeEmailTemplates } from "@/lib/launchEmailTemplates";
import { generateDiscountCode, normalizeDiscountCode } from "@/lib/discountCodes";

const REPO = process.env.GITHUB_REPO || "Lea4u2018/silverspine-site";
const BRANCH = process.env.GITHUB_REVIEWS_BRANCH || "restore-site-2025-10-25";
const FILE_PATH = "data/launch-admin.json";
const LOCAL_FILE = path.join(process.cwd(), FILE_PATH);
const UPLOAD_DIR = "public/distribution";

function token() {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

async function githubGet() {
  const t = token();
  if (!t) return null;
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "silverspine-site",
    },
  });
  if (res.status === 404) return { store: defaultLaunchAdminStore(), sha: null };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const decoded = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { store: mergeLaunchAdminStore(JSON.parse(decoded || "{}")), sha: json.sha };
}

async function githubPut(store, sha, message) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set in Vercel.");
  const body = {
    message,
    content: Buffer.from(JSON.stringify(store, null, 2) + "\n", "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "silverspine-site",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

function localGet() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return defaultLaunchAdminStore();
    return mergeLaunchAdminStore(JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")));
  } catch {
    return defaultLaunchAdminStore();
  }
}

function localPut(store) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(store, null, 2) + "\n", "utf8");
}

async function writeStore(mutator, message) {
  const clone = (store) => JSON.parse(JSON.stringify(store));
  if (token()) {
    const g = await githubGet();
    const next = mutator(clone(g.store));
    await githubPut(next, g.sha, message);
    return next;
  }
  const cur = localGet();
  const next = mutator(clone(cur));
  localPut(next);
  return next;
}

export function launchAdminStorageMode() {
  return token() ? `github:${REPO}/${FILE_PATH}` : `local:${FILE_PATH}`;
}

export async function readLaunchAdminStore() {
  if (token()) {
    const g = await githubGet();
    return g.store;
  }
  return localGet();
}

export async function saveCountdown({ countdownMatrix, countdownTargets }) {
  return writeStore((store) => {
    if (Array.isArray(countdownMatrix) && countdownMatrix.length) {
      store.countdownMatrix = countdownMatrix;
    }
    if (Array.isArray(countdownTargets) && countdownTargets.length) {
      store.countdownTargets = countdownTargets;
    }
    return store;
  }, "launch-admin: update countdown");
}

export async function saveEmailTemplates(emailTemplates) {
  return writeStore((store) => {
    store.emailTemplates = mergeEmailTemplates(emailTemplates);
    return store;
  }, "launch-admin: update email templates");
}

export async function saveTrackingNote({ email, note }) {
  const key = String(email || "")
    .trim()
    .toLowerCase();
  if (!key) throw new Error("Email is required.");
  const next = await writeStore((store) => {
    if (!store.trackingNotes || typeof store.trackingNotes !== "object") store.trackingNotes = {};
    store.trackingNotes[key] = {
      note: String(note || "").trim(),
      updatedAt: new Date().toISOString(),
    };
    return store;
  }, `launch-admin: tracking note ${key}`);
  return next.trackingNotes[key];
}

export async function addDiscountCode(input) {
  const label = String(input.label || "").trim();
  if (!label) throw new Error("Campaign label is required.");
  const amount = Number(input.amount);
  if (!amount || amount <= 0) throw new Error("Enter a valid discount amount.");

  let codeStr = String(input.code || "")
    .trim()
    .toUpperCase();
  if (!codeStr) codeStr = generateDiscountCode(input.prefix || "SPINE");

  let created = null;
  await writeStore((store) => {
    if (!Array.isArray(store.discountCodes)) store.discountCodes = [];
    const exists = store.discountCodes.some((c) => c.code === codeStr);
    if (exists) throw new Error("That code already exists — generate again.");

    const row = normalizeDiscountCode({
      id: crypto.randomBytes(8).toString("hex"),
      code: codeStr,
      label,
      discountType: input.discountType === "fixed" ? "fixed" : "percent",
      amount,
      product: input.product || "any",
      status: "active",
      startsAt: input.startsAt ? new Date(input.startsAt).toISOString() : "",
      expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : "",
      maxUses: Math.max(0, Number(input.maxUses) || 0),
      useCount: 0,
      notes: String(input.notes || "").trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    store.discountCodes.unshift(row);
    created = row;
    return store;
  }, `launch-admin: add discount ${codeStr}`);
  return created;
}

export async function updateDiscountCode(id, patch) {
  let updated = null;
  await writeStore((store) => {
    const i = (store.discountCodes || []).findIndex((c) => c.id === id);
    if (i < 0) throw new Error("Discount code not found.");
    const cur = { ...store.discountCodes[i] };
    if (patch.label != null) cur.label = String(patch.label).trim();
    if (patch.status != null && ["active", "disabled", "expired"].includes(patch.status)) {
      cur.status = patch.status;
    }
    if (patch.notes != null) cur.notes = String(patch.notes).trim();
    if (patch.expiresAt != null) {
      cur.expiresAt = patch.expiresAt ? new Date(patch.expiresAt).toISOString() : "";
    }
    if (patch.useCount != null) cur.useCount = Math.max(0, Number(patch.useCount) || 0);
    cur.updatedAt = new Date().toISOString();
    store.discountCodes[i] = normalizeDiscountCode(cur);
    updated = store.discountCodes[i];
    return store;
  }, `launch-admin: update discount ${id}`);
  return updated;
}

export async function removeDiscountCode(id) {
  await writeStore((store) => {
    store.discountCodes = (store.discountCodes || []).filter((c) => c.id !== id);
    return store;
  }, `launch-admin: remove discount ${id}`);
}

export async function addContact(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const phone = String(input.phone || "").trim();
  if (!name || name.length < 2) throw new Error("Name is required.");
  if (!email && !phone) throw new Error("Email or phone is required.");

  let created = null;
  await writeStore((store) => {
    if (!Array.isArray(store.contacts)) store.contacts = [];
    const row = {
      id: crypto.randomBytes(8).toString("hex"),
      name,
      email,
      phone,
      company: String(input.company || "").trim(),
      notes: String(input.notes || "").trim(),
      tags: Array.isArray(input.tags)
        ? input.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(input.tags || "")
            .split(/[,;]/)
            .map((t) => t.trim())
            .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.contacts.unshift(row);
    created = row;
    return store;
  }, `launch-admin: add contact ${name}`);
  return created;
}

export async function updateContact(id, patch) {
  let updated = null;
  await writeStore((store) => {
    const i = (store.contacts || []).findIndex((c) => c.id === id);
    if (i < 0) throw new Error("Contact not found.");
    const cur = store.contacts[i];
    if (patch.name != null) cur.name = String(patch.name).trim();
    if (patch.email != null) cur.email = String(patch.email).trim().toLowerCase();
    if (patch.phone != null) cur.phone = String(patch.phone).trim();
    if (patch.company != null) cur.company = String(patch.company).trim();
    if (patch.notes != null) cur.notes = String(patch.notes).trim();
    if (patch.tags != null) {
      cur.tags = Array.isArray(patch.tags)
        ? patch.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(patch.tags || "")
            .split(/[,;]/)
            .map((t) => t.trim())
            .filter(Boolean);
    }
    if (!cur.name || (!cur.email && !cur.phone)) throw new Error("Name and email or phone required.");
    cur.updatedAt = new Date().toISOString();
    store.contacts[i] = cur;
    updated = cur;
    return store;
  }, `launch-admin: update contact ${id}`);
  return updated;
}

export async function removeContact(id) {
  await writeStore((store) => {
    store.contacts = (store.contacts || []).filter((c) => c.id !== id);
    return store;
  }, `launch-admin: remove contact ${id}`);
}

export async function saveDistributionFiles(files) {
  return writeStore((store) => {
    const now = new Date().toISOString();
    if (files?.sneakPeek) {
      store.distributionFiles.sneakPeek = {
        ...store.distributionFiles.sneakPeek,
        ...files.sneakPeek,
        updatedAt: now,
      };
    }
    if (files?.fullDigital) {
      store.distributionFiles.fullDigital = {
        ...store.distributionFiles.fullDigital,
        ...files.fullDigital,
        updatedAt: now,
      };
    }
    return store;
  }, "launch-admin: update distribution files");
}

export async function addRecipient(input) {
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  if (!email) throw new Error("Email is required.");
  const name = String(input.name || "").trim();
  if (!name || name.length < 2) throw new Error("Name is required.");

  let created = null;
  await writeStore((store) => {
    const existing = store.recipients.find((r) => r.email === email && !r.removed);
    if (existing) {
      existing.name = name;
      existing.role = input.role || existing.role;
      if (input.format) existing.format = String(input.format).trim();
      if (input.reviewSpot) existing.reviewSpot = String(input.reviewSpot).trim();
      if (input.notes) existing.notes = String(input.notes).trim();
      existing.updatedAt = new Date().toISOString();
      created = existing;
      return store;
    }
    const row = {
      id: crypto.randomBytes(8).toString("hex"),
      name,
      email,
      role: ["arc-applicant", "arc-selected", "launch-list", "giveaway", "manual"].includes(input.role)
        ? input.role
        : "manual",
      format: String(input.format || "").trim(),
      reviewSpot: String(input.reviewSpot || "").trim(),
      notes: String(input.notes || "").trim(),
      removed: false,
      sends: { sneakPeek: null, fullDigital: null, arc: null, selectionArc: null, selectionGiveaway: null, followUps: {} },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appliedAt: String(input.appliedAt || new Date().toISOString()),
    };
    store.recipients.unshift(row);
    created = row;
    return store;
  }, `launch-admin: add recipient ${email}`);
  return created;
}

function nameFromEmail(email) {
  const local = String(email).split("@")[0] || "Reader";
  return local
    .replace(/[._+-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Parse one line: "Jane Doe, jane@x.com" · "Jane <jane@x.com>" · "jane@x.com" */
export function parseBulkRecipientLine(line) {
  const raw = String(line || "").trim();
  if (!raw) return null;

  const angle = raw.match(/^(.+?)\s*<([^>@]+@[^>]+)>$/);
  if (angle) {
    const name = angle[1].trim();
    const email = angle[2].trim().toLowerCase();
    if (name.length >= 2 && email.includes("@")) return { name, email };
  }

  const comma = raw.split(/[,;\t]/).map((s) => s.trim()).filter(Boolean);
  if (comma.length >= 2) {
    const a = comma[0];
    const b = comma[1];
    if (b.includes("@")) return { name: a, email: b.toLowerCase() };
    if (a.includes("@")) return { name: b, email: a.toLowerCase() };
  }

  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    return { name: nameFromEmail(email), email };
  }

  return null;
}

/** Add many people from pasted lines (mail exports, Gumroad, your own notes). */
export async function addRecipientsBulk({ text, role, format, reviewSpot, notes }) {
  const lines = String(text || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error("Paste at least one name and email.");

  const added = [];
  const updated = [];
  const skipped = [];

  for (const line of lines) {
    const parsed = parseBulkRecipientLine(line);
    if (!parsed) {
      skipped.push({ line, reason: "Could not parse name/email" });
      continue;
    }
    try {
      const before = await readLaunchAdminStore();
      const existed = before.recipients.some((r) => r.email === parsed.email && !r.removed);
      const row = await addRecipient({
        ...parsed,
        role,
        format,
        reviewSpot,
        notes,
      });
      if (existed) updated.push(row);
      else added.push(row);
    } catch (err) {
      skipped.push({ line, reason: err.message || "Failed" });
    }
  }

  if (!added.length && !updated.length) {
    throw new Error(skipped[0]?.reason || "No valid entries found.");
  }

  return { added: added.length, updated: updated.length, skipped };
}

/** Log every site form hit — shows in Admin → Launch inbox (no mail digging). */
export async function captureFormSubmission(input) {
  const kind = String(input.kind || "contact").trim();
  const name = String(input.name || "").trim();
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  if (!name || name.length < 2 || !email) return null;

  let submission = null;
  await writeStore((store) => {
    if (!Array.isArray(store.submissions)) store.submissions = [];
    submission = {
      id: crypto.randomBytes(8).toString("hex"),
      kind,
      name,
      email,
      format: String(input.format || "").trim(),
      reviewSpot: String(input.reviewSpot || "").trim(),
      outlet: String(input.outlet || "").trim(),
      deadline: String(input.deadline || "").trim(),
      businessName: String(input.businessName || "").trim(),
      category: String(input.category || "").trim(),
      messagePreview: String(input.messagePreview || "").trim().slice(0, 280),
      receivedAt: new Date().toISOString(),
      status: "new",
      importedRecipientId: "",
      followUpsSent: {},
    };
    store.submissions.unshift(submission);
    if (store.submissions.length > 500) store.submissions = store.submissions.slice(0, 500);
    return store;
  }, `launch-admin: inbox ${kind} ${email}`);

  return submission;
}

/** @deprecated use captureFormSubmission */
export async function captureFormSignup(args) {
  return captureFormSubmission(args);
}

export async function importSubmissions(ids, role) {
  if (!Array.isArray(ids) || !ids.length) throw new Error("Select at least one submission.");
  if (!["arc-applicant", "arc-selected", "launch-list", "giveaway", "manual"].includes(role)) {
    throw new Error("Invalid list type.");
  }

  const imported = [];
  await writeStore((store) => {
    for (const id of ids) {
      const sub = (store.submissions || []).find((s) => s.id === id && s.status === "new");
      if (!sub) continue;

      let recipient = (store.recipients || []).find((r) => r.email === sub.email && !r.removed);
      if (recipient) {
        recipient.name = sub.name || recipient.name;
        recipient.role = role;
        if (sub.format) recipient.format = sub.format;
        if (sub.reviewSpot) recipient.reviewSpot = sub.reviewSpot;
        recipient.notes = [sub.outlet, sub.businessName, sub.messagePreview].filter(Boolean).join(" · ").slice(0, 200);
        recipient.updatedAt = new Date().toISOString();
      } else {
        recipient = {
          id: crypto.randomBytes(8).toString("hex"),
          name: sub.name,
          email: sub.email,
          role,
          format: sub.format || "",
          reviewSpot: sub.reviewSpot || "",
          notes: [sub.outlet, sub.businessName, sub.messagePreview].filter(Boolean).join(" · ").slice(0, 200),
          removed: false,
          sends: { sneakPeek: null, fullDigital: null, arc: null, selectionArc: null, selectionGiveaway: null, followUps: {} },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appliedAt: sub.receivedAt || new Date().toISOString(),
        };
        if (!Array.isArray(store.recipients)) store.recipients = [];
        store.recipients.unshift(recipient);
      }

      sub.status = "imported";
      sub.importedRecipientId = recipient.id;
      imported.push({ submissionId: id, recipientId: recipient.id, email: sub.email });
    }
    return store;
  }, `launch-admin: import ${ids.length} submissions`);

  return imported;
}

export async function dismissSubmissions(ids) {
  if (!Array.isArray(ids) || !ids.length) throw new Error("Select at least one submission.");
  await writeStore((store) => {
    for (const id of ids) {
      const sub = (store.submissions || []).find((s) => s.id === id);
      if (sub && sub.status === "new") sub.status = "dismissed";
    }
    return store;
  }, `launch-admin: dismiss ${ids.length} submissions`);
  return true;
}

export async function updateRecipient(id, patch) {
  let updated = null;
  await writeStore((store) => {
    const i = store.recipients.findIndex((r) => r.id === id);
    if (i < 0) throw new Error("Recipient not found.");
    const cur = store.recipients[i];
    if (patch.name != null) cur.name = String(patch.name).trim();
    if (patch.email != null) cur.email = String(patch.email).trim().toLowerCase();
    if (patch.role != null && ["arc-applicant", "arc-selected", "launch-list", "giveaway", "manual"].includes(patch.role)) {
      cur.role = patch.role;
    }
    if (patch.format != null) cur.format = String(patch.format).trim();
    if (patch.reviewSpot != null) cur.reviewSpot = String(patch.reviewSpot).trim();
    if (patch.notes != null) cur.notes = String(patch.notes).trim();
    cur.updatedAt = new Date().toISOString();
    store.recipients[i] = cur;
    updated = cur;
    return store;
  }, `launch-admin: update recipient ${id}`);
  return updated;
}

export async function removeRecipient(id) {
  await writeStore((store) => {
    store.recipients = store.recipients.filter((r) => r.id !== id);
    return store;
  }, `launch-admin: remove recipient ${id}`);
}

export async function markRecipientSent(id, copyType, meta) {
  let updated = null;
  await writeStore((store) => {
    const i = store.recipients.findIndex((r) => r.id === id);
    if (i < 0) throw new Error("Recipient not found.");
    const cur = store.recipients[i];
    if (!cur.sends) {
      cur.sends = {
        sneakPeek: null,
        fullDigital: null,
        arc: null,
        selectionArc: null,
        selectionGiveaway: null,
        followUps: {},
      };
    }
    if (copyType.startsWith("followUp:")) {
      const key = copyType.slice("followUp:".length);
      if (!cur.sends.followUps || typeof cur.sends.followUps !== "object") cur.sends.followUps = {};
      cur.sends.followUps[key] = {
        sentAt: meta.sentAt || new Date().toISOString(),
        subject: String(meta.subject || "").trim(),
      };
    } else {
      cur.sends[copyType] = {
        sentAt: meta.sentAt || new Date().toISOString(),
        subject: String(meta.subject || "").trim(),
        filePath: String(meta.filePath || "").trim(),
      };
    }
    cur.updatedAt = new Date().toISOString();
    store.recipients[i] = cur;
    updated = cur;
    return store;
  }, `launch-admin: mark sent ${copyType} ${id}`);
  return updated;
}

export async function markSubmissionFollowUpSent(submissionId, followUpKey, meta) {
  await writeStore((store) => {
    const sub = (store.submissions || []).find((s) => s.id === submissionId);
    if (!sub) throw new Error("Submission not found.");
    if (!sub.followUpsSent || typeof sub.followUpsSent !== "object") sub.followUpsSent = {};
    sub.followUpsSent[followUpKey] = {
      sentAt: meta.sentAt || new Date().toISOString(),
      subject: String(meta.subject || "").trim(),
    };
    return store;
  }, `launch-admin: follow-up sent ${followUpKey} submission ${submissionId}`);
}

export async function saveDistributionUpload({ slot, filename, base64, mimeType }) {
  const allowed = ["epub", "pdf", "mobi", "zip"];
  const ext = String(filename || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  const safeExt =
    ext && allowed.includes(ext)
      ? ext
      : mimeType === "application/epub+zip"
        ? "epub"
        : mimeType === "application/pdf"
          ? "pdf"
          : mimeType === "application/x-mobipocket-ebook"
            ? "mobi"
            : mimeType === "application/zip"
              ? "zip"
              : null;
  if (!safeExt) throw new Error("Use EPUB, PDF, MOBI, or ZIP for distribution files.");

  const cleanB64 = String(base64 || "").replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(cleanB64, "base64");
  const maxBytes = 4.2 * 1024 * 1024;
  if (bytes.length > maxBytes) {
    throw new Error(
      "File too large for upload (~4MB max). Put the file in public/distribution/ via Dropbox and paste the path (e.g. /distribution/beautiful-beast.epub)."
    );
  }

  const outName = `${slot}-${Date.now()}.${safeExt}`;
  const relPath = `${UPLOAD_DIR}/${outName}`;
  const publicPath = `/distribution/${outName}`;

  if (token()) {
    await githubPutFile(relPath, cleanB64, null, `launch-admin: upload ${outName}`);
  } else {
    const full = path.join(process.cwd(), relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, bytes);
  }

  const label = slot === "sneakPeek" ? "Extended Sneak Peek" : "Full Digital Copy";
  await saveDistributionFiles({
    [slot]: { path: publicPath, filename: outName, label },
  });

  return { path: publicPath, filename: outName };
}

async function githubPutFile(relPath, base64Content, sha, message) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set.");
  const body = {
    message,
    content: base64Content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${REPO}/contents/${relPath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "silverspine-site",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub file upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

export function resolvePublicFilePath(publicPath) {
  const clean = String(publicPath || "").trim();
  if (!clean.startsWith("/")) return null;
  if (clean.includes("..")) return null;
  const full = path.join(process.cwd(), "public", clean.replace(/^\//, ""));
  if (!fs.existsSync(full)) return null;
  return full;
}
