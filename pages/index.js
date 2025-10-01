// pages/index.js
import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Home() {
  useEffect(() => {
    const video = document.getElementById("bg-video");
    if (video) video.playbackRate = 0.5; // storm motion
  }, []);

  return (
    <Layout title="Silver Spine Studio" description="Books, stories, and creative projects.">
      <div className="relative flex flex-col min-h-screen">
        {/* Background storm video */}
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
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 lightning-overlay pointer-events-none"></div>
        </div>

        {/* Hero content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg">
            Welcome to Silver Spine Studio
          </h1>
          <p className="text-lg md:text-2xl mb-10 max-w-2xl text-gray-200">
            Crafting stories that cut deep, linger long, and shine through the dark.
            Explore our books, dive into our world, and join the journey ahead.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
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
          <div className="mt-12 flex gap-6 text-2xl text-white">
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
        </main>

        {/* Footer pinned to bottom */}
        <footer className="bg-black/80 text-gray-400 py-6 text-center text-sm mt-auto">
          © {new Date().getFullYear()} Silver Spine Studio. All rights reserved.
        </footer>

        {/* Lightning flash animation */}
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
