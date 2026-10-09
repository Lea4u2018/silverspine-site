/**
 * Free review storage (no Firebase / no Google billing).
 * Production: GitHub Contents API (GITHUB_TOKEN).
 * Local fallback: data/reviews.json on disk.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const REPO = process.env.GITHUB_REPO || "Lea4u2018/silverspine-site";
const BRANCH = process.env.GITHUB_REVIEWS_BRANCH || "restore-site-2025-10-25";
const FILE_PATH = "data/reviews.json";
const LOCAL_FILE = path.join(process.cwd(), FILE_PATH);

function token() {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

function emptyStore() {
  return { reviews: [] };
}

function normalizeStore(data) {
  if (!data || typeof data !== "object") return emptyStore();
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  return { reviews };
}

async function githubGet() {
  const t = token();
  if (!t) return null;
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "silverspine-site",
    },
  });
  if (res.status === 404) return { store: emptyStore(), sha: null };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const decoded = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { store: normalizeStore(JSON.parse(decoded || "{}")), sha: json.sha };
}

async function githubPut(store, sha, message) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set in Vercel.");
  const body = {
    message,
    content: Buffer.from(JSON.stringify(store, null, 2) + "\n", "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "silverspine-site",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`GitHub write failed (${res.status}): ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
}

function localGet() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return emptyStore();
    return normalizeStore(JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")));
  } catch {
    return emptyStore();
  }
}

function localPut(store) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(store, null, 2) + "\n", "utf8");
}

export async function readStore() {
  if (token()) {
    const g = await githubGet();
    return g.store;
  }
  return localGet();
}

async function writeStore(mutator, message) {
  if (token()) {
    // Retry on 409 — two readers can submit at once and race the file SHA.
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const g = await githubGet();
        const next = mutator(structuredClone(g.store));
        await githubPut(next, g.sha, message);
        return next;
      } catch (err) {
        lastErr = err;
        if (err?.status !== 409 || attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
      }
    }
    throw lastErr;
  }
  // Local / preview without token
  const cur = localGet();
  const next = mutator(structuredClone(cur));
  localPut(next);
  return next;
}

export function newReviewId() {
  return crypto.randomBytes(8).toString("hex");
}

export async function listApproved() {
  const store = await readStore();
  return store.reviews
    .filter((r) => r.approved && !r.rejected)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function listPending() {
  const store = await readStore();
  return store.reviews
    .filter((r) => !r.approved && !r.rejected)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function listAllForAdmin() {
  const store = await readStore();
  return store.reviews.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function addPendingReview({ name, text, rating }) {
  const review = {
    id: newReviewId(),
    name,
    text,
    rating,
    approved: false,
    rejected: false,
    createdAt: new Date().toISOString(),
  };
  await writeStore((store) => {
    store.reviews.unshift(review);
    return store;
  }, `review: pending ${review.id}`);
  return review;
}

export async function approveReview(id) {
  let found = null;
  await writeStore((store) => {
    const r = store.reviews.find((x) => x.id === id);
    if (!r) throw new Error("Review not found");
    r.approved = true;
    r.rejected = false;
    r.approvedAt = new Date().toISOString();
    found = r;
    return store;
  }, `review: approve ${id}`);
  return found;
}

export async function rejectReview(id) {
  let found = null;
  await writeStore((store) => {
    const r = store.reviews.find((x) => x.id === id);
    if (!r) throw new Error("Review not found");
    r.approved = false;
    r.rejected = true;
    r.rejectedAt = new Date().toISOString();
    found = r;
    return store;
  }, `review: reject ${id}`);
  return found;
}

export async function unpublishReview(id) {
  let found = null;
  await writeStore((store) => {
    const r = store.reviews.find((x) => x.id === id);
    if (!r) throw new Error("Review not found");
    r.approved = false;
    r.rejected = false;
    found = r;
    return store;
  }, `review: unpublish ${id}`);
  return found;
}

export function storageMode() {
  return token() ? "github" : "local-file";
}
