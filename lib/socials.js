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
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandThreads } from "react-icons/tb";
import {
  SiGoodreads,
  SiBookbub,
  SiAmazon,
  SiSubstack,
  SiMedium,
} from "react-icons/si";

// Brand gold
export const GOLD = "#a77a23";

/**
* Core icons shown directly in the footer bar.
*/
export const CORE_ICONS = [
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
    href: "https://tiktok.com/@silverspinestudio",
    icon: FaTiktok,
  },
  {
    key: "yt",
    label: "YouTube",
    href: "https://www.youtube.com/@silverspinestudio",
    icon: FaYoutube,
  },
  {
    key: "em",
    label: "Email",
    href: "mailto:contact@silverspinestudio.com",
    icon: FaEnvelope,
  },
  {
    key: "threads_live",
    label: "Threads",
    href: "https://www.threads.com/@silverspinestudio",
    icon: TbBrandThreads,
  },
];

/**
 * Items inside the Logo Hub modal (grouped by category).
 * status: "live" = real profile URL · "needed" = still using a generic homepage (create next)
 */
export const HUB_ITEMS = [
  {
    key: "amazon",
    label: "Amazon Author Central",
    href: "https://amazon.com",
    icon: SiAmazon,
    category: "Writing",
    status: "needed",
    nextStep: "Claim Author Central at author.amazon.com and paste your author page URL here.",
  },
  {
    key: "goodreads",
    label: "Goodreads",
    href: "https://goodreads.com",
    icon: SiGoodreads,
    category: "Writing",
    status: "needed",
    nextStep: "Join Author Program, claim Leameso James, then paste your Goodreads author URL.",
  },
  {
    key: "bookbub",
    label: "BookBub",
    href: "https://bookbub.com",
    icon: SiBookbub,
    category: "Writing",
    status: "needed",
    nextStep: "Create a BookBub partner/author profile, then paste the profile URL.",
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
    href: "https://pinterest.com",
    icon: FaPinterest,
    category: "Social",
    status: "needed",
    nextStep: "Create a Pinterest business/profile for book boards, then paste URL.",
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