/**
 * Official launch schedule — The Beautiful Beast
 * Cover Aug 3 · Sneak Peek Aug 4 (LIVE in stores) · ARC apps Aug 7–14 (25) · Select Aug 17
 * Trailer 2 Aug 21 · ARC Sneak Peek delivery Oct 1–3 (not the full novel)
 * Launch week Dec 14–21 · Gumroad Insider Deal Dec 15
 * Full DIGITAL file + hardcover + paperback Dec 25, 2026
 */
export const NOVEL_PRICING = {
  sneakPeek: "$4.99",
  insider: "$14.99",
  /** Full DIGITAL file + retail on Dec 25. Insider price is Gumroad Dec 15. */
  retail: "$19.99",
  paperback: "$24.99",
  hardcover: "$29.99",
  /** ((19.99 - 14.99) / 19.99) ≈ 25% */
  insiderSavePercent: "25%",
  sneakPeekLaunchLabel: "Aug 4, 2026",
  /** Gumroad Insider Deal — one day. File still Dec 25. */
  digitalPreorderStartLabel: "Dec 15, 2026",
  digitalPreorderEndLabel: "Dec 15, 2026",
  hardcoverOrderFromLabel: "Dec 25, 2026",
  retailFromLabel: "Dec 25, 2026",
  releaseLabel: "Dec 25, 2026",
  launchWeekLabel: "Dec 14–21, 2026",
  insiderStartLabel: "Dec 15, 2026",
  insiderEndLabel: "Dec 15, 2026",
};

/** Clarifies digital vs hardcover — sneak peek is live now. */
export const PREORDER_STATUS = {
  digitalLive: false,
  headline: `Early-bird digital rate ${NOVEL_PRICING.insider} on Dec 15 · official release Dec 25`,
  detail: `The Extended Sneak Peek (${NOVEL_PRICING.sneakPeek}) is available now and places you on the Insider whitelist. Dec 15 is not the release — it is Gumroad Insider Deal day, when sneak-peek buyers lock in ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}) for the full DIGITAL novel. You receive that file on official release day, ${NOVEL_PRICING.releaseLabel}, with the hardcover. Digital retail ${NOVEL_PRICING.retail} · paperback ${NOVEL_PRICING.paperback} · hardcover ${NOVEL_PRICING.hardcover} from ${NOVEL_PRICING.releaseLabel}.`,
  digitalTicker: `Early-bird digital ${NOVEL_PRICING.insider} Dec 15 · file on release day Dec 25`,
  hardcoverTicker: `Hardcover · ${NOVEL_PRICING.hardcoverOrderFromLabel} · ${NOVEL_PRICING.hardcover}`,
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
  arcDelivery: "Oct 1–3, 2026",
  digitalPreorder: "Dec 15, 2026",
  insiderWindow: "Dec 15, 2026",
  hardcoverOrders: "Dec 25, 2026",
  /** @deprecated use digitalPreorder */
  preorder: "Dec 15, 2026",
  digitalGiveawayAnnounce: "mid-December 2026",
  launchWeek: "Dec 14–21, 2026",
  release: "Dec 25, 2026",
};

/** Store / Gumroad product description — keep in sync with retailer listings. */
export const SNEAK_PEEK_PRODUCT_COPY = {
  intro:
    "This premium digital Extended Sneak Peek grants you immediate access to the full, unedited text of the Prologue and Chapters 1–2 of The Beautiful Beast.",
  insiderPerk: `By purchasing this Sneak Peek today for just ${NOVEL_PRICING.sneakPeek}, you place yourself on the Insider whitelist. On Gumroad Insider Deal day (${NOVEL_PRICING.digitalPreorderStartLabel}) you lock in ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}) instead of retail ${NOVEL_PRICING.retail}. That is a release-day discount — not an early copy of the novel. The full DIGITAL file is delivered ${NOVEL_PRICING.releaseLabel} with the hardcover.`,
  hardcoverNote: `Hardback orders go live ${NOVEL_PRICING.hardcoverOrderFromLabel} at ${NOVEL_PRICING.hardcover}. Paperback ${NOVEL_PRICING.paperback}.`,
  holidayNote:
    "December 25 is Christmas Day — a Colorado thriller ready for the nightstand, the stocking, or the reader who loves a storm.",
};

