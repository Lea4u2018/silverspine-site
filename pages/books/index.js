import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { LIVE_SNEAK_PEEK_STORES } from "@/lib/store";

export default function Books() {
  const GOLD = "#a77a23";
  const SILVER = "#c9ced6";
  const headerRef = useRef(null);

  // ===== Measure header/footer so footer is on-screen (no giant gap) =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const setVars = () => {
      const header = headerRef.current;
      const footer = document.getElementById("site-footer");
      const hH = header ? header.getBoundingClientRect().height : 140;
      const fH = footer ? footer.getBoundingClientRect().height : 72;
      document.documentElement.style.setProperty("--header-h", `${Math.round(hH)}px`);
      document.documentElement.style.setProperty("--footer-h", `${Math.round(fH)}px`);
    };
    setVars();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(setVars);
      if (headerRef.current) ro.observe(headerRef.current);
      const footerEl = document.getElementById("site-footer");
      if (footerEl) ro.observe(footerEl);
    }
    window.addEventListener("load", setVars);
    window.addEventListener("resize", setVars);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("load", setVars);
      window.removeEventListener("resize", setVars);
    };
  }, []);

  // ===== Updated logo first =====
  const [logoSrc, setLogoSrc] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const CANDIDATES = [
      "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png",
      "/SilverSpine_FB_Profile_CircleDisc_1024.png",
      "/SilverSpine_FB_Profile_1024.png",
      "/Silver_Spine_Studio_Logo_2025_10_11.png",
    ];
    const tryLoad = (i = 0) => {
      if (i >= CANDIDATES.length) { if (!cancelled) setUseTextLogo(true); return; }
      const img = new Image();
      img.onload = () => { if (!cancelled) setLogoSrc(CANDIDATES[i]); };
      img.onerror = () => tryLoad(i + 1);
      img.src = CANDIDATES[i] + `?v=${Date.now()}`;
    };
    tryLoad();
    return () => { cancelled = true; };
  }, []);

  // ===== Hover narration (separate from thunder) =====
  const audioRefs = useRef({});
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [pendingNarrationId, setPendingNarrationId] = useState(null);
  const [showNarrationChip, setShowNarrationChip] = useState(false);

  const tryPlayNarration = async (id) => {
    const el = audioRefs.current[id];
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
      el.playbackRate = id === 1 ? 1.02 : 0.92;
      el.volume = 0.35;
      await el.play();
    } catch {
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
          el.volume = 0.18;
        }
      }, 40);
    } else {
      el.pause();
      el.currentTime = 0;
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

  // ===== Thunder (button now requires DOUBLE-CLICK to toggle) =====
  const [thunderOn, setThunderOn] = useState(false);
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
    if (!a.paused) {
      a.pause();
      setThunderOn(false);
      return;
    }
    try {
      a.volume = 0.12;
      a.muted = false;
      if (a.readyState < 2) a.load();
      await a.play();
      setThunderOn(true);
    } catch {
      try {
        a.muted = true;
        await a.play();
        a.pause();
        a.muted = false;
        if (a.readyState < 2) a.load();
        await a.play();
        setThunderOn(true);
      } catch {
        setTimeout(async () => {
          try {
            a.muted = false;
            if (a.readyState < 2) a.load();
            await a.play();
            setThunderOn(true);
          } catch {
            setThunderOn(false);
          }
        }, 120);
      }
    }
  };

  // ===== Page data =====
  const books = [
    { id: 1, title: "THE BEAUTIFUL BEAST", tagline: "The first strike in the storm.", img: "/covers/1-the-beautiful-beast-full-tagged.png", whisper: "/audio/beast_whisper_01.mp3", color: "#F5E6C8", ribbon: "COMING SOON" },
    { id: 2, title: "SHADOWS OF A GHOST", tagline: "A shadow doesn’t vanish — it just learns to wait.", img: "/covers/2-shadows-of-a-ghost-arthur-blank-cover.jpg", whisper: "/audio/ghost_whisper_01.mp3", color: "#E5C877", ribbon: "IN THE WORKS" },
    { id: 3, title: "THE GATHERING STORM", tagline: "The sting of lightning before the clap of thunder.", img: "/covers/3-the-gathering-storm-bee-blank-cover.jpg", whisper: "/audio/storm_whisper_01.mp3", color: "#D4A24B", ribbon: "SIMMERING" },
    { id: 4, title: "FRAGILE UNBROKEN", tagline: "What doesn’t shatter learns how to cut.", img: "/covers/4-fragile-unbroken-elliot-blank-cover.jpg", whisper: "/audio/fragile_whisper_01.mp3", color: "#C57A2A", ribbon: "WHEELS TURNING" },
    { id: 5, title: "THE MACHINE", tagline: "When prayer is your only hope — don’t skip it!", img: "/covers/5-the-machine-lancaster-blank-cover.jpg", whisper: "/audio/machine_whisper_01.mp3", color: "#A0522D", ribbon: "BASKING IN TIME" },
    { id: 6, title: "SCARRED TRUTH", tagline: "When no one’s secrets are safe — and the truth is unmerciful.", img: "/covers/6-scarred-truth-saxe-blank-cover.jpg", whisper: "/audio/scarred_whisper_01.mp3", color: "#993300", ribbon: "HOLDING TIGHT" },
    { id: 7, title: "SCORCHED EARTH", tagline: "Before the ashes settle — no one is safe.", img: "/covers/7-scorched-earth-francis-blank-cover.jpg", whisper: "/audio/scorched_whisper_01.mp3", color: "#8B0000", ribbon: "THE BEST TO COME" },
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
          .book-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2rem; justify-items: center; align-items: start; max-width: 88%; margin: .2rem auto 1.2rem; padding: 0.2rem 1rem 0.6rem; }
          @media (max-width: 1600px) { .book-grid { grid-template-columns: repeat(4, 1fr); } }
          @media (max-width: 1024px) { .book-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 768px) { .heading { font-size: 2.2rem; } .nebula-top { height: 44px; } .nebula-bottom { height: 92px; margin-top: -14px; } .book-grid { grid-template-columns: repeat(2, 1fr); max-width: 94%; } }
          @media (max-width: 480px) { .book-grid { grid-template-columns: 1fr; } }
          .book-card { position: relative; border-radius: 1rem; overflow: hidden; aspect-ratio: 2 / 3; width: 100%; max-width: 300px; background: rgba(12,12,12,0.55); border: 1px solid #7e7e70; transition: transform .25s ease, box-shadow .25s ease; }
          .book-card:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 0 45px var(--glow), 0 0 75px var(--glow); }
          .book-card img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.15) saturate(1.15) brightness(1.05); pointer-events: none; }
          .ribbon { position:absolute; top:50%; left:50%; width:250%; height:58%; transform:translate(-50%,-50%) rotate(-45deg); background:#000; display:flex; align-items:center; justify-content:center; z-index:6; }
          .ribbon-text { color:#fff; font:700 1rem/1 'Libre Baskerville', Georgia, serif; letter-spacing:.22em; text-transform:uppercase; opacity:.95; }
          .book-title { position:absolute; top:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 2rem/1.16 'Libre Baskerville', Georgia, serif; color:var(--glow); text-shadow:0 0 18px rgba(0,0,0,.6); z-index:4; }
          .author-name { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 1.2rem/1.2 'Libre Baskerville', Georgia, serif; color:var(--glow); letter-spacing:.18em; z-index:4; }
          .tagline { margin-top:.6rem; text-align:center; color: var(--glow); font-style:italic; font-size:1rem; opacity:0; transition:opacity .6s ease-in-out; }
          .book-card:hover + .tagline { opacity:.9; }
          .chip { display:inline-flex; align-items:center; gap:.5rem; background: rgba(0,0,0,0.75); border: 1px solid rgba(167,122,35,0.45); border-radius: 999px; padding: 6px 12px; color: ${GOLD}; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
          .chip:hover { background: rgba(0,0,0,0.9); }
          .featured-wrap { max-width: 1120px; margin: 0 auto 1.1rem; padding: 0 1rem; }
          .timeline { max-width: 1080px; margin: .35rem auto 1.05rem; padding: .6rem .9rem; border: 1px solid rgba(167,122,35,0.35); border-radius: 12px; background: rgba(0,0,0,0.45); }
          .timeline h4 { margin: 0 0 .3rem; font: 700 1rem/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: ${GOLD}; letter-spacing:.04em; text-transform: uppercase; }
          .timeline-list { display:grid; grid-template-columns: 1fr 2.2fr; gap: .35rem .9rem; align-items: start; }
          .timeline dt { color:#d9d1bd; font-weight:600; }
          .timeline dd { color:#eee7d6; margin:0; }
          @media (max-width: 640px) { .timeline-list { grid-template-columns: 1fr; } }
        `}</style>
      </Head>

      <header ref={headerRef} className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img src={logoSrc} alt="Silver Spine Studio logo" className="h-[88px] md:h-[100px] lg:h-[112px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(201,206,214,0.28)]" draggable="false" />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
          </Link>
          <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
            <Link href="/" className="text-gray-200 hover:text-[#a77a23]">Home</Link>
            <Link href="/books" className="text-red-600 font-semibold" aria-current="page">Books</Link>
            <Link href="/about" className="text-gray-200 hover:text-[#a77a23]">About</Link>
            <Link href="/contact" className="text-gray-200 hover:text-[#a77a23]">Contact</Link>
            <Link href="/blog" className="text-gray-200 hover:text-[#a77a23]">Blog</Link>
            <Link href="/reviews" className="text-gray-200 hover:text-[#a77a23]">Reviews</Link>
            <Link href="/shop" className="text-gray-200 hover:text-[#a77a23]">Shop</Link>
          </nav>
        </div>
      </header>

      <div className="page-frame relative z-0">
        <div className="nebula nebula-top mask-top relative z-10">
          <div className="letterbox-bar top-edge" />
        </div>

        <div className="relative z-20 flex items-center justify-center gap-3 mb-2">
          {showNarrationChip && !narrationEnabled && (
            <button className="chip" onClick={enableNarration} title="Enable narration (one-time)">
              🎧 Click once to enable narration
            </button>
          )}
          <button onDoubleClick={toggleThunder} className="chip" title={thunderOn ? "Double-click to turn thunder off" : "Double-click to hear thunder"}>
            {thunderOn ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
            {thunderOn ? "Double-click to turn thunder off" : "Double-click to hear thunder"}
          </button>
        </div>

        <main className="flex-1 relative z-20 pb-8">
          <h1 className="heading" style={{ color: SILVER }}>
            The Silver Spine Studio<span className="align-super text-base">™</span> Series: The seven-fold chronicle.
          </h1>
          <h2 className="subheading">
            Hover or click a book to feel the charge. Narration plays on hover (one-time enable may be required).
          </h2>

              <section id="featured-book" aria-label="Featured Book: The Beautiful Beast" className="featured-wrap">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-black/40 p-6 rounded-2xl border border-white/5 shadow-2xl">

              {/* VIDEO TRAILER COLUMN (Left Side) */}
              <div className="md:col-span-4 max-w-[280px] md:max-w-full mx-auto w-full aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-950 relative z-30">
                <video
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover absolute inset-0 z-40"
                  style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
                >
                  <source src="/videos/00_OFFICIAL_SNEAK_PEEK_TRAILER_1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* DESCRIPTION & DOWNLOAD DETAILS (Right Side) */}
              <div className="md:col-span-8 flex flex-col justify-center h-full space-y-5">
                <div>
                  <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white text-left" style={{ textShadow: "0 0 10px rgba(201,206,214,0.22), 0 2px 10px rgba(0,0,0,0.82)" }}>
                    The Beautiful Beast
                  </h3>
                  <p className="text-[#a77a23] text-xs md:text-sm font-bold uppercase tracking-widest mt-1 mb-4">
                    Crime Thriller • Psychological • Rural Noir
                  </p>
                  <p id="featured-blurb-text" className="text-sm md:text-base text-gray-300 leading-relaxed text-left" style={{ textShadow: "0 0 8px rgba(201,206,214,0.10), 0 2px 8px rgba(0,0,0,0.75)" }}>
                    A year after a Thanksgiving-night crash on Colorado’s Million-Dollar Highway—and the cover-up that followed—the first debt comes due. When new headlights carve through the canyon, old secrets scrape to the surface—and someone is shaping grief into a weapon.
                  </p>
                </div>

                <div className="bg-[#a77a23]/10 border border-[#a77a23]/20 p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-300 leading-normal">
                    ⚡ <span className="text-white font-semibold">Limited Preview:</span> Get the unedited Prologue + Chapters 1–2 for <span className="text-[#a77a23] font-bold">$4.99</span>. Buying today whitelists your email for the <span className="text-white font-bold">$14.99 insider rate</span> from <span className="text-white font-bold">Sep 1 – Oct 19, 2026</span>. Full retail is <span className="text-white font-bold">$24.99</span> starting <span className="text-white font-bold">Oct 20, 2026</span>.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  {LIVE_SNEAK_PEEK_STORES.map((store) => (
                    <a
                      key={store.key}
                      href={store.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gumroad-button w-full inline-flex items-center justify-center gap-2 font-semibold tracking-wide text-white bg-[#a77a23] hover:bg-[#8e661b] transform hover:-translate-y-0.5 transition-all duration-200 text-center py-3.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(167,122,35,0.4)]"
                    >
                      📖 {store.shortLabel}
                    </a>
                  ))}
                  <Link
                    href="/shop"
                    className="w-full inline-flex items-center justify-center gap-2 font-semibold tracking-wide text-[#a77a23] border border-[#a77a23]/45 hover:bg-[#a77a23]/10 transition-all duration-200 text-center py-3 px-6 rounded-xl"
                  >
                    More storefront options
                  </Link>
                </div>
              </div>

            </div>
          </section>

          <section className="book-grid">
            {books.map((b) => (
              <div key={b.id} style={{ textAlign: "center", "--glow": b.color }}>
                <div className="book-card" style={{ "--glow": b.color }} onMouseEnter={() => tryPlayNarration(b.id)} onMouseLeave={() => stopNarration(b.id)}>
                  <img src={b.img} alt={b.title} />
                  {b.id !== 1 && (
                    <div className="ribbon">
                      <span className="ribbon-text">{b.ribbon}</span>
                    </div>
                  )}
                  {b.id !== 1 && (
                    <>
                      <p className="book-title">{b.title}</p>
                      <p className="author-name" style={{ color: GOLD }}>LEAMESO JAMES</p>
                    </>
                  )}
                  <audio ref={(el) => (audioRefs.current[b.id] = el)} src={b.whisper} preload="auto" />
                </div>
                <p className="tagline">{b.tagline}</p>
              </div>
            ))}
          </section>
        </main>
        <div className="nebula nebula-bottom mask-bottom relative z-10">
          <div className="letterbox-bar bottom-edge" />
        </div>
      </div>
    </div>
  );
}


