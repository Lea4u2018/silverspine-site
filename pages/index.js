// pages/index.js
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Head>
        <title>Home | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Welcome to Silver Spine Studio™ — home of The Beautiful Beast and other thrillers by Leameso James."
        />
      </Head>

      {/* Header / Nav */}
      <header className="w-full border-b border-gray-800">
        <nav className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
          <div className="text-xl font-bold">
            Silver Spine Studio<span className="align-super text-xs">™</span>
          </div>
          <ul className="flex space-x-6 text-lg">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/books" className="hover:text-white">
                Books
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="text-center transform -translate-y-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Silver Spine Studio<span className="align-super text-base">™</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Stories that cut deep, thrill hard, and leave marks. Dive into{" "}
            <em>The Beautiful Beast</em> and more.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-gray-800 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto px-6">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Silver Spine Studio
            <span className="align-super text-xs">™</span>. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Example external links: replace with your own icons later */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/twitter.svg" alt="Twitter" className="h-6 w-6" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/facebook.svg" alt="Facebook" className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/instagram.svg" alt="Instagram" className="h-6 w-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
