/** Admin roles — owner (Leameso) vs limited assistant. */

export const ADMIN_ROLE = {
  OWNER: "owner",
  ASSISTANT: "assistant",
};

/** Tabs visible on /admin */
export const TABS_BY_ROLE = {
  owner: ["reviews", "blog", "launch", "promo", "next", "neighbors", "search"],
  assistant: ["reviews", "launch", "neighbors"],
};

export function tabsForRole(role) {
  return TABS_BY_ROLE[role === ADMIN_ROLE.ASSISTANT ? "assistant" : "owner"] || TABS_BY_ROLE.owner;
}

/** Launch API actions assistants may run (day-to-day ops — no files, templates, or mass sends). */
export const ASSISTANT_LAUNCH_ACTIONS = new Set([
  "send-follow-up",
  "save-tracking-note",
  "add-contact",
  "update-contact",
  "remove-contact",
  "import-submissions",
  "dismiss-submissions",
  "add-recipient",
]);

export function assistantCanLaunchAction(action) {
  return ASSISTANT_LAUNCH_ACTIONS.has(String(action || "").trim());
}

export function assistantCanReviewAction(action) {
  return ["approve", "reject"].includes(String(action || "").trim());
}

export function assistantCanNeighborAction(action) {
  return ["approve", "reject"].includes(String(action || "").trim());
}

export const ASSISTANT_CAPABILITY_SUMMARY = [
  "Contact hub — search, notes, send pre-written follow-up letters",
  "Site inbox — import ARC / launch-list submissions, dismiss spam",
  "Reviews — approve or decline pending reader reviews",
  "Community — approve or decline porch listing requests",
  "Visitor counts (read-only)",
  "Reply translator for review responses",
];

export const OWNER_ONLY_SUMMARY = [
  "Blog posts and pinned content",
  "Launch countdown dates and public schedule",
  "Email letter templates and Aug 17 selection notices",
  "Sending files (sneak peek, ARC, full digital attachments)",
  "Bulk imports, removing people from send lists",
  "Next Up scheduler and search monitor",
];
