import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";
import { NOVEL_PRICING } from "@/lib/store";

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
    title: "Pricing, pre-orders & launch",
    items: [
      {
        q: "What is the benefit of buying the Extended Sneak Peek today?",
        a: `Welcome in. Buying the Extended Sneak Peek for ${NOVEL_PRICING.sneakPeek} (Prologue & Chapters 1–2) places you on the Insider Deal whitelist. Whitelisted readers may secure the full novel for ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}) during preorder, ${NOVEL_PRICING.insiderStartLabel} – ${NOVEL_PRICING.insiderEndLabel}. Official release is ${NOVEL_PRICING.releaseLabel} at regular price ${NOVEL_PRICING.retail} — well timed for holiday gifting.`,
      },
      {
        q: "How much does everything cost?",
        a: `Extended Sneak Peek: ${NOVEL_PRICING.sneakPeek} (Insider whitelist). Insider Deal / preorder: ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}, ${NOVEL_PRICING.insiderStartLabel} – ${NOVEL_PRICING.insiderEndLabel}, sneak-peek buyers). Regular price: ${NOVEL_PRICING.retail} from ${NOVEL_PRICING.retailFromLabel}.`,
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
        a: "ARC means Advanced Review Copy / early-release review access. We select 25 sleuths from applications (Aug 7–14, 2026; selection emails Aug 17). Delivery is Sep 21–23, 2026. Separate from the paid sneak peek and the launch list. Use Request early-release ARC on the Blog page during open windows.",
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
                <p>{item.a}</p>
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
