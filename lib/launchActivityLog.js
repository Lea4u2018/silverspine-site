import { STUDIO_LETTER_CATALOG } from "@/lib/launchEmailTemplates";

const SEND_LABELS = {
  sneakPeek: "File · Sneak peek",
  fullDigital: "File · Full digital",
  arc: "File · ARC delivery",
  selectionArc: "Aug 17 · ARC chosen",
  selectionGiveaway: "Aug 17 · Giveaway winner",
};

export const SUBMISSION_KIND_LABELS = {
  arc: "ARC request",
  list: "Launch list signup",
  contact: "Contact form",
  media: "Media / press",
  sites: "Website inquiry",
  neighbor: "Community request",
};

const ROLE_LABELS = {
  "arc-applicant": "ARC applicant",
  "arc-selected": "ARC selected",
  "launch-list": "Launch list",
  giveaway: "Giveaway winner",
  manual: "Manual",
};

/** Default studio letter to send back for each site form type */
const KIND_DEFAULT_FOLLOWUP = {
  arc: "arcApplicationReceived",
  list: "launchListWelcome",
  contact: "contactGeneral",
  media: "mediaPress",
  sites: "websiteInquiry",
  neighbor: "neighborReceived",
};

const ROLE_EXTRA_FOLLOWUPS = {
  "arc-applicant": ["arcNotSelected"],
  "arc-selected": ["arcDeliveryReminder"],
  "launch-list": ["launchListDrawing"],
  giveaway: ["releaseDay"],
};

function followUpLabel(key) {
  const item = STUDIO_LETTER_CATALOG.find((c) => c.group === "followUp" && c.key === key);
  return item?.label || `Follow-up · ${key}`;
}