/** Launch Countdown Matrix — dates lock to LAUNCH_MILESTONES / NOVEL_PRICING. */
export const LAUNCH_COUNTDOWN_MATRIX = [
  { icon: "🎨", when: LAUNCH_MILESTONES.coverReveal, title: "Cover Reveal", note: "live" },
  {
    icon: "📖",
    when: LAUNCH_MILESTONES.sneakPeek,
    title: "Extended Sneak Peek Release",
    note: "Prologue & Chapters 1–2 · live in stores",
  },
  {
    icon: "📅",
    when: LAUNCH_MILESTONES.arcSignups,
    title: "ARC Sign-ups",
    note: `${ARC_TEAM_SIZE} sleuths · Sneak Peek sent · list closed`,
  },
  { icon: "📩", when: LAUNCH_MILESTONES.arcSelection, title: "ARC Selection Emails Sent", note: "Done" },
  { icon: "🎬", when: LAUNCH_MILESTONES.trailer2, title: "Teaser Trailer 2 Drop", note: "Done" },
  {
    icon: "📦",
    when: LAUNCH_MILESTONES.arcDelivery,
    title: "ARC Sneak Peek delivery",
    note: "Done · Prologue & Chapters 1–2 only — not the full novel",
  },
  { icon: "⚡", when: LAUNCH_MILESTONES.launchWeek, title: "Launch Week Events", note: "Site announcements and socials" },
  {
    icon: "🚀",
    when: LAUNCH_MILESTONES.insiderWindow,
    title: "Gumroad Insider Deal",
    note: `${NOVEL_PRICING.insider} early-bird rate · not the release · file Dec 25`,
  },
  {
    icon: "⚖️",
    when: LAUNCH_MILESTONES.release,
    title: "Official Release Day — full digital file & print orders",
    note: `Digital ${NOVEL_PRICING.retail} · Paperback ${NOVEL_PRICING.paperback} · Hardcover ${NOVEL_PRICING.hardcover}`,
  },
];

/**
 * Live homepage countdown — advances automatically to the next purchase milestone.
 * Times are midnight America/Denver on the listed calendar day (studio timezone).
 */
export const LAUNCH_COUNTDOWN_TARGETS = [
  {
    key: "insiderDay",
    at: "2026-12-15T06:00:00.000Z",
    label: "Gumroad Insider Deal",
    detail: `${NOVEL_PRICING.insider} early-bird rate · not the release · file Dec 25`,
    href: "/shop",
  },
  {
    key: "hardcoverRelease",
    at: "2026-12-25T06:00:00.000Z",
    label: "Official release — full digital file & hardcover",
    detail: `Digital ${NOVEL_PRICING.retail} · Paperback ${NOVEL_PRICING.paperback} · Hardcover ${NOVEL_PRICING.hardcover}`,
    href: "/shop",
  },
];

/**
 * Drawn from the launch list and from readers who left a review on the site.
 * Winners announced mid-December via inbox + social.
 */
