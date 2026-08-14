// /pages/contact.js
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import StormAtmosphere from "@/components/StormAtmosphere";
import FormFieldLabel, { FormRequiredNote } from "@/components/FormFieldLabel";
import { PRIMARY_DISC_LOGO, DISC_LOGO_CANDIDATES } from "@/lib/logo";
import { readPreferredLang } from "@/lib/i18n";
import { bindChromeVars } from "@/lib/chromeVars";

export default function Contact() {
  const GOLD = "#a77a23";

  // ===== Measure header (footer read once) — do not observe footer (jump loop) =====
  const headerRef = useRef(null);
  useEffect(() => bindChromeVars(headerRef.current), []);

  // ---------- Disc logo (instant primary — no cache-bust delay) ----------
  const [logoSrc, setLogoSrc] = useState(PRIMARY_DISC_LOGO);
  const [useTextLogo, setUseTextLogo] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const tryLoad = (i = 0) => {
      if (i >= DISC_LOGO_CANDIDATES.length) {
        if (!cancelled) setUseTextLogo(true);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (!cancelled) {
          setLogoSrc(DISC_LOGO_CANDIDATES[i]);
          setUseTextLogo(false);
        }
      };
      img.onerror = () => tryLoad(i + 1);
      img.src = DISC_LOGO_CANDIDATES[i];
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-black text-gray-100">
      <Head>
        <title>Contact | Silver Spine Studio™</title>
        <meta name="description" content="Get in touch with Silver Spine Studio™ — collaborations, book news, and more." />
        <style>{`
          :root { --header-h: 140px; --footer-h: 72px; }

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
  className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-b border-[#c9ced6]/25"
>
  <div className="max-w-6xl mx-auto flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between px-4 md:px-6 py-3 md:py-4 min-w-0">
  <Link
  href="/"
  className="flex items-center gap-3 md:gap-4 group"
  aria-label="Silver Spine Studio — Home"
>
  {logoSrc && !useTextLogo ? (
    <span className="sss-logo-halo">
      <img
        src="/Final_Silver_Spine_Circular_Logo_With_Words_Transparant.png"
        alt="Silver Spine Studio logo"
        className="sss-logo-glow h-[88px] md:h-[108px] lg:h-[122px] w-auto select-none"
        draggable="false"
      />
    </span>
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

    <SiteNav className="w-full sm:w-auto justify-center sm:justify-end" />
  </div>
</header>

      <StormAtmosphere mood="porch" />

      {/* TOP NEBULA (band) */}
      <div className="nebula nebula-top mask-top relative z-10">
        <div className="letterbox-bar top-edge" />
      </div>

      {/* CONTENT (reserves space so footer is visible; balanced vertically) */}
      <div className="page-frame relative z-10">
        <section className="relative max-w-6xl mx-auto w-full px-4 md:px-6 pt-2 text-center">
          <h1
            className="mx-auto w-full text-center text-4xl md:text-5xl font-extrabold drop-shadow-lg"
            style={{ color: GOLD, letterSpacing: ".02em" }}
          >
            Get In Touch
          </h1>
        <p
  className="max-w-2xl mx-auto mt-2"
  style={{
    color: "#d9dee5",
    textShadow:
      "0 0 8px rgba(201,206,214,0.10), 0 2px 8px rgba(0,0,0,0.75)",
  }}
>
  Book launch questions, collaborations, media &amp; interviews, reader notes — or questions about
  this site. Pick a topic below and I’ll get back as soon as I can.
</p>
        </section>

           {/* Form panel */}
        <main className="px-6 pb-0 text-center">
          <section className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="panel mt-2 mb-2">
              <div className="content">
                <ContactFormEngine />
              </div>
            </div>
          </section>
        </main>

        <div className="nebula-spacer" />
      </div>
    </div>
  );
}

// ========== THE ACTIVE SECURE INTERACTION HANDSHAKE MODULE ==========
function ContactFormEngine() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("contact");
  const [outlet, setOutlet] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  useEffect(() => {
    if (!router.isReady) return;
    const t = String(router.query.topic || "").toLowerCase();
    if (t === "site" || t === "sites" || t === "website") {
      setTopic("sites");
    } else if (t === "media" || t === "press" || t === "interview" || t === "interviews") {
      setTopic("media");
    }
  }, [router.isReady, router.query.topic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", msg: "" });
    const kind = topic === "sites" ? "sites" : topic === "media" ? "media" : "contact";

    try {
      const response = await fetch("/api/contact-safe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          email,
          message,
          outlet: kind === "media" ? outlet : undefined,
          deadline: kind === "media" ? deadline : undefined,
          language: readPreferredLang(),
          hp,
          startedAt,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setStatus({
          state: "success",
          msg: data.message || "Thanks! Your message has been sent successfully.",
        });
        setName("");
        setEmail("");
        setMessage("");
        setOutlet("");
        setDeadline("");
        setTopic("contact");
      } else {
        setStatus({ state: "error", msg: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ state: "error", msg: "Network error. Please check your connection." });
    }
  };

  const messagePlaceholder =
    topic === "sites"
      ? "Tell me about the site you need (or your question): what you’re launching, pages you want, timing, and any links/examples…"
      : topic === "media"
        ? "Interview format (podcast / written Q&A / live), what you need (press kit, cover art, bio), and any timing notes…"
        : "Write your message here...";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <FormRequiredNote className="text-xs text-gray-500 mb-1" />
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty</label>
        <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} autoComplete="off" />
      </div>

      <div>
        <FormFieldLabel htmlFor="contact-topic" className="block mb-2 text-gray-300" required>
          Topic
        </FormFieldLabel>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white"
        >
          <option value="contact">Book launch &amp; general</option>
          <option value="media">Media request &amp; interviews</option>
          <option value="sites">Website build inquiry</option>
        </select>
        {topic === "sites" ? (
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            For custom site requests or questions about building a website. Your email to the studio is tagged{" "}
            <span className="text-gray-300 font-semibold">[WEBSITE INQUIRY]</span> so it’s easy to spot.
            Projects are by inquiry only — acceptance and timing vary (see{" "}
            <Link
              href="/faq#website-custom-sites"
              className="font-semibold text-[#a77a23] underline decoration-[#a77a23]/50 underline-offset-2 hover:text-[#c49231] hover:decoration-[#c49231] transition-colors"
            >
              FAQ
            </Link>
            ).
          </p>
        ) : topic === "media" ? (
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            For press kits, interviews, podcasts, and media features. Tagged{" "}
            <span className="text-gray-300 font-semibold">[MEDIA REQUEST]</span> in the studio inbox. Direct link:{" "}
            <Link
              href="/contact?topic=media"
              className="font-semibold text-[#a77a23] underline decoration-[#a77a23]/50 underline-offset-2 hover:text-[#c49231] hover:decoration-[#c49231] transition-colors"
            >
              /contact?topic=media
            </Link>
            .
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            Common answers on pricing, downloads, ARC, and launch updates are in the{" "}
            <Link
              href="/faq"
              className="font-semibold text-[#a77a23] underline decoration-[#a77a23]/50 underline-offset-2 hover:text-[#c49231] hover:decoration-[#c49231] transition-colors"
            >
              FAQ
            </Link>
            .
          </p>
        )}
      </div>

      <div>
        <FormFieldLabel className="block mb-2 text-gray-300" required>
          Name
        </FormFieldLabel>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white" placeholder="Your name" />
      </div>
      <div>
        <FormFieldLabel className="block mb-2 text-gray-300" required>
          Email
        </FormFieldLabel>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white" placeholder="you@example.com" />
      </div>

      {topic === "media" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FormFieldLabel className="block mb-2 text-gray-300" required>
              Outlet / publication
            </FormFieldLabel>
            <input
              type="text"
              value={outlet}
              onChange={(e) => setOutlet(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white"
              placeholder="Podcast, blog, magazine…"
            />
          </div>
          <div>
            <FormFieldLabel className="block mb-2 text-gray-300" optional>
              Deadline
            </FormFieldLabel>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white"
              placeholder="e.g., Oct 20, 2026"
            />
          </div>
        </div>
      )}

      <div>
        <FormFieldLabel className="block mb-2 text-gray-300" required>
          Message
        </FormFieldLabel>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="5" required className="w-full p-3 rounded-lg bg-black/55 border border-gray-700 focus:outline-none focus:border-[#a77a23] transition-colors duration-300 text-white" placeholder={messagePlaceholder} />
      </div>

      {status.msg && (
        <p className={`text-sm font-semibold ${status.state === "success" ? "text-green-400" : "text-red-400"}`}>
          {status.msg}
        </p>
      )}

      <button type="submit" disabled={status.state === "sending"} className="w-full py-3 rounded-lg bg-[#a77a23] text-black font-semibold hover:opacity-90 disabled:opacity-50 transition">
        {status.state === "sending" ? "Sending Securely..." : "Send Message"}
      </button>
    </form>
  );
}
