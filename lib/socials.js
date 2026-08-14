// /lib/socials.js
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaLinkedin,
  FaPinterest,
  FaSnapchatGhost,
  FaYoutube,
  FaGlobe,
  FaBookOpen,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandThreads } from "react-icons/tb";
import {
  SiGoodreads,
  SiBookbub,
  SiAmazon,
  SiApple,
  SiSubstack,
  SiMedium,
} from "react-icons/si";

// Brand gold
export const GOLD = "#a77a23";

export const SOCIAL_ICONS = [
  {
    key: "fb",
    label: "Facebook",
    href: "https://www.facebook.com/SilverSpineStudio/",
    icon: FaFacebook,
  },
  {
    key: "ig",
    label: "Instagram",
    href: "https://www.instagram.com/silverspinestudio/",
    icon: FaInstagram,
  },
  {
    key: "tt",
    label: "TikTok",
    href: "https://www.tiktok.com/@silverspinestudio",
    icon: FaTiktok,
  },
  {
    key: "yt",
    label: "YouTube",
    href: "https://www.youtube.com/@silverspinestudio",
    icon: FaYoutube,
  },
  {
    key: "threads_live",
    label: "Threads",
    href: "https://www.threads.com/@silverspinestudio",
    icon: TbBrandThreads,
  },
  {
    key: "pi",
    label: "Pinterest",
    href: "https://www.pinterest.com/silverspinestudio",
    icon: FaPinterest,
  },
  {
    key: "em",
    label: "Email",
    href: "mailto:contact@silverspinestudio.com",
    icon: FaEnvelope,
  },
];

export const BOOK_ICONS = [
  {
    key: "goodreads",
    label: "Goodreads",
    href: "https://www.goodreads.com/leamesojames",
    icon: SiGoodreads,
  },
  {
    key: "bookbub",
    label: "BookBub",
    href: "https://www.bookbub.com/authors/leameso-james",
    icon: SiBookbub,
  },
  {
    key: "amazon",
    label: "Amazon Author",
    href: "https://www.amazon.com/author/leamesojames",
    icon: SiAmazon,
  },
];

export const STORE_ICONS = [
  {
    key: "gumroad",
    label: "Gumroad",
    href: "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
    icon: FaBookOpen,
  },
  {
    key: "apple",
    label: "Apple Books",
    href: "https://books.apple.com/us/book/the-beautiful-beast-extended-sneak-peek/id6799540216",
    icon: SiApple,
  },
  {
    key: "barnes",
    label: "Barnes & Noble",
    href: "https://www.barnesandnoble.com/w/the-beautiful-beast-leameso-james/1151036272?ean=2940196585241",
    icon: FaBookOpen,
  },
];

/** All live footer icons (social, author pages, then stores). */
export const CORE_ICONS = [...SOCIAL_ICONS, ...BOOK_ICONS, ...STORE_ICONS];

/**
 * Items inside the Logo Hub modal (grouped by category).
 * status: "live" = real profile URL · "needed" = still using a generic homepage (create next)
 */
export const HUB_ITEMS = [
  {
    key: "amazon",
    label: "Amazon Author Central",
    href: "https://www.amazon.com/author/leamesojames",
    icon: SiAmazon,
    category: "Writing",
    status: "live",
    nextStep: "Live — amazon.com/author/leamesojames (Author ID B0HF1KXYNX).",
  },
  {
    key: "goodreads",
    label: "Goodreads",
    href: "https://www.goodreads.com/leamesojames",
    icon: SiGoodreads,
    category: "Writing",
    status: "live",
    nextStep: "Live — author profile.",
  },
  {
    key: "bookbub",
    label: "BookBub",
    href: "https://www.bookbub.com/authors/leameso-james",
    icon: SiBookbub,
    category: "Writing",
    status: "live",
    nextStep: "Live — @leamesojames · bookbub.com/authors/leameso-james",
  },
  {
    key: "substack",
    label: "Substack",
    href: "https://substack.com",
    icon: SiSubstack,
    category: "Writing",
    status: "needed",
    nextStep: "Optional newsletter — create when ready and paste your Substack URL.",
  },
  {
    key: "medium",
    label: "Medium",
    href: "https://medium.com",
    icon: SiMedium,
    category: "Writing",
    status: "needed",
    nextStep: "Optional — create a Medium profile if you want long-form essays there.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: FaLinkedin,
    category: "Network",
    status: "needed",
    nextStep: "Create/claim LinkedIn for Silver Spine Studio or Leameso James, then paste URL.",
  },
  {
    key: "x",
    label: "X",
    href: "https://x.com",
    icon: FaXTwitter,
    category: "Social",
    status: "needed",
    nextStep: "Create @silverspinestudio (or your handle) on X, then paste the profile URL.",
  },
  {
    key: "sc",
    label: "Snapchat",
    href: "https://snapchat.com",
    icon: FaSnapchatGhost,
    category: "Social",
    status: "needed",
    nextStep: "Optional — create Snapchat for the studio when ready.",
  },
  {
    key: "pi",
    label: "Pinterest",
    href: "https://www.pinterest.com/silverspinestudio",
    icon: FaPinterest,
    category: "Social",
    status: "live",
    nextStep: "Live — Pinterest business profile.",
  },
  {
    key: "website",
    label: "Website / Blog",
    href: "https://www.silverspinestudio.com",
    icon: FaGlobe,
    category: "Contact",
    status: "live",
    nextStep: "Already live.",
  },
];

/** Footer hub icons that still need a real profile URL before going live in the footer. */
export const PENDING_FOOTER_HUB = HUB_ITEMS.filter((i) => i.status === "needed");

/** Footer icons already live in the bar. */
export const LIVE_FOOTER_ICONS = CORE_ICONS;

/**
 * Live profile URLs for Google / Bing Organization `sameAs`
 * (helps brand search surface Instagram, TikTok, YouTube, etc.).
 * Email mailto: is excluded — schema expects http(s) profile pages.
 */
export const SAME_AS_STUDIO = [
  "https://www.facebook.com/SilverSpineStudio/",
  "https://www.instagram.com/silverspinestudio/",
  "https://www.tiktok.com/@silverspinestudio",
  "https://www.youtube.com/@silverspinestudio",
  "https://www.threads.com/@silverspinestudio",
  "https://www.pinterest.com/silverspinestudio",
];

/** Author / storefront profiles for Person `sameAs` (Leameso James). */
export const SAME_AS_AUTHOR = [
  "https://www.goodreads.com/leamesojames",
  "https://www.bookbub.com/authors/leameso-james",
  "https://www.amazon.com/author/leamesojames",
  "https://books.apple.com/us/book/the-beautiful-beast-extended-sneak-peek/id6799540216",
  "https://www.barnesandnoble.com/w/the-beautiful-beast-leameso-james/1151036272?ean=2940196585241",
  "https://creativeefficiency.gumroad.com/l/the-beautiful-beast-sneak-peek?wanted=true",
];