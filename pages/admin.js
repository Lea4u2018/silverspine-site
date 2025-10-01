import Link from "next/link";
import { useRouter } from "next/router";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Admin() {
  const router = useRouter();
  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Index" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-6">
          <h1 className="text-2xl font-extrabold text-yellow-400">
            Silver Spine Studio
          </h1>
          <nav className="flex space-x-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition ${
                  router.asPath === href
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

      {/* Content */}
      <main className="flex-1 px-6 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <p className="text-gray-400 mb-6">
          Welcome to the admin panel. This page is a placeholder — you can expand
          it later with tools for managing content, blog posts, or user access.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Manage Books</h2>
            <p className="text-gray-400">Add, edit, or remove books here.</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Manage Blog</h2>
            <p className="text-gray-400">Create and update blog posts.</p>
          </div>
        </div>
      </main>

      {/* Footer with Icons */}
      <footer className="bg-gray-950 text-gray-400 text-center py-8 mt-12">
        <p className="mb-4">
          © {new Date().getFullYear()} Silver Spine Studio. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6 text-2xl">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            <FaFacebook />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            <FaInstagram />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            <FaYoutube />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            <FaTiktok />
          </a>
        </div>
      </footer>
    </div>
  );
}
