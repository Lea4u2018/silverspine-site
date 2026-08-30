import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const PALETTES = [
  ["#ff4d6d", "#ff8fa3", "#ffffff", "#ffd6e0"],
  ["#ffd60a", "#ff9f1c", "#fff3b0", "#ffffff"],
  ["#4cc9f0", "#4361ee", "#a5d8ff", "#ffffff"],
  ["#06d6a0", "#80ed99", "#d8f3dc", "#ffffff"],
  ["#f72585", "#b5179e", "#ff9eee", "#ffffff"],
  ["#a77a23", "#e8c547", "#ffe66d", "#ffffff"],
  ["#7b2cbf", "#c77dff", "#e0aaff", "#ffffff"],
];

const ROCKETS = [
  { t: 0, dx: 0, dy: -8, power: 9.5, n: 72 },
  { t: 18, dx: -55, dy: -40, power: 7.5, n: 56 },
  { t: 32, dx: 60, dy: -35, power: 7.8, n: 56 },
  { t: 48, dx: -20, dy: -70, power: 8.5, n: 64 },
  { t: 62, dx: 25, dy: -75, power: 8.2, n: 64 },
  { t: 80, dx: 0, dy: -30, power: 10, n: 80 },
];

/**
 * Live-site Lucky Sleuthers burst — colorful pops from the card onto the page.
 * Copied from production (canvas overlay, z-index 2147483000).
 */
