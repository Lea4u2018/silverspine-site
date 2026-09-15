// /pages/index.js
import Head from "next/head";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCinematicAudio } from "@/components/CinematicAudio";
import { writePianoMuted } from "@/lib/cinematicAudio";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";
import { buildHomeSchemaGraph } from "@/lib/authorIdentity";
import LaunchListForm from "@/components/LaunchListForm";
import { DIGITAL_COPY_GIVEAWAY, NOVEL_PRICING, PREORDER_STATUS } from "@/lib/store";
import { BookMark, QuillMark, NeighborsMark, ShopMark } from "@/components/HubMarks";

export default function Home() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const { ensurePlaying: ensurePiano } = useCinematicAudio();

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

  const LAUNCH_TICKER_ITEMS = Array.from({ length: 2 }, () => [
    { label: `Sneak Peek ${NOVEL_PRICING.sneakPeek} — Prologue & Ch. 1–2 · Insider whitelist`, outNow: true },
    { label: "Drawing for 3 full digital copies in mid-October 2026 from the launch list and left reviews. No purchase necessary.", outNow: false },
    { label: PREORDER_STATUS.digitalTicker, outNow: false },
    { label: PREORDER_STATUS.hardcoverTicker, outNow: false },
    { label: `Official release · ${NOVEL_PRICING.releaseLabel} · Digital ${NOVEL_PRICING.retail} · Paperback ${NOVEL_PRICING.paperback} · Hardcover ${NOVEL_PRICING.hardcover}`, outNow: false },
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
              <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#dfcfb5" }}>
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
    <div className="text-gray-100 relative">
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
            --header-h: 56px;
            --footer-h: 136px;
          }

          @keyframes twinkle { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
          @keyframes softPulse { 0%,100% { opacity: .65 } 50% { opacity: 1 } }
          .overlay-fix { pointer-events: none !important; }

          .ticker-wrap {
            position: relative;
            overflow: hidden;
            width: 100%;
            padding: 0.42rem 0;
            background: rgba(0,0,0,0.92);
            border-top: 1px solid rgba(223,207,181,0.35);
            border-bottom: 1px solid rgba(223,207,181,0.22);
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
            .home-book-photo { transform: none !important; }
          }

          .hero-frame {
            height: calc(100vh - var(--header-h) - var(--footer-h) - 2.4rem);
            overflow: hidden;
          }
          .home-book-stage {
            position: relative;
            z-index: 8;
            display: block;
            width: min(70%, 300px);
            margin: 0.25rem auto 0.5rem;
          }
          @media (min-width: 768px) {
            .home-book-stage {
              position: absolute;
              left: 11%;
              top: 4%;
              width: auto;
              max-width: min(50vw, 580px);
              max-height: calc(100dvh - var(--footer-h) - 17rem);
              margin: 0;
            }
          }
          .home-book-photo {
            width: auto;
            height: auto;
            max-width: min(50vw, 580px);
            max-height: calc(100dvh - var(--footer-h) - 17rem);
            display: block;
            object-fit: contain;
            object-position: left top;
            filter: drop-shadow(0 18px 28px rgba(0,0,0,0.72));
            transition: transform 0.35s ease;
          }
          .home-book-stage:hover .home-book-photo {
            transform: translateY(-4px);
          }
          .hero-copy-wrap {
            position: relative;
            z-index: 10;
          }
          @media (min-width: 768px) {
            .hero-copy-wrap {
              display: flex;
              justify-content: flex-end;
              padding-right: 3%;
            }
          }
          /*
            Real lightning bolts through the hero (not a blurry pulse light).
            Keep the black top band so bolts don’t start at the screen edge.
          */
          .hero-storm-wrap {
            position: absolute;
            inset: 0;
            z-index: 1;
            overflow: hidden;
            pointer-events: none;
            /* Blend the video with the mountain photo. Mix-blend on the video
               itself fails once this wrap has a z-index (it covers the scene). */
            mix-blend-mode: screen;
          }
          .hero-storm {
            width: 100%;
            height: 115%;
            object-fit: cover;
            object-position: center 45%;
            /* White bolts only — the mp4 is green; grayscale keeps the cover’s night color */
            opacity: 0.32;
            filter: grayscale(1) contrast(1.7) brightness(0.95);
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
            border: 1px solid rgba(223,207,181,0.7);
            background: #dfcfb5;
            color: #000;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            box-shadow: 0 10px 30px rgba(223,207,181,0.28);
            transition: transform 0.2s ease, background 0.2s ease;
          }
          .storm-enter-btn:hover {
            transform: translateY(-2px);
            background: #c5a059;
          }
          .home-cover-title {
            font-family: "Cinzel", Palatino, Georgia, serif;
            font-weight: 700;
            letter-spacing: 0.06em;
          }
          .launch-gold-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem 1.75rem;
            border-radius: 4px;
            font-family: "Cinzel", Palatino, Georgia, serif;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-size: 0.8rem;
            border: 2px solid #dfcfb5;
          }
          .launch-gold-btn.solid {
            background: #dfcfb5;
            color: #111;
          }
          .launch-gold-btn.solid:hover { background: #c5a059; }
          .launch-gold-btn.scroll-cue {
            padding: 0.35rem 1.05rem 0.28rem;
            font-size: 0.68rem;
            letter-spacing: 0.12em;
            border-width: 1px;
            line-height: 1.1;
            gap: 0;
            bottom: calc(var(--footer-h) + 8rem);
          }
          @media (max-width: 767px) {
            .launch-gold-btn.scroll-cue {
              bottom: calc(var(--footer-h) + 0.65rem);
            }
          }
          .launch-gold-btn.scroll-cue .scroll-cue-arrow {
            font-size: 0.7rem;
            line-height: 1;
            margin-top: -0.05rem;
          }
          .launch-gold-btn.line {
            background: #dfcfb5;
            color: #111;
          }
          .launch-gold-btn.line:hover { background: #c5a059; }
          .hub-mark {
            flex-shrink: 0;
            color: #dfcfb5;
            width: 3.5rem;
            height: 3.5rem;
          }
          .hub-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
            max-width: 920px;
            margin: 0 auto;
          }
          @media (min-width: 640px) {
            .hub-grid { grid-template-columns: repeat(2, 1fr); }
          }
          .hub-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            text-align: left;
            position: relative;
            padding: 1.5rem 2.5rem 1.5rem 1.5rem;
          }
          .hub-card-arrow {
            position: absolute;
            right: 1rem;
            bottom: 1rem;
            color: #dfcfb5;
            font-size: 1.05rem;
          }
          .launch-card {
            border: 1px solid rgba(223, 207, 181, 0.45);
            background: rgba(30, 36, 44, 0.55);
          }
          .launch-card:hover { border-color: #dfcfb5; }
        `}</style>
      </Head>

      <main className="relative z-10">
        <div className="ticker-wrap" role="region" aria-label="Studio news ticker">
          <div className="ticker-track ticker-launch text-[0.8rem] md:text-[0.86rem] text-[#dfcfb5]">
            <div className="ticker-group">
              {LAUNCH_TICKER_ITEMS.map((item, i) => (
                <span key={`t1-${i}`} className="ticker-item">
                  {item.outNow ? <span className="ticker-out-now">OUT NOW</span> : null}
                  {item.label}
                </span>
              ))}
            </div>
            <div className="ticker-group" aria-hidden="true">
              {LAUNCH_TICKER_ITEMS.map((item, i) => (
                <span key={`t2-${i}`} className="ticker-item">
                  {item.outNow ? <span className="ticker-out-now">OUT NOW</span> : null}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="relative border-b border-[#dfcfb5]/20">
          <div className="relative w-full hero-frame">
            <img
              src="/covers/hero-user-highway.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ objectPosition: "center 52%" }}
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

            <Link
              href="/books"
              className="home-book-stage"
              aria-label="The Beautiful Beast — hardcover"
            >
              <img
                src="/covers/1-the-beautiful-beast-hardcover.png"
                alt="The Beautiful Beast hardcover by Leameso James"
                className="home-book-photo"
                draggable="false"
              />
            </Link>

            <div className="hero-copy-wrap relative z-10 px-6 py-10 md:py-14 max-w-[1140px] mx-auto">
              <div className="w-full md:max-w-[32rem] text-center">
                  <h1
                    className="home-cover-title text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.25] mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] uppercase"
                    style={{ color: "#dfcfb5" }}
                  >
                    The storm is coming.
                    <br />
                    Prepare for The Beautiful Beast.
                  </h1>
                  <p className="text-base md:text-lg text-[#c9d0d8] mb-8">
                    The gripping new mystery thriller by{" "}
                    <strong style={{ color: "#dfcfb5" }}>Leameso James</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
                    <Link href="#email-capture-anchor" className="launch-gold-btn solid">
                      Join giveaway
                    </Link>
                    <Link href="/shop" className="launch-gold-btn solid">
                      Buy sneak peek
                    </Link>
                  </div>
                  <p className="text-base md:text-lg text-[#c9d0d8] leading-relaxed">
                    Drawing for <strong className="not-italic" style={{ color: "#dfcfb5" }}>{DIGITAL_COPY_GIVEAWAY.winners} full digital copies</strong> in {DIGITAL_COPY_GIVEAWAY.announceLabel} from the launch list and left reviews. No purchase necessary.
                  </p>
                </div>
            </div>

            <a
              href="#home-more"
              className="launch-gold-btn solid scroll-cue absolute left-1/2 -translate-x-1/2 z-20 no-underline flex-col"
            >
              <span>Scroll for more</span>
              <span aria-hidden="true" className="scroll-cue-arrow">▾</span>
            </a>
            <audio
              id="sss-home-thunder"
              ref={audioRef}
              src="/thunder_rumble.mp3"
              preload="auto"
              playsInline
              loop
            />
          </div>
        </section>

        <section id="home-more" className="py-14 md:py-20 px-6 bg-black/55 border-b border-[#dfcfb5]/20">
          <div className="launch-card max-w-[1140px] mx-auto rounded p-8 md:p-12">
            <h2 className="text-xl md:text-2xl tracking-[0.18em] uppercase mb-8 md:mb-10 text-center" style={{ color: "#dfcfb5" }}>
              Meet the author &amp; the studio
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="w-[120px] h-[140px] md:w-[132px] md:h-[154px] shrink-0 overflow-hidden rounded-sm border-2 bg-black" style={{ borderColor: "#dfcfb5" }}>
                <img src="/author.jpg" alt="Leameso James" className="w-full h-full object-cover object-top" draggable="false" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base md:text-lg text-white font-semibold mb-3 tracking-[0.08em] uppercase">
                  Welcome to Silver Spine Studio.
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-[0.95rem]">
                  Leameso James writes atmospheric mysteries and storm-soaked thrillers. This studio is the home of{" "}
                  <em>The Beautiful Beast</em> and the seven-fold chronicle.
                </p>
                <Link href="/about" className="text-sm font-bold tracking-wider hover:text-white uppercase" style={{ color: "#dfcfb5" }}>
                  [ Learn more about Leameso James ]
                </Link>
              </div>
              {logoSrc && !useTextLogo ? (
                <div className="hidden md:block shrink-0 md:border-l md:pl-8" style={{ borderColor: "rgba(167,122,35,0.25)" }}>
                  <img src={logoSrc} alt="Silver Spine Studio" className="h-20 w-auto" draggable="false" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 px-6 bg-[#0b0d10]">
          <div className="max-w-[1140px] mx-auto">
            <h2 className="text-xl md:text-2xl tracking-[0.18em] text-center uppercase mb-10" style={{ color: "#dfcfb5" }}>
              Explore the hub
            </h2>
            <div className="hub-grid">
              {[
                { href: "/books", label: "Books", copy: "The Beautiful Beast and the seven-fold chronicle.", Mark: BookMark },
                { href: "/blog", label: "Blog", copy: "Launch notes, character work, and studio news.", Mark: QuillMark },
                { href: "/neighbors", label: "Neighbors", copy: "Fellow sleuths and the studio community.", Mark: NeighborsMark },
                { href: "/shop", label: "Shop", copy: `Extended Sneak Peek ${NOVEL_PRICING.sneakPeek} and live storefronts.`, Mark: ShopMark },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="launch-card hub-card rounded-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <card.Mark />
                  <div className="min-w-0 pr-2">
                    <h3 className="text-base mb-1 tracking-[0.16em] uppercase" style={{ color: "#dfcfb5" }}>{card.label}</h3>
                    <p className="text-sm text-gray-300 mb-2">{card.copy}</p>
                    <span className="text-xs font-mono" style={{ color: "#dfcfb5" }}>{card.href}</span>
                  </div>
                  <span className="hub-card-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="email-capture-anchor" className="py-16 px-6 bg-black/55 border-t border-[#dfcfb5]/15">
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl text-center mb-2" style={{ color: "#dfcfb5" }}>Join the launch list</h3>
            <p className="text-sm text-gray-300 mb-6 text-center leading-relaxed">
              Enter the {DIGITAL_COPY_GIVEAWAY.announceLabel} drawing from the launch list and left reviews. No purchase necessary.
            </p>
            <LaunchListForm />
          </div>
        </section>
      </main>
    </div>
  );
}