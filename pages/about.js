// /pages/about.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { SNEAK_PEEK_STORES } from "@/lib/store";

export default function About() {
  const GOLD = "#a77a23";

  // ===== Header/footer sizing so footer stays in view =====
  const headerRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const setVars = () => {
      const header = headerRef.current;
      const footer = document.getElementById("site-footer"); // safe if missing
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

  // ---------- Logo (disc first) ----------
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
      img.onload = () => !cancelled && setLogoSrc(CANDIDATES[i]);
      img.onerror = () => tryLoad(i + 1);
      img.src = CANDIDATES[i] + `?v=${Date.now()}`;
    };
    tryLoad();
    return () => { cancelled = true; };
  }, []);

  // ---------- Starfield ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = document.getElementById("stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const stars = Array.from({ length: 36 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.4 + 0.1,
      v: Math.random() * 0.002 + 0.001,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach((s) => {
        s.o += s.v;
        if (s.o <= 0.08 || s.o >= 0.5) s.v = -s.v;
        ctx.globalAlpha = s.o;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ---------- Thunder audio (button under the card) ----------
  const audioRef = useRef(null);
  const [siteAudioMuted, setSiteAudioMuted] = useState(true);
  const [showToast, setShowToast] = useState(false);

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
    audioRef.current = el;
  }, []);

  const toggleSiteAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) {
        a.muted = false;
        a.volume = 0.22;
        if (a.readyState < 2) a.load();
        await a.play();
        setSiteAudioMuted(false);
      } else {
        a.pause();
        setSiteAudioMuted(true);
      }
      setShowToast(false);
    } catch {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    }
  };

  // ---------- Author image fallback ----------
  const [showAuthorImg, setShowAuthorImg] = useState(true);

  return (
    <div className="bg-black text-gray-100">
      <Head>
        <title>About | Silver Spine Studio™</title>
        <meta name="description" content="About the author and the Silver Spine Studio™ world." />
        <style>{`
          :root { --header-h: 140px; --footer-h: 220px; }
          /* Trimmed middle so the global footer is fully visible */
          .page-frame { min-height: calc(100vh - var(--header-h) - var(--footer-h) - 96px); display: flex; flex-direction: column; }

          /* Starfield */
          #stars { position: fixed; inset: 0; z-index: 0; opacity: .28; pointer-events: none; }

          /* Links */
          .nav-link { color: #e5e7eb; }
          .nav-link:hover { color: ${GOLD}; }
          .nav-active { color: #b91c1c; font-weight: 600; }

          /* Nebula ribbons — tightened to pull footer up */
          .nebula { position: relative; width: 100%; background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg'); background-size: cover; background-position: center; filter: saturate(1.1) contrast(1.06); }
          .nebula-top    { height: 56px; }                  /* ↓ a bit more */
          .nebula-bottom { height: 36px; margin-top: -6px; }/* ↓ a bit more */

          .mask-top { -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); }
          .mask-bottom { -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); mask-image: linear-gradient(to top, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); }

          .letterbox-bar { position:absolute; left:0; right:0; height:6px; background: rgba(0,0,0,0.95); } /* thinner bars */
          .letterbox-bar.top-edge { bottom:0; }
          .letterbox-bar.bottom-edge { top:0; }

          /* Heading spacing tightened */
          .heading { text-align:center; color:${GOLD}; font-size:2.15rem; font-weight:800; line-height:1.18; margin:.1rem 0 0; letter-spacing:.02em; text-shadow:0 2px 12px rgba(0,0,0,.6); }
          .subheading { text-align:center; color:#f3e2b8; font-size:.95rem; font-style:italic; margin:.12rem 0 .45rem; }

          /* Card spacing tightened */
          .nebula-sheet { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,15,15,0.72); box-shadow: 0 20px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03); }
          .nebula-sheet::before { content:""; position:absolute; inset:0; background-image:url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg'); background-size:cover; background-position:center; opacity:.18; filter:saturate(1.05) contrast(1.0); }
          .nebula-sheet > .content { position:relative; }
          .card-wrap { padding: 12px 16px; } /* ↓ padding */
          .card-wrap + .controls-row { margin-top: .45rem; } /* tighter */

          .author-img { width:150px; height:150px; object-fit:cover; border-radius:9999px; border:2px solid rgba(255,255,255,0.16); box-shadow:0 10px 32px rgba(0,0,0,0.45); }

          .controls-row { display:flex; justify-content:center; gap:.6rem; margin-top:.45rem; margin-bottom:.15rem; }
          .chip { display:inline-flex; align-items:center; gap:.5rem; background: rgba(0,0,0,0.75); border: 1px solid rgba(167,122,35,0.45); border-radius: 999px; padding: 6px 12px; color: ${GOLD}; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
          .chip:hover { background: rgba(0,0,0,0.9); }
        `}</style>
      </Head>

      {/* ✨ Starfield */}
      <canvas id="stars" />

      {/* HEADER */}
    <header
  ref={headerRef}
  className="relative z-10 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#c9ced6]/25"
>
  <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
    <Link
      href="/"
      className="flex items-center gap-3 md:gap-4 group"
      aria-label="Silver Spine Studio — Home"
    >
      {logoSrc && !useTextLogo ? (
        <img
          src={logoSrc}
          alt="Silver Spine Studio logo"
          className="h-[88px] md:h-[108px] lg:h-[122px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(238,242,247,0.22)]"
          draggable="false"
        />
      ) : (
        <span
          className="text-2xl md:text-3xl font-extrabold"
          style={{
            color: "#eef2f7",
            textShadow:
              "0 0 10px rgba(201,206,214,0.20), 0 2px 10px rgba(0,0,0,0.82)",
          }}
        >
          Silver Spine Studio
          <span className="align-super text-base md:text-lg">™</span>
        </span>
      )}

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

    <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/books" className="nav-link">Books</Link>
      <Link href="/about" className="nav-active" aria-current="page">
        About
      </Link>
      <Link href="/contact" className="nav-link">Contact</Link>
      <Link href="/blog" className="nav-link">Blog</Link>
      <Link href="/reviews" className="nav-link">Reviews</Link>
      <Link href="/books#featured-book" className="nav-link">Shop</Link>
    </nav>
  </div>
</header>

      {/* TOP NEBULA (tight) */}
      <div className="nebula nebula-top mask-top relative z-10">
        <div className="letterbox-bar top-edge" />
      </div>

      {/* ===== Between header and footer (no local footer below) ===== */}
      <div className="page-frame relative z-10">
        {/* HEADING */}
        <section className="relative max-w-6xl mx-auto w-full px-4 md:px-6 pt-1">
          <div className="text-center">
          <h1
  className="heading"
  style={{
    color: "#eef2f7",
    textShadow:
      "0 0 10px rgba(201,206,214,0.20), 0 2px 10px rgba(0,0,0,0.82)",
  }}
>
  About the Author
</h1>
            <p className="subheading">A life built from storms, stories, and staying power.</p>
          </div>
        </section>

       {/* MAIN — bio */}
 <main className="px-6 pb-0 text-center max-w-7xl mx-auto w-full pt-2">
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

     {/* YOUR EXACT ABOUT SECTION (Shifted to 7 Columns to make room on the side) */}
     <div className="lg:col-span-7">
       <div className="nebula-sheet mt-1 mb-1">
         <div className="content card-wrap">
           {showAuthorImg && (
             <div className="flex justify-center mb-4">
               <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-2" style={{ borderColor: GOLD }}>
                 <img
                   src="/author.jpg"
                   alt="Leameso James"
                   className="object-cover w-full h-full"
                   onError={() => setShowAuthorImg(false)}
                   draggable="false"
                 />
               </div>
             </div>
           )}
           {/* --- YOUR EXACT UNTOUCHED BIO COPY --- */}
           <div className="max-w-3xl mx-auto text-left text-[1rem] leading-7 space-y-5">
             <p>
               <span className="font-semibold" style={{ color: GOLD }}>Leameso James</span>,
               born in Newark, New Jersey and raised in Tuskegee, Alabama, has always been drawn to
               stories that feel cinematic and human. Not darkness for its own sake—but the places where
               courage is forged, where love and conscience light the way through the storm.
             </p>
             <p>
               What compels her isn’t only conflict, but the delicate span between ache and answer—the
               moment a character chooses whether to harden or to hope. She writes toward that tension:
               the human spirit meeting the night with a steady flame, fighting in both the dark and the light.
             </p>
             <p>
               Currently completing her studies in <span className="font-semibold">Cybersecurity at the University of Phoenix</span>,
               James grounds her work in faith. She openly acknowledges God as her source, her guide, and her
               anchor—grace that steadies the hand, sharpens the craft, and keeps the compass true when the winds rise.
             </p>
             <p>
               With that foundation, she has stepped fully into her calling as an
               <span className="font-semibold"> author and content creator</span>, establishing{" "}
               <span className="font-semibold">Silver Spine Studio</span><span className="align-super text-xs">™</span> as a home for elegant, high-impact narratives.
               These are stories unafraid of shadow, yet intent on revealing what endures—mercy, loyalty,
               sacrificial love—the light that survives the rain.
             </p>
             <p>
               She believes in the human spirit’s capacity to rise. We bend, and some of us break, but breaking is
               not the end; it is where the mending begins. Triumph here isn’t a tidy bow—it’s the decision not to give up,
               to fight forward with courage, to let love do its quiet, stubborn work. That’s the pulse on every page.
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* THE NEW SALES BOX PLACED EXACTLY ON THE SIDE (Spans 5 Columns) */}
     <div className="lg:col-span-5 lg:sticky lg:top-24 bg-gradient-to-b from-gray-950 to-black border border-[#a77a23]/30 p-6 rounded-2xl shadow-2xl text-left space-y-4">
       <div className="text-center space-y-1">
         <span className="text-[#a77a23] text-xs font-bold uppercase tracking-widest block">Limited Preview Event</span>
         <h3 className="text-xl font-extrabold text-white tracking-tight">The Beautiful Beast</h3>
         <p className="text-xs text-gray-400 italic">Prologue + Chapters 1–2</p>
       </div>

       <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[0.95rem] text-gray-200 leading-relaxed">
         <p className="mb-2">🚨 <span className="text-white font-semibold">Insider Privilege:</span> Download the instant digital sneak peek today for just <span className="text-[#a77a23] font-bold">$4.99</span>.</p>
         <p>Purchasing today whitelists your email in our database ledger, locking in your discounted <span className="text-white font-bold">$14.99 release-day preorder rate</span> for the full book on September 1st!</p>
       </div>

       <div className="pt-2 space-y-3">
         {SNEAK_PEEK_STORES.map((store) => (
           <a
             key={store.key}
             href={store.href}
             target="_blank"
             rel="noopener noreferrer"
             className="w-full inline-flex items-center justify-center gap-2 font-bold tracking-wide text-black bg-[#a77a23] hover:bg-[#c49231] transform hover:-translate-y-0.5 transition-all duration-200 text-center py-3.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(167,122,35,0.4)] text-sm"
           >
             📖 {SNEAK_PEEK_STORES.length > 1 ? store.label : "Claim the Extended Sneak Peek"}
           </a>
         ))}
       </div>

       {/* RESTORED THUNDER AUDIO CONTROLLER (Centered underneath checkout layout) */}
       <div className="flex justify-center pt-2">
         <button
           type="button"
           aria-label={siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
           onClick={toggleSiteAudio}
           className="chip"
           title={siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
         >
           {siteAudioMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
           {siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
         </button>
       </div>
     </div>

   </div>
 </main>


        {/* BOTTOM NEBULA (tight) */}
        <div className="nebula nebula-bottom mask-bottom relative">
          <div className="letterbox-bar bottom-edge" />
        </div>
      </div>

      {/* No local footer here — global Footer renders separately. */}

      {/* Optional toast if the browser blocks audio */}
      {showToast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm"
          style={{ background: "rgba(20,20,20,0.85)", color: GOLD, border: "1px solid rgba(167,122,35,0.35)", zIndex: 80 }}
        >
          Tap once to enable audio.
        </div>
      )}
    </div>
  );
}
