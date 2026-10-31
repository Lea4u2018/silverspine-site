import Head from "next/head";
import Link from "next/link";
import StormAtmosphere from "@/components/StormAtmosphere";
import HiddenRageJar from "@/components/HiddenRageJar";
import {
  ENTER_THE_STORM,
  ENTER_THE_STORM_SALES,
  featuredStormCandle,
} from "@/lib/enterTheStorm";

const GOLD = "#dfcfb5";
const featured = featuredStormCandle();

export default function EnterTheStormStory() {
  const title = `Enter The Storm · ${featured.scent} | Silver Spine Studio™`;
  const description = `Enter The Storm — the candle line for The Beautiful Beast. First jar: ${featured.scent}. Every scent reveals a new mystery...`;

  return (
    <div className="storm-story text-gray-100 relative z-10 min-w-0 overflow-x-clip">
      <StormAtmosphere mood="ember" />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root { --header-h: 56px; --footer-h: 136px; }
          html, body { overflow-x: clip; }
          .storm-story-frame {
            min-width: 0;
            overflow-x: clip;
            padding-bottom: 9rem;
          }
          .storm-story h1,
          .storm-story h2 {
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          @media (max-width: 767px) {
            .storm-story-frame {
              padding-bottom: 10rem;
            }
            .storm-story-kicker {
              letter-spacing: 0.12em !important;
              font-size: 0.68rem !important;
              padding-left: 0.5rem;
              padding-right: 0.5rem;
            }
            .storm-story h1 {
              font-size: 1.7rem !important;
              line-height: 1.15 !important;
              padding-left: 0.35rem;
              padding-right: 0.35rem;
            }
            .storm-story h2 {
              font-size: 1.45rem !important;
              line-height: 1.2 !important;
            }
            .storm-story-vessel {
              letter-spacing: 0.06em !important;
              text-transform: none !important;
              font-size: 0.8rem !important;
            }
          }
        `}</style>
      </Head>

      <main className="storm-story-frame max-w-[980px] mx-auto px-4 md:px-6 py-4 md:py-8">
        <p
          className="storm-story-kicker text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-center mb-3 px-1"
          style={{ color: GOLD }}
        >
          {ENTER_THE_STORM.studio}
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white text-center">
          {ENTER_THE_STORM.brand}
        </h1>
        <p className="mt-3 text-center text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed px-1">
          The candle line for {ENTER_THE_STORM.book}. One jar to start.
        </p>
        <p className="mt-4 text-center">
          <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] border border-white/20 text-gray-400 px-3 py-1.5 rounded-md">
            Every scent reveals a new mystery...
          </span>
        </p>

        <section className="mt-6 md:mt-8 rounded-2xl border border-white/10 bg-black/55 p-4 sm:p-5 md:p-8 shadow-2xl min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center min-w-0">
            <div className="md:col-span-5 min-w-0">
              <HiddenRageJar />
            </div>
            <div className="md:col-span-7 space-y-4 text-center md:text-left min-w-0">
              <p className="storm-story-kicker text-xs font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                First scent
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{featured.scent}</h2>
              <p className="storm-story-vessel text-sm uppercase tracking-widest text-gray-400 break-words">
                {ENTER_THE_STORM.vessel}
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">{featured.story}</p>

              <div
                role="status"
                aria-disabled="true"
                className="rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 px-3 sm:px-5 py-4 cursor-not-allowed select-none min-w-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-base text-gray-300 break-words">Buy {featured.scent}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {ENTER_THE_STORM_SALES
                        ? "Checkout is open."
                        : "This door is grey. Checkout is not open."}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest border border-white/15 px-2.5 py-1 rounded-md self-center">
                    Coming...
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 pt-2 leading-relaxed break-words">
                Books still live on{" "}
                <Link href="/shop" className="hover:underline" style={{ color: GOLD }}>
                  Studio Shop · Where to BUY
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
