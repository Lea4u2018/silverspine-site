import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";
import { NOVEL_PRICING } from "@/lib/store";

const FAQS = [
  {
    q: "What is the Extended Sneak Peek?",
    a: "Unedited Prologue + Chapters 1–2 of The Beautiful Beast — a digital preview you can buy now.",
  },
  {
    q: "How much does it cost?",
    a: `The sneak peek is ${NOVEL_PRICING.sneakPeek}. The full novel insider rate is ${NOVEL_PRICING.insider} from ${NOVEL_PRICING.insiderStartLabel} through ${NOVEL_PRICING.insiderEndLabel}. Full retail is ${NOVEL_PRICING.retail} starting ${NOVEL_PRICING.retailFromLabel}.`,
  },
  {
    q: "When does the full novel release?",
    a: `Official release day is ${NOVEL_PRICING.releaseLabel}.`,
  },
  {
    q: "What formats do I get?",
    a: "Digital formats listed on the product page / storefront (typically EPUB and/or PDF). Check the Gumroad listing at checkout for the current file types.",
  },
  {
    q: "Can I get a refund after I buy?",
    a: "No. Digital sales are final once the file is available to download. See our Refund Policy. If a download link fails, email support and we’ll help with access.",
  },
  {
    q: "Can I share the file with friends?",
    a: "No. Purchase is for your personal reading only. Sharing, uploading, or reselling the files is not allowed and violates copyright.",
  },
  {
    q: "Is the book copyrighted?",
    a: "Yes. The work is protected by U.S. copyright, including Library of Congress registration where applicable. Buying a file does not transfer copyright ownership.",
  },
  {
    q: "How do I join the launch list?",
    a: "Use Join the launch list on Blog, Books, or Shop. You’ll get launch updates at the email you provide.",
  },
  {
    q: "What is an ARC request?",
    a: "ARC means Advanced Review Copy / early-release review access for selected readers. That’s separate from the launch list. Use Request early-release ARC on the Blog page during open windows.",
  },
  {
    q: "How do I contact Silver Spine Studio?",
    a: "Use the Contact page or email contact@silverspinestudio.com.",
  },
];

export default function FAQ() {
  return (
    <InfoPageShell
      title="FAQ"
      eyebrow="Help"
      description="Quick answers about the sneak peek, pricing windows, refunds, copyright, and how to stay updated."
    >
      <div>
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6">
        More detail: <Link href="/refunds">Refund Policy</Link> · <Link href="/privacy">Privacy Policy</Link> ·{" "}
        <Link href="/shop">Shop</Link>
      </p>
    </InfoPageShell>
  );
}
