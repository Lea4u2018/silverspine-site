// /pages/blog.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LaunchListForm from "@/components/LaunchListForm";
import ArcRequestForm from "@/components/ArcRequestForm";
import PinnedBlogCard from "@/components/PinnedBlogCard";
import BlogVideo from "@/components/BlogVideo";
import BlogCardPlayers from "@/components/BlogCardPlayers";
import BlogRichBody from "@/components/BlogRichBody";
import FormFieldLabel, { FormRequiredNote, RequiredMark } from "@/components/FormFieldLabel";
import StormAtmosphere from "@/components/StormAtmosphere";
import HoldScrollArrows, { CopyScrollBox } from "@/components/HoldScrollArrows";
import { readPreferredLang } from "@/lib/i18n";
import { mediaCardClass, frameForPost } from "@/lib/blogMedia";

export default function Blog() {

  // ---- brand / assets ----
  const GOLD = "#dfcfb5";
 const BIG_LOGO = "/Final_Silver_Spine_Square_Logo_With_Words_Transparant.png";
  // Realistic snow-mountain cliffside (from studio art) — blends from Welcome toward the blog
  const STORM_ROAD = "/blog/snow-mountain-road.jpg";
  const CLIFFSIDE = "/blog/cliffside-snow.jpg";
  const SILVER_STORM = "/storm-lightning.mp4";
 const REQUEST_EMAIL = "contact@silverspinestudio.com";

  const [studioPosts, setStudioPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const blogFeedRef = useRef(null);
  const welcomeCopyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog/posts");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.posts)) {
          setStudioPosts(data.posts);
          setPinnedPosts(Array.isArray(data.pinned) ? data.pinned : []);
        }
      } catch {
        /* keep pinned cards only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("sss-blog-lock");
    body.classList.add("sss-blog-lock");
    return () => {
      html.classList.remove("sss-blog-lock");
      body.classList.remove("sss-blog-lock");
    };
  }, []);

  // ---- header + footer heights (keep icons always on-screen) ----
  const silverStormRef = useRef(null);

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
    vid.playbackRate = 0.85;
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

  const feedItems = [
    ...pinnedPosts.map((p) => ({
      kind: "pinned",
      id: `pin-${p.id}`,
      t: Date.parse(p.dateISO) || Date.parse(p.createdAt) || 0,
      p,
    })),
    ...studioPosts.map((p) => ({
      kind: "studio",
      id: `studio-${p.id}`,
      t: Date.parse(p.createdAt) || 0,
      p,
    })),
  ].sort((a, b) => b.t - a.t);

  return (
    <div className="blog-page text-gray-100 flex flex-col relative z-10">
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
            --gold: ${GOLD};
          }

          html.sss-blog-lock,
          html.sss-blog-lock body,
          html.sss-blog-lock #__next {
            height: 100%;
            max-height: 100dvh;
            overflow: hidden;
          }
          html.sss-blog-lock #__next > div {
            height: 100%;
            max-height: 100dvh;
            overflow: hidden;
          }
          html.sss-blog-lock #__next > div > .relative.z-10.flex-1 {
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          html, body { margin: 0; background:#000; }
          #__next { height:auto; overflow:visible; }
          html.sss-blog-lock #__next { height: 100%; overflow: hidden; }

          .blog-page {
            flex: 1 1 auto;
            min-height: 0;
            height: 100%;
            max-height: 100%;
            overflow: hidden;
          }
          .blog-split-host {
            display: flex;
            flex-direction: column;
            min-height: 0;
            height: 100%;
            overflow: hidden;
          }
          .blog-split-host .blog-split {
            flex: 1 1 auto;
            min-height: 0;
            height: 100%;
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
            flex: 1 1 auto;
            min-height: 0;
            height: 100%;
            overflow: hidden;
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
            opacity: 0;
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
            border: 1px solid rgba(223,207,181,0.55);
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

          /* Desktop: Welcome fills down to the footer; left column scrolls */
          .blog-split {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            align-items: start;
          }
            .blog-feed-wrap {
              position: relative;
              min-width: 0;
              display: flex;
              flex-direction: row;
              align-items: stretch;
              gap: 6px;
            }
            .blog-feed {
              flex: 1 1 auto;
              min-width: 0;
            }
            .blog-master-rail {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              flex: 0 0 40px;
              width: 40px;
            }
            .blog-hold-scroll--master {
              display: flex;
            }
            .blog-hold-scroll--master .blog-hold-scroll-btn {
              width: 34px;
              height: 34px;
              font-size: 13px;
            }
            .blog-hold-scroll {
              display: flex;
              flex-direction: column;
              gap: 5px;
              flex-shrink: 0;
              padding-top: 2px;
            }
            .blog-hold-scroll-btn {
              width: 26px;
              height: 26px;
              border-radius: 6px;
              border: 1px solid #dfcfb5;
              background: #111111;
              color: #dfcfb5;
              font-size: 10px;
              line-height: 1;
              cursor: pointer;
              padding: 0;
            }
            .blog-hold-scroll-btn:hover {
              background: #dfcfb5;
              color: #111111;
            }
          .blog-welcome-pane {
            min-width: 0;
          }
          .blog-welcome-card {
            display: flex;
            flex-direction: column;
            min-height: 0;
          }
          .blog-welcome-inner {
            display: flex;
            flex-direction: column;
            min-height: 0;
          }
          .blog-welcome-copy-wrap {
            display: flex;
            align-items: stretch;
            gap: 8px;
            flex: 1 1 auto;
            min-height: 0;
          }
          .blog-welcome-copy-wrap .blog-welcome-copy {
            flex: 1 1 auto;
            min-width: 0;
          }
          .blog-welcome-copy-wrap .blog-hold-scroll {
            align-self: center;
            padding-top: 0;
          }
          .blog-welcome-copy {
            overflow-x: hidden;
            overflow-y: auto;
            padding-right: 0.25rem;
            padding-bottom: 1.5rem;
            scrollbar-width: none;
          }
          .blog-welcome-copy::-webkit-scrollbar { display: none; width: 0; }
          .blog-media-card {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            border-radius: 0.75rem;
            border: 1px solid rgba(223, 207, 181, 0.45);
            background: #07080c;
          }
          .character-wheel-card.blog-media-card {
            background: transparent;
          }
          .blog-media-stage {
            width: 100%;
            overflow: hidden;
            line-height: 0;
            background: #07080c;
          }
          .blog-media-fill {
            display: block;
            width: 100%;
            height: auto;
            max-width: 100%;
            background: #07080c;
          }
          .blog-media-card[class*="blog-media-frame-"] .blog-media-fill {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 50% 20%;
          }
          /* Book covers: whole jacket — title, road, name. A hair under full column height. */
          .blog-media-frame-cover .blog-media-stage,
          .blog-media-frame-coverTight .blog-media-stage,
          .blog-media-frame-podcast .blog-media-stage {
            height: auto;
            max-height: 38rem;
            background: #07080c;
          }
          .blog-media-card.blog-media-frame-cover .blog-media-fill,
          .blog-media-card.blog-media-frame-coverTight .blog-media-fill,
          .blog-media-card.blog-media-frame-podcast .blog-media-fill {
            width: 100%;
            height: auto !important;
            max-height: 38rem;
            object-fit: contain;
            object-position: center;
          }
          .blog-media-frame-reel .blog-media-stage { height: 38rem; }
          .blog-media-frame-reelLite .blog-media-stage { height: 44rem; }
          .blog-media-frame-window .blog-media-stage { height: 32rem; }
          .blog-media-frame-quote .blog-media-stage { height: 30rem; }
          .blog-media-frame-scenic .blog-media-stage { height: 30rem; }
          .blog-media-frame-reelLite .blog-media-fill { object-position: 50% 100%; }
          .blog-media-frame-window .blog-media-fill { object-position: 50% 88%; }
          .blog-media-frame-quote .blog-media-fill { object-position: 50% 72%; }
          .blog-media-frame-scenic .blog-media-fill { object-position: 50% 58%; }
          html.sss-blog-lock .sss-storm-snow {
            -webkit-mask-image: linear-gradient(to left, #000 0%, #000 36%, transparent 58%);
                    mask-image: linear-gradient(to left, #000 0%, #000 36%, transparent 58%);
          }
            .copy-with-arrows {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 0.75rem;
          }
          .copy-with-arrows .pinned-copy-scroll,
          .copy-with-arrows .studio-copy-scroll {
            flex: 1;
            min-width: 0;
            margin-bottom: 0;
          }
          .pinned-copy-scroll {
            max-height: 12.5rem;
            overflow-x: hidden;
            overflow-y: hidden;
            padding-right: 0.2rem;
            overscroll-behavior: auto;
            scrollbar-width: none;
          }
          .pinned-copy-scroll::-webkit-scrollbar { display: none; width: 0; }
          .studio-copy-scroll {
            max-height: 18.5rem;
            overflow-x: hidden;
            overflow-y: hidden;
            padding-right: 0.2rem;
            overscroll-behavior: auto;
            scrollbar-width: none;
          }
          .studio-copy-scroll::-webkit-scrollbar { display: none; width: 0; }
          @media (min-width: 768px) {
            .page-frame {
              height: 100%;
              max-height: 100%;
              overflow: hidden;
            }
            .blog-split {
              grid-template-columns: 1fr 1fr;
              gap: 1.75rem;
              flex: 1 1 auto;
              min-height: 0;
              height: 100%;
              max-height: 100%;
              overflow: hidden;
              align-items: stretch;
            }
            .blog-feed-wrap {
              height: 100%;
              min-height: 0;
            }
            .blog-feed {
              height: 100%;
              overflow-x: hidden;
              overflow-y: auto;
              padding-right: 0.35rem;
              overscroll-behavior: contain;
              scrollbar-width: none;
            }
            .blog-feed::-webkit-scrollbar { display: none; width: 0; }
            .blog-welcome-pane {
              height: 100%;
              overflow: hidden;
              position: sticky;
              top: 0;
              align-self: stretch;
            }
            .blog-welcome-card {
              height: 100%;
              display: flex;
              flex-direction: column;
              min-height: 0;
            }
            .blog-welcome-inner {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .blog-welcome-copy {
              flex: 1 1 auto;
              min-height: 0;
              max-height: none;
              overflow-x: hidden;
              overflow-y: auto;
              padding-right: 0.25rem;
              padding-bottom: 1.75rem;
              overscroll-behavior: contain;
              scrollbar-width: none;
            }
            .blog-welcome-copy::-webkit-scrollbar { display: none; width: 0; }
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

        <div className="blog-split-host relative z-[1] max-w-7xl mx-auto px-6 md:px-8 pt-4 md:pt-6 pb-2 md:pb-3 flex-1 min-h-0 w-full">
          <div className="blog-split">
            {/* LEFT: logo + blog cards (scrolls on desktop) */}
            <div className="blog-feed-wrap order-2 md:order-1">
            <section ref={blogFeedRef} className="blog-feed space-y-4">
              <div className="bg-black/85 rounded-2xl border border-[#dfcfb5]/55 shadow-[0_18px_48px_rgba(0,0,0,0.6)] p-3 backdrop-blur-[2px]">
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

              {/* Newest date in the corner → oldest */}

              {feedItems.map((item) => {
                if (item.kind === "pinned") {
                  return (
                    <PinnedBlogCard
                      key={item.id}
                      post={item.p}
                      onLaunchList={() => setShowList(true)}
                      onArc={() => setShowArc(true)}
                      onPress={() => setShowPress(true)}
                    />
                  );
                }
                const p = item.p;
                const mediaFrame = frameForPost(p);
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
                    key={item.id}
                    className="rounded-xl bg-black/75 border border-[#dfcfb5]/55 p-5 hover:border-[#dfcfb5] transition backdrop-blur-[1px]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span className="uppercase tracking-wide">
                        {(() => {
                          const n = (String(p.title).match(/episode\s+(\d+)/i) || [])[1];
                          if (p.audioUrl || p.spotifyUrl || n) {
                            return n ? `Podcast · Episode ${n}` : "Podcast";
                          }
                          return "Studio update";
                        })()}
                      </span>
                      {dateLabel ? <time dateTime={dateAttr}>{dateLabel}</time> : null}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 leading-snug" style={{ color: GOLD }}>
                      {p.title}
                    </h3>
                    {p.mediaType === "image" && p.mediaUrl ? (
                      <figure className={mediaCardClass(mediaFrame, "mb-4")}>
                        <div className="blog-media-stage">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.mediaUrl}
                            alt={p.mediaCaption || p.title}
                            className="blog-media-fill"
                          />
                        </div>
                        {p.mediaCaption ? (
                          <figcaption className="text-center text-[11px] uppercase tracking-[0.16em] text-gray-400 py-2.5 px-3">
                            {p.mediaCaption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : null}
                    {p.mediaType === "video" && p.mediaUrl ? (
                      <BlogVideo
                        src={p.mediaUrl}
                        poster={p.mediaPoster}
                        caption={p.mediaCaption}
                        label={p.title}
                        frame={mediaFrame}
                      />
                    ) : null}
                    <BlogCardPlayers audioUrl={p.audioUrl} spotifyUrl={p.spotifyUrl} title={p.title} />
                    {p.about || p.body ? (
                      <CopyScrollBox className="studio-copy-scroll">
                        {p.about ? <BlogRichBody body={p.about} className="text-gray-200 text-base" /> : null}
                        {p.body ? <BlogRichBody body={p.body} className="text-gray-200 text-base" /> : null}
                      </CopyScrollBox>
                    ) : null}
                    <p className="text-gray-400 text-xs mt-4 italic">Happy Sleuthing.</p>
                  </article>
                );
              })}
            </section>
            <div className="blog-master-rail">
              <HoldScrollArrows targetRef={blogFeedRef} variant="master" label="Move between posts" />
            </div>
            </div>

            {/* RIGHT: Welcome stays fixed on desktop while blog scrolls */}
            <section className="blog-welcome-pane order-1 md:order-2">
              <div
                className="blog-welcome-card rounded-2xl p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden relative border border-[#dfcfb5]/55"
                style={{
                  backgroundImage: `linear-gradient(160deg, rgba(8,16,32,0.2), rgba(0,0,0,0.4)), url(${CLIFFSIDE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "50% 40%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="blog-welcome-inner relative z-[1] rounded-xl border border-[#dfcfb5]/50 bg-[rgba(8,8,10,0.5)] shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-5 md:p-7 backdrop-blur-[1.5px]">
                  <div className="blog-mountain-window shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CLIFFSIDE} alt="Snowy cliffside overlooking a mountain valley in the storm" draggable="false" />
                    <span className="blog-mountain-caption">Cliffside — where the storm begins</span>
                  </div>
                  {clockPair.mountain && clockPair.local ? (
                    <div
                      className="mb-3 flex flex-wrap items-center justify-center gap-2 shrink-0"
                      title="Colorado mountain time and your local time"
                    >
                      <time
                        className="inline-flex items-center gap-2 rounded-full border border-[#dfcfb5]/45 bg-black/45 px-3.5 py-1.5 text-sm sm:text-base tracking-[0.12em] text-gray-300"
                        aria-label={`Colorado mountain time ${clockPair.mountain}`}
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                          aria-hidden="true"
                        />
                        <span style={{ color: GOLD }}>{clockPair.mountain}</span>
                        <span className="text-gray-400 tracking-normal normal-case text-sm">MT</span>
                      </time>
                      <time
                        className="inline-flex items-center gap-2 rounded-full border border-[#dfcfb5]/35 bg-black/35 px-3.5 py-1.5 text-sm sm:text-base tracking-[0.12em] text-gray-300"
                        aria-label={`Your local time ${clockPair.local}`}
                      >
                        <span style={{ color: "#c9ced6" }}>{clockPair.local}</span>
                        <span className="text-gray-400 tracking-normal normal-case text-sm">you</span>
                      </time>
                    </div>
                  ) : null}
                  <h1
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-5 text-center shrink-0 md:-translate-x-3 lg:-translate-x-4"
                    style={{ color: GOLD }}
                  >
                    Welcome to Silver Spine Studio<span className="align-super text-xl">™</span>
                  </h1>

                  <div className="blog-welcome-copy-wrap">
                  <div
                    ref={welcomeCopyRef}
                    className="blog-welcome-copy max-w-3xl mx-auto space-y-3 md:space-y-4 text-[0.98rem] md:text-[1.05rem] lg:text-lg leading-relaxed"
                  >
                    <p>Every story has a shadow. Some you see coming, some you only notice when it’s already moved past you. Silver Spine Studio was born from chasing those shadows — the storm-soaked ones that linger on the highway, the whispered ones that follow families, and the quiet ones that live inside us all.</p>
                    <p>I didn’t want a place of polished perfection. I wanted a place that felt alive, scarred, and a little dangerous. A studio where the stories aren’t afraid to bleed, where the rain smears the glass, and where light fights to cut through the dark.</p>
                    <p>The first book to come from this vision, <span className="font-semibold" style={{ color: GOLD }}>The Beautiful Beast</span>, began on a cold mountain road and has taken years of grit to bring into the light. It’s a thriller, yes, but more than that, it’s a reminder of what storms expose: secrets, loyalties, betrayals — the kind of truths that don’t wash away with the rain.</p>
                    <p>Here on the blog, expect craft notes, behind-the-scenes, and progress on releases. If you like grit with a little glow, you’ll feel at home.</p>
                    <p className="font-semibold">— Leameso James</p>
                  </div>
                  <HoldScrollArrows targetRef={welcomeCopyRef} variant="card" label="Scroll Welcome" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showList && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#dfcfb5]/50 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
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
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#dfcfb5]/50 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
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
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#dfcfb5]/50 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: GOLD }}>Press Request — Private</h3>
              <button onClick={() => setShowPress(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={submitPress} className="space-y-4">
              <FormRequiredNote />
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
                  <FormFieldLabel required>Your name</FormFieldLabel>
                  <input value={pressName} onChange={e => setPressName(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60" />
                </div>
                <div>
                  <FormFieldLabel required>Outlet</FormFieldLabel>
                  <input value={pressOutlet} onChange={e => setPressOutlet(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormFieldLabel required>Email</FormFieldLabel>
                  <input type="email" value={pressEmail} onChange={e => setPressEmail(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60" />
                </div>
                <div>
                  <FormFieldLabel optional>Deadline</FormFieldLabel>
                  <input value={pressDeadline} onChange={e => setPressDeadline(e.target.value)} placeholder="e.g., Nov 12, 2026" className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60" />
                </div>
              </div>

              <div>
                <FormFieldLabel required>What you need</FormFieldLabel>
                <input value={pressNeeds} onChange={e => setPressNeeds(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#dfcfb5]/60" />
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={pressAgree} onChange={e => setPressAgree(e.target.checked)} required />
                <span>
                  <RequiredMark /> I acknowledge materials (if shared) are confidential and not for redistribution without written consent.
                </span>
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
                <button type="submit" disabled={!pressAgree || pressStatus.state === "sending"} className="px-4 py-2 rounded-lg bg-[#dfcfb5] text-black font-semibold hover:opacity-90 disabled:opacity-50">
                  {pressStatus.state === "sending" ? "Sending…" : "Send request"}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Sends securely to the studio inbox (tagged [MEDIA REQUEST]). Or use{" "}
                <Link href="/contact?topic=media" className="text-[#dfcfb5] font-semibold hover:underline">
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
