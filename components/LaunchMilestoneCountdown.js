import { useEffect, useState } from "react";
import Link from "next/link";
import { NOVEL_PRICING } from "@/lib/store";
import { formatCountdownLabel, formatCountdownParts } from "@/lib/launchCountdown";
import { LAUNCH_COUNTDOWN_TARGETS } from "@/lib/store";

/** Brand champagne gold — tabs, countdown, tap chrome */
const CHAMPAGNE = "#dfcfb5";

const STRIP =
  "launch-countdown-strip relative z-20 w-full px-3 py-2.5 md:px-5 md:py-3 text-[0.88rem] md:text-[0.98rem] leading-snug tracking-wide text-[#f5edd7] notranslate";
const STRIP_BG =
  "bg-gradient-to-b from-[rgba(223,207,181,0.16)] to-[rgba(0,0,0,0.55)] border-b border-[rgba(223,207,181,0.32)]";

function getNextFromTargets(targets, now = Date.now()) {
  const list = Array.isArray(targets) && targets.length ? targets : LAUNCH_COUNTDOWN_TARGETS;
  const t = typeof now === "number" ? now : now.getTime();
  for (const target of list) {
    const at = new Date(target.at).getTime();
    if (at > t) return { target, remainingMs: at - t, allPast: false };
  }
  return { target: null, remainingMs: 0, allPast: true };
}

const COUNTDOWN_TIME =
  "font-extrabold tabular-nums tracking-wider shrink-0 text-center";
const COUNTDOWN_TIME_STYLE = {
  color: CHAMPAGNE,
  textShadow: "0 0 12px rgba(223,207,181,0.4)",
};

/**
 * Slim “next milestone” strip — stable anchor below tickers or in shop header.
 * @param {{ compact?: boolean, className?: string, linked?: boolean, variant?: "default" | "home" }} props
 */
export default function LaunchMilestoneCountdown({
  compact = false,
  className = "",
  linked = true,
  variant = "default",
}) {
  const [tick, setTick] = useState(null);
  const [countdownTargets, setCountdownTargets] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/launch/public");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.countdownTargets)) {
          setCountdownTargets(data.countdownTargets);
        }
      } catch {
        /* use defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTick(Date.now());
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = prefersReduced ? 60_000 : 1000;

    const pulse = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      setTick(Date.now());
    };

    const id = window.setInterval(pulse, intervalMs);
    const onVis = () => {
      if (!document.hidden) pulse();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const shellClass = `${STRIP} ${STRIP_BG} ${className}`.trim();

  if (tick == null) {
    return <div className={shellClass} translate="no" aria-hidden="true" />;
  }

  const { target, remainingMs, allPast } = getNextFromTargets(countdownTargets, tick);

  if (allPast) {
    return (
      <div
        className={`${shellClass} flex flex-wrap items-center justify-center gap-x-3 gap-y-1`}
        translate="no"
        role="status"
        aria-live="polite"
      >
        <span className="font-semibold text-center">
          Official release is live · Digital {NOVEL_PRICING.retail} · Paperback {NOVEL_PRICING.paperback} · Hardcover {NOVEL_PRICING.hardcover}
        </span>
        <Link
          href="/shop"
          className="font-bold text-[#dfcfb5] underline underline-offset-2"
        >
          Shop now
        </Link>
      </div>
    );
  }

  const parts = formatCountdownParts(remainingMs);
  const digits = formatCountdownLabel(parts, { compact });

  const nextBadge = (
    <span className="text-[0.72rem] md:text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#dfcfb5] shrink-0">
      Next
    </span>
  );

  const milestoneLabel = (
    <span className="font-semibold text-center leading-snug text-[0.95rem] md:text-[1.05rem] text-[#f5edd7]">
      {target.label}
      {target.detail ? (
        <span className="font-medium text-[#c9ced6]"> · {target.detail}</span>
      ) : null}
    </span>
  );

  const countdownTime = (
    <time
      className={`${COUNTDOWN_TIME} ${
        variant === "home" ? "text-[1rem] md:text-[1.08rem]" : "text-[0.9rem] md:text-[0.95rem]"
      }`}
      style={COUNTDOWN_TIME_STYLE}
      dateTime={target.at}
      aria-label={`Countdown to ${target.label}`}
    >
      {digits}
    </time>
  );

  const inner =
    variant === "home" ? (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-1">
          {nextBadge}
          {milestoneLabel}
        </div>
        {countdownTime}
      </div>
    ) : (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 md:gap-x-4">
        {nextBadge}
        <span className="sm:flex-1 sm:min-w-0 sm:text-center">{milestoneLabel}</span>
        {countdownTime}
      </div>
    );

  if (linked && target.href) {
    return (
      <Link
        href={target.href}
        className={`${shellClass} no-underline hover:from-[rgba(223,207,181,0.24)] hover:to-[rgba(0,0,0,0.6)] transition-colors`}
        translate="no"
        role="status"
        aria-live="polite"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={shellClass} translate="no" role="status" aria-live="polite">
      {inner}
    </div>
  );
}
