import { useCallback, useEffect, useMemo, useState } from "react";

const GOLD = "#a77a23";

function formatWhen(createdAt) {
  try {
    if (!createdAt) return "—";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminNeighborsPanel() {
  const [listings, setListings] = useState([]);
  const [storage, setStorage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/neighbors");
    const data = await res.json();
    if (res.ok && data.ok) {
      setListings(Array.isArray(data.listings) ? data.listings : []);
      setStorage(data.storage || "");
    } else {
      setActionMsg(data.error || "Could not load neighbors.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => listings.filter((r) => !r.approved && !r.rejected),
    [listings]
  );
  const approved = useMemo(
    () => listings.filter((r) => r.approved && !r.rejected),
    [listings]
  );

  const act = async (id, action) => {
    if (action === "reject") {
      if (!window.confirm("Decline this neighbor? They will not show on the public porch.")) return;
    }
    setBusyId(id);
    setActionMsg("");
    try {
      const res = await fetch("/api/admin/neighbors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setActionMsg(data.error || "Action failed.");
      } else {
        setActionMsg(
          action === "approve"
            ? "Approved — they now show on Investing in the Community."
            : action === "reject"
              ? "Declined and hidden."
              : "Unpublished (back to pending)."
        );
        await load();
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="mb-6 rounded-xl border border-[#a77a23]/45 bg-[#a77a23]/15 px-4 py-3 text-sm">
        <strong style={{ color: GOLD }}>Waiting:</strong> {pending.length}
        <span className="mx-2 text-gray-500">·</span>
        <strong className="text-gray-200">Live on porch:</strong> {approved.length}
        {storage ? (
          <>
            <span className="mx-2 text-gray-500">·</span>
            <span className="text-gray-400">Storage: {storage}</span>
          </>
        ) : null}
        {actionMsg ? <p className="mt-2 text-gray-200">{actionMsg}</p> : null}
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
          Waiting for your yes
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Giving back: free listing for small businesses who have purchased and are investing in this
          community. Google + Bing already list this site. Nothing public until you approve. Decline
          book sellers and anyone who does not belong.
        </p>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No pending neighbors right now.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((n) => (
              <article key={n.id} className="rounded-xl border border-amber-500/30 bg-gray-950 p-4">
                <ListingBody n={n} />
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => act(n.id, "approve")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => act(n.id, "reject")}
                    className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3" style={{ color: GOLD }}>
          Already on the porch
        </h2>
        {approved.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No live neighbors yet.</p>
        ) : (
          <div className="space-y-3">
            {approved.map((n) => (
              <article key={n.id} className="rounded-xl border border-white/10 bg-gray-950/70 p-4">
                <ListingBody n={n} />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => act(n.id, "unpublish")}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-sm hover:border-[#a77a23]/50 disabled:opacity-50"
                  >
                    Unpublish
                  </button>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => act(n.id, "reject")}
                    className="px-3 py-1.5 rounded-lg border border-red-400/40 text-sm text-red-300 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ListingBody({ n }) {
  return (
    <>
      <div className="font-semibold" style={{ color: GOLD }}>
        {n.businessName}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {n.category}
        {n.city ? ` · ${n.city}` : ""} · {formatWhen(n.createdAt)}
      </p>
      <p className="text-sm text-gray-300 mt-1">
        {n.contactName}
        {n.email ? ` · ${n.email}` : ""}
        {n.phone ? ` · ${n.phone}` : ""}
      </p>
      {n.website ? (
        <p className="text-sm mt-1">
          <a href={n.website} className="text-[#a77a23] underline underline-offset-2 break-all" target="_blank" rel="noopener noreferrer">
            {n.website}
          </a>
        </p>
      ) : null}
      <p className="text-xs mt-2 rounded-lg border border-[#a77a23]/25 bg-black/40 px-3 py-2 text-gray-300">
        <span className="font-semibold text-[#f5edd7]">Purchase check (private):</span>{" "}
        {n.purchaseSource || "— not recorded (older request)"}
        {n.purchaseEmail ? (
          <>
            <br />
            Checkout email: <span className="text-gray-200">{n.purchaseEmail}</span>
          </>
        ) : null}
        {n.purchaseReference ? (
          <>
            <br />
            Order / note: <span className="text-gray-200">{n.purchaseReference}</span>
          </>
        ) : null}
      </p>
      <p className="text-xs mt-2" style={{ color: GOLD }}>
        {n.invested ? "Confirmed: investing in the community / purchased" : "Did not confirm purchase"}
      </p>
      <p className="text-gray-200 whitespace-pre-wrap mt-3">{n.description}</p>
    </>
  );
}
