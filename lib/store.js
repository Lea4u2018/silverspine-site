/**
 * Official launch schedule — The Beautiful Beast
 * Cover Aug 3 · Sneak Peek Aug 4 · ARC apps Aug 7–14 (25) · Select Aug 17
 * Trailer 2 Aug 21 · ARC delivery Oct 1–3
 * Digital full novel preorder Sep 30, 2026 @ $14.99 Insider
 * Hardcover $29.99 · Paperback $24.99 from Nov 1, 2026 · Launch week Oct 21–28
 */
export const NOVEL_PRICING = {
  sneakPeek: "$4.99",
  insider: "$14.99",
  /** Full DIGITAL on Nov 1 (not print). Early bird is `insider`. */
  retail: "$19.99",
  paperback: "$24.99",
  hardcover: "$29.99",
  /** ((19.99 - 14.99) / 19.99) ≈ 25% */
  insiderSavePercent: "25%",
  sneakPeekLaunchLabel: "Aug 4, 2026",
  /** Digital full novel — Insider preorder window */
  digitalPreorderStartLabel: "Sep 30, 2026",
  digitalPreorderEndLabel: "Oct 14, 2026",
  /** Hardcover / print — not open for order until release day */
  hardcoverOrderFromLabel: "Nov 1, 2026",
  retailFromLabel: "Nov 1, 2026",
  releaseLabel: "Nov 1, 2026",
  launchWeekLabel: "Oct 21–28, 2026",
  /** @deprecated use digitalPreorderStartLabel */
  insiderStartLabel: "Sep 30, 2026",
  /** @deprecated use digitalPreorderEndLabel */
  insiderEndLabel: "Oct 14, 2026",
};

/** Clarifies digital vs hardcover — sneak peek is live now. */
export const PREORDER_STATUS = {
  digitalLive: false,
  headline: "Full DIGITAL preorder opens Sep 30 · hardcover Nov 1",
  detail: `The Extended Sneak Peek (${NOVEL_PRICING.sneakPeek}) is available now and places you on the Insider whitelist. The full DIGITAL copy opens for preorder Sep 30, 2026 at ${NOVEL_PRICING.insider} for whitelisted readers. Hardcover ${NOVEL_PRICING.hardcover} from ${NOVEL_PRICING.hardcoverOrderFromLabel}. Paperback ${NOVEL_PRICING.paperback}. Digital retail ${NOVEL_PRICING.retail} from ${NOVEL_PRICING.releaseLabel}.`,
  digitalTicker: `Full DIGITAL · early bird ${NOVEL_PRICING.insider} · Nov 1 ${NOVEL_PRICING.retail}`,
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
  digitalPreorder: "Sep 30, 2026",
  insiderWindow: "Sep 30 – Oct 14, 2026",
  hardcoverOrders: "Nov 1, 2026",
  /** @deprecated use digitalPreorder */
  preorder: "Sep 30, 2026",
  /** 3 lucky winners each receive one full digital copy — drawn from launch-list signups */
  digitalGiveawayAnnounce: "mid-October 2026",
  launchWeek: "Oct 21–28, 2026",
  release: "Nov 1, 2026",
};

/** Store / Gumroad product description — keep in sync with retailer listings. */
export const SNEAK_PEEK_PRODUCT_COPY = {
  intro:
    "This premium digital Extended Sneak Peek grants you immediate access to the full, unedited text of the Prologue and Chapters 1–2 of The Beautiful Beast.",
  insiderPerk: `By purchasing this Sneak Peek today for just ${NOVEL_PRICING.sneakPeek}, you place yourself on the Insider Deal whitelist — locking in the early full-DIGITAL novel rate of ${NOVEL_PRICING.insider} (save ${NOVEL_PRICING.insiderSavePercent}) during the preorder window, instead of the regular retail price of ${NOVEL_PRICING.retail}.`,
  hardcoverNote: `Hardback orders go live ${NOVEL_PRICING.hardcoverOrderFromLabel} at ${NOVEL_PRICING.hardcover}. Paperback ${NOVEL_PRICING.paperback}.`,
  holidayNote:
    "November 1 lands right as gift season begins — a Colorado thriller ready for the nightstand, the stocking, or the reader who loves a storm.",
};

