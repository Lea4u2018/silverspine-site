/**
 * Visitor counts for Studio Admin (not you).
 * Production: GitHub Contents API. Local: data/visits.json
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const REPO = process.env.GITHUB_REPO || "Lea4u2018/silverspine-site";
const BRANCH = process.env.GITHUB_REVIEWS_BRANCH || "restore-site-2025-10-25";
const FILE_PATH = "data/visits.json";
const LOCAL_FILE = path.join(process.cwd(), FILE_PATH);

function token() {
  return String(process.env.GITHUB_TOKEN || "").trim();
}

export function mountainDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function emptyStore() {
  return { people: 0, visits: 0, days: {}, known: {} };
}

function normalizeDay(row) {
  if (!row || typeof row !== "object") return { visits: 0, ids: [] };
  const ids = Array.isArray(row.ids) ? row.ids.map(String) : [];
  return { visits: Number(row.visits) || 0, ids };
}

function normalizeStore(data) {
  if (!data || typeof data !== "object") return emptyStore();
  const days = {};
  if (data.days && typeof data.days === "object") {
    for (const [k, v] of Object.entries(data.days)) {
      days[k] = normalizeDay(v);
    }
  }
  return {
    people: Number(data.people) || 0,
    visits: Number(data.visits) || 0,
    days,
    known: data.known && typeof data.known === "object" ? data.known : {},
  };
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

export async function readVisits() {
  if (token()) {
    const g = await githubGet();
    return g.store;
  }
  return localGet();
}

async function writeVisits(mutator, message) {
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
  const next = mutator(structuredClone(localGet()));
  localPut(next);
  return next;
}

export function hashVisitorId(id) {
  return crypto.createHash("sha256").update(String(id || "")).digest("hex").slice(0, 16);
}

export async function recordVisit(visitorId) {
  const id = hashVisitorId(visitorId);
  if (!id) return;
  const day = mountainDate();
  await writeVisits((store) => {
    if (!store.days[day]) store.days[day] = { visits: 0, ids: [] };
    store.visits += 1;
    store.days[day].visits += 1;
    if (!store.days[day].ids.includes(id)) store.days[day].ids.push(id);
    if (!store.known[id]) {
      store.known[id] = day;
      store.people += 1;
    }
    return store;
  }, `visit: ${day}`);
}

export function summarizeVisits(store) {
  const s = normalizeStore(store);
  const today = mountainDate();
  const todayRow = s.days[today] || { visits: 0, ids: [] };
  const weekIds = new Set();
  let weekVisits = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const row = s.days[mountainDate(d)];
    if (!row) continue;
    weekVisits += Number(row.visits) || 0;
    for (const id of row.ids || []) weekIds.add(id);
  }
  return {
    todayPeople: (todayRow.ids || []).length,
    todayVisits: Number(todayRow.visits) || 0,
    weekPeople: weekIds.size,
    weekVisits,
    allPeople: s.people,
    allVisits: s.visits,
    timezone: "America/Denver",
  };
}

export function storageMode() {
  return token() ? "github" : "local-file";
}
