// /pages/reviews.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";
import { FaRegCommentDots, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import StarRating, { StarDisplay } from "@/components/StarRating";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

export default function ReviewsPage() {
  const router = useRouter();

  const GOLD = "#a77a23";
  const NEBULA = "/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg";
  const DISC_LOGO = "/SilverSpine_FB_Profile_CircleDisc_1024.png";
  const AUDIO_SRC = "/thunder_rumble.mp3";

  // header sizing for disc logo
  const headerRef = useRef(null);
  useEffect(() => {
    const syncHeaderVar = () => {
      const h = headerRef.current ? Math.round(headerRef.current.getBoundingClientRect().height) : 140;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    syncHeaderVar();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(syncHeaderVar);
      if (headerRef.current) ro.observe(headerRef.current);
    }
    window.addEventListener("load", syncHeaderVar);
    window.addEventListener("resize", syncHeaderVar);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("load", syncHeaderVar);
      window.removeEventListener("resize", syncHeaderVar);
    };
  }, []);

  // audio
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const prime = () => {
      a.muted = false;
      a.volume = 0.22;
      a.play().catch(() => {});
    };
    document.addEventListener("click", prime, { once: true });
    return () => document.removeEventListener("click", prime);
  }, []);

  const toggleAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isMuted) {
      a.muted = false; a.volume = 0.22; a.play().catch(() => {});
    } else { a.muted = true; }
    setIsMuted(v => !v);
  };

  // move & de-dupe GLOBAL FOOTER and ensure it sits ABOVE the bottom nebula
  useEffect(() => {
    if (typeof document === "undefined") return;
    const selectors =
      "#site-footer, footer.site-footer, footer#footer, footer.Footer, .site-footer, .footer, [data-site-footer]";
    const mount = document.getElementById("reviews-footer-mount");
    const all = Array.from(document.querySelectorAll(selectors));
    if (!mount || all.length === 0) return;

    // keep the first, remove the rest
    const footer = all[0];
    all.slice(1).forEach(el => {
      try { el.parentNode && el.parentNode.removeChild(el); } catch {}
    });

    // normalize + ensure visibility
    Object.assign(footer.style, {
      position: "static",
      left: "auto",
      right: "auto",
      bottom: "auto",
      top: "auto",
      transform: "none",
      zIndex: "40",                 // keep over nebula
      marginTop: "0",
      marginBottom: "0",
      paddingTop: "12px",
      paddingBottom: "16px",
      lineHeight: "1.35",
    });

    // remember original (if you navigate away)
    const parent = footer.parentNode;
    const next = footer.nextSibling;

    // move real node (no clone)
    mount.appendChild(footer);

    // update CSS var with actual height (if needed elsewhere)
    const setVar = () => {
      const h = Math.round(footer.getBoundingClientRect().height) || 220;
      document.documentElement.style.setProperty("--footer-h", `${h}px`);
    };
    setVar();
    let ro;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(setVar); ro.observe(footer); }
    window.addEventListener("resize", setVar);

    return () => {
      if (parent) {
        if (next) parent.insertBefore(footer, next);
        else parent.appendChild(footer);
      }
      if (ro) ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  // form
  const [rating, setRating] = useState(5.0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // data
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const col = collection(db, "reviews");
    const q = query(col, where("approved", "==", true), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  // little starfield
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const newStars = Array.from({ length: 40 }, () => ({
      top: Math.random() * 30,
      left: Math.random() * 100,
      size: Math.random() * 1.4 + 0.8,
      opacity: Math.random() * 0.5 + 0.35,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 2.5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col relative overflow-x-hidden">
      <Head>
        <title>Reviews | Silver Spine Studio™</title>
        <meta name="description" content="Leave a review and read what others are saying." />
        <style>{`
          :root { --gold: ${GOLD}; --header-h: 140px; --footer-h: 220px; }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.06); }
          }
          .stars { position:absolute; inset:0 0 auto 0; height:40vh; pointer-events:none; z-index:0; }
          .star { position:absolute; background:white; border-radius:50%;
            box-shadow:0 0 3px rgba(255,255,255,0.4);
            animation: twinkle var(--dur, 4s) ease-in-out infinite;
            animation-delay: var(--delay, 0s);
          }

          .z-header { z-index: 50; }
          .z-content { z-index: 20; position: relative; }

          /* ribbons */
          .nebula-ribbon, .bottom-nebula {
            position: relative; width: 100%; height: 140px;
            background: #000; outline: 12px solid #000; overflow: hidden;
          }
          .nebula-ribbon { margin: 22px 0 26px; box-shadow: 0 16px 48px rgba(0,0,0,0.55); }

          /* keep the bottom band position the same, but ensure it's UNDER the footer */
          .bottom-nebula { 
            margin: 14px 0 0; 
            outline-width: 8px; 
            box-shadow: 0 -16px 48px rgba(0,0,0,0.55);
            z-index: 10;                  /* footer sits above at z 40 */
          }
          .nebula-ribbon img, .bottom-nebula img {
            width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
          }
          .nebula-title { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; }
          .nebula-title h1 { color:#000; font-weight:800; letter-spacing:.02em; margin-top:-4px; font-size: clamp(2.2rem, 6vw, 3.5rem); }

          /* cards */
          .sheet {
            background:#0b0b0b; border:1px solid rgba(167,122,35,0.35); border-radius:22px;
            box-shadow: 0 18px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04);
          }

          /* LIFT content up slightly without touching the nebula bands */
          .boxes-offset { margin-top: 8px; }                /* was 22/32px */
          @media (min-width: 768px){ .boxes-offset { margin-top: 12px; } }

          /* tighter spacing around the thunder toggle */
          .toggle-tight { margin-top: -4px; margin-bottom: 10px; } /* was mb-20ish accumulative */

          /* footer visibility boost + hover gold (icons) */
          .footer-boost footer, .footer-boost footer a, .footer-boost footer p { color:#ffffff !important; }
          .footer-boost footer a svg { color:#ffffff !important; transition: color .2s ease; }
          .footer-boost footer a:hover svg { color: var(--gold) !important; }

          /* compress footer padding a hair */
          .footer-tight #site-footer { padding-top: 12px !important; padding-bottom: 16px !important; line-height: 1.35 !important; }

          @media (max-width: 768px){
            .nebula-ribbon, .bottom-nebula { height: 110px; }
            .nebula-ribbon { margin: 16px 0 18px; }
            .bottom-nebula { margin: 10px 0 0; outline-width: 8px; }
            .footer-tight #site-footer { padding-top: 10px !important; padding-bottom: 14px !important; }
          }

          /* Ensure page scrolls normally */
          html, body { margin:0; background:#000; height:auto; overflow-y:auto; }
          #__next { height:auto; overflow:visible; }

          /* Pull the footer a LITTLE, but keep it over the nebula and fully visible */
          #reviews-footer-mount { 
            margin-top: -28px;            /* gentler pull (previous -64px hid icons) */
            position: relative; 
            z-index: 40;                  /* keeps icons above the nebula band */
            pointer-events: auto;
          }
        `}</style>
      </Head>

      {/* audio element */}
      <audio ref={audioRef} loop preload="auto" playsInline muted={isMuted}>
        <source src={AUDIO_SRC} type="audio/mpeg" />
      </audio>

      {/* ===== HEADER ===== */}
      <header
        ref={headerRef}
        className="sticky top-0 z-header bg-gradient-to-b from-gray-900 to-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="mx-auto grid grid-cols-2 md:grid-cols-3 items-center px-6 py-4 md:py-5 max-w-[1400px]">
          <div className="flex items-center">
            <Link href="/" aria-label="Silver Spine Studio — Home">
              <Image
                src={DISC_LOGO}
                alt="Silver Spine Studio (disc)"
                width={512}
                height={512}
                priority
                className="disc-logo select-none drop-shadow-[0_6px_18px_rgba(167,122,35,0.25)]"
                style={{ height: "clamp(64px, calc(var(--header-h) - 28px), 108px)", width: "auto" }}
              />
            </Link>
          </div>

          <div className="hidden md:block" />

          <nav className="flex justify-end gap-6 md:gap-10 tracking-wide text-base md:text-lg">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition ${
                  router.asPath === href ? "text-red-500 font-semibold" : "text-gray-200 hover:text-[#a77a23]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* stars layer */}
      <div className="stars">
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              ["--delay"]: `${s.delay}s`,
              ["--dur"]: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      {/* top ribbon */}
      <div className="nebula-ribbon">
        <img src={NEBULA} alt="Nebula ribbon" />
        <div className="nebula-title"><h1>Reviews</h1></div>
      </div>

      {/* ===== MAIN ===== */}
      <main className="flex-1 z-content px-6 md:px-8 pb-0">
        <section className="mx-auto w-full max-w-6xl boxes-offset">
          {/* stats row */}
          <div className="flex items-center justify-between mb-5">
            <div className="text-gray-300">
              {stats.count > 0 ? (
                <>
                  Avg <span className="font-semibold" style={{ color: GOLD }}>{stats.avg.toFixed(1)}</span>
                  {" "}· <span className="text-gray-200">{stats.count}</span> review{stats.count === 1 ? "" : "s"}
                </>
              ) : (<>Your words could be the first spark here.</>)}
            </div>
            <div className="text-3xl" style={{ color: GOLD }} aria-hidden="true">
              <FaRegCommentDots />
            </div>
          </div>

          {/* THUNDER TOGGLE — lifted up slightly */}
          <div className="w-full flex items-center justify-center toggle-tight">
            <button
              type="button"
              onClick={toggleAudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#a77a23]/60 text-[#a77a23] bg-black/70 hover:bg-black/80 transition shadow"
              title={isMuted ? "Enable ambient audio" : "Mute ambient audio"}
              aria-label={isMuted ? "Play site audio" : "Pause site audio"}
            >
              {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
              {isMuted ? "Click to hear thunder" : "Turn thunder off"}
            </button>
          </div>

          {/* two columns — lifted with smaller top offset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* left: form */}
            <div className="sheet">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: GOLD }}>Share your thoughts</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!name.trim() || !text.trim()) return;
                    setSubmitting(true);
                    try {
                      await addDoc(collection(db, "reviews"), {
                        name: name.trim(),
                        text: text.trim(),
                        rating,
                        approved: false,
                        createdAt: serverTimestamp(),
                      });
                      setName(""); setText(""); setRating(5.0);
                      alert("Thank you! Your review was submitted and is pending approval.");
                    } catch (err) {
                      console.error(err);
                      alert("Sorry—something went wrong.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Your Rating</label>
                  <StarRating value={rating} onChange={setRating} />

                  <div className="mt-5">
                    <label className="block text-sm mb-1" htmlFor="name">Name</label>
                    <input
                      id="name"
                      className="w-full bg-black text-gray-100 rounded-xl border border-gray-800 px-4 py-3 focus:outline-none focus:border-[#a77a23] transition"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., A. Reader"
                      maxLength={80}
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm mb-1" htmlFor="text">Your Review</label>
                    <textarea
                      id="text"
                      className="w-full bg-black text-gray-100 rounded-xl border border-gray-800 px-4 py-3 h-28 resize-y focus:outline-none focus:border-[#a77a23] transition"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your honest thoughts (no spoilers please!)"
                      maxLength={2000}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Submissions appear after approval.</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-3 rounded-xl bg-[#a77a23] text-black font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {submitting ? "Sending…" : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* right: reviews */}
            <div className="sheet">
              <div className="p-5 md:p-7">
                <h3 className="text-xl font-semibold mb-4" style={{ color: GOLD }}>What readers are saying</h3>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((r) => (
                      <article
                        key={r.id}
                        className="rounded-xl p-4 border border-white/10 transition hover:border-[#a77a23]/40"
                        style={{ background: "#0d0d0d" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-semibold" style={{ color: GOLD }}>{r.name}</div>
                          <StarDisplay value={r.rating} />
                        </div>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{r.text}</p>
                      </article>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-gray-400 italic">
                      Be the first to leave a review — your voice helps shape the story.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* bottom ribbon (unchanged position) */}
      <div className="bottom-nebula">
        <img src={NEBULA} alt="Nebula footer ribbon" />
      </div>

      {/* FOOTER MOUNT — sits above the nebula so icons are visible */}
      <div id="reviews-footer-mount" className="footer-boost footer-tight" />
    </div>
  );
}
