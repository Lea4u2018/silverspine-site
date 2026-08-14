// /pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SiteNav from "@/components/SiteNav";
import StormAtmosphere from "@/components/StormAtmosphere";
import FixedMusicControl from "@/components/FixedMusicControl";
import { useCinematicAudio } from "@/components/CinematicAudio";
import { writePianoMuted } from "@/lib/cinematicAudio";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";
import { bindChromeVars } from "@/lib/chromeVars";
import { buildHomeSchemaGraph } from "@/lib/authorIdentity";
import LaunchMilestoneCountdown from "@/components/LaunchMilestoneCountdown";
import { NOVEL_PRICING, PREORDER_STATUS } from "@/lib/store";

export default function Home() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const headerRef = useRef(null);
  const { ensurePlaying: ensurePiano } = useCinematicAudio();

  useEffect(() => {
    // Header-only — observing the footer fed a resize/jump loop with hero height
    return bindChromeVars(headerRef.current);
  }, []);

  const THUNDER_VOLUME = 0.38;
  const THUNDER_PREF_KEY = "sss-home-thunder-muted";
  const STORM_GATE_KEY = "sss-storm-entered";
  const [showStormGate, setShowStormGate] = useState(true);
  const [gateLeaving, setGateLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState([]);
  const userMutedRef = useRef(false);
  const thunderFadeTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const SILVER = "#c9ced6";

  const clearThunderTimers = () => {
    if (thunderFadeTimerRef.current) {
      window.clearInterval(thunderFadeTimerRef.current);
      thunderFadeTimerRef.current = null;
    }
  };

  const stopThunder = ({ fade = false } = {}) => {
    const audio = audioRef.current;
    clearThunderTimers();
    if (!audio) return;

    if (!fade) {
      audio.pause();
      audio.muted = true;
      audio.volume = 0;
      try {
        audio.currentTime = 0;
      } catch {}
      return;
    }

    const startVol = audio.volume || THUNDER_VOLUME;
    let step = 0;
    thunderFadeTimerRef.current = window.setInterval(() => {
      step += 1;
      audio.volume = Math.max(0, startVol * (1 - step / 12));
      if (step >= 12) {
        clearThunderTimers();
        audio.pause();
        audio.muted = true;
        audio.volume = 0;
        try {
          audio.currentTime = 0;
        } catch {}
      }
    }, 80);
  };

  // Continuous storm bed — the old short bursts + long gaps felt broken / drop-in-out.
  const startThunder = async () => {
    const audio = audioRef.current;
    if (!audio || userMutedRef.current) return;

    clearThunderTimers();
    audio.loop = true;
    audio.muted = false;
    audio.volume = THUNDER_VOLUME;
    try {
      // Keep place if already rolling; only restart if near the end or stopped cold.
      if (audio.paused || audio.currentTime < 0.05) {
        audio.currentTime = 0;
      }
    } catch {}
    try {
      await audio.play();
    } catch {
      return;
    }
  };

  // Keep home thunder pref in sync — actual pause/play is handled by stopAllAmbient / playAllAmbient.
  useEffect(() => {
    const onAmbientMute = (e) => {
      const muted = !!(e?.detail && e.detail.muted);
      userMutedRef.current = muted;
      try {
        window.localStorage.setItem(THUNDER_PREF_KEY, muted ? "1" : "0");
      } catch {
        /* ignore */
      }
      // Hard stop (no fade) so Mute always kills home thunder immediately
      if (muted) stopThunder({ fade: false });
      else if (!showStormGate) startThunder();
    };
    window.addEventListener("sss-piano-mute", onAmbientMute);
    return () => window.removeEventListener("sss-piano-mute", onAmbientMute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStormGate]);

  const [logoSrc, setLogoSrc] = useState(PRIMARY_DISC_LOGO);
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
        if (!cancelled) {
          setLogoSrc(srcs[idx]);
          setUseTextLogo(false);
        }
      };
      test.onerror = () => tryLoad(srcs, idx + 1);
      test.src = srcs[idx];
    };
    tryLoad(DISC_LOGO_CANDIDATES);
    return () => {
      cancelled = true;
    };
  }, []);

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
    vid.playbackRate = 0.22; // slower lightning — less “hospital pulse,” more storm
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

  const setStormGateFlag = (open) => {
    try {
      if (open) {
        document.documentElement.dataset.sssStormGate = "1";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        delete document.documentElement.dataset.sssStormGate;
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      window.dispatchEvent(new Event("sss-storm-gate"));
    } catch {
      /* ignore */
    }
  };

  // Storm gate guarantees a user gesture so thunder can legally start.
  useEffect(() => {
    let prefMuted = false;
    let alreadyEntered = false;
    try {
      prefMuted = window.localStorage.getItem(THUNDER_PREF_KEY) === "1";
      alreadyEntered = window.sessionStorage.getItem(STORM_GATE_KEY) === "1";
    } catch {}
    userMutedRef.current = prefMuted;

    const showGate = !alreadyEntered;
    setShowStormGate(showGate);
    setStormGateFlag(showGate);

    if (alreadyEntered) {
      // Returning visitors: resume piano bed if they left it on
      ensurePiano();
      if (!prefMuted) {
        startThunder();
      }
    }

    return () => {
      setStormGateFlag(false);
      stopThunder();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterTheStorm = async () => {
    setGateLeaving(true);
    try {
      window.sessionStorage.setItem(STORM_GATE_KEY, "1");
    } catch {}

    // Unlock the cinematic piano bed for the whole universe (header Mute controls it).
    writePianoMuted(false);
    await ensurePiano();

    if (!userMutedRef.current) {
      await startThunder();
    }

    window.setTimeout(() => {
      setShowStormGate(false);
      setGateLeaving(false);
      setStormGateFlag(false);
    }, 700);
  };

  // Keep the loop short — long duplicated tracks race past on phones even with slow durations.
  const SERIES_TICKER_ITEMS = Array.from(
    { length: 2 },
    () =>
      "The Silver Spine Studio™ Series: The Seven-Fold Chronicle — thrillers forged in storm and consequence"
  );
  // Short segments read cleaner than one giant uppercase sentence.
  const LAUNCH_TICKER_ITEMS = Array.from({ length: 2 }, () => [
    { label: "Sneak Peek $4.99 — Prologue & Ch. 1–2 · Insider whitelist", outNow: true },
    { label: "3 lucky winners will each receive a FULL digital copy — join the launch list · Happy Sleuthing!", outNow: false },
    { label: PREORDER_STATUS.digitalTicker, outNow: false },
    { label: PREORDER_STATUS.hardcoverTicker, outNow: false },
    { label: `Official release · ${NOVEL_PRICING.releaseLabel} · Regular ${NOVEL_PRICING.retail}`, outNow: false },
  ]).flat();

  const stormGate =
    mounted && showStormGate
      ? createPortal(
          <div
            className={`storm-gate ${gateLeaving ? "leaving" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Enter Silver Spine Studio"
          >
            <div className="storm-gate-flash" aria-hidden="true" />
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
                Enter for piano + thunder — the score follows you through the site · Mute anytime
              </p>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="bg-black text-gray-100 relative">
      <StormAtmosphere mood="threshold" />
      {stormGate}

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
            __html: JSON.stringify(buildHomeSchemaGraph()),
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
          }
          @media (min-width: 769px) {
            .ticker-wrap {
              mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
              -webkit-mask-image: linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%);
            }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            animation: tickerMove var(--ticker-speed, 48s) linear infinite;
          }
          .ticker-track.ticker-launch {
            --ticker-speed: 38s;
          }
          .ticker-group {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            white-space: nowrap;
          }
          /* Phones: crawl slow enough to read (set duration directly — Safari-safe) */
          @media (max-width: 768px) {
            .ticker-track {
              --ticker-speed: 180s;
              animation: tickerMove 180s linear infinite !important;
            }
            .ticker-track.ticker-launch {
              --ticker-speed: 160s;
              animation: tickerMove 160s linear infinite !important;
            }
            .ticker-item { padding: 0 1.35rem; font-size: 0.78rem; }
          }
          @media (min-width: 1280px) {
            .ticker-track { --ticker-speed: 56s; }
            .ticker-track.ticker-launch { --ticker-speed: 44s; }
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
            0%   { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          /* Reduced motion: never leave a clipped mid-scroll phrase stuck on screen */
          @media (prefers-reduced-motion: reduce) {
            .ticker-track {
              animation: none !important;
              width: 100%;
              transform: none !important;
            }
            .ticker-group {
              width: 100%;
              justify-content: center;
              flex-wrap: wrap;
              white-space: normal;
              text-align: center;
              padding: 0.15rem 0.75rem;
              gap: 0.15rem 0.5rem;
            }
            .ticker-group[aria-hidden="true"] { display: none; }
            .ticker-item {
              white-space: normal;
              padding: 0.1rem 0.5rem;
            }
            .ticker-item::after { display: none; }
            .storm-gate-flash { animation: none !important; opacity: 0 !important; }
          }

          .hero-frame {
            height: clamp(60vh, calc(100vh - var(--header-h) - var(--footer-h)), 78vh);
            overflow: hidden;
            isolation: isolate;
          }
          /*
            Real lightning bolts through the hero (not a blurry pulse light).
            Keep the black top band so bolts don’t start at the screen edge.
          */
          .hero-storm-wrap {
            position: absolute;
            left: 0;
            right: 0;
            top: 14%;
            bottom: 0;
            z-index: 10;
            overflow: hidden;
            pointer-events: none;
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 16%, black 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, black 16%, black 100%);
          }
          .hero-storm {
            width: 100%;
            height: 115%;
            object-fit: cover;
            object-position: center 55%;
            opacity: 0.85;
            mix-blend-mode: screen;
            filter: contrast(1.2) brightness(1.08) saturate(1.1);
          }
          .hero-top-shade {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 18%;
            background: linear-gradient(to bottom, #000 0%, #000 58%, rgba(0,0,0,0) 100%);
            z-index: 40;
            pointer-events: none;
          }

          .storm-gate {
            position: fixed;
            inset: 0;
            /* Must sit on document.body — if nested under Layout main, footer paints over it and the page “jumps” */
            z-index: 400;
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
        <div className="max-w-6xl mx-auto flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between px-4 md:px-6 py-2 md:py-3 min-w-0">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group shrink-0" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <span className="sss-logo-halo">
                <img
                  src={logoSrc}
                  alt="Silver Spine Studio logo"
                  className="sss-logo-glow h-[72px] md:h-[108px] lg:h-[122px] w-auto select-none"
                  draggable="false"
                />
              </span>
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold select-none" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
          </Link>

          <SiteNav className="w-full sm:w-auto justify-center sm:justify-end" />
        </div>

        <div className="ticker-wrap notranslate" translate="no">
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

        <LaunchMilestoneCountdown variant="home" />

      </header>

      <main className="relative z-10 overflow-hidden flex items-center justify-center text-center">
        <div className="relative w-full hero-frame">
          <img
            src="/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg"
            alt="Nebula background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0 contrast-110 saturate-125"
          />

          <div className="hero-storm-wrap overlay-fix" aria-hidden="true">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="hero-storm"
            >
              <source src="/storm-lightning.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="absolute inset-0 z-20 overlay-fix">
            {stars.map((s, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.max(8, s.top)}%`,
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

          <div className="absolute inset-0 bg-[rgba(10,14,22,0.16)] z-30 overlay-fix" />

          <div className="hero-top-shade" aria-hidden="true" />

          <div className="absolute inset-0 flex items-center justify-center z-50 px-4">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <FixedMusicControl embedded />
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
          </div>

          <audio
            id="sss-home-thunder"
            ref={audioRef}
            src="/thunder_rumble.mp3"
            preload="auto"
            playsInline
            loop
          />
        </div>
      </main>
    </div>
  );
}