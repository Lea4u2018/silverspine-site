// /components/Footer.js
import { useEffect, useState } from "react";
import Link from "next/link";
import LogoHub from "@/components/LogoHub";
import { GOLD, SOCIAL_ICONS, BOOK_ICONS, STORE_ICONS, HUB_ITEMS } from "@/lib/socials";

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
    <div className="sss-footer-icon-group flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
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
              w-8 h-8 sm:w-9 sm:h-9 rounded-full
              border border-gray-700
              bg-transparent
              text-gray-300
              hover:text-[#a77a23] hover:bg-gray-300/15 hover:border-gray-500
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(167,122,35,0.55)]
              transition-colors duration-150
            "
          >
            {Icon ? <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <span className="text-xs">?</span>}
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
      className="block w-10 h-px lg:w-px lg:h-8 bg-[#a77a23]/70 shrink-0"
      aria-hidden="true"
    />
  );
}

export default function Footer({ note, ...props }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("2026");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer
      {...props}
      id="site-footer"
      role="contentinfo"
      className="relative z-10 bg-gray-900 text-gray-300 border-t border-[#a77a23]/25 py-3 md:py-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5">
        {/* Desktop: © | icons | hand-built — Mobile: icons then compact credits */}
        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 2xl:gap-4 min-w-0">
          <p className="hidden 2xl:block text-left text-xs leading-snug text-gray-300 min-w-0">
            © {year} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
          </p>

          <div className="sss-footer-icons flex flex-col lg:flex-row lg:flex-wrap items-center justify-center gap-2.5 lg:gap-x-3 lg:gap-y-2 min-w-0 w-full max-w-full">
            <IconGroup items={SOCIAL_ICONS} />
            <GoldRule />
            <IconGroup items={BOOK_ICONS} />
            <GoldRule />
            <IconGroup items={STORE_ICONS} />
          </div>

          <p className="hidden 2xl:block text-right text-xs leading-snug text-gray-300 min-w-0">
            Hand-built with <span style={{ color: GOLD }}>PyCharm</span>
            {" / "}
            <span style={{ color: GOLD }}>VS&nbsp;Code</span>,{" "}
            <span style={{ color: GOLD }}>Next.js</span>,{" "}
            <span style={{ color: GOLD }}>React</span>,{" "}
            <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
          </p>
        </div>

        {/* Mobile-only stacked credits (keeps one thin band) */}
        <div className="sss-footer-credits 2xl:hidden mt-2 text-center text-[11px] leading-snug space-y-0.5 px-1">
          <p>
            © {year} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
          </p>
          <p>
            Hand-built with <span style={{ color: GOLD }}>PyCharm</span>
            {" / "}
            <span style={{ color: GOLD }}>VS&nbsp;Code</span>,{" "}
            <span style={{ color: GOLD }}>Next.js</span>,{" "}
            <span className="whitespace-nowrap">
              <span style={{ color: GOLD }}>React</span>,{" "}
              <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
            </span>
          </p>
        </div>

        <nav
          aria-label="Legal"
          className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] md:text-xs text-gray-400"
        >
          {LEGAL_LINKS.map((item, i) => (
            <span key={item.href} className="inline-flex items-center gap-x-3">
              {i > 0 ? <span className="text-gray-600" aria-hidden="true">·</span> : null}
              <Link href={item.href} className="hover:text-[#a77a23] transition-colors">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Optional page note — kept rare/short so footer stays thin */}
        {note ? (
          <div className="mt-2 text-center text-[11px] leading-snug text-gray-400 px-2">
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
