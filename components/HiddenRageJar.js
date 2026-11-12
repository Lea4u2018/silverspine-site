import { useState } from "react";
import { ENTER_THE_STORM, ENTER_THE_STORM_CLUE_LIVE } from "@/lib/enterTheStorm";

/**
 * Studio jar on a storm ground. Wrap on the glass.
 * Whole jar in frame — never cropped.
 */
export default function HiddenRageJar({ compact = false, reveal = ENTER_THE_STORM_CLUE_LIVE }) {
  const [held, setHeld] = useState(false);
  const [latched, setLatched] = useState(false);
  const warm = reveal && (held || latched);
  const lines = ENTER_THE_STORM.clueLines;
  const slot = ENTER_THE_STORM.slot;

  return (
    <figure className="hidden-rage-jar m-0 min-w-0">
      <div className={`relative mx-auto ${compact ? "max-w-[260px]" : "max-w-[420px] md:max-w-[460px]"}`}>
        <div className="relative rounded-xl border border-white/10 bg-[#070B16] p-2">
          <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ENTER_THE_STORM.jarSrc}
            alt="Hidden Rage amber jar — Enter The Storm"
            className="w-full h-auto block object-contain"
          />
          {reveal ? (
            <button
              type="button"
              aria-pressed={warm}
              aria-label={warm ? "Hidden Clue showing. Press again to cover." : "Hold the Hidden Clue to reveal it."}
              className="absolute z-10 border-0 p-0 cursor-pointer overflow-hidden"
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                left: slot.left,
                top: slot.top,
                width: slot.width,
                height: slot.height,
                borderRadius: 2,
                background: "#f8f6f1",
                containerType: "size",
              }}
              onMouseEnter={() => setHeld(true)}
              onMouseLeave={() => setHeld(false)}
              onPointerDown={() => setHeld(true)}
              onPointerUp={() => setHeld(false)}
              onPointerCancel={() => setHeld(false)}
              onClick={() => setLatched((v) => !v)}
            >
              <span
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                style={{
                  color: "#1c1816",
                  fontSize: "min(34cqh, 8.5cqw)",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.12,
                  padding: "2cqh 3cqw",
                  boxSizing: "border-box",
                }}
              >
                {lines.map((line) => (
                  <span key={line} className="block font-bold" style={{ whiteSpace: "nowrap" }}>
                    {line}
                  </span>
                ))}
              </span>
              <span
                className="absolute inset-0"
                style={{
                  background: "#080a10",
                  opacity: warm ? 0 : 1,
                  transition: "opacity 0.75s ease",
                }}
              />
            </button>
          ) : null}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] sm:text-xs text-gray-400 leading-relaxed px-1">
        {reveal
          ? warm
            ? "Hidden Clue."
            : "Hold the black bar. That is the Hidden Clue."
          : "Every scent reveals a new mystery..."}
      </figcaption>
    </figure>
  );
}