export default function ConfettiBurst({
  whenVisible = false,
  active = false,
  delayMs = 650,
  durationMs = 8000,
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const startedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let cancelled = false;
    let raf = 0;
    let waitTimer = 0;
    let endTimer = 0;
    let observer;

    const run = () => {
      if (cancelled || startedRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) {
        waitTimer = window.setTimeout(() => {
          waitTimer = 0;
          run();
        }, 120);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const originEl = hostRef.current?.closest("article") || hostRef.current;
      const box = originEl ? originEl.getBoundingClientRect() : null;
      const ox = box ? box.left + box.width / 2 : window.innerWidth / 2;
      const oy = box
        ? box.top + Math.min(0.38 * box.height, 150)
        : Math.min(0.35 * window.innerHeight, 280);

      startedRef.current = true;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sparks = [];
      const rockets = [];

      const explode = (x, y, palette, count, power) => {
        for (let i = 0; i < count; i += 1) {
          const ang = (2 * Math.PI * i) / count + 0.2 * Math.random();
          const spd = power * (0.55 + 0.55 * Math.random());
          sparks.push({
            x,
            y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0,
            maxLife: 55 + 45 * Math.random(),
            color: palette[Math.floor(Math.random() * palette.length)],
            size: 2.2 + 3.2 * Math.random(),
            trail: [],
          });
        }
        for (let a = 0; a < 28; a += 1) {
          const ang = Math.random() * Math.PI * 2;
          const spd = power * (0.15 + 0.35 * Math.random());
          sparks.push({
            x,
            y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0,
            maxLife: 35 + 25 * Math.random(),
            color: "#ffffff",
            size: 1.2 + 1.8 * Math.random(),
            trail: [],
          });
        }
      };

      ROCKETS.forEach((spec, idx) => {
        rockets.push({
          launchAt: spec.t,
          explodeAt: spec.t + 10 + (idx % 3),
          x: ox,
          y: oy + 20,
          tx: ox + spec.dx,
          ty: oy + spec.dy,
          launched: false,
          exploded: false,
          palette: PALETTES[idx % PALETTES.length],
          power: spec.power,
          n: spec.n,
          trail: [],
        });
      });

      let frame = 0;
      const t0 = performance.now();

      const tick = (now) => {
        if (cancelled) return;
        frame += 1;
        const elapsed = now - t0;
        const fade = Math.max(0, 1 - Math.max(0, elapsed - 0.75 * durationMs) / (0.25 * durationMs));

        ctx.clearRect(0, 0, vw, vh);
        ctx.globalCompositeOperation = "lighter";

        for (const rocket of rockets) {
          if (!rocket.launched && frame >= rocket.launchAt) rocket.launched = true;
          if (rocket.launched && !rocket.exploded) {
            const t = Math.min(1, (frame - rocket.launchAt) / Math.max(1, rocket.explodeAt - rocket.launchAt));
            rocket.x = ox + (rocket.tx - ox) * t;
            rocket.y = oy + 20 + (rocket.ty - (oy + 20)) * t;
            rocket.trail.push({ x: rocket.x, y: rocket.y, a: 1 });
            if (rocket.trail.length > 12) rocket.trail.shift();
            for (let i = 0; i < rocket.trail.length; i += 1) {
              const pt = rocket.trail[i];
              const a = (i / rocket.trail.length) * 0.7 * fade;
              ctx.beginPath();
              ctx.fillStyle = `rgba(255, 230, 150, ${a})`;
              ctx.arc(pt.x, pt.y, 2.2, 0, 2 * Math.PI);
              ctx.fill();
            }
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * fade})`;
            ctx.shadowColor = "#ffd60a";
            ctx.shadowBlur = 16;
            ctx.arc(rocket.x, rocket.y, 3.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (frame >= rocket.explodeAt) {
              rocket.exploded = true;
              explode(rocket.x, rocket.y, rocket.palette, rocket.n, rocket.power);
            }
          }
        }

        for (let i = sparks.length - 1; i >= 0; i -= 1) {
          const p = sparks[i];
          p.life += 1;
          p.vy += 0.045;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
          p.trail.push({ x: p.x, y: p.y, a: 1 });
          if (p.trail.length > 8) p.trail.shift();
          const life = p.life / p.maxLife;
          if (life >= 1) {
            sparks.splice(i, 1);
            continue;
          }
          const alpha = (1 - life * life) * fade;
          for (let t = 0; t < p.trail.length; t += 1) {
            const pt = p.trail[t];
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (t / p.trail.length) * alpha * 0.55;
            ctx.arc(pt.x, pt.y, 0.45 * p.size, 0, 2 * Math.PI);
            ctx.fill();
          }
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.85 * alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.35 * p.size, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowBlur = 0;

        if (elapsed < durationMs && (rockets.some((r) => !r.exploded) || sparks.length > 0 || elapsed < durationMs)) {
          raf = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, vw, vh);
        }
      };

      raf = requestAnimationFrame(tick);
      endTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        canvasRef.current?.getContext("2d")?.clearRect(0, 0, vw, vh);
      }, durationMs + 500);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const stopBurst = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(waitTimer);
      window.clearTimeout(endTimer);
      waitTimer = 0;
      endTimer = 0;
      clearCanvas();
    };

    const schedule = () => {
      if (startedRef.current || waitTimer) return;
      cancelled = false;
      waitTimer = window.setTimeout(() => {
        waitTimer = 0;
        run();
      }, delayMs);
    };

    const feed = hostRef.current?.closest(".blog-feed") || document.querySelector(".blog-feed");
    const sectionEl = hostRef.current?.closest("article") || hostRef.current;

    const inView = () => {
      const el = sectionEl;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (feed) {
        const f = feed.getBoundingClientRect();
        return r.bottom > f.top + 40 && r.top < f.bottom - 40;
      }
      return r.top < 0.9 * window.innerHeight && r.bottom > 40;
    };

    if (whenVisible && sectionEl) {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.08);
          if (visible) {
            if (!startedRef.current) schedule();
            return;
          }
          stopBurst();
        },
        { root: feed, threshold: [0, 0.08, 0.2, 0.4], rootMargin: "0px" }
      );
      observer.observe(sectionEl);
      if (inView()) schedule();
      else stopBurst();
      const onScroll = () => {
        if (inView()) {
          if (!startedRef.current) schedule();
          return;
        }
        stopBurst();
      };
      feed?.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        stopBurst();
        observer?.disconnect();
        feed?.removeEventListener("scroll", onScroll);
      };
    }

    if (active) schedule();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(waitTimer);
      window.clearTimeout(endTimer);
      observer?.disconnect();
    };
  }, [mounted, active, whenVisible, delayMs, durationMs]);

  return (
    <>
      <span
        ref={hostRef}
        className="absolute left-0 right-0 top-0 h-28 pointer-events-none"
        aria-hidden="true"
        data-sss-confetti-host="1"
      />
      {mounted
        ? createPortal(
            <canvas
              ref={canvasRef}
              className="pointer-events-none fixed inset-0"
              style={{ width: "100vw", height: "100vh", zIndex: 2147483000, top: 0, left: 0 }}
              aria-hidden="true"
            />,
            document.body
          )
        : null}
    </>
  );
}
