import { useEffect, useMemo, useRef, useState } from "react";
import { CHAPTER_ONE_WHEEL, WHEEL_MUSIC } from "@/lib/chapterOneWheel";

const PLAT = "#c9ced6";
const GOLD = "#dfcfb5";

export default function CharacterWheel({ faces = CHAPTER_ONE_WHEEL }) {
  const list = Array.isArray(faces) ? faces : [];
  const n = list.length || 1;
  const step = 360 / n;
  const radius = Math.round(68 / Math.tan(Math.PI / n));
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);
  const drag = useRef({ active: false, startY: 0, startAngle: 0 });
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reduce.current || paused) return undefined;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      setAngle((a) => a + dt * 0.012);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const front = useMemo(() => {
    const idx = Math.round((-angle / step) % n);
    return ((idx % n) + n) % n;
  }, [angle, n, step]);

  const onPointerDown = (e) => {
    drag.current = { active: true, startY: e.clientY, startAngle: angle };
    setPaused(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dy = e.clientY - drag.current.startY;
    setAngle(drag.current.startAngle + dy * 0.45);
  };

  const onPointerUp = () => {
    drag.current.active = false;
    setPaused(false);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;
    el.loop = true;
    if (musicOn) {
      const play = el.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    } else {
      el.pause();
    }
    return () => {
      el.pause();
    };
  }, [musicOn]);

  const spinBy = (dir) => {
    setAngle((a) => a + dir * step);
  };

  const frontFace = list[front];

  if (!list.length) return null;

  return (
    <figure className="blog-media-card character-wheel-card mb-4">
      <div
        className="character-wheel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (!drag.current.active) setPaused(false);
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Book One faces"
      >
        <div className="character-wheel-stage">
          <div
            className="character-wheel-ring"
            style={{ transform: `rotateX(${angle}deg)` }}
          >
            {list.map((face, i) => {
              const dist = Math.min(
                Math.abs(((i - front) % n) + n) % n,
                n - (Math.abs(((i - front) % n) + n) % n)
              );
              const isFront = i === front;
              return (
                <div
                  key={face.id}
                  className={`character-wheel-slot${isFront ? " is-front" : ""}`}
                  style={{
                    transform: `rotateX(${i * step}deg) translateZ(${radius}px)`,
                    zIndex: isFront ? 8 : 4 - dist,
                  }}
                >
                  {face.mystery ? (
                    <div className="character-wheel-mystery" aria-hidden="true">
                      ?
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={face.src} alt="" draggable="false" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <figcaption className="character-wheel-caption">
          <span className="character-wheel-name">{frontFace?.name}</span>
          {frontFace?.line ? <span className="character-wheel-line">{frontFace.line}</span> : null}
        </figcaption>
        <div className="character-wheel-controls" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => spinBy(1)} aria-label="Previous face">
            ▲
          </button>
          <button
            type="button"
            className={musicOn ? "is-on" : ""}
            onClick={() => setMusicOn((on) => !on)}
            aria-pressed={musicOn}
            aria-label={musicOn ? "Mute wheel music" : "Play wheel music"}
          >
            {musicOn ? "Mute" : "Music"}
          </button>
          <button type="button" onClick={() => spinBy(-1)} aria-label="Next face">
            ▼
          </button>
        </div>
        <p className="character-wheel-credit">{WHEEL_MUSIC.credit}</p>
        <audio ref={audioRef} src={WHEEL_MUSIC.src} preload="metadata" />
      </div>
      <style>{`
        .character-wheel-card {
          overflow: hidden;
        }
        .character-wheel {
          position: relative;
          padding: 0.75rem 0.75rem 0.5rem;
          touch-action: pan-y;
          cursor: ns-resize;
          user-select: none;
        }
        .character-wheel-stage {
          height: 360px;
          perspective: 1100px;
          perspective-origin: 50% 48%;
        }
        .character-wheel-ring {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 40ms linear;
        }
        .character-wheel-slot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 132px;
          height: 168px;
          margin-left: -66px;
          margin-top: -84px;
          border-radius: 0.65rem;
          overflow: hidden;
          border: 1px solid rgba(201, 206, 214, 0.45);
          background: #07080c;
          backface-visibility: hidden;
          filter: grayscale(0.55) brightness(0.45);
          opacity: 0.55;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
        }
        .character-wheel-slot.is-front {
          filter: none;
          opacity: 1;
          border-color: ${PLAT};
          box-shadow: 0 0 0 1px ${PLAT}, 0 16px 36px rgba(0, 0, 0, 0.55);
        }
        .character-wheel-slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 18%;
          pointer-events: none;
        }
        .character-wheel-mystery {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5.2rem;
          font-weight: 700;
          color: ${PLAT};
          background: radial-gradient(circle at 50% 40%, #1a1e28, #05060a 72%);
        }
        .character-wheel-caption {
          text-align: center;
          padding: 0.65rem 0.5rem 0.15rem;
          min-height: 3.1rem;
        }
        .character-wheel-name {
          display: block;
          color: ${GOLD};
          font-weight: 700;
          letter-spacing: 0.04em;
          font-size: 1.05rem;
        }
        .character-wheel-line {
          display: block;
          color: ${PLAT};
          font-size: 0.82rem;
          margin-top: 0.15rem;
        }
        .character-wheel-controls {
          display: flex;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.15rem 0 0.35rem;
        }
        .character-wheel-controls button.is-on {
          border-color: ${GOLD};
          color: ${GOLD};
        }
        .character-wheel-controls button {
          min-width: 2.1rem;
          width: auto;
          padding: 0 0.55rem;
          height: 2.1rem;
          border-radius: 999px;
          border: 1px solid rgba(201, 206, 214, 0.45);
          background: rgba(0, 0, 0, 0.45);
          color: ${PLAT};
          font-size: 0.75rem;
          line-height: 1;
        }
        .character-wheel-controls button:hover {
          border-color: ${GOLD};
          color: ${GOLD};
        }
        .character-wheel-credit {
          text-align: center;
          color: rgba(201, 206, 214, 0.7);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          margin: 0.15rem 0 0.25rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .character-wheel-ring {
            transition: none;
          }
        }
      `}</style>
    </figure>
  );
}
