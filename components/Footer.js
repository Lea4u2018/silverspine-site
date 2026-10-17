// /components/Footer.js
import { useState } from "react";
import Link from "next/link";
import LogoHub from "@/components/LogoHub";
import { GOLD, SOCIAL_ICONS, BOOK_ICONS, STORE_ICONS, HUB_ITEMS } from "@/lib/socials";
import { COPYRIGHT_YEAR } from "@/lib/copyright";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/faq", label: "FAQ" },
  { href: "/refunds", label: "Refunds" },
  { href: "/contact", label: "Contact" },
  { href: "/neighbors", label: "Community" },
];

function IconGroup({ items }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="sss-footer-icon-group flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2 shrink-0">
      {list.map(({ key, label: name, href, icon: Icon }) => {
        const isExternal =
          href?.startsWith("http://") ||
          href?.startsWith("https://") ||
          href?.startsWith("mailto:");
        return (
          <a
            key={key}
            href={href || "#"}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={name}
            title={name}
            className="
              inline-flex items-center justify-center
              w-7 h-7 sm:w-8 sm:h-8 rounded-full
              border border-white/20
              bg-transparent
              text-gray-300
              hover:text-[#dfcfb5] hover:bg-white/10 hover:border-[#dfcfb5]/50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(223,207,181,0.55)]
              transition-colors duration-150
            "
          >
            {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-xs">?</span>}
            <span className="sr-only">{name}</span>
          </a>
        );
      })}
    </div>
  );
}

function GoldRule() {
  return (
    <span
      className="hidden sm:block w-px h-6 bg-[#dfcfb5]/70 shrink-0"
      aria-hidden="true"
    />
  );
}

export default function Footer({ note, className = "", ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <footer
      {...props}
      id="site-footer"
      role="contentinfo"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-black text-gray-200 border-t border-[#dfcfb5]/25 py-2 ${className}`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 flex flex-col items-center gap-1.5">
        <div className="sss-footer-icons flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <IconGroup items={SOCIAL_ICONS} />
          <GoldRule />
          <IconGroup items={BOOK_ICONS} />
          <GoldRule />
          <IconGroup items={STORE_ICONS} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-2 text-[11px] sm:text-xs leading-tight text-gray-200">
          <p className="sss-footer-credits text-center max-w-full">
            © {COPYRIGHT_YEAR} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
            <span className="text-gray-600"> · </span>
            Hand-built with <span style={{ color: GOLD }}>PyCharm</span>
            {" / "}
            <span style={{ color: GOLD }}>VS&nbsp;Code</span>,{" "}
            <span className="whitespace-nowrap">
              <span style={{ color: GOLD }}>Next.js</span>,{" "}
              <span style={{ color: GOLD }}>React</span>,{" "}
              <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
            </span>
          </p>
          <nav aria-label="Legal" className="inline-flex flex-wrap items-center justify-center gap-x-2 text-gray-300">
            {LEGAL_LINKS.map((item, i) => (
              <span key={item.href} className="inline-flex items-center gap-x-2">
                {i > 0 ? <span className="text-gray-600" aria-hidden="true">·</span> : null}
                <Link href={item.href} className="hover:text-[#dfcfb5] transition-colors whitespace-nowrap">
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <p className="sss-footer-flash w-full text-center text-[9px] sm:text-[10px] leading-snug text-white px-2">
          This site uses lightning and storm flashes. If you are sensitive to flashing light, turn on Reduce Motion or skip the storm.
        </p>

        {note ? (
          <div className="text-center text-[10px] leading-snug text-gray-400 px-2">
            {note}
          </div>
        ) : null}
      </div>

      <LogoHub
        open={open}
        onClose={() => setOpen(false)}
        items={Array.isArray(HUB_ITEMS) ? HUB_ITEMS : []}
      />
    </footer>
  );
}
