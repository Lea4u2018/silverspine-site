// components/Header.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

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
                router.pathname === href
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
