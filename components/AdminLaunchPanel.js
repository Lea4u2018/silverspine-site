import { useCallback, useEffect, useMemo, useState } from "react";
import { ARC_TEAM_SIZE } from "@/lib/store";
import { formatCountdownLabel, formatCountdownParts, getNextLaunchCountdown } from "@/lib/launchCountdown";
import FormFieldLabel, { FormRequiredNote, RequiredMark } from "@/components/FormFieldLabel";
import {
  STUDIO_LETTER_CATALOG,
  catalogEntry,
  personMatchesLetter,
} from "@/lib/launchEmailTemplates";
import { buildLaunchActivityLog, buildTrackingProfiles, filterActivityLog, filterTrackingProfiles, replyOptionsForProfile } from "@/lib/launchActivityLog";
import { buildContactBook, contactMailto, contactTel, filterContactBook } from "@/lib/launchContactBook";

const GOLD = "#a77a23";

const ROLE_LABELS = {
  "arc-applicant": "ARC applicant",
  "arc-selected": "ARC selected",
  "launch-list": "Launch list",
  giveaway: "Giveaway winner",
  "sneak-peek": "Sneak Peek",
  manual: "Manual",
};

const COPY_TYPES = [
  { id: "sneakPeek", label: "Extended Sneak Peek" },
  { id: "fullDigital", label: "Full digital copy" },
  { id: "arc", label: "ARC delivery (uses full digital file)" },
];

const SUBMISSION_KIND_LABELS = {
  arc: "ARC request",
  list: "Launch list",
  contact: "Contact",
  media: "Media / press",
  sites: "Website inquiry",
  neighbor: "Community",
};

const INBOX_FILTERS = [
  { id: "all", label: "All new" },
  { id: "arc", label: "ARC" },
  { id: "list", label: "Launch list" },
  { id: "contact", label: "Contact" },
  { id: "media", label: "Media" },
  { id: "neighbor", label: "Community" },
];

