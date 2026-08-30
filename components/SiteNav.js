import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

const tabClass = (active) =>
  [
    "shrink-0 whitespace-nowrap px-2 py-1.5 rounded-sm uppercase tracking-[0.12em] transition",
    "border text-[11px] sm:text-xs md:text-sm",
    active
      ? "border-[#dfcfb5] bg-[#dfcfb5] text-black font-semibold hover:bg-[#c5a059] hover:border-[#c5a059]"
      : "border-transparent text-[#dfcfb5] hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059]",
  ].join(" ");

export default function SiteNav({ className = "" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className={["min-w-0 flex-1", className].join(" ")}>
      <nav
        aria-label="Primary"
        className="hidden md:flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 max-w-full"
      >
        {NAV_LINKS.map(({ href, label }) => {
          const active = isNavActive(router.pathname, router.asPath, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              {href === "/shop" ? "Studio Shop" : label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden flex justify-end">
        <button
          type="button"
          className="border border-[#dfcfb5]/70 text-[#dfcfb5] hover:border-[#c5a059] hover:text-[#c5a059] px-3 py-1.5 rounded-sm text-xs uppercase tracking-[0.14em]"
          aria-expanded={open}
          aria-controls="sss-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav
          id="sss-mobile-nav"
          aria-label="Primary mobile"
          className="md:hidden mt-2 flex flex-wrap justify-end gap-1.5 pb-1"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isNavActive(router.pathname, router.asPath, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={tabClass(active)}
                onClick={() => setOpen(false)}
              >
                {href === "/shop" ? "Studio Shop" : label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
