// pages/index.js
import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Home() {
  useEffect(() => {
    const video = document.getElementById("bg-video");
    if (video) video.playbackRate = 0.5; // slow, stormy vibe
  }, []);

  return (
    <Layout title="Silver Spine Studio" description="Books, stories, and creative projects.">
      {/* Wrap so the background layers sit behind content, not behind the fixed header */}
      <div className="relative min-h-screen">
        {/* Background storm video (put /public/storm-lightning.mp4) */}
        <div className="absolute inset-0 -z-10">
          <video
            id="bg-video"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/storm-lightning.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay to keep text readable */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Lightning flash effect */}
          <div className="absolute inset-0 lightning-overlay pointer-events-none" />
        </div>

        {/* Hero content (left aligned to match other pages) */}
        <main className="px-8 py-16 text-white">
          <section className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg">
              Welcome to Silver Spine Studio
            </h1>
            <p className="text-lg md:text-2xl mb-10 max-w-3xl text-gray-200">
              Crafting stories that cut deep, linger long, and shine through the dark.
              Explore our books, dive into our world, and join the journey ahead.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link
                href="/books"
                className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
              >
                Explore Books
              </Link>
              <Link
                href="/about"
                className="border border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:text-black transition"
              >
                Learn More
              </Link>
            </div>

            {/* Social icons */}
            <div className="mt-12 flex items-center gap-6 text-2xl">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition">
                <FaYoutube />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition">
                <FaTiktok />
              </a>
            </div>
          </section>
        </main>

        {/* Footer (same look across site) */}
        <footer className="bg-black/80 text-gray-400 py-6 text-center text-sm">
          © {new Date().getFullYear()} Silver Spine Studio. All rights reserved.
        </footer>

        {/* Page-only styles for lightning flash */}
        <style jsx>{`
          .lightning-overlay {
            animation: flash 20s infinite;
          }
          @keyframes flash {
            0%, 96%, 100% { background: transparent; }
            97% { background: rgba(255, 255, 255, 0.55); }
            98% { background: transparent; }
            99% { background: rgba(255, 255, 255, 0.35); }
          }
        `}</style>
      </div>
    </Layout>
  );
}
