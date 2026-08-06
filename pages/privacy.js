import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";

export default function Privacy() {
  return (
    <InfoPageShell
      title="Privacy Policy"
      eyebrow="Legal"
      description="How Silver Spine Studio™ handles information when you visit, contact us, join the launch list, or buy digital books."
    >
      <p>
        <strong className="text-white">Effective date:</strong> August 6, 2026
      </p>
      <p>
        Silver Spine Studio™ (“we,” “us”) respects your privacy. This page explains what we collect and why.
        This is a practical site policy, not formal legal advice.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong className="text-white">Contact form &amp; launch list:</strong> name and email (and any message you send).
        </li>
        <li>
          <strong className="text-white">ARC / press requests:</strong> the details you choose to include in your request.
        </li>
        <li>
          <strong className="text-white">Purchases:</strong> checkout is handled by third-party storefronts (for example Gumroad).
          Their privacy policies apply to payment details.
        </li>
        <li>
          <strong className="text-white">Basic site/tech data:</strong> standard server and browser information used to run and protect the site.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>Reply to questions and support requests</li>
        <li>Send launch updates if you joined the launch list</li>
        <li>Process ARC / press communications</li>
        <li>Improve the site and prevent abuse</li>
      </ul>

      <h2>We do not sell your email</h2>
      <p>
        We do not sell your personal information. Launch-list and contact emails are used for Silver Spine Studio™
        communications related to our books and site.
      </p>

      <h2>Sharing</h2>
      <p>
        We may share information only when needed to operate the site or fulfill a request (for example email delivery),
        or if required by law. Storefronts process their own checkout data under their terms.
      </p>

      <h2>Your choices</h2>
      <p>
        To update or remove yourself from the launch list, or ask about data we hold from a form you submitted, email{" "}
        <a href="mailto:contact@silverspinestudio.com">contact@silverspinestudio.com</a>.
      </p>

      <h2>Copyright</h2>
      <p>
        Site content and book materials are protected by copyright. Ownership of the work remains with the copyright
        holder (including U.S. Copyright registration where applicable). Buying a digital file grants personal reading
        access — not ownership of the copyright, and not permission to share or resell files.
      </p>

      <h2>Related</h2>
      <p>
        See also our <Link href="/faq">FAQ</Link> and <Link href="/refunds">Refund Policy</Link>.
      </p>
    </InfoPageShell>
  );
}
