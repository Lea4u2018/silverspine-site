// /pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const headerRef = useRef(null);

  // --- Measure header + footer so hero height fits with the footer visible ---
  useEffect(() => {
    const setVars = () => {
      const header = headerRef.current;
      const footer = document.getElementById("site-footer"); // from your global Footer
      const hH = header ? header.getBoundingClientRect().height : 140; // safe fallback
      const fH = footer ? footer.getBoundingClientRect().height : 220; // safe fallback
      document.documentElement.style.setProperty("--header-h", `${Math.round(hH)}px`);
      document.documentElement.style.setProperty("--footer-h", `${Math.round(fH)}px`);
    };
    setVars();

    const ro = new ResizeObserver(setVars);
    if (headerRef.current) ro.observe(headerRef.current);
    const footerEl = document.getElementById("site-footer");
    if (footerEl) ro.observe(footerEl);

    window.addEventListener("load", setVars);
    window.addEventListener("resize", setVars);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", setVars);
      window.removeEventListener("resize", setVars);
    };
  }, []);

  // Start muted (mobile autoplay-safe). User can enable.
  const [isMuted, setIsMuted] = useState(true);
  const [stars, setStars] = useState([]);

  // ---- LOGO PREFLIGHT — prioritize DISC and size to fill nav height ----
  const CANDIDATES = [
    "/SilverSpine_FB_Profile_CircleDisc_1024.png", // <<< Disc first
    "/SilverSpine_FB_Profile_1024.png",
    "/Silver_Spine_Studio_Logo_2025_10_11.png",
  ];
  const [logoSrc, setLogoSrc] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tryLoad = (srcs, idx = 0) => {
      if (idx >= srcs.length) {
        if (!cancelled) setUseTextLogo(true);
        return;
      }
      const test = new Image();
      test.onload = () => { if (!cancelled) setLogoSrc(srcs[idx]); };
      test.onerror = () => tryLoad(srcs, idx + 1);
      test.src = srcs[idx] + `?v=${Date.now()}`; // bust dev cache
    };
    tryLoad(CANDIDATES);
    return () => { cancelled = true; };
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  // Active helper: Home only on "/", others when pathname starts with href
  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.asPath.startsWith(href);
  };

  // --- Audio toggle + hint handling ---
  const [showAudioHint, setShowAudioHint] = useState(true);

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.muted = false;
      audio.volume = 0.25;
      audio.currentTime = 0;
      await audio.play();
      setIsMuted(false);
      setShowAudioHint(false);
    } catch { /* ignore */ }
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        audio.muted = false;
        audio.volume = 0.25;
        audio.currentTime = 0;
        audio.play().then(() => setShowAudioHint(false)).catch(() => {});
      } else {
        audio.pause();
        audio.muted = true;
      }
      return next;
    });
  };

  // Starfield once
  useEffect(() => {
    const newStars = Array.from({ length: 80 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  // Video control + performance
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = 0.45;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(vid);
    return () => io.disconnect();
  }, []);

  // ------- Announcement Ticker content -------
  const TICKER_SENTENCE =
    "Coming soon — The Silver Spine Studio™ Series: The Seven-Fold Chronicle";
  const TICKER_ITEMS = Array.from({ length: 8 }, () => TICKER_SENTENCE);

  return (
    <div className="bg-black text-gray-100">
      <Head>
        <title>Home | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Silver Spine Studio™ — thrillers forged in storm and consequence."
        />
        <link rel="canonical" href="https://www.silverspinestudio.com/" />
        <style>{`
          :root {
            /* Fallbacks until JS measures header/footer */
            --header-h: 140px;
            --footer-h: 220px;
          }

          @keyframes twinkle { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
          @keyframes softPulse { 0%,100% { opacity: .65 } 50% { opacity: 1 } }
          .overlay-fix { pointer-events: none !important; }

          /* --- Accessible marquee/ticker --- */
          .ticker-wrap {
            position: relative;
            overflow: hidden;
            background: rgba(0,0,0,0.95);
            border-top: 1px solid rgba(167,122,35,0.3);
            border-bottom: 1px solid rgba(0,0,0,0.4);
            mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
          }
          .ticker-track {
            display: inline-flex;
            white-space: nowrap;
            will-change: transform;
            animation: tickerMove var(--ticker-speed, 70s) linear infinite;
          }
          @media (max-width: 768px) {
            .ticker-track { --ticker-speed: 55s; }
          }
          @media (min-width: 1280px) {
            .ticker-track { --ticker-speed: 85s; }
          }
          .ticker-item {
            padding-right: 3rem;
            margin-right: 0.25rem;
            position: relative;
          }
          .ticker-item::after {
            content: "•";
            color: #b8ae96;
            opacity: 0.9;
            margin-left: 1.75rem;
          }
          .ticker-item:last-child::after { content: ""; }

          @keyframes tickerMove {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ticker-track { animation: none; }
          }

          /* Hero frame:
             - Uses real header/footer heights to fit on one screen.
             - Clamp keeps it cinematic across devices. */
          .hero-frame {
            height: clamp(60vh, calc(100vh - var(--header-h) - var(--footer-h)), 78vh);
          }
        `}</style>
      </Head>

      {/* Header (tightened) */}
      <header
        ref={headerRef}
        className="relative z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-2 md:py-3">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                /* Disc scaled to fill nav height comfortably */
                className="h-[88px] md:h-[108px] lg:h-[122px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(167,122,35,0.25)]"
                draggable="false"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold text-[#a77a23] select-none">
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
            <span className="hidden sm:inline text-lg md:text-2xl font-semibold tracking-wide text-[#a77a23]">
              Silver Spine Studio<span className="align-super text-sm md:text-base">™</span>
            </span>
          </Link>

          <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
            {links.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`transition ${
                    active
                      ? "text-red-500 font-semibold"
                      : "text-gray-200 hover:text-[#a77a23]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* --- Announcement Ticker (trim) --- */}
        <div className="ticker-wrap">
          <div
            className="ticker-track text-[0.9rem] md:text-base tracking-wide"
            style={{ color: "#f5edd7", padding: "6px 0" }}
            aria-label="Announcement ticker: Coming soon"
          >
            {TICKER_ITEMS.map((t, i) => (
              <span className="ticker-item" key={`a-${i}`}>{t}</span>
            ))}
            {TICKER_ITEMS.map((t, i) => (
              <span className="ticker-item" key={`b-${i}`}>{t}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Hero — centered & cinematic; footer fully visible without scrolling */}
      <main className="relative overflow-hidden flex items-center justify-center text-center">
        <div className="relative w-full hero-frame">
          {/* Nebula background */}
          <img
            src="/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg"
            alt="Nebula background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0 contrast-110 saturate-125"
          />

          {/* Lightning video */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-screen opacity-95 z-10 overlay-fix contrast-125 brightness-110 saturate-125"
          >
            <source src="/storm-lightning.mp4" type="video/mp4" />
          </video>

          {/* Star field */}
          <div className="absolute inset-0 z-20 overlay-fix">
            {stars.map((s, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  opacity: s.opacity,
                  animation: `twinkle ${3 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Minimal color unifier */}
          <div className="absolute inset-0 bg-[rgba(10,14,22,0.12)] z-30 overlay-fix" />

          {/* CINEMATIC LETTERBOX — ONLY TOP */}
          <div className="absolute top-0 left-0 w-full h-8 md:h-12 bg-black z-40 overlay-fix" />

          {/* Hero text */}
          <div className="absolute inset-0 flex items-center justify-center z-50 px-4">
            <div className="inline-block rounded-xl bg-black/35 backdrop-blur-[1.5px] px-4 py-3 md:px-6 md:py-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-2 md:mb-3 text-[#a77a23] tracking-wide leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Welcome to Silver Spine Studio
                <span className="align-super text-2xl">™</span>
              </h1>
              <h2 className="text-lg md:text-2xl text-gray-100 mb-2 tracking-widest italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Where thrillers strike like lightning.
              </h2>
              <p className="text-base md:text-xl text-gray-100 max-w-[60ch] mx-auto italic tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Stories forged in storm and consequence, where beauty and danger
                share the same breath.
              </p>
            </div>
          </div>

          {/* Thunder audio */}
          <audio ref={audioRef} muted={isMuted} loop preload="auto">
            <source src="/thunder_rumble.mp3" type="audio/mpeg" />
          </audio>

          {/* Audio toggle */}
          <button
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              setIsMuted((prev) => {
                const next = !prev;
                if (!next) {
                  audio.muted = false;
                  audio.volume = 0.25;
                  audio.currentTime = 0;
                  audio.play().catch(() => {});
                } else {
                  audio.pause();
                  audio.muted = true;
                }
                return next;
              });
            }}
            className="absolute top-4 right-4 z-50 text-[#a77a23] hover:text-white text-2xl"
            title={isMuted ? "Enable Thunder" : "Mute Thunder"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Clickable hint */}
          {showAudioHint && (
            <button
              onClick={async () => {
                try {
                  const audio = audioRef.current;
                  if (!audio) return;
                  audio.muted = false;
                  audio.volume = 0.25;
                  audio.currentTime = 0;
                  await audio.play();
                  setIsMuted(false);
                  setShowAudioHint(false);
                } catch {/* ignore */}
              }}
              className="absolute top-4 right-16 z-50 select-none"
              aria-live="polite"
              title="To hear thunder, click here"
            >
              <div
                className="flex items-center gap-2 bg-black/70 text-gray-100 border border-[#a77a23]/60 rounded-full px-3 py-1 shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
                style={{ animation: "softPulse 2.2s ease-in-out infinite" }}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-[#a77a23]" />
                <span className="text-xs md:text-sm tracking-wide">
                  To hear thunder, click here
                </span>
              </div>
            </button>
          )}
        </div>
      </main>
      {/* Global Footer renders after this; no local footer here */}
    </div>
  );
}