/** Launch Countdown Matrix — dates lock to LAUNCH_MILESTONES / NOVEL_PRICING. */
export const LAUNCH_COUNTDOWN_MATRIX = [
  { icon: "🎨", when: LAUNCH_MILESTONES.coverReveal, title: "Cover Reveal", note: "live" },
  {
    icon: "📖",
    when: LAUNCH_MILESTONES.sneakPeek,
    title: "Extended Sneak Peek Release",
    note: "Prologue & Chapters 1–2",
  },
  {
    icon: "📅",
    when: LAUNCH_MILESTONES.arcSignups,
    title: "ARC Sign-ups",
    note: `${ARC_TEAM_SIZE} sleuths selected for early access to digital copy`,
  },
  { icon: "📩", when: LAUNCH_MILESTONES.arcSelection, title: "ARC Selection Emails Sent", note: "" },
  { icon: "🎬", when: LAUNCH_MILESTONES.trailer2, title: "Teaser Trailer 2 Drop", note: "" },
  {
    icon: "📦",
    when: LAUNCH_MILESTONES.arcDelivery,
    title: "Digital copy — ARC Delivery Window",
    note: "",
  },
  {
    icon: "🚀",
    when: LAUNCH_MILESTONES.insiderWindow,
    title: "Full Digital Book Preorders Open at the Insider Deal",
    note: `${NOVEL_PRICING.insider} for whitelisted readers`,
  },
  { icon: "⚡", when: LAUNCH_MILESTONES.launchWeek, title: "Launch Week Events", note: "" },
  {
    icon: "⚖️",
    when: LAUNCH_MILESTONES.release,
    title: "Official Release Day & Hardback orders accepted",
    note: `Digital ${NOVEL_PRICING.retail} · Paperback ${NOVEL_PRICING.paperback} · Hardcover ${NOVEL_PRICING.hardcover}`,
  },
];

/**
 * Live homepage countdown — advances automatically to the next purchase milestone.
 * Times are midnight America/Denver on the listed calendar day (studio timezone).
 */
export const LAUNCH_COUNTDOWN_TARGETS = [
  {
    key: "digitalPreorder",
    at: "2026-09-30T06:00:00.000Z",
    label: "Full DIGITAL preorder opens",
    detail: `Insider ${NOVEL_PRICING.insider} for whitelisted readers`,
    href: "/shop",
  },
  {
    key: "insiderClose",
    at: "2026-10-15T06:00:00.000Z",
    label: "Insider Deal window closes",
    detail: `Last chance at ${NOVEL_PRICING.insider} on the full digital copy`,
    href: "/shop",
  },
  {
    key: "hardcoverRelease",
    at: "2026-11-01T06:00:00.000Z",
    label: "Hardcover orders & official release",
    detail: `Digital ${NOVEL_PRICING.retail} · Paperback ${NOVEL_PRICING.paperback} · Hardcover ${NOVEL_PRICING.hardcover}`,
    href: "/shop",
  },
];

/**
 * Drawn from the launch list and from readers who left a review on the site.
 * Winners announced mid-October via inbox + social.
 */
export const DIGITAL_COPY_GIVEAWAY = {
  winners: 3,
  prize: "one free full digital copy of THE BEAUTIFUL BEAST (per winner)",
  requirement: "Join the launch list or leave a review on silverspinestudio.com before the drawing",
  announceLabel: LAUNCH_MILESTONES.digitalGiveawayAnnounce,
  notify: "Winners notified by email inbox and on Silver Spine socials",
  blurb:
    "Drawing for 3 full digital copies in mid-October 2026 from the launch list and left reviews. No purchase necessary.",
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
    key: "vivlio",
    label: "Vivlio",
    shortLabel: "Vivlio",
    formats: "EPUB",
    description: "Vivlio app or eReader · France & partner stores",
    href: "https://shop.vivlio.com/search?q=9798235194281",
    status: "live",
  },
  {
    key: "vivlio-libraries",
    label: "Vivlio Libraries",
    shortLabel: "Vivlio Libraries",
    description: "Ask your library · search or suggest it in the Vivlio library app",
    href: null,
    status: "library",
  },
  // BorrowBox & Gardners already published as library/wholesale channels — no public consumer buy URL to list.
];

export const LIVE_SNEAK_PEEK_STORES = SNEAK_PEEK_STORES.filter((s) => s.status === "live" && s.href);

export const PRIMARY_SNEAK_PEEK_CHECKOUT =
  LIVE_SNEAK_PEEK_STORES[0]?.href ||
  "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true";
