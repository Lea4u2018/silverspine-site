import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  NAME_SEPARATION,
  NAME_SEPARATION_RULES,
  OPT_OUT_RESOURCES,
} from "@/lib/adminNameSeparation";
import {
  SEARCH_DASHBOARDS,
  SEARCH_MONITOR,
  SITE_ORIGIN,
  TRENDS_QUERIES,
  WEEKLY_SEARCH_CHECKLIST,
  trendsExploreUrl,
} from "@/lib/searchMonitor";

const GOLD = "#a77a23";

function ExternalCard({ title, subtitle, href, note, primary = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border p-4 transition-colors hover:border-[#a77a23]/70 ${
        primary
          ? "border-[#a77a23]/55 bg-[#a77a23]/12"
          : "border-white/10 bg-gray-950/80 hover:bg-gray-950"
      }`}
    >
      <p className="font-bold text-white flex flex-wrap items-center gap-2">
        {title}
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Opens new tab</span>
      </p>
      <p className="text-sm text-gray-300 mt-1">{subtitle}</p>
      {note ? <p className="text-xs text-gray-500 mt-2 leading-relaxed">{note}</p> : null}
    </a>
  );
}

function StatusRow({ label, check, hint }) {
  const good = check?.ok;
  return (
    <li className="flex flex-wrap items-start gap-2 text-sm">
      <span
        className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          good ? "bg-emerald-600/25 text-emerald-300" : "bg-red-600/25 text-red-300"
        }`}
      >
        {good ? "Live" : "Check"}
      </span>
      <span className="text-gray-200">
        <strong className="text-white">{label}</strong>
        {check?.detail ? <span className="text-gray-500"> · {check.detail}</span> : null}
        {hint ? <span className="block text-xs text-gray-500 mt-0.5">{hint}</span> : null}
      </span>
    </li>
  );
}

/**
 * @param {{ visits?: { todayPeople?: number, weekPeople?: number, allPeople?: number } | null }} props
 */
