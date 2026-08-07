import Link from "next/link";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

/**
 * Primary site nav — wraps on phones so Shop is never clipped.
 */
export default function SiteNav({ className = "" }) {
  const router = useRouter();

  return (
    <nav
      aria-label="Primary"
      className={`flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 sm:gap-x-4 md:gap-x-6 text-xs sm:text-sm md:text-base ${className}`}
    >
      {NAV_LINKS.map(({ href, label }) => {
        const active = isNavActive(router.pathname, router.asPath, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`transition whitespace-nowrap ${
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
