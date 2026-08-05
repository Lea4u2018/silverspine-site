// /components/Footer.js
import { useState, useEffect } from "react";
import LogoHub from "@/components/LogoHub";
import { GOLD, CORE_ICONS, HUB_ITEMS } from "@/lib/socials";

export default function Footer({ note, ...props }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");

  // Safely sets the year only on the client browser to prevent hydration crashes
  useEffect(() => {
    setYear(new Date().getFullYear());

    // eslint-disable-next-line no-console
    console.log("[Footer] CORE_ICONS:", (CORE_ICONS || []).map(i => i.key));
    // eslint-disable-next-line no-console
    console.log("[Footer] HUB_ITEMS:", Array.isArray(HUB_ITEMS) ? HUB_ITEMS.length : "not array");
  }, []);

  const icons = Array.isArray(CORE_ICONS) ? CORE_ICONS : [];

  return (
    <footer
      {...props}
      id="site-footer"
      role="contentinfo"
      className="bg-gray-900 text-gray-300 pt-8 pb-10 overflow-hidden border-t border-gray-900"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Social icons row + Hub trigger */}
        <div className="flex flex-wrap items-center justify-center gap-4">
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
                  w-11 h-11 rounded-full
                  border border-gray-800
                  bg-transparent
                  text-gray-300
                  hover:text-[#a77a23] hover:bg-gray-300/20 hover:border-gray-600
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(167,122,35,0.55)]
                  transition-colors duration-150
                "
              >
                {Icon ? <Icon className="w-5 h-5" /> : <span className="text-xs">?</span>}
                <span className="sr-only">{label}</span>
              </a>
            );
          })}
        </div>

        {/* Credits / Page-specific note */}
        <div className="mt-6 text-center text-sm leading-relaxed px-4">
          {note ? (
            note
          ) : (
            <>
              <p className="mb-2">
                © {year || "2026"} <span style={{ color: GOLD }}>Silver Spine Studio™</span>. All rights reserved.
              </p>
              <p className="text-gray-300">
                Hand-built with <span style={{ color: GOLD }}>PyCharm</span>, <span style={{ color: GOLD }}>Next.js</span>, <span style={{ color: GOLD }}>React</span>, <span style={{ color: GOLD }}>Tailwind&nbsp;CSS</span>.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <LogoHub
        open={open}
        onClose={() => setOpen(false)}
        items={Array.isArray(HUB_ITEMS) ? HUB_ITEMS : []}
      />
    </footer>
  );
}
