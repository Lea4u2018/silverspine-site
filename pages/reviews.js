// /pages/reviews.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useRef } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import StarRating, { StarDisplay } from "@/components/StarRating";
import SiteNav from "@/components/SiteNav";
import StormAtmosphere from "@/components/StormAtmosphere";
import FormFieldLabel, { FormRequiredNote } from "@/components/FormFieldLabel";
import { bindChromeVars } from "@/lib/chromeVars";

export default function ReviewsPage() {

  const GOLD = "#a77a23";
  const NEBULA = "/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg";
 const DISC_LOGO = "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png";
  // header sizing for disc logo
  const headerRef = useRef(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("sss-reviews-lock");
    return () => {
      root.classList.remove("sss-reviews-lock");
      root.style.removeProperty("--header-h");
      root.style.removeProperty("--footer-h");
    };
  }, []);
  useEffect(() => bindChromeVars(headerRef.current), []);

  // form
  const [rating, setRating] = useState(5.0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [hp, setHp] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  // data (approved only — free storage, no Firebase billing)
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews]);

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
    <div className="reviews-page bg-black text-gray-100 min-h-screen flex flex-col relative overflow-x-hidden">
      <StormAtmosphere mood="ash" />
      <Head>
        <title>Reviews | Silver Spine Studio™</title>
        <meta name="description" content="Leave a review and read what others are saying." />
        <style>{`
          :root { --gold: ${GOLD}; --header-h: 140px; --footer-h: 72px; }

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

          @media (max-width: 768px){
            .nebula-ribbon, .bottom-nebula { height: 110px; }
            .nebula-ribbon { margin: 16px 0 18px; }
            .bottom-nebula { margin: 10px 0 0; outline-width: 8px; }
          }

          /* Ensure page scrolls normally */
          html, body { margin:0; background:#000; height:auto; overflow-y:auto; }
          #__next { height:auto; overflow:visible; }

          /* Reviews chrome: header + footer stay put; page content scrolls */
          html.sss-reviews-lock #site-footer {
            padding-top: 0.4rem !important;
            padding-bottom: 0.4rem !important;
          }
          html.sss-reviews-lock #site-footer .sss-footer-icons {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 0.4rem 0.55rem !important;
          }
          html.sss-reviews-lock #site-footer .sss-footer-icon-group {
            flex-wrap: nowrap !important;
            gap: 0.3rem !important;
          }
          html.sss-reviews-lock #site-footer .sss-footer-icons > span {
            width: 1px !important;
            height: 1.6rem !important;
          }
          html.sss-reviews-lock #site-footer a[aria-label] {
            width: 1.65rem !important;
            height: 1.65rem !important;
          }
          html.sss-reviews-lock #site-footer a[aria-label] svg {
            width: 0.75rem !important;
            height: 0.75rem !important;
          }
          html.sss-reviews-lock #site-footer .sss-footer-credits {
            display: none !important;
          }
          html.sss-reviews-lock #site-footer nav[aria-label="Legal"] {
            margin-top: 0.2rem !important;
            flex-wrap: nowrap !important;
            font-size: 10px !important;
          }
          html.sss-reviews-lock #site-footer p {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }

          @media (min-width: 768px) {
            html.sss-reviews-lock,
            html.sss-reviews-lock body,
            html.sss-reviews-lock #__next {
              height: 100%;
              overflow: hidden;
            }
            html.sss-reviews-lock #__next > div.bg-black {
              height: 100dvh;
              max-height: 100dvh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            html.sss-reviews-lock #__next > div.bg-black > main {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            html.sss-reviews-lock .reviews-page {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            html.sss-reviews-lock .reviews-page > main {
              flex: 1 1 auto;
              min-height: 0;
              overflow-x: hidden;
              overflow-y: auto;
            }
            html.sss-reviews-lock #site-footer {
              flex-shrink: 0;
              position: relative;
              z-index: 40;
            }
          }

          @media (max-width: 767px) {
            html.sss-reviews-lock #site-footer {
              position: fixed;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 40;
              box-shadow: 0 -8px 24px rgba(0,0,0,0.45);
            }
            html.sss-reviews-lock .reviews-page {
              padding-bottom: calc(var(--footer-h) + 8px);
            }
          }
        `}</style>
      </Head>

      {/* ===== HEADER ===== */}
      <header
        ref={headerRef}
        className="sticky top-0 z-header bg-gradient-to-b from-gray-900 to-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="mx-auto flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between px-4 md:px-6 py-3 md:py-5 max-w-[1400px] min-w-0">
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="Silver Spine Studio — Home"
              className="flex items-center gap-3 md:gap-4"
            >
              <span className="sss-logo-halo">
                <Image
                  src={DISC_LOGO}
                  alt="Silver Spine Studio"
                  width={512}
                  height={512}
                  priority
                  className="sss-logo-glow disc-logo select-none"
                  style={{
                    height: "clamp(56px, calc(var(--header-h) - 28px), 108px)",
                    width: "auto",
                  }}
                />
              </span>
              <span
                className="hidden sm:inline text-xl md:text-2xl font-semibold tracking-wide"
                style={{
                  color: "#eef2f7",
                  textShadow:
                    "0 0 10px rgba(201,206,214,0.20), 0 2px 10px rgba(0,0,0,0.82)",
                }}
              >
                Silver Spine Studio
                <span className="align-super text-sm md:text-base">™</span>
              </span>
            </Link>
          </div>

          <SiteNav className="w-full sm:w-auto justify-center sm:justify-end tracking-wide" />
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

          {/* two columns — lifted with smaller top offset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* left: form */}
            <div className="sheet">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: GOLD }}>Share your thoughts</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const n = name.trim();
                    const t = text.trim();
                    if (!n || n.length < 2) {
                      alert("Please enter your name.");
                      return;
                    }
                    if (!t || t.length < 10) {
                      alert("Please enter a longer review (at least a sentence).");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const res = await fetch("/api/reviews/submit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: n,
                          text: t,
                          rating,
                          hp,
                          startedAt,
                        }),
                      });
                      let data = {};
                      try {
                        data = await res.json();
                      } catch {
                        data = {};
                      }
                      if (res.ok && data.ok) {
                        setName("");
                        setText("");
                        setRating(5.0);
                        alert(data.message || "Thank you! Your review was submitted and is pending approval.");
                      } else {
                        alert(data.error || `Sorry—something went wrong (${res.status}). Please try again in a moment.`);
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Sorry—something went wrong. Please try again in a moment.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {/* honeypot — leave empty (odd name avoids password-manager autofill) */}
                  <input
                    type="text"
                    name="sss_website_url"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                    style={{ position: "absolute", left: "-9999px" }}
                  />
                  <FormRequiredNote className="text-xs text-gray-500 mb-3" />
                  <label className="block text-sm text-gray-300 mb-2">
                    Your Rating <span className="text-red-400 font-semibold ml-0.5" aria-hidden="true">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} />

                  <div className="mt-5">
                    <FormFieldLabel htmlFor="name" required>
                      Name
                    </FormFieldLabel>
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
                    <FormFieldLabel htmlFor="text" required>
                      Your Review
                    </FormFieldLabel>
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

      {/* bottom ribbon */}
      <div className="bottom-nebula">
        <img src={NEBULA} alt="Nebula footer ribbon" />
      </div>
    </div>
  );
}
