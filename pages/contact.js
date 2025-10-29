// /pages/contact.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function Contact() {
  const router = useRouter();
  const GOLD = "#a77a23";

  // ===== Measure header/footer so the GLOBAL footer stays in view (mirrors About) =====
  const headerRef = useRef(null);
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

  // ---------- Disc logo loader ----------
  const [logoSrc, setLogoSrc] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const CANDIDATES = [
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

  // ---------- Thunder audio (button under the form) ----------
  const audioRef = useRef(null);
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
    audioRef.current = el;
  }, []);
  const toggleSiteAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) {
        a.muted = false;
        a.volume = 0.12;
        if (a.readyState < 2) a.load();
        await a.play();
        setSiteAudioMuted(false);
      } else {
        a.pause();
        setSiteAudioMuted(true);
      }
    } catch { /* ignore */ }
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-black text-gray-100">
      <Head>
        <title>Contact | Silver Spine Studio™</title>
        <meta name="description" content="Get in touch with Silver Spine Studio™ — collaborations, book news, and more." />
        <style>{`
          :root { --header-h: 140px; --footer-h: 220px; }

          /* Frame that keeps the global footer visible (same math as About) */
          .page-frame {
            min-height: calc(100vh - var(--header-h) - var(--footer-h) - 96px);
            display: flex;
            flex-direction: column;
          }

          /* Nebula bands */
          .nebula {
            position: relative; width: 100%;
            background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg');
            background-size: cover; background-position: center;
            filter: saturate(1.1) contrast(1.06);
          }
          .nebula-top { height: 56px; }
          .mask-top { -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 82%, rgba(0,0,0,0)); }

          /* Bottom spacer band (placed between button and global footer) */
          .nebula-spacer {
            height: 52px;             /* a hair wider than before */
            margin-top: 18px;         /* more room from the button */
            background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg');
            background-size: cover; background-position: center;
            filter: saturate(1.1) contrast(1.06);
            /* NO letterbox bar here to avoid an extra black stripe */
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
          }

          /* Thin bar only on the TOP band (not on the spacer) */
          .letterbox-bar { position:absolute; left:0; right:0; height:6px; background: rgba(0,0,0,0.95); }
          .letterbox-bar.top-edge { bottom:0; }

          /* Panel */
          .panel {
            position: relative; border-radius: 20px; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(15,15,15,0.72);
            box-shadow: 0 20px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03);
          }
          .panel::before {
            content:""; position:absolute; inset:0;
            background-image:url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg');
            background-size:cover; background-position:center;
            opacity:.18; filter:saturate(1.05) contrast(1.0);
          }
          .panel > .content { position:relative; padding: 18px 18px; }

          /* Nav links like About */
          .nav-link { color: #e5e7eb; }
          .nav-link:hover { color: ${GOLD}; }
          .nav-active { color: #b91c1c; font-weight: 600; }
        `}</style>
      </Head>

      {/* HEADER (disc logo) */}
      <header
        ref={headerRef}
        className="relative z-10 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                className="h-[88px] md:h-[108px] lg:h-[122px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(167,122,35,0.25)]"
                draggable="false"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: GOLD }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
            <span className="hidden sm:inline text-xl md:text-2xl font-semibold tracking-wide" style={{ color: GOLD }}>
              Silver Spine Studio<span className="align-super text-sm md:text-base">™</span>
            </span>
          </Link>

          <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
            {links.map(({ href, label }) => {
              const active = router.asPath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={active ? "nav-active" : "nav-link"}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* TOP NEBULA (band) */}
      <div className="nebula nebula-top mask-top relative z-10">
        <div className="letterbox-bar top-edge" />
      </div>

      {/* CONTENT (reserves space so footer is visible; balanced vertically) */}
      <div className="page-frame relative z-10">
        <section className="relative max-w-6xl mx-auto w-full px-4 md:px-6 pt-2 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg" style={{ color: GOLD, letterSpacing: ".02em" }}>
            Get In Touch
          </h1>
          <p className="text-gray-200/90 max-w-2xl mx-auto mt-2">
            Whether it’s about <em>The Beautiful Beast</em>, upcoming releases, or collaborations —
            I’d love to hear from you. Fill out the form below, and I’ll get back as soon as I can.
          </p>
        </section>

        {/* Form panel */}
        <main className="px-6 pb-0 text-center">
          <section className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="panel mt-2 mb-2">
              <div className="content">
                <form action="https://formspree.io/f/mkgqvaby" method="POST" className="space-y-5 text-left">
                  <div>
                    <label className="block mb-2 text-gray-300">Name</label>
                    <input type="text" name="name" required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-300">Email</label>
                    <input type="email" name="_replyto" required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-300">Message</label>
                    <textarea name="message" rows="5" required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300" placeholder="Write your message here..." />
                  </div>
                  <input type="hidden" name="_subject" value="New message from SilverSpineStudio.com" />
                  <button type="submit" className="w-full py-3 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 transition">Send Message</button>
                </form>
              </div>
            </div>

            {/* Thunder control — directly under the panel */}
            <div className="flex justify-center mt-2 mb-1">
              <button
                type="button"
                onClick={toggleSiteAudio}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(0,0,0,0.75)", color: GOLD, border: "1px solid rgba(167,122,35,0.45)", boxShadow: "0 6px 24px rgba(0,0,0,0.45)" }}
                aria-label={siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
                title={siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
              >
                {siteAudioMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                {siteAudioMuted ? "Click to hear thunder" : "Click to turn thunder off"}
              </button>
            </div>
          </section>
        </main>

        {/* NEBULA SPACER (between button and footer; no letterbox to avoid black stripe) */}
        <div className="nebula-spacer" />
      </div>
    </div>
  );
}
