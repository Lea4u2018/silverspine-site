// /lib/socials.js
// React-icons version (original structure). CORE_ICONS + HUB_ITEMS.

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaEnvelope,
  FaLinkedin,
  FaPinterest,
  FaSnapchatGhost,
  FaGlobe,
} from "react-icons/fa";
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
 * Keys preserved exactly as your working version used: fb, ig, tt, yt, th, em.
 * Updated to your live handles where known.
 */
export const CORE_ICONS = [
  {
    key: "fb",
    label: "Facebook (Silver Spine Studio Page)",
    href: "https://www.facebook.com/silverspinestudio",
    icon: FaFacebook,
  },
  {
    key: "ig",
    label: "Instagram",
    href: "https://www.instagram.com/silverspinestudio",
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
    // Replace with your exact channel once set, e.g. https://www.youtube.com/@SilverSpineStudio
    href: "https://www.youtube.com/@your-channel",
    icon: FaYoutube,
  },
  {
    key: "th",
    label: "Threads",
    href: "https://www.threads.net/@silverspinestudio",
    icon: TbBrandThreads,
  },
  {
    key: "em",
    label: "Email",
    href: "mailto:contact@silverspinestudio.com",
    icon: FaEnvelope,
  },
];

/**
 * Items inside the Logo Hub modal (grouped by category).
 * Globe/website lives here (not in CORE_ICONS).
 * Author platforms left with placeholders so you can drop exact IDs/handles.
 */
export const HUB_ITEMS = [
  // Writing / Author
  {
    key: "goodreads",
    label: "Goodreads",
    href: "https://www.goodreads.com/author/show/YOUR_ID",
    icon: SiGoodreads,
    category: "Writing",
  },
  {
    key: "bookbub",
    label: "BookBub",
    href: "https://www.bookbub.com/authors/YOUR_ID",
    icon: SiBookbub,
    category: "Writing",
  },
  {
    key: "amazon",
    label: "Amazon Author",
    href: "https://www.amazon.com/author/YOUR_HANDLE",
    icon: SiAmazon,
    category: "Writing",
  },
  {
    key: "substack",
    label: "Substack",
    href: "https://your-substack.substack.com",
    icon: SiSubstack,
    category: "Writing",
  },
  {
    key: "medium",
    label: "Medium",
    href: "https://medium.com/@your-handle",
    icon: SiMedium,
    category: "Writing",
  },

  // Social / Network
  {
    key: "snapchat",
    label: "Snapchat",
    href: "https://www.snapchat.com/add/your-handle",
    icon: FaSnapchatGhost,
    category: "Social",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/your-handle",
    icon: FaLinkedin,
    category: "Network",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    href: "https://www.pinterest.com/your-handle",
    icon: FaPinterest,
    category: "Social",
  },

  // Contact
  {
    key: "website",
    label: "Website / Blog",
    href: "https://silverspinestudio.com",
    icon: FaGlobe,
    category: "Contact",
  },

  // Intentionally excluding X/Twitter.
];
