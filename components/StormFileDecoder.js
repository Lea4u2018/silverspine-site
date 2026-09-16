import { useState } from "react";
import { ENTER_THE_STORM } from "@/lib/enterTheStorm";

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function StormFileDecoder() {
  const [value, setValue] = useState("");
  const [state, setState] = useState("idle"); // idle | open | sealed
  const gold = "#dfcfb5";

  function onSubmit(e) {
    e.preventDefault();
    const got = norm(value);
    const ok = ENTER_THE_STORM.clueKeys.some((k) => got === k);
    setState(ok ? "open" : "sealed");
  }

  return (
    <div className="mt-8 pt-6 border-t border-white/10 text-left min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: gold }}>
        After the Hidden Clue
      </p>
      <p className="mt-2 text-sm text-gray-400 leading-relaxed">
        Type the time and the line from the glass. You get why 22:48 will not sit still — not another Reel.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 min-w-0">
        <label className="sr-only" htmlFor="storm-file-key">
          File line from the jar
        </label>
        <input
          id="storm-file-key"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder="The line on the glass"
          className="min-w-0 flex-1 rounded-lg bg-black/40 border border-white/15 text-gray-100 px-3 py-2.5 text-sm outline-none focus:border-[#dfcfb5]/50"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-200 hover:border-[#dfcfb5]/50"
        >
          Open
        </button>
      </form>
      {state === "sealed" ? (
        <p className="mt-3 text-sm text-gray-500">File sealed.</p>
      ) : null}
      {state === "open" ? (
        <div className="mt-4 text-sm sm:text-base text-gray-200 leading-relaxed space-y-3">
          {ENTER_THE_STORM.fileUnlock.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
