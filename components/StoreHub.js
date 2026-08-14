import { FaBookOpen } from "react-icons/fa";
import { SiAmazon, SiApple, SiRakuten } from "react-icons/si";
import { SNEAK_PEEK_STORES } from "@/lib/store";

const STATUS_COPY = {
  live: "Available now",
  soon: "Coming soon",
  review: "In review",
  library: "At libraries",
};

const STORE_ICONS = {
  gumroad: FaBookOpen,
  amazon: SiAmazon,
  kobo: SiRakuten,
  smashwords: FaBookOpen,
  fable: FaBookOpen,
  thalia: FaBookOpen,
  barnes: FaBookOpen,
  apple: SiApple,
  overdrive: FaBookOpen,
  cloudlibrary: FaBookOpen,
  hoopla: FaBookOpen,
  vivlio: FaBookOpen,
  "vivlio-libraries": FaBookOpen,
};

/**
 * Individual retailer hub — Get your copy buttons with store name + icon.
 * @param {"full"|"compact"} variant  full = Shop page rows; compact = Books/About stacks
 */
export default function StoreHub({ variant = "full", className = "", liveOnly = false }) {
  const stores = liveOnly
    ? SNEAK_PEEK_STORES.filter((s) => s.status === "live" && s.href)
    : SNEAK_PEEK_STORES;

  if (variant === "compact") {
    return (
      <div className={className}>
        <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed mb-2">
          Available worldwide — Amazon (Kindle), B&amp;N (Nook), Apple Books &amp; more. Each store uses its own app.
        </p>
        <div
          className="grid grid-cols-2 gap-2"
          role="list"
          aria-label="Get your copy — storefronts"
        >
          {stores.map((store) => {
            const isLive = store.status === "live" && store.href;
            const isLibrary = store.status === "library";
            const Icon = STORE_ICONS[store.key] || FaBookOpen;
            const name = store.shortLabel || store.label;
            if (isLibrary) {
              return (
                <div
                  key={store.key}
                  role="listitem"
                  title={store.label}
                  className="inline-flex items-center justify-between gap-1.5 font-semibold tracking-wide text-[#f5f0e4] border border-[#a77a23]/50 bg-[#a77a23]/15 text-left py-2.5 px-2.5 rounded-lg"
                >
                  <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                    <Icon className="shrink-0 text-base text-[#a77a23]" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[12px] sm:text-[13px] font-extrabold leading-snug break-words">
                        {name}
                      </span>
                      <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#a77a23]">
                        Ask your library
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#f5f0e4] bg-[#a77a23]/40 px-1.5 py-0.5 rounded">
                    Live
                  </span>
                </div>
              );
            }
            if (isLive) {
              return (
                <a
                  key={store.key}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="listitem"
                  title={store.label}
                  className={`${
                    store.key === "gumroad" ? "gumroad-button " : ""
                  }inline-flex items-center justify-between gap-1.5 font-semibold tracking-wide text-black bg-[#a77a23] hover:bg-[#c49231] transform hover:-translate-y-0.5 transition-all duration-200 text-left py-2.5 px-2.5 rounded-lg shadow-[0_3px_10px_rgba(167,122,35,0.3)]`}
                >
                  <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                    <Icon className="shrink-0 text-base" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-[12px] sm:text-[13px] font-extrabold leading-snug break-words">
                        {name}
                      </span>
                      <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-black/70">
                        Get your copy
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#f5f0e4] bg-black/20 px-1.5 py-0.5 rounded">
                    Live
                  </span>
                </a>
              );
            }
            return (
              <div
                key={store.key}
                role="listitem"
                aria-disabled="true"
                title={store.label}
                className="inline-flex items-center justify-between gap-1.5 font-semibold tracking-wide text-gray-400 border border-white/10 bg-white/[0.03] text-left py-2.5 px-2.5 rounded-lg"
              >
                <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                  <Icon className="shrink-0 text-base opacity-50" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[12px] sm:text-[13px] font-semibold leading-snug text-gray-300 break-words">
                      {name}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500">
                      {STATUS_COPY[store.status] || "Coming soon"}
                    </span>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} role="list" aria-label="Get your copy — storefront hub">
      <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-1">
        <span className="text-[#a77a23] font-semibold">Available worldwide.</span>{" "}
        Amazon Kindle is live in the US, Canada, UK, Australia, Europe, Japan, Brazil, Mexico, India &amp; more.
        Kobo and Apple Books also open country storefronts for local readers.
      </p>
      <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-1">
        Choose your store. Each live door opens that retailer directly. Library doors (like cloudLibrary) are live for libraries — ask yours to add it. Grey doors are still publishing.
      </p>
      {stores.map((store) => {
        const isLive = store.status === "live" && store.href;
        const isLibrary = store.status === "library";
        const status = STATUS_COPY[store.status] || store.status;
        const Icon = STORE_ICONS[store.key] || FaBookOpen;

        if (isLibrary) {
          return (
            <div
              key={store.key}
              role="listitem"
              className="block w-full rounded-xl border border-[#a77a23]/45 bg-[#a77a23]/10 text-[#f5f0e4] px-4 sm:px-5 py-4"
            >
              <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0 text-left flex-1">
                  <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#a77a23]/20">
                    <Icon className="text-xl text-[#a77a23]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-base md:text-lg tracking-wide leading-snug break-words">
                      {store.label}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300 mt-0.5 leading-snug">
                      {store.description}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#a77a23] mt-1">
                      Live for libraries · no public checkout link
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#f5f0e4] bg-[#a77a23]/40 px-2 sm:px-2.5 py-1 rounded-md mt-0.5">
                  {status}
                </span>
              </div>
            </div>
          );
        }

        if (isLive) {
          return (
            <a
              key={store.key}
              href={store.href}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              className={`${
                store.key === "gumroad" ? "gumroad-button " : ""
              }store-live block w-full rounded-xl border border-[#a77a23]/45 bg-[#a77a23] text-black px-4 sm:px-5 py-4 transition-all duration-200 hover:bg-[#c49231]`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0 text-left flex-1">
                  <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/15">
                    <Icon className="text-xl" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-base md:text-lg tracking-wide leading-snug break-words">
                      {store.label}
                    </p>
                    <p className="text-xs md:text-sm text-black/75 mt-0.5 leading-snug">
                      {store.description}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/80 mt-1">
                      Get your copy →
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#f5f0e4] bg-black/20 px-2 sm:px-2.5 py-1 rounded-md mt-0.5">
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
            className="block w-full rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 px-4 sm:px-5 py-4"
          >
            <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0 text-left flex-1">
                <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <Icon className="text-xl opacity-50" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base md:text-lg tracking-wide text-gray-300 leading-snug break-words">
                    {store.label}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 leading-snug">
                    {store.description}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-white/15 px-2 sm:px-2.5 py-1 rounded-md text-gray-400 mt-0.5">
                {status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
