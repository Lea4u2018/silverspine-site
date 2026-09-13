import Link from "next/link";
import { SOCIAL_ICONS, BOOK_ICONS, PENDING_FOOTER_HUB } from "@/lib/socials";
import { SNEAK_PEEK_STORES } from "@/lib/store";

const GOLD = "#a77a23";

/**
 * ONE definitive map — subject tag, Outlook folder, and rule must stay in sync.
 * Rule conditions always include the brackets (never bare words like REVIEW).
 */
const EMAIL_TAGS = [
  {
    tag: "[AUTO-REPLY SENT]",
    folder: "[AUTO REPLIED]",
    meaning: "Internal notice: auto-confirmation already emailed to the visitor",
    order: "Run this rule FIRST · stop processing",
  },
  {
    tag: "[ARC REQUEST]",
    folder: "[ARC]",
    meaning: "New ARC / early-release application",
    order: "Rule 2",
  },
  {
    tag: "[LAUNCH LIST]",
    folder: "[LAUNCH LIST]",
    meaning: "Launch-list signup",
    order: "Rule 3",
  },
  {
    tag: "[REVIEW]",
    folder: "[REVIEWS]",
    meaning: "New review submitted (pending approval)",
    order: "Rule 4 — must use [REVIEW] with brackets (never the word REVIEW alone)",
  },
  {
    tag: "[NEIGHBOR]",
    folder: "[NEIGHBORS]",
    meaning: "Studio Neighbor listing request (pending approval)",
    order: "Rule — must use [NEIGHBOR] with brackets",
  },
  {
    tag: "[MEDIA REQUEST]",
    folder: "[MEDIA REQUEST]",
    meaning: "Press kit, interview, or media feature request",
    order: "Rule 5",
  },
  {
    tag: "[WEBSITE INQUIRY]",
    folder: "[WEBSITE INQUIRY]",
    meaning: "Custom website inquiry",
    order: "Rule 6",
  },
  {
    tag: "[CONTACT-SSS]",
    folder: "[CONTACT-SSS]",
    meaning: "Silver Spine contact form (unique code — not the word contact)",
    order: "Rule 7",
  },
];

/**
 * Admin “Next Up” hub — unfinished footer icons + soon storefronts + email tag cheat sheet.
 */
export default function AdminNextUpPanel() {
  const soonStores = SNEAK_PEEK_STORES.filter((s) => s.status === "soon" || s.status === "review");
  const liveFooter = [
    ...SOCIAL_ICONS.map((i) => ({ ...i, group: "Social" })),
    ...BOOK_ICONS.map((i) => ({ ...i, group: "Books" })),
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-2" style={{ color: GOLD }}>
          Email tags (definitive — one map only)
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Subjects are tagged by the site. <strong className="text-gray-200">Outlook rules</strong> file them.
          Use this table only — subject tag, folder, and rule all match. Always include{" "}
          <strong className="text-gray-200">brackets</strong> in the rule (never bare REVIEW / contact / etc.).
        </p>
        <div className="mb-4 overflow-x-auto rounded-xl border border-[#a77a23]/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#a77a23]/15 text-[#a77a23]">
              <tr>
                <th className="px-3 py-2 font-bold">Subject tag (exact)</th>
                <th className="px-3 py-2 font-bold">Outlook folder</th>
                <th className="px-3 py-2 font-bold">Rule: subject contains</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {EMAIL_TAGS.map((row) => (
                <tr key={row.tag} className="border-t border-white/10">
                  <td className="px-3 py-2.5 font-mono text-[#a77a23] font-bold whitespace-nowrap">{row.tag}</td>
                  <td className="px-3 py-2.5 font-mono whitespace-nowrap">{row.folder}</td>
                  <td className="px-3 py-2.5 font-mono text-[#a77a23] whitespace-nowrap">{row.tag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 mb-4">
          {EMAIL_TAGS.map((row) => (
            <div
              key={`${row.tag}-detail`}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"
            >
              <p className="font-mono text-sm text-[#a77a23] font-bold">
                {row.tag} → {row.folder}
              </p>
              <p className="text-sm text-gray-200 mt-1">{row.meaning}</p>
              <p className="text-xs text-gray-500 mt-1">{row.order}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Example:{" "}
          <span className="text-gray-300 font-mono">
            [AUTO-REPLY SENT] [ARC REQUEST] Auto-confirmation sent → jane@…
          </span>
          {" · "}
          Review example:{" "}
          <span className="text-gray-300 font-mono">[REVIEW] Pending approval — Jane (5★)</span>
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
              {i.group}: {i.label}
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
