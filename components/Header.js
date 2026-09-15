// components/Header.js
import Link from "next/link";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

export default function Header() {
  const router = useRouter();
  const links = NAV_LINKS;

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Site Title / Logo */}
        <h1 className="text-2xl font-extrabold text-yellow-400">
          Silver Spine Studio<span className="align-super text-sm">™</span>
        </h1>

        {/* Navigation */}
        <nav className="flex space-x-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition ${
                isNavActive(router.pathname, router.asPath, href)
                  ? "text-red-500 font-semibold"
                  : "text-gray-200 hover:text-yellow-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
