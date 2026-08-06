/**
 * Storefronts for The Beautiful Beast Extended Sneak Peek.
 * Set status to "live" and add href when a store is ready.
 */
export const SNEAK_PEEK_STORES = [
  {
    key: "gumroad",
    label: "Gumroad",
    shortLabel: "Download the Extended Sneak Peek",
    description: "Instant checkout · digital download",
    href: "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
    status: "live",
  },
  {
    key: "draft2digital",
    label: "Draft2Digital",
    shortLabel: "Buy on Draft2Digital",
    description: "Wide retail distribution",
    href: null,
    status: "soon",
  },
  {
    key: "amazon",
    label: "Amazon",
    shortLabel: "Buy on Amazon",
    description: "KDP listing in review",
    href: null,
    status: "review",
  },
];

export const LIVE_SNEAK_PEEK_STORES = SNEAK_PEEK_STORES.filter((s) => s.status === "live" && s.href);

export const PRIMARY_SNEAK_PEEK_CHECKOUT =
  LIVE_SNEAK_PEEK_STORES[0]?.href ||
  "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true";
