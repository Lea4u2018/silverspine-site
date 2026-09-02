import { useEffect, useRef } from "react";

/**
 * Hold ▲ / ▼ to scroll a target (card copy or the blog list).
 */
export default function HoldScrollArrows({
  targetRef,
  variant = "card",
  label = "Scroll",
}) {
  const holdRef = useRef(null);

  const stop = () => {
    if (holdRef.current) {
      window.clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  const start = (dir, btn, pointerId) => {
    const el = targetRef.current;
    if (!el) return;
    stop();
    if (btn && pointerId != null && typeof btn.setPointerCapture === "function") {
      try {
        btn.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
    const isMaster = variant === "master";
    let speed = isMaster ? 20 : 8;
    const max = isMaster ? 26 : 8;
    const bump = isMaster ? 0.25 : 0;
    const every = isMaster ? 22 : 40;
    const step = () => {
      speed = Math.min(max, speed + bump);
      el.scrollBy({ top: dir * speed, behavior: "auto" });
    };
    step();
    holdRef.current = window.setInterval(step, every);
  };

  useEffect(() => () => stop(), []);

  const cls = variant === "master" ? "blog-hold-scroll blog-hold-scroll--master" : "blog-hold-scroll blog-hold-scroll--card";

  return (
    <div className={cls} aria-label={label}>
      <button
        type="button"
        className="blog-hold-scroll-btn"
        aria-label={`${label} up — hold to keep going`}
        onPointerDown={(e) => {
          start(-1, e.currentTarget, e.pointerId);
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        ▲
      </button>
      <button
        type="button"
        className="blog-hold-scroll-btn"
        aria-label={`${label} down — hold to keep going`}
        onPointerDown={(e) => {
          start(1, e.currentTarget, e.pointerId);
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        ▼
      </button>
    </div>
  );
}

export function CopyScrollBox({ className, children }) {
  const ref = useRef(null);
  return (
    <div className="copy-with-arrows">
      <div ref={ref} className={className}>
        {children}
      </div>
      <HoldScrollArrows targetRef={ref} variant="card" label="Scroll this post" />
    </div>
  );
}
