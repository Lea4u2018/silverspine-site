/**
 * Checkout destinations for The Beautiful Beast Extended Sneak Peek.
 * Add new storefronts here — product pages render every active option as a labeled button.
 */
export const SNEAK_PEEK_STORES = [
  {
    key: "gumroad",
    label: "Buy on Gumroad",
    shortLabel: "Download the Extended Sneak Peek",
    href: "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
  },
  // Example when ready:
  // {
  //   key: "payhip",
  //   label: "Buy on Payhip",
  //   shortLabel: "Download on Payhip",
  //   href: "https://payhip.com/b/your-product",
  // },
];

export const PRIMARY_SNEAK_PEEK_CHECKOUT = SNEAK_PEEK_STORES[0].href;
