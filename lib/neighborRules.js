export const NEIGHBOR_CATEGORIES = [
  "Real estate",
  "Home & local services",
  "Professional",
  "Health & wellness",
  "Food & hospitality",
  "Creative studio",
  "Community",
  "Other (not books)",
];

const BOOK_TRADE = /\b(book\s*store|bookstore|bookshop|publisher|publishing|kindle|kdp|draft2digital|isbn|e-?book|audiobook|indie\s*author|amazon\s*kdp|smashwords|bookbub|goodreads|library\s*supplier|book\s*seller|bookselling)\b/i;

export function looksLikeBookTrade(...parts) {
  return BOOK_TRADE.test(parts.filter(Boolean).join(" "));
}

export function sanitizeStr(s, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\0/g, "").slice(0, max).trim();
}

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function cleanWebsite(raw) {
  const s = sanitizeStr(raw, 300);
  if (!s) return "";
  let url = s;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (!u.hostname || u.hostname === "localhost") return "";
    return u.toString();
  } catch {
    return "";
  }
}

export function isAllowedCategory(cat) {
  return NEIGHBOR_CATEGORIES.includes(cat);
}

/** Where neighbors may have purchased — for admin verification (not shown publicly). */
export const NEIGHBOR_PURCHASE_SOURCES = [
  "Gumroad",
  "Amazon / Kindle",
  "Apple Books",
  "Barnes & Noble / Nook",
  "Kobo",
  "Smashwords",
  "Direct from silverspinestudio.com / Shop",
  "In person / event",
  "Other Silver Spine retailer",
  "Other (describe in order notes)",
];

export function isAllowedPurchaseSource(source) {
  return NEIGHBOR_PURCHASE_SOURCES.includes(source);
}
