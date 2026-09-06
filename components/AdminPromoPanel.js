import { useCallback, useEffect, useMemo, useState } from "react";
import FormFieldLabel from "@/components/FormFieldLabel";
import {
  DISCOUNT_PRODUCTS,
  discountSummary,
  formatDiscountLabel,
  isDiscountCodeLive,
} from "@/lib/discountCodes";

const GOLD = "#a77a23";

function formatWhen(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminPromoPanel() {
  const [codes, setCodes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [label, setLabel] = useState("");
  const [prefix, setPrefix] = useState("SPINE");
  const [discountType, setDiscountType] = useState("percent");
  const [amount, setAmount] = useState("15");
  const [product, setProduct] = useState("sneakPeek");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/launch");
    const data = await res.json();
    if (res.ok && data.ok) {
      setCodes(Array.isArray(data.discountCodes) ? data.discountCodes : []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (payload) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error || "Action failed.");
        return null;
      }
      await load();
      return data;
    } catch {
      setMsg("Network error.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const generate = async (e) => {
    e.preventDefault();
    const data = await post({
      action: "add-discount-code",
      label,
      prefix,
      discountType,
      amount: Number(amount),
      product,
      startsAt,
      expiresAt,
      maxUses: maxUses ? Number(maxUses) : 0,
      notes,
    });
    if (data?.code) {
      setMsg(`Created ${data.code.code} — copy it into Gumroad (Product → Offer codes).`);
      setLabel("");
      setNotes("");
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setMsg(`Copied ${code} to clipboard.`);
    } catch {
      setMsg(`Copy manually: ${code}`);
    }
  };

  const sorted = useMemo(
    () =>
      [...codes].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [codes]
  );

  return (
    <div className="space-y-8">
      {msg ? (
        <p className="text-sm text-gray-300 rounded-lg border border-white/10 bg-black/40 px-4 py-3">{msg}</p>
      ) : null}

      <section className="rounded-2xl border border-[#a77a23]/35 bg-gray-950/90 p-5 md:p-6">
        <h2 className="text-xl font-extrabold mb-1" style={{ color: GOLD }}>
          Discount code generator
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Generate sale codes here, then paste the same code into{" "}
          <strong className="text-gray-200">Gumroad → Product → Offer codes</strong> (or your storefront&apos;s promo
          field). The site tracks what you created; checkout still runs on Gumroad/Amazon unless you wire native pay
          later.
        </p>

        <form onSubmit={generate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <FormFieldLabel required>Campaign label</FormFieldLabel>
              <input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Instagram launch week"
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <FormFieldLabel>Code prefix</FormFieldLabel>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="SPINE"
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <FormFieldLabel required>Product</FormFieldLabel>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              >
                {DISCOUNT_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormFieldLabel required>Discount type</FormFieldLabel>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off ($)</option>
              </select>
            </div>
            <div>
              <FormFieldLabel required>{discountType === "fixed" ? "Dollars off" : "Percent off"}</FormFieldLabel>
              <input
                required
                type="number"
                min="0.01"
                step={discountType === "fixed" ? "0.01" : "1"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <FormFieldLabel>Max uses (0 = unlimited)</FormFieldLabel>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <FormFieldLabel>Starts (optional)</FormFieldLabel>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <FormFieldLabel>Expires (optional)</FormFieldLabel>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <FormFieldLabel>Notes</FormFieldLabel>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Where you'll post this code"
                className="w-full rounded bg-black border border-gray-700 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-[#a77a23] text-black font-semibold disabled:opacity-50"
          >
            Generate new code
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gray-950/90 p-5 md:p-6">
        <h3 className="text-base font-bold text-gray-100 mb-3">Your codes</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No codes yet — generate one when you run a sale.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm text-left min-w-[760px]">
              <thead className="bg-black/60 text-gray-400">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Window</th>
                  <th className="px-3 py-2">Uses</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => {
                  const live = isDiscountCodeLive(c);
                  return (
                    <tr key={c.id} className="border-t border-white/10 align-top">
                      <td className="px-3 py-2 font-mono text-[#a77a23]">{c.code}</td>
                      <td className="px-3 py-2 text-gray-200">{c.label || "—"}</td>
                      <td className="px-3 py-2 text-gray-400">{discountSummary(c)}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {c.startsAt ? formatWhen(c.startsAt) : "Now"}
                        {" → "}
                        {c.expiresAt ? formatWhen(c.expiresAt) : "No end"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {c.useCount || 0}
                        {c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-3 py-2">
                        {c.status === "disabled" ? (
                          <span className="text-gray-500 text-xs font-bold uppercase">Disabled</span>
                        ) : live ? (
                          <span className="text-emerald-400 text-xs font-bold uppercase">Live</span>
                        ) : (
                          <span className="text-amber-400 text-xs font-bold uppercase">Scheduled / ended</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyCode(c.code)}
                            className="text-xs px-2 py-1 rounded border border-[#a77a23]/40 text-[#f5edd7]"
                          >
                            Copy
                          </button>
                          {c.status === "active" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => post({ action: "update-discount-code", id: c.id, status: "disabled" })}
                              className="text-xs px-2 py-1 rounded border border-white/20 text-gray-400"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => post({ action: "update-discount-code", id: c.id, status: "active" })}
                              className="text-xs px-2 py-1 rounded border border-emerald-400/40 text-emerald-200"
                            >
                              Enable
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm(`Delete code ${c.code}?`)) {
                                post({ action: "remove-discount-code", id: c.id });
                              }
                            }}
                            className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                        {c.notes ? <p className="text-[11px] text-gray-600 mt-1">{c.notes}</p> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Gumroad steps: open your product → Share → Offer codes → Create → paste the code above → set the same{" "}
          {formatDiscountLabel({ discountType: "percent", amount: 15 })} rule to match.
        </p>
      </section>
    </div>
  );
}
