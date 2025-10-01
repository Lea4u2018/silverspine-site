// components/Header.js
import Link from "next/link";

export default function Header() {
  const links = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Index" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
];

  return (
    <header className="bg-black text-white p-4 fixed top-0 w-full z-20 shadow-md">
      <nav className="flex justify-center space-x-6">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:underline hover:text-gray-300 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
