import { useCallback, useEffect, useMemo, useState } from "react";
import { ARC_TEAM_SIZE } from "@/lib/store";
import { formatCountdownLabel, formatCountdownParts, getNextLaunchCountdown } from "@/lib/launchCountdown";
import FormFieldLabel, { FormRequiredNote, RequiredMark } from "@/components/FormFieldLabel";
import {
  STUDIO_LETTER_CATALOG,
  catalogEntry,
  personMatchesLetter,
} from "@/lib/launchEmailTemplates";

const GOLD = "#a77a23";

const ROLE_LABELS = {
  "arc-applicant": "ARC applicant",
  "arc-selected": "ARC selected",
  "launch-list": "Launch list",
  giveaway: "Giveaway winner",
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

export default function AdminLaunchPanel() {
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

  const activeLetter = useMemo(() => catalogEntry(templateTab), [templateTab]);

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

    for (const r of allRecipients) {
      const suggested = personMatchesLetter(entry, { role: r.role, kind: "" });
      if (letterSendFilter === "suggested" && !suggested) continue;
      if (letterSendFilter === "inbox") continue;
      const rowId = `r_${r.id}`;
      rows.push({
        rowId,
        source: "recipient",
        id: r.id,
        name: r.name,
        email: r.email,
        detail: ROLE_LABELS[r.role] || r.role,
        suggested,
        sent:
          entry.group === "followUp"
            ? r.sends?.followUps?.[entry.key]
            : entry.group === "selection"
              ? r.sends?.[entry.selectionType === "giveawayWinner" ? "selectionGiveaway" : "selectionArc"]
              : r.sends?.[entry.copyType],
      });
      seenEmails.add(r.email);
    }

    if (letterSendFilter !== "list") {
      for (const s of allSubmissions) {
        if (!s.email || seenEmails.has(s.email)) continue;
        const suggested = personMatchesLetter(entry, { role: "", kind: s.kind });
        if (letterSendFilter === "suggested" && !suggested) continue;
        const rowId = `s_${s.id}`;
        rows.push({
          rowId,
          source: "submission",
          id: s.id,
          name: s.name,
          email: s.email,
          detail: `${SUBMISSION_KIND_LABELS[s.kind] || s.kind}${s.status !== "new" ? ` · ${s.status}` : " · inbox"}`,
          suggested,
          sent: s.followUpsSent?.[entry.key],
        });
      }
    }

    return rows;
  }, [activeLetter, allRecipients, allSubmissions, letterSendFilter]);

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

  if (!store) {
    return <p className="text-gray-400 text-sm">Loading launch admin…</p>;
  }

  const arcSelectedCount = (store.recipients || []).filter((r) => r.role === "arc-selected" && !r.removed).length;

  return (
    <div className="space-y-8">
      {msg ? <p className="text-sm text-gray-300 rounded-lg border border-white/10 bg-black/40 px-4 py-3">{msg}</p> : null}

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
          Launch countdown matrix
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
                      className="w-full min-w-[120px] rounded bg-black border border-gray-700 px-2 py-1"
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
                className="rounded bg-black border border-gray-700 px-3 py-2 text-sm font-mono"
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
          Distribution files
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
          Email letters (edit &amp; send)
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
                      rows={14}
                      className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm font-mono leading-relaxed"
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
                  No one matches this filter. Try “All on list + inbox” or add people manually.
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

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: GOLD }}>
              ARC &amp; launch list
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              New ARC and launch-list signups land here automatically. ARC selected:{" "}
              <strong className="text-white">{arcSelectedCount}</strong> / {ARC_TEAM_SIZE} sleuths.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-[#a77a23]/40 bg-[#a77a23]/10 p-4 md:p-5">
          <h3 className="text-base font-bold text-[#f5edd7] mb-1">Add people manually</h3>
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
                disabled={busy}
                onClick={() => setShowBulk((v) => !v)}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm"
              >
                {showBulk ? "Hide bulk paste" : "Bulk paste names & emails"}
              </button>
            </div>
          </form>
          {showBulk ? (
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
          <h3 className="text-base font-bold text-emerald-300 mb-1">Site submissions inbox</h3>
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

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All" },
            { id: "arc-applicant", label: "ARC applicants" },
            { id: "arc-selected", label: "ARC selected" },
            { id: "launch-list", label: "Launch list" },
            { id: "giveaway", label: "Giveaway winners" },
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
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removePerson(r.id, r.name)}
                        className="text-xs text-red-300 border border-red-400/40 rounded px-2 py-1 hover:bg-red-950/30"
                      >
                        Remove
                      </button>
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
