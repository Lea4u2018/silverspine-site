import Link from "next/link";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

/**
 * Primary site nav — page tabs only.
 * Mute sits above the Welcome box on Home; other pages use TopRightControls.
 */
export default function SiteNav({ className = "" }) {
  const router = useRouter();

  return (
    <nav
      aria-label="Primary"
      className={[
        className,
        "flex flex-wrap items-center",
        "justify-center sm:justify-end",
        "gap-x-2.5 sm:gap-x-3.5 md:gap-x-5 gap-y-1",
        "text-[11px] sm:text-sm md:text-base tracking-wide",
        "max-w-full min-w-0 pl-2 sm:pl-1",
        router.pathname === "/" ? "pr-1" : "pr-16 sm:pr-20",
      ].join(" ")}
    >
      {NAV_LINKS.map(({ href, label }) => {
        const active = isNavActive(router.pathname, router.asPath, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 transition whitespace-nowrap px-0.5 first:pl-1 first:sm:pl-0.5 ${
              active ? "text-red-500 font-semibold" : "text-gray-200 hover:text-[#a77a23]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
