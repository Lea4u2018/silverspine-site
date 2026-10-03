import Link from "next/link";
import HiddenRageJar from "@/components/HiddenRageJar";
import { ENTER_THE_STORM, ENTER_THE_STORM_SALES, featuredStormCandle } from "@/lib/enterTheStorm";

const GOLD = "#dfcfb5";
const featured = featuredStormCandle();

export default function EnterTheStormShopBlock() {
  return (
    <div className="min-w-0 overflow-x-clip">
      <h2 className="sr-only">Enter The Storm</h2>
      <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 break-words">
        Candle story for {ENTER_THE_STORM.book}. One example jar: {featured.scent}. Buy stays grey.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start min-w-0">
        <div className="md:col-span-4 min-w-0">
          <HiddenRageJar compact />
        </div>
        <div className="md:col-span-8 space-y-4 min-w-0">
          <p
            className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.28em] break-words"
            style={{ color: GOLD }}
          >
            {ENTER_THE_STORM.brand}
          </p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words">
            {featured.scent}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed break-words">{ENTER_THE_STORM.vessel}</p>

          {ENTER_THE_STORM_SALES ? null : (
            <div
              role="status"
              aria-disabled="true"
              className="block w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 px-3 sm:px-5 py-4 cursor-not-allowed select-none"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
                <div className="min-w-0 text-left flex-1">
                  <p className="font-semibold text-base md:text-lg tracking-wide text-gray-300 leading-snug break-words">
                    Buy {featured.scent}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 leading-snug">
                    Coming... This door does not check out.
                  </p>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-white/15 px-2 sm:px-2.5 py-1 rounded-md text-gray-400 self-start sm:self-center">
                  Coming...
                </span>
              </div>
            </div>
          )}

          <p className="text-sm break-words">
            <Link href="/enter-the-storm" className="hover:underline font-semibold" style={{ color: GOLD }}>
              Open the candle story
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
