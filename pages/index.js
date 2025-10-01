// pages/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Home() {
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  // Slow down background storm video
  useEffect(() => {
    const video = document.getElementById("bg-video");
    if (video) {
      video.playbackRate = 0.5;
    }
  }, []);

  // SEO data
  const title = "Silver Spine Studio™ — Noir Thrillers by Leameso James";
  const description =
    "Official site of Silver Spine Studio™. Explore The Beautiful Beast, Shadows of a Ghost, The Gathering Storm, and more by Leameso James.";
  const url = "https://www.silverspinestudio.com";
  const ogImage = `${url}/og/series-cover.jpg`;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Silver Spine Studio",
    "url": url,
    "logo": `${url}/og/logo.png`,
    "sameAs": [
      "https://instagram.com/SilverSpineStudio",
      "https://twitter.com/SilverSpineStudio",
      "https://facebook.com/SilverSpineStudio",
      "https://youtube.com/@SilverSpineStudio",
      "https://tiktok.com/@SilverSpineStudio"
    ]
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col relative overflow-hidden">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Silver Spine Studio" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </Head>

      {/* Background Storm Video */}
      <video
        id="bg-video"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/storm-lightning.mp4" type="video/mp4" />
      </video>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Lightning overlay flashes */}
      <div className="lightning-overlay absolute inset-0 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/70 backdrop-blur-md shadow-md">
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

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-yellow-400">
          Welcome to Silver Spine Studio
        </h2>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl">
          Crafting stories that cut deep, linger long, and shine through the
          dark. Explore our books, dive into our world, and join the journey
          ahead.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/books/books"
            className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
          >
            Explore Books
          </Link>
          <Link
            href="/about"
            className="border border-yellow-400 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition"
          >
            Learn More
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-950/70 text-gray-400 text-center py-8">
        <p className="mb-4">
          © {new Date().getFullYear()} Silver Spine Studio™. All rights reserved.
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

      {/* Lightning effect styles */}
      <style jsx>{`
        .lightning-overlay {
          animation: flash 20s infinite;
        }
        @keyframes flash {
          0%, 96%, 100% {
            background: transparent;
          }
          97% {
            background: rgba(255, 255, 255, 0.6);
          }
          98% {
            background: transparent;
          }
          99% {
            background: rgba(255, 255, 255, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
