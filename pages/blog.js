// /pages/blog.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LaunchListForm from "@/components/LaunchListForm";
import ArcRequestForm from "@/components/ArcRequestForm";
import BlogFigures from "@/components/BlogFigures";
import SiteNav from "@/components/SiteNav";
import StormAtmosphere from "@/components/StormAtmosphere";
import { bindChromeVars } from "@/lib/chromeVars";
import { readPreferredLang } from "@/lib/i18n";

/**
 * One distinct hero per blog card (no repeats across the feed).
 * Stills OR mp4 — drop files in /public/blog/ then point src here.
 * Note: storm-cover-art.jpg ≈ beautiful-beast-cover.jpg — do not use both.
 * quote-storm-waiting.jpg puts the logo over the figure — avoid as a hero.
 */
const BLOG_IMG = {
  cover: {
    src: "/blog/beautiful-beast-cover.jpg",
    alt: "The Beautiful Beast cover art",
    caption: "The Beautiful Beast — Book One of the Seven-Fold Chronicle.",
  },
  arcQuote: {
    src: "/blog/quote-arc-week.jpg",
    alt: "ARC week announcement on a snow mountain road",
    caption: "ARC week is open — full novel November 1, 2026.",
  },
  cliffside: {
    src: "/blog/cliffside-snow.jpg",
    alt: "Lone figure on a snowy cliff overlooking a mountain valley",
    caption: "Cliffside — where the storm begins.",
  },
  highway: {
    src: "/blog/highway-night-banner.jpg",
    alt: "Cinematic night highway through a Colorado canyon",
    caption: "Colorado highway night — the chronicle’s road.",
  },
  // Extras only inside “View timeline / View notes”
  snowRoad: {
    src: "/blog/snow-mountain-road.jpg",
    alt: "Wet mountain highway at night with taillights in the snow",
    caption: "Million-Dollar Highway atmosphere — wet asphalt, snow, and debt.",
  },
};

