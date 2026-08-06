// /components/Footer.js
import { useEffect, useState } from "react";
import LogoHub from "@/components/LogoHub";
import { GOLD, CORE_ICONS, HUB_ITEMS } from "@/lib/socials";

export default function Footer({ note, ...props }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("2026");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  const icons = Array.isArray(CORE_ICONS) ? CORE_ICONS : [];

  return (
    <footer
      {...props}
      id="site-footer"
      role="contentinfo"
      className="bg-gray-900 text-gray-300 border-t border-[#a77a23]/25 py-3 md:py-4"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Desktop: © | icons | hand-built — Mobile: icons then compact credits */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4">
          <p className="hidden md:block text-left text-xs leading-snug text-gray-300">
            © {year} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            {icons.map(({ key, label, href, icon: Icon }) => {
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
                  aria-label={label}
                  title={label}
                  className="
                    inline-flex items-center justify-center
                    w-9 h-9 rounded-full
                    border border-gray-700
                    bg-transparent
                    text-gray-300
                    hover:text-[#a77a23] hover:bg-gray-300/15 hover:border-gray-500
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(167,122,35,0.55)]
                    transition-colors duration-150
                  "
                >
                  {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs">?</span>}
                  <span className="sr-only">{label}</span>
                </a>
              );
            })}
          </div>

          <p className="hidden md:block text-right text-xs leading-snug text-gray-300">
            Hand-built with <span style={{ color: GOLD }}>PyCharm</span>,{" "}
            <span style={{ color: GOLD }}>Next.js</span>,{" "}
            <span style={{ color: GOLD }}>React</span>,{" "}
            <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
          </p>
        </div>

        {/* Mobile-only stacked credits (keeps one thin band) */}
        <div className="md:hidden mt-2 text-center text-[11px] leading-snug space-y-0.5">
          <p>
            © {year} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
          </p>
          <p>
            Hand-built with <span style={{ color: GOLD }}>PyCharm</span>,{" "}
            <span style={{ color: GOLD }}>Next.js</span>,{" "}
            <span style={{ color: GOLD }}>React</span>,{" "}
            <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
          </p>
        </div>

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
