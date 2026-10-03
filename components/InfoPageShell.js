import Head from "next/head";
import Link from "next/link";
import StormAtmosphere from "@/components/StormAtmosphere";

const GOLD = "#dfcfb5";

/**
 * Shared shell for Privacy / FAQ / Refunds — one calm reading composition.
 */
export default function InfoPageShell({ title, description, eyebrow, tone, children }) {
  return (
    <div className="text-gray-100 min-h-screen">
      <StormAtmosphere mood="quiet" />
      <Head>
        <title>{title} | Silver Spine Studio™</title>
        <meta name="description" content={description} />
        <style>{`
          :root { --header-h: 56px; --footer-h: 136px; }
          .info-frame { min-height: calc(100vh - var(--header-h) - var(--footer-h)); }
          .info-prose h2 {
            color: ${GOLD};
            font-size: 1.05rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin: 1.75rem 0 0.65rem;
          }
          .info-prose.tone-faq h2 {
            color: #9ca3af;
          }
          .info-prose p, .info-prose li {
            color: #d1d5db;
            line-height: 1.65;
            font-size: 0.95rem;
          }
          .info-prose ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0 0; }
          .info-prose li + li { margin-top: 0.35rem; }
          .info-prose a { color: ${GOLD}; text-decoration: underline; text-underline-offset: 2px; }
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
          .faq-item .faq-answer {
            margin-top: 0.55rem;
            color: #ffffff;
          }
          .faq-item .faq-answer p {
            margin-top: 0.55rem;
            color: #ffffff !important;
          }
          .faq-item .faq-answer p:first-child { margin-top: 0; }
          .faq-item .faq-answer ul {
            list-style: disc;
            padding-left: 1.25rem;
            margin: 0.55rem 0 0;
            color: #ffffff;
          }
          .faq-item .faq-answer li + li { margin-top: 0.35rem; }
          .faq-item .faq-answer a { color: ${GOLD}; text-decoration: underline; text-underline-offset: 2px; }
          .faq-item p {
            margin-top: 0.55rem;
            color: #ffffff !important;
          }
        `}</style>
      </Head>

      <div className="info-frame relative z-10">
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
            <Link href="/contact" className="text-[#dfcfb5] hover:underline">
              Contact us
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
