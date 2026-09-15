import { useEffect, useState } from "react";
import Link from "next/link";
import InfoPageShell from "@/components/InfoPageShell";
import FormFieldLabel, { FormRequiredNote, RequiredMark } from "@/components/FormFieldLabel";
import { NEIGHBOR_CATEGORIES, NEIGHBOR_PURCHASE_SOURCES } from "@/lib/neighborRules";

const GOLD = "#dfcfb5";

export default function NeighborsPage() {
  const [listings, setListings] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [notBooks, setNotBooks] = useState(false);
  const [invested, setInvested] = useState(false);
  const [purchaseSource, setPurchaseSource] = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [purchaseReference, setPurchaseReference] = useState("");
  const [hp, setHp] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/neighbors");
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setListings(Array.isArray(data.listings) ? data.listings : []);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const res = await fetch("/api/neighbors/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactName,
          category,
          city,
          website,
          email,
          phone,
          description,
          notBooks,
          invested,
          purchaseSource,
          purchaseEmail,
          purchaseReference,
          hp,
          startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ state: "error", msg: data.error || "Could not send. Please try again." });
        return;
      }
      setStatus({
        state: "ok",
        msg: data.message || "Received. Waiting for studio approval.",
      });
      setBusinessName("");
      setContactName("");
      setCategory("");
      setCity("");
      setWebsite("");
      setEmail("");
      setPhone("");
      setDescription("");
      setNotBooks(false);
      setInvested(false);
      setPurchaseSource("");
      setPurchaseEmail("");
      setPurchaseReference("");
    } catch {
      setStatus({ state: "error", msg: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-gray-100 focus:outline-none focus:border-[#dfcfb5]";

  return (
    <InfoPageShell
      eyebrow="Silver Spine Studio™"
      title="Investing in the Community"
      description="Giving back. When you invest in Silver Spine Studio™, the studio invests in you — a free porch on a house already listed on Google and Bing. No website required."
    >
      <p className="text-gray-200 mb-4">
        This is how Silver Spine Studio™ gives back. You invest in this house — starting with a
        purchase from the{" "}
        <Link href="/shop" className="text-[#dfcfb5] underline underline-offset-2">
          Shop
        </Link>
        — and the studio invests in you. Your name, your work, and how to reach you live here. You do
        not need your own website. This card is your porch.
      </p>
      <p className="text-gray-200 mb-4">
        Small businesses helping small businesses. Searchers who find the studio can find you. Your
        people can find the storm. That is investing in the community — not buying an ad from a
        stranger.
      </p>
      <p className="text-gray-200 mb-4">
        Shop stays books. This wall is everyone else: real estate, services, local work, creative
        studios. No book publishers. No bookstores. No book selling.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Every listing still waits for a studio yes. Nothing goes live until Leameso approves it.
      </p>

      <h2>In the community</h2>
      {listings.length === 0 ? (
        <p className="text-gray-400 italic mb-8">
          No community listings are live yet. The first approved neighbors will appear here.
        </p>
      ) : (
        <div className="space-y-4 mb-10">
          {listings.map((n) => (
            <NeighborCard key={n.id} n={n} />
          ))}
        </div>
      )}

      <h2>Ask to be part of the community</h2>
      <p className="text-gray-300 mb-4">
        Invest first — then ask to be listed. The listing is free. That is the give-back. No website?
        Leave that blank and add a phone. This card becomes how people find you.
      </p>

      <form onSubmit={submit} className="space-y-4 text-left" autoComplete="on">
        <FormRequiredNote />
        <label className="sr-only" htmlFor="nb-hp">
          Leave blank
        </label>
        <input
          id="nb-hp"
          name="company"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
        />

        <div>
          <FormFieldLabel htmlFor="nb-biz" required>
            Business name
          </FormFieldLabel>
          <input
            id="nb-biz"
            className={inputClass}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-contact" required>
            Your name
          </FormFieldLabel>
          <input
            id="nb-contact"
            className={inputClass}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-cat" required>
            Category
          </FormFieldLabel>
          <select
            id="nb-cat"
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose one</option>
            {NEIGHBOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-city" required>
            City or area
          </FormFieldLabel>
          <input
            id="nb-city"
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-web">
            Website{" "}
            <span className="text-gray-500 font-normal">(optional — leave blank if you do not have one)</span>
          </FormFieldLabel>
          <input
            id="nb-web"
            type="text"
            inputMode="url"
            className={inputClass}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="your-site.com"
            maxLength={300}
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-email" required>
            Email
          </FormFieldLabel>
          <input
            id="nb-email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-phone" required>
            Phone{" "}
            <span className="text-gray-500 font-normal">(required if you have no website)</span>
          </FormFieldLabel>
          <input
            id="nb-phone"
            type="tel"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
          />
        </div>
        <div>
          <FormFieldLabel htmlFor="nb-desc" required>
            About the business
          </FormFieldLabel>
          <textarea
            id="nb-desc"
            className={`${inputClass} min-h-[120px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={800}
          />
        </div>

        <div className="rounded-xl border border-[#dfcfb5]/30 bg-[#dfcfb5]/10 p-4 space-y-4">
          <p className="text-sm text-gray-200 font-semibold" style={{ color: GOLD }}>
            Purchase verification (private — admin only, not shown on your public card)
          </p>
          <div>
            <FormFieldLabel htmlFor="nb-purchase-from" required>
              Where did you purchase from Silver Spine Studio™?
            </FormFieldLabel>
            <select
              id="nb-purchase-from"
              className={inputClass}
              value={purchaseSource}
              onChange={(e) => setPurchaseSource(e.target.value)}
              required
            >
              <option value="">Choose one</option>
              {NEIGHBOR_PURCHASE_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FormFieldLabel htmlFor="nb-purchase-email">
              Email used at checkout{" "}
              <span className="text-gray-500 font-normal">(optional if same as above)</span>
            </FormFieldLabel>
            <input
              id="nb-purchase-email"
              type="email"
              className={inputClass}
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              placeholder="gumroad@email.com"
              maxLength={120}
            />
          </div>
          <div>
            <FormFieldLabel htmlFor="nb-purchase-ref">
              Order # or short note{" "}
              <span className="text-gray-500 font-normal">(optional — helps verify in Gumroad etc.)</span>
            </FormFieldLabel>
            <input
              id="nb-purchase-ref"
              type="text"
              className={inputClass}
              value={purchaseReference}
              onChange={(e) => setPurchaseReference(e.target.value)}
              placeholder="Last 4 of order, date purchased, title bought…"
              maxLength={120}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={invested}
            onChange={(e) => setInvested(e.target.checked)}
            className="mt-1"
            required
          />
          <span>
            <RequiredMark /> I have purchased from Silver Spine Studio™. I am investing in this community and I
            understand the studio is giving back by listing me here.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={notBooks}
            onChange={(e) => setNotBooks(e.target.checked)}
            className="mt-1"
            required
          />
          <span>
            <RequiredMark /> This is not a book publisher, bookstore, or book-selling business. I understand the listing
            stays private until Silver Spine Studio™ approves it.
          </span>
        </label>

        {status.msg ? (
          <p className={`text-sm ${status.state === "ok" ? "text-emerald-300" : "text-red-300"}`}>
            {status.msg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#dfcfb5] text-black font-semibold py-3 hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Ask to join the community"}
        </button>
      </form>
    </InfoPageShell>
  );
}

function telHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function NeighborCard({ n }) {
  const tel = telHref(n.phone);
  return (
    <article className="rounded-xl border border-[#dfcfb5]/25 bg-black/40 p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: GOLD }}>
        Investing in the community · Silver Spine Studio™
      </p>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
        {n.category}
        {n.city ? ` · ${n.city}` : ""}
      </p>
      <h3 className="text-lg font-bold text-white">{n.businessName}</h3>
      {n.contactName ? <p className="text-sm text-gray-300 mt-1">Ask for {n.contactName}</p> : null}
      <p className="text-gray-200 mt-3 whitespace-pre-wrap">{n.description}</p>
      <div className="mt-4 space-y-1.5 text-sm">
        {n.phone ? (
          <p>
            {tel ? (
              <a href={tel} className="text-[#dfcfb5] underline underline-offset-2">
                {n.phone}
              </a>
            ) : (
              <span className="text-gray-200">{n.phone}</span>
            )}
          </p>
        ) : null}
        {n.email ? (
          <p>
            <a href={`mailto:${n.email}`} className="text-[#dfcfb5] underline underline-offset-2 break-all">
              {n.email}
            </a>
          </p>
        ) : null}
        {n.website ? (
          <p>
            <a
              href={n.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dfcfb5] underline underline-offset-2 break-all"
            >
              Visit their site
            </a>
          </p>
        ) : (
          <p className="text-xs text-gray-500">No separate website — the studio is giving back by being their porch.</p>
        )}
      </div>
    </article>
  );
}
