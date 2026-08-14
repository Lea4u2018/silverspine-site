import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FixedMusicControl from "@/components/FixedMusicControl";

/** Mute control — fixed upper-right. Language control removed for stability. */
export default function TopRightControls() {
  const router = useRouter();
  const [onGate, setOnGate] = useState(false);
  const isHome = router.pathname === "/";

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

  // Home mute sits centered above the Welcome box — keep this control off Home
  // so it never covers Shop when a tablet turns or the window shrinks.
  if (isHome && !onGate) return null;

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
