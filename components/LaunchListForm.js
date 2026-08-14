import { useState } from "react";
import { DIGITAL_COPY_GIVEAWAY } from "@/lib/store";
import { readPreferredLang } from "@/lib/i18n";
import FormFieldLabel, { FormRequiredNote } from "@/components/FormFieldLabel";

/**
 * Shared launch-list signup. Sends kind:"list" to /api/contact-safe.
 */
export default function LaunchListForm({
  requestEmail = "contact@silverspinestudio.com",
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", msg: "" });
    try {
      const res = await fetch("/api/contact-safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "list",
          name,
          email,
          language: readPreferredLang(),
          message:
            "Please add me to the Silver Spine Studio launch email list for updates on The Beautiful Beast and the seven-fold chronicle. Include me in the drawing — 3 lucky winners will each receive a FULL digital copy (winners announced mid-October 2026).",
          hp,
          startedAt,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({
          state: "success",
          msg: "You're on the list — entered for a chance to be one of 3 lucky winners (each receives a FULL digital copy). Happy Sleuthing!",
        });
        setName("");
        setEmail("");
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
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60 text-white"
        />
      </div>
      <div>
        <FormFieldLabel required>Email</FormFieldLabel>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60 text-white"
        />
      </div>
      {status.msg && (
        <p className={`text-sm ${status.state === "error" ? "text-red-400" : "text-green-400"}`}>
          {status.msg}
        </p>
      )}
      <button
        type="submit"
        disabled={status.state === "sending"}
        className="w-full px-4 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50 transition"
      >
        {status.state === "sending" ? "Joining…" : "Join the launch list"}
      </button>
      <p className="text-xs text-gray-300 leading-relaxed">
        {DIGITAL_COPY_GIVEAWAY.blurb}
      </p>
      <p className="text-xs text-gray-400">
        Separate from ARC requests. Signups go to {requestEmail}.
      </p>
    </form>
  );
}
