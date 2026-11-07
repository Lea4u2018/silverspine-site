/** Shared ambient audio — cinematic piano + soft thunder under lightning pages. */

export const PIANO_PREF_KEY = "sss-piano-muted";
export const PIANO_SRC = "/Valley_rain.mp3";
export const PIANO_SRC_FALLBACK = "/Valley_rain.mp3";
export const PIANO_SRC_PRIMARY = "/Valley_rain_stars.m4a";
export const PIANO_VOLUME = 0.42;
/** While book hover-narration plays, duck rain/thunder under the voice */
export const PIANO_DUCK_VOLUME = 0.14;
export const PIANO_AUDIO_ID = "sss-cinematic-piano";

export const THUNDER_AUDIO_ID = "sss-home-thunder";
export const THUNDER_VOLUME = 0.62;
export const THUNDER_DUCK_VOLUME = 0.22;

/** Soft distant rumble for pages that show lightning flashes */
export const SOFT_THUNDER_AUDIO_ID = "sss-soft-thunder";
export const SOFT_THUNDER_SRC = "/thunder_rumble.mp3";
export const SOFT_THUNDER_VOLUME = 0.55;
export const SOFT_THUNDER_DUCK_VOLUME = 0.2;

let ambientIsDucked = false;

export function readPianoMuted() {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(PIANO_PREF_KEY);
    if (v === null) return true;
    return v === "1" || v === "true";
  } catch {
    return true;
  }
}

export function writePianoMuted(muted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PIANO_PREF_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("sss-piano-mute", { detail: { muted: !!muted } }));
}

