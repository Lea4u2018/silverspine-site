/**
 * Blog post storage (same pattern as reviews — GitHub in prod, local file in dev).
 * Free: no Firebase. Uses GITHUB_TOKEN + data/blog-posts.json
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const REPO = process.env.GITHUB_REPO || "Lea4u2018/silverspine-site";
const BRANCH = process.env.GITHUB_REVIEWS_BRANCH || "restore-site-2025-10-25";
const FILE_PATH = "data/blog-posts.json";
const LOCAL_FILE = path.join(process.cwd(), FILE_PATH);
const UPLOAD_DIR = "public/blog/uploads";

function token() {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

function emptyStore() {
  return { posts: [] };
}

function normalizeStore(data) {
  if (!data || typeof data !== "object") return emptyStore();
  const posts = Array.isArray(data.posts) ? data.posts : [];
  return { posts };
}

function normalizePost(p) {
  if (!p || typeof p !== "object") return null;
  const mediaType = ["none", "image", "video"].includes(p.mediaType) ? p.mediaType : "none";
  return {
    id: String(p.id || ""),
    title: String(p.title || "").trim(),
    about: String(p.about || "").trim(),
    body: String(p.body || "").trim(),
    mediaType,
    mediaUrl: String(p.mediaUrl || "").trim(),
    mediaPoster: String(p.mediaPoster || "").trim(),
    mediaCaption: String(p.mediaCaption || "").trim(),
    audioUrl: String(p.audioUrl || "").trim(),
    videoLive: p.mediaType === "video" ? p.videoLive !== false : false,
    published: Boolean(p.published),
    createdAt: String(p.createdAt || ""),
    updatedAt: String(p.updatedAt || p.createdAt || ""),
  };
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
  return { content: json.content, sha: json.sha, encoding: json.encoding };
}

async function githubPutFile(filePath, base64Content, sha, message) {
  const t = token();
  if (!t) throw new Error("GITHUB_TOKEN is not set in Vercel.");
  const body = {
    message,
    content: base64Content,
    branch: BRANCH,
  };
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

export async function readStore() {
  if (token()) {
    try {
      const g = await githubGet();
      if (g?.store?.posts?.length) return g.store;
    } catch (err) {
      console.error("blog github read failed, using local file:", err?.message || err);
    }
  }
  return localGet();
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

export function newPostId() {
  return crypto.randomBytes(8).toString("hex");
}

export function storageMode() {
  return token() ? "github" : "local-file";
}

export async function listPublished() {
  const store = await readStore();
  return store.posts
    .map(normalizePost)
    .filter((p) => p && p.published && p.title)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function listAllForAdmin() {
  const store = await readStore();
  return store.posts
    .map(normalizePost)
    .filter((p) => p && p.id)
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
}

export async function createPost(input) {
  const now = new Date().toISOString();
  const post = normalizePost({
    id: newPostId(),
    title: input.title,
    body: input.body,
    mediaType: input.mediaType || "none",
    mediaUrl: input.mediaUrl || "",
    mediaCaption: input.mediaCaption || "",
    videoLive: input.mediaType === "video" ? input.videoLive !== false : false,
    published: input.published !== false,
    createdAt: now,
    updatedAt: now,
  });
  if (!post.title) throw new Error("Title is required.");
  await writeStore((store) => {
    store.posts.unshift(post);
    return store;
  }, `blog: create ${post.id}`);
  return post;
}

export async function updatePost(id, input) {
  let found = null;
  await writeStore((store) => {
    const i = store.posts.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("Post not found");
    const cur = store.posts[i];
    const next = normalizePost({
      ...cur,
      title: input.title != null ? input.title : cur.title,
      body: input.body != null ? input.body : cur.body,
      mediaType: input.mediaType != null ? input.mediaType : cur.mediaType,
      mediaUrl: input.mediaUrl != null ? input.mediaUrl : cur.mediaUrl,
      mediaCaption: input.mediaCaption != null ? input.mediaCaption : cur.mediaCaption,
      videoLive: input.videoLive != null ? input.videoLive : cur.videoLive,
      published: input.published != null ? input.published : cur.published,
      updatedAt: new Date().toISOString(),
    });
    if (!next.title) throw new Error("Title is required.");
    store.posts[i] = next;
    found = next;
    return store;
  }, `blog: update ${id}`);
  return found;
}

export async function deletePost(id) {
  await writeStore((store) => {
    const before = store.posts.length;
    store.posts = store.posts.filter((x) => x.id !== id);
    if (store.posts.length === before) throw new Error("Post not found");
    return store;
  }, `blog: delete ${id}`);
  return true;
}

/**
 * Save an uploaded media file into public/blog/uploads/ (GitHub or local).
 * Returns the public URL path e.g. /blog/uploads/abc.jpg
 */
export async function saveUploadedMedia({ filename, base64, mimeType }) {
  const safeExt =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : mimeType === "image/gif"
          ? "gif"
          : mimeType === "video/mp4"
            ? "mp4"
            : mimeType === "video/webm"
              ? "webm"
              : mimeType === "image/jpeg" || mimeType === "image/jpg"
                ? "jpg"
                : String(filename || "")
                    .split(".")
                    .pop()
                    ?.toLowerCase() || "bin";

  const allowed = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"];
  if (!allowed.includes(safeExt)) {
    throw new Error("Use JPG, PNG, WEBP, GIF, MP4, or WEBM.");
  }

  const cleanB64 = String(base64 || "").replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(cleanB64, "base64");
  const maxBytes = safeExt === "mp4" || safeExt === "webm" ? 4.2 * 1024 * 1024 : 3.5 * 1024 * 1024;
  if (bytes.length > maxBytes) {
    throw new Error(
      safeExt === "mp4" || safeExt === "webm"
        ? "Video is too large for direct upload (max ~4MB). Put the file in public/blog/ and paste the path instead (e.g. /blog/my-clip.mp4)."
        : "Image is too large (max ~3.5MB). Compress it or paste a path under /blog/."
    );
  }

  const id = crypto.randomBytes(6).toString("hex");
  const outName = `${Date.now()}-${id}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
  const relPath = `${UPLOAD_DIR}/${outName}`;
  const publicUrl = `/blog/uploads/${outName}`;

  if (token()) {
    await githubPutFile(relPath, cleanB64, null, `blog: upload ${outName}`);
  } else {
    const full = path.join(process.cwd(), relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, bytes);
  }

  return { url: publicUrl, path: relPath };
}