export default function Blog() {

  // ---- brand / assets ----
  const GOLD = "#a77a23";
 const DISC_LOGO = "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png";
 const BIG_LOGO = "/Final_Silver_Spine_Square_Logo_With_Words_Transparant.png";
 const NEBULA = "/FB_Cover_Nebula_DarkerShadows_Fix_1640x624.jpg";
  // Realistic snow-mountain cliffside (from studio art) — blends from Welcome toward the blog
  const STORM_ROAD = "/blog/snow-mountain-road.jpg";
  const CLIFFSIDE = "/blog/cliffside-snow.jpg";
  const SILVER_STORM = "/storm-lightning.mp4";
 const REQUEST_EMAIL = "contact@silverspinestudio.com";

  const [studioPosts, setStudioPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog/posts");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.posts)) {
          setStudioPosts(data.posts);
        }
      } catch {
        /* keep pinned cards only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- header + footer heights (keep icons always on-screen) ----
  const headerRef = useRef(null);
  const silverStormRef = useRef(null);

  // Scope aggressive layout locks to this page only (never leak to Home/etc.)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("sss-blog-lock");
    return () => {
      root.classList.remove("sss-blog-lock");
      root.style.removeProperty("--header-h");
      root.style.removeProperty("--footer-h");
    };
  }, []);

  useEffect(() => bindChromeVars(headerRef.current), []);

  // ---- silver lightning (visual only) ----
  useEffect(() => {
    const vid = silverStormRef.current;
    if (!vid || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      vid.removeAttribute("autoplay");
      vid.pause();
      return;
    }
    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;
    vid.loop = true;
    vid.playbackRate = 0.28;
    const play = () => {
      vid.play().catch(() => {});
    };
    play();
    vid.addEventListener("loadeddata", play);
    return () => {
      vid.removeEventListener("loadeddata", play);
      vid.pause();
    };
  }, []);

  // ---- local UI ----
  const [showPlan, setShowPlan] = useState(false);
  const [showBrandNotes, setShowBrandNotes] = useState(false);
  const [showArc, setShowArc] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showPress, setShowPress] = useState(false);
  const [pressName, setPressName] = useState("");
  const [pressOutlet, setPressOutlet] = useState("");
  const [pressEmail, setPressEmail] = useState("");
  const [pressNeeds, setPressNeeds] = useState("Interview, logo usage, and cover art");
  const [pressDeadline, setPressDeadline] = useState("");
  const [pressAgree, setPressAgree] = useState(false);
  const [pressStatus, setPressStatus] = useState({ state: "idle", msg: "" });
  const [pressStartedAt] = useState(() => Date.now());
  const [pressHp, setPressHp] = useState("");

  // Twin clocks — Colorado mountain time + visitor's local time
  const [clockPair, setClockPair] = useState({ mountain: "", local: "" });
  useEffect(() => {
    const fmt = (timeZone) => {
      const opts = {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      if (timeZone) opts.timeZone = timeZone;
      return new Intl.DateTimeFormat("en-US", opts).format(new Date());
    };
    const tick = () => {
      try {
        setClockPair({
          mountain: fmt("America/Denver"),
          local: fmt(undefined),
        });
      } catch {
        setClockPair({ mountain: "", local: "" });
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const submitPress = async (e) => {
    e.preventDefault();
    if (!pressAgree) return;
    setPressStatus({ state: "sending", msg: "" });
    try {
      const response = await fetch("/api/contact-safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "media",
          name: pressName,
          email: pressEmail,
          outlet: pressOutlet,
          deadline: pressDeadline,
          message: [
            "Press / media request from the Blog press kit form.",
            `Needs: ${pressNeeds || "Interview, logo usage, and cover art"}`,
            "Agreed to confidential materials terms on the site form.",
          ].join("\n"),
          language: readPreferredLang(),
          hp: pressHp,
          startedAt: pressStartedAt,
        }),
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        setPressStatus({
          state: "success",
          msg: data.message || "Thanks — your press request was sent.",
        });
        setPressName("");
        setPressOutlet("");
        setPressEmail("");
        setPressNeeds("Interview, logo usage, and cover art");
        setPressDeadline("");
        setPressAgree(false);
        window.setTimeout(() => {
          setShowPress(false);
          setPressStatus({ state: "idle", msg: "" });
        }, 2200);
      } else {
        setPressStatus({
          state: "error",
          msg: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setPressStatus({
        state: "error",
        msg: "Network error. Please check your connection.",
      });
    }
  };

  return (
    <div className="blog-page bg-black text-gray-100 min-h-screen flex flex-col relative z-10">
      {/* Soft storm around the room — cliffside panel still owns the main visual */}
      <StormAtmosphere mood="ridge" />
      <Head>
        <title>Blog | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Thoughts, inspirations, and behind-the-scenes insights from Silver Spine Studio."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style>{`
          :root {
            --header-h: 140px; /* JS updates */
            --footer-h: 72px;
            --gold: ${GOLD};
          }

          html, body { margin: 0; background:#000; min-height: 100%; }
          #__next { height:auto; overflow:visible; }

          /*
            Blog chrome (ONLY while html.sss-blog-lock is on):
            header + footer always visible; blog column scrolls.
          */
          @media (min-width: 768px) {
            html.sss-blog-lock,
            html.sss-blog-lock body,
            html.sss-blog-lock #__next {
              height: 100%;
              overflow: hidden;
            }
            html.sss-blog-lock #__next > div.bg-black {
              height: 100dvh;
              max-height: 100dvh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            html.sss-blog-lock #__next > div.bg-black > main {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            html.sss-blog-lock .blog-page {
              flex: 1 1 auto;
              min-height: 0;
              height: auto;
              max-height: none;
              overflow: hidden;
            }
            html.sss-blog-lock .blog-page .page-frame {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
            }
            html.sss-blog-lock #site-footer {
              flex-shrink: 0;
              position: relative;
              z-index: 40;
            }
          }

          /* Slim footer on Blog only */
          html.sss-blog-lock #site-footer {
            padding-top: 0.35rem !important;
            padding-bottom: 0.35rem !important;
          }
          html.sss-blog-lock #site-footer .max-w-6xl {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          html.sss-blog-lock #site-footer .max-w-6xl > div:first-child {
            gap: 0.35rem !important;
          }
          html.sss-blog-lock #site-footer a[aria-label] {
            width: 1.85rem !important;
            height: 1.85rem !important;
          }
          html.sss-blog-lock #site-footer a[aria-label] svg {
            width: 0.85rem !important;
            height: 0.85rem !important;
          }
          html.sss-blog-lock #site-footer p,
          html.sss-blog-lock #site-footer nav {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          html.sss-blog-lock #site-footer nav {
            margin-top: 0.25rem !important;
          }

          .nav-wrap { max-width: 1400px; }
          .nav-link { color: #e5e7eb; }
          .nav-link:hover { color: ${GOLD}; }
          .nav-active { color: #ef4444; font-weight: 600; }

          /* MAIN */
          .page-frame {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            overflow: visible !important;
          }
          .page-frame > *:last-child { margin-bottom: 0 !important; }

          /* Cinematic mountain road — clearly visible, fades into the blog */
          .blog-atmosphere {
            pointer-events: none;
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
          }
          .blog-atmosphere-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            /* Snow cliffside road — cool night grade for realism */
            object-position: 58% 45%;
            filter: saturate(0.92) contrast(1.08) brightness(0.98) hue-rotate(8deg);
            opacity: 1;
            animation: storm-drift 48s ease-in-out infinite alternate;
            will-change: transform;
            -webkit-mask-image: linear-gradient(
              to left,
              #000 0%,
              #000 52%,
              rgba(0,0,0,0.6) 74%,
              rgba(0,0,0,0.18) 90%,
              transparent 100%
            );
                    mask-image: linear-gradient(
              to left,
              #000 0%,
              #000 52%,
              rgba(0,0,0,0.6) 74%,
              rgba(0,0,0,0.18) 90%,
              transparent 100%
            );
          }
          .blog-atmosphere-veil {
            position: absolute;
            inset: 0;
            z-index: 2;
            background:
              radial-gradient(ellipse at 74% 32%, rgba(145, 180, 225, 0.16) 0%, transparent 52%),
              linear-gradient(to right, #000 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.12) 60%, transparent 100%),
              linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 35%, transparent 80%, rgba(0,0,0,0.3) 100%);
          }
          /* Living lightning — mountain / Welcome side; light night-sky blue (no green) */
          .blog-silver-storm {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 48%;
            z-index: 1;
            width: auto;
            height: 100%;
            object-fit: cover;
            object-position: 62% 42%;
            pointer-events: none;
            mix-blend-mode: screen;
            opacity: 0.82;
            /* Push storm glow from green/yellow → cool night-sky blue-silver */
            filter:
              grayscale(0.15)
              sepia(0.55)
              hue-rotate(175deg)
              saturate(1.65)
              brightness(1.28)
              contrast(1.22)
              drop-shadow(0 0 14px rgba(160, 195, 235, 0.45));
            -webkit-mask-image: linear-gradient(
              to left,
              #000 0%,
              #000 55%,
              rgba(0,0,0,0.45) 82%,
              transparent 100%
            );
                    mask-image: linear-gradient(
              to left,
              #000 0%,
              #000 55%,
              rgba(0,0,0,0.45) 82%,
              transparent 100%
            );
          }
          @keyframes storm-drift {
            from { transform: scale(1.03) translate3d(0, 0, 0); }
            to   { transform: scale(1.08) translate3d(-1.2%, 1%, 0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .blog-atmosphere-img { animation: none; }
            .blog-silver-storm { display: none; }
          }
          @media (max-width: 767px) {
            .blog-atmosphere-img {
              object-position: 45% 55%;
              opacity: 1;
              -webkit-mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 48%,
                rgba(0,0,0,0.55) 72%,
                transparent 100%
              );
                      mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 48%,
                rgba(0,0,0,0.55) 72%,
                transparent 100%
              );
            }
            .blog-atmosphere-veil {
              background:
                radial-gradient(ellipse at 50% 22%, rgba(145, 180, 225, 0.14) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.65) 82%, #000 100%);
            }
            .blog-silver-storm {
              left: 0;
              right: 0;
              top: 0;
              bottom: 42%;
              height: auto;
              opacity: 0.78;
              object-position: 55% 30%;
              -webkit-mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 55%,
                rgba(0,0,0,0.35) 82%,
                transparent 100%
              );
                      mask-image: linear-gradient(
                to bottom,
                #000 0%,
                #000 55%,
                rgba(0,0,0,0.35) 82%,
                transparent 100%
              );
            }
          }

          /* Clear mountain window inside Welcome — can't miss it */
          .blog-mountain-window {
            position: relative;
            width: 100%;
            height: clamp(140px, 28vh, 220px);
            margin: -0.35rem -0.35rem 0.85rem;
            border-radius: 0.85rem;
            overflow: hidden;
            border: 1px solid rgba(167,122,35,0.35);
            box-shadow: 0 12px 28px rgba(0,0,0,0.45);
          }
          .blog-mountain-window img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 50% 42%;
            display: block;
            filter: saturate(0.95) contrast(1.08) brightness(0.96);
          }
          .blog-mountain-window::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              transparent 35%,
              rgba(0,0,0,0.35) 70%,
              rgba(0,0,0,0.82) 100%
            );
            pointer-events: none;
          }
          .blog-mountain-caption {
            position: absolute;
            left: 0.75rem;
            right: 0.75rem;
            bottom: 0.55rem;
            z-index: 1;
            font-size: 0.68rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(245, 237, 215, 0.9);
            text-shadow: 0 1px 8px rgba(0,0,0,0.85);
          }
          /* Soft snow drift for “you’re in it” without clutter */
          .blog-snow {
            pointer-events: none;
            position: absolute;
            inset: 0;
            z-index: 3;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to left, #000 0%, #000 50%, transparent 92%);
                    mask-image: linear-gradient(to left, #000 0%, #000 50%, transparent 92%);
          }
          .blog-snow span {
            position: absolute;
            top: -8%;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(235, 242, 255, 0.95);
            box-shadow:
              0 0 5px rgba(200, 220, 245, 0.85),
              0 0 10px rgba(170, 200, 240, 0.45);
            animation: blog-snow-fall linear infinite;
            opacity: 0.85;
          }
          .blog-snow span:nth-child(1) { left: 56%; animation-duration: 8.5s; animation-delay: 0s; }
          .blog-snow span:nth-child(2) { left: 64%; width: 4px; height: 4px; animation-duration: 10.5s; animation-delay: -2s; }
          .blog-snow span:nth-child(3) { left: 72%; animation-duration: 7.5s; animation-delay: -4s; }
          .blog-snow span:nth-child(4) { left: 80%; width: 4px; height: 4px; animation-duration: 11.5s; animation-delay: -1s; }
          .blog-snow span:nth-child(5) { left: 88%; width: 5px; height: 5px; animation-duration: 9.5s; animation-delay: -6s; }
          .blog-snow span:nth-child(6) { left: 60%; animation-duration: 12s; animation-delay: -3s; }
          .blog-snow span:nth-child(7) { left: 76%; width: 4px; height: 4px; animation-duration: 9s; animation-delay: -5s; }
          .blog-snow span:nth-child(8) { left: 84%; animation-duration: 13s; animation-delay: -7s; }
          .blog-snow span:nth-child(9) { left: 68%; width: 3px; height: 3px; animation-duration: 8s; animation-delay: -1.5s; }
          .blog-snow span:nth-child(10) { left: 92%; width: 4px; height: 4px; animation-duration: 10s; animation-delay: -4.5s; }
          .blog-snow span:nth-child(11) { left: 70%; animation-duration: 11s; animation-delay: -2.5s; }
          .blog-snow span:nth-child(12) { left: 86%; width: 3px; height: 3px; animation-duration: 9s; animation-delay: -6.5s; }
          @keyframes blog-snow-fall {
            0%   { transform: translate3d(0, -10%, 0); opacity: 0; }
            10%  { opacity: 0.95; }
            100% { transform: translate3d(-18px, 110vh, 0); opacity: 0.2; }
          }
          @media (prefers-reduced-motion: reduce) {
            .blog-snow { display: none; }
          }

          /* Desktop: Welcome stays put; only the blog column scrolls */
          .blog-split {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            align-items: start;
          }
          .blog-feed {
            min-width: 0;
          }
          .blog-welcome-pane {
            min-width: 0;
          }
          @media (min-width: 768px) {
            .blog-split {
              grid-template-columns: 1fr 1fr;
              gap: 1.75rem;
              flex: 1 1 auto;
              min-height: 0;
              height: 100%;
              max-height: 100%;
              overflow: hidden;
            }
            .blog-feed {
              height: 100%;
              overflow-x: hidden;
              overflow-y: scroll; /* keep scrollbar track visible for traditional users */
              padding-right: 0.2rem;
              overscroll-behavior: contain;
              -webkit-overflow-scrolling: touch;
              scrollbar-gutter: stable;
              scrollbar-width: thin; /* Firefox */
              scrollbar-color: rgba(167,122,35,0.75) rgba(255,255,255,0.06);
            }
            /* Chromium / Safari — visible gold scrollbar on the blog window */
            .blog-feed::-webkit-scrollbar {
              width: 10px;
            }
            .blog-feed::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.06);
              border-radius: 999px;
              margin: 6px 0;
            }
            .blog-feed::-webkit-scrollbar-thumb {
              background: linear-gradient(
                to bottom,
                rgba(167,122,35,0.55),
                rgba(167,122,35,0.9)
              );
              border-radius: 999px;
              border: 2px solid rgba(0,0,0,0.35);
            }
            .blog-feed::-webkit-scrollbar-thumb:hover {
              background: rgba(196,150,60,0.95);
            }
            .blog-welcome-pane {
              height: 100%;
              overflow: hidden;
              position: sticky;
              top: 0;
              align-self: stretch;
            }
            .blog-welcome-pane .blog-welcome-card {
              height: 100%;
              display: flex;
              flex-direction: column;
              min-height: 0;
            }
            .blog-welcome-pane .blog-welcome-inner {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .blog-welcome-pane .blog-welcome-copy {
              flex: 1 1 auto;
              min-height: 0;
              /* Welcome stays pinned; only scrolls inside if the screen is too short */
              overflow-x: hidden;
              overflow-y: auto;
              overscroll-behavior: contain;
              padding-right: 0.25rem;
            }
          }

          /* Phone: footer docked on Blog only */
          @media (max-width: 767px) {
            html.sss-blog-lock #site-footer {
              position: fixed;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 40;
              box-shadow: 0 -8px 24px rgba(0,0,0,0.45);
            }
            html.sss-blog-lock .blog-page {
              padding-bottom: calc(var(--footer-h) + 8px);
            }
          }

          /* Nebula ribbons (unchanged) */
          .nebula {
            width: 100%;
            background-image: url('${NEBULA}');
            background-size: cover;
            background-position: center;
            filter: saturate(1.06) contrast(1.05);
          }
          .nebula-top,
          .nebula-bottom {
            height: 32px;
          }
          .nebula-top {
            -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 80%, transparent);
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 80%, transparent);
          }
          .nebula-bottom {
            position: relative;
            z-index: 0; /* keep it behind content above */
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 80%, transparent);
                    mask-image: linear-gradient(to top, rgba(0,0,0,1) 80%, transparent);
          }

          /* Thunder chip */
          .chip {
            display:inline-flex; align-items:center; gap:.5rem;
            background: rgba(0,0,0,0.85);
            border: 1px solid rgba(167,122,35,0.55);
            border-radius: 999px; padding: 9px 16px; color: ${GOLD};
            box-shadow: 0 6px 24px rgba(0,0,0,0.45);
            font-size: 0.9rem; line-height: 1; white-space: nowrap;
          }
          .chip:hover { background: rgba(0,0,0,0.92); }

          /* ========================================= */
          /* DISCLOSURE FIX (no more bottom clipping)  */
          /* ========================================= */
          .disclosure {
            overflow: hidden;                    /* clip only when closed */
            will-change: max-height, opacity;
          }
          .disclosure.open {
            overflow: visible;                   /* show full content when open */
          }

        `}</style>
      </Head>

      {/* ===== HEADER (GREY GRADIENT) ===== */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-gradient-to-b from-gray-950 to-gray-900 border-b border-[#a77a23]/30 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="nav-wrap mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="flex items-center gap-3 md:gap-4" aria-label="Silver Spine Studio — Home">
              <span className="sss-logo-halo">
                <Image
                  src={DISC_LOGO}
                  alt="Silver Spine Studio logo"
                  width={512}
                  height={512}
                  priority
                  className="sss-logo-glow w-auto select-none"
                  style={{
                    height: "72px",
                  }}
                  sizes="(min-width: 1024px) 512px, (min-width: 768px) 420px, 320px"
                />
              </span>
              <span
                className="hidden sm:inline text-xl md:text-2xl font-semibold tracking-wide"
                style={{
                  color: "#d1d5db",
                  textShadow:
                    "0 0 10px rgba(255,255,255,0.10), 0 0 22px rgba(255,255,255,0.08)",
                }}
              >
                Silver Spine Studio
                <span className="align-super text-sm md:text-base">™</span>
              </span>
            </Link>
          </div>

          <SiteNav className="w-full md:w-auto justify-center md:justify-end md:mr-28 lg:mr-36 tracking-wide" />
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="page-frame">
        <div className="blog-atmosphere" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="blog-atmosphere-img"
            src={STORM_ROAD}
            alt=""
            draggable="false"
          />
          <video
            ref={silverStormRef}
            className="blog-silver-storm"
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
          >
            <source src={SILVER_STORM} type="video/mp4" />
          </video>
          <div className="blog-snow" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
            <span /><span /><span /><span />
          </div>
          <div className="blog-atmosphere-veil" />
        </div>

        {/* Top ribbon */}
        <div className="nebula nebula-top relative z-[1]" aria-hidden="true" />

        <div className="relative z-[1] max-w-7xl mx-auto px-6 md:px-8 pt-4 md:pt-6 pb-4 md:pb-6 flex-1 min-h-0 w-full">
          <div className="blog-split">
            {/* LEFT: logo + blog cards (scrolls on desktop) */}
            <section className="blog-feed space-y-4 order-2 md:order-1">
              <div className="bg-black/85 rounded-2xl border border-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.6)] p-3 backdrop-blur-[2px]">
                <div className="bg-black/80 rounded-xl p-3">
                  <img
                    src={BIG_LOGO}
                    alt="Silver Spine Studio logo large"
                    draggable="false"
                    className="block w-full h-auto"
                    style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55))" }}
                  />
                </div>
              </div>

              {/* Newest → oldest. Oldest announcement always at the bottom. */}

              {/* Studio posts from Admin (newest first) */}
              {studioPosts.map((p) => {
                const when = p.createdAt ? new Date(p.createdAt) : null;
                const dateLabel =
                  when && !Number.isNaN(when.getTime())
                    ? when.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";
                const dateAttr = when && !Number.isNaN(when.getTime()) ? when.toISOString().slice(0, 10) : undefined;
                return (
                  <article
                    key={p.id}
                    className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span className="uppercase tracking-wide">Studio update</span>
                      {dateLabel ? <time dateTime={dateAttr}>{dateLabel}</time> : null}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                      {p.title}
                    </h3>
                    <p className="text-gray-300 mb-3 text-sm whitespace-pre-wrap">{p.body}</p>
                    {p.mediaType === "image" && p.mediaUrl ? (
                      <figure className="my-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.mediaUrl}
                          alt={p.mediaCaption || p.title}
                          className="w-full h-auto block"
                        />
                        {p.mediaCaption ? (
                          <figcaption className="text-center text-[11px] uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
                            {p.mediaCaption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : null}
                    {p.mediaType === "video" && p.mediaUrl ? (
                      <figure className="my-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <video
                          className="w-full h-auto block"
                          src={p.mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          aria-label={p.mediaCaption || p.title}
                        />
                        {p.mediaCaption ? (
                          <figcaption className="text-center text-[11px] uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
                            {p.mediaCaption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : null}
                    <p className="text-gray-400 text-xs mt-4 italic">Happy Sleuthing.</p>
                  </article>
                );
              })}

              {/* CARD 1 — today */}
              <article className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Announcement</span>
                  <time dateTime="2026-08-09">Aug 9, 2026</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  Website Inquiries Are Open — Plus Seven Spines in the Storm
                </h3>
                <p className="text-gray-300 mb-3 text-sm">
                  We’ve added a clear path for custom website builds.
                  If you want a site designed, use Contact and choose{" "}
                  <span className="text-white font-semibold">Website build inquiry</span>
                  {" "}— those messages arrive tagged{" "}
                  <span className="text-white font-semibold">[WEBSITE INQUIRY]</span> in the studio inbox.
                </p>
                <p className="text-gray-300 mb-3 text-sm">
                  Reach us at{" "}
                  <Link href="/contact?topic=sites" className="text-[#a77a23] font-semibold hover:underline">
                    silverspinestudio.com/contact?topic=sites
                  </Link>
                  {" "}or email{" "}
                  <a href={`mailto:${REQUEST_EMAIL}`} className="text-[#a77a23] font-semibold hover:underline">
                    {REQUEST_EMAIL}
                  </a>
                  . Book launch still comes first — projects are considered by inquiry, fit, and timing.
                </p>
                <figure className="my-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                  <video
                    className="w-full h-auto block"
                    src="/covers/seven-spines-noir-window.mp4"
                    poster="/covers/seven-spines-noir-window.png"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Seven spines in a rainy window — cream to deep fire red"
                  />
                  <figcaption className="text-center text-[11px] uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
                    Cream to deep fire red · seven spines in the storm
                  </figcaption>
                </figure>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link
                    href="/contact?topic=sites"
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                  >
                    Contact — website inquiries
                  </Link>
                  <Link
                    href="/books"
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Back to Books
                  </Link>
                </div>
                <p className="text-gray-400 text-xs mt-4 italic">Happy Sleuthing.</p>
              </article>

              {/* CARD 2 */}
              <article className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Announcement</span>
                  <time dateTime="2026-08-08">Aug 8, 2026</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  Silver Spine Studio™ Is Live — Come On In
                </h3>
                <p className="text-gray-300 mb-3 text-sm">
                  The site is in production. Rain, lightning, Books, Shop, Reviews, and the launch list are open —
                  the storm is no longer waiting behind a closed gate.
                </p>
                <ul className="text-gray-300 text-sm list-disc ml-5 mb-4">
                  <li>Cover reveal &amp; Extended Sneak Peek windows are underway</li>
                  <li>ARC applications are open for 25 early sleuths</li>
                  <li>3 lucky winners will each receive a FULL digital copy — join the launch list</li>
                </ul>
                <BlogFigures images={[BLOG_IMG.cover]} />
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowList(true)}
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                  >
                    Join the launch list
                  </button>
                  <Link
                    href="/shop"
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Visit the Shop
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowArc(true)}
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Request early-release ARC
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-4 italic">Happy Sleuthing.</p>
              </article>

              {/* CARD 3 */}
              <article className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Announcement</span>
                  <time dateTime="2026-07-28">Jul 28, 2026</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  The Beautiful Beast — Launch Timeline & What’s Next
                </h3>
                <p className="text-gray-300 mb-3 text-sm">
                  The road to release is mapped. Here’s the plan and how to get early access.
                </p>
                <ul className="text-gray-300 text-sm list-disc ml-5 mb-4">
                  <li>ARC sign-ups + selection window</li>
                  <li>Cover reveal + teaser trailer</li>
                  <li>Preorder live + launch week events</li>
                </ul>
                <BlogFigures images={[BLOG_IMG.arcQuote]} />
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowPlan(v => !v)}
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                    aria-expanded={showPlan}
                    aria-controls="launch-plan"
                  >
                    {showPlan ? "Hide timeline" : "View timeline"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowList(true)}
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                  >
                    Join the launch list
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowArc(true)}
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Request early-release ARC
                  </button>
                </div>

                <div
                  id="launch-plan"
                  className={`disclosure mt-3 ${showPlan ? "open" : ""}`}
                  style={{
                    maxHeight: showPlan ? 4000 : 0,
                    opacity: showPlan ? 1 : 0,
                    transition: "max-height 260ms ease, opacity 220ms ease"
                  }}
                >
                  <div className="rounded-lg border border-white/10 p-4 bg-black/40">
                    <BlogFigures images={[BLOG_IMG.snowRoad]} />
                    <h4 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>Milestones</h4>
                  <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-200">
   <li><span className="font-semibold text-[#a77a23]"> Cover Reveal</span> — Aug 3, 2026. The blank ribbon falls away. The premium artwork is officially unmasked.</li>
   <li><span className="font-semibold text-[#a77a23]"> Sneak Peek Release</span> — Aug 4, 2026. Digital Extended Sneak Peek (Prologue &amp; Chapters 1–2) for $4.99. This purchase places you on the Insider Deal whitelist.</li>
   <li><span className="font-semibold"> ARC Sign-ups</span> — Aug 7 – Aug 14, 2026. Advanced Review Copy applications open to select <span className="text-[#a77a23] font-semibold">25 sleuths</span> for early access. Selection emails go out Aug 17, 2026.</li>
   <li><span className="font-semibold"> Teaser Trailer 2 Drop</span> — Aug 21, 2026. Production loops push live.</li>
   <li><span className="font-semibold"> ARC Delivery Window</span> — Sep 21–23, 2026.</li>
   <li><span className="font-semibold"> Preorder Goes Live</span> — Sep 30, 2026. Early whitelisted buyers lock in the $14.99 Insider Deal through Oct 14, 2026 (save 40% vs regular $24.99).</li>
   <li><span className="font-semibold"> Launch Week Events</span> — Oct 21–28, 2026.</li>
   <li><span className="font-semibold"> Official Release Day</span> — Nov 1, 2026. Full retail becomes $24.99.</li>
 </ol>


                  <h4 className="text-lg font-semibold mt-5 mb-2" style={{ color: GOLD }}>A note for readers &amp; gift-givers</h4>
<ul className="list-disc ml-5 space-y-2 text-sm text-gray-200">
  <li><span className="font-semibold">Begin with the Sneak Peek:</span> $4.99 for Prologue &amp; Chapters 1–2 — and your place on the Insider whitelist.</li>
  <li><span className="font-semibold">Two paths to the full novel:</span> Preorder Sep 30 – Oct 14 at $14.99, or wait for official release Nov 1 at $24.99 with your Insider path as offered.</li>
<li><span className="font-semibold text-[#a77a23]">Holiday timing:</span> Nov 1 release lands just as gift season begins — a Colorado thriller ready for the nightstand, the stocking, or the reader who loves a storm.</li>

</ul>

                  </div>
                </div>
              </article>

              {/* CARD 4 */}
              <article className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Behind the Scenes</span>
                  <time dateTime="2026-07-16">Jul 16, 2026</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  Building the Silver Spine Look
                </h3>
                <p className="text-gray-300 mb-3 text-sm">Jet black, deep gold, stormlight. The system we’re shipping across the site.</p>
                <BlogFigures images={[BLOG_IMG.cliffside]} />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowBrandNotes(v => !v)}
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                    aria-expanded={showBrandNotes}
                    aria-controls="brand-notes"
                  >
                    {showBrandNotes ? "Hide notes" : "View notes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPress(true)}
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Request press kit
                  </button>
                </div>

                <div
                  id="brand-notes"
                  className={`disclosure mt-3 ${showBrandNotes ? "open" : ""}`}
                  style={{
                    maxHeight: showBrandNotes ? 2400 : 0,
                    opacity: showBrandNotes ? 1 : 0,
                    transition: "max-height 260ms ease, opacity 220ms ease"
                  }}
                >
                  <div className="rounded-lg border border-white/10 p-4 bg-black/40 text-sm text-gray-200">
                    <ul className="list-disc ml-5 space-y-2">
                      <li><span className="font-semibold">Palette:</span> Jet black base, storm-gold accents ({GOLD}).</li>
                      <li><span className="font-semibold">Type:</span> Elegant serif for headings; clean sans for UI.</li>
                      <li><span className="font-semibold">Motion:</span> Subtle fades/parallax &lt; 400ms; cinematic, not busy.</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* CARD 5 — oldest (bottom) */}
              <article className="rounded-xl bg-black/75 border border-white/10 p-5 hover:border-[#a77a23]/40 transition backdrop-blur-[1px]">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Announcement</span>
                  <time dateTime="2026-07-05">Jul 5, 2026</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  The Seven-Fold Chronicle Begins
                </h3>
                <p className="text-gray-300 mb-3 text-sm">
                  Book One — <em>The Beautiful Beast</em> — opens the mapped sequence: thrillers forged in storm and consequence,
                  where beauty and danger share the same breath.
                </p>
                <ul className="text-gray-300 text-sm list-disc ml-5 mb-4">
                  <li>Colorado highway. Thanksgiving night. The storm is already waiting.</li>
                  <li>Future volumes follow the rolling narrative timeline after Book 1</li>
                  <li>Join the launch list for calendar locks as dates firm up</li>
                </ul>
                <BlogFigures images={[BLOG_IMG.highway]} />
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/books"
                    className="inline-block px-3 py-2 rounded-lg bg-[#a77a23] text-black text-sm font-semibold hover:opacity-90 transition"
                  >
                    Explore the Books
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowList(true)}
                    className="inline-block px-3 py-2 rounded-lg border border-[#a77a23]/60 text-[#a77a23] text-sm font-semibold hover:bg-[#a77a23]/10 transition"
                  >
                    Join the launch list
                  </button>
                </div>
              </article>
            </section>

            {/* RIGHT: Welcome stays fixed on desktop while blog scrolls */}
            <section className="blog-welcome-pane order-1 md:order-2">
              <div
                className="blog-welcome-card rounded-2xl p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden relative"
                style={{
                  backgroundImage: `linear-gradient(160deg, rgba(8,16,32,0.2), rgba(0,0,0,0.4)), url(${CLIFFSIDE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "50% 40%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="blog-welcome-inner relative z-[1] rounded-xl border border-[#a77a23]/45 bg-[rgba(8,8,10,0.5)] shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-5 md:p-7 backdrop-blur-[1.5px]">
                  <div className="blog-mountain-window shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CLIFFSIDE} alt="Snowy cliffside overlooking a mountain valley in the storm" draggable="false" />
                    <span className="blog-mountain-caption">Cliffside — where the storm begins</span>
                  </div>
                  {clockPair.mountain && clockPair.local ? (
                    <div
                      className="mb-3 flex flex-wrap items-center justify-center gap-2"
                      title="Colorado mountain time and your local time"
                    >
                      <time
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#a77a23]/35 bg-black/45 px-2.5 py-1 text-[10px] sm:text-[11px] tracking-[0.12em] text-gray-300"
                        aria-label={`Colorado mountain time ${clockPair.mountain}`}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                          aria-hidden="true"
                        />
                        <span style={{ color: GOLD }}>{clockPair.mountain}</span>
                        <span className="text-gray-500 tracking-normal normal-case">MT</span>
                      </time>
                      <time
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] sm:text-[11px] tracking-[0.12em] text-gray-300"
                        aria-label={`Your local time ${clockPair.local}`}
                      >
                        <span style={{ color: "#c9ced6" }}>{clockPair.local}</span>
                        <span className="text-gray-500 tracking-normal normal-case">you</span>
                      </time>
                    </div>
                  ) : null}
                  <h1
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-5 text-center shrink-0 md:-translate-x-3 lg:-translate-x-4"
                    style={{ color: GOLD }}
                  >
                    Welcome to Silver Spine Studio<span className="align-super text-xl">™</span>
                  </h1>

                  <div className="blog-welcome-copy max-w-3xl mx-auto space-y-3 md:space-y-4 text-[0.98rem] md:text-[1.05rem] lg:text-lg leading-relaxed">
                    <p>Every story has a shadow. Some you see coming, some you only notice when it’s already moved past you. Silver Spine Studio was born from chasing those shadows — the storm-soaked ones that linger on the highway, the whispered ones that follow families, and the quiet ones that live inside us all.</p>
                    <p>I didn’t want a place of polished perfection. I wanted a place that felt alive, scarred, and a little dangerous. A studio where the stories aren’t afraid to bleed, where the rain smears the glass, and where light fights to cut through the dark.</p>
                    <p>The first book to come from this vision, <span className="font-semibold" style={{ color: GOLD }}>The Beautiful Beast</span>, began on a cold mountain road and has taken years of grit to bring into the light. It’s a thriller, yes, but more than that, it’s a reminder of what storms expose: secrets, loyalties, betrayals — the kind of truths that don’t wash away with the rain.</p>
                    <p>Here on the blog, expect craft notes, behind-the-scenes, and progress on releases. If you like grit with a little glow, you’ll feel at home.</p>
                    <p className="font-semibold">— Leameso James</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom ribbon */}
        <div className="nebula nebula-bottom relative z-[1]" aria-hidden="true" />
      </main>

      {/* Modals */}
      {showList && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: GOLD }}>Join the launch list</h3>
              <button onClick={() => setShowList(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Get launch updates for The Beautiful Beast and the seven-fold chronicle — sneak peek news, preorder windows, and release day alerts. Plus: 3 lucky sleuths win a free FULL digital copy (announced mid-October).
            </p>
            <LaunchListForm requestEmail={REQUEST_EMAIL} />
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setShowList(false)} className="px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/5">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showArc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: GOLD }}>Request early-release ARC — The Beautiful Beast</h3>
              <button onClick={() => setShowArc(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Apply for an Advanced Review Copy of <span className="text-white font-semibold">The Beautiful Beast</span> (early full manuscript for review). Separate from the paid sneak peek.
            </p>
            <ArcRequestForm
              onCancel={() => setShowArc(false)}
              onSuccess={() => {
                window.setTimeout(() => setShowArc(false), 2200);
              }}
            />
          </div>
        </div>
      )}

      {showPress && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: GOLD }}>Press Request — Private</h3>
              <button onClick={() => setShowPress(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={submitPress} className="space-y-4">
              <div className="hidden" aria-hidden="true">
                <label>Leave this empty</label>
                <input
                  type="text"
                  value={pressHp}
                  onChange={(e) => setPressHp(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Your name</label>
                  <input value={pressName} onChange={e => setPressName(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Outlet</label>
                  <input value={pressOutlet} onChange={e => setPressOutlet(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input type="email" value={pressEmail} onChange={e => setPressEmail(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Deadline (optional)</label>
                  <input value={pressDeadline} onChange={e => setPressDeadline(e.target.value)} placeholder="e.g., Nov 12, 2026" className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">What you need</label>
                <input value={pressNeeds} onChange={e => setPressNeeds(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={pressAgree} onChange={e => setPressAgree(e.target.checked)} required />
                <span>I acknowledge materials (if shared) are confidential and not for redistribution without written consent.</span>
              </label>

              {pressStatus.msg ? (
                <p
                  className={`text-sm font-semibold ${
                    pressStatus.state === "success" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pressStatus.msg}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPress(false)} className="px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={!pressAgree || pressStatus.state === "sending"} className="px-4 py-2 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50">
                  {pressStatus.state === "sending" ? "Sending…" : "Send request"}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Sends securely to the studio inbox (tagged [MEDIA REQUEST]). Or use{" "}
                <Link href="/contact?topic=media" className="text-[#a77a23] font-semibold hover:underline">
                  Contact → Media request &amp; interviews
                </Link>
                . No files are shared on this page.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
