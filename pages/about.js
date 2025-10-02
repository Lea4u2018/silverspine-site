// pages/about.js
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function About() {
  const router = useRouter();
  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" }, // ✅ FIXED
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
      <Head>
        <title>About | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Learn more about Leameso James, author and founder of Silver Spine Studio. Discover the vision and story behind the books."
        />
      </Head>

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-md relative z-10">
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

      {/* Main Content */}
      <main className="flex-1 px-6 py-16 text-center relative z-10">
        <h1 className="text-4xl font-bold mb-10 text-yellow-400">About the Author</h1>

        {/* Author Photo */}
        <div className="flex justify-center mb-8">
          <img
            src="/author.jpg"
            alt="Leameso James"
            className="w-40 h-40 object-cover rounded-full border-4 border-yellow-400 shadow-lg"
          />
        </div>

        {/* Bio */}
        <div className="max-w-3xl mx-auto text-left text-lg leading-relaxed space-y-6">
          <p>
            <span className="font-semibold text-yellow-400">Leameso James</span>,
            born in Newark, New Jersey and raised in Tuskegee, Alabama, has always been captivated
            by the pull of cinematic storytelling. What moves her most is not simply conflict,
            but the fragile space between endurance and temptation — the way characters reveal
            both their brilliance and their breaking points, their strength and their scars.
          </p>
          <p>
            Currently completing her studies in <span className="font-semibold">Cybersecurity at the University of Phoenix</span>,
            James continues to draw strength from her faith. She openly acknowledges God as her source,
            her guide, and her anchor through every season of learning and creation.
          </p>
          <p>
            With that foundation, she has stepped fully into her creative calling as an
            <span className="font-semibold"> author and content creator</span>, establishing
            <span className="font-semibold"> Silver Spine Studio</span> as a home for unforgettable narratives.
            Her vision is clear: to craft stories with elegance and cinematic force — tales that do not shy away
            from darkness, yet always illuminate the beauty of resilience, redemption, and the human spirit.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950/90 text-gray-300 text-center py-5">
        <p className="mb-1 text-sm">
          © {new Date().getFullYear()} Silver Spine Studio. All rights reserved.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Hand-built from the ground up — code by code, line by line in
          <span className="text-yellow-400 font-semibold"> PyCharm</span>,
          powered by <span className="text-yellow-400 font-semibold">React/Next.js</span>.
        </p>
        <div className="flex justify-center space
