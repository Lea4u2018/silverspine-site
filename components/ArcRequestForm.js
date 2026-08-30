import { useState } from "react";
import { readPreferredLang } from "@/lib/i18n";
import FormFieldLabel, { FormRequiredNote, RequiredMark } from "@/components/FormFieldLabel";

/**
 * Early-release ARC request. Sends kind:"arc" to /api/contact-safe
 * (studio notification + customer auto-reply).
 */
export default function ArcRequestForm({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState("EPUB");
  const [reviewSpot, setReviewSpot] = useState("Social media");
  const [agree, setAgree] = useState(false);
  const [hp, setHp] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setStatus({ state: "sending", msg: "" });
    try {
      const res = await fetch("/api/contact-safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "arc",
          name,
          email,
          language: readPreferredLang(),
          format,
          reviewSpot,
          message: [
            "I'd like to request early-release ARC content for The Beautiful Beast.",
            `Preferred format: ${format}`,
            `Where I'll review: ${reviewSpot}`,
            "I agree that any early-release / ARC files I receive are licensed for my personal review use only.",
          ].join("\n"),
          hp,
          startedAt,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({
          state: "success",
          msg:
            data.message ||
            "Thanks — your ARC request was received. Check your email for confirmation.",
        });
        setName("");
        setEmail("");
        setAgree(false);
        if (typeof onSuccess === "function") onSuccess();
      } else {
        setStatus({
          state: "error",
          msg: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({ state: "error", msg: "Network error. Please try again." });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormRequiredNote />
      <div className="hidden" aria-hidden="true">
        <label>Leave empty</label>
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>
      <div>
        <FormFieldLabel required>Name</FormFieldLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60"
        />
      </div>
      <div>
        <FormFieldLabel required>Email</FormFieldLabel>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FormFieldLabel required>Preferred format</FormFieldLabel>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60"
          >
            <option value="EPUB">EPUB (phones, tablets, most e-readers)</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
        <div>
          <FormFieldLabel required>Where you’ll review</FormFieldLabel>
          <select
            value={reviewSpot}
            onChange={(e) => setReviewSpot(e.target.value)}
            className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60"
          >
            <option>Social media</option>
            <option>Personal blog / website</option>
            <option>Amazon (when available)</option>
            <option>Other / not sure yet</option>
          </select>
        </div>
      </div>
      <label className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
          className="mt-0.5"
        />
        <span>
          <RequiredMark /> I understand ARC / early-release files are licensed for my personal review only. I will not
          copy, upload, resell, or share the files (or substantial excerpts) with anyone else.
          Unauthorized sharing may end my ARC access and may be pursued as copyright infringement.
        </span>
      </label>

      {status.msg && (
        <p className={`text-sm ${status.state === "error" ? "text-red-400" : "text-green-400"}`}>
          {status.msg}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {typeof onCancel === "function" && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!agree || status.state === "sending"}
          className="px-4 py-2 rounded-lg bg-[#dfcfb5] text-black font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {status.state === "sending" ? "Sending…" : "Submit ARC request"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        You’ll get an email confirmation right away. We select 25 sleuths for early access.
        Selection notices go out Aug 17, 2026. If selected, ARC files deliver Sep 21–23, 2026.
      </p>
    </form>
  );
}