function formatWhen(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function StatusChip({ status }) {
  if (status === "needs-reply") {
    return <span className="text-[10px] uppercase font-bold text-amber-400">Needs reply</span>;
  }
  if (status === "sent") {
    return <span className="text-[10px] uppercase font-bold text-emerald-400">Emailed</span>;
  }
  return <span className="text-[10px] uppercase font-bold text-gray-500">On file</span>;
}

function SendBadge({ sent }) {
  if (!sent?.sentAt) {
    return <span className="text-gray-500">Not sent</span>;
  }
  return (
    <span className="text-emerald-400" title={sent.subject || ""}>
      Sent {formatWhen(sent.sentAt)}
    </span>
  );
}

export default function AdminLaunchPanel({ adminRole = "owner" }) {
  const isOwner = adminRole !== "assistant";
  const [store, setStore] = useState(null);
  const [storage, setStorage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState({});
  const [copyType, setCopyType] = useState("arc");
  const [uploading, setUploading] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all");
  const [inboxSelected, setInboxSelected] = useState({});

  const [matrix, setMatrix] = useState([]);
  const [targets, setTargets] = useState([]);
  const [files, setFiles] = useState({ sneakPeek: {}, fullDigital: {} });

  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("arc-selected");
  const [addFormat, setAddFormat] = useState("");
  const [addReviewSpot, setAddReviewSpot] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkRole, setBulkRole] = useState("arc-selected");
  const [showBulk, setShowBulk] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState(null);
  const [templateTab, setTemplateTab] = useState("followUp-arcApplicationReceived");
  const [letterSendSelected, setLetterSendSelected] = useState({});
  const [letterSendFilter, setLetterSendFilter] = useState("suggested");
  const [logSearch, setLogSearch] = useState("");
  const [logKindFilter, setLogKindFilter] = useState("all");
  const [logViewMode, setLogViewMode] = useState("people");
  const [logStatusFilter, setLogStatusFilter] = useState("all");
  const [noteDrafts, setNoteDrafts] = useState({});
  const [expandedProfile, setExpandedProfile] = useState("");
  const [rolodexTagFilter, setRolodexTagFilter] = useState("all");
  const [editingContactId, setEditingContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactTags, setContactTags] = useState("");

  const activeLetter = useMemo(() => catalogEntry(templateTab), [templateTab]);

  const activityLog = useMemo(() => buildLaunchActivityLog(store), [store]);
  const trackingProfiles = useMemo(() => buildTrackingProfiles(store), [store]);

  const filteredActivityLog = useMemo(
    () => filterActivityLog(activityLog, { query: logSearch, kind: logKindFilter }),
    [activityLog, logSearch, logKindFilter]
  );

  const filteredProfiles = useMemo(
    () => filterTrackingProfiles(trackingProfiles, { query: logSearch, status: logStatusFilter }),
    [trackingProfiles, logSearch, logStatusFilter]
  );

  const contactBook = useMemo(() => buildContactBook(store), [store]);

  const filteredContacts = useMemo(
    () => filterContactBook(contactBook, { query: logSearch, tag: rolodexTagFilter }),
    [contactBook, logSearch, rolodexTagFilter]
  );

  const rolodexTags = useMemo(() => {
    const tags = new Set();
    for (const c of contactBook) {
      for (const t of c.tags || []) tags.add(t);
    }
    return [...tags].sort();
  }, [contactBook]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/launch");
    const data = await res.json();
    if (res.status === 401) {
      setMsg("Session expired — log in again.");
      return;
    }
    if (!res.ok || !data.ok) {
      setMsg(data.error || "Could not load launch admin.");
      return;
    }
    setStore(data);
    setStorage(data.storage || "");
    setMatrix(Array.isArray(data.countdownMatrix) ? data.countdownMatrix : []);
    setTargets(Array.isArray(data.countdownTargets) ? data.countdownTargets : []);
    setFiles(data.distributionFiles || { sneakPeek: {}, fullDigital: {} });
    setEmailTemplates(data.emailTemplates || null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recipients = useMemo(() => {
    const rows = Array.isArray(store?.recipients) ? store.recipients.filter((r) => !r.removed) : [];
    if (filter === "all") return rows;
    if (filter === "arc-applicant") return rows.filter((r) => r.role === "arc-applicant");
    if (filter === "arc-selected") return rows.filter((r) => r.role === "arc-selected");
    if (filter === "launch-list") return rows.filter((r) => r.role === "launch-list");
    if (filter === "giveaway") return rows.filter((r) => r.role === "giveaway");
    if (filter === "sneak-peek") {
      return rows.filter((r) => r.role === "sneak-peek" || r.sends?.sneakPeek?.sentAt);
    }
    return rows;
  }, [store, filter]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const inboxRows = useMemo(() => {
    const rows = Array.isArray(store?.submissions)
      ? store.submissions.filter((s) => s.status === "new")
      : [];
    if (inboxFilter === "all") return rows;
    if (inboxFilter === "contact") return rows.filter((s) => s.kind === "contact" || s.kind === "sites");
    if (inboxFilter === "media") return rows.filter((s) => s.kind === "media");
    return rows.filter((s) => s.kind === inboxFilter);
  }, [store, inboxFilter]);

  const inboxSelectedIds = useMemo(
    () => Object.keys(inboxSelected).filter((id) => inboxSelected[id]),
    [inboxSelected]
  );

  const allRecipients = useMemo(
    () => (Array.isArray(store?.recipients) ? store.recipients.filter((r) => !r.removed) : []),
    [store]
  );

  const allSubmissions = useMemo(
    () => (Array.isArray(store?.submissions) ? store.submissions : []),
    [store]
  );

  const letterSendRows = useMemo(() => {
    const entry = activeLetter;
    const rows = [];
    const seenEmails = new Set();
    const notes = store?.trackingNotes || {};

    const hubSentFor = (email) => {
      const n = notes[String(email || "").trim().toLowerCase()];
      if (!n?.emailedAt) return null;
      return { sentAt: n.emailedAt, subject: n.emailedSubject || "Marked emailed (outside Admin)" };
    };

    for (const r of allRecipients) {
      const suggested = personMatchesLetter(entry, { role: r.role, kind: "" });
      if (letterSendFilter === "suggested" && !suggested) continue;
      if (letterSendFilter === "inbox") continue;
      const letterSent =
        entry.group === "followUp"
          ? r.sends?.followUps?.[entry.key]
          : entry.group === "selection"
            ? r.sends?.[entry.selectionType === "giveawayWinner" ? "selectionGiveaway" : "selectionArc"]
            : r.sends?.[entry.copyType];
      const sent = letterSent?.sentAt ? letterSent : hubSentFor(r.email);
      if (letterSendFilter === "sent" && !sent?.sentAt) continue;
      const rowId = `r_${r.id}`;
      rows.push({
        rowId,
        source: "recipient",
        id: r.id,
        name: r.name,
        email: r.email,
        detail: ROLE_LABELS[r.role] || r.role,
        suggested,
        sent,
      });
      seenEmails.add(r.email);
    }

    if (letterSendFilter !== "list") {
      for (const s of allSubmissions) {
        if (!s.email || seenEmails.has(s.email)) continue;
        const suggested = personMatchesLetter(entry, { role: "", kind: s.kind });
        if (letterSendFilter === "suggested" && !suggested) continue;
        const letterSent = s.followUpsSent?.[entry.key];
        const sent = letterSent?.sentAt ? letterSent : hubSentFor(s.email);
        if (letterSendFilter === "sent" && !sent?.sentAt) continue;
        const rowId = `s_${s.id}`;
        rows.push({
          rowId,
          source: "submission",
          id: s.id,
          name: s.name,
          email: s.email,
          detail: `${SUBMISSION_KIND_LABELS[s.kind] || s.kind}${s.status !== "new" ? ` · ${s.status}` : " · inbox"}`,
          suggested,
          sent,
        });
      }
    }

    return rows;
  }, [activeLetter, allRecipients, allSubmissions, letterSendFilter, store]);

  const letterSendChecked = useMemo(
    () => Object.keys(letterSendSelected).filter((k) => letterSendSelected[k]),
    [letterSendSelected]
  );

  const livePreview = useMemo(() => {
    if (!targets.length) return null;
    const fakeGetNext = (now) => {
      const t = typeof now === "number" ? now : now.getTime();
      for (const target of targets) {
        const at = new Date(target.at).getTime();
        if (at > t) return { target, remainingMs: at - t, allPast: false };
      }
      return { target: null, remainingMs: 0, allPast: true };
    };
    const { target, remainingMs, allPast } = fakeGetNext(Date.now());
    if (allPast) return "All countdown targets are in the past.";
    const parts = formatCountdownParts(remainingMs);
    return `${target.label} · ${formatCountdownLabel(parts)}`;
  }, [targets]);

  const post = async (payload) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || data.errors?.[0]?.error || "Action failed.");
        if (data.count != null || data.sent != null) {
          await load();
        }
        return data;
      }
      if (data.count != null) {
        setMsg(`Done — ${data.count} updated.`);
      } else if (data.sent != null) {
        setMsg(`Emailed ${data.sent} recipient${data.sent === 1 ? "" : "s"}.`);
      } else if (payload.action === "mark-emailed") {
        setMsg("Marked emailed.");
      } else {
        setMsg("Saved.");
      }
      await load();
      return data;
    } catch {
      setMsg("Network error.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const saveCountdown = async () => {
    await post({ action: "save-countdown", countdownMatrix: matrix, countdownTargets: targets });
  };

  const saveFiles = async () => {
    await post({ action: "save-files", files });
  };

  const onUpload = async (slot, file) => {
    if (!file) return;
    setUploading(slot);
    setMsg("");
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload-file",
          slot,
          filename: file.name,
          mimeType: file.type,
          base64,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Upload failed.");
        return;
      }
      setMsg(`Uploaded ${data.path}`);
      await load();
    } catch (err) {
      setMsg(err?.message || "Upload failed.");
    } finally {
      setUploading("");
    }
  };

  const toggleAll = (on) => {
    const next = {};
    for (const r of recipients) next[r.id] = on;
    setSelected(next);
  };

  const addPerson = async (e) => {
    e.preventDefault();
    const data = await post({
      action: "add-recipient",
      name: addName,
      email: addEmail,
      role: addRole,
      format: addFormat,
      reviewSpot: addReviewSpot,
      notes: addNotes,
    });
    if (data?.ok) {
      setMsg(`Added ${addName} to ${ROLE_LABELS[addRole] || addRole}.`);
      setAddName("");
      setAddEmail("");
      setAddFormat("");
      setAddReviewSpot("");
      setAddNotes("");
    }
  };

  const addBulk = async (e) => {
    e.preventDefault();
    const data = await post({
      action: "add-recipients-bulk",
      text: bulkText,
      role: bulkRole,
      format: addFormat,
      reviewSpot: addReviewSpot,
    });
    if (data?.ok) {
      setMsg(
        `Bulk add: ${data.added || 0} new, ${data.updated || 0} updated${
          data.skipped?.length ? `, ${data.skipped.length} skipped` : ""
        }.`
      );
      setBulkText("");
    }
  };

  const saveTemplates = async () => {
    if (!emailTemplates) return;
    await post({ action: "save-templates", emailTemplates });
  };

  const sendSelectionNotice = async (kind, idsOverride) => {
    const isGiveaway = kind === "giveawayWinner";
    const ids =
      idsOverride ||
      (selectedIds.length
        ? selectedIds
        : recipients
            .filter((r) => (isGiveaway ? r.role === "giveaway" : r.role === "arc-selected"))
            .map((r) => r.id));
    if (!ids.length) {
      setMsg("No matching people on the list — add manually or import first.");
      return;
    }
    const label = isGiveaway ? "Giveaway winner" : "ARC selected (Aug 17)";
    if (!window.confirm(`Send “${label}” notice to ${ids.length} person${ids.length === 1 ? "" : "s"}?`)) return;
    await post({
      action: "send-notice",
      noticeType: isGiveaway ? "giveawayWinner" : "selectionArc",
      ids,
    });
    setSelected({});
  };

  const checkSuggestedLetterRecipients = () => {
    const next = {};
    for (const row of letterSendRows) {
      if (row.suggested) next[row.rowId] = true;
    }
    setLetterSendSelected(next);
  };

  const sendCheckedLetter = async () => {
    const entry = activeLetter;
    const recipientIds = [];
    const submissionIds = [];
    for (const rowId of letterSendChecked) {
      if (rowId.startsWith("r_")) recipientIds.push(rowId.slice(2));
      else if (rowId.startsWith("s_")) submissionIds.push(rowId.slice(2));
    }
    if (!recipientIds.length && !submissionIds.length) {
      setMsg("Check at least one person below.");
      return;
    }
    const total = recipientIds.length + submissionIds.length;
    if (
      !window.confirm(
        `Send “${entry.label}” to ${total} person${total === 1 ? "" : "s"}?\n\nThis uses the letter text shown above.`
      )
    ) {
      return;
    }

    if (entry.group === "followUp") {
      await post({
        action: "send-follow-up",
        followUpKey: entry.key,
        recipientIds,
        submissionIds,
      });
      setLetterSendSelected({});
      return;
    }

    if (!isOwner) {
      setMsg("File sends and selection notices are owner-only — use follow-up letters instead.");
      return;
    }

    if (entry.group === "selection") {
      if (submissionIds.length) {
        setMsg("Selection notices can only go to people on your send list — import inbox entries first.");
        return;
      }
      await post({
        action: "send-notice",
        noticeType: entry.selectionType === "giveawayWinner" ? "giveawayWinner" : "selectionArc",
        ids: recipientIds,
      });
      setLetterSendSelected({});
      return;
    }

    if (entry.group === "distribution") {
      if (submissionIds.length) {
        setMsg("File sends can only go to people on your send list — import inbox entries first.");
        return;
      }
      await post({
        action: "send-copies",
        copyType: entry.copyType,
        ids: recipientIds,
      });
      setLetterSendSelected({});
    }
  };

  const markArcSelected = async () => {
    if (!selectedIds.length) {
      setMsg("Select people first.");
      return;
    }
    await post({ action: "select-arc", ids: selectedIds });
    setSelected({});
  };

  const markSneakPeekSent = async () => {
    if (!selectedIds.length) {
      setMsg("Select people first.");
      return;
    }
    await post({ action: "mark-copy-sent", copyType: "sneakPeek", ids: selectedIds });
    setSelected({});
  };

  const sendCopies = async () => {
    if (!selectedIds.length) {
      setMsg("Select at least one person to email.");
      return;
    }
    const label = COPY_TYPES.find((c) => c.id === copyType)?.label || copyType;
    if (
      !window.confirm(
        `Send “${label}” to ${selectedIds.length} person${selectedIds.length === 1 ? "" : "s"}?\n\nThis emails the attached file from your distribution settings.`
      )
    ) {
      return;
    }
    await post({ action: "send-copies", copyType, ids: selectedIds });
    setSelected({});
  };

  const removePerson = async (id, name) => {
    if (!window.confirm(`Remove ${name} from this list?`)) return;
    await post({ action: "remove-recipient", id });
  };

  const toggleInboxAll = (on) => {
    const next = {};
    for (const s of inboxRows) next[s.id] = on;
    setInboxSelected(next);
  };

  const importInbox = async (role) => {
    const ids = inboxSelectedIds.length ? inboxSelectedIds : inboxRows.map((s) => s.id);
    if (!ids.length) {
      setMsg("No submissions to import.");
      return;
    }
    await post({ action: "import-submissions", ids, role });
    setInboxSelected({});
  };

  const importOne = async (id, role) => {
    await post({ action: "import-submissions", ids: [id], role });
    setInboxSelected((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  };

  const dismissInbox = async () => {
    const ids = inboxSelectedIds.length ? inboxSelectedIds : [];
    if (!ids.length) {
      setMsg("Select submissions to dismiss.");
      return;
    }
    await post({ action: "dismiss-submissions", ids });
    setInboxSelected({});
  };

  const profileForContact = (contact) => ({
    name: contact.name,
    email: contact.email,
    recipientId: contact.recipientId || "",
    submissionIds: contact.submissionIds || [],
    submissionKind: contact.submissionKind || "",
    role: contact.role || "",
    events: contact.events || [],
    note: contact.note,
  });

  const sendProfileFollowUp = async (profile, followUpKey, label) => {
    const recipientIds = profile.recipientId ? [profile.recipientId] : [];
    const submissionIds = profile.submissionIds || [];
    if (!recipientIds.length && !submissionIds.length) {
      setMsg("Add them to the send list first, or use Reply in mail app.");
      return;
    }
    if (!window.confirm(`Send “${label}” to ${profile.name}?`)) return;
    await post({
      action: "send-follow-up",
      followUpKey,
      recipientIds,
      submissionIds,
    });
  };

  const saveProfileNote = async (profile) => {
    if (!profile.email) {
      setMsg("Need an email to save a tracking note.");
      return;
    }
    const note = noteDrafts[profile.email] ?? profile.note ?? "";
    await post({ action: "save-tracking-note", email: profile.email, note });
  };

  const markProfileEmailed = async (profile) => {
    if (!profile.email) {
      setMsg("Need an email to mark as emailed.");
      return;
    }
    await post({ action: "mark-emailed", email: profile.email, name: profile.name });
  };

  const clearContactForm = () => {
    setEditingContactId("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactCompany("");
    setContactNotes("");
    setContactTags("");
  };

  const startEditContact = (c) => {
    if (!c.manual) {
      setMsg("Site contacts are edited via notes below — use Add contact for pure rolodex entries.");
      return;
    }
    setEditingContactId(c.id);
    setContactName(c.name);
    setContactEmail(c.email);
    setContactPhone(c.phone);
    setContactCompany(c.company);
    setContactNotes(c.note);
    setContactTags((c.tags || []).join(", "));
  };

  const saveRolodexContact = async (e) => {
    e.preventDefault();
    const payload = {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      company: contactCompany,
      notes: contactNotes,
      tags: contactTags,
    };
    if (editingContactId) {
      const data = await post({ action: "update-contact", id: editingContactId, ...payload });
      if (data?.ok) {
        setMsg(`Updated ${contactName} in rolodex.`);
        clearContactForm();
      }
      return;
    }
    const data = await post({ action: "add-contact", ...payload });
    if (data?.ok) {
      setMsg(`Added ${contactName} to rolodex.`);
      clearContactForm();
    }
  };

  const deleteRolodexContact = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your rolodex?`)) return;
    await post({ action: "remove-contact", id });
    if (editingContactId === id) clearContactForm();
  };

  if (!store) {
    return <p className="text-gray-400 text-sm">Loading launch admin…</p>;
  }

  const arcSelectedCount = (store.recipients || []).filter((r) => r.role === "arc-selected" && !r.removed).length;

  return (
    <div className="space-y-8">
      {msg ? <p className="text-sm text-gray-300 rounded-lg border border-white/10 bg-black/40 px-4 py-3">{msg}</p> : null}

      <section className="rounded-2xl border border-emerald-400/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1 text-emerald-300">1. Contact hub — tracking, replies &amp; rolodex</h2>
        <p className="text-sm text-gray-400 mb-4">
          Search anyone by name, email, phone, or subject. See when they wrote in, when you emailed them, jot call
          notes, send a studio letter, or pull them up later from your contact book.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "people", label: "By person" },
            { id: "timeline", label: "Timeline" },
            { id: "rolodex", label: "Contact book" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLogViewMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                logViewMode === tab.id
                  ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                  : "border-white/15 text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input
              type="search"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Name, email, phone, company, subject, or date"
              className="w-full rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
            />
          </div>
          {logViewMode === "people" ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="w-full lg:w-auto rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
              >
                <option value="all">All people</option>
                <option value="needs-reply">Needs reply</option>
                <option value="sent">Already emailed</option>
              </select>
            </div>
          ) : null}
          {logViewMode === "timeline" ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Events</label>
              <select
                value={logKindFilter}
                onChange={(e) => setLogKindFilter(e.target.value)}
                className="w-full lg:w-auto rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
              >
                <option value="all">All events</option>
                <option value="request">Requests only</option>
                <option value="sent">Sends only</option>
              </select>
            </div>
          ) : null}
          {logViewMode === "rolodex" && rolodexTags.length ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tag</label>
              <select
                value={rolodexTagFilter}
                onChange={(e) => setRolodexTagFilter(e.target.value)}
                className="w-full lg:w-auto rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
              >
                <option value="all">All tags</option>
                {rolodexTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {logViewMode === "people" ? (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {filteredProfiles.length} person{filteredProfiles.length === 1 ? "" : "s"}
              {logStatusFilter === "needs-reply" ? " waiting on a reply" : ""}
            </p>
            {filteredProfiles.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No matches — try a name, email, or phone fragment.</p>
            ) : (
              <div className="space-y-3 max-h-[min(60vh,560px)] overflow-y-auto pr-1">
                {filteredProfiles.map((profile) => {
                  const open = expandedProfile === profile.email;
                  const profileNote = noteDrafts[profile.email] ?? profile.note ?? "";
                  const replies = replyOptionsForProfile(profile);
                  return (
                    <article
                      key={profile.email}
                      className="rounded-xl border border-white/10 bg-black/45 overflow-hidden"
                    >
                      <div className="flex flex-wrap items-start gap-2 px-4 py-3 hover:bg-white/5">
                        <button
                          type="button"
                          onClick={() => setExpandedProfile(open ? "" : profile.email)}
                          className="flex-1 min-w-[200px] text-left"
                        >
                          <p className="font-semibold text-gray-100">
                            {profile.name}{" "}
                            <StatusChip status={profile.status} />
                          </p>
                          <p className="text-sm text-[#a77a23] break-all">{profile.email}</p>
                          {profile.businessName || profile.outlet ? (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {[profile.businessName, profile.outlet].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                        </button>
                        <div className="text-xs text-gray-500 shrink-0 flex flex-col items-end gap-2">
                          {profile.lastRequestAt ? (
                            <p>Requested {formatWhen(profile.lastRequestAt)}</p>
                          ) : null}
                          {profile.lastSentAt ? <p>Last sent {formatWhen(profile.lastSentAt)}</p> : null}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => markProfileEmailed(profile)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50"
                          >
                            Mark emailed
                          </button>
                        </div>
                      </div>
                      {open ? (
                        <div className="px-4 pb-4 pt-0 border-t border-white/10 space-y-3">
                          <div className="flex flex-wrap gap-2 pt-3">
                            {replies.map((opt) =>
                              opt.type === "mailto" ? (
                                <a
                                  key={opt.label}
                                  href={contactMailto(profile, opt.subject)}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-[#a77a23]/50 text-[#f5edd7] hover:bg-[#a77a23]/15"
                                >
                                  {opt.label}
                                </a>
                              ) : (
                                <button
                                  key={opt.followUpKey}
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    sendProfileFollowUp(profile, opt.followUpKey, opt.label)
                                  }
                                  className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50"
                                >
                                  Send · {opt.label.replace(/^Follow-up · /, "")}
                                </button>
                              )
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Call / tracking note</label>
                            <textarea
                              value={profileNote}
                              onChange={(e) =>
                                setNoteDrafts((d) => ({ ...d, [profile.email]: e.target.value }))
                              }
                              rows={2}
                              placeholder="e.g. Called 8/14 — resending ARC, check spam folder"
                              className="w-full rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => saveProfileNote(profile)}
                              className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-300"
                            >
                              Save note
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs uppercase tracking-wider text-gray-500">History</p>
                            {profile.events.slice(0, 8).map((ev) => (
                              <div key={ev.id} className="text-xs text-gray-400 flex flex-wrap gap-2">
                                <span className="text-gray-500 whitespace-nowrap">{formatWhen(ev.at)}</span>
                                <span className={ev.kind === "sent" ? "text-emerald-400" : "text-sky-400"}>
                                  {ev.kind === "sent" ? "Sent" : "Request"}
                                </span>
                                <span>{ev.label}</span>
                                {ev.subject ? <span className="text-gray-600">— {ev.subject}</span> : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        {logViewMode === "timeline" ? (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {logSearch.trim()
                ? `${filteredActivityLog.length} match${filteredActivityLog.length === 1 ? "" : "es"}`
                : `Latest ${Math.min(filteredActivityLog.length, 100)} of ${activityLog.length} events`}
            </p>
            {filteredActivityLog.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No events match this search.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10 max-h-[min(50vh,420px)] overflow-y-auto">
                <table className="w-full text-sm text-left min-w-[820px]">
                  <thead className="bg-black/70 text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Event / subject</th>
                      <th className="px-3 py-2">Reply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivityLog.map((row) => (
                      <tr key={row.id} className="border-t border-white/10 align-top">
                        <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{formatWhen(row.at)}</td>
                        <td className="px-3 py-2">
                          {row.kind === "sent" ? (
                            <span className="text-[10px] uppercase font-bold text-emerald-400">Sent</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-sky-400">Request</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-100">{row.name}</td>
                        <td className="px-3 py-2">
                          <a href={contactMailto({ email: row.email }, row.subject)} className="text-[#a77a23] hover:underline break-all">
                            {row.email}
                          </a>
                        </td>
                        <td className="px-3 py-2 text-gray-300">
                          <p>{row.label}</p>
                          {row.subject ? <p className="text-xs text-gray-500 mt-0.5">{row.subject}</p> : null}
                        </td>
                        <td className="px-3 py-2">
                          <a
                            href={contactMailto({ email: row.email }, row.subject ? `Re: ${row.subject}` : "")}
                            className="text-xs text-emerald-300 hover:underline"
                          >
                            Mail
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {logViewMode === "rolodex" ? (
          <>
            <form onSubmit={saveRolodexContact} className="mb-5 rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#f5edd7]">
                {editingContactId ? "Edit rolodex entry" : "Add to contact book"}
              </h3>
              <p className="text-xs text-gray-500">
                Site signups appear automatically. Add vendors, press, or anyone else here — name plus email or phone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <FormFieldLabel required>Name</FormFieldLabel>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <FormFieldLabel>Email</FormFieldLabel>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <FormFieldLabel>Phone</FormFieldLabel>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="303-555-0100"
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <FormFieldLabel>Company / outlet</FormFieldLabel>
                  <input
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <FormFieldLabel>Tags</FormFieldLabel>
                  <input
                    value={contactTags}
                    onChange={(e) => setContactTags(e.target.value)}
                    placeholder="press, vendor, reader"
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <FormFieldLabel>Notes</FormFieldLabel>
                  <input
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy || !contactName.trim() || (!contactEmail.trim() && !contactPhone.trim())}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {editingContactId ? "Save changes" : "Add contact"}
                </button>
                {editingContactId ? (
                  <button type="button" onClick={clearContactForm} className="px-4 py-2 rounded-lg border border-white/20 text-sm">
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>

            <p className="text-xs text-gray-500 mb-3">
              {filteredContacts.length} contact{filteredContacts.length === 1 ? "" : "s"} in book
            </p>
            {filteredContacts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No contacts yet — they fill in from site forms or add manually above.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10 max-h-[min(50vh,480px)] overflow-y-auto">
                <table className="w-full text-sm text-left min-w-[880px]">
                  <thead className="bg-black/70 text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Company</th>
                      <th className="px-3 py-2">Tags</th>
                      <th className="px-3 py-2">Last activity</th>
                      <th className="px-3 py-2">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c) => {
                      const tel = contactTel(c);
                      const prof = profileForContact(c);
                      const replies = replyOptionsForProfile(prof);
                      const followUp = replies.find((r) => r.type === "follow-up");
                      return (
                        <tr key={c.key} className="border-t border-white/10 align-top">
                          <td className="px-3 py-2 text-gray-100">
                            {c.name}
                            {c.status === "needs-reply" ? (
                              <span className="ml-1 text-[10px] text-amber-400 font-bold">NEEDS REPLY</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            {c.email ? (
                              <a href={contactMailto(c)} className="text-[#a77a23] hover:underline break-all">
                                {c.email}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {tel ? (
                              <a href={tel} className="text-sky-300 hover:underline whitespace-nowrap">
                                {c.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-400">{c.company || "—"}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{(c.tags || []).join(", ") || "—"}</td>
                          <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                            {c.lastActivityAt ? formatWhen(c.lastActivityAt) : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1.5">
                              {c.email ? (
                                <a href={contactMailto(c)} className="text-xs px-2 py-1 rounded border border-[#a77a23]/40 text-[#f5edd7]">
                                  Email
                                </a>
                              ) : null}
                              {tel ? (
                                <a href={tel} className="text-xs px-2 py-1 rounded border border-sky-400/40 text-sky-200">
                                  Call
                                </a>
                              ) : null}
                              {followUp ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => sendProfileFollowUp(prof, followUp.followUpKey, followUp.label)}
                                  className="text-xs px-2 py-1 rounded border border-emerald-400/40 text-emerald-200 disabled:opacity-50"
                                >
                                  Send letter
                                </button>
                              ) : null}
                              {c.email ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => markProfileEmailed(prof.email ? prof : { email: c.email, name: c.name })}
                                  className="text-xs px-2 py-1 rounded border border-emerald-400/40 text-emerald-200 disabled:opacity-50"
                                >
                                  Mark emailed
                                </button>
                              ) : null}
                              {c.manual ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditContact(c)}
                                    className="text-xs px-2 py-1 rounded border border-white/20 text-gray-400"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => deleteRolodexContact(c.id, c.name)}
                                    className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-300"
                                  >
                                    Remove
                                  </button>
                                </>
                              ) : null}
                            </div>
                            {c.note ? <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{c.note}</p> : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </section>

      {!isOwner ? (
        <p className="text-sm text-emerald-200/90 rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3">
          Assistant view — use Contact hub above for tracking, notes, and follow-up letters. Countdown, file sends,
          and letter templates are owner-only.
        </p>
      ) : null}

      {isOwner ? (
      <>
      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
          2. Launch countdown matrix
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Edits here update the public homepage countdown and milestone table after save. Live preview:{" "}
          <span className="text-gray-200">{livePreview || "—"}</span>
        </p>

        <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#a77a23]/15 text-[#a77a23]">
              <tr>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="px-2 py-1">
                    <input
                      value={row.icon}
                      onChange={(e) => {
                        const next = [...matrix];
                        next[i] = { ...next[i], icon: e.target.value };
                        setMatrix(next);
                      }}
                      className="w-14 rounded bg-black border border-gray-700 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.when}
                      onChange={(e) => {
                        const next = [...matrix];
                        next[i] = { ...next[i], when: e.target.value };
                        setMatrix(next);
                      }}
                      className="w-full min-w-[13rem] rounded bg-black border border-gray-700 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.title}
                      onChange={(e) => {
                        const next = [...matrix];
                        next[i] = { ...next[i], title: e.target.value };
                        setMatrix(next);
                      }}
                      className="w-full min-w-[160px] rounded bg-black border border-gray-700 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.note}
                      onChange={(e) => {
                        const next = [...matrix];
                        next[i] = { ...next[i], note: e.target.value };
                        setMatrix(next);
                      }}
                      className="w-full min-w-[140px] rounded bg-black border border-gray-700 px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Live countdown targets</h3>
        <div className="space-y-3 mb-4">
          {targets.map((row, i) => (
            <div key={row.key || i} className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/40 p-3">
              <input
                value={row.label}
                onChange={(e) => {
                  const next = [...targets];
                  next[i] = { ...next[i], label: e.target.value };
                  setTargets(next);
                }}
                placeholder="Label"
                className="rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
              <input
                value={row.at}
                onChange={(e) => {
                  const next = [...targets];
                  next[i] = { ...next[i], at: e.target.value };
                  setTargets(next);
                }}
                placeholder="ISO date (2026-09-30T06:00:00.000Z)"
                className="w-full min-w-0 rounded bg-black border border-gray-700 px-3 py-2 text-sm font-mono"
              />
              <input
                value={row.detail}
                onChange={(e) => {
                  const next = [...targets];
                  next[i] = { ...next[i], detail: e.target.value };
                  setTargets(next);
                }}
                placeholder="Detail line"
                className="rounded bg-black border border-gray-700 px-3 py-2 text-sm md:col-span-2"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={saveCountdown}
          className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold disabled:opacity-50"
        >
          Save countdown
        </button>
      </section>

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
          3. Distribution files
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Attach these when you mass-email selected people. Large files: put in{" "}
          <code className="text-gray-300">public/distribution/</code> via Dropbox and paste the path (e.g.{" "}
          <code className="text-gray-300">/distribution/beautiful-beast-full.epub</code>).
        </p>

        {(["sneakPeek", "fullDigital"]).map((slot) => (
          <div key={slot} className="mb-6 rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="font-semibold text-gray-100 mb-2">
              {slot === "sneakPeek" ? "Extended Sneak Peek" : "Full digital copy"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <FormFieldLabel required>Public path</FormFieldLabel>
                <input
                  value={files[slot]?.path || ""}
                  onChange={(e) =>
                    setFiles((f) => ({
                      ...f,
                      [slot]: { ...f[slot], path: e.target.value },
                    }))
                  }
                  placeholder="/distribution/sneak-peek.epub"
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <FormFieldLabel>Display label (email text)</FormFieldLabel>
                <input
                  value={files[slot]?.label || ""}
                  onChange={(e) =>
                    setFiles((f) => ({
                      ...f,
                      [slot]: { ...f[slot], label: e.target.value },
                    }))
                  }
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-400 mb-1">Or upload (~4MB max)</label>
              <input
                type="file"
                accept=".epub,.pdf,.mobi,.zip,application/epub+zip,application/pdf"
                disabled={Boolean(uploading)}
                onChange={(e) => onUpload(slot, e.target.files?.[0])}
                className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#a77a23] file:px-3 file:py-2 file:text-black file:font-semibold"
              />
              {files[slot]?.path ? (
                <p className="text-xs text-emerald-400 mt-2">
                  Current: {files[slot].path}
                  {files[slot].updatedAt ? ` · updated ${formatWhen(files[slot].updatedAt)}` : ""}
                </p>
              ) : (
                <p className="text-xs text-amber-400 mt-2">No file set yet.</p>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={saveFiles}
          className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold disabled:opacity-50"
        >
          Save file paths
        </button>
      </section>

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
          4. Email letters (edit &amp; send)
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Auto-generated letters for every site subject — edit wording, check who receives each one, then send.
          Placeholders: <code className="text-gray-300">{"{{firstName}}"}</code>,{" "}
          <code className="text-gray-300">{"{{businessName}}"}</code>,{" "}
          <code className="text-gray-300">{"{{arcTeamSize}}"}</code>,{" "}
          <code className="text-gray-300">{"{{giveawayWinners}}"}</code>,{" "}
          <code className="text-gray-300">{"{{insiderStart}}"}</code>
        </p>

        {emailTemplates ? (
          <>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">File sends</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {STUDIO_LETTER_CATALOG.filter((t) => t.category === "file").map((t) => (
                <button
                  key={t.tab}
                  type="button"
                  onClick={() => {
                    setTemplateTab(t.tab);
                    setLetterSendSelected({});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    templateTab === t.tab
                      ? "border-[#a77a23] bg-[#a77a23]/20 text-white"
                      : "border-white/15 text-gray-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Selection notices</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {STUDIO_LETTER_CATALOG.filter((t) => t.category === "selection").map((t) => (
                <button
                  key={t.tab}
                  type="button"
                  onClick={() => {
                    setTemplateTab(t.tab);
                    setLetterSendSelected({});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    templateTab === t.tab
                      ? "border-[#a77a23] bg-[#a77a23]/20 text-white"
                      : "border-white/15 text-gray-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Follow-ups (every site subject)</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {STUDIO_LETTER_CATALOG.filter((t) => t.category !== "file" && t.category !== "selection").map((t) => (
                <button
                  key={t.tab}
                  type="button"
                  onClick={() => {
                    setTemplateTab(t.tab);
                    setLetterSendSelected({});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    templateTab === t.tab
                      ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                      : "border-white/15 text-gray-400"
                  }`}
                >
                  {t.label.replace("Follow-up · ", "")}
                </button>
              ))}
            </div>

            {(() => {
              const dash = templateTab.indexOf("-");
              const group = templateTab.slice(0, dash);
              const key = templateTab.slice(dash + 1);
              const tpl = emailTemplates[group]?.[key] || { subject: "", body: "" };
              const setTpl = (patch) => {
                setEmailTemplates((prev) => ({
                  ...prev,
                  [group]: {
                    ...(prev[group] || {}),
                    [key]: { ...(prev[group]?.[key] || {}), ...patch },
                  },
                }));
              };
              return (
                <div className="space-y-3 mb-4">
                  <div>
                    <FormFieldLabel required>Subject line</FormFieldLabel>
                    <input
                      value={tpl.subject || ""}
                      onChange={(e) => setTpl({ subject: e.target.value })}
                      className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <FormFieldLabel required>Letter body</FormFieldLabel>
                    <textarea
                      value={tpl.body || ""}
                      onChange={(e) => setTpl({ body: e.target.value })}
                      rows={18}
                      className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 pt-5 border-t border-white/10">
              <h3 className="text-base font-bold text-[#f5edd7] mb-1">Who receives this letter?</h3>
              <p className="text-sm text-gray-400 mb-3">
                Check people on your send list and inbox submissions, then send the letter above.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: "suggested", label: "Suggested matches" },
                  { id: "all", label: "All on list + inbox" },
                  { id: "list", label: "Send list only" },
                  { id: "inbox", label: "Inbox only" },
                  { id: "sent", label: "Already sent" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setLetterSendFilter(tab.id);
                      setLetterSendSelected({});
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      letterSendFilter === tab.id
                        ? "border-emerald-400/50 bg-emerald-500/10 text-white"
                        : "border-white/15 text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={checkSuggestedLetterRecipients}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-sm"
                >
                  Check suggested
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const next = {};
                    for (const row of letterSendRows) next[row.rowId] = true;
                    setLetterSendSelected(next);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-sm"
                >
                  Check all shown
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setLetterSendSelected({})}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-sm"
                >
                  Clear checks
                </button>
                <button
                  type="button"
                  disabled={busy || !letterSendChecked.length}
                  onClick={sendCheckedLetter}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Send to checked ({letterSendChecked.length})
                </button>
              </div>
              {letterSendRows.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No one matches this filter. Try “All on list + inbox”, “Already sent”, or add people manually.
                </p>
              ) : (
                <div className="space-y-2 max-h-[min(40vh,360px)] overflow-y-auto pr-1">
                  {letterSendRows.map((row) => (
                    <div
                      key={row.rowId}
                      className="flex flex-wrap items-start gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(letterSendSelected[row.rowId])}
                        onChange={(e) =>
                          setLetterSendSelected((prev) => ({ ...prev, [row.rowId]: e.target.checked }))
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-[180px]">
                        <p className="font-medium text-gray-100">
                          {row.name}
                          {row.suggested ? (
                            <span className="ml-2 text-[10px] uppercase text-emerald-400 font-bold">match</span>
                          ) : null}
                        </p>
                        <a href={`mailto:${row.email}`} className="text-sm text-[#a77a23] hover:underline break-all">
                          {row.email}
                        </a>
                        <p className="text-xs text-gray-500 mt-0.5">{row.detail}</p>
                      </div>
                      <div className="text-xs shrink-0">
                        <SendBadge sent={row.sent} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-2 mt-6">
              <button
                type="button"
                disabled={busy}
                onClick={saveTemplates}
                className="px-4 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold disabled:opacity-50"
              >
                Save letter drafts
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => sendSelectionNotice("arcSelected")}
                className="px-4 py-2 rounded-lg border border-emerald-400/50 text-emerald-200 text-sm"
              >
                Send Aug 17 notice → all ARC selected
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => sendSelectionNotice("giveawayWinner")}
                className="px-4 py-2 rounded-lg border border-emerald-400/50 text-emerald-200 text-sm"
              >
                Send Aug 17 notice → all giveaway winners
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Selection notices have no attachment — they tell people they were chosen. Send the actual file
              later with Email selected with attachment.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading templates…</p>
        )}
      </section>
      </>
      ) : null}

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: GOLD }}>
              5. ARC &amp; launch list
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              New ARC and launch-list signups land here automatically. ARC selected:{" "}
              <strong className="text-white">{arcSelectedCount}</strong> / {ARC_TEAM_SIZE} sleuths.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-[#a77a23]/40 bg-[#a77a23]/10 p-4 md:p-5">
          <h3 className="text-base font-bold text-[#f5edd7] mb-1">5.1 Add people manually</h3>
          <p className="text-sm text-gray-400 mb-4">
            From Gumroad, mail, or your own notes — one at a time or paste a list. No form submission required.
          </p>
          <form onSubmit={addPerson} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <FormFieldLabel required>Name</FormFieldLabel>
                <input
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <FormFieldLabel required>Email</FormFieldLabel>
                <input
                  required
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <FormFieldLabel required>List</FormFieldLabel>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                >
                  <option value="arc-selected">ARC selected (25)</option>
                  <option value="arc-applicant">ARC applicant</option>
                  <option value="launch-list">Launch list</option>
                  <option value="giveaway">Giveaway winner (3)</option>
                  <option value="sneak-peek">Sneak Peek</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <FormFieldLabel>Format</FormFieldLabel>
                <input
                  value={addFormat}
                  onChange={(e) => setAddFormat(e.target.value)}
                  placeholder="EPUB, PDF…"
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <FormFieldLabel>Review spot</FormFieldLabel>
                <input
                  value={addReviewSpot}
                  onChange={(e) => setAddReviewSpot(e.target.value)}
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <FormFieldLabel>Notes</FormFieldLabel>
                <input
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold disabled:opacity-50"
              >
                Add one person
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddName("");
                  setAddEmail("");
                  setAddFormat("");
                  setAddReviewSpot("");
                  setAddNotes("");
                  setBulkText("");
                }}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm"
              >
                Clear
              </button>
              {isOwner ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowBulk((v) => !v)}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm"
              >
                {showBulk ? "Hide bulk paste" : "Bulk paste names & emails"}
              </button>
              ) : null}
            </div>
          </form>
          {isOwner && showBulk ? (
            <form onSubmit={addBulk} className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <p className="text-xs text-gray-500">
                One per line: <code className="text-gray-400">Jane Doe, jane@email.com</code> ·{" "}
                <code className="text-gray-400">jane@email.com</code> ·{" "}
                <code className="text-gray-400">Jane &lt;jane@email.com&gt;</code>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={"Jane Doe, jane@example.com\nBob Smith, bob@example.com"}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm font-mono"
              />
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <FormFieldLabel>Add all to list</FormFieldLabel>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value)}
                    className="rounded bg-black border border-gray-700 px-3 py-2 text-sm"
                  >
                    <option value="arc-selected">ARC selected</option>
                    <option value="arc-applicant">ARC applicant</option>
                    <option value="launch-list">Launch list</option>
                    <option value="giveaway">Giveaway winner</option>
                    <option value="sneak-peek">Sneak Peek</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={busy || !bulkText.trim()}
                  className="px-4 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold disabled:opacity-50"
                >
                  Import pasted list
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="mb-8 rounded-xl border border-[#a77a23]/35 bg-gray-950/80 p-4 md:p-5">
          <h3 className="text-base font-bold text-emerald-300 mb-1">5.2 Site submissions inbox</h3>
          <p className="text-sm text-gray-400 mb-4">
            Names pulled straight from your site forms — no digging through mail. ARC, launch list, contact,
            media, and community requests appear here when someone submits. Check the ones you want, then import
            to your send list.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {INBOX_FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInboxFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  inboxFilter === tab.id
                    ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                    : "border-white/15 text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
                {tab.id === "all" && inboxRows.length ? (
                  <span className="ml-1 text-emerald-300">({store?.submissions?.filter((s) => s.status === "new").length || 0})</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button type="button" disabled={busy} onClick={() => toggleInboxAll(true)} className="px-3 py-1.5 rounded-lg border border-white/20 text-sm">
              Select all shown
            </button>
            <button type="button" disabled={busy} onClick={() => importInbox("arc-selected")} className="px-3 py-1.5 rounded-lg bg-[#a77a23] text-black text-sm font-semibold">
              Import → ARC selected
            </button>
            <button type="button" disabled={busy} onClick={() => importInbox("arc-applicant")} className="px-3 py-1.5 rounded-lg border border-[#a77a23]/50 text-sm">
              Import → ARC applicants
            </button>
            <button type="button" disabled={busy} onClick={() => importInbox("launch-list")} className="px-3 py-1.5 rounded-lg border border-white/20 text-sm">
              Import → Launch list
            </button>
            <button type="button" disabled={busy} onClick={dismissInbox} className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300">
              Dismiss selected
            </button>
          </div>

          {inboxRows.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No new submissions in this filter. They appear here when someone uses ARC, launch list, contact, media, or community forms on the site.
            </p>
          ) : (
            <div className="space-y-2 max-h-[min(50vh,420px)] overflow-y-auto pr-1">
              {inboxRows.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-start gap-3 rounded-xl border border-white/10 bg-black/50 px-3 py-3"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(inboxSelected[s.id])}
                    onChange={(e) => setInboxSelected((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold text-gray-100">
                      {s.name}{" "}
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 ml-1">
                        {SUBMISSION_KIND_LABELS[s.kind] || s.kind}
                      </span>
                    </p>
                    <a href={`mailto:${s.email}`} className="text-sm text-[#a77a23] hover:underline break-all">
                      {s.email}
                    </a>
                    {s.format ? <p className="text-xs text-gray-500 mt-0.5">Format: {s.format}</p> : null}
                    {s.reviewSpot ? <p className="text-xs text-gray-500">Review: {s.reviewSpot}</p> : null}
                    {s.businessName ? <p className="text-xs text-gray-500">Business: {s.businessName}</p> : null}
                    {s.outlet ? <p className="text-xs text-gray-500">Outlet: {s.outlet}</p> : null}
                    {s.messagePreview ? (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.messagePreview}</p>
                    ) : null}
                    <p className="text-[11px] text-gray-600 mt-1">{formatWhen(s.receivedAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => importOne(s.id, "arc-selected")}
                      className="text-xs px-2 py-1 rounded border border-[#a77a23]/50 text-[#f5edd7] hover:bg-[#a77a23]/15"
                    >
                      → ARC selected
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => importOne(s.id, "launch-list")}
                      className="text-xs px-2 py-1 rounded border border-white/20 text-gray-300"
                    >
                      → Launch list
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-[#f5edd7] mb-3">5.3 Send list</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All" },
            { id: "arc-applicant", label: "ARC applicants" },
            { id: "arc-selected", label: "ARC selected" },
            { id: "launch-list", label: "Launch list" },
            { id: "giveaway", label: "Giveaway winners" },
            { id: "sneak-peek", label: "Sneak Peek" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                filter === tab.id
                  ? "border-[#a77a23] bg-[#a77a23]/20 text-white"
                  : "border-white/15 text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isOwner ? (
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Copy to send</label>
            <select
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm"
            >
              {COPY_TYPES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => toggleAll(true)}
            className="px-3 py-2 rounded-lg border border-white/20 text-sm"
          >
            Select all shown
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => toggleAll(false)}
            className="px-3 py-2 rounded-lg border border-white/20 text-sm"
          >
            Clear selection
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={markArcSelected}
            className="px-3 py-2 rounded-lg border border-[#a77a23]/50 text-sm text-[#f5edd7]"
          >
            Mark as ARC selected
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={markSneakPeekSent}
            className="px-3 py-2 rounded-lg border border-emerald-400/50 text-sm text-emerald-200"
          >
            Mark Sneak Peek sent
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={sendCopies}
            className="px-4 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold disabled:opacity-50"
          >
            Email selected with attachment
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => sendSelectionNotice("arcSelected")}
            className="px-3 py-2 rounded-lg border border-emerald-400/40 text-sm text-emerald-200"
          >
            Aug 17 notice → selected
          </button>
        </div>
        ) : null}

        {recipients.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No one on this list yet — add manually or wait for form signups.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead className="bg-black/60 text-gray-400">
                <tr>
                  <th className="px-3 py-2 w-10" />
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Sneak peek</th>
                  <th className="px-3 py-2">Full digital</th>
                  <th className="px-3 py-2">ARC sent</th>
                  <th className="px-3 py-2">ARC notice</th>
                  <th className="px-3 py-2">Giveaway notice</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 align-top">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(selected[r.id])}
                        onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-100">{r.name}</td>
                    <td className="px-3 py-2">
                      <a href={`mailto:${r.email}`} className="text-[#a77a23] hover:underline break-all">
                        {r.email}
                      </a>
                      {r.format ? <p className="text-xs text-gray-500 mt-0.5">Format: {r.format}</p> : null}
                    </td>
                    <td className="px-3 py-2 text-gray-300">{ROLE_LABELS[r.role] || r.role}</td>
                    <td className="px-3 py-2 text-xs">
                      <SendBadge sent={r.sends?.sneakPeek} />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <SendBadge sent={r.sends?.fullDigital} />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <SendBadge sent={r.sends?.arc} />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <SendBadge sent={r.sends?.selectionArc} />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <SendBadge sent={r.sends?.selectionGiveaway} />
                    </td>
                    <td className="px-3 py-2">
                      {isOwner ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removePerson(r.id, r.name)}
                        className="text-xs text-red-300 border border-red-400/40 rounded px-2 py-1 hover:bg-red-950/30"
                      >
                        Remove
                      </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {storage ? <p className="text-xs text-gray-500">Storage: {storage}</p> : null}
    </div>
  );
}
