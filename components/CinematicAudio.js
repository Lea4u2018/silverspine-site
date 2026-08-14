import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  PIANO_AUDIO_ID,
  PIANO_SRC,
  playAllAmbient,
  readPianoMuted,
  stopAllAmbient,
  writePianoMuted,
} from "@/lib/cinematicAudio";

const CinematicAudioContext = createContext({
  muted: true,
  toggle: () => {},
  ensurePlaying: () => false,
  error: "",
});

export function CinematicAudioProvider({ children }) {
  const router = useRouter();
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMuted(readPianoMuted());
    const onPref = (e) => {
      if (e?.detail && typeof e.detail.muted === "boolean") {
        setMuted(e.detail.muted);
      } else {
        setMuted(readPianoMuted());
      }
    };
    window.addEventListener("sss-piano-mute", onPref);
    return () => window.removeEventListener("sss-piano-mute", onPref);
  }, []);

  // Keep the piano alive across page changes once the reader has invited sound in
  useEffect(() => {
    const resume = (e) => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (e?.type === "keydown") {
        const t = e.target;
        const tag = t?.tagName?.toLowerCase?.();
        if (tag === "input" || tag === "textarea" || tag === "select" || t?.isContentEditable) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key;
        if (k === "Tab" || k === "Escape" || k === "F5" || k?.startsWith?.("F")) return;
      }
      if (!readPianoMuted()) playAllAmbient();
    };

    const onVisibility = () => {
      // Hard-stop when the tab is hidden / closed so rumble can’t keep playing “nowhere”
      if (document.hidden) stopAllAmbient();
      else resume();
    };

    resume();
    router.events.on("routeChangeComplete", resume);

    // Any click can re-unlock after browser pause / tab switch
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stopAllAmbient);

    return () => {
      router.events.off("routeChangeComplete", resume);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stopAllAmbient);
      stopAllAmbient();
    };
  }, [router.events]);

  const ensurePlaying = useCallback(() => {
    if (readPianoMuted()) return false;
    const ok = playAllAmbient();
    if (!ok) setError("Tap Music to start sound.");
    else setError("");
    return ok;
  }, []);

  // Keep synchronous for user-gesture unlock
  const toggle = useCallback(() => {
    const nextMuted = !readPianoMuted();
    writePianoMuted(nextMuted);
    setMuted(nextMuted);

    if (nextMuted) {
      stopAllAmbient();
      setError("");
      return;
    }

    const ok = playAllAmbient();
    if (!ok) setError("Could not start audio — tap Music once more.");
    else setError("");
  }, []);

  return (
    <CinematicAudioContext.Provider value={{ muted, toggle, ensurePlaying, error }}>
      <audio
        id={PIANO_AUDIO_ID}
        src={PIANO_SRC}
        loop
        preload="auto"
        playsInline
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
      {children}
    </CinematicAudioContext.Provider>
  );
}

export function useCinematicAudio() {
  return useContext(CinematicAudioContext);
}
