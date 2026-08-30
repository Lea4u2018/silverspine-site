import { useEffect, useState } from "react";
import FixedMusicControl from "@/components/FixedMusicControl";

/** Mute overlay only on the storm gate. Public pages use the header control. */
export default function TopRightControls() {
  const [onGate, setOnGate] = useState(false);

  useEffect(() => {
    const syncGate = () => {
      try {
        setOnGate(document.documentElement.dataset.sssStormGate === "1");
      } catch {
        setOnGate(false);
      }
    };
    syncGate();
    window.addEventListener("sss-storm-gate", syncGate);
    return () => window.removeEventListener("sss-storm-gate", syncGate);
  }, []);

  // Mute lives in the header on every public page. Only show this overlay on the storm gate.
  if (!onGate) return null;

  const topClass = onGate
    ? "top-3 sm:top-4"
    : "top-3 sm:top-4 md:top-5";

  return (
    <div
      className={[
        "sss-top-right-controls fixed z-[450] flex items-center gap-2 notranslate",
        "right-2.5 sm:right-3 md:right-5",
        "max-w-[calc(100vw-1rem)]",
        topClass,
      ].join(" ")}
      translate="no"
    >
      <FixedMusicControl embedded />
    </div>
  );
}
