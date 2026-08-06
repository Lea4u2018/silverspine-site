/** Top navigation — Shop is its own page with every storefront option. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/shop", label: "Shop" },
];

export function isNavActive(pathname, asPath, href) {
  if (href === "/") return pathname === "/";
  if (href === "/books") {
    return pathname === "/books" || pathname.startsWith("/books/");
  }
  if (href === "/shop") {
    return pathname === "/shop";
  }
  return asPath.startsWith(href) || pathname.startsWith(href);
}
