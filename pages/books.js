// pages/books.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function BooksPage() {
  const router = useRouter();
  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  // Book data merged
  const books = [
    {
      title: "The Beautiful Beast",
      description:
        "A storm-soaked thriller set against the Million-Dollar Highway, dragging secrets into the light.",
      status: "Available soon",
      cover: "/covers/beautiful-beast.jpg",
    },
    {
      title: "Shadows of a Ghost",
      description:
        "A noir-inspired mystery where truth hides in the shadows, and the past refuses to stay buried.",
      status: "In the vault — waiting to be awakened.",
      cover: "/covers/shadows-of-a-ghost.jpg",
    },
    {
      title: "The Gathering Storm",
      description:
        "A haunting continuation where vengeance and fate collide under a storm-lit sky.",
      status: "On the horizon — the thunder hasn’t broken yet.",
      cover: "/covers/gathering-storm.jpg",
    },
  ];

  // SEO data
  const title = "Books by Leameso James | Silver Spine Studio™";
  const description =
    "Explore the Silver Spine Studio thriller series: The Beautiful Beast, Shadows of a Ghost, The Gathering Storm, and more by Leameso James.";
  const url = "https://www.silverspinestudio.com/books";
  const ogImage = "https://www.silverspinestudio.com/og/bookshelf.jpg";

  const booksJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.silverspinestudio.com/books`,
      name: book.title,
    })),
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
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

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(booksJsonLd) }}
        />
      </Head>

      {/* Header */}
      <header className="bg-gray-900 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-6">
          <h1 className="text-2xl font-extrabold text-yellow-400">
            Silver Spine Studio™
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

      {/* Main Book Grid */}
      <main className="flex-1 px-6 py-10 text-center mb-12 -mt-2">
        <h1 className="text-4xl font-bold mb-6">Books</h1>
        <div className="grid gap-10 md:grid-cols-3 max-w-6xl mx-auto">
          {books.map((book) => (
            <div
              key={book.title}
              className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-yellow-400/40 transition"
            >
              <div className="relative w-full h-[400px] mb-4">
                <Image
                  src={book.cover}
                  alt={`${book.title} cover`}
                  fill
                  className="rounded-lg bg-black object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-yellow-400">
                {book.title}
              </h2>
              <p className="text-gray-400 mb-4">{book.description}</p>
              <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-yellow-400 text-black font-semibold">
                {book.status}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 text-center py-3">
        <p className="mb-1 text-sm">
          © {new Date().getFullYear()} Silver Spine Studio™. All rights reserved.
        </p>
        <div className="flex justify-center space-x-5 text-lg">
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
