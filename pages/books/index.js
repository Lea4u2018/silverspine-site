import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";
import {
  duckAmbientForNarration,
  restoreAmbientAfterNarration,
} from "@/lib/cinematicAudio";
import LaunchListForm from "@/components/LaunchListForm";
import LaunchMilestoneCountdown from "@/components/LaunchMilestoneCountdown";
import SiteNav from "@/components/SiteNav";
import StormAtmosphere from "@/components/StormAtmosphere";
import StoreHub from "@/components/StoreHub";
import { bindChromeVars } from "@/lib/chromeVars";
import { NOVEL_PRICING, PREORDER_STATUS } from "@/lib/store";

export default function Books() {
  const GOLD = "#a77a23";
  const SILVER = "#c9ced6";
  const headerRef = useRef(null);
  const router = useRouter();

  // ===== Measure header only (footer observe caused jump loops) =====
  useEffect(() => bindChromeVars(headerRef.current), []);

  // ===== Logo (instant primary path — no cache-bust delay) =====
  const [logoSrc, setLogoSrc] = useState(PRIMARY_DISC_LOGO);
  const [useTextLogo, setUseTextLogo] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const tryLoad = (i = 0) => {
      if (i >= DISC_LOGO_CANDIDATES.length) {
        if (!cancelled) setUseTextLogo(true);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) {
          setLogoSrc(DISC_LOGO_CANDIDATES[i]);
          setUseTextLogo(false);
        }
      };
      img.onerror = () => tryLoad(i + 1);
      img.src = DISC_LOGO_CANDIDATES[i];
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Hover narration (separate from thunder) =====
  const audioRefs = useRef({});
  const activeNarrationId = useRef(null);
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [pendingNarrationId, setPendingNarrationId] = useState(null);
  const [showNarrationChip, setShowNarrationChip] = useState(false);

  const tryPlayNarration = async (id) => {
    const el = audioRefs.current[id];
    if (!el) return;
    try {
      // Stop any other whisper still playing when moving between covers
      Object.entries(audioRefs.current).forEach(([key, other]) => {
        if (!other || Number(key) === id) return;
        try {
          other.pause();
          other.currentTime = 0;
        } catch {}
      });
      el.pause();
      el.currentTime = 0;
      el.playbackRate = id === 1 ? 1.02 : 0.92;
      el.volume = 0.95;
      activeNarrationId.current = id;
      duckAmbientForNarration();
      await el.play();
    } catch {
      if (activeNarrationId.current === id) {
        activeNarrationId.current = null;
        restoreAmbientAfterNarration();
      }
      setPendingNarrationId(id);
      setShowNarrationChip(true);
    }
  };

  const stopNarration = (id) => {
    const el = audioRefs.current[id];
    if (!el) return;
    if (id === 1) {
      const fade = setInterval(() => {
        if (el.volume > 0.05) {
          el.volume = Math.max(0, el.volume - 0.07);
        } else {
          clearInterval(fade);
          el.pause();
          el.volume = 0.95;
          if (activeNarrationId.current === id) {
            activeNarrationId.current = null;
            restoreAmbientAfterNarration();
          }
        }
      }, 40);
    } else {
      el.pause();
      el.currentTime = 0;
      if (activeNarrationId.current === id) {
        activeNarrationId.current = null;
        restoreAmbientAfterNarration();
      }
    }
  };

  const enableNarration = async () => {
    setNarrationEnabled(true);
    setShowNarrationChip(false);
    if (pendingNarrationId != null) {
      const id = pendingNarrationId;
      setPendingNarrationId(null);
      setTimeout(() => tryPlayNarration(id), 0);
    }
  };

  // ===== Trailer: paused until reader hits play; hard-stop video+audio on leave =====
  const trailerRef = useRef(null);
  const BEAST_COVER = "/covers/1-the-beautiful-beast-full-tagged.png";
  const [trailerShowCover, setTrailerShowCover] = useState(true);

  const stopTrailerHard = () => {
    const vid = trailerRef.current;
    if (!vid) return;
    try {
      vid.pause();
      vid.muted = true;
      vid.currentTime = 0;
    } catch {}
    setTrailerShowCover(true);
  };

  const playTrailer = async () => {
    const vid = trailerRef.current;
    if (!vid) return;
    try {
      vid.muted = false;
      vid.removeAttribute("muted");
      vid.volume = 1;
      await vid.play();
      setTrailerShowCover(false);
    } catch {
      // Browser may still require a control-bar tap; cover stays until play succeeds.
    }
  };

  useEffect(() => {
    const vid = trailerRef.current;
    if (!vid) return;

    vid.playsInline = true;
    vid.setAttribute("playsinline", "");
    vid.setAttribute("webkit-playsinline", "");
    // Stay paused with sound ready — no muted autoplay (silent motion confuses readers).
    vid.pause();
    vid.muted = false;
    vid.removeAttribute("muted");
    vid.volume = 1;
    try {
      vid.currentTime = 0;
    } catch {}
    setTrailerShowCover(true);

    const onPlay = () => setTrailerShowCover(false);
    const onPauseOrEnd = () => {
      try {
        if (vid.ended || vid.currentTime < 0.35) setTrailerShowCover(true);
      } catch {
        setTrailerShowCover(true);
      }
    };
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPauseOrEnd);
    vid.addEventListener("ended", onPauseOrEnd);

    const onRouteChange = () => stopTrailerHard();
    router.events.on("routeChangeStart", onRouteChange);
    router.events.on("routeChangeError", onRouteChange);

    const onPageHide = () => stopTrailerHard();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPauseOrEnd);
      vid.removeEventListener("ended", onPauseOrEnd);
      router.events.off("routeChangeStart", onRouteChange);
      router.events.off("routeChangeError", onRouteChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      stopTrailerHard();
    };
  }, [router.events]);

  // ===== Page data =====
  // Master spine palette (glow only). Titles only on Book 1 cover art — do not label 2–7 on the grid.
  const books = [
    { id: 1, title: "THE BEAUTIFUL BEAST", tagline: "The first strike in the storm.", img: "/covers/1-the-beautiful-beast-full-tagged.png", motion: "/covers/1-the-beautiful-beast-motion.mp4", whisper: "/audio/beast_whisper_01.mp3", color: "#F5E6C8", ribbon: "COMING SOON" },
    { id: 2, title: "BOOK TWO", tagline: "A shadow doesn’t vanish — it just learns to wait.", img: "/covers/book-02.jpg", whisper: "/audio/ghost_whisper_01.mp3", color: "#E5C877", ribbon: "IN THE WORKS" },
    { id: 3, title: "BOOK THREE", tagline: "The sting of lightning before the clap of thunder.", img: "/covers/book-03.jpg", whisper: "/audio/storm_whisper_01.mp3", color: "#CE9D3B", ribbon: "SIMMERING" },
    { id: 4, title: "BOOK FOUR", tagline: "What doesn’t shatter learns how to cut.", img: "/covers/book-04.jpg", whisper: "/audio/fragile_whisper_01.mp3", color: "#C57A2A", ribbon: "WHEELS TURNING" },
    { id: 5, title: "BOOK FIVE", tagline: "When prayer is your only hope — don’t skip it!", img: "/covers/book-05.jpg", whisper: "/audio/machine_whisper_01.mp3", color: "#A0522D", ribbon: "BASKING IN TIME" },
    { id: 6, title: "BOOK SIX", tagline: "When no one’s secrets are safe — and the truth is unmerciful.", img: "/covers/book-06.jpg", whisper: "/audio/scarred_whisper_01.mp3", color: "#993300", ribbon: "HOLDING TIGHT" },
    { id: 7, title: "BOOK SEVEN", tagline: "Before the ashes settle — no one is safe.", img: "/covers/book-07.jpg", whisper: "/audio/scorched_whisper_01.mp3", color: "#8B0000", ribbon: "THE BEST TO COME" },
  ];
  return (
    <div className="bg-black text-gray-100">
      <Head>
        <title>Books | Silver Spine Studio™</title>
        <meta name="description" content="The Silver Spine Studio™ Series — The seven-fold chronicle. Stories forged in storm and consequence." />
        <style>{`
          :root { --header-h: 140px; --footer-h: 72px; }
          .page-frame { min-height: calc(100vh - var(--header-h) - var(--footer-h)); display: flex; flex-direction: column; }
          .nebula { position: relative; width: 100%; background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg'); background-size: cover; background-position: center; filter: saturate(1.15) contrast(1.1); }
          .nebula-top { height: 48px; }
          .nebula-bottom { height: 100px; margin-top: -16px; }
          .mask-top { -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); }
          .mask-bottom { -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); }
          .letterbox-bar { position:absolute; left:0; right:0; height:12px; background: rgba(0,0,0,0.95); }
          .letterbox-bar.top-edge { bottom:0; }
          .letterbox-bar.bottom-edge { top:0; }
          .hero-spacer { height: 8px; }
          .heading { text-align:center; color:${GOLD}; font-size:2.8rem; font-weight:800; line-height:1.2; margin-top: 0.06rem; letter-spacing:.02em; text-shadow:0 2px 12px rgba(0,0,0,.6); }
          .subheading { text-align:center; color:#f3e2b8; font-size:1.02rem; font-style:italic; margin:.12rem 0 .6rem; }
          /* Single row, Book 1 → Book 7 in order */
          .book-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.15rem; justify-items: center; align-items: start; max-width: 92%; margin: 0.45rem auto 1.1rem; padding: 0.15rem 0.75rem 0.5rem; }
          @media (max-width: 1600px) { .book-grid { grid-template-columns: repeat(7, 1fr); gap: 0.85rem; } }
          @media (max-width: 1100px) { .book-grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }
          @media (max-width: 768px) { .heading { font-size: 2.05rem; } .nebula-top { height: 40px; } .nebula-bottom { height: 84px; margin-top: -12px; } .book-grid { grid-template-columns: repeat(2, 1fr); max-width: 96%; gap: 0.85rem; } }
          @media (max-width: 480px) { .book-grid { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; } }
          .book-card { position: relative; border-radius: 0.85rem; overflow: hidden; aspect-ratio: 2 / 3; width: 100%; max-width: 210px; background: rgba(12,12,12,0.55); border: 1px solid #7e7e70; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; cursor: pointer; }
          .book-card:hover, .book-card.selected { transform: translateY(-2px) scale(1.012); box-shadow: 0 0 36px var(--glow), 0 0 60px var(--glow); border-color: var(--glow); }
          @media (max-width: 768px) { .book-card { max-width: 170px; } }
          @media (min-width: 1400px) { .book-card { max-width: 230px; } }
          .book-card img, .book-card video { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.15) saturate(1.15) brightness(1.05); pointer-events: none; }
          .ribbon { position:absolute; top:50%; left:50%; width:250%; height:58%; transform:translate(-50%,-50%) rotate(-45deg); background:#000; display:flex; align-items:center; justify-content:center; z-index:6; }
          .ribbon-text { color:#fff; font:700 1rem/1 'Libre Baskerville', Georgia, serif; letter-spacing:.22em; text-transform:uppercase; opacity:.95; }
          .book-title { position:absolute; top:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 2rem/1.16 'Libre Baskerville', Georgia, serif; color:var(--glow); text-shadow:0 0 18px rgba(0,0,0,.6); z-index:4; }
          .author-name { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 1.2rem/1.2 'Libre Baskerville', Georgia, serif; color:var(--glow); letter-spacing:.18em; z-index:4; }
          .tagline { margin-top:.4rem; min-height: 2.4em; text-align:center; color: #f5f5f5; font-style:italic; font-size:0.85rem; line-height:1.3; opacity:0; transition:opacity .35s ease-in-out; }
          .book-card:hover + .tagline, .tagline.visible { opacity:1; }
          .chip { display:inline-flex; align-items:center; gap:.5rem; background: rgba(0,0,0,0.75); border: 1px solid rgba(167,122,35,0.45); border-radius: 999px; padding: 6px 12px; color: ${GOLD}; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
          .chip:hover { background: rgba(0,0,0,0.9); }
          .featured-wrap {
            max-width: 1320px;
            margin: 0.35rem auto 0.25rem;
            padding: 0 1rem;
            scroll-margin-top: calc(var(--header-h) + 16px);
          }
          .featured-panel {
            align-items: center;
          }
          .featured-copy h3 {
            font-size: clamp(1.75rem, 2.6vw, 2.35rem) !important;
          }
          .featured-copy #featured-blurb-text {
            font-size: 1.08rem;
            line-height: 1.65;
          }
          .books-storm-panel {
            border: 1px solid rgba(167,122,35,0.35);
            background: rgba(0,0,0,0.55);
            border-radius: 1rem;
            padding: 1.35rem 1.25rem 1.45rem;
            height: 100%;
            min-height: 320px;
          }
          .books-storm-panel h3 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.02em;
            margin: 0 0 0.55rem;
          }
          .books-storm-panel p {
            font-size: 1rem !important;
            line-height: 1.55 !important;
          }
          .shop-hub-link {
            display: inline-flex;
            width: auto;
            max-width: 100%;
            align-self: flex-start;
            padding: 0.65rem 1.1rem;
            font-size: 0.95rem;
          }
          @media (max-width: 1023px) {
            .featured-panel {
              align-items: stretch;
              gap: 1.1rem;
              padding: 1rem !important;
            }
            /* Mobile stack: copy → trailer → stay in the storm */
            .featured-copy { order: 1; }
            .trailer-slot { order: 2; }
            .storm-slot { order: 3; }
            .shop-hub-link { width: 100%; justify-content: center; }
          }
          .trailer-frame {
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
            scroll-margin-top: calc(var(--header-h) + 28px);
          }
          @media (max-width: 1023px) {
            .trailer-frame { max-width: 340px; }
          }
          /* Larger player left; storm right; center keeps 2-col store tabs */
          @media (min-width: 1024px) {
            .trailer-frame { max-width: 420px; margin-left: 0; margin-right: auto; }
            .trailer-slot { justify-content: flex-start; }
            .storm-slot { justify-content: stretch; }
            .books-storm-panel { width: 100%; }
          }
          .timeline { max-width: 1080px; margin: .35rem auto 1.05rem; padding: .6rem .9rem; border: 1px solid rgba(167,122,35,0.35); border-radius: 12px; background: rgba(0,0,0,0.45); }
          .timeline h4 { margin: 0 0 .3rem; font: 700 1rem/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: ${GOLD}; letter-spacing:.04em; text-transform: uppercase; }
          .timeline-list { display:grid; grid-template-columns: 1fr 2.2fr; gap: .35rem .9rem; align-items: start; }
          .timeline dt { color:#d9d1bd; font-weight:600; }
          .timeline dd { color:#eee7d6; margin:0; }
          @media (max-width: 640px) { .timeline-list { grid-template-columns: 1fr; } }
          /* Keep trailer chrome in the control bar — no mid-frame overlays */
          /* Pin framing to the top so faces/titles aren’t cut mid-frame */
          .trailer-player {
            background: #0a0a0a;
            object-fit: cover;
            object-position: center top;
          }
          .trailer-player::-webkit-media-controls-panel { display: flex !important; }
          .trailer-play-icon {
            filter: drop-shadow(0 4px 18px rgba(0,0,0,0.65));
            transition: transform 0.2s ease;
          }
          .trailer-play-btn:hover .trailer-play-icon { transform: scale(1.06); }
          .trailer-play-btn:focus-visible {
            outline: 2px solid #a77a23;
            outline-offset: -4px;
          }
        `}</style>
      </Head>

      <header ref={headerRef} className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30">
        <div className="max-w-6xl mx-auto flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between px-4 md:px-6 py-3 md:py-4 min-w-0">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group shrink-0" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <span className="sss-logo-halo">
                <img src={logoSrc} alt="Silver Spine Studio logo" className="sss-logo-glow h-[72px] md:h-[100px] lg:h-[112px] w-auto select-none" draggable="false" />
              </span>
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
          </Link>
          <SiteNav className="w-full sm:w-auto justify-center sm:justify-end" />
        </div>
        <LaunchMilestoneCountdown />
      </header>

      <StormAtmosphere mood="highway" />

      <div className="page-frame relative z-10">
        <div className="nebula nebula-top mask-top relative z-10">
          <div className="letterbox-bar top-edge" />
        </div>

        {showNarrationChip && !narrationEnabled && (
          <div className="relative z-20 flex items-center justify-center gap-3 mb-2">
            <button className="chip" onClick={enableNarration} title="Enable narration (one-time)">
              🎧 Click once to enable narration
            </button>
          </div>
        )}

        <main className="flex-1 relative z-20 pb-8">
          <h1 className="heading" style={{ color: SILVER }}>
            The Silver Spine Studio<span className="align-super text-base">™</span> Series: The seven-fold chronicle.
          </h1>
          <h2 className="subheading">
            Click a book to reveal its brief below. Narration plays on hover (one-time enable may be required).
          </h2>

          <section id="featured-book" aria-label="Featured Book: The Beautiful Beast" className="featured-wrap">
            <div className="featured-panel grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 bg-black/40 p-5 md:p-6 rounded-2xl border border-white/5 shadow-2xl">

              {/* LEFT — larger trailer */}
              <div className="trailer-slot lg:col-span-4 flex justify-center lg:justify-start items-center">
                <div className="trailer-frame w-full aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-950 relative z-30">
                  {/* Real cover + play cue until playback starts */}
                  {trailerShowCover ? (
                    <>
                      <img
                        src={BEAST_COVER}
                        alt="The Beautiful Beast cover"
                        className="absolute inset-0 z-[41] w-full h-full object-cover object-top pointer-events-none"
                        draggable="false"
                      />
                      <button
                        type="button"
                        onClick={playTrailer}
                        className="trailer-play-btn absolute inset-0 z-[42] flex flex-col items-center justify-center gap-3 bg-black/35 hover:bg-black/45 transition-colors"
                        aria-label="Play The Beautiful Beast trailer"
                      >
                        <span className="trailer-play-icon" aria-hidden="true">
                          <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
                            <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.55)" stroke="#a77a23" strokeWidth="2.5" />
                            <path d="M26 20 L46 32 L26 44 Z" fill="#f5f0e4" />
                          </svg>
                        </span>
                        <span className="text-[#f5f0e4] text-sm font-bold uppercase tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          Play trailer
                        </span>
                      </button>
                    </>
                  ) : null}
                  <video
                    ref={trailerRef}
                    className="trailer-player w-full h-full absolute inset-0 z-40"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                    poster={BEAST_COVER}
                    controls
                    controlsList="nodownload"
                    playsInline
                    preload="metadata"
                    aria-label="The Beautiful Beast trailer"
                  >
                    <source src="/videos/00_OFFICIAL_SNEAK_PEEK_TRAILER_1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* CENTER — book info + two-column store doors */}
              <div className="featured-copy lg:col-span-5 flex flex-col justify-center space-y-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white text-left" style={{ textShadow: "0 0 10px rgba(201,206,214,0.22), 0 2px 10px rgba(0,0,0,0.82)" }}>
                    The Beautiful Beast
                  </h3>
                  <p className="text-[#a77a23] text-xs md:text-sm font-bold uppercase tracking-widest mt-1 mb-3">
                    Crime Thriller • Psychological • Rural Noir
                  </p>
                  <p id="featured-blurb-text" className="text-sm md:text-base text-gray-300 leading-relaxed text-left" style={{ textShadow: "0 0 8px rgba(201,206,214,0.10), 0 2px 8px rgba(0,0,0,0.75)" }}>
                    A year after a Thanksgiving-night crash on Colorado’s Million-Dollar Highway—and the cover-up that followed—the first debt comes due. When new headlights carve through the canyon, old secrets scrape to the surface—and someone is shaping grief into a weapon.
                  </p>
                </div>

                <div className="bg-[#a77a23]/10 border border-[#a77a23]/20 p-3.5 rounded-xl space-y-2.5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    The{" "}
                    <span className="text-white font-semibold">Extended Sneak Peek</span> (Prologue &amp; Chapters 1–2) is{" "}
                    <span className="text-[#a77a23] font-bold">$4.99</span> — and places you on the{" "}
                    <span className="text-[#a77a23] font-bold">Insider Deal</span> whitelist.
                  </p>
                  <p className="text-sm text-amber-100/95 leading-relaxed border border-amber-500/35 bg-amber-950/25 rounded-lg px-3 py-2">
                    {PREORDER_STATUS.headline}. Sneak peek available now.
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Full DIGITAL copy: <span className="text-[#a77a23] font-bold">{NOVEL_PRICING.insider}</span>{" "}
                    <span className="text-white font-semibold">
                      {NOVEL_PRICING.digitalPreorderStartLabel} – {NOVEL_PRICING.digitalPreorderEndLabel}
                    </span>
                    {" "}(Insider whitelist). Hardcover orders from{" "}
                    <span className="text-white font-bold">{NOVEL_PRICING.hardcoverOrderFromLabel}</span>. Digital retail{" "}
                    <span className="text-white font-bold">{NOVEL_PRICING.retail}</span> from {NOVEL_PRICING.releaseLabel}.
                  </p>
                  <p className="text-xs text-gray-400 leading-normal">
                    Personal license only — files may not be shared, uploaded, or resold.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <StoreHub variant="compact" liveOnly />
                  <Link
                    href="/shop"
                    className="shop-hub-link font-semibold tracking-wide text-[#a77a23] border border-[#a77a23]/45 hover:bg-[#a77a23]/10 transition-all duration-200 rounded-lg"
                  >
                    Where to BUY →
                  </Link>
                </div>
              </div>

              {/* RIGHT — Stay in the storm, pushed outward */}
              <div className="storm-slot lg:col-span-3 flex items-center">
                <div className="books-storm-panel w-full" aria-label="Join the launch list">
                  <h3>Stay in the storm</h3>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Launch list for sneak peek news, Sep 30 full DIGITAL preorder, hardcover alerts for Nov 1 — and a chance for 3 lucky sleuths to win a free FULL digital copy.
                  </p>
                  <LaunchListForm />
                </div>
              </div>

            </div>
          </section>

          <section className="book-grid" aria-label="Seven-fold chronicle books">
            {books.map((b) => {
              const selected = selectedBookId === b.id;
              return (
                <div key={b.id} style={{ textAlign: "center", "--glow": b.color }}>
                  <div
                    className={`book-card${selected ? " selected" : ""}`}
                    style={{ "--glow": b.color }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={b.id === 1 ? `${b.title}. ${b.tagline}` : `Book ${b.id}. ${b.ribbon}. ${b.tagline}`}
                    onClick={() => setSelectedBookId((prev) => (prev === b.id ? null : b.id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedBookId((prev) => (prev === b.id ? null : b.id));
                      }
                    }}
                    onMouseEnter={() => tryPlayNarration(b.id)}
                    onMouseLeave={() => stopNarration(b.id)}
                  >
                    {b.motion ? (
                      <video
                        src={b.motion}
                        poster={b.img}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={b.id === 1 ? `${b.title} live cover` : `Book ${b.id} cover`}
                      />
                    ) : (
                      <img src={b.img} alt={b.id === 1 ? b.title : `Book ${b.id} — ${b.ribbon}`} />
                    )}
                    {b.id !== 1 && (
                      <div className="ribbon">
                        <span className="ribbon-text">{b.ribbon}</span>
                      </div>
                    )}
                    {/* Titles stay off Books 2–7 — only Book 1 shows its titled cover art */}
                    <audio ref={(el) => (audioRefs.current[b.id] = el)} src={b.whisper} preload="auto" />
                  </div>
                  <p className={`tagline${selected ? " visible" : ""}`}>{b.tagline}</p>
                </div>
              );
            })}
          </section>
        </main>
        <div className="nebula nebula-bottom mask-bottom relative z-10">
          <div className="letterbox-bar bottom-edge" />
        </div>
      </div>
    </div>
  );
}


