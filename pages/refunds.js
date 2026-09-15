import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";

export default function Refunds() {
  return (
    <InfoPageShell
      title="Refund Policy"
      eyebrow="Shop"
      description="Clear rules for digital purchases from Silver Spine Studio™ — including The Beautiful Beast Extended Sneak Peek."
    >
      <p>
        <strong className="text-white">Effective date:</strong> August 6, 2026
      </p>
      <p>
        Our books and sneak peeks are <strong className="text-white">digital downloads</strong>. Once a file can be
        accessed, it cannot be “returned” like a physical book.
      </p>

      <h2>All digital sales are final</h2>
      <p>
        After purchase and delivery of a digital file (including sneak peeks, sample chapters, and other downloadable
        content), <strong className="text-white">all sales are final</strong>. We do not offer refunds because a file
        can be read immediately after purchase.
      </p>

      <h2>Before you buy</h2>
      <ul>
        <li>Confirm the product description and format (for example EPUB / PDF where listed)</li>
        <li>Confirm the price and that you want instant digital delivery</li>
        <li>Use a valid email at checkout so your download link arrives</li>
      </ul>

      <h2>Support (not refunds)</h2>
      <p>
        If something goes wrong with delivery access — missing email, broken link, or you can’t open the file — contact
        support and we’ll help you get what you paid for:
      </p>
      <p>
        <a href="mailto:contact@silverspinestudio.com">contact@silverspinestudio.com</a>
      </p>
      <p>
        Support means fixing access problems. It does not mean a refund after the content has been made available.
      </p>

      <h2>Storefront settings</h2>
      <p>
        Checkout may be processed by a third-party storefront (such as Gumroad). Their technical delivery tools may
        apply, but Silver Spine Studio’s policy for our digital titles is: <strong className="text-white">no refunds after download/access</strong>.
      </p>

      <h2>Copyright reminder</h2>
      <p>
        Purchase grants a personal right to read the file. It does not transfer copyright. Files may not be copied,
        uploaded, shared, or resold. The work remains protected under U.S. copyright (including Library of Congress
        registration where applicable).
      </p>

      <h2>Related</h2>
      <p>
        <Link href="/faq">FAQ</Link> · <Link href="/privacy">Privacy Policy</Link> · <Link href="/shop">Shop</Link>
      </p>
    </InfoPageShell>
  );
}
