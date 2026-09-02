import { useEffect, useRef, useState } from "react";
import { CHAPTER_ONE_WHEEL, WHEEL_MUSIC } from "@/lib/chapterOneWheel";
import { duckAmbientForNarration, restoreAmbientAfterNarration } from "@/lib/cinematicAudio";

const PLAT = "#c9ced6";
const GOLD = "#dfcfb5";
const CARD_W = 312;
const CARD_H = 330;
/** Only these cards exist in 3D. The full Book One list (38) rotates through them, one face-on at a time. */
const SLOTS = 4;

export default function CharacterWheel({ faces = CHAPTER_ONE_WHEEL }) {
  const list = Array.isArray(faces) ? faces : [];
  const n = list.length || 1;
  const step = 360 / SLOTS;
  const radius = Math.round((CARD_H * 0.58) / Math.tan(Math.PI / SLOTS));
  const [origin, setOrigin] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [spinning, setSpinning] = useState(true);
  const audioRef = useRef(null);
  const boxRef = useRef(null);
  const inViewRef = useRef(false);
  const userMutedRef = useRef(false);
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
    if (shifted) setOrigin(origin);
    const ring = ringRef.current;
    if (ring) {
      ring.style.transform = `rotateX(${next}deg)`;
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
    reduceRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    applyAngle(0);
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
        applyAngle(angleRef.current + dt * 0.0055);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const silenceWheelMusic = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    restoreAmbientAfterNarration();
    setMusicOn(false);
    setMusicError("");
  };

  const startWheelMusic = async () => {
    if (userMutedRef.current || !inViewRef.current) return false;
    const el = audioRef.current;
    if (!el) return false;
    el.loop = true;
    el.muted = false;
    el.volume = 0.9;
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
    if (!box || typeof IntersectionObserver === "undefined") return undefined;

    const setVisible = (visible) => {
      inViewRef.current = visible;
      if (visible) startWheelMusic();
      else silenceWheelMusic();
    };

    const onEntry = (entries) => {
      const hit = entries[0];
      const ratio = hit?.intersectionRatio || 0;
      setVisible(!!(hit?.isIntersecting && ratio >= 0.2));
    };

    const opts = { threshold: [0, 0.12, 0.2, 0.35, 0.5, 0.75, 1] };
    const feed = box.closest(".blog-feed");
    const watchers = [new IntersectionObserver(onEntry, opts)];
    if (feed) watchers.push(new IntersectionObserver(onEntry, { ...opts, root: feed }));
    watchers.forEach((io) => io.observe(box));

    const onScrollAway = () => {
      const feedBox = feed?.getBoundingClientRect();
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const inWindow = r.bottom > 80 && r.top < vh - 80;
      const inFeed = feedBox
        ? r.bottom > feedBox.top + 24 && r.top < feedBox.bottom - 24
        : true;
      if (!inWindow || !inFeed) setVisible(false);
    };
    feed?.addEventListener("scroll", onScrollAway, { passive: true });
    window.addEventListener("scroll", onScrollAway, { passive: true });

    const onGesture = () => {
      if (inViewRef.current && !userMutedRef.current) startWheelMusic();
    };
    window.addEventListener("pointerdown", onGesture, { capture: true });

    return () => {
      watchers.forEach((io) => io.disconnect());
      feed?.removeEventListener("scroll", onScrollAway);
      window.removeEventListener("scroll", onScrollAway);
      window.removeEventListener("pointerdown", onGesture, { capture: true });
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
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
    if (musicOn && !el.paused) {
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
              {Array.from({ length: SLOTS }, (_, i) => {
                const face = list[faceIndex(i)] || list[0];
                if (!face) return null;
                return (
                <div
                  key={`slot-${i}`}
                  className="character-wheel-slot"
                  style={{
                    transform: `rotateX(${i * step}deg) translateZ(${radius}px)`,
                  }}
                >
                  {face.mystery ? (
                    <div className="character-wheel-mystery" aria-hidden="true">
                      ?
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={face.src} alt={face.name || ""} draggable="false" decoding="async" />
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="character-wheel-credit">{WHEEL_MUSIC.credit}</p>
        <audio
          ref={audioRef}
          src={WHEEL_MUSIC.src}
          preload="auto"
          loop
          playsInline
        />
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
        .character-wheel-slot img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 50%;
          pointer-events: none;
        }
        .character-wheel-mystery {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6.4rem;
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
