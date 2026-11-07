import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useCinematicAudio } from "@/components/CinematicAudio";

const WHITE = "#ffffff";

/**
 * Sitewide Music/Mute — piano + soft thunder everywhere (home also ties in storm bed).
 * Use embedded inside TopRightControls (preferred). Standalone keeps old fixed position.
 */
export default function FixedMusicControl({ embedded = false }) {
  const { muted, toggle, error } = useCinematicAudio();

  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        "sss-fixed-music inline-flex items-center gap-1.5 sm:gap-2 rounded-full border shrink-0",
        "font-semibold tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
        "px-2.5 py-1.5 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs md:text-sm",
        embedded ? "" : "fixed z-[200] right-2.5 top-3",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        color: WHITE,
        borderColor: "rgba(255,255,255,0.85)",
        background: muted ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.18)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.2)",
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Play music" : "Mute music"}
      title={muted ? "Play cinematic score" : "Mute cinematic score"}
    >
      {muted ? <FaVolumeMute size={16} aria-hidden="true" /> : <FaVolumeUp size={16} aria-hidden="true" />}
      <span>{muted ? "Music" : "Mute"}</span>
      {error ? <span className="sr-only">{error}</span> : null}
    </button>
  );
}