export const DIGITAL_COPY_GIVEAWAY = {
  winners: 3,
  prize: "one free full digital copy of THE BEAUTIFUL BEAST (per winner)",
  requirement: "Join the launch list or leave a review on silverspinestudio.com before the drawing",
  announceLabel: LAUNCH_MILESTONES.digitalGiveawayAnnounce,
  notify: "Winners notified by email inbox and on Silver Spine socials",
  blurb:
    "Drawing for 3 full digital copies in mid-December 2026 from the launch list and left reviews. No purchase necessary.",
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
    formats: "EPUB · PDF",
    description: "Instant checkout · EPUB and PDF download",
    href: "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
    status: "live",
  },
  {
    key: "amazon",
    label: "Amazon (Kindle)",
    shortLabel: "Amazon (Kindle)",
    formats: "Kindle",
    description: "Kindle app or Kindle eReader · Worldwide (US, Canada, UK, AU & more)",
    href: "https://www.amazon.com/dp/B0HDK97XF9",
    status: "live",
  },
  {
    key: "barnes",
    label: "Barnes & Noble (Nook)",
    shortLabel: "B&N (Nook)",
    formats: "Nook",
    description: "NOOK Reader app or NOOK eReader · Extended Sneak Peek",
    href: "https://www.barnesandnoble.com/w/the-beautiful-beast-leameso-james/1151036272?ean=2940196585241",
    status: "live",
  },
  {
    key: "apple",
    label: "Apple Books",
    shortLabel: "Apple (Books)",
    formats: "Apple Books",
    description: "Apple Books app · US, Canada, UK & more",
    href: "https://books.apple.com/us/book/the-beautiful-beast-extended-sneak-peek/id6799540216",
    status: "live",
  },
  {
    key: "kobo",
    label: "Rakuten Kobo",
    shortLabel: "Kobo",
    formats: "EPUB",
    description: "Kobo app or Kobo eReader · US, Canada, UK & more",
    href: "https://www.kobo.com/us/en/ebook/the-beautiful-beast-extended-sneak-peek",
    status: "live",
  },
  {
    key: "smashwords",
    label: "Smashwords",
    shortLabel: "Smashwords",
    formats: "EPUB · PDF",
    description: "Multi-format ebook download (EPUB, PDF, and more)",
    href: "https://www.smashwords.com/books/view/2081930",
    status: "live",
  },
  {
    key: "fable",
    label: "Fable",
    shortLabel: "Fable",
    formats: "EPUB",
    description: "Fable Books app",
    href: "https://fable.co/book/x-9798235194281",
    status: "live",
  },
  {
    key: "thalia",
    label: "Tolino / Thalia (Germany)",
    shortLabel: "Thalia",
    formats: "EPUB",
    description: "Germany · Tolino network ebook stores",
    href: "https://www.thalia.de/shop/home/artikeldetails/A1081242872",
    status: "live",
  },
  {
    key: "vivlio",
    label: "Vivlio",
    shortLabel: "Vivlio",
    formats: "EPUB",
    description: "Vivlio app or eReader · France & partner stores",
    href: "https://shop.vivlio.com/search?q=9798235194281",
    status: "live",
  },
  // Library / wholesale — "library" = live for librarians, no public buy URL
  {
    key: "overdrive",
    label: "OverDrive",
    shortLabel: "OverDrive",
    description: "Ask your library · search or suggest it in Libby / OverDrive",
    href: null,
    status: "library",
  },
  {
    key: "cloudlibrary",
    label: "cloudLibrary",
    shortLabel: "cloudLibrary",
    description: "Ask your library · search or suggest it in the cloudLibrary app",
    href: null,
    status: "library",
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
    key: "borrowbox",
    label: "BorrowBox",
    shortLabel: "BorrowBox",
    description: "Ask your library · search or suggest it in the BorrowBox app",
    href: null,
    status: "library",
  },
  {
    key: "gardners",
    label: "Gardners",
    shortLabel: "Gardners",
    description: "UK wholesale · libraries and bookshops order through Gardners",
    href: null,
    status: "library",
  },
  {
    key: "vivlio-libraries",
    label: "Vivlio Libraries",
    shortLabel: "Vivlio Libraries",
    description: "Ask your library · search or suggest it in the Vivlio library app",
    href: null,
    status: "library",
  },
];

export const LIVE_SNEAK_PEEK_STORES = SNEAK_PEEK_STORES.filter((s) => s.status === "live" && s.href);

export const PRIMARY_SNEAK_PEEK_CHECKOUT =
  LIVE_SNEAK_PEEK_STORES[0]?.href ||
  "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true";
