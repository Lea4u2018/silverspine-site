import { LAUNCH_COUNTDOWN_MATRIX, LAUNCH_COUNTDOWN_TARGETS } from "@/lib/store";
import { defaultEmailTemplates, mergeEmailTemplates } from "@/lib/launchEmailTemplates";
import { normalizeDiscountCode } from "@/lib/discountCodes";

export function defaultLaunchAdminStore() {
  return {
    countdownMatrix: LAUNCH_COUNTDOWN_MATRIX.map((row) => ({ ...row })),
    countdownTargets: LAUNCH_COUNTDOWN_TARGETS.map((row) => ({ ...row })),
    distributionFiles: {
      sneakPeek: {
        label: "Extended Sneak Peek",
        path: "",
        filename: "",
      },
      fullDigital: {
        label: "Full Digital Copy",
        path: "",
        filename: "",
      },
    },
    recipients: [],
    submissions: [],
    emailTemplates: defaultEmailTemplates(),
    trackingNotes: {},
    contacts: [],
    discountCodes: [],
  };
}

export function mergeLaunchAdminStore(data) {
  const defaults = defaultLaunchAdminStore();
  if (!data || typeof data !== "object") return defaults;

  const matrix = Array.isArray(data.countdownMatrix) && data.countdownMatrix.length
    ? data.countdownMatrix
    : defaults.countdownMatrix;
  const targets = Array.isArray(data.countdownTargets) && data.countdownTargets.length
    ? data.countdownTargets
    : defaults.countdownTargets;

  return {
    countdownMatrix: matrix.map((row) => ({
      icon: String(row.icon || "").trim(),
      when: String(row.when || "").trim(),
      title: String(row.title || "").trim(),
      note: String(row.note || "").trim(),
    })),
    countdownTargets: targets.map((row) => ({
      key: String(row.key || "").trim(),
      at: String(row.at || "").trim(),
      label: String(row.label || "").trim(),
      detail: String(row.detail || "").trim(),
      href: String(row.href || "").trim(),
    })),
    distributionFiles: {
      sneakPeek: normalizeFileSlot(data.distributionFiles?.sneakPeek, defaults.distributionFiles.sneakPeek),
      fullDigital: normalizeFileSlot(data.distributionFiles?.fullDigital, defaults.distributionFiles.fullDigital),
    },
    recipients: Array.isArray(data.recipients)
      ? data.recipients.map(normalizeRecipient).filter(Boolean)
      : [],
    submissions: Array.isArray(data.submissions)
      ? data.submissions.map(normalizeSubmission).filter(Boolean)
      : [],
    emailTemplates: mergeEmailTemplates(data.emailTemplates),
    trackingNotes: normalizeTrackingNotes(data.trackingNotes),
    contacts: Array.isArray(data.contacts) ? data.contacts.map(normalizeContact).filter(Boolean) : [],
    discountCodes: Array.isArray(data.discountCodes)
      ? data.discountCodes.map(normalizeDiscountCode).filter(Boolean)
      : [],
  };
}

function normalizeContact(c) {
  if (!c || typeof c !== "object") return null;
  const name = String(c.name || "").trim();
  const email = String(c.email || "")
    .trim()
    .toLowerCase();
  const phone = String(c.phone || "").trim();
  if (!name || (!email && !phone)) return null;
  return {
    id: String(c.id || "").trim(),
    name,
    email,
    phone,
    company: String(c.company || "").trim(),
    notes: String(c.notes || c.note || "").trim(),
    tags: Array.isArray(c.tags) ? c.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    createdAt: String(c.createdAt || "").trim(),
    updatedAt: String(c.updatedAt || "").trim(),
  };
}

function normalizeTrackingNotes(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [email, val] of Object.entries(raw)) {
    const key = String(email).trim().toLowerCase();
    if (!key || !val || typeof val !== "object") continue;
    out[key] = {
      note: String(val.note || "").trim(),
      updatedAt: String(val.updatedAt || "").trim(),
    };
  }
  return out;
}

function normalizeSubmission(s) {
  if (!s || typeof s !== "object") return null;
  const email = String(s.email || "")
    .trim()
    .toLowerCase();
  const name = String(s.name || "").trim();
  if (!name || !email) return null;
  return {
    id: String(s.id || "").trim(),
    kind: String(s.kind || "contact").trim(),
    name,
    email,
    format: String(s.format || "").trim(),
    reviewSpot: String(s.reviewSpot || "").trim(),
    outlet: String(s.outlet || "").trim(),
    deadline: String(s.deadline || "").trim(),
    businessName: String(s.businessName || "").trim(),
    category: String(s.category || "").trim(),
    messagePreview: String(s.messagePreview || "").trim(),
    receivedAt: String(s.receivedAt || "").trim(),
    status: ["new", "imported", "dismissed"].includes(s.status) ? s.status : "new",
    importedRecipientId: String(s.importedRecipientId || "").trim(),
    followUpsSent: normalizeFollowUpsSent(s.followUpsSent),
  };
}

function normalizeFollowUpsSent(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, val] of Object.entries(raw)) {
    if (val && typeof val === "object" && val.sentAt) {
      out[key] = {
        sentAt: String(val.sentAt).trim(),
        subject: String(val.subject || "").trim(),
      };
    }
  }
  return out;
}

function normalizeFileSlot(raw, fallback) {
  if (!raw || typeof raw !== "object") return { ...fallback };
  return {
    label: String(raw.label || fallback.label).trim(),
    path: String(raw.path || "").trim(),
    filename: String(raw.filename || "").trim(),
    updatedAt: String(raw.updatedAt || "").trim(),
  };
}

function normalizeRecipient(r) {
  if (!r || typeof r !== "object") return null;
  const email = String(r.email || "")
    .trim()
    .toLowerCase();
  if (!email) return null;
  return {
    id: String(r.id || "").trim(),
    name: String(r.name || "").trim(),
    email,
    role: ["arc-applicant", "arc-selected", "launch-list", "giveaway", "sneak-peek", "manual"].includes(r.role)
      ? r.role
      : "manual",
    format: String(r.format || "").trim(),
    reviewSpot: String(r.reviewSpot || "").trim(),
    notes: String(r.notes || "").trim(),
    removed: Boolean(r.removed),
    sends: normalizeSends(r.sends),
    createdAt: String(r.createdAt || "").trim(),
    updatedAt: String(r.updatedAt || "").trim(),
    appliedAt: String(r.appliedAt || r.createdAt || "").trim(),
  };
}

function normalizeSends(sends) {
  const base = {
    sneakPeek: null,
    fullDigital: null,
    arc: null,
    selectionArc: null,
    selectionGiveaway: null,
    followUps: {},
  };
  if (!sends || typeof sends !== "object") return base;
  for (const key of ["sneakPeek", "fullDigital", "arc", "selectionArc", "selectionGiveaway"]) {
    const s = sends[key];
    if (s && typeof s === "object" && s.sentAt) {
      base[key] = {
        sentAt: String(s.sentAt).trim(),
        subject: String(s.subject || "").trim(),
        filePath: String(s.filePath || "").trim(),
      };
    }
  }
  if (sends.followUps && typeof sends.followUps === "object") {
    for (const [key, val] of Object.entries(sends.followUps)) {
      if (val && typeof val === "object" && val.sentAt) {
        base.followUps[key] = {
          sentAt: String(val.sentAt).trim(),
          subject: String(val.subject || "").trim(),
        };
      }
    }
  }
  return base;
}
