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
    href: "https://threads.net",
    icon: TbBrandThreads,
  },
];

/**
 * Items inside the Logo Hub modal (grouped by category).
 * Kept intact but safely parked behind the scenes since the button is hidden.
 */
export const HUB_ITEMS = [
  {
    key: "amazon",
    label: "Amazon Author Central",
    href: "https://amazon.com",
    icon: SiAmazon,
    category: "Writing",
  },
  {
    key: "goodreads",
    label: "Goodreads",
    href: "https://goodreads.com",
    icon: SiGoodreads,
    category: "Writing",
  },
  {
    key: "bookbub",
    label: "BookBub",
    href: "https://bookbub.com",
    icon: SiBookbub,
    category: "Writing",
  },
  {
    key: "substack",
    label: "Substack",
    href: "https://substack.com",
    icon: SiSubstack,
    category: "Writing",
  },
  {
    key: "medium",
    label: "Medium",
    href: "https://medium.com",
    icon: SiMedium,
    category: "Writing",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: FaLinkedin,
    category: "Network",
  },
  {
    key: "x",
    label: "X",
    href: "https://x.com",
    icon: FaXTwitter,
    category: "Social",
  },
  {
    key: "sc",
    label: "Snapchat",
    href: "https://snapchat.com",
    icon: FaSnapchatGhost,
    category: "Social",
  },
  {
    key: "pi",
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: FaPinterest,
    category: "Social",
  },
  {
    key: "website",
    label: "Website / Blog",
    href: "https://silverspinestudio.com",
    icon: FaGlobe,
    category: "Contact",
  },
];
