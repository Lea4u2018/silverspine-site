import { useEffect, useRef, useState } from "react";
import { CHAPTER_ONE_WHEEL, WHEEL_MUSIC } from "@/lib/chapterOneWheel";
import { duckAmbientForNarration, restoreAmbientAfterNarration } from "@/lib/cinematicAudio";

const PLAT = "#c9ced6";
const GOLD = "#dfcfb5";
const CARD_W = 312;
const CARD_H = 330;
/** Only these cards exist in 3D. The full Book One list (38) rotates through them, one face-on at a time. */
const SLOTS = 4;
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

export default function CharacterWheel({ faces = CHAPTER_ONE_WHEEL }) {
  const list = Array.isArray(faces) ? faces : [];
  const n = list.length || 1;
  const step = 360 / SLOTS;
  const radius = Math.round((CARD_H * 0.58) / Math.tan(Math.PI / SLOTS));
  const [musicOn, setMusicOn] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [spinning, setSpinning] = useState(true);
  const [scoreVol, setScoreVol] = useState(0.55);
  const scoreVolRef = useRef(0.55);
  const audioRef = useRef(null);
  const boxRef = useRef(null);
  const inViewRef = useRef(false);
  const userMutedRef = useRef(false);
  const slotEls = useRef([]);
  const ringRef = useRef(null);
  const nameRef = useRef(null);
  const lineRef = useRef(null);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const heldRef = useRef(false);
  const originRef = useRef(0);
  const frontRef = useRef(0);
  const drag = useRef({ active: false, startY: 0, startAngle: 0 });
  const reduceRef = useRef(false);
  const resumeTimer = useRef(null);
  const listRef = useRef(list);
  const nRef = useRef(n);
  const stepRef = useRef(step);
  listRef.current = list;
  nRef.current = n;
  stepRef.current = step;

  const writeCaption = (idx) => {
    const face = listRef.current[idx];
    if (!face) return;
    if (nameRef.current) nameRef.current.textContent = face.name || "";
    if (lineRef.current) lineRef.current.textContent = face.line || "";
  };

  const slotOffset = (slot) => {
    if (slot === 0) return 0;
    const half = SLOTS / 2;
    if (slot < half) return slot;
    if (slot === half && SLOTS % 2 === 0) return slot;
    return slot - SLOTS;
  };

  const faceIndex = (slot) => {
    const count = nRef.current;
    return ((originRef.current + slotOffset(slot)) % count + count) % count;
  };

  const paintSlot = (slot) => {
    const el = slotEls.current[slot];
    if (!el) return;
    const face = listRef.current[faceIndex(slot)];
    const img = el.querySelector("[data-wheel-img]");
    const mystery = el.querySelector("[data-wheel-mystery]");
    const plate = el.querySelector("[data-wheel-plate]");
    const plateName = el.querySelector("[data-wheel-plate-name]");
    if (!face) return;
    if (face.mystery) {
      if (img) img.hidden = true;
      if (mystery) mystery.hidden = false;
      if (plate) plate.hidden = false;
      if (plateName) plateName.textContent = "Guess Who";
      return;
    }
    if (mystery) mystery.hidden = true;
    if (img) {
      img.hidden = false;
      if (face.src && img.getAttribute("src") !== face.src) {
        img.setAttribute("src", face.src);
      }
      img.alt = face.name || "";
    }
    if (face.nameplate) {
      if (plate) plate.hidden = false;
      if (plateName) plateName.textContent = face.name || "";
    } else if (plate) {
      plate.hidden = true;
    }
  };

  const applyAngle = (a) => {
    const count = nRef.current;
    const deg = stepRef.current;
    const wrapAt = deg * 0.9;
    let next = a;
    let origin = originRef.current;
    let shifted = false;
    while (next >= wrapAt) {
      next -= deg;
      origin = (origin - 1 + count) % count;
      shifted = true;
    }
    while (next < -wrapAt) {
      next += deg;
      origin = (origin + 1) % count;
      shifted = true;
    }
    angleRef.current = next;
    originRef.current = origin;
    if (shifted) paintSlot(0);
    const ring = ringRef.current;
    if (ring) {
      ring.style.transform = `rotateX(${next}deg)`;
    }
    if (shifted) {
      for (let i = 1; i < SLOTS; i += 1) paintSlot(i);
    }
    const faceUp = Math.abs(next) < deg * 0.12;
    if (faceUp) {
      const front = faceIndex(0);
      if (front !== frontRef.current) {
        frontRef.current = front;
        writeCaption(front);
      }
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    let el = document.getElementById("sss-wheel-score");
    if (!el) {
      el = document.createElement("audio");
      el.id = "sss-wheel-score";
      el.setAttribute("data-wheel-score", "true");
      el.src = WHEEL_MUSIC.src;
      el.loop = true;
      el.preload = "auto";
      el.setAttribute("playsinline", "true");
      document.body.appendChild(el);
    }
    audioRef.current = el;
    const vol = readWheelVolume();
    scoreVolRef.current = vol;
    setScoreVol(vol);
    el.volume = vol;
    listRef.current.forEach((face) => {
      if (!face?.src) return;
      const img = new Image();
      img.src = face.src;
    });
    reduceRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    applyAngle(0);
    for (let i = 0; i < SLOTS; i += 1) paintSlot(i);
    return () => {
      silenceWheelMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduceRef.current) return undefined;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      if (!pausedRef.current && !heldRef.current) {
        applyAngle(angleRef.current + dt * ((stepRef.current * 0.9) / (SECONDS_PER_FACE * 1000)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const startWheelMusic = async () => {
    if (userMutedRef.current || !inViewRef.current) return false;
    const el = audioRef.current;
    if (!el) return false;
    el.loop = true;
    el.muted = false;
    el.volume = scoreVolRef.current;
    try {
      duckAmbientForNarration();
      await el.play();
      if (!inViewRef.current || userMutedRef.current) {
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
    const box = boxRef.current;
    if (!box) return undefined;
    const feed = box.closest(".blog-feed");

    const cardIsOn = () => {
      const r = box.getBoundingClientRect();
      if (r.height < 8) return false;
      const vh = window.innerHeight || 0;
      const windowHit = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (windowHit / r.height < 0.45) return false;
      if (!feed) return true;
      const f = feed.getBoundingClientRect();
      const feedHit = Math.min(r.bottom, f.bottom) - Math.max(r.top, f.top);
      return feedHit / r.height >= 0.45;
    };

    const sync = () => {
      const on = cardIsOn();
      const was = inViewRef.current;
      inViewRef.current = on;
      if (!on) {
        silenceWheelMusic();
        return;
      }
      if (!was && on && !userMutedRef.current) startWheelMusic();
    };

    let raf = 0;
    const onMove = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    feed?.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", onMove);
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
      io = new IntersectionObserver(onMove, {
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
        root: feed || null,
      });
      io.observe(box);
    }
    sync();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      feed?.removeEventListener("scroll", onMove);
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", onMove);
      document.removeEventListener("visibilitychange", onHidden);
      inViewRef.current = false;
      silenceWheelMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStagePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pausedRef.current = true;
    drag.current = { active: true, startY: e.clientY, startAngle: angleRef.current };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onStagePointerMove = (e) => {
    if (!drag.current.active) return;
    applyAngle(drag.current.startAngle + (e.clientY - drag.current.startY) * 0.38);
  };

  const onStagePointerUp = () => {
    drag.current.active = false;
    pausedRef.current = false;
  };

  const snapToNearestFace = () => {
    const deg = stepRef.current;
    applyAngle(Math.round(angleRef.current / deg) * deg);
  };

  const pauseThenResume = (ms = 900) => {
    pausedRef.current = true;
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    if (heldRef.current) {
      pausedRef.current = false;
      return;
    }
    resumeTimer.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, ms);
  };

  const toggleSpin = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    if (heldRef.current) {
      heldRef.current = false;
      pausedRef.current = false;
      setSpinning(true);
      return;
    }
    heldRef.current = true;
    pausedRef.current = false;
    snapToNearestFace();
    setSpinning(false);
  };

  const toggleMusic = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMusicError("");
    const el = audioRef.current;
    if (!el) {
      setMusicError("Player missing");
      return;
    }
    if (!el.paused || musicOn) {
      userMutedRef.current = true;
      silenceWheelMusic();
      return;
    }
    userMutedRef.current = false;
    const ok = await startWheelMusic();
    if (!ok) setMusicError("Tap Play score again");
  };

  const spinBy = (dir, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    pauseThenResume(900);
    applyAngle(angleRef.current + dir * stepRef.current);
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
      if (next <= 0) {
        el.muted = true;
      } else if (musicOn) {
        el.muted = false;
      }
    }
  };

  const guardControlPointer = (e) => {
    e.stopPropagation();
  };

  if (!list.length) return null;

  const first = list[0];

  return (
    <figure ref={boxRef} className="blog-media-card character-wheel-card mb-4">
      <div className="character-wheel" role="region" aria-roledescription="carousel" aria-label="Book One faces">
        <div className="character-wheel-caption">
          <span ref={nameRef} className="character-wheel-name">
            {first?.name}
          </span>
          <span ref={lineRef} className="character-wheel-line">
            {first?.line || ""}
          </span>
        </div>
        <div
          className="character-wheel-controls"
          onPointerDown={guardControlPointer}
          onPointerUp={guardControlPointer}
          onClick={guardControlPointer}
        >
          <button type="button" onClick={(e) => spinBy(1, e)} aria-label="Previous face">
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
          <button type="button" onClick={(e) => spinBy(-1, e)} aria-label="Next face">
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
          <div className="character-wheel-scene">
            <div ref={ringRef} className="character-wheel-ring">
              {Array.from({ length: SLOTS }, (_, i) => (
                <div
                  key={`slot-${i}`}
                  ref={(el) => {
                    slotEls.current[i] = el;
                  }}
                  className="character-wheel-slot"
                  style={{
                    transform: `rotateX(${i * step}deg) translateZ(${radius}px)`,
                  }}
                >
                  <img data-wheel-img alt="" draggable="false" decoding="async" />
                  <div className="character-wheel-mystery" data-wheel-mystery hidden aria-hidden="true">
                    ?
                  </div>
                  <div className="character-wheel-oncard" data-wheel-plate hidden>
                    <span className="character-wheel-oncard-name" data-wheel-plate-name />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="character-wheel-credit">{WHEEL_MUSIC.credit}</p>
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
        }
        .character-wheel-name {
          display: block;
          color: ${GOLD};
          font-weight: 700;
          letter-spacing: 0.04em;
          font-size: 1.2rem;
        }
        .character-wheel-line {
          display: block;
          color: ${PLAT};
          font-size: 0.9rem;
          margin-top: 0.15rem;
          min-height: 1.2em;
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
          height: 520px;
          overflow: hidden;
          cursor: ns-resize;
          touch-action: none;
        }
        .character-wheel-scene {
          width: 100%;
          height: 100%;
          perspective: 1600px;
          perspective-origin: 50% 50%;
        }
        .character-wheel-ring {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          transform: rotateX(0deg);
        }
        .character-wheel-slot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          margin-left: -${CARD_W / 2}px;
          margin-top: -${CARD_H / 2}px;
          box-sizing: border-box;
          padding: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(201, 206, 214, 0.4);
          background: #07080c;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          pointer-events: none;
        }
        .character-wheel-slot img[hidden],
        .character-wheel-mystery[hidden],
        .character-wheel-oncard[hidden] {
          display: none !important;
        }
        .character-wheel-slot img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 50%;
          pointer-events: none;
          background: #07080c;
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
          pointer-events: none;
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
        .character-wheel-mystery {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 2.4rem;
          font-size: 5.2rem;
          font-weight: 700;
          color: ${PLAT};
          background: radial-gradient(circle at 50% 40%, #1a1e28, #05060a 72%);
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
      `}</style>
    </figure>
  );
}