export default function AdminSearchMonitorPanel({ visits = null }) {
  const verifyUrl = `${SITE_ORIGIN}/${SEARCH_MONITOR.googleVerificationFile}`;
  const [health, setHealth] = useState(null);
  const [healthBusy, setHealthBusy] = useState(true);

  const loadHealth = useCallback(async () => {
    setHealthBusy(true);
    try {
      const res = await fetch("/api/admin/search-health");
      const data = await res.json();
      if (res.ok && data.ok) setHealth(data);
      else setHealth(null);
    } catch {
      setHealth(null);
    } finally {
      setHealthBusy(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/10 bg-black/50 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>
            Site search readiness · live check
          </p>
          <button
            type="button"
            onClick={loadHealth}
            disabled={healthBusy}
            className="text-xs font-semibold text-[#a77a23] hover:underline disabled:opacity-50"
          >
            {healthBusy ? "Checking…" : "Refresh"}
          </button>
        </div>
        {healthBusy && !health ? (
          <p className="text-sm text-gray-500">Pinging verification file, sitemap, and robots…</p>
        ) : health ? (
          <>
            <p
              className={`text-sm mb-3 ${health.allOk ? "text-emerald-300" : "text-amber-200"}`}
            >
              {health.allOk
                ? "All crawl files are live. Finish setup inside Google Search Console if you have not already."
                : "One or more crawl files need attention — details below."}
            </p>
            <ul className="space-y-2.5">
              <StatusRow
                label="Google verification file"
                check={health.checks.googleVerify}
                hint="Search Console → property must show Verified."
              />
              <StatusRow
                label="Sitemap"
                check={health.checks.sitemap}
                hint={`Submit in GSC → Sitemaps: ${health.submitInGsc}`}
              />
              <StatusRow
                label="Robots.txt"
                check={health.checks.robots}
                hint="Points Google at your sitemap."
              />
            </ul>
            {health.checkedAt ? (
              <p className="text-[10px] text-gray-600 mt-3">
                Last checked {new Date(health.checkedAt).toLocaleString()}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-gray-500">Could not run health check. Sign in again and retry.</p>
        )}
      </section>

      <section className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-4">
        <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Google Search Console · setup</p>
        <p className="text-sm text-gray-200 leading-relaxed">
          Your site already has the Google verification file live at{" "}
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a77a23] hover:underline break-all"
          >
            {verifyUrl.replace("https://", "")}
          </a>
          . That means you (or a past setup) started Search Console verification.{" "}
          <strong className="text-white">Sign in below</strong> to confirm the property shows{" "}
          <strong className="text-white">Verified</strong> and submit your sitemap if you have not yet.
        </p>
        <p className="mt-3 text-xs text-gray-400">
          First time? In Search Console choose <strong className="text-gray-300">URL prefix</strong> and enter{" "}
          <code className="text-[#c9ced6]">https://www.silverspinestudio.com</code> — verification should pass
          immediately via the HTML file above.
        </p>
        <ul className="mt-3 text-xs text-gray-400 space-y-1.5 list-disc list-inside">
          <li>
            Sitemap URL to submit:{" "}
            <a href={SEARCH_MONITOR.sitemapUrl} className="text-[#a77a23] hover:underline" target="_blank" rel="noopener noreferrer">
              {SEARCH_MONITOR.sitemapUrl}
            </a>
          </li>
          <li>
            Robots:{" "}
            <a href={SEARCH_MONITOR.robotsUrl} className="text-[#a77a23] hover:underline" target="_blank" rel="noopener noreferrer">
              {SEARCH_MONITOR.robotsUrl}
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1" style={{ color: GOLD }}>
          Search dashboards
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          These are the tools that actually report how your site performs in search — not Google Trends.
        </p>
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
          {SEARCH_DASHBOARDS.map((d) => (
            <ExternalCard
              key={d.key}
              title={d.title}
              subtitle={d.subtitle}
              href={d.href}
              note={d.note}
              primary={d.accent === "primary"}
            />
          ))}
        </div>
      </section>

      {visits ? (
        <section className="rounded-xl border border-white/10 bg-black/40 px-4 py-4">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD }}>
            Your site visits (this admin page)
          </p>
          <p className="text-sm text-gray-300 mb-3">
            Search Console counts <strong className="text-white">Google clicks</strong>. Admin counts{" "}
            <strong className="text-white">people who opened any page</strong> — direct, social, email, and search combined.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center max-w-md">
            <div>
              <p className="text-xl font-extrabold text-white">{visits.todayPeople ?? "—"}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{visits.weekPeople ?? "—"}</p>
              <p className="text-xs text-gray-500">7 days</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{visits.allPeople ?? "—"}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold mb-1" style={{ color: GOLD }}>
          Google Trends · market research
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Topic buzz only — useful for content and hashtags, not for measuring silverspinestudio.com rankings.
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDS_QUERIES.map((t) => (
            <a
              key={t.q}
              href={trendsExploreUrl(t.q)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 bg-gray-950 px-3 py-2 text-sm text-gray-200 hover:border-[#a77a23]/50 hover:text-white transition-colors"
            >
              {t.label} ↗
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-4 py-4">
        <p className="text-xs uppercase tracking-widest text-violet-300 mb-2">
          Name separation · admin only
        </p>
        <p className="text-sm text-gray-200 leading-relaxed mb-3">
          Public world: <strong className="text-white">{NAME_SEPARATION.publicAuthorName}</strong> +{" "}
          {NAME_SEPARATION.publicStudio} only. The live site never publishes former legal names (retired{" "}
          {NAME_SEPARATION.legacyNameRetiredYear}). Third-party people-search sites are outside our control — opt out
          below if needed.
        </p>
        <ul className="text-xs text-gray-400 space-y-1 mb-4 list-disc list-inside">
          {NAME_SEPARATION_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mb-2">
          If you must search people-search sites to remove a listing, legacy spellings for opt-out only:{" "}
          {NAME_SEPARATION.legacyNamesForOptOut.join(", ")} — never add these to the public website.
        </p>
        <div className="flex flex-wrap gap-2">
          {OPT_OUT_RESOURCES.map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 bg-gray-950 px-3 py-2 text-xs text-gray-200 hover:border-[#a77a23]/50"
              title={r.note}
            >
              {r.label} ↗
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-gray-950/60 px-4 py-4">
        <h2 className="text-base font-bold text-white mb-2">Browser feels frozen?</h2>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
          <li>
            <strong className="text-white">Google Search Console / Threads on desktop</strong> — Meta and Google dashboards
            often hang in Safari. Use <strong className="text-white">Chrome</strong> for Search Console, and the{" "}
            <strong className="text-white">phone app</strong> for Threads.
          </li>
          <li>
            <strong className="text-white">While your site is open</strong> — storm video + music use CPU. Switch tabs or
            mute music (top-right) before heavy browser work. Site now pauses videos when the tab is in the background.
          </li>
          <li>
            <strong className="text-white">Avoid translate.goog URLs</strong> — use English on silverspinestudio.com directly.
            Translated mirror pages caused jump/freeze issues in older builds.
          </li>
          <li>
            Hard refresh: <kbd className="text-xs bg-black px-1 rounded">Cmd+Shift+R</kbd> (Mac) or close the tab and
            reopen.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#a77a23]/35 bg-[#a77a23]/8 px-4 py-4">
        <h2 className="text-base font-bold text-white mb-2">Weekly check (5 min)</h2>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
          {WEEKLY_SEARCH_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-gray-500">
        Public site:{" "}
        <Link href="/" className="text-[#a77a23] hover:underline">
          {SITE_ORIGIN.replace("https://", "")}
        </Link>
        {" · "}
        Phase 2 (optional later): live Search Console stats inside this tab via Google API + OAuth.
      </p>
    </div>
  );
}
