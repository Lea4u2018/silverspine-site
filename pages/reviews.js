// pages/reviews.js
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function ReviewsPage() {
  const router = useRouter();
  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" }, // ✅ FIXED
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  const reviews = [
    {
      name: "Alex R.",
      text: "This book gripped me from the first page. Dark, cinematic, and unforgettable.",
      rating: 5,
    },
    {
      name: "Jordan M.",
      text: "The twists left me speechless. Easily one of the best thrillers I’ve read in years.",
      rating: 5,
    },
    {
      name: "Taylor S.",
      text: "Characters so vivid I still think about them weeks later. Highly recommended.",
      rating: 4,
    },
    {
      name: "Morgan K.",
      text: "A story that lingers like a storm—atmospheric and relentless.",
      rating: 5,
    },
  ];

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
      <Head>
        <title>Reader Reviews | Silver Spine Studio™</title>
        <meta
          name="description"
          content="What readers are saying about Silver Spine Studio books. Honest reviews and impressions."
        />
      </Head>

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

      {/* Reviews Grid */}
      <main className="flex-1 px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-12 text-yellow-400">Reader Reviews</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-2xl bg-gray-900 shadow-lg p-6 hover:shadow-xl transition duration-300"
            >
              <p className="mb-6 text-lg italic leading-relaxed">
                “{review.text}”
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{review.name}</span>
                <span className="text-yellow-400 text-sm">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
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
