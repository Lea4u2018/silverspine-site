import { LAUNCH_COUNTDOWN_TARGETS } from "@/lib/store";

/** @param {number} ms */
export function formatCountdownParts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, done: total <= 0 };
}

/**
 * @param {Date | number} now
 * @returns {{ target: import("@/lib/store").LAUNCH_COUNTDOWN_TARGETS[number] | null, remainingMs: number, allPast: boolean }}
 */
export function getNextLaunchCountdown(now = Date.now()) {
  const t = typeof now === "number" ? now : now.getTime();
  for (const target of LAUNCH_COUNTDOWN_TARGETS) {
    const at = new Date(target.at).getTime();
    if (at > t) {
      return { target, remainingMs: at - t, allPast: false };
    }
  }
  return { target: null, remainingMs: 0, allPast: true };
}

/** @param {{ days: number, hours: number, minutes: number, seconds: number }} parts */
export function formatCountdownLabel(parts, { compact = false } = {}) {
  const pad = (n) => String(n).padStart(2, "0");
  if (compact) {
    if (parts.days > 0) return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`;
    return `${pad(parts.hours)}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
  }
  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
  }
  return `${pad(parts.hours)}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
}
