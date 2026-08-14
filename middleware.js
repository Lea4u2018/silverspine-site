import { NextResponse } from "next/server";

/**
 * Edge shield for Silver Spine Studio™
 * - Blocks common scanner / exploit probes
 * - Adds baseline security headers on every response
 * This is hardening, not magic: keep ADMIN_PASSWORD + Firestore rules strong too.
 */

const BLOCKED_PATH_PREFIXES = [
  "/wp-admin",
  "/wp-login",
  "/wordpress",
  "/xmlrpc.php",
  "/phpmyadmin",
  "/pma",
  "/admin.php",
  "/administrator",
  "/.env",
  "/.git",
  "/.svn",
  "/.aws",
  "/cgi-bin",
  "/vendor/phpunit",
  "/actuator",
  "/server-status",
  "/debug",
  "/.well-known/security.txt.bak",
];

const BLOCKED_EXACT = new Set([
  "/wp-login.php",
  "/xmlrpc.php",
  "/config.json",
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.git/config",
  "/composer.json",
  "/package-lock.json.bak",
]);

function isProbe(pathname) {
  const p = pathname.toLowerCase();

  // Never block the real studio admin (password-gated) or our APIs.
  if (p === "/admin" || p.startsWith("/api/")) return false;

  if (BLOCKED_EXACT.has(p)) return true;

  for (const prefix of BLOCKED_PATH_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return true;
  }

  // Generic junk probes (WordPress / PHP scanners)
  if (p.endsWith(".php") || p.endsWith(".asp") || p.endsWith(".aspx") || p.endsWith(".jsp")) return true;
  if (p.includes("wp-content") || p.includes("wp-includes") || p.includes("wp-login")) return true;
  if (p.includes("/.env") || p.includes("/.git/")) return true;
  return false;
}

function applySecurityHeaders(res) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  // Help browsers treat HTTPS as required (Vercel already terminates TLS)
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  // Mild CSP: allow Firebase + Gumroad while blocking most odd plugin origins
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://gumroad.com https://*.gumroad.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gumroad.com https://*.gumroad.com https://www.gstatic.com https://*.googleapis.com https://apis.google.com https://translate.google.com https://translate.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://translate.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://gumroad.com https://*.gumroad.com https://translate.googleapis.com https://translate.google.com https://api.mymemory.translated.net https://api-free.deepl.com https://api.deepl.com",
      "frame-src 'self' https://gumroad.com https://*.gumroad.com https://js.stripe.com https://translate.google.com https://www.google.com",
      "media-src 'self' blob: data:",
      "upgrade-insecure-requests",
    ].join("; ")
  );
  return res;
}

const HIDDEN_BOOK_PATHS = new Set([
  "/books/shadows-of-a-ghost",
  "/books/the-gathering-storm",
  "/covers/2-shadows-of-a-ghost-arthur-blank-cover.jpg",
  "/covers/3-the-gathering-storm-bee-blank-cover.jpg",
  "/covers/4-fragile-unbroken-elliot-blank-cover.jpg",
  "/covers/5-the-machine-lancaster-blank-cover.jpg",
  "/covers/6-scarred-truth-saxe-blank-cover.jpg",
  "/covers/7-scorched-earth-francis-blank-cover.jpg",
  "/covers/shadows-of-a-ghost.jpg",
  "/covers/gathering-storm.jpg",
]);

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (HIDDEN_BOOK_PATHS.has(pathname.toLowerCase())) {
    const gone = new NextResponse("Gone.", { status: 410 });
    gone.headers.set("X-Robots-Tag", "noindex, nofollow");
    return applySecurityHeaders(gone);
  }

  if (isProbe(pathname)) {
    const blocked = new NextResponse("Not found.", { status: 404 });
    return applySecurityHeaders(blocked);
  }

  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

export const config = {
  matcher: [
    "/books/shadows-of-a-ghost",
    "/books/the-gathering-storm",
    "/covers/2-shadows-of-a-ghost-arthur-blank-cover.jpg",
    "/covers/3-the-gathering-storm-bee-blank-cover.jpg",
    "/covers/4-fragile-unbroken-elliot-blank-cover.jpg",
    "/covers/5-the-machine-lancaster-blank-cover.jpg",
    "/covers/6-scarred-truth-saxe-blank-cover.jpg",
    "/covers/7-scorched-earth-francis-blank-cover.jpg",
    "/covers/shadows-of-a-ghost.jpg",
    "/covers/gathering-storm.jpg",
    /*
     * Run on all paths except Next internals and common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|m4a|mp4|webm|wav|txt|xml|json)$).*)",
  ],
};
