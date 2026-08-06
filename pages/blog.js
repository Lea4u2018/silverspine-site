// /pages/blog.js
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

export default function Blog() {
  const router = useRouter();

  // ---- brand / assets ----
  const GOLD = "#a77a23";
 const DISC_LOGO = "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png";
 const BIG_LOGO = "/Final_Silver_Spine_Square_Logo_With_Words_Transparant.png";
 const NEBULA = "/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg";
 const REQUEST_EMAIL = "contact@silverspinestudio.com";

  // ---- header height (for sticky header only) ----
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncHeaderVar = () => {
      const h = headerRef.current
        ? Math.round(headerRef.current.getBoundingClientRect().height)
        : 140;
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

  // ---- thunder (center chip, responsive left nudge) ----
  const [siteAudioMuted, setSiteAudioMuted] = useState(true);
  useEffect(() => {
    if (typeof document === "undefined") return;
    let el = document.getElementById("site-audio");
    if (!el) {
      el = document.createElement("audio");
      el.id = "site-audio";
      el.src = "/thunder_rumble.mp3";
      el.loop = true;
      el.preload = "auto";
      document.body.appendChild(el);
    }
    el.muted = true;
  }, []);
  const toggleThunder = async () => {
    const a = document.getElementById("site-audio");
    if (!a) return;
    try {
      if (a.paused) {
        a.muted = false;
        a.volume = 0.2;
        if (a.readyState < 2) a.load();
        await a.play();
        setSiteAudioMuted(false);
      } else {
        a.pause();
        setSiteAudioMuted(true);
      }
    } catch {}
  };

  const links = NAV_LINKS;

  // ---- local UI ----
  const [showPlan, setShowPlan] = useState(false);
  const [showBrandNotes, setShowBrandNotes] = useState(false);
  const [showArc, setShowArc] = useState(false);
  const [showPress, setShowPress] = useState(false);
  const [arcName, setArcName] = useState("");
  const [arcEmail, setArcEmail] = useState("");
  const [arcFormat, setArcFormat] = useState("EPUB");
  const [arcReviewSpot, setArcReviewSpot] = useState("Social media");
  const [arcAgree, setArcAgree] = useState(false);
  const [pressName, setPressName] = useState("");
  const [pressOutlet, setPressOutlet] = useState("");
  const [pressEmail, setPressEmail] = useState("");
  const [pressNeeds, setPressNeeds] = useState("Interview, logo usage, and cover art");
  const [pressDeadline, setPressDeadline] = useState("");
  const [pressAgree, setPressAgree] = useState(false);

  const submitArc = (e) => {
    e.preventDefault();
    if (!arcAgree) return;
    const subject = encodeURIComponent("Early-release ARC request — The Beautiful Beast");
    const body = encodeURIComponent(
      [
        "Hi,",
        "",
        "I'd like to request early-release ARC content for The Beautiful Beast.",
        "",
        `Name: ${arcName}`,
        `Email: ${arcEmail}`,
        `Preferred format: ${arcFormat}`,
        `Where I'll review: ${arcReviewSpot}`,
        "",
        "I agree that any early-release / ARC files I receive are licensed for my personal review use only. I will not copy, upload, resell, or share the files (or substantial excerpts) publicly or privately, except for a fair review. I understand unauthorized distribution may result in removal from the ARC program and legal action.",
        "",
        "Thanks!",
      ].join("\n")
    );
    window.location.href = `mailto:${REQUEST_EMAIL}?subject=${subject}&body=${body}`;
    setShowArc(false);
    setArcAgree(false);
  };
  const submitPress = (e) => {
    e.preventDefault();
    if (!pressAgree) return;
    const subject = encodeURIComponent("Press Request — The Beautiful Beast / Silver Spine Studio");
    const body = encodeURIComponent(
      [
        "Hi,",
        "",
        "Press request details:",
        "",
        `Name: ${pressName}`,
        `Outlet: ${pressOutlet}`,
        `Email: ${pressEmail}`,
        `Deadline: ${pressDeadline || "N/A"}`,
        `Needs: ${pressNeeds}`,
        "",
        "I acknowledge materials (if shared) are confidential and not for redistribution without written consent.",
        "",
        "Thanks!",
      ].join("\n")
    );
    window.location.href = `mailto:${REQUEST_EMAIL}?subject=${subject}&body=${body}`;
    setShowPress(false);
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
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

          /* Only the window scrolls */
         html, body { margin: 0; background:#000; min-height: 100%; }
          #__next { height:auto; overflow:visible; }

          .nav-wrap { max-width: 1400px; }
          .nav-link { color: #e5e7eb; }
          .nav-link:hover { color: ${GOLD}; }
          .nav-active { color: #ef4444; font-weight: 600; }

          /* MAIN: no artificial min-height; no inner scroller */
          .page-frame {
            position: relative;
            z-index: 1;      /* ensure content stays above the ribbon below */
            display: flex;
            flex-direction: column;
            overflow: visible !important;
          }
          .page-frame > *:last-child { margin-bottom: 0 !important; }

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
        {/* 3 columns: left logo / center chip / right nav */}
        <div className="nav-wrap mx-auto grid grid-cols-3 items-center px-6 py-3 md:py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 md:gap-4">
           <Link href="/" className="flex items-center gap-3 md:gap-4" aria-label="Silver Spine Studio — Home">
  <Image
    src={DISC_LOGO}
    alt="Silver Spine Studio logo"
    width={512}
    height={512}
    priority
    className="w-auto select-none"
    style={{
      height: "88px",
      filter:
        "drop-shadow(0 8px 22px rgba(255,255,255,0.16))",
    }}
    sizes="(min-width: 1024px) 512px, (min-width: 768px) 420px, 320px"
  />

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

          {/* Center: Thunder toggle — left shift to sit between logo & "Home" */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={toggleThunder}
              className="chip -translate-x-6 md:-translate-x-8 lg:-translate-x-10 xl:-translate-x-12"
              aria-label={siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
              title={siteAudioMuted ? "Click to hear thunder" : "Turn thunder off"}
            >
              {siteAudioMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
              {siteAudioMuted ? "Click to hear thunder" : "Turn thunder off"}
            </button>
          </div>

          {/* Right: Nav links */}
          <nav className="flex justify-end gap-5 md:gap-10 tracking-wide text-base md:text-lg">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition ${isNavActive(router.pathname, router.asPath, href) ? "nav-active" : "nav-link"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="page-frame">
        {/* Top ribbon */}
        <div className="nebula nebula-top" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-8 pb-8 md:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 items-start">
            {/* LEFT: logo + two cards */}
            <section className="space-y-4">
              <div className="bg-black rounded-2xl border border-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.6)] p-3">
                <div className="bg-black rounded-xl p-3">
                  <img
                    src={BIG_LOGO}
                    alt="Silver Spine Studio logo large"
                    draggable="false"
                    className="block w-full h-auto"
                    style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55))" }}
                  />
                </div>
              </div>

              {/* CARD 1 */}
              <article className="rounded-xl bg-black/60 border border-white/10 p-5 hover:border-[#a77a23]/40 transition">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Announcement</span>
                  <time dateTime="2025-10-13">Oct 13, 2025</time>
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
                <div className="flex flex-wrap gap-3">
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
                    maxHeight: showPlan ? 2000 : 0,   // plenty of room; no clipping
                    opacity: showPlan ? 1 : 0,
                    transition: "max-height 260ms ease, opacity 220ms ease"
                  }}
                >
                  <div className="rounded-lg border border-white/10 p-4 bg-black/40">
                    <h4 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>Milestones</h4>
                  <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-200">
   <li><span className="font-semibold text-[#a77a23]"> Cover Reveal (Live Today)</span> — Aug 3, 2026. The blank ribbon falls away. The premium artwork is officially unmasked.</li>
   <li><span className="font-semibold"> ARC Sign-ups</span> — Aug 7 - Aug 14, 2026. Advanced Review Copy team applications go live. Selection emails go out Aug 17, 2026.</li>
   <li><span className="font-semibold"> Teaser Trailer Drop</span> — Aug 21, 2026. Production loops push live.</li>
   <li><span className="font-semibold"> ARC Delivery Window</span> — Aug 24–26, 2026.</li>
   <li><span className="font-semibold"> Preorder Goes Live</span> — Sep 1, 2026. Early whitelisted buyers lock in the $14.99 insider novel rate through Oct 19, 2026.</li>
   <li><span className="font-semibold"> Launch Week Events</span> — Oct 13, 2026.</li>
   <li><span className="font-semibold"> Official Release Day</span> — Oct 20, 2026. Full retail price becomes $24.99.</li>
 </ol>


                  <h4 className="text-lg font-semibold mt-5 mb-2" style={{ color: GOLD }}>What to expect</h4>
<ul className="list-disc ml-5 space-y-2 text-sm text-gray-200">
  <li><span className="font-semibold">First pages:</span> Read the Prologue + Chapters 1–2 immediately inside our premium Extended Sneak Peek.</li>
  <li><span className="font-semibold">Reader perks:</span> Digital cover art + an annotated Highway 550 scene map.</li>
<li><span className="font-semibold text-[#a77a23]">How to support:</span> Buy the Sneak Peek for $4.99 today and lock in your insider rate of just $14.99 for the full book from Sep 1 – Oct 19, 2026. Regular full retail is $24.99 starting Oct 20, 2026.</li>

</ul>

                  </div>
                </div>
              </article>

              {/* CARD 2 */}
              <article className="rounded-xl bg-black/60 border border-white/10 p-5 hover:border-[#a77a23]/40 transition">
                <div className="flex items-center justify-between text:[11px] text-gray-400 mb-2">
                  <span className="uppercase tracking-wide">Behind the Scenes</span>
                  <time dateTime="2025-10-06">Oct 6, 2025</time>
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: GOLD }}>
                  Building the Silver Spine Look
                </h3>
                <p className="text-gray-300 mb-3 text-sm">Jet black, deep gold, stormlight. The system we’re shipping across the site.</p>
                <div className="flex gap-3">
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
                    maxHeight: showBrandNotes ? 1200 : 0,  // more headroom than before
                    opacity: showBrandNotes ? 1 : 0,
                    transition: "max-height 260ms ease, opacity 220ms ease"
                  }}
                >
                  <div className="rounded-lg border border-white/10 p-4 bg-black/40 text-sm text-gray-200">
                    <ul className="list-disc ml-5 space-y-2">
                      <li><span className="font-semibold">Palette:</span> Jet black base, storm-gold accents (${GOLD}).</li>
                      <li><span className="font-semibold">Type:</span> Elegant serif for headings; clean sans for UI.</li>
                      <li><span className="font-semibold">Motion:</span> Subtle fades/parallax &lt; 400ms; cinematic, not busy.</li>
                    </ul>
                  </div>
                </div>
              </article>
            </section>

            {/* RIGHT: nebula content (kept inside card only) */}
            <section className="md:self-start">
              <div
                className="rounded-2xl p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden relative"
                style={{
                  backgroundImage: `url(${NEBULA}), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.05), rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6))`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="relative z-[1] rounded-xl border border-[#a77a23]/35 bg-[rgba(15,15,15,0.86)] shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-6 md:p-8">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-center" style={{ color: GOLD }}>
                    Welcome to Silver Spine Studio<span className="align-super text-xl">™</span>
                  </h1>

                  <div className="max-w-3xl mx-auto space-y-5 text-[1.05rem] md:text-lg leading-relaxed">
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
        <div className="nebula nebula-bottom" aria-hidden="true" />
      </main>

      {/* Modals */}
      {showArc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.6)] px-4">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold" style={{ color: GOLD }}>Request early-release ARC — The Beautiful Beast</h3>
              <button onClick={() => setShowArc(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={submitArc} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input value={arcName} onChange={e => setArcName(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" value={arcEmail} onChange={e => setArcEmail(e.target.value)} required className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Preferred format</label>
                  <select value={arcFormat} onChange={e => setArcFormat(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60">
                    <option value="EPUB">EPUB (phones, tablets, most e-readers)</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Where you’ll review</label>
                  <select value={arcReviewSpot} onChange={e => setArcReviewSpot(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60">
                    <option>Social media</option>
                    <option>Personal blog / website</option>
                    <option>Amazon (when available)</option>
                    <option>Other / not sure yet</option>
                  </select>
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
                <input
                  type="checkbox"
                  checked={arcAgree}
                  onChange={(e) => setArcAgree(e.target.checked)}
                  required
                  className="mt-0.5"
                />
                <span>
                  I understand ARC / early-release files are licensed for my personal review only. I will not copy, upload, resell, or share the files (or substantial excerpts) with anyone else. Unauthorized sharing may end my ARC access and may be pursued as copyright infringement.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowArc(false)} className="px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={!arcAgree} className="px-4 py-2 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50">Open email request</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Submitting opens your email client with a prefilled message to {REQUEST_EMAIL} for your request of early-release content info.
              </p>
            </form>
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
                  <label className="block text sm text-gray-300 mb-1">Deadline (optional)</label>
                  <input value={pressDeadline} onChange={e => setPressDeadline(e.target.value)} placeholder="e.g., Nov 12, 2025" className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-[#a77a23]/60" />
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPress(false)} className="px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={!pressAgree} className="px-4 py-2 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50">Send request</button>
              </div>

              <p className="text-xs text-gray-400 mt-2">Submitting opens your email client with a prefilled message to {REQUEST_EMAIL}. No files are shared on this page.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
