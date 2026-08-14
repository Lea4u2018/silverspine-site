import { useEffect } from "react";

/** Pause autoplay videos when the tab is hidden — frees CPU for browser search/UI. */
export default function PauseMediaWhenHidden() {
  useEffect(() => {
    const sync = () => {
      const hidden = document.hidden;
      document.querySelectorAll("video").forEach((video) => {
        try {
          if (hidden) {
            if (!video.paused) video.pause();
          } else if (video.autoplay && video.muted) {
            video.play().catch(() => {});
          }
        } catch {
          /* ignore */
        }
      });
    };

    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return null;
}
