import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";
import { NOVEL_PRICING, PREORDER_STATUS } from "@/lib/store";

const SECTIONS = [
  {
    title: "About the book & series",
    items: [
      {
        q: "Is The Beautiful Beast a standalone book, or do I need to read the whole series?",
        a: "The Beautiful Beast (Book 1) is the epicenter of the Seven-Fold Chronicle. It is a complete, self-contained mystery with a satisfying ending — and it also opens a timeline that continues across six future books. You can read Book 1 on its own; it is also the master key to the rest of the series.",
      },
      {
        q: "Why are there seven books in the chronicle?",
        a: "The series is built around the fallout of a single event on Colorado’s Million-Dollar Highway (Highway 550). Book 1 sets the stage. Each of the next six books goes deeper into the perspective, secrets, and reckoning of a different character bound to that web.",
      },
      {
        q: "When does the full novel release?",
        a: `Official release day for The Beautiful Beast is ${NOVEL_PRICING.releaseLabel}.`,
      },
      {
        q: "When will Book 2 be released?",
        a: "The Seven-Fold Chronicle follows a mapped, rolling narrative timeline. Future character volumes are planned in sequence after Book 1. Join the launch list for calendar updates as dates lock in.",
      },
    ],
  },
  {
    title: "Digital access & checkout",
    items: [
      {
        q: "What is the Extended Sneak Peek?",
        a: "A digital preview of The Beautiful Beast: unedited Prologue + Chapters 1–2. Available now while you wait for the full novel.",
      },
      {
        q: "How do I receive my Extended Sneak Peek after purchasing?",
        a: "Instantly. When payment clears through Gumroad, you get an automated email with a download link. Read on phone, tablet, or computer. If your files include EPUB, you can also send them to many e-reader apps (including Kindle apps that accept EPUB).",
      },
      {
        q: "What formats do I get?",
        a: "Current digital formats are EPUB and PDF (as listed on the product page at checkout). Check the Gumroad listing for the exact files included with your purchase.",
      },
      {
        q: "Is checkout safe?",
        a: "Yes. Checkout runs through Gumroad’s secure payment system with industry-standard encryption. Your card or PayPal details are handled by Gumroad — not stored on silverspinestudio.com servers.",
      },
      {
        q: "Can I share the file with friends?",
        a: "No. Purchase is for your personal reading only. Sharing, uploading, copying, or reselling the files is not allowed and violates copyright.",
      },
      {
        q: "Is the book copyrighted?",
        a: "Yes. The work is protected by U.S. copyright, including Library of Congress registration where applicable. Buying a file grants personal reading access — not ownership of the copyright.",
      },
    ],
  },
  {
    title: "Barnes & Noble (NOOK Reader required)",
    items: [
      {
        q: "Before I buy on Barnes & Noble — what app or device do I need?",
        a: (
          <>
            <p>
              <strong>Barnes &amp; Noble sells NOOK ebooks.</strong> Those files open only in the{" "}
              <strong>NOOK app (NOOK Reader)</strong> or on a <strong>Barnes &amp; Noble NOOK eReader device</strong>.
              They do <strong>not</strong> open in the Kindle app, Apple Books, Google Play Books, Kobo, or a generic
              EPUB reader you sideload yourself.
            </p>
            <p>
              <strong>Choose Barnes &amp; Noble if:</strong> you already use NOOK, or you are fine installing the NOOK
              Reader app on your phone, tablet, or computer.
            </p>
            <p>
              <strong>Choose a different store on our </strong>
              <Link href="/shop">Shop</Link>
              <strong> page if you prefer:</strong>
            </p>
            <ul>
              <li>
                <strong>Gumroad</strong> — instant EPUB/PDF download; works with many reading apps
              </li>
              <li>
                <strong>Amazon Kindle</strong> — Kindle app or Kindle eReader
              </li>
              <li>
                <strong>Apple Books</strong> — iPhone, iPad, Mac (Books app)
              </li>
              <li>
                <strong>Kobo</strong> — Kobo app or Kobo eReader
              </li>
              <li>
                <strong>Smashwords</strong> — multi-format download (EPUB and more)
              </li>
            </ul>
            <p>Same book, same price — pick the store that matches the device you already use.</p>
          </>
        ),
      },
      {
        q: "I bought on Barnes & Noble — where is my ebook?",
        a: (
          <>
            <p>
              Your purchase lives in your <strong>Barnes &amp; Noble account</strong>, not on this website. Open it with
              the <strong>NOOK app (NOOK Reader)</strong> or a <strong>NOOK eReader device</strong> — signed in with the{" "}
              <strong>exact email used at checkout</strong>. After payment clears, it usually appears within minutes.
            </p>
            <ul>
              <li>
                Confirm you bought the <strong>NOOK eBook</strong> (not a print book).
              </li>
              <li>
                Install the <strong>NOOK app (NOOK Reader)</strong> on your phone or tablet, or sign in at{" "}
                <a href="https://www.barnesandnoble.com" target="_blank" rel="noopener noreferrer">
                  bn.com
                </a>
                .
              </li>
              <li>
                Sign in with the <strong>same email</strong> used at checkout.
              </li>
              <li>
                Open <strong>NOOK → Library</strong> (or bn.com → Account → My NOOK → My Library).
              </li>
              <li>Pull down to refresh or sync. If you just purchased, wait 15–30 minutes.</li>
              <li>
                Check bn.com → Account → <strong>Order History</strong> to confirm the NOOK Book order completed.
              </li>
            </ul>
            <p>
              <strong>Download the NOOK Reader app:</strong>{" "}
              <a
                href="https://apps.apple.com/us/app/nook/id373582546"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple App Store
              </a>{" "}
              ·{" "}
              <a
                href="https://play.google.com/store/apps/details?id=bn.ereader"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Play
              </a>
            </p>
            <p>
              The regular Barnes &amp; Noble shopping app is for browsing and buying — your ebook library is inside{" "}
              <strong>NOOK (NOOK Reader)</strong>.
            </p>
            <p>
              Still missing? You may be signed into a different email than the one used at checkout. Forward your B&amp;N
              order confirmation to{" "}
              <a href="mailto:contact@silverspinestudio.com">contact@silverspinestudio.com</a> and we&apos;ll help you
              spot what went wrong.
            </p>
          </>
        ),
      },
      {
        q: "Can I read my Barnes & Noble purchase on Kindle, Kobo, or another e-reader?",
        a: (
          <>
            <p>
              <strong>No.</strong> Barnes &amp; Noble NOOK ebooks stay inside the NOOK ecosystem. There is no way to
              move a B&amp;N purchase into the Kindle app, Apple Books, Kobo, or a generic EPUB app.
            </p>
            <p>
              <strong>On Barnes &amp; Noble, you can read with:</strong>
            </p>
            <ul>
              <li>
                <strong>NOOK app (NOOK Reader)</strong> on iPhone, iPad, Android, or computer (
                <a href="https://apps.apple.com/us/app/nook/id373582546" target="_blank" rel="noopener noreferrer">
                  Apple
                </a>
                {" · "}
                <a
                  href="https://play.google.com/store/apps/details?id=bn.ereader"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play
                </a>
                )
              </li>
              <li>
                <strong>NOOK eReader devices</strong> from Barnes &amp; Noble — sign in with your purchase email and
                open Library
              </li>
              <li>
                <strong>bn.com</strong> — Account → My NOOK → My Library (web reading where supported)
              </li>
            </ul>
            <p>
              <strong>Want Kindle, Kobo, Apple Books, or a downloadable EPUB/PDF?</strong> Buy from another door on our{" "}
              <Link href="/shop">Shop</Link> page instead — Gumroad, Amazon, Apple Books, Kobo, and Smashwords each
              match different devices and apps.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: "Pricing, pre-orders & launch",
    items: [
      {
        q: "Can I preorder the full DIGITAL copy now?",
        a: `The Extended Sneak Peek (${NOVEL_PRICING.sneakPeek}) is available now. The full DIGITAL copy opens for Insider preorder ${NOVEL_PRICING.digitalPreorderStartLabel} at ${NOVEL_PRICING.insider} for whitelisted readers (${NOVEL_PRICING.digitalPreorderStartLabel} – ${NOVEL_PRICING.digitalPreorderEndLabel}). Hardcover is ${NOVEL_PRICING.hardcover} and is not available for order until ${NOVEL_PRICING.hardcoverOrderFromLabel}. Full DIGITAL retail is ${NOVEL_PRICING.retail} from ${NOVEL_PRICING.releaseLabel}.`,
      },
      {
        q: "When can I order the hardcover?",
        a: `Hardcover is ${NOVEL_PRICING.hardcover}. Orders begin ${NOVEL_PRICING.hardcoverOrderFromLabel} — the official release day. Paperback is ${NOVEL_PRICING.paperback}. Full DIGITAL copy preorder opens separately ${NOVEL_PRICING.digitalPreorderStartLabel}.`,
      },
      {
        q: "What is the benefit of buying the Extended Sneak Peek today?",
        a: `Welcome in. Buying the Extended Sneak Peek for ${NOVEL_PRICING.sneakPeek} (Prologue & Chapters 1–2) places you on the Insider Deal whitelist. Whitelisted readers may secure the full DIGITAL copy for ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}) when preorder opens (${NOVEL_PRICING.digitalPreorderStartLabel} – ${NOVEL_PRICING.digitalPreorderEndLabel}). Full DIGITAL retail is ${NOVEL_PRICING.retail} from ${NOVEL_PRICING.releaseLabel}. Hardcover is ${NOVEL_PRICING.hardcover} from ${NOVEL_PRICING.hardcoverOrderFromLabel}. Paperback is ${NOVEL_PRICING.paperback}.`,
      },
      {
        q: "How much does everything cost?",
        a: `Extended Sneak Peek: ${NOVEL_PRICING.sneakPeek} (Insider whitelist · available now). Digital Insider preorder: ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}, ${NOVEL_PRICING.digitalPreorderStartLabel} – ${NOVEL_PRICING.digitalPreorderEndLabel}). Digital retail: ${NOVEL_PRICING.retail} from ${NOVEL_PRICING.retailFromLabel}. Paperback: ${NOVEL_PRICING.paperback}. Hardcover: ${NOVEL_PRICING.hardcover} from ${NOVEL_PRICING.hardcoverOrderFromLabel}.`,
      },
      {
        q: "Can I get a refund after I buy?",
        a: "No. Digital sales are final once the file is available to download. If a download link fails, email support and we’ll help with access — that is support, not a refund after reading. See the Refund Policy.",
      },
      {
        q: "How do I join the launch list?",
        a: "Use Join the launch list on Blog, Books, or Shop. You’ll get sneak peek news, preorder-window reminders, and release-day alerts. Launch-list members are also entered for a drawing: 3 lucky sleuths win a free FULL digital copy of The Beautiful Beast (readable on your devices). Winners announced mid-October 2026 by email and on social.",
      },
      {
        q: "How do I enter the free digital copy giveaway?",
        a: "Join the launch list on the website before the drawing. Three winners receive a free full digital novel. Announcement mid-October 2026; winners notified in their inbox and on Silver Spine socials. Separate from ARC applications.",
      },
      {
        q: "What is an ARC request?",
        a: "ARC means Advanced Review Copy / early-release review access. We select 25 sleuths from applications (Aug 7–14, 2026; selection emails Aug 17). Delivery is Oct 1–3, 2026. Separate from the paid sneak peek and the launch list. Use Request early-release ARC on the Blog page during open windows.",
      },
      {
        q: "How do I contact Silver Spine Studio?",
        a: "Use the Contact page or email contact@silverspinestudio.com for support and questions. On Contact choose Book launch & general, Media request & interviews, or Website build inquiry (for custom site requests).",
      },
      {
        q: "How do I request a press kit or interview?",
        a: "Use Contact → Media request & interviews (or open /contact?topic=media). You can also use Request press kit on the Blog. Those messages are tagged [MEDIA REQUEST] in the studio inbox.",
      },
    ],
  },
  {
    title: "This website & custom site questions",
    items: [
      {
        q: "Did you design this website yourself?",
        a: "Yes. Silver Spine Studio™ was hand-built by the author with PyCharm, Next.js, React, and Tailwind CSS — the same credit shown in the site footer.",
      },
      {
        q: "Do you build websites for other people?",
        a: "Site projects for others are considered by inquiry only — not an open storefront right now. Book launch comes first. For a custom site request, use Contact → Website build inquiry (or open /contact?topic=sites). Those messages are tagged [WEBSITE INQUIRY] in the studio inbox.",
      },
      {
        q: "How does acceptance work for a site project?",
        a: "Acceptance varies based on project criteria, fit, and timing. A clear brief helps: what you’re launching (author brand, book series, business), the scope you need, and your preferred timeframe. Not every request can be taken.",
      },
      {
        q: "What is a typical turnaround time?",
        a: "If a project is accepted, turnaround is at least one month — often longer depending on scope, content readiness, and calendar. Exact timing is confirmed only after reviewing the brief.",
      },
      {
        q: "What should I include if I message about a website?",
        a: "Share what you’re building, who it’s for, whether you need a full site or a focused landing page, any must-have pages, and your ideal timing. Questions-only notes are welcome too — you don’t have to be ready to hire.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <InfoPageShell
      title="FAQ"
      eyebrow="Help"
      tone="faq"
      description="Answers about The Beautiful Beast, the Seven-Fold Chronicle, digital downloads, pricing windows, launch updates, and questions about this website."
    >
      {SECTIONS.map((section) => (
        <section
          key={section.title}
          id={section.title === "This website & custom site questions" ? "website-custom-sites" : undefined}
          className="mb-2 scroll-mt-28"
        >
          <h2>{section.title}</h2>
          <div>
            {section.items.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <div className="faq-answer">
                  {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-6">
        More detail: <Link href="/refunds">Refund Policy</Link> · <Link href="/privacy">Privacy Policy</Link> ·{" "}
        <Link href="/shop">Shop</Link> · <Link href="/blog">Blog / launch timeline</Link>
      </p>
    </InfoPageShell>
  );
}
