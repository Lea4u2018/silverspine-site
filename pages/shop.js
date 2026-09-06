import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NOVEL_PRICING, PREORDER_STATUS, SNEAK_PEEK_PRODUCT_COPY, LAUNCH_COUNTDOWN_MATRIX } from "@/lib/store";
import LaunchListForm from "@/components/LaunchListForm";
import LaunchMilestoneCountdown from "@/components/LaunchMilestoneCountdown";
import StormAtmosphere from "@/components/StormAtmosphere";
import StoreHub from "@/components/StoreHub";

const GOLD = "#dfcfb5";
const SILVER = "#c9ced6";

export default function Shop() {
  const [countdownMatrix, setCountdownMatrix] = useState(LAUNCH_COUNTDOWN_MATRIX);
  const [activePromos, setActivePromos] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/promo/active");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.codes)) {
          setActivePromos(data.codes);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/launch/public");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.countdownMatrix) && data.countdownMatrix.length) {
          setCountdownMatrix(data.countdownMatrix);
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="text-gray-100 min-h-screen">
      <Head>
        <title>Shop | Silver Spine Studio™</title>
        <meta
          name="description"
          content="Buy The Beautiful Beast Extended Sneak Peek — choose your storefront and go straight to checkout."
        />
        <style>{`
          :root { --header-h: 56px; --footer-h: 136px; }
          .shop-frame {
            min-height: calc(100vh - var(--header-h) - var(--footer-h));
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
          .shop-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
            border-bottom: 1px solid rgba(255,255,255,0.12);
            margin-bottom: 1.25rem;
          }
          .shop-tab {
            appearance: none;
            border: 0;
            background: transparent;
            color: #dfcfb5;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            font-size: 0.72rem;
            padding: 0.7rem 1rem 0.85rem;
            border-bottom: 2px solid transparent;
            margin-bottom: -1px;
            cursor: pointer;
            transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          }
          .shop-tab:hover {
            color: #111;
            background: #c5a059;
            border-bottom-color: #c5a059;
          }
          .shop-tab[aria-selected="true"] {
            color: #111;
            background: #dfcfb5;
            border-bottom-color: #dfcfb5;
          }
          .shop-tab[aria-selected="true"]:hover {
            background: #c5a059;
            border-bottom-color: #c5a059;
          }
          @media (min-width: 768px) {
            .shop-tab { font-size: 0.8rem; letter-spacing: 0.18em; padding: 0.8rem 1.15rem 0.95rem; }
          }

          /* Crisp white lightning bed behind shop content */
          .shop-storm-bed {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            overflow: hidden;
          }
          .shop-storm-bed video {
            position: absolute;
            inset: -12%;
            width: 124%;
            height: 124%;
            object-fit: cover;
            object-position: center center;
            opacity: 0.3;
            filter: saturate(0.15) contrast(1.35) brightness(0.7);
            /* Wider, softer edge so lightning flashes don’t leave a hard black band */
            -webkit-mask-image: radial-gradient(ellipse 92% 78% at 50% 42%, transparent 18%, #000 88%);
                    mask-image: radial-gradient(ellipse 92% 78% at 50% 42%, transparent 18%, #000 88%);
          }
          .shop-storm-bed video.shop-storm-bolts {
            opacity: 0.7;
            mix-blend-mode: screen;
            filter: saturate(0) contrast(2.4) brightness(0.75) grayscale(1);
          }
          @media (prefers-reduced-motion: reduce) {
            .shop-storm-bed video { display: none !important; }
          }
        `}</style>
      </Head>

      <div className="shop-storm-bed" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          ref={(el) => {
            if (el) el.playbackRate = 0.52;
          }}
        >
          <source src="/storm-lightning.mp4" type="video/mp4" />
        </video>
        <video
          className="shop-storm-bolts"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          ref={(el) => {
            if (el) el.playbackRate = 0.52;
          }}
        >
          <source src="/storm-lightning.mp4" type="video/mp4" />
        </video>
      </div>

      <LaunchMilestoneCountdown linked={false} />

      <StormAtmosphere mood="ember" />

      <main className="shop-frame relative z-10 max-w-[1140px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="shop-rise text-center mb-8 md:mb-10">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.28em] mb-3" style={{ color: GOLD }}>
            Silver Spine Studio™ Shop
          </p>
          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{ textShadow: "0 0 10px rgba(201,206,214,0.18), 0 2px 10px rgba(0,0,0,0.82)" }}
          >
            Where to buy
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Open the <span className="text-white font-semibold">Where to BUY</span> tab and choose your store. Live doors go straight to checkout. Grey doors unlock as more retailers finish publishing.
          </p>
        </div>

        {activePromos.length ? (
          <div className="shop-rise shop-rise-delay mb-6 rounded-xl border border-emerald-400/35 bg-emerald-950/25 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">Active offer</p>
            {activePromos.map((p) => (
              <p key={p.code} className="text-sm text-gray-200">
                Use code{" "}
                <strong className="font-mono text-[#dfcfb5] tracking-wide">{p.code}</strong> at checkout — {p.summary}
                {p.expiresAt ? (
                  <span className="text-gray-500"> · through {new Date(p.expiresAt).toLocaleDateString()}</span>
                ) : null}
              </p>
            ))}
          </div>
        ) : null}

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
                <p className="text-[#dfcfb5] text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
                  Extended Sneak Peek · {NOVEL_PRICING.sneakPeek}
                </p>
                <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
                  {SNEAK_PEEK_PRODUCT_COPY.intro}
                </p>
                <div className="mt-4 rounded-xl border border-[#dfcfb5]/40 bg-[#dfcfb5]/10 px-4 py-3 text-sm text-gray-200 leading-relaxed">
                  <p className="font-semibold text-[#dfcfb5] mb-2">Exclusive Insider perk</p>
                  <p>{SNEAK_PEEK_PRODUCT_COPY.insiderPerk}</p>
                  <p className="mt-2 text-white font-semibold">{SNEAK_PEEK_PRODUCT_COPY.hardcoverNote}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-gray-200 leading-relaxed">
                <p className="font-semibold text-white mb-3 uppercase tracking-wide text-xs">The Launch Countdown Matrix</p>
                <ul className="space-y-2.5">
                  {countdownMatrix.map((row) => (
                    <li key={row.title} className="flex gap-2">
                      <span aria-hidden="true">{row.icon}</span>
                      <span>
                        <span className="text-white font-semibold">{row.when}</span>
                        {" — "}
                        {row.title}
                        {row.note ? (
                          <>
                            {" "}
                            <span className="text-gray-400">({row.note})</span>
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-300 italic">{SNEAK_PEEK_PRODUCT_COPY.holidayNote}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs md:text-sm text-gray-300 leading-relaxed">
                <p className="font-semibold text-white mb-1">Copyright &amp; purchase terms</p>
                <p>
                  © {new Date().getFullYear()} Silver Spine Studio™ / Leameso James. All rights reserved.
                  The work is protected by U.S. copyright. Purchase grants personal reading access only — not copyright ownership.
                  Files may not be copied, uploaded, resold, or shared. Digital sales are final after download/access.{" "}
                  <Link href="/refunds" className="text-[#dfcfb5] hover:underline">
                    Refund Policy
                  </Link>
                  {" · "}
                  <Link href="/faq" className="text-[#dfcfb5] hover:underline">
                    FAQ
                  </Link>
                  .
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100 leading-relaxed">
                <p className="font-semibold text-white mb-1">{PREORDER_STATUS.headline}</p>
                <p>{PREORDER_STATUS.detail}</p>
              </div>

              <div className="rounded-xl border border-[#dfcfb5]/35 bg-[#dfcfb5]/10 px-4 py-3 text-sm text-gray-200 leading-relaxed text-center">
                <p className="font-semibold text-white mb-1">Full DIGITAL copy pricing · hard cutoff</p>
                <ul className="space-y-1.5 text-xs md:text-sm">
                  <li>
                    <span className="text-[#dfcfb5] font-bold">Extended Sneak Peek {NOVEL_PRICING.sneakPeek}</span>
                    {" "}— Prologue &amp; Chapters 1–2; places you on the Insider Deal whitelist
                  </li>
                  <li>
                    <span className="text-[#dfcfb5] font-bold">Digital early bird {NOVEL_PRICING.insider}</span>
                    {" "}— save {NOVEL_PRICING.insiderSavePercent} on the full DIGITAL copy (
                    <span className="text-white font-semibold">{NOVEL_PRICING.digitalPreorderStartLabel}</span> –{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.digitalPreorderEndLabel}</span>
                    ), for sneak-peek buyers
                  </li>
                  <li>
                    <span className="text-white font-bold">Hardcover {NOVEL_PRICING.hardcover}</span> — orders from{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.hardcoverOrderFromLabel}</span>
                  </li>
                  <li>
                    <span className="text-white font-bold">Paperback {NOVEL_PRICING.paperback}</span> — from{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.retailFromLabel}</span>
                  </li>
                  <li>
                    <span className="text-white font-bold">Digital {NOVEL_PRICING.retail}</span> — from{" "}
                    <span className="text-white font-semibold">{NOVEL_PRICING.retailFromLabel}</span>
                  </li>
                  <li className="text-gray-400">
                    Launch week: <span className="text-gray-300">{NOVEL_PRICING.launchWeekLabel}</span>
                    {" · "}
                    Official release: <span className="text-gray-300">{NOVEL_PRICING.releaseLabel}</span>
                    {" · "}
                    <Link href="/blog" className="text-[#dfcfb5] hover:underline">
                      See full launch timeline on Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Prefer the series page?{" "}
                <Link href="/books#featured-book" className="text-[#dfcfb5] hover:underline">
                  View the trailer on Books
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-10" aria-label="Shop options">
            <div className="shop-tabs" role="tablist" aria-label="Shop sections">
              <button
                type="button"
                role="tab"
                id="shop-tab-where-to-buy"
                aria-selected="true"
                aria-controls="shop-panel-where-to-buy"
                className="shop-tab"
              >
                Where to BUY
              </button>
            </div>

            <div
              role="tabpanel"
              id="shop-panel-where-to-buy"
              aria-labelledby="shop-tab-where-to-buy"
            >
              <h2 className="sr-only">Where to BUY</h2>
              <StoreHub variant="full" />
            </div>
          </div>
        </section>

        <section
          className="shop-rise shop-rise-delay mt-6 md:mt-8 rounded-2xl border border-[#dfcfb5]/30 bg-black/55 p-6 md:p-10 shadow-2xl max-w-3xl mx-auto"
          aria-label="Join the launch list"
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-2">
            Not buying yet? Stay in the storm.
          </h2>
          <p className="text-base text-gray-200 mb-5 leading-relaxed">
            Join the launch list for sneak peek news, the Sep 30 full DIGITAL preorder window, hardcover alerts for Nov 1 — and a chance for 3 lucky sleuths to win a free FULL digital copy (winners announced mid-October).
          </p>
          <LaunchListForm />
        </section>
      </main>
    </div>
  );
}
