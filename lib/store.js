/**
 * Official launch schedule — The Beautiful Beast
 * Cover Aug 3 · Sneak Peek Aug 4 · ARC apps Aug 7–14 (25) · Select Aug 17
 * Trailer 2 Aug 21 · ARC delivery Sep 21–23 · Preorder Sep 30–Oct 14 @ $14.99
 * Launch week Oct 21–28 · Release Nov 1 @ $24.99
 */
export const NOVEL_PRICING = {
  sneakPeek: "$4.99",
  insider: "$14.99",
  retail: "$24.99",
  /** ((24.99 - 14.99) / 24.99) ≈ 40% */
  insiderSavePercent: "40%",
  sneakPeekLaunchLabel: "Aug 4, 2026",
  insiderStartLabel: "Sep 30, 2026",
  insiderEndLabel: "Oct 14, 2026",
  retailFromLabel: "Nov 1, 2026",
  releaseLabel: "Nov 1, 2026",
  launchWeekLabel: "Oct 21–28, 2026",
};

/** Public ARC team size (“25 sleuths”). */
export const ARC_TEAM_SIZE = 25;

export const LAUNCH_MILESTONES = {
  coverReveal: "Aug 3, 2026",
  sneakPeek: "Aug 4, 2026",
  arcSignups: "Aug 7 – Aug 14, 2026",
  arcSelection: "Aug 17, 2026",
  arcTeamSize: ARC_TEAM_SIZE,
  trailer2: "Aug 21, 2026",
  arcDelivery: "Sep 21–23, 2026",
  preorder: "Sep 30, 2026",
  insiderWindow: "Sep 30 – Oct 14, 2026",
  /** 3 lucky winners each receive one full digital copy — drawn from launch-list signups */
  digitalGiveawayAnnounce: "mid-October 2026",
  launchWeek: "Oct 21–28, 2026",
  release: "Nov 1, 2026",
};

/**
 * Traffic driver: 3 lucky winners each receive one FULL digital copy.
 * Must be on the launch list. Winners announced mid-October via inbox + social.
 */
export const DIGITAL_COPY_GIVEAWAY = {
  winners: 3,
  prize: "one free full digital copy of THE BEAUTIFUL BEAST (per winner)",
  requirement: "Join the launch list on silverspinestudio.com before the drawing",
  announceLabel: LAUNCH_MILESTONES.digitalGiveawayAnnounce,
  notify: "Winners notified by email inbox and on Silver Spine socials",
  blurb:
    "Three lucky winners will each receive a free digital copy of the FULL novel — readable on your devices. Sign up on the launch list to enter. Winners announced mid-October 2026 by inbox and on social. Happy Sleuthing!",
};

/**
 * Individual storefront hub for The Beautiful Beast Extended Sneak Peek.
 * Prefer direct retailer URLs (Books2Read universal links can break for some stores).
 * Flip status to "live" + add href when a new store finishes publishing.
 */
export const SNEAK_PEEK_STORES = [
  {
    key: "gumroad",
    label: "Gumroad",
    shortLabel: "Gumroad",
    description: "Instant checkout · digital download",
    href: "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
    status: "live",
  },
  {
    key: "amazon",
    label: "Amazon Kindle",
    shortLabel: "Amazon",
    description: "Kindle · Worldwide (US, Canada, UK, AU & more)",
    href: "https://www.amazon.com/dp/B0HDK97XF9",
    status: "live",
  },
  {
    key: "barnes",
    label: "Barnes & Noble",
    shortLabel: "B&N",
    description: "Nook · Extended Sneak Peek",
    href: "https://www.barnesandnoble.com/w/the-beautiful-beast-leameso-james/1151036272?ean=2940196585241",
    status: "live",
  },
  {
    key: "kobo",
    label: "Rakuten Kobo",
    shortLabel: "Kobo",
    description: "Kobo · US, Canada, UK & more",
    href: "https://www.kobo.com/us/en/ebook/the-beautiful-beast-extended-sneak-peek",
    status: "live",
  },
  {
    key: "smashwords",
    label: "Smashwords",
    shortLabel: "Smashwords",
    description: "Multi-format ebook download",
    href: "https://www.smashwords.com/books/view/2081930",
    status: "live",
  },
  {
    key: "fable",
    label: "Fable",
    shortLabel: "Fable",
    description: "Fable Books",
    href: "https://fable.co/book/x-9798235194281",
    status: "live",
  },
  {
    key: "thalia",
    label: "Tolino / Thalia (Germany)",
    shortLabel: "Thalia",
    description: "Germany · Tolino network ebook stores",
    href: "https://www.thalia.de/shop/home/artikeldetails/A1081242872",
    status: "live",
  },
  {
    key: "apple",
    label: "Apple Books",
    shortLabel: "Apple",
    description: "Apple Books · US, Canada, UK & more",
    href: "https://books.apple.com/us/book/the-beautiful-beast-extended-sneak-peek/id6799540216",
    status: "live",
  },
  // Library / wholesale channels — flip to live when you have a public consumer buy URL
  {
    key: "overdrive",
    label: "OverDrive",
    shortLabel: "OverDrive",
    description: "Library ebook apps · still publishing",
    href: null,
    status: "soon",
  },
  {
    key: "cloudlibrary",
    label: "cloudLibrary",
    shortLabel: "cloudLibrary",
    description: "Library app · still publishing",
    href: null,
    status: "soon",
  },
  {
    key: "hoopla",
    label: "hoopla",
    shortLabel: "hoopla",
    description: "Library app · still publishing",
    href: null,
    status: "soon",
  },
  {
    key: "vivlio",
    label: "Vivlio",
    shortLabel: "Vivlio",
    description: "Still publishing",
    href: null,
    status: "soon",
  },
  {
    key: "vivlio-libraries",
    label: "Vivlio Libraries",
    shortLabel: "Vivlio Libraries",
    description: "Library channel · still publishing",
    href: null,
    status: "soon",
  },
  // BorrowBox & Gardners already published as library/wholesale channels — no public consumer buy URL to list.
];

export const LIVE_SNEAK_PEEK_STORES = SNEAK_PEEK_STORES.filter((s) => s.status === "live" && s.href);

export const PRIMARY_SNEAK_PEEK_CHECKOUT =
  LIVE_SNEAK_PEEK_STORES[0]?.href ||
  "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true";