function resolveUrl(path) {
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

export function getPianoEl() {
  if (typeof document === "undefined") return null;
  let el = document.getElementById(PIANO_AUDIO_ID);
  if (el) return el;

  el = document.createElement("audio");
  el.id = PIANO_AUDIO_ID;
  el.src = resolveUrl(PIANO_SRC);
  el.loop = true;
  el.preload = "auto";
  el.setAttribute("playsinline", "true");
  el.setAttribute("webkit-playsinline", "true");
  el.style.display = "none";
  document.body.appendChild(el);
  return el;
}

export function getThunderEl() {
  if (typeof document === "undefined") return null;
  return document.getElementById(THUNDER_AUDIO_ID);
}

export function getSoftThunderEl() {
  if (typeof document === "undefined") return null;
  let el = document.getElementById(SOFT_THUNDER_AUDIO_ID);
  if (el) return el;

  el = document.createElement("audio");
  el.id = SOFT_THUNDER_AUDIO_ID;
  el.src = resolveUrl(SOFT_THUNDER_SRC);
  el.loop = true;
  el.preload = "auto";
  el.setAttribute("playsinline", "true");
  el.style.display = "none";
  document.body.appendChild(el);
  return el;
}

/** Hard-stop every site sound (wheel, piano, thunder, blog players). */
export function killAllSiteSound() {
  stopAllAmbient();
  if (typeof document === "undefined") return;
  document.querySelectorAll("audio").forEach((el) => {
    try {
      el.pause();
      el.muted = true;
      el.volume = 0;
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    // Pause the wheel score with everything else. Do not tear the element out —
    // Play score on the blog wheel needs that player to still exist.
  });
}

/** Pause ambient — keep place in tracks */
export function stopAllAmbient() {
  const piano = getPianoEl();
  const thunder = getThunderEl();
  const soft = getSoftThunderEl();
  [piano, thunder, soft].forEach((el) => {
    if (!el) return;
    try {
      el.pause();
      el.muted = true;
    } catch {
      /* ignore */
    }
  });
}

export function playSoftThunder() {
  // Prefer home’s louder bed when present — avoid double rumble on Home
  const homeThunder = getThunderEl();
  if (homeThunder && !homeThunder.paused && !homeThunder.muted) return false;

  const el = getSoftThunderEl();
  if (!el || readPianoMuted()) return false;
  try {
    el.muted = false;
    el.volume = SOFT_THUNDER_VOLUME;
    el.loop = true;
    el.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export function stopSoftThunder() {
  const el = getSoftThunderEl();
  if (!el) return;
  try {
    el.pause();
    el.muted = true;
  } catch {
    /* ignore */
  }
}

/** Start / resume piano (+ home thunder if on that page). Soft thunder is page-driven. */
export function playAllAmbient() {
  const piano = getPianoEl();
  const thunder = getThunderEl();
  let pianoOk = false;

  if (piano) {
    try {
      if (!piano.src) piano.src = resolveUrl(PIANO_SRC);
      piano.muted = false;
      piano.volume = ambientIsDucked ? PIANO_DUCK_VOLUME : PIANO_VOLUME;
      const p = piano.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          try {
            piano.src = resolveUrl(PIANO_SRC_PRIMARY);
            piano.muted = false;
            piano.volume = ambientIsDucked ? PIANO_DUCK_VOLUME : PIANO_VOLUME;
            piano.play().catch(() => {});
          } catch {
            /* ignore */
          }
        });
      }
      pianoOk = true;
    } catch {
      pianoOk = false;
    }
  }

  if (thunder) {
    try {
      thunder.muted = false;
      thunder.volume = THUNDER_VOLUME;
      thunder.loop = true;
      thunder.play().catch(() => {});
      // Home owns the rumble — hush the soft bed
      stopSoftThunder();
    } catch {
      /* ignore */
    }
  } else {
    // Resume soft thunder if a lightning page left it requested
    try {
      if (document.documentElement.dataset.sssSoftThunder === "1") {
        playSoftThunder();
      }
    } catch {
      /* ignore */
    }
  }

  return pianoOk;
}

export function playPianoNow() {
  return playAllAmbient();
}

export function stopPianoNow() {
  stopAllAmbient();
}

/** Lower rain/thunder under book hover narration so the voice can be heard. */
export function duckAmbientForNarration() {
  ambientIsDucked = true;
  const piano = getPianoEl();
  const thunder = getThunderEl();
  const soft = getSoftThunderEl();
  try {
    if (piano && !piano.paused && !piano.muted) piano.volume = PIANO_DUCK_VOLUME;
    if (thunder && !thunder.paused && !thunder.muted) thunder.volume = THUNDER_DUCK_VOLUME;
    if (soft && !soft.paused && !soft.muted) soft.volume = SOFT_THUNDER_DUCK_VOLUME;
  } catch {
    /* ignore */
  }
}

let htmlAudioUnlocked = false;

export function markHtmlAudioUnlocked() {
  htmlAudioUnlocked = true;
  try {
    sessionStorage.setItem("sss-html-audio-unlocked", "1");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sss-audio-unlocked"));
  }
}

export function isHtmlAudioUnlocked() {
  if (htmlAudioUnlocked) return true;
  try {
    if (sessionStorage.getItem("sss-html-audio-unlocked") === "1") {
      htmlAudioUnlocked = true;
      return true;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Use during a click/tap so later in-view play() is allowed. */
export async function primeAudioElement(el) {
  if (!el) return false;
  try {
    const vol = el.volume;
    el.muted = true;
    el.volume = 0;
    const p = el.play();
    if (p && typeof p.then === "function") await p;
    el.pause();
    el.currentTime = 0;
    el.muted = false;
    el.volume = vol > 0 ? vol : 1;
    markHtmlAudioUnlocked();
    return true;
  } catch {
    return false;
  }
}

/** Restore rain/thunder after hover narration ends. */
export function restoreAmbientAfterNarration() {
  if (!ambientIsDucked) return;
  ambientIsDucked = false;
  const piano = getPianoEl();
  const thunder = getThunderEl();
  const soft = getSoftThunderEl();
  try {
    if (piano && !piano.paused && !piano.muted) piano.volume = PIANO_VOLUME;
    if (thunder && !thunder.paused && !thunder.muted) thunder.volume = THUNDER_VOLUME;
    if (soft && !soft.paused && !soft.muted) soft.volume = SOFT_THUNDER_VOLUME;
  } catch {
    /* ignore */
  }
}
