/** Discount / promo codes — generate, validate, format for Gumroad & storefronts. */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const DISCOUNT_PRODUCTS = [
  { id: "any", label: "Any product" },
  { id: "sneakPeek", label: "Extended Sneak Peek" },
  { id: "fullDigital", label: "Full digital copy" },
  { id: "hardcover", label: "Hardcover (when live)" },
];

export function generateDiscountCode(prefix = "SPINE") {
  const cleanPrefix = String(prefix || "SPINE")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8) || "SPINE";
  const block = () =>
    Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  return `${cleanPrefix}-${block()}-${block()}`;
}

export function formatDiscountLabel(code) {
  if (code.discountType === "fixed") {
    return `$${Number(code.amount).toFixed(2)} off`;
  }
  return `${Number(code.amount)}% off`;
}

export function discountSummary(code) {
  const product = DISCOUNT_PRODUCTS.find((p) => p.id === code.product)?.label || code.product;
  return `${formatDiscountLabel(code)} · ${product}`;
}

/** Whether code is usable right now (active + in date window + under max uses). */
export function isDiscountCodeLive(code, now = new Date()) {
  if (!code || code.status !== "active") return false;
  const t = now.getTime();
  if (code.startsAt) {
    const start = new Date(code.startsAt).getTime();
    if (!Number.isNaN(start) && t < start) return false;
  }
  if (code.expiresAt) {
    const end = new Date(code.expiresAt).getTime();
    if (!Number.isNaN(end) && t > end) return false;
  }
  const max = Number(code.maxUses || 0);
  const used = Number(code.useCount || 0);
  if (max > 0 && used >= max) return false;
  return true;
}

export function normalizeDiscountCode(raw) {
  if (!raw || typeof raw !== "object") return null;
  const code = String(raw.code || "")
    .trim()
    .toUpperCase();
  if (!code) return null;
  return {
    id: String(raw.id || "").trim(),
    code,
    label: String(raw.label || "").trim(),
    discountType: raw.discountType === "fixed" ? "fixed" : "percent",
    amount: Number(raw.amount) || 0,
    product: DISCOUNT_PRODUCTS.some((p) => p.id === raw.product) ? raw.product : "any",
    status: ["active", "disabled", "expired"].includes(raw.status) ? raw.status : "active",
    startsAt: String(raw.startsAt || "").trim(),
    expiresAt: String(raw.expiresAt || "").trim(),
    maxUses: Math.max(0, Number(raw.maxUses) || 0),
    useCount: Math.max(0, Number(raw.useCount) || 0),
    notes: String(raw.notes || "").trim(),
    createdAt: String(raw.createdAt || "").trim(),
    updatedAt: String(raw.updatedAt || "").trim(),
  };
}
