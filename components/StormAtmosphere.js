import { useEffect, useMemo } from "react";
import {
  playSoftThunder,
  readPianoMuted,
  stopSoftThunder,
} from "@/lib/cinematicAudio";

/**
 * Colorado-storm atmosphere — unique mood per page.
 * Lightning moods also run a soft thunder bed (muted with the Music control).
 */

const MOODS = {
  highway: {
    count: 30,
    seed: 5501,
    size: [1.5, 4.4],
    duration: [7, 14],
    opacity: [0.4, 0.9],
    drift: "hard",
    lightning: true,
  },
  porch: {
    count: 28,
    seed: 2207,
    size: [1.5, 4.1],
    duration: [8, 15],
    opacity: [0.4, 0.9],
    drift: "soft",
    lightning: true,
  },
  ember: {
    count: 24,
    seed: 9913,
    size: [1.3, 3.6],
    duration: [10, 17],
    opacity: [0.36, 0.78],
    drift: "soft",
    lightning: true,
  },
  ash: {
    count: 26,
    seed: 4044,
    size: [1.3, 3.8],
    duration: [11, 18],
    opacity: [0.36, 0.8],
    drift: "ash",
    lightning: true,
  },
  ridge: {
    count: 22,
    seed: 7781,
    size: [1.2, 3.5],
    duration: [9, 16],
    opacity: [0.34, 0.75],
    drift: "soft",
    lightning: true,
  },
  author: {
    count: 28,
    seed: 1812,
    size: [1.4, 4.0],
    duration: [8, 15],
    opacity: [0.38, 0.88],
    drift: "hard",
    lightning: true,
  },
  quiet: {
    count: 16,
    seed: 101,
    size: [1.2, 3.0],
    duration: [12, 20],
    opacity: [0.28, 0.58],
    drift: "soft",
    lightning: false,
  },
  threshold: {
    // Home — video + home thunder own the storm; keep rim snow only
    count: 18,
    seed: 3141,
    size: [1.3, 3.5],
    duration: [9, 15],
    opacity: [0.32, 0.72],
    drift: "soft",
    lightning: false,
  },
  noir: {
    count: 22,
    seed: 6677,
    size: [1.3, 3.7],
    duration: [9, 16],
    opacity: [0.35, 0.8],
    drift: "soft",
    lightning: true,
  },
};

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function StormAtmosphere({ mood = "highway" }) {
  const cfg = MOODS[mood] || MOODS.highway;
  const wantsThunder = !!cfg.lightning;

  const flakes = useMemo(() => {
    const rand = mulberry32(cfg.seed);
    return Array.from({ length: cfg.count }, (_, i) => {
      const t = rand();
      return {
        id: i,
        left: rand() * 100,
        delay: -(rand() * 16),
        duration: lerp(cfg.duration[0], cfg.duration[1], rand()),
        size: lerp(cfg.size[0], cfg.size[1], rand()),
        opacity: lerp(cfg.opacity[0], cfg.opacity[1], t),
        sway: lerp(8, 36, rand()),
      };
    });
  }, [cfg]);

  // Soft thunder whenever this page shows lightning (respects Music mute)
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (!wantsThunder) {
      try {
        delete document.documentElement.dataset.sssSoftThunder;
      } catch {
        /* ignore */
      }
      return undefined;
    }

    try {
      document.documentElement.dataset.sssSoftThunder = "1";
    } catch {
      /* ignore */
    }

    const sync = () => {
      if (readPianoMuted()) stopSoftThunder();
      else playSoftThunder();
    };

    sync();
    window.addEventListener("sss-piano-mute", sync);

    return () => {
      window.removeEventListener("sss-piano-mute", sync);
      try {
        delete document.documentElement.dataset.sssSoftThunder;
      } catch {
        /* ignore */
      }
      stopSoftThunder();
    };
  }, [wantsThunder, mood]);

  return (
    <div className={`sss-storm sss-storm--${mood}`} aria-hidden="true">
      <div className="sss-storm-mist" />
      <div className="sss-storm-vignette" />
      {wantsThunder ? <div className="sss-storm-flash" /> : null}
      <div className="sss-storm-snow">
        {flakes.map((f) => (
          <span
            key={f.id}
            className={`sss-flake sss-flake--${cfg.drift}`}
            style={{
              left: `${f.left}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              ["--sway"]: `${f.sway}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
