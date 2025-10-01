// pages/index.js
import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const video = document.getElementById("bg-video");
    if (video) video.playbackRate = 0.5;
  }, []);

  return (
    <Layout
      title="Silver Spine Studio"
      description="Books, stories, and creative projects."
    >
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
        <main className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-yellow-400 drop-shadow-lg">
            Welcome to Silver Spine Studio
          </h1>

          <p className="text-lg md:text-2xl mb-12 max-w-2xl text-gray-200 leading-relaxed">
            Crafting stories that cut deep, linger long, and shine through the dark.
            Explore our books, dive into our world, and join the journey ahead.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-8 mt-4">
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
        </main>

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
