import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";

const GOLD = "#a77a23";
const SILVER = "#c9ced6";

/**
 * Shared shell for Privacy / FAQ / Refunds — one calm reading composition.
 */
export default function InfoPageShell({ title, description, eyebrow, tone, children }) {
  const router = useRouter();
  const headerRef = useRef(null);
  const [logoSrc, setLogoSrc] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);

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
    window.addEventListener("resize", setVars);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", setVars);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const CANDIDATES = [
      "/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png",
      "/SilverSpine_FB_Profile_CircleDisc_1024.png",
      "/SilverSpine_FB_Profile_1024.png",
    ];
    const tryLoad = (i = 0) => {
      if (i >= CANDIDATES.length) {
        if (!cancelled) setUseTextLogo(true);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setLogoSrc(CANDIDATES[i]);
      };
      img.onerror = () => tryLoad(i + 1);
      img.src = CANDIDATES[i] + `?v=${Date.now()}`;
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-black text-gray-100 min-h-screen">
      <Head>
        <title>{title} | Silver Spine Studio™</title>
        <meta name="description" content={description} />
        <style>{`
          :root { --header-h: 140px; --footer-h: 72px; }
          .info-frame { min-height: calc(100vh - var(--header-h) - var(--footer-h)); }
          .nebula {
            position: relative;
            width: 100%;
            background-image: url('/FB_Cover_Nebula_DarkerShadows_Fix_1640x624.jpg');
            background-size: cover;
            background-position: center;
            filter: saturate(1.12) contrast(1.08);
          }
          .nebula-top { height: 40px; }
          .nebula-bottom { height: 72px; margin-top: -8px; }
          .mask-top {
            -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
            mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
          }
          .mask-bottom {
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
          }
          .info-prose h2 {
            color: ${GOLD};
            font-size: 1.05rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin: 1.75rem 0 0.65rem;
          }
          .info-prose.tone-faq h2 {
            color: #d4a94a;
          }
          .info-prose p, .info-prose li {
            color: #d1d5db;
            line-height: 1.65;
            font-size: 0.95rem;
          }
          .info-prose ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0 0; }
          .info-prose li + li { margin-top: 0.35rem; }
          .info-prose a { color: ${GOLD}; text-decoration: underline; text-underline-offset: 2px; }
          .info-prose.tone-faq a {
            color: #ffffff;
          }
          .info-prose.tone-faq a:hover {
            color: ${GOLD};
          }
          .faq-item {
            border-top: 1px solid rgba(255,255,255,0.08);
            padding: 0.85rem 0;
          }
          .faq-item:last-child { border-bottom: 1px solid rgba(255,255,255,0.08); }
          .faq-item summary {
            cursor: pointer;
            list-style: none;
            color: ${GOLD};
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
          }
          .faq-item summary::-webkit-details-marker { display: none; }
          .faq-item summary::after {
            content: "+";
            color: ${GOLD};
            font-weight: 800;
            font-size: 1.15rem;
            line-height: 1;
          }
          .faq-item[open] summary::after { content: "–"; }
          .faq-item p {
            margin-top: 0.55rem;
            color: #ffffff !important;
          }
        `}</style>
      </Head>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                className="h-[72px] md:h-[88px] w-auto select-none shrink-0"
                draggable="false"
              />
            ) : (
              <span className="text-xl md:text-2xl font-extrabold" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-sm">™</span>
              </span>
            )}
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-4 md:gap-6 text-sm md:text-base">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isNavActive(router.pathname, router.asPath, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`transition ${active ? "text-red-500 font-semibold" : "text-gray-200 hover:text-[#a77a23]"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="info-frame relative z-0">
        <div className="nebula nebula-top mask-top" aria-hidden="true" />
        <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.28em] mb-3" style={{ color: GOLD }}>
            {eyebrow || "Silver Spine Studio™"}
          </p>
          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3"
            style={{ textShadow: "0 0 10px rgba(201,206,214,0.16), 0 2px 10px rgba(0,0,0,0.82)" }}
          >
            {title}
          </h1>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-7 max-w-2xl">
            {description}
          </p>
          <div
            className={`rounded-2xl border border-white/10 bg-black/55 p-5 md:p-8 shadow-2xl info-prose${
              tone === "faq" ? " tone-faq" : ""
            }`}
          >
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">
            Questions?{" "}
            <Link href="/contact" className="text-[#a77a23] hover:underline">
              Contact us
            </Link>
          </p>
        </main>
        <div className="nebula nebula-bottom mask-bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
