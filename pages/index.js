// pages/index.js
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Index" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  return (
    <>
      <Head>
        <title>Silver Spine Studio</title>
        <meta name="description" content="Official Silver Spine Studio site" />
      </Head>

      {/* Navigation */}
      <nav className="flex justify-center space-x-6 p-4 bg-black text-white">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="hover:underline">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-gray-900 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Silver Spine Studio
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Books, stories, and creative projects come alive here.
        </p>

        {/* Example section: you can add more content below */}
        <div className="mt-8">
          <p className="italic text-gray-300">
            Explore our latest stories and creations.
          </p>
        </div>
      </main>
    </>
  );
}
