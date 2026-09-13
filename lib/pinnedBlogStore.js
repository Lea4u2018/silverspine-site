/**
 * Pinned blog announcements (the main cards on /blog) — editable from Admin.
 */
import fs from "fs";
import path from "path";
import { PINNED_BLOG_DEFAULTS } from "@/lib/pinnedBlogDefaults";

const REPO = process.env.GITHUB_REPO || "Lea4u2018/silverspine-site";
const BRANCH = process.env.GITHUB_REVIEWS_BRANCH || "restore-site-2025-10-25";
const FILE_PATH = "data/pinned-blog-posts.json";
const LOCAL_FILE = path.join(process.cwd(), FILE_PATH);

function token() {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

function emptyStore() {
  return { pinned: [] };
}

function normalizePinned(p) {
  if (!p || typeof p !== "object") return null;
  const mediaType = ["none", "image", "video", "figure", "character-wheel"].includes(p.mediaType)
    ? p.mediaType
    : "none";
  const bullets = Array.isArray(p.bullets) ? p.bullets.map((b) => String(b).trim()).filter(Boolean) : [];
  const actions = Array.isArray(p.actions) ? p.actions.map((a) => String(a).trim()).filter(Boolean) : [];
  let mediaUrl = String(p.mediaUrl || "").trim();
  let mediaPoster = String(p.mediaPoster || "").trim();
  let mediaCaption = String(p.mediaCaption || "").trim();
  let figureKey = String(p.figureKey || "").trim();

  if (mediaType === "none") {
    mediaUrl = "";
    mediaPoster = "";
    mediaCaption = "";
    figureKey = "";
  } else if (mediaType === "figure") {
    mediaUrl = "";
    mediaPoster = "";
    if (!figureKey) figureKey = "cover";
  } else if (mediaType === "image") {
    figureKey = "";
    mediaPoster = "";
  } else if (mediaType === "video") {
    figureKey = "";
  }

  return {
    id: String(p.id || ""),
    category: String(p.category || "Announcement").trim(),
    dateISO: String(p.dateISO || "").trim(),
    title: String(p.title || "").trim(),
    body: String(p.body || "").trim(),
    bullets,
    mediaType,
    mediaUrl,
    mediaPoster,
    mediaCaption,
    videoLive: p.videoLive !== false,
    figureKey,
    mediaFrame: String(p.mediaFrame || "").trim(),
    cardCompact: p.cardCompact === true,
    confetti: p.confetti === true,
    expandBody: String(p.expandBody || "").trim(),
    expandLabel: String(p.expandLabel || "View details").trim(),
    actions,
    published: p.published !== false,
    sortOrder: Number.isFinite(Number(p.sortOrder)) ? Number(p.sortOrder) : 0,
    createdAt: String(p.createdAt || ""),
    updatedAt: String(p.updatedAt || p.createdAt || ""),
  };
}

function normalizeStore(data) {
  if (!data || typeof data !== "object") return emptyStore();
  const pinned = Array.isArray(data.pinned) ? data.pinned.map(normalizePinned).filter(Boolean) : [];
  return { pinned };
}

function withTimestamps() {
  const now = new Date().toISOString();
  return PINNED_BLOG_DEFAULTS.map((p) =>
    normalizePinned({
      ...p,
      createdAt: now,
      updatedAt: now,
    })
  );
}

async function githubGetFile(filePath) {
  const t = token();
  if (!t) return null;
  const url = `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "silverspine-site",
    },
  });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return { content: json.content, sha: json.sha };
}

async function githubPutFile(filePath, base64Content, sha, message) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set in Vercel.");
  const body = { message, content: base64Content, branch: BRANCH };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${REPO}/contents/${filePath}`;
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
  return res.json();
}

async function githubGet() {
  const g = await githubGetFile(FILE_PATH);
  if (!g) return null;
  if (g.content == null) return { store: emptyStore(), sha: null };
  const decoded = Buffer.from(String(g.content).replace(/\n/g, ""), "base64").toString("utf8");
  return { store: normalizeStore(JSON.parse(decoded || "{}")), sha: g.sha };
}

async function githubPut(store, sha, message) {
  const content = Buffer.from(JSON.stringify(store, null, 2) + "\n", "utf8").toString("base64");
  await githubPutFile(FILE_PATH, content, sha, message);
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

async function readStoreRaw() {
  if (token()) {
    const g = await githubGet();
    return g;
  }
  return { store: localGet(), sha: null };
}

async function writeStore(mutator, message) {
  if (token()) {
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
  const cur = localGet();
  const next = mutator(structuredClone(cur));
  localPut(next);
  return next;
}

export function pinnedStorageMode() {
  return token() ? "github" : "local-file";
}

/** Seed defaults when file is missing or empty (first admin load). */
export async function ensurePinnedSeeded() {
  const g = await readStoreRaw();
  if (g.store.pinned.length > 0) return g.store;
  const seeded = { pinned: withTimestamps() };
  if (token()) {
    await githubPut(seeded, g.sha, "blog: seed pinned announcements");
  } else {
    localPut(seeded);
  }
  return seeded;
}

export async function listPinnedPublished() {
  await ensurePinnedSeeded();
  const store = token() ? (await githubGet()).store : localGet();
  return store.pinned
    .filter((p) => p.published && p.title)
    .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)) || b.sortOrder - a.sortOrder);
}

export async function listPinnedForAdmin() {
  await ensurePinnedSeeded();
  const store = token() ? (await githubGet()).store : localGet();
  return store.pinned
    .slice()
    .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)) || b.sortOrder - a.sortOrder);
}

export async function updatePinned(id, input) {
  let found = null;
  await writeStore((store) => {
    const i = store.pinned.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("Pinned post not found");
    const cur = store.pinned[i];
    const next = normalizePinned({
      ...cur,
      category: input.category != null ? input.category : cur.category,
      dateISO: input.dateISO != null ? input.dateISO : cur.dateISO,
      title: input.title != null ? input.title : cur.title,
      body: input.body != null ? input.body : cur.body,
      bullets: input.bullets != null ? input.bullets : cur.bullets,
      mediaType: input.mediaType != null ? input.mediaType : cur.mediaType,
      mediaUrl: input.mediaUrl != null ? input.mediaUrl : cur.mediaUrl,
      mediaPoster: input.mediaPoster != null ? input.mediaPoster : cur.mediaPoster,
      mediaCaption: input.mediaCaption != null ? input.mediaCaption : cur.mediaCaption,
      videoLive: input.videoLive != null ? input.videoLive : cur.videoLive,
      figureKey: input.figureKey != null ? input.figureKey : cur.figureKey,
      expandBody: input.expandBody != null ? input.expandBody : cur.expandBody,
      expandLabel: input.expandLabel != null ? input.expandLabel : cur.expandLabel,
      actions: input.actions != null ? input.actions : cur.actions,
      published: input.published != null ? input.published : cur.published,
      sortOrder: input.sortOrder != null ? input.sortOrder : cur.sortOrder,
      updatedAt: new Date().toISOString(),
    });
    if (!next.title) throw new Error("Title is required.");
    store.pinned[i] = next;
    found = next;
    return store;
  }, `blog: update pinned ${id}`);
  return found;
}
