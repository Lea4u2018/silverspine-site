import { useEffect, useState } from "react";

const GOLD = "#a77a23";
const MOUNTAIN = "America/Denver";

function zoneCity(tz) {
  if (!tz) return "Local";
  const city = tz.split("/").pop() || tz;
  return city.replace(/_/g, " ");
}

function weekdayLabel(date, timeZone) {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const map = { Sun: "Sun", Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thur", Fri: "Fri", Sat: "Sat" };
  return map[short] || short;
}

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

function formatParts(date, timeZone) {
  const weekday = weekdayLabel(date, timeZone);
  const month = new Intl.DateTimeFormat("en-US", { timeZone, month: "long" }).format(date);
  const day = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, day: "numeric" }).format(date)
  );
  const year = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(date);
  const datePart = `${weekday}: ${month} ${ordinal(day)}, ${year}`;
  const timePart = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
  return { datePart, timePart };
}

function ClockCard({ label, hint, datePart, timePart }) {
  return (
    <div className="rounded-lg border border-[#a77a23]/35 bg-black/40 px-3 py-2 min-w-0">
      <p className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>
        {label}
        {hint ? <span className="text-gray-500 normal-case tracking-normal"> · {hint}</span> : null}
      </p>
      <p className="text-sm text-gray-200 mt-0.5">{datePart}</p>
      <p className="text-base sm:text-lg font-semibold text-white tabular-nums leading-tight">{timePart}</p>
    </div>
  );
}

export default function AdminBannerClock() {
  const [now, setNow] = useState(null);
  const [hereZone, setHereZone] = useState(MOUNTAIN);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setHereZone(tz);
    } catch {
      /* keep Mountain */
    }
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const mountain = formatParts(now, MOUNTAIN);
  const here = formatParts(now, hereZone);
  const same = hereZone === MOUNTAIN;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Studio clocks">
      <ClockCard
        label="Mountain"
        hint="studio · visits"
        datePart={mountain.datePart}
        timePart={mountain.timePart}
      />
      <ClockCard
        label="Here"
        hint={same ? "you’re home" : zoneCity(hereZone)}
        datePart={here.datePart}
        timePart={here.timePart}
      />
    </div>
  );
}