function formatWhen(iso) {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function pushEvent(entries, base, event) {
  entries.push({ ...base, ...event });
}

/** Flat timeline of every site request and admin email send — for Admin search. */
export function buildLaunchActivityLog(store) {
  const entries = [];

  for (const r of store?.recipients || []) {
    if (r.removed) continue;
    const base = {
      name: r.name,
      email: r.email,
      personId: r.id,
      recordType: "recipient",
      source: "Send list",
    };

    for (const [key, val] of Object.entries(r.sends?.followUps || {})) {
      if (!val?.sentAt) continue;
      pushEvent(entries, base, {
        id: `r-${r.id}-fu-${key}`,
        kind: "sent",
        at: val.sentAt,
        subject: val.subject || "",
        label: followUpLabel(key),
        detail: ROLE_LABELS[r.role] || r.role,
        followUpKey: key,
      });
    }

    for (const key of ["sneakPeek", "fullDigital", "arc", "selectionArc", "selectionGiveaway"]) {
      const val = r.sends?.[key];
      if (!val?.sentAt) continue;
      pushEvent(entries, base, {
        id: `r-${r.id}-${key}`,
        kind: "sent",
        at: val.sentAt,
        subject: val.subject || "",
        label: SEND_LABELS[key] || key,
        detail: val.filePath ? `Attachment: ${val.filePath}` : "",
        sendKey: key,
      });
    }

    const applied = r.appliedAt || r.createdAt;
    if (applied) {
      pushEvent(entries, base, {
        id: `r-${r.id}-list`,
        kind: "request",
        at: applied,
        subject: "",
        label: "On send list",
        detail: ROLE_LABELS[r.role] || r.role,
      });
    }
  }

  for (const s of store?.submissions || []) {
    const base = {
      name: s.name,
      email: s.email,
      personId: s.id,
      recordType: "submission",
      source: "Site form",
      submissionKind: s.kind,
    };

    if (s.receivedAt) {
      pushEvent(entries, base, {
        id: `s-${s.id}-req`,
        kind: "request",
        at: s.receivedAt,
        subject: "",
        label: SUBMISSION_KIND_LABELS[s.kind] || s.kind,
        detail: [s.businessName, s.outlet, s.status].filter(Boolean).join(" · "),
      });
    }

    for (const [key, val] of Object.entries(s.followUpsSent || {})) {
      if (!val?.sentAt) continue;
      pushEvent(entries, base, {
        id: `s-${s.id}-fu-${key}`,
        kind: "sent",
        at: val.sentAt,
        subject: val.subject || "",
        label: followUpLabel(key),
        detail: SUBMISSION_KIND_LABELS[s.kind] || s.kind,
        followUpKey: key,
      });
    }
  }

  entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return entries;
}

/** One row per email — timeline, status, and who to reply to. */
export function buildTrackingProfiles(store) {
  const byEmail = new Map();
  const events = buildLaunchActivityLog(store);

  function ensure(email, name) {
    const key = String(email || "")
      .trim()
      .toLowerCase();
    if (!key) return null;
    if (!byEmail.has(key)) {
      byEmail.set(key, {
        email: key,
        name: name || "",
        recipientId: "",
        submissionIds: [],
        role: "",
        submissionKind: "",
        businessName: "",
        outlet: "",
        events: [],
        lastRequestAt: null,
        lastSentAt: null,
        status: "unknown",
        note: String(store?.trackingNotes?.[key]?.note || "").trim(),
        noteUpdatedAt: store?.trackingNotes?.[key]?.updatedAt || "",
      });
    }
    const p = byEmail.get(key);
    if (name && name.length > (p.name || "").length) p.name = name;
    return p;
  }

  for (const r of store?.recipients || []) {
    if (r.removed) continue;
    const p = ensure(r.email, r.name);
    if (!p) continue;
    p.recipientId = r.id;
    p.role = r.role || p.role;
    if (r.notes) p.detail = r.notes;
  }

  for (const s of store?.submissions || []) {
    const p = ensure(s.email, s.name);
    if (!p) continue;
    if (!p.submissionIds.includes(s.id)) p.submissionIds.push(s.id);
    if (s.kind) p.submissionKind = s.kind;
    if (s.businessName) p.businessName = s.businessName;
    if (s.outlet) p.outlet = s.outlet;
  }

  for (const e of events) {
    const p = ensure(e.email, e.name);
    if (!p) continue;
    p.events.push(e);
    if (e.kind === "request") {
      if (!p.lastRequestAt || new Date(e.at) > new Date(p.lastRequestAt)) p.lastRequestAt = e.at;
    }
    if (e.kind === "sent") {
      if (!p.lastSentAt || new Date(e.at) > new Date(p.lastSentAt)) p.lastSentAt = e.at;
    }
  }

  for (const p of byEmail.values()) {
    p.events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    if (!p.lastRequestAt && !p.lastSentAt) p.status = "unknown";
    else if (!p.lastSentAt || (p.lastRequestAt && new Date(p.lastRequestAt) > new Date(p.lastSentAt))) {
      p.status = "needs-reply";
    } else if (p.lastSentAt) {
      p.status = "sent";
    } else {
      p.status = "request-only";
    }
  }

  return [...byEmail.values()].sort((a, b) => {
    const aT = a.events[0]?.at || "";
    const bT = b.events[0]?.at || "";
    return new Date(bT).getTime() - new Date(aT).getTime();
  });
}

export function replyOptionsForProfile(profile) {
  const options = [];
  const seen = new Set();

  const addFollowUp = (key, label) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push({ type: "follow-up", followUpKey: key, label: label || followUpLabel(key) });
  };

  if (profile.submissionKind && KIND_DEFAULT_FOLLOWUP[profile.submissionKind]) {
    addFollowUp(KIND_DEFAULT_FOLLOWUP[profile.submissionKind]);
  }
  if (profile.role && ROLE_EXTRA_FOLLOWUPS[profile.role]) {
    for (const key of ROLE_EXTRA_FOLLOWUPS[profile.role]) addFollowUp(key);
  }
  if (profile.submissionKind === "neighbor") {
    addFollowUp("neighborApproved");
    addFollowUp("neighborDeclined");
  }
  addFollowUp("contactGeneral", "Follow-up · General reply");

  const lastSubject = profile.events.find((e) => e.kind === "sent" && e.subject)?.subject || "";
  options.unshift({
    type: "mailto",
    label: "Reply in mail app",
    subject: lastSubject ? `Re: ${lastSubject.replace(/^Re:\s*/i, "")}` : "",
  });

  return options;
}

export function filterTrackingProfiles(profiles, { query, status }) {
  let rows = Array.isArray(profiles) ? profiles : [];
  if (status === "needs-reply") rows = rows.filter((p) => p.status === "needs-reply");
  if (status === "sent") rows = rows.filter((p) => p.status === "sent");

  const q = String(query || "").trim().toLowerCase();
  if (!q) return rows.slice(0, 60);

  const tokens = q.split(/\s+/).filter(Boolean);
  return rows
    .filter((p) => {
      const hay = [
        p.name,
        p.email,
        p.role,
        p.submissionKind,
        p.businessName,
        p.outlet,
        p.note,
        p.status,
        ...p.events.flatMap((e) => [e.label, e.subject, e.detail, formatWhen(e.at)]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => hay.includes(t));
    })
    .slice(0, 80);
}

export function filterActivityLog(entries, { query, kind }) {
  let rows = Array.isArray(entries) ? entries : [];
  if (kind === "request") rows = rows.filter((e) => e.kind === "request");
  if (kind === "sent") rows = rows.filter((e) => e.kind === "sent");

  const q = String(query || "").trim().toLowerCase();
  if (!q) return rows.slice(0, 100);

  const tokens = q.split(/\s+/).filter(Boolean);
  return rows
    .filter((e) => {
      const hay = [
        e.name,
        e.email,
        e.subject,
        e.label,
        e.detail,
        e.source,
        e.at,
        formatWhen(e.at),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => hay.includes(t));
    })
    .slice(0, 250);
}
