import { requireAuth } from "@/lib/adminAuth";
import { SEARCH_MONITOR, SITE_ORIGIN } from "@/lib/searchMonitor";

async function probe(url, { expectIncludes } = {}) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SilverSpine-AdminSearchHealth/1.0" },
      redirect: "follow",
    });
    const text = await res.text();
    const includes = expectIncludes ? text.includes(expectIncludes) : true;
    return {
      url,
      ok: res.ok && includes,
      status: res.status,
      detail: !res.ok
        ? `HTTP ${res.status}`
        : !includes
          ? "Unexpected response body"
          : "OK",
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: 0,
      detail: err.message || "Fetch failed",
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!requireAuth(req, res, { ownerOnly: true })) return;

  const verifyUrl = `${SITE_ORIGIN}/${SEARCH_MONITOR.googleVerificationFile}`;
  const [googleVerify, sitemap, robots] = await Promise.all([
    probe(verifyUrl, {
      expectIncludes: `google-site-verification: ${SEARCH_MONITOR.googleVerificationFile}`,
    }),
    probe(SEARCH_MONITOR.sitemapUrl, { expectIncludes: "<urlset" }),
    probe(SEARCH_MONITOR.robotsUrl, { expectIncludes: "Sitemap:" }),
  ]);

  const checks = { googleVerify, sitemap, robots };
  const allOk = Object.values(checks).every((c) => c.ok);

  return res.status(200).json({
    ok: true,
    allOk,
    checkedAt: new Date().toISOString(),
    checks,
    submitInGsc: SEARCH_MONITOR.sitemapUrl,
  });
}
