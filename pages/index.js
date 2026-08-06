// /pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

export default function Home() {
  const router = useRouter();
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const setVars = () => {
      const header = headerRef.current;
      const footer = document.getElementById("site-footer");
      const hH = header ? header.getBoundingClientRect().height : 140;
      const fH = footer ? footer.getBoundingClientRect().height : 72;
      document.documentElement.style.setProperty("--header-h", `${Math.round(hH)}px`);
      document.documentElement.style.setProperty("--footer-h", `${Math.round(fH)}px`);
    };
    setVars();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setVars) : null;
    if (ro && headerRef.current) ro.observe(headerRef.current);
    const footerEl = document.getElementById("site-footer");
    if (ro && footerEl) ro.observe(footerEl);

    window.addEventListener("load", setVars);
    window.addEventListener("resize", setVars);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("load", setVars);
      window.removeEventListener("resize", setVars);
    };
  }, []);

  const THUNDER_VOLUME = 0.32;
  const THUNDER_PREF_KEY = "sss-home-thunder-muted";
  const STORM_GATE_KEY = "sss-storm-entered";
  const [isMuted, setIsMuted] = useState(true);
  const [showStormGate, setShowStormGate] = useState(true);
  const [gateLeaving, setGateLeaving] = useState(false);
  const [stars, setStars] = useState([]);
  const userMutedRef = useRef(false);

  const SILVER = "#c9ced6";

 const CANDIDATES = [
  "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png",
  "/Final_Silver_Spine_Circular_Logo_With_Words.png",
  "/SilverSpine_FB_Profile_CircleDisc_1024.png",
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
      test.onload = () => {
        if (!cancelled) setLogoSrc(srcs[idx]);
      };
      test.onerror = () => tryLoad(srcs, idx + 1);
      test.src = srcs[idx] + `?v=${Date.now()}`;
    };
    tryLoad(CANDIDATES);
    return () => {
      cancelled = true;
    };
  }, []);

  const links = NAV_LINKS;
  const isActive = (href) => isNavActive(router.pathname, router.asPath, href);

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

  // Storm gate guarantees a user gesture so thunder can legally start.
  useEffect(() => {
    let prefMuted = false;
    let alreadyEntered = false;
    try {
      prefMuted = window.localStorage.getItem(THUNDER_PREF_KEY) === "1";
      alreadyEntered = window.sessionStorage.getItem(STORM_GATE_KEY) === "1";
    } catch {}
    userMutedRef.current = prefMuted;
    setIsMuted(prefMuted);

    setShowStormGate(!alreadyEntered);
    if (alreadyEntered && !prefMuted) {
      const el = audioRef.current;
      if (el) {
        el.muted = false;
        el.volume = THUNDER_VOLUME;
        el.play().catch(() => {});
        setIsMuted(false);
      }
    }
  }, []);

  const enterTheStorm = async () => {
    setGateLeaving(true);
    try {
      window.sessionStorage.setItem(STORM_GATE_KEY, "1");
    } catch {}

    const audio = audioRef.current;
    if (audio && !userMutedRef.current) {
      try {
        audio.muted = false;
        audio.volume = THUNDER_VOLUME;
        await audio.play();
        setIsMuted(false);
      } catch {
        setIsMuted(true);
      }
    }

    window.setTimeout(() => {
      setShowStormGate(false);
      setGateLeaving(false);
    }, 700);
  };

  const SERIES_TICKER_ITEMS = Array.from(
    { length: 6 },
    () =>
      "The Silver Spine Studio™ Series: The Seven-Fold Chronicle — thrillers forged in storm and consequence"
  );
  // Short segments read cleaner than one giant uppercase sentence.
  const LAUNCH_TICKER_ITEMS = Array.from({ length: 4 }, () => [
    { label: "The Beautiful Beast Extended Sneak Peek — $4.99", outNow: true },
    { label: "Insider full novel $14.99 · Sep 1–Oct 19, 2026", outNow: false },
    { label: "Full retail $24.99 starts Oct 20, 2026", outNow: false },
  ]).flat();

  return (
    <div className="bg-black text-gray-100">
      {showStormGate && (
        <div
          className={`storm-gate ${gateLeaving ? "leaving" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Enter Silver Spine Studio"
        >
          <div className="storm-gate-flash" aria-hidden="true" />
          <div className="storm-bolts" aria-hidden="true">
            <span className="bolt bolt-a" />
            <span className="bolt bolt-b" />
            <span className="bolt bolt-c" />
          </div>
          <div className="relative z-10 max-w-xl mx-auto">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#a77a23" }}>
              Silver Spine Studio™
            </p>
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-wide mb-3"
              style={{ color: SILVER, textShadow: "0 2px 16px rgba(0,0,0,0.85)" }}
            >
              The storm is already waiting.
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-2">
              Step inside for thunder, lightning, and the first pages of the seven-fold chronicle.
            </p>
            <button type="button" className="storm-enter-btn" onClick={enterTheStorm}>
              Enter the storm
            </button>
            <p className="mt-4 text-[11px] md:text-xs text-gray-500">
              Sound starts with entry · you can mute anytime
            </p>
          </div>
        </div>
      )}

      <Head>
        <title>Silver Spine Studio™ | The Beautiful Beast &amp; Seven-Fold Chronicle</title>
        <meta
          name="description"
          content="Silver Spine Studio™ by Leameso James — storm-soaked thrillers forged in consequence. Read The Beautiful Beast Extended Sneak Peek and enter the seven-fold chronicle."
        />
        <meta
          name="keywords"
          content="Silver Spine Studio, Leameso James, The Beautiful Beast, thriller books, rural noir, Colorado thriller, sneak peek, indie author"
        />
        <link rel="canonical" href="https://www.silverspinestudio.com/" />
        <meta property="og:title" content="Silver Spine Studio™ | The Beautiful Beast" />
        <meta
          property="og:description"
          content="Thrillers forged in storm and consequence. Enter the seven-fold chronicle."
        />
        <meta property="og:url" content="https://www.silverspinestudio.com/" />
        <meta
          property="og:image"
          content="https://www.silverspinestudio.com/covers/1-the-beautiful-beast-full-tagged.png"
        />
        <meta name="twitter:title" content="Silver Spine Studio™ | The Beautiful Beast" />
        <meta
          name="twitter:description"
          content="Thrillers forged in storm and consequence. Enter the seven-fold chronicle."
        />
        <meta
          name="twitter:image"
          content="https://www.silverspinestudio.com/covers/1-the-beautiful-beast-full-tagged.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "Silver Spine Studio",
                  url: "https://www.silverspinestudio.com/",
                  logo: "https://www.silverspinestudio.com/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png",
                  sameAs: [
                    "https://www.facebook.com/SilverSpineStudio/",
                    "https://www.instagram.com/silverspinestudio/",
                    "https://www.youtube.com/@silverspinestudio",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "Silver Spine Studio",
                  url: "https://www.silverspinestudio.com/",
                  publisher: { "@type": "Organization", name: "Silver Spine Studio" },
                },
                {
                  "@type": "Book",
                  name: "The Beautiful Beast",
                  author: { "@type": "Person", name: "Leameso James" },
                  url: "https://www.silverspinestudio.com/books/the-beautiful-beast",
                  image: "https://www.silverspinestudio.com/covers/1-the-beautiful-beast-full-tagged.png",
                  genre: ["Thriller", "Crime", "Rural Noir"],
                },
              ],
            }),
          }}
        />
        <style>{`
          :root {
            --header-h: 140px;
            --footer-h: 72px;
          }

          @keyframes twinkle { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
          @keyframes softPulse { 0%,100% { opacity: .65 } 50% { opacity: 1 } }
          .overlay-fix { pointer-events: none !important; }

          .ticker-wrap {
            position: relative;
            overflow: hidden;
            background: rgba(0,0,0,0.95);
            border-top: 1px solid rgba(167,122,35,0.3);
            border-bottom: 1px solid rgba(0,0,0,0.4);
            mask-image: linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%);
          }
          .ticker-track {
            display: flex;
            width: max-content;
            will-change: transform;
            animation: tickerMove var(--ticker-speed, 60s) linear infinite;
          }
          .ticker-track.ticker-launch {
            --ticker-speed: 48s;
          }
          .ticker-group {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            white-space: nowrap;
          }
          @media (max-width: 768px) {
            .ticker-track { --ticker-speed: 42s; }
            .ticker-track.ticker-launch { --ticker-speed: 36s; }
          }
          @media (min-width: 1280px) {
            .ticker-track { --ticker-speed: 72s; }
            .ticker-track.ticker-launch { --ticker-speed: 56s; }
          }
          .ticker-item {
            display: inline-flex;
            align-items: center;
            padding: 0 1.75rem;
            position: relative;
          }
          .ticker-item::after {
            content: "•";
            position: absolute;
            right: 0;
            color: #b8ae96;
            opacity: 0.85;
            transform: translateX(50%);
          }
          .ticker-out-now {
            color: #ef4444;
            font-weight: 800;
            margin-right: 0.4em;
          }

          @keyframes tickerMove {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ticker-track { animation: none; }
            .storm-gate-flash, .bolt { animation: none !important; opacity: 0 !important; }
          }

          .hero-frame {
            height: clamp(60vh, calc(100vh - var(--header-h) - var(--footer-h)), 78vh);
          }

          .storm-gate {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1.5rem;
            background:
              radial-gradient(ellipse at 50% 40%, rgba(30,40,70,0.55), rgba(0,0,0,0.92) 62%),
              #000;
            transition: opacity 0.65s ease, visibility 0.65s ease;
          }
          .storm-gate.leaving {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
          .storm-gate-flash {
            position: absolute;
            inset: 0;
            background: rgba(255,255,255,0.08);
            animation: gateFlash 2.8s ease-in-out infinite;
            pointer-events: none;
          }
          @keyframes gateFlash {
            0%, 88%, 100% { opacity: 0; }
            90% { opacity: 1; }
            93% { opacity: 0.15; }
            96% { opacity: 0.65; }
          }
          .storm-bolts {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
          }
          .bolt {
            position: absolute;
            width: 3px;
            height: 42%;
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0) 0%,
              rgba(230,240,255,0.95) 35%,
              rgba(167,122,35,0.85) 70%,
              rgba(255,255,255,0) 100%
            );
            filter: drop-shadow(0 0 8px rgba(200,220,255,0.85)) drop-shadow(0 0 18px rgba(167,122,35,0.45));
            transform-origin: top center;
            opacity: 0;
            clip-path: polygon(40% 0, 70% 0, 55% 38%, 85% 38%, 20% 100%, 40% 48%, 15% 48%);
          }
          .bolt-a {
            left: 18%;
            top: -5%;
            animation: boltStrike 4.8s ease-in-out infinite;
          }
          .bolt-b {
            left: 62%;
            top: -8%;
            height: 50%;
            animation: boltStrike 6.2s ease-in-out 1.6s infinite;
          }
          .bolt-c {
            left: 78%;
            top: 0;
            height: 36%;
            animation: boltStrike 5.4s ease-in-out 3.1s infinite;
          }
          @keyframes boltStrike {
            0%, 86%, 100% { opacity: 0; transform: translateY(-8%) scaleY(0.7); }
            88% { opacity: 1; transform: translateY(0) scaleY(1); }
            90% { opacity: 0.25; }
            92% { opacity: 0.9; transform: translateY(2%) scaleY(1.05); }
            95% { opacity: 0; }
          }
          .storm-enter-btn {
            margin-top: 1.5rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.9rem 1.6rem;
            border-radius: 999px;
            border: 1px solid rgba(167,122,35,0.7);
            background: #a77a23;
            color: #000;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            box-shadow: 0 10px 30px rgba(167,122,35,0.28);
            transition: transform 0.2s ease, background 0.2s ease;
          }
          .storm-enter-btn:hover {
            transform: translateY(-2px);
            background: #c49231;
          }
        `}</style>
      </Head>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-2 md:py-3">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                className="h-[88px] md:h-[108px] lg:h-[122px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(201,206,214,0.28)]"
                draggable="false"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold select-none" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}

            <span className="hidden sm:inline text-lg md:text-2xl font-semibold tracking-wide" style={{ color: SILVER }}>
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

        <div className="ticker-wrap">
          <div
            className="ticker-track text-[0.9rem] md:text-base tracking-wide border-b border-white/5"
            style={{ color: "#f5edd7", padding: "6px 0" }}
            aria-label="Series announcement ticker"
          >
            <div className="ticker-group">
              {SERIES_TICKER_ITEMS.map((t, i) => (
                <span className="ticker-item" key={`a-${i}`}>{t}</span>
              ))}
            </div>
            <div className="ticker-group" aria-hidden="true">
              {SERIES_TICKER_ITEMS.map((t, i) => (
                <span className="ticker-item" key={`b-${i}`}>{t}</span>
              ))}
            </div>
          </div>

          <div
            className="ticker-track ticker-launch text-[0.8rem] md:text-sm tracking-wide font-semibold"
            style={{ color: "#f5edd7", padding: "5px 0", background: "rgba(0,0,0,0.2)" }}
            aria-label="Launch alert: out now"
          >
            <div className="ticker-group">
              {LAUNCH_TICKER_ITEMS.map((item, i) => (
                <span className="ticker-item" key={`c-${i}`}>
                  {item.outNow && <span className="ticker-out-now">OUT NOW:</span>}
                  {item.label}
                </span>
              ))}
            </div>
            <div className="ticker-group" aria-hidden="true">
              {LAUNCH_TICKER_ITEMS.map((item, i) => (
                <span className="ticker-item" key={`d-${i}`}>
                  {item.outNow && <span className="ticker-out-now">OUT NOW:</span>}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

      </header>

      <main className="relative overflow-hidden flex items-center justify-center text-center">
        <div className="relative w-full hero-frame">
          <img
            src="/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg"
            alt="Nebula background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0 contrast-110 saturate-125"
          />

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

          <div className="absolute inset-0 bg-[rgba(10,14,22,0.12)] z-30 overlay-fix" />

          <div className="absolute top-0 left-0 w-full h-8 md:h-12 bg-black z-40 overlay-fix" />

          <div className="absolute inset-0 flex items-center justify-center z-50 px-4">
            <div className="inline-block rounded-xl bg-black/35 backdrop-blur-[1.5px] px-4 py-3 md:px-6 md:py-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
              <h1
                className="text-5xl md:text-7xl font-extrabold mb-2 md:mb-3 tracking-wide leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                style={{ color: SILVER }}
              >
                Welcome to Silver Spine Studio
                <span className="align-super text-2xl">™</span>
              </h1>

              <h2 className="text-lg md:text-2xl text-gray-100 mb-2 tracking-widest italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Where thrillers strike like lightning…
              </h2>

              <p className="text-base md:text-xl text-gray-100 max-w-[60ch] mx-auto italic tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Stories are forged in storms of consequence, as beauty and danger share the same breath.
              </p>
            </div>
          </div>

          <audio ref={audioRef} loop preload="auto" playsInline>
            <source src="/thunder_rumble.mp3" type="audio/mpeg" />
          </audio>

          <button
            type="button"
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              setIsMuted((prev) => {
                const next = !prev;
                userMutedRef.current = next;
                try {
                  window.localStorage.setItem(THUNDER_PREF_KEY, next ? "1" : "0");
                } catch {}
                if (!next) {
                  audio.muted = false;
                  audio.volume = THUNDER_VOLUME;
                  audio.play().catch(() => {});
                } else {
                  audio.pause();
                  audio.muted = true;
                }
                return next;
              });
            }}
            className="absolute top-4 right-4 z-[60] text-[#a77a23] hover:text-white text-2xl"
            title={isMuted ? "Turn thunder on" : "Turn thunder off"}
            aria-label={isMuted ? "Turn thunder on" : "Turn thunder off"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </main>
    </div>
  );
}