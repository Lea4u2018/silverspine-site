import { buildTrackingProfiles } from "@/lib/launchActivityLog";

const ROLE_LABELS = {
  "arc-applicant": "ARC applicant",
  "arc-selected": "ARC selected",
  "launch-list": "Launch list",
  giveaway: "Giveaway winner",
  manual: "Manual",
};

const KIND_LABELS = {
  arc: "ARC",
  list: "Launch list",
  contact: "Contact",
  media: "Media",
  sites: "Website",
  neighbor: "Community",
};

function normEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normPhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

/** Merge site people + send list + your manual rolodex entries. */
export function buildContactBook(store) {
  const byKey = new Map();
  const profiles = buildTrackingProfiles(store);

  function upsert(key, patch) {
    const cur = byKey.get(key) || {
      key,
      id: patch.id || key,
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      tags: [],
      sources: [],
      note: "",
      lastActivityAt: "",
      recipientId: "",
      submissionIds: [],
      manual: false,
    };
    byKey.set(key, {
      ...cur,
      ...patch,
      name: patch.name || cur.name,
      email: patch.email || cur.email,
      phone: patch.phone || cur.phone,
      company: patch.company || cur.company,
      note: patch.note || cur.note,
      tags: [...new Set([...(cur.tags || []), ...(patch.tags || [])])],
      sources: [...new Set([...(cur.sources || []), ...(patch.sources || [])])],
      submissionIds: [...new Set([...(cur.submissionIds || []), ...(patch.submissionIds || [])])],
      recipientId: patch.recipientId || cur.recipientId,
    });
  }

  for (const p of profiles) {
    const email = normEmail(p.email);
    const key = email || `profile-${p.recipientId || p.submissionIds[0]}`;
    const tags = [];
    if (p.role) tags.push(ROLE_LABELS[p.role] || p.role);
    if (p.submissionKind) tags.push(KIND_LABELS[p.submissionKind] || p.submissionKind);
    if (p.status === "needs-reply") tags.push("Needs reply");

    upsert(key, {
      id: p.recipientId || key,
      name: p.name,
      email: p.email,
      company: p.businessName || p.outlet || "",
      role: p.role,
      tags,
      sources: p.recipientId ? ["Send list"] : [],
      note: p.note,
      lastActivityAt: p.events[0]?.at || p.lastRequestAt || p.lastSentAt || "",
      recipientId: p.recipientId,
      submissionIds: p.submissionIds,
      submissionKind: p.submissionKind,
      status: p.status,
      events: p.events,
    });
    if (p.submissionIds.length) {
      const row = byKey.get(key);
      if (row && !row.sources.includes("Site form")) row.sources.push("Site form");
    }
  }

  for (const c of store?.contacts || []) {
    const email = normEmail(c.email);
    const phone = normPhone(c.phone);
    const key = email || (phone ? `phone-${phone}` : `manual-${c.id}`);
    upsert(key, {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      note: c.notes || c.note,
      tags: Array.isArray(c.tags) ? c.tags : [],
      sources: ["Rolodex"],
      manual: true,
      lastActivityAt: c.updatedAt || c.createdAt || "",
    });
  }

  return [...byKey.values()].sort((a, b) => {
    const aT = a.lastActivityAt || "";
    const bT = b.lastActivityAt || "";
    return new Date(bT).getTime() - new Date(aT).getTime();
  });
}

export function filterContactBook(contacts, { query, tag }) {
  let rows = Array.isArray(contacts) ? contacts : [];
  if (tag && tag !== "all") {
    rows = rows.filter((c) => (c.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  const q = String(query || "").trim().toLowerCase();
  if (!q) return rows;

  const tokens = q.split(/\s+/).filter(Boolean);
  return rows.filter((c) => {
    const hay = [
      c.name,
      c.email,
      c.phone,
      c.company,
      c.role,
      c.note,
      ...(c.tags || []),
      ...(c.sources || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}

export function contactMailto(contact, subject) {
  const sub = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${contact.email}${sub}`;
}

export function contactTel(contact) {
  const digits = normPhone(contact.phone);
  if (!digits) return "";
  return `tel:+${digits.length === 10 ? "1" : ""}${digits}`;
}
