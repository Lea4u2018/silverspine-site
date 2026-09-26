/**
 * Canonical index of Silver Spine Studio book URLs — site pages + live storefronts.
 * Use for sitemaps, Search Console submissions, TikTok/shop forms, and admin reference.
 */

import { LIVE_SNEAK_PEEK_STORES, SNEAK_PEEK_STORES } from "@/lib/store";

export const SITE_ORIGIN = "https://www.silverspinestudio.com";

/** Public pages on silverspinestudio.com */
export const SITE_BOOK_PAGES = [
  { path: "/books", title: "Books — Seven-Fold Chronicle", priority: 0.9 },
  { path: "/books/the-beautiful-beast", title: "The Beautiful Beast — Book 1", priority: 0.85 },
  { path: "/shop", title: "Shop — Extended Sneak Peek storefronts", priority: 0.9 },
];

export function siteBookUrl(path) {
  return `${SITE_ORIGIN}${path}`;
}

/** Live external storefronts for The Beautiful Beast Extended Sneak Peek */
export const LIVE_STOREFRONTS = LIVE_SNEAK_PEEK_STORES.map((s) => ({
  key: s.key,
  label: s.label,
  href: s.href,
  description: s.description,
}));

/** Coming soon — flip to live in lib/store.js when URLs are ready */
export const COMING_SOON_STOREFRONTS = SNEAK_PEEK_STORES.filter(
  (s) => s.status === "soon" || s.status === "review"
).map((s) => ({
  key: s.key,
  label: s.label,
  status: s.status,
}));

/** Flat list of every live buy URL (for forms, indexing notes, etc.) */
export const ALL_LIVE_BUY_URLS = LIVE_STOREFRONTS.map((s) => s.href);

/** All site book URLs as absolute strings */
export const ALL_SITE_BOOK_URLS = SITE_BOOK_PAGES.map((p) => siteBookUrl(p.path));
