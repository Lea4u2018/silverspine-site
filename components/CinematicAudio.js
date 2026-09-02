import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  PIANO_AUDIO_ID,
  PIANO_SRC,
  playAllAmbient,
  readPianoMuted,
  stopAllAmbient,
  killAllSiteSound,
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

  // Do not restart music on clicks. Closing or hiding the tab must kill every player.
  useEffect(() => {
    const halt = () => killAllSiteSound();
    const onVisibility = () => {
      if (document.hidden) halt();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", halt);
    window.addEventListener("beforeunload", halt);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", halt);
      window.removeEventListener("beforeunload", halt);
      halt();
    };
  }, []);

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
      killAllSiteSound();
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
