/**
 * Admin-only name separation — NOT imported on public pages.
 * robots.txt disallows /admin. Never publish legacy names on the live site.
 */

export const NAME_SEPARATION = {
  publicAuthorName: "Leameso James",
  publicStudio: "Silver Spine Studio™",
  /** Search these ONLY when opting out of people-search sites — never on silverspinestudio.com */
  legacyNamesForOptOut: ["Leameso Sears", "Leameso Seard"],
  legacyNameRetiredYear: 2007,
};

export const OPT_OUT_RESOURCES = [
  {
    label: "Google — Results about you",
    href: "https://myactivity.google.com/results-about-you",
    note: "Request removal of outdated personal info in Google Search when eligible.",
  },
  {
    label: "Google — Remove outdated content",
    href: "https://search.google.com/search-console/remove-outdated-content",
    note: "If a page shows wrong/old info about you and the site won't update it.",
  },
  {
    label: "Google Alerts (Leameso James only)",
    href: "https://www.google.com/alerts",
    note: "Monitor your public author name — do not create alerts for old legal names (avoids reinforcing them).",
  },
  {
    label: "OpenDataUSA opt-out",
    href: "https://opendatausa.com/optout",
    note: "People-search aggregator — use if your old name or address appears.",
  },
];

export const NAME_SEPARATION_RULES = [
  "Live site, stores, and socials use Leameso James only — never former legal names.",
  "Do not add “formerly …” on About, Amazon, or Goodreads — that creates the link you want to avoid.",
  "Amazon Author Central, Goodreads, and BookBub: Leameso James only.",
  "If a people-search site lists you or your aunt under a similar name, opt out on that site directly.",
  "Search Console + your official profiles should dominate page one over time — not data-broker junk.",
];
