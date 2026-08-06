/** Top navigation — Shop sits after Reviews so purchase is never buried in the footer. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/books#featured-book", label: "Shop" },
];

export function isNavActive(pathname, asPath, href) {
  if (href === "/") return pathname === "/";
  if (href.includes("#")) {
    return asPath === href || asPath.startsWith(href);
  }
  // Keep /books active for the Books tab, not the Shop hash link
  if (href === "/books") {
    return pathname === "/books" || pathname.startsWith("/books/");
  }
  return asPath.startsWith(href) || pathname.startsWith(href);
}
