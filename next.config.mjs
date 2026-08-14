/** @type {import('next').NextConfig} */

/** Keep serverless bundles small — admin mail only needs public/distribution at runtime. */
const ADMIN_TRACE_EXCLUDES = [
  "./public/covers/**",
  "./public/videos/**",
  "./public/blog/**",
  "./public/*.mp4",
  "./public/*.MP4",
  "./public/*.mp3",
  "./public/*.m4a",
  "./public/*.mov",
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // hide "X-Powered-By: Next.js"
  serverExternalPackages: ["nodemailer"],
  experimental: {
    outputFileTracingExcludes: {
      "/api/admin/launch": ADMIN_TRACE_EXCLUDES,
      "/api/admin/neighbors": ADMIN_TRACE_EXCLUDES,
      "/api/admin/reviews": ADMIN_TRACE_EXCLUDES,
      "/api/contact-safe": ADMIN_TRACE_EXCLUDES,
      "/api/neighbors/submit": ADMIN_TRACE_EXCLUDES,
    },
  },
  async headers() {
    return [
      {
        source: "/books/shadows-of-a-ghost",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/books/the-gathering-storm",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/2-shadows-of-a-ghost-arthur-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/3-the-gathering-storm-bee-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/4-fragile-unbroken-elliot-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/5-the-machine-lancaster-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/6-scarred-truth-saxe-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/7-scorched-earth-francis-blank-cover.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/shadows-of-a-ghost.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/covers/gathering-storm.jpg",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
