// /pages/books.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function Books() {
  const GOLD = "#a77a23";
  const headerRef = useRef(null);

  // ===== Measure header/footer so footer is on-screen (no giant gap) =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const setVars = () => {
      const header = headerRef.current;
      const footer = document.getElementById("site-footer");
      const hH = header ? header.getBoundingClientRect().height : 140;
      const fH = footer ? footer.getBoundingClientRect().height : 220;
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

  // ===== Disc logo first =====
  const [logoSrc, setLogoSrc] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const CANDIDATES = [
      "/SilverSpine_FB_Profile_CircleDisc_1024.png", // disc
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
      el.volume = 0.18;
      await el.play(); // may throw NotAllowedError on first hover
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

  // ===== Thunder (optional, button only) =====
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
    el.muted = true; // starts muted
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
      // Primary attempt — should work on first click in most browsers
      a.volume = 0.12;
      a.muted = false;
      if (a.readyState < 2) a.load();
      await a.play();
      setThunderOn(true);
    } catch {
      // Fallback unlock sequence for stricter browsers (e.g., Safari)
      try {
        a.muted = true;
        await a.play();   // silent allowed
        a.pause();        // stop silent frame
        a.muted = false;  // unmute
        if (a.readyState < 2) a.load();
        await a.play();   // real play
        setThunderOn(true);
      } catch {
        // Last resort: small delay and retry once
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
    { id: 1, title: "THE BEAUTIFUL BEAST", tagline: "The first strike in the storm.", img: "/covers/1-the-beautiful-beast-blank-cover.jpg", whisper: "/audio/beast_whisper_01.mp3", color: "#F5E6C8", ribbon: "COMING SOON" },
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
          :root { --header-h: 140px; --footer-h: 220px; }
          .page-frame { min-height: calc(100vh - var(--header-h) - var(--footer-h)); display: flex; flex-direction: column; }

          /* Nebula ribbons + cinematic bars */
          .nebula { position: relative; width: 100%; background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg'); background-size: cover; background-position: center; filter: saturate(1.15) contrast(1.1); }
          .nebula-top { height: 120px; }
          .nebula-bottom { height: 100px; margin-top: -16px; } /* pulls footer up */

          .mask-top { -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); }
          .mask-bottom { -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0)); }
          .letterbox-bar { position:absolute; left:0; right:0; height:12px; background: rgba(0,0,0,0.95); }
          .letterbox-bar.top-edge { bottom:0; }
          .letterbox-bar.bottom-edge { top:0; }

          /* Chips & headings position */
          .hero-spacer { height: 72px; }
          @media (max-width: 1280px) { .hero-spacer { height: 64px; } }
          @media (max-width: 1024px) { .hero-spacer { height: 56px; } }
          @media (max-width: 768px)  { .hero-spacer { height: 44px; } }

          .heading { text-align:center; color:${GOLD}; font-size:2.8rem; font-weight:800; line-height:1.2; margin-top: 0.2rem; letter-spacing:.02em; text-shadow:0 2px 12px rgba(0,0,0,.6); }

          /* More breathing room between subheading and covers */
          .subheading { text-align:center; color:#f3e2b8; font-size:1.02rem; font-style:italic; margin:.35rem 0 1.85rem; }

          .book-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2rem; justify-items: center; align-items: start; max-width: 88%; margin: 0 auto 1.2rem; padding: 0.2rem 1rem 0.6rem; }
          .book-grid { margin-top: .2rem; }

          @media (max-width: 1600px) { .book-grid { grid-template-columns: repeat(4, 1fr); } }
          @media (max-width: 1024px) { .book-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 768px)  { .heading { font-size: 2.2rem; } .nebula-top { height: 100px; } .nebula-bottom { height: 92px; margin-top: -14px; } .book-grid { grid-template-columns: repeat(2, 1fr); max-width: 94%; } }
          @media (max-width: 480px)  { .book-grid { grid-template-columns: 1fr; } }

          .book-card { position: relative; border-radius: 1rem; overflow: hidden; aspect-ratio: 2 / 3; width: 100%; max-width: 300px; background: rgba(12,12,12,0.55); border: 1px solid #7e7e70; transition: transform .25s ease, box-shadow .25s ease; }
          .book-card:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 0 45px var(--glow), 0 0 75px var(--glow); }
          .book-card img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.15) saturate(1.15) brightness(1.05); pointer-events: none; }

          .ribbon { position:absolute; top:50%; left:50%; width:250%; height:58%; transform:translate(-50%,-50%) rotate(-45deg); background:#000; display:flex; align-items:center; justify-content:center; z-index:6; }
          .ribbon-text { color:#fff; font:700 1rem/1 'Libre Baskerville', Georgia, serif; letter-spacing:.22em; text-transform:uppercase; opacity:.95; }

          .book-title { position:absolute; top:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 2rem/1.16 'Libre Baskerville', Georgia, serif; color:var(--glow); text-shadow:0 0 18px rgba(0,0,0,.6); z-index:4; }
          .author-name { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:92%; text-align:center; font:700 1.2rem/1.2 'Libre Baskerville', Georgia, serif; color:var(--glow); letter-spacing:.18em; z-index:4; }
          .tagline { margin-top:.6rem; text-align:center; color:${GOLD}; font-style:italic; font-size:1rem; opacity:0; transition:opacity .6s ease-in-out; }
          .book-card:hover + .tagline { opacity:.9; }

          .chip { display:inline-flex; align-items:center; gap:.5rem; background: rgba(0,0,0,0.75); border: 1px solid rgba(167,122,35,0.45); border-radius: 999px; padding: 6px 12px; color: ${GOLD}; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
          .chip:hover { background: rgba(0,0,0,0.9); }
        `}</style>
      </Head>

      {/* HEADER */}
      <header
        ref={headerRef}
        className="relative z-30 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                className="h-[88px] md:h-[100px] lg:h-[112px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(167,122,35,0.25)]"
                draggable="false"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: GOLD }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
            <span className="hidden sm:inline text-lg md:text-2xl font-semibold tracking-wide" style={{ color: GOLD }}>
              Silver Spine Studio<span className="align-super text-sm md:text-base">™</span>
            </span>
          </Link>

          <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
            <Link href="/" className="text-gray-200 hover:text-[#a77a23]">Home</Link>
            <Link href="/books" className="text-red-600 font-semibold" aria-current="page">Books</Link>
            <Link href="/about" className="text-gray-200 hover:text-[#a77a23]">About</Link>
            <Link href="/contact" className="text-gray-200 hover:text-[#a77a23]">Contact</Link>
            <Link href="/blog" className="text-gray-200 hover:text-[#a77a23]">Blog</Link>
            <Link href="/reviews" className="text-gray-200 hover:text-[#a77a23]">Reviews</Link>
          </nav>
        </div>
      </header>

      {/* Between header and footer */}
      <div className="page-frame">
        {/* TOP NEBULA */}
        <div className="nebula nebula-top mask-top relative z-10">
          <div className="letterbox-bar top-edge" />
        </div>

        {/* Spacer */}
        <div className="hero-spacer" aria-hidden="true" />

        {/* CONTROL CHIPS */}
        <div className="relative z-20 flex items-center justify-center gap-3 mb-2">
          {showNarrationChip && !narrationEnabled && (
            <button className="chip" onClick={enableNarration} title="Enable narration (one-time)">
              🎧 Click once to enable narration
            </button>
          )}
          <button
            onClick={toggleThunder}
            className="chip"
            title={thunderOn ? "Click to turn thunder off" : "Click to hear thunder"}
            aria-label={thunderOn ? "Click to turn thunder off" : "Click to hear thunder"}
          >
            {thunderOn ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
            {thunderOn ? "Click to turn thunder off" : "Click to hear thunder"}
          </button>
        </div>

        {/* MAIN */}
        <main className="flex-1 relative z-20 pb-8">
          <h1 className="heading">
            The Silver Spine Studio<span className="align-super text-base">™</span> Series: The seven-fold chronicle.
          </h1>
          <h2 className="subheading">
            Hover a book to feel the charge. Narration plays on hover (one-time enable may be required).
          </h2>

          <section className="book-grid">
            {books.map((b) => (
              <div key={b.id} style={{ textAlign: "center" }}>
                <div
                  className="book-card"
                  style={{ "--glow": b.color }}
                  onMouseEnter={() => tryPlayNarration(b.id)}
                  onMouseLeave={() => stopNarration(b.id)}
                >
                  <img src={b.img} alt={b.title} />
                  {b.id !== 1 && (
                    <div className="ribbon">
                      <span className="ribbon-text">{b.ribbon}</span>
                    </div>
                  )}
                  <p className="book-title">{b.title}</p>
                  <p className="author-name" style={{ color: GOLD }}>LEAMESO JAMES</p>
                  <audio ref={(el) => (audioRefs.current[b.id] = el)} src={b.whisper} preload="auto" />
                </div>
                <p className="tagline">{b.tagline}</p>
              </div>
            ))}
          </section>
        </main>

        {/* BOTTOM NEBULA (thinner, pulls footer up) */}
        <div className="nebula nebula-bottom mask-bottom relative z-10">
          <div className="letterbox-bar bottom-edge" />
        </div>
      </div>

      {/* No local footer here. Global Footer renders after this. */}
    </div>
  );
}
