import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { NAV_LINKS, isNavActive } from "@/lib/nav";
import { NOVEL_PRICING, SNEAK_PEEK_STORES } from "@/lib/store";

const GOLD = "#a77a23";
const SILVER = "#c9ced6";

const STATUS_COPY = {
  live: "Available now",
  soon: "Coming soon",
  review: "In review",
};

export default function Shop() {
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
        <title>Shop | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Buy The Beautiful Beast Extended Sneak Peek — choose your storefront and go straight to checkout."
        />
        <style>{`
          :root { --header-h: 140px; --footer-h: 72px; }
          .shop-frame {
            min-height: calc(100vh - var(--header-h) - var(--footer-h));
          }
          .nebula {
            position: relative;
            width: 100%;
            background-image: url('/FB_Cover_Nebula_DarkerShadows_fix_1640x624.jpg');
            background-size: cover;
            background-position: center;
            filter: saturate(1.15) contrast(1.1);
          }
          .nebula-top { height: 48px; }
          .nebula-bottom { height: 88px; margin-top: -12px; }
          .mask-top {
            -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
            mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
          }
          .mask-bottom {
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 86%, rgba(0,0,0,0));
          }
          @keyframes shopRise {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .shop-rise { animation: shopRise 0.7s ease both; }
          .shop-rise-delay { animation-delay: 0.12s; }
          .store-live:hover {
            transform: translateY(-2px);
            border-color: rgba(167,122,35,0.65);
            box-shadow: 0 10px 28px rgba(167,122,35,0.18);
          }
        `}</style>
      </Head>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#a77a23]/30"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group" aria-label="Silver Spine Studio — Home">
            {logoSrc && !useTextLogo ? (
              <img
                src={logoSrc}
                alt="Silver Spine Studio logo"
                className="h-[88px] md:h-[100px] lg:h-[112px] w-auto select-none shrink-0 drop-shadow-[0_6px_18px_rgba(201,206,214,0.28)]"
                draggable="false"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold" style={{ color: SILVER }}>
                Silver Spine Studio<span className="align-super text-base md:text-lg">™</span>
              </span>
            )}
          </Link>
          <nav className="flex items-center gap-5 md:gap-6 text-sm md:text-base">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isNavActive(router.pathname, router.asPath, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`transition ${
                    active ? "text-red-500 font-semibold" : "text-gray-200 hover:text-[#a77a23]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="nebula nebula-top mask-top" aria-hidden="true" />

      <main className="shop-frame relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="shop-rise text-center mb-8 md:mb-10">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.28em] mb-3" style={{ color: GOLD }}>
            Silver Spine Studio™ Shop
          </p>
          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{ textShadow: "0 0 10px rgba(201,206,214,0.18), 0 2px 10px rgba(0,0,0,0.82)" }}
          >
            Choose your door in.
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Pick a storefront below. Live options open checkout immediately. The rest unlock as soon as their listings clear.
          </p>
        </div>

        <section
          className="shop-rise shop-rise-delay rounded-2xl border border-white/10 bg-black/50 p-5 md:p-8 shadow-2xl"
          aria-label="The Beautiful Beast Extended Sneak Peek"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            <div className="md:col-span-4">
              <div className="aspect-[2/3] max-w-[240px] mx-auto md:mx-0 overflow-hidden rounded-xl border border-white/10 shadow-xl bg-gray-950">
                <video
                  src="/covers/1-the-beautiful-beast-motion.mp4"
                  poster="/covers/1-the-beautiful-beast-full-tagged.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="The Beautiful Beast live cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-5">
              <div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  The Beautiful Beast
                </h2>
                <p className="text-[#a77a23] text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
                  Extended Sneak Peek · {NOVEL_PRICING.sneakPeek}
                </p>
                <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
                  Unedited Prologue + Chapters 1–2. Buy the sneak peek today and whitelist your email for the{" "}
                  <span className="text-white font-semibold">{NOVEL_PRICING.insider} insider pre-order rate</span>.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs md:text-sm text-gray-300 leading-relaxed">
                <p className="font-semibold text-white mb-1">Copyright &amp; license</p>
                <p>
                  © {new Date().getFullYear()} Silver Spine Studio™ / Leameso James. All rights reserved.
                  Purchase grants a personal, non-transferable license to read the sneak peek.
                  Files may not be copied, uploaded, resold, or shared. Buyer-stamped PDFs help deter unauthorized distribution.
                </p>
              </div>

              <div className="rounded-xl border border-[#a77a23]/35 bg-[#a77a23]/10 px-4 py-3 text-sm text-gray-200 leading-relaxed">
                <p className="font-semibold text-white mb-1">Full novel pricing · hard cutoff</p>
                <ul className="space-y-1.5 text-xs md:text-sm">
                  <li>
                    <span className="text-[#a77a23] font-bold">{NOVEL_PRICING.insider}</span> — insider rate for sneak-peek buyers from{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.insiderStartLabel}</span> through{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.insiderEndLabel}</span>
                  </li>
                  <li>
                    <span className="text-white font-bold">{NOVEL_PRICING.retail}</span> — full retail price starting{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.retailFromLabel}</span>{" "}
                    (and for anyone outside the whitelist)
                  </li>
                  <li className="text-gray-400">
                    Official release: <span className="text-gray-300">{NOVEL_PRICING.releaseLabel}</span>
                    {" · "}
                    <Link href="/blog" className="text-[#a77a23] hover:underline">
                      See full launch timeline on Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3" role="list" aria-label="Available storefronts">
                {SNEAK_PEEK_STORES.map((store) => {
                  const isLive = store.status === "live" && store.href;
                  const status = STATUS_COPY[store.status] || store.status;

                  if (isLive) {
                    return (
                      <a
                        key={store.key}
                        href={store.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="listitem"
                        className="store-live block w-full rounded-xl border border-[#a77a23]/45 bg-[#a77a23] text-black px-5 py-4 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-left">
                            <p className="font-extrabold text-base md:text-lg tracking-wide">
                              Buy on {store.label}
                            </p>
                            <p className="text-xs md:text-sm text-black/75 mt-0.5">{store.description}</p>
                          </div>
                          <span className="shrink-0 text-xs font-bold uppercase tracking-widest bg-black/15 px-2.5 py-1 rounded-md">
                            {status}
                          </span>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <div
                      key={store.key}
                      role="listitem"
                      aria-disabled="true"
                      className="block w-full rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 px-5 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-left">
                          <p className="font-semibold text-base md:text-lg tracking-wide text-gray-300">
                            {store.label}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{store.description}</p>
                        </div>
                        <span className="shrink-0 text-xs font-bold uppercase tracking-widest border border-white/15 px-2.5 py-1 rounded-md text-gray-400">
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Prefer the series page?{" "}
                <Link href="/books#featured-book" className="text-[#a77a23] hover:underline">
                  View the trailer on Books
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="nebula nebula-bottom mask-bottom" aria-hidden="true" />
    </div>
  );
}
