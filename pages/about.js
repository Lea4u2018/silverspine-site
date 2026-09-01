// /pages/about.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import StormAtmosphere from "@/components/StormAtmosphere";
import StoreHub from "@/components/StoreHub";
import { buildAboutPageSchema, PUBLIC_AUTHOR_NAME, SITE_ORIGIN } from "@/lib/authorIdentity";
import { NOVEL_PRICING, PREORDER_STATUS } from "@/lib/store";

export default function About() {
  const GOLD = "#dfcfb5";

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

  // ---------- Author image / motion portrait ----------
  const [showAuthorImg, setShowAuthorImg] = useState(true);
  const [useAuthorMotion, setUseAuthorMotion] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/author-motion.mp4", { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setUseAuthorMotion(r.ok);
      })
      .catch(() => {
        if (!cancelled) setUseAuthorMotion(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="text-gray-100">
      <Head>
        <title>About {PUBLIC_AUTHOR_NAME} | Silver Spine Studio™</title>
        <meta
          name="description"
          content={`About ${PUBLIC_AUTHOR_NAME} — author of The Beautiful Beast and the Seven-Fold Chronicle at Silver Spine Studio™.`}
        />
        <meta name="author" content={PUBLIC_AUTHOR_NAME} />
        <link rel="canonical" href={`${SITE_ORIGIN}/about`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAboutPageSchema()) }}
        />
        <style>{`
          :root { --header-h: 56px; --footer-h: 136px; }
          html, body { height: auto !important; overflow-x: clip; overflow-y: auto !important; }
          #__next { height: auto; overflow: visible; }
          .page-frame {
            display: flex;
            flex-direction: column;
            overflow: visible;
          }
          .about-heading {
            padding-top: 0;
            margin-top: -4.25rem;
          }
          .heading { text-align:center; color:${GOLD}; font-size:2.15rem; font-weight:800; line-height:1.18; margin:0; letter-spacing:.02em; text-shadow:0 2px 12px rgba(0,0,0,.6); }
          .subheading { text-align:center; color:#f3e2b8; font-size:.95rem; font-style:italic; margin:.12rem 0 1.35rem; }
          .about-bio-scroll {
            height: 40rem;
            max-height: 40rem;
            overflow-x: hidden;
            overflow-y: auto;
            padding-right: 0.5rem;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: #dfcfb5 #111;
          }
          .about-bio-scroll::-webkit-scrollbar { width: 10px; }
          .about-bio-scroll::-webkit-scrollbar-thumb { background: #dfcfb5; border-radius: 8px; }

          /* Soft live motion until CapCut author-motion.mp4 is dropped in */
          @keyframes authorPortraitBreathe {
            0%, 100% { transform: scale(1.04) translate3d(0, 1%, 0); }
            50% { transform: scale(1.1) translate3d(0, -1.5%, 0); }
          }
          .author-portrait-still {
            transform-origin: 50% 35%;
            animation: authorPortraitBreathe 8s ease-in-out infinite;
            will-change: transform;
          }
          @media (prefers-reduced-motion: reduce) {
            .author-portrait-still { animation: none; }
          }

          /* Starfield under the storm */
          #stars { position: fixed; inset: 0; z-index: 0; opacity: .22; pointer-events: none; }

          /* Soft lightning bed — behind bio, not over text */
          .about-storm-bed {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            overflow: hidden;
          }
          /* Base lightning bed — same overall room light; bolts pushed silver/white */
          .about-storm-bed video {
            position: absolute;
            inset: -8%;
            width: 116%;
            height: 116%;
            object-fit: cover;
            opacity: 0.34;
            filter: saturate(0.25) contrast(1.28) brightness(0.74);
            -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 42%, transparent 28%, #000 78%);
                    mask-image: radial-gradient(ellipse 70% 65% at 50% 42%, transparent 28%, #000 78%);
          }
          /* Bolt punch layer — high-contrast silver forks only (screen blend keeps darks quiet) */
          .about-storm-bed video.about-storm-bolts {
            opacity: 0.62;
            mix-blend-mode: screen;
            filter: saturate(0) contrast(2.2) brightness(0.68) grayscale(1);
          }
          .about-rain {
            position: absolute;
            inset: 0;
            background-image: repeating-linear-gradient(
              -18deg,
              transparent 0 14px,
              rgba(200, 220, 245, 0.045) 14px 15px
            );
            animation: about-rain-drift 1.1s linear infinite;
            opacity: 0.55;
            -webkit-mask-image: radial-gradient(ellipse 55% 60% at 50% 40%, transparent 25%, #000 85%);
                    mask-image: radial-gradient(ellipse 55% 60% at 50% 40%, transparent 25%, #000 85%);
          }
          @keyframes about-rain-drift {
            from { transform: translate3d(0, -12px, 0); }
            to   { transform: translate3d(-8px, 18px, 0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .about-storm-bed video,
            .about-storm-bed video.about-storm-bolts,
            .about-rain { display: none !important; }
          }

          /* Links */
          .nav-link { color: #e5e7eb; }
          .nav-link:hover { color: ${GOLD}; }
          .nav-active { color: #b91c1c; font-weight: 600; }

          /* Heading spacing tightened */

          /* Card spacing tightened */
          .nebula-sheet {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(15,15,15,0.78);
            box-shadow: 0 20px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03);
          }
          .nebula-sheet > .content { position:relative; }
          .card-wrap { padding: 12px 16px; } /* ↓ padding */
          .card-wrap + .controls-row { margin-top: .45rem; } /* tighter */

          .author-img { width:150px; height:150px; object-fit:cover; border-radius:9999px; border:2px solid rgba(255,255,255,0.16); box-shadow:0 10px 32px rgba(0,0,0,0.45); }

          .controls-row { display:flex; justify-content:center; gap:.6rem; margin-top:.45rem; margin-bottom:.15rem; }
          .chip { display:inline-flex; align-items:center; gap:.5rem; background: rgba(0,0,0,0.75); border: 1px solid rgba(167,122,35,0.45); border-radius: 999px; padding: 6px 12px; color: ${GOLD}; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
          .chip:hover { background: rgba(0,0,0,0.9); }
        `}</style>
      </Head>

      {/* Starfield + lightning/rain bed */}
      <canvas id="stars" />
      <div className="about-storm-bed" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          ref={(el) => {
            if (el) el.playbackRate = 0.55;
          }}
        >
          <source src="/storm-lightning.mp4" type="video/mp4" />
        </video>
        <video
          className="about-storm-bolts"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          ref={(el) => {
            if (el) el.playbackRate = 0.55;
          }}
        >
          <source src="/storm-lightning.mp4" type="video/mp4" />
        </video>
        <div className="about-rain" />
      </div>

      <StormAtmosphere mood="author" />

      {/* ===== Between header and footer (no local footer below) ===== */}
      <div className="page-frame relative z-10">
        {/* HEADING */}
        <section className="about-heading relative max-w-[1140px] mx-auto w-full px-4 md:px-6 text-center">
          <h1
            className="heading mx-auto w-full text-center"
            style={{
              color: "#eef2f7",
              textShadow:
                "0 0 10px rgba(201,206,214,0.20), 0 2px 10px rgba(0,0,0,0.82)",
            }}
          >
            About the Author
          </h1>
          <p className="subheading mx-auto w-full text-center">
            A life built from storms, stories, and staying power.
          </p>
        </section>

       {/* MAIN — bio */}
 <main className="about-main px-6 pb-16 text-center max-w-[1140px] mx-auto w-full pt-3">
   <div className="about-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

     {/* YOUR EXACT ABOUT SECTION (Shifted to 7 Columns to make room on the side) */}
     <div className="about-bio-col lg:col-span-7">
       <div className="nebula-sheet mt-1 mb-1">
         <div className="content card-wrap">
           {showAuthorImg && (
             <div className="flex justify-center mb-3">
               <div
                 className="author-portrait-ring w-[150px] h-[150px] rounded-full overflow-hidden border-2"
                 style={{ borderColor: GOLD }}
               >
                 {useAuthorMotion ? (
                   <video
                     className="object-cover w-full h-full"
                     autoPlay
                     muted
                     loop
                     playsInline
                     preload="metadata"
                     poster="/author.jpg"
                     aria-label="Leameso James"
                     onError={() => setUseAuthorMotion(false)}
                   >
                     <source src="/author-motion.mp4" type="video/mp4" />
                   </video>
                 ) : (
                   <img
                     src="/author.jpg"
                     alt="Leameso James"
                     className="author-portrait-still object-cover w-full h-full"
                     onError={() => setShowAuthorImg(false)}
                     draggable="false"
                   />
                 )}
               </div>
             </div>
           )}
           {/* --- YOUR EXACT UNTOUCHED BIO COPY --- */}
           <div className="about-bio-scroll max-w-3xl mx-auto text-left text-[1rem] leading-7 space-y-5">
             <p>
               <span className="font-semibold" style={{ color: GOLD }}>Leameso James</span>,
               born in Newark, New Jersey, and raised in Tuskegee, Alabama, has always been drawn to
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
     <div className="lg:col-span-5 lg:sticky lg:top-24 bg-gradient-to-b from-gray-950 to-black border border-[#dfcfb5]/30 p-6 rounded-2xl shadow-2xl text-left space-y-4">
       <div className="text-center space-y-1">
         <span className="text-[#dfcfb5] text-xs font-bold uppercase tracking-widest block">Limited Preview Event</span>
         <h3 className="text-xl font-extrabold text-white tracking-tight">The Beautiful Beast</h3>
         <p className="text-xs text-gray-400 italic">Prologue + Chapters 1–2</p>
       </div>

       <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[0.95rem] text-gray-200 leading-relaxed">
         <p className="mb-2 text-white font-semibold">Welcome in — thank you for stopping by.</p>
         <p className="mb-3">
           The <span className="text-white font-semibold">Extended Sneak Peek</span> (Prologue &amp; Chapters 1–2) is{" "}
           <span className="text-[#dfcfb5] font-bold">{NOVEL_PRICING.sneakPeek}</span>. That purchase places you on the{" "}
           <span className="text-[#dfcfb5] font-bold">Insider Deal</span> whitelist for the discounted full DIGITAL copy.
         </p>
         <p className="mb-3 text-amber-100/95 border border-amber-500/35 bg-amber-950/25 rounded-lg px-3 py-2 text-sm">
           {PREORDER_STATUS.headline}
         </p>
         <p>
           Full DIGITAL Insider preorder: <span className="text-white font-bold">{NOVEL_PRICING.digitalPreorderStartLabel} – {NOVEL_PRICING.digitalPreorderEndLabel}</span> at{" "}
           <span className="text-[#dfcfb5] font-bold">{NOVEL_PRICING.insider}</span> for whitelisted readers.
           Hardcover {NOVEL_PRICING.hardcover} from <span className="text-white font-bold">{NOVEL_PRICING.hardcoverOrderFromLabel}</span>.
           Paperback {NOVEL_PRICING.paperback}. Digital retail <span className="text-white font-bold">{NOVEL_PRICING.retail}</span> from {NOVEL_PRICING.releaseLabel}.
         </p>
       </div>

       <div className="pt-2 space-y-3">
         <StoreHub variant="compact" liveOnly />
         <Link
           href="/shop"
           className="w-full inline-flex items-center justify-center gap-2 font-semibold tracking-wide text-[#dfcfb5] border border-[#dfcfb5]/45 hover:bg-[#dfcfb5]/10 transition-all duration-200 text-center py-3 px-6 rounded-xl text-sm"
         >
           Full store hub · coming soon doors
         </Link>
       </div>

     </div>

   </div>
 </main>
      </div>

      {/* No local footer here — global Footer renders separately. */}
    </div>
  );
}
