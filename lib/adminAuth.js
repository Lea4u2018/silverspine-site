import crypto from "crypto";

const COOKIE_NAME = "sss_admin";
const TOKEN_VERSION = "sss-admin-v1";

export function getAdminPassword() {
  return String(process.env.ADMIN_PASSWORD || "").trim();
}

export function makeAdminToken() {
  const password = getAdminPassword();
  if (!password) return "";
  return crypto.createHmac("sha256", password).update(TOKEN_VERSION).digest("hex");
}

export function isValidAdminToken(token) {
  const expected = makeAdminToken();
  if (!expected || typeof token !== "string" || token.length < 16) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function readAdminTokenFromReq(req) {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${COOKIE_NAME}=`)) {
      return decodeURIComponent(part.slice(COOKIE_NAME.length + 1));
    }
  }
  return "";
}

export function adminCookieHeader(token, { clear = false } = {}) {
  if (clear) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }
  const maxAge = 60 * 60 * 24 * 14; // 14 days
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

const STUDIO_COOKIE = "sss_studio";
const STUDIO_VERSION = "sss-studio-owner-v1";

export function makeStudioToken() {
  const password = getAdminPassword();
  if (!password) return "";
  return crypto.createHmac("sha256", password).update(STUDIO_VERSION).digest("hex");
}

export function isStudioMachine(req) {
  if (isValidAdminToken(readAdminTokenFromReq(req))) return true;
  const expected = makeStudioToken();
  if (!expected) return false;
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part.startsWith(`${STUDIO_COOKIE}=`)) continue;
    const token = decodeURIComponent(part.slice(STUDIO_COOKIE.length + 1));
    try {
      if (token.length === expected.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

export function studioCookieHeader() {
  const token = makeStudioToken();
  if (!token) return "";
  const maxAge = 60 * 60 * 24 * 400;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${STUDIO_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export { COOKIE_NAME };
