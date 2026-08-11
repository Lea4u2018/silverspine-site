import Link from "next/link";
import { CORE_ICONS, PENDING_FOOTER_HUB } from "@/lib/socials";
import { SNEAK_PEEK_STORES } from "@/lib/store";

const GOLD = "#a77a23";

const EMAIL_TAGS = [
  {
    tag: "[ARC REQUEST]",
    meaning: "New ARC application to your inbox",
    outlook: "Rule: subject contains ARC REQUEST → ARC folder",
  },
  {
    tag: "[AUTO-REPLY SENT]",
    meaning: "Automatic confirmation already emailed to the visitor",
    outlook: "Search Sent or inbox for AUTO-REPLY SENT — do not treat as a new human reply",
  },
  {
    tag: "[LAUNCH LIST]",
    meaning: "Launch-list signup",
    outlook: "Rule: subject contains LAUNCH LIST",
  },
  {
    tag: "[CONTACT]",
    meaning: "General contact form",
    outlook: "Rule: subject contains CONTACT",
  },
  {
    tag: "[WEBSITE INQUIRY]",
    meaning: "Custom website inquiry",
    outlook: "Rule: subject contains WEBSITE INQUIRY",
  },
  {
    tag: "[REVIEW]",
    meaning: "New review submitted (if configured)",
    outlook: "Rule: subject contains REVIEW",
  },
];

/**
 * Admin “Next Up” hub — unfinished footer icons + soon storefronts + email tag cheat sheet.
 */
export default function AdminNextUpPanel() {
  const soonStores = SNEAK_PEEK_STORES.filter((s) => s.status !== "live" || !s.href);
  const liveFooter = CORE_ICONS;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-2" style={{ color: GOLD }}>
          Email tags (definitive)
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Use these in Outlook search / rules. Auto-confirmations always start with{" "}
          <strong className="text-gray-200">[AUTO-REPLY SENT]</strong>.
        </p>
        <div className="space-y-3">
          {EMAIL_TAGS.map((row) => (
            <div
              key={row.tag}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"
            >
              <p className="font-mono text-sm text-[#a77a23] font-bold">{row.tag}</p>
              <p className="text-sm text-gray-200 mt-1">{row.meaning}</p>
              <p className="text-xs text-gray-500 mt-1">{row.outlook}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Example ARC auto-reply subject:{" "}
          <span className="text-gray-300 font-mono">
            [AUTO-REPLY SENT] [ARC REQUEST] We received your early-release request…
          </span>
        </p>
      </section>

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-2" style={{ color: GOLD }}>
          Footer hub — still to create
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          These icons are parked (not in the live footer bar yet). Create the real profile, then tell me the
          URL and we’ll wire it in.
        </p>
        {PENDING_FOOTER_HUB.length === 0 ? (
          <p className="text-sm text-emerald-400">All hub icons have real URLs.</p>
        ) : (
          <div className="space-y-3">
            {PENDING_FOOTER_HUB.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex gap-3 rounded-xl border border-amber-500/25 bg-black/40 px-4 py-3"
                >
                  <span className="shrink-0 mt-0.5 text-[#a77a23] text-xl">
                    {Icon ? <Icon aria-hidden /> : null}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-100">
                      {item.label}{" "}
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                        Needed
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                    <p className="text-sm text-gray-300 mt-1">{item.nextStep}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                      Placeholder link: {item.href}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mt-6 mb-2">
          Already live in the footer bar
        </h3>
        <ul className="flex flex-wrap gap-2">
          {liveFooter.map((i) => (
            <li
              key={i.key}
              className="text-xs rounded-full border border-emerald-500/30 text-emerald-300 px-2.5 py-1"
            >
              {i.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-2" style={{ color: GOLD }}>
          Shop doors — still publishing
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Grey storefronts on{" "}
          <Link href="/shop" className="text-[#a77a23] hover:underline">
            /shop
          </Link>
          . Flip to live when you have a public buy link.
        </p>
        {soonStores.length === 0 ? (
          <p className="text-sm text-emerald-400">All listed storefronts are live.</p>
        ) : (
          <div className="space-y-2">
            {soonStores.map((s) => (
              <div
                key={s.key}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-gray-100">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-white/15 px-2 py-1 rounded">
                  {s.status || "soon"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
