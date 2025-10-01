import Link from "next/link";
import { useRouter } from "next/router";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Contact() {
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
      <main className="flex-1 px-6 py-12 text-center max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact</h1>
        <p className="text-gray-400 mb-8">
          Want to connect with Silver Spine Studio? Reach out anytime.
        </p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-2 rounded bg-gray-800 text-gray-100"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full px-4 py-2 rounded bg-gray-800 text-gray-100"
          />
          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full px-4 py-2 rounded bg-gray-800 text-gray-100"
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition"
          >
            Send
          </button>
        </form>
      </main>

      {/* Footer with Icons */}
      <footer className="bg-gray-950 text-gray-400 text-center py-8">
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
