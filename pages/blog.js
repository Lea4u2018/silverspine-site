// pages/blog.js
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Blog() {
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
    <div className="bg-black text-gray-100 min-h-screen flex flex-col relative overflow-hidden">
      <Head>
        <title>Blog | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Thoughts, inspirations, and behind-the-scenes insights from Silver Spine Studio. Explore the creative journey of Leameso James."
        />
      </Head>

      {/* Rain Video Background */}
      <video
        id="bg-video"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/Firefly-Rain.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

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

      {/* Blog Content */}
      <main className="flex-1 px-6 py-12 text-center mb-24 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">
          Welcome to Silver Spine Studio
        </h1>
        <div className="max-w-3xl mx-auto text-left space-y-6 leading-relaxed">
          <p>
            Every story has a shadow. Some you see coming, some you only notice
            when it’s already moved past you. Silver Spine Studio was born from
            chasing those shadows — the storm-soaked ones that linger on the
            highway, the whispered ones that follow families, and the quiet ones
            that live inside us all.
          </p>
          <p>
            I didn’t want a place of polished perfection. I wanted a place that
            felt alive, scarred, and a little dangerous. A studio where the
            stories aren’t afraid to bleed, where the rain smears the glass, and
            where light fights to cut through the dark.
          </p>
          <p>
            The first book to come from this vision,{" "}
            <span className="font-semibold text-yellow-400">The Beautiful Beast</span>,
            began on a cold mountain road and has taken years of grit to bring
            into the light. It’s a thriller, yes, but more than that, it’s a
            reminder of what storms expose: secrets, loyalties, betrayals — the
            kind of truths that don’t wash away with the rain.
          </p>
          <p>
            Here on the blog, I’ll share more than just announcements. You’ll
            find pieces of the journey — the craft, the failures, the
            inspirations, the late-night thoughts that keep the stories alive.
            Think of this as both a workshop and a fireside: equal parts grit
            and glow.
          </p>
          <p>
            So, welcome. Stay a while. The storm hasn’t broken yet, and the best
            stories are just beginning to walk out of the dark.
          </p>
          <p className="font-semibold">— Leameso James</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950/90 text-gray-300 text-center py-3 fixed bottom-0 left-0 w-full z-10">
        <p className="mb-1 text-sm">
          © {new Date().getFullYear()} Silver Spine Studio. All rights reserved.
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
            className="hover:text-yellow-400 trans
