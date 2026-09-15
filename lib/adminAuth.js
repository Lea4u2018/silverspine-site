import crypto from "crypto";
import { ADMIN_ROLE } from "@/lib/adminRoles";

const COOKIE_NAME = "sss_admin";
const TOKEN_VERSION = "sss-admin-v1";
const ASSISTANT_TOKEN_VERSION = "sss-assistant-v1";

export function getAdminPassword() {
  return String(process.env.ADMIN_PASSWORD || "").trim();
}

export function getAssistantPassword() {
  return String(process.env.ASSISTANT_PASSWORD || "").trim();
}

export function makeAdminToken() {
  const password = getAdminPassword();
  if (!password) return "";
  return crypto.createHmac("sha256", password).update(TOKEN_VERSION).digest("hex");
}

export function makeAssistantToken() {
  const password = getAssistantPassword();
  if (!password) return "";
  return crypto.createHmac("sha256", password).update(ASSISTANT_TOKEN_VERSION).digest("hex");
}

function tokensEqual(a, b) {
  if (!a || !b || typeof a !== "string" || typeof b !== "string") return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function isValidAdminToken(token) {
  const expected = makeAdminToken();
  if (!expected || typeof token !== "string" || token.length < 16) return false;
  return tokensEqual(token, expected);
}

export function isValidAssistantToken(token) {
  const expected = makeAssistantToken();
  if (!expected || typeof token !== "string" || token.length < 16) return false;
  return tokensEqual(token, expected);
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

/** Resolve signed-in role from session cookie. */
export function resolveAdminSession(req) {
  const token = readAdminTokenFromReq(req);
  if (isValidAdminToken(token)) {
    return { ok: true, role: ADMIN_ROLE.OWNER };
  }
  if (isValidAssistantToken(token)) {
    return { ok: true, role: ADMIN_ROLE.ASSISTANT };
  }
  return { ok: false, role: null };
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {{ ownerOnly?: boolean }} opts
 * @returns {{ role: string } | null}
 */
export function requireAuth(req, res, { ownerOnly = false } = {}) {
  const session = resolveAdminSession(req);
  if (!session.ok) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return null;
  }
  if (ownerOnly && session.role !== ADMIN_ROLE.OWNER) {
    res.status(403).json({ ok: false, error: "Studio owner access required for this action." });
    return null;
  }
  return session;
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
    if (tokensEqual(token, expected)) return true;
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
