import { useEffect, useRef, useState } from "react";
import { BOOK_TWO_TABLE, CHAPTER_ONE_WHEEL, MYSTERY_CHAIR_SRC, WHEEL_MUSIC } from "@/lib/chapterOneWheel";
import { duckAmbientForNarration, restoreAmbientAfterNarration, markHtmlAudioUnlocked, primeAudioElement } from "@/lib/cinematicAudio";

const PLAT = "#c9ced6";
const GOLD = "#dfcfb5";
const SECONDS_PER_FACE = 7;
const WHEEL_VOL_KEY = "sss-wheel-score-volume";

function readWheelVolume() {
  if (typeof window === "undefined") return 0.55;
  try {
    const n = parseFloat(window.localStorage.getItem(WHEEL_VOL_KEY) || "");
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  } catch {
    /* ignore */
  }
  return 0.55;
}

function wrapIndex(i, n) {
  if (!n) return 0;
  return ((i % n) + n) % n;
}

export default function CharacterWheel({ faces = CHAPTER_ONE_WHEEL }) {
  const list = Array.isArray(faces) ? faces : [];
  const n = list.length || 1;
  const [musicOn, setMusicOn] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [spinning, setSpinning] = useState(true);
  const [scoreVol, setScoreVol] = useState(0.55);
  const [idx, setIdx] = useState(0);
  const [showA, setShowA] = useState(true);
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(0);
  const scoreVolRef = useRef(0.55);
  const audioRef = useRef(null);
  const boxRef = useRef(null);
  const inViewRef = useRef(false);
  const userMutedRef = useRef(false);
  const idxRef = useRef(0);
  const showARef = useRef(true);
  const spinningRef = useRef(true);
  const listRef = useRef(list);
  const nRef = useRef(n);
  const resumeTimer = useRef(null);
  const drag = useRef({ active: false, startY: 0, done: false });
  listRef.current = list;
  nRef.current = n;
  spinningRef.current = spinning;

  const faceAt = (i) => listRef.current[wrapIndex(i, nRef.current)];

  const writeCaption = (i) => {
    const face = faceAt(i);
    const nameEl = boxRef.current?.querySelector("[data-wheel-name]");
    const lineEl = boxRef.current?.querySelector("[data-wheel-line]");
    if (nameEl) nameEl.textContent = face?.name || "";
    if (lineEl) lineEl.textContent = face?.line || "";
  };

  const goTo = (next) => {
    const wrapped = wrapIndex(next, nRef.current);
    if (wrapped === idxRef.current) return;
    const useA = !showARef.current;
    showARef.current = useA;
    idxRef.current = wrapped;
    setIdx(wrapped);
    setShowA(useA);
    if (useA) setSlotA(wrapped);
    else setSlotB(wrapped);
    writeCaption(wrapped);
  };

  const ensureWheelAudio = () => {
    if (typeof document === "undefined") return null;
    let el = audioRef.current;
    if (!el || !el.isConnected) {
      el = document.getElementById("sss-wheel-score");
    }
    if (!el) {
      el = document.createElement("audio");
      el.id = "sss-wheel-score";
      el.setAttribute("data-wheel-score", "true");
      el.loop = true;
      el.preload = "auto";
      el.setAttribute("playsinline", "true");
      el.src = WHEEL_MUSIC.src;
      document.body.appendChild(el);
    } else if (!el.isConnected) {
      document.body.appendChild(el);
    }
    if (!String(el.currentSrc || el.src || "").includes("behind-the-shadow")) {
      el.src = WHEEL_MUSIC.src;
    }
    el.loop = true;
    audioRef.current = el;
    return el;
  };

  const silenceWheelMusic = () => {
    const kill = (el) => {
      if (!el) return;
      try {
        el.pause();
        el.muted = true;
        el.volume = 0;
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
    kill(audioRef.current);
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio[data-wheel-score], audio#sss-wheel-score").forEach(kill);
    }
    setMusicOn(false);
    setMusicError("");
  };

  const startWheelMusic = async ({ fromUser = false } = {}) => {
    if (userMutedRef.current && !fromUser) return false;
    if (!fromUser && !inViewRef.current) return false;
    const el = ensureWheelAudio();
    if (!el) return false;
    el.loop = true;
    el.muted = false;
    el.volume = scoreVolRef.current;
    if (!el.paused && !el.muted) {
      setMusicOn(true);
      setMusicError("");
      return true;
    }
    try {
      duckAmbientForNarration();
      await el.play();
      if (userMutedRef.current) {
        silenceWheelMusic();
        return false;
      }
      if (!fromUser && !inViewRef.current) {
        silenceWheelMusic();
        return false;
      }
      setMusicOn(true);
      setMusicError("");
      return true;
    } catch {
      restoreAmbientAfterNarration();
      setMusicOn(false);
      return false;
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const el = ensureWheelAudio();
    const vol = readWheelVolume();
    scoreVolRef.current = vol;
    setScoreVol(vol);
    if (el) el.volume = vol;
    listRef.current.forEach((face) => {
      if (!face?.src) return;
      const img = new Image();
      img.src = face.src;
    });
    writeCaption(0);
    return () => {
      silenceWheelMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!spinningRef.current) return;
      goTo(idxRef.current + 1);
    }, SECONDS_PER_FACE * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const feed = box.closest(".blog-feed");

    const cardIsOn = () => {
      const target = box.querySelector(".character-wheel-stage") || box;
      const r = target.getBoundingClientRect();
      if (r.height < 8) return false;
      const vh = window.innerHeight || 0;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const ratio = visible / r.height;
      if (inViewRef.current) return ratio >= 0.08;
      return ratio >= 0.2;
    };

    const sync = () => {
      const on = cardIsOn();
      inViewRef.current = on;
      if (!on) {
        silenceWheelMusic();
        return;
      }
      if (!userMutedRef.current) startWheelMusic();
    };

    let raf = 0;
    const onMove = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    const onGesture = (e) => {
      if (e?.type === "sss-piano-mute" && e.detail?.muted) return;
      const hit = e?.target;
      if (hit && typeof hit.closest === "function" && hit.closest(".character-wheel-controls")) {
        return;
      }
      markHtmlAudioUnlocked();
      const audioEl = ensureWheelAudio();
      if (e?.type === "pointerdown" || e?.type === "keydown") {
        if (inViewRef.current && !userMutedRef.current) {
          startWheelMusic({ fromUser: true });
        } else {
          primeAudioElement(audioEl);
        }
        return;
      }
      if (inViewRef.current && !userMutedRef.current) startWheelMusic();
    };

    feed?.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", onMove);
    window.addEventListener("pointerdown", onGesture, { capture: true });
    window.addEventListener("keydown", onGesture, { capture: true });
    window.addEventListener("sss-piano-mute", onGesture);
    window.addEventListener("sss-audio-unlocked", onGesture);
    const onHidden = () => {
      if (document.hidden) {
        inViewRef.current = false;
        silenceWheelMusic();
      } else {
        sync();
      }
    };
    document.addEventListener("visibilitychange", onHidden);

    let io;
    if (typeof IntersectionObserver !== "undefined") {
      const stage = box.querySelector(".character-wheel-stage") || box;
      io = new IntersectionObserver(onMove, {
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
        root: null,
      });
      io.observe(stage);
    }
    sync();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      feed?.removeEventListener("scroll", onMove);
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", onMove);
      window.removeEventListener("pointerdown", onGesture, { capture: true });
      window.removeEventListener("keydown", onGesture, { capture: true });
      window.removeEventListener("sss-piano-mute", onGesture);
      window.removeEventListener("sss-audio-unlocked", onGesture);
      document.removeEventListener("visibilitychange", onHidden);
      inViewRef.current = false;
      silenceWheelMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pauseThenResume = (ms = 900) => {
    spinningRef.current = false;
    setSpinning(false);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      spinningRef.current = true;
      setSpinning(true);
    }, ms);
  };

  const toggleSpin = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    const next = !spinningRef.current;
    spinningRef.current = next;
    setSpinning(next);
  };

  const toggleMusic = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMusicError("");
    const el = ensureWheelAudio();
    if (!el) return;
    if (musicOn || (!el.paused && !el.muted && el.volume > 0)) {
      userMutedRef.current = true;
      silenceWheelMusic();
      return;
    }
    userMutedRef.current = false;
    inViewRef.current = true;
    await startWheelMusic({ fromUser: true });
  };

  const spinBy = (dir, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    pauseThenResume(900);
    goTo(idxRef.current + dir);
  };

  const onStagePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { active: true, startY: e.clientY, done: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (!userMutedRef.current) {
      inViewRef.current = true;
      startWheelMusic({ fromUser: true });
    }
  };

  const onStagePointerMove = (e) => {
    if (!drag.current.active || drag.current.done) return;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dy) < 48) return;
    drag.current.done = true;
    pauseThenResume(900);
    goTo(idxRef.current + (dy > 0 ? 1 : -1));
  };

  const onStagePointerUp = () => {
    drag.current.active = false;
  };

  const onScoreVolume = (e) => {
    e.stopPropagation();
    const next = Math.min(1, Math.max(0, Number(e.target.value) / 100));
    scoreVolRef.current = next;
    setScoreVol(next);
    try {
      window.localStorage.setItem(WHEEL_VOL_KEY, String(next));
    } catch {
      /* ignore */
    }
    const el = audioRef.current;
    if (el && !userMutedRef.current) {
      el.volume = next;
      if (next <= 0) el.muted = true;
      else if (musicOn) el.muted = false;
    }
  };

  const guardControlPointer = (e) => {
    e.stopPropagation();
  };

  if (!list.length) return null;

  const first = list[0];
  const faceA = faceAt(slotA);
  const faceB = faceAt(slotB);
  const front = faceAt(idx);

  const renderFace = (face, on) => {
    if (!face) return null;
    const src = face.mystery ? face.src || MYSTERY_CHAIR_SRC : face.src;
    return (
      <div className={`character-wheel-shot${on ? " is-on" : ""}`}>
        <img
          src={src}
          alt={face.name || ""}
          draggable="false"
          decoding="async"
          data-mystery-chair={face.mystery ? "true" : undefined}
        />
        {face.nameplate ? (
          <div className="character-wheel-oncard">
            <span className="character-wheel-oncard-name">{face.name}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <figure ref={boxRef} className="blog-media-card character-wheel-card mb-4">
      <div className="character-wheel" role="region" aria-roledescription="carousel" aria-label="Book One faces">
        <div className="character-wheel-caption">
          <span className="character-wheel-name" data-wheel-name>
            {front?.name || first?.name}
          </span>
          <span className="character-wheel-line" data-wheel-line>
            {front?.line || first?.line || ""}
          </span>
        </div>
        <div
          className="character-wheel-controls"
          onPointerDown={guardControlPointer}
          onPointerUp={guardControlPointer}
          onClick={guardControlPointer}
        >
          <button type="button" onClick={(e) => spinBy(-1, e)} aria-label="Previous face">
            ▲
          </button>
          <button
            type="button"
            className={spinning ? "" : "is-on"}
            onClick={toggleSpin}
            aria-pressed={!spinning}
            aria-label={spinning ? "Stop carousel" : "Spin carousel"}
          >
            {spinning ? "Stop" : "Spin"}
          </button>
          <button
            type="button"
            className={musicOn ? "is-on" : ""}
            onPointerDown={guardControlPointer}
            onClick={toggleMusic}
            aria-pressed={musicOn}
            aria-label={musicOn ? "Mute character score" : "Play character score"}
          >
            {musicOn ? "Mute score" : "Play score"}
          </button>
          <button type="button" onClick={(e) => spinBy(1, e)} aria-label="Next face">
            ▼
          </button>
          <label className="character-wheel-vol">
            <span>Vol</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(scoreVol * 100)}
              onChange={onScoreVolume}
              onPointerDown={guardControlPointer}
              aria-label="Carousel score volume"
            />
          </label>
        </div>
        {musicError ? <p className="character-wheel-error">{musicError}</p> : null}
        <div
          className="character-wheel-stage"
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerUp}
          onPointerCancel={onStagePointerUp}
        >
          {renderFace(faceA, showA)}
          {renderFace(faceB, !showA)}
        </div>
        <p className="character-wheel-credit">{WHEEL_MUSIC.credit}</p>
        <div className="character-wheel-book2">
          <p className="character-wheel-book2-label">Book Two · Shadows of a Ghost — not on this wheel</p>
          {BOOK_TWO_TABLE.map((row) => (
            <p key={row.name} className="character-wheel-book2-row">
              <strong>{row.name}</strong>
              {row.line ? ` · ${row.line}` : ""}
            </p>
          ))}
        </div>
      </div>
      <style>{`
        .character-wheel-card {
          overflow: visible !important;
          isolation: isolate;
        }
        .character-wheel {
          position: relative;
          z-index: 1;
          padding: 0.85rem 0.75rem 0.5rem;
          user-select: none;
        }
        .character-wheel-caption {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 0.15rem 0.5rem 0.35rem;
          min-height: 3.2rem;
          line-height: 1.3;
        }
        .character-wheel-name {
          display: block;
          color: ${GOLD};
          font-weight: 700;
          letter-spacing: 0.04em;
          font-size: 1.2rem;
          line-height: 1.3;
        }
        .character-wheel-line {
          display: block;
          color: ${PLAT};
          font-size: 0.9rem;
          margin-top: 0.15rem;
          min-height: 1.2em;
          line-height: 1.3;
        }
        .character-wheel-controls {
          position: relative;
          z-index: 6;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          padding: 0 0 0.55rem;
          pointer-events: auto;
        }
        .character-wheel-controls button {
          min-width: 2.1rem;
          width: auto;
          padding: 0 0.7rem;
          height: 2.2rem;
          border-radius: 999px;
          border: 1px solid rgba(201, 206, 214, 0.45);
          background: rgba(0, 0, 0, 0.65);
          color: ${PLAT};
          font-size: 0.75rem;
          line-height: 1;
          cursor: pointer;
          touch-action: manipulation;
        }
        .character-wheel-controls button.is-on {
          border-color: ${GOLD};
          color: ${GOLD};
        }
        .character-wheel-controls button:hover {
          border-color: ${GOLD};
          color: ${GOLD};
        }
        .character-wheel-vol {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          height: 2.2rem;
          padding: 0 0.7rem 0 0.75rem;
          border-radius: 999px;
          border: 1px solid rgba(201, 206, 214, 0.45);
          background: rgba(0, 0, 0, 0.65);
          color: ${PLAT};
          font-size: 0.75rem;
        }
        .character-wheel-vol input[type="range"] {
          width: 5.5rem;
          accent-color: ${GOLD};
          cursor: pointer;
        }
        .character-wheel-error {
          position: relative;
          z-index: 6;
          text-align: center;
          color: ${GOLD};
          font-size: 0.75rem;
          margin: 0 0 0.4rem;
        }
        .character-wheel-stage {
          position: relative;
          z-index: 1;
          height: 420px;
          overflow: hidden;
          cursor: ns-resize;
          touch-action: none;
          background: #07080c;
          border-radius: 0.75rem;
          border: 1px solid rgba(201, 206, 214, 0.4);
        }
        .character-wheel-shot {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.45s ease;
          pointer-events: none;
        }
        .character-wheel-shot.is-on {
          opacity: 1;
        }
        .character-wheel-shot img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 28%;
          background: #07080c;
        }
        .character-wheel-shot img[data-mystery-chair="true"] {
          object-position: 50% 42%;
        }
        .character-wheel-oncard {
          position: absolute;
          left: 9px;
          right: 9px;
          bottom: 9px;
          z-index: 3;
          padding: 0.48rem 0.4rem 0.45rem;
          border-radius: 0.35rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.62));
          text-align: center;
        }
        .character-wheel-oncard-name {
          display: block;
          color: ${GOLD};
          font-weight: 700;
          letter-spacing: 0.07em;
          font-size: 0.82rem;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .character-wheel-credit {
          position: relative;
          z-index: 5;
          text-align: center;
          color: rgba(201, 206, 214, 0.7);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          margin: 0.35rem 0 0.25rem;
        }
        .character-wheel-book2 {
          position: relative;
          z-index: 5;
          text-align: center;
          margin: 0.15rem 0 0.45rem;
          padding: 0.55rem 0.6rem 0.55rem;
          border-top: 1px solid rgba(201, 206, 214, 0.18);
          line-height: 1.35;
        }
        .character-wheel-book2-label {
          display: block;
          margin: 0;
          color: ${GOLD};
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          line-height: 1.4;
          text-transform: uppercase;
        }
        .character-wheel-book2-row {
          display: block;
          margin: 0.5rem 0 0;
          color: ${PLAT};
          font-size: 0.88rem;
          line-height: 1.35;
        }
        .character-wheel-book2-row strong {
          color: ${GOLD};
          font-weight: 700;
        }
      `}</style>
    </figure>
  );
}
