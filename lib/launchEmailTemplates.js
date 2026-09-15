import {
  ARC_TEAM_SIZE,
  DIGITAL_COPY_GIVEAWAY,
  LAUNCH_MILESTONES,
  NOVEL_PRICING,
} from "@/lib/store";

const SIGNOFF = [
  "",
  "Happy Sleuthing!",
  "",
  "Leameso James",
  "Silver Spine Studio™",
  "contact@silverspinestudio.com",
  "https://www.silverspinestudio.com",
].join("\n");

const COPYRIGHT_SNEAK = [
  "COPYRIGHT & LICENSE",
  "© Leameso James / Silver Spine Studio™. All rights reserved.",
  "This Extended Sneak Peek is licensed for your personal reading only. You may not copy, upload, resell, redistribute, or share the file or substantial excerpts except as allowed by law.",
].join("\n");

const COPYRIGHT_FULL = [
  "COPYRIGHT & LICENSE",
  "© Leameso James / Silver Spine Studio™. All rights reserved.",
  "This digital edition is licensed for your personal reading only. You may not copy, upload, resell, redistribute, or share the file or substantial excerpts except as allowed by law.",
].join("\n");

const COPYRIGHT_ARC = [
  "COPYRIGHT & LICENSE — ARC / EARLY RELEASE",
  "© Leameso James / Silver Spine Studio™. All rights reserved.",
  "This ARC / early-release file is licensed for your personal review only. You may share a fair, honest review, but you may not copy, upload, resell, redistribute, or share the file (or substantial excerpts) with others.",
].join("\n");

/** Every editable studio letter — tab id = `${group}-${key}` */
export const STUDIO_LETTER_CATALOG = [
  { tab: "distribution-sneakPeek", group: "distribution", key: "sneakPeek", label: "File · Sneak peek", category: "file", copyType: "sneakPeek", matchRoles: ["sneak-peek", "launch-list", "arc-selected", "arc-applicant"] },
  { tab: "distribution-fullDigital", group: "distribution", key: "fullDigital", label: "File · Full digital", category: "file", copyType: "fullDigital" },
  { tab: "distribution-arc", group: "distribution", key: "arc", label: "File · ARC delivery", category: "file", copyType: "arc" },
  { tab: "selection-arcSelected", group: "selection", key: "arcSelected", label: "Aug 17 · ARC chosen", category: "selection", selectionType: "arcSelected" },
  { tab: "selection-giveawayWinner", group: "selection", key: "giveawayWinner", label: "Aug 17 · Giveaway winner", category: "selection", selectionType: "giveawayWinner" },
  { tab: "followUp-arcApplicationReceived", group: "followUp", key: "arcApplicationReceived", label: "Follow-up · ARC application received · Oct 1–3", matchRoles: ["arc-applicant"], matchKinds: ["arc"] },
  { tab: "followUp-arcNotSelected", group: "followUp", key: "arcNotSelected", label: "Follow-up · ARC not selected", matchRoles: ["arc-applicant"] },
  { tab: "followUp-arcDeliveryReminder", group: "followUp", key: "arcDeliveryReminder", label: "Follow-up · ARC delivery reminder", matchRoles: ["arc-selected"] },
  { tab: "followUp-launchListWelcome", group: "followUp", key: "launchListWelcome", label: "Follow-up · Launch list welcome", matchRoles: ["launch-list"], matchKinds: ["list"] },
  { tab: "followUp-launchListDrawing", group: "followUp", key: "launchListDrawing", label: "Follow-up · Giveaway drawing reminder", matchRoles: ["launch-list"], matchKinds: ["list"] },
  { tab: "followUp-contactGeneral", group: "followUp", key: "contactGeneral", label: "Follow-up · Contact / general", matchKinds: ["contact"] },
  { tab: "followUp-mediaPress", group: "followUp", key: "mediaPress", label: "Follow-up · Media / press", matchKinds: ["media"] },
  { tab: "followUp-websiteInquiry", group: "followUp", key: "websiteInquiry", label: "Follow-up · Website inquiry", matchKinds: ["sites"] },
  { tab: "followUp-neighborReceived", group: "followUp", key: "neighborReceived", label: "Follow-up · Community request received", matchKinds: ["neighbor"] },
  { tab: "followUp-neighborApproved", group: "followUp", key: "neighborApproved", label: "Follow-up · Community approved", matchKinds: ["neighbor"] },
  { tab: "followUp-neighborDeclined", group: "followUp", key: "neighborDeclined", label: "Follow-up · Community declined", matchKinds: ["neighbor"] },
  { tab: "followUp-insiderPreorder", group: "followUp", key: "insiderPreorder", label: "Follow-up · Insider preorder opens", matchRoles: ["launch-list", "arc-selected", "giveaway", "manual"] },
  { tab: "followUp-releaseDay", group: "followUp", key: "releaseDay", label: "Follow-up · Release day Nov 1", matchRoles: ["launch-list", "arc-selected", "giveaway", "manual"] },
];

export function catalogEntry(tabId) {
  return STUDIO_LETTER_CATALOG.find((c) => c.tab === tabId) || STUDIO_LETTER_CATALOG[0];
}

export function personMatchesLetter(entry, { role, kind }) {
  if (!entry) return true;
  const hasRoles = Array.isArray(entry.matchRoles) && entry.matchRoles.length > 0;
  const hasKinds = Array.isArray(entry.matchKinds) && entry.matchKinds.length > 0;
  if (!hasRoles && !hasKinds) return true;
  const roleMatch = hasRoles && entry.matchRoles.includes(role);
  const kindMatch = hasKinds && entry.matchKinds.includes(kind);
  if (hasRoles && hasKinds) return roleMatch || kindMatch;
  if (hasRoles) return roleMatch;
  return kindMatch;
}

export function defaultEmailTemplates() {
  return {
    distribution: {
      sneakPeek: {
        subject: "[SNEAK PEEK] Congratulations — your Extended Sneak Peek — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — and thank you for reading with Silver Spine Studio™.",
          "",
          "Attached is your Extended Sneak Peek of The Beautiful Beast (Prologue & Chapters 1–2). We are glad you are here for the storm.",
          "",
          COPYRIGHT_SNEAK,
          "",
          SIGNOFF,
        ].join("\n"),
      },
      fullDigital: {
        subject: "[FULL DIGITAL] Congratulations — your copy of The Beautiful Beast — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — your full digital copy of The Beautiful Beast is attached.",
          "",
          "Thank you for supporting this studio and this story. We hope the pages stay with you long after the last line.",
          "",
          COPYRIGHT_FULL,
          "",
          SIGNOFF,
        ].join("\n"),
      },
      arc: {
        subject: "[ARC] Congratulations — you are on the ARC team — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — you were selected as one of our ARC sleuths for The Beautiful Beast.",
          "",
          "Your early-release digital copy is attached. Please treat it as a private reader copy until release day (November 1, 2026). If you review, thank you — honest words help independent studios more than you know.",
          "",
          COPYRIGHT_ARC,
          "",
          SIGNOFF,
        ].join("\n"),
      },
    },
    selection: {
      arcSelected: {
        subject: "[ARC SELECTED] You were chosen — The Beautiful Beast ARC team — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — you were selected as one of the {{arcTeamSize}} ARC sleuths for The Beautiful Beast.",
          "",
          "WHAT THIS MEANS",
          "• You are on the early-access team for this digital ARC",
          `• ARC delivery window: ${LAUNCH_MILESTONES.arcDelivery}`,
          "• Official release day: November 1, 2026",
          "",
          "You will receive a separate email with your download when files are ready. This message is your selection notice for August 17, 2026.",
          "",
          "If you did not request an ARC, please reply to this email so we can fix our list.",
          "",
          "Thank you for sleuthing with us.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      giveawayWinner: {
        subject: "[WINNER] You won a full digital copy — The Beautiful Beast — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — you are one of the {{giveawayWinners}} lucky winners from the Silver Spine Studio™ launch list.",
          "",
          "YOUR PRIZE",
          "One free full digital copy of The Beautiful Beast, readable on your devices.",
          "",
          "You will receive a separate email with your download when we send winner copies. This message is your winner notice for August 17, 2026.",
          "",
          "Thank you for joining the launch list and for cheering on this house.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
    },
    followUp: {
      arcApplicationReceived: {
        subject: "[ARC FOLLOW-UP] We received your early-release request — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for requesting an ARC of The Beautiful Beast. This follow-up confirms we received your application.",
          "",
          "WHAT HAPPENS NEXT",
          `1) ARC sign-up window: ${LAUNCH_MILESTONES.arcSignups}`,
          `2) Selection emails: ${LAUNCH_MILESTONES.arcSelection} ({{arcTeamSize}} sleuths)`,
          `3) If selected, ARC delivery: ${LAUNCH_MILESTONES.arcDelivery}`,
          `4) Official release day: ${LAUNCH_MILESTONES.release}`,
          "",
          "Applying does not guarantee a spot. If you are chosen, you will hear from us separately.",
          "",
          "REMINDER — ARC files are for personal review only. Please do not share files or substantial excerpts.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      arcNotSelected: {
        subject: "[ARC FOLLOW-UP] Thank you for applying — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for applying for the ARC team on The Beautiful Beast. We appreciate your interest in sleuthing with us.",
          "",
          "This round we selected {{arcTeamSize}} readers for early access. You were not selected this time, but the storm still welcomes you — the Extended Sneak Peek and full novel remain available through the Shop when you are ready.",
          "",
          "We hope you will stay on the launch list for updates and the mid-October drawing ({{giveawayWinners}} winners each receive a full digital copy).",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      arcDeliveryReminder: {
        subject: "[ARC FOLLOW-UP] Your ARC file is coming — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Quick follow-up for our ARC sleuths: your early-release digital copy of The Beautiful Beast will arrive during the delivery window ({{arcDeliveryWindow}}).",
          "",
          "Watch this inbox — the download will come in a separate email with copyright terms attached.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      launchListWelcome: {
        subject: "[LAUNCH LIST] You are on the list — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for joining the Silver Spine Studio™ launch list. This follow-up confirms you are signed up for updates on The Beautiful Beast and the seven-fold chronicle.",
          "",
          "DRAWING",
          `Three lucky winners will each receive a free full digital copy. Drawing from launch-list signups — winners announced ${LAUNCH_MILESTONES.digitalGiveawayAnnounce}.`,
          "",
          SIGNOFF,
        ].join("\n"),
      },
      launchListDrawing: {
        subject: "[LAUNCH LIST] Giveaway drawing reminder — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "You are on the Silver Spine Studio™ launch list. This is a friendly reminder that we will draw {{giveawayWinners}} winners for a free full digital copy of The Beautiful Beast around ${LAUNCH_MILESTONES.digitalGiveawayAnnounce}.",
          "",
          "Winners will be notified by email. No purchase necessary — you are already entered.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      contactGeneral: {
        subject: "[FOLLOW-UP] We received your message — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for contacting Silver Spine Studio™. This follow-up confirms we received your message and Leameso will reply personally as soon as possible.",
          "",
          "For quick answers on downloads, ARC, and launch dates, the FAQ at silverspinestudio.com/faq may help while you wait.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      mediaPress: {
        subject: "[MEDIA FOLLOW-UP] We received your press / interview request — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for your media or interview request regarding Silver Spine Studio™ and The Beautiful Beast.",
          "",
          "This follow-up confirms your request is in the studio inbox. We will respond with press materials, availability, or next steps as soon as we can.",
          "",
          "{{outletLine}}",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      websiteInquiry: {
        subject: "[WEBSITE FOLLOW-UP] Your custom site inquiry — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for asking about a custom website in the Silver Spine Studio™ style.",
          "",
          "This follow-up confirms we received your inquiry. Custom builds are by request only — Leameso will reply with availability and next steps.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      neighborReceived: {
        subject: "[COMMUNITY FOLLOW-UP] We received your porch request — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for asking to be listed in the Silver Spine Studio™ community (Investing in the Community).",
          "",
          "This follow-up confirms we received your request for {{businessName}}. Nothing goes live until Leameso approves it manually.",
          "",
          "Purchase verification is reviewed privately — you will hear back by email.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      neighborApproved: {
        subject: "[COMMUNITY] You are live on the porch — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Congratulations — {{businessName}} is now approved and listed on the Silver Spine Studio™ community wall.",
          "",
          "Your card is live at silverspinestudio.com/neighbors. Thank you for investing in this house — we are glad to invest in you.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      neighborDeclined: {
        subject: "[COMMUNITY FOLLOW-UP] About your porch request — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Thank you for your interest in the Silver Spine Studio™ community wall.",
          "",
          "After review, we are not able to list this request at this time. If you believe this was an error, reply to this email with any details we should reconsider.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      insiderPreorder: {
        subject: "[INSIDER] Full digital preorder opens {{insiderStart}} — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "Follow-up for readers on the Silver Spine Studio™ list: the full digital novel opens for Insider preorder on {{insiderStart}} at {{insiderPrice}} (save {{insiderSave}} vs retail {{retailPrice}}).",
          "",
          "Hardcover orders open {{hardcoverDate}}.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
      releaseDay: {
        subject: "[RELEASE] The Beautiful Beast — out now — Silver Spine Studio™",
        body: [
          "Hi {{firstName}},",
          "",
          "The storm breaks today — The Beautiful Beast is officially released.",
          "",
          "Hardcover and retail digital are available through the Shop at silverspinestudio.com/shop. Thank you for being part of this launch.",
          "",
          SIGNOFF,
        ].join("\n"),
      },
    },
  };
}

function slot(raw, fallback) {
  return {
    subject: String(raw?.subject || fallback.subject).trim(),
    body: String(raw?.body || fallback.body).trim(),
  };
}

export function mergeEmailTemplates(data) {
  const defaults = defaultEmailTemplates();
  if (!data || typeof data !== "object") return defaults;

  const followUp = {};
  for (const key of Object.keys(defaults.followUp)) {
    followUp[key] = slot(data.followUp?.[key], defaults.followUp[key]);
  }

  if (/Sep(?:tember)?\s*21/.test(followUp.arcApplicationReceived?.body || "")) {
    followUp.arcApplicationReceived = defaults.followUp.arcApplicationReceived;
  }

  const selection = {
    arcSelected: slot(data.selection?.arcSelected, defaults.selection.arcSelected),
    giveawayWinner: slot(data.selection?.giveawayWinner, defaults.selection.giveawayWinner),
  };
  if (/Sep(?:tember)?\s*21/.test(selection.arcSelected?.body || "")) {
    selection.arcSelected = defaults.selection.arcSelected;
  }

  return {
    distribution: {
      sneakPeek: slot(data.distribution?.sneakPeek, defaults.distribution.sneakPeek),
      fullDigital: slot(data.distribution?.fullDigital, defaults.distribution.fullDigital),
      arc: slot(data.distribution?.arc, defaults.distribution.arc),
    },
    selection,
    followUp,
  };
}

/** Replace {{placeholders}} in templates */
export function renderEmailTemplate(template, vars) {
  const firstName = String(vars.firstName || vars.name || "friend").split(/\s+/)[0] || "friend";
  const outlet = String(vars.outlet || "").trim();
  const map = {
    firstName,
    name: String(vars.name || firstName),
    arcTeamSize: String(vars.arcTeamSize ?? ARC_TEAM_SIZE),
    giveawayWinners: String(vars.giveawayWinners ?? DIGITAL_COPY_GIVEAWAY.winners),
    product: String(vars.product || ""),
    businessName: String(vars.businessName || "your business").trim() || "your business",
    outletLine: outlet ? `Outlet on file: ${outlet}` : "",
    arcDeliveryWindow: String(vars.arcDeliveryWindow ?? LAUNCH_MILESTONES.arcDelivery),
    insiderStart: String(vars.insiderStart ?? NOVEL_PRICING.digitalPreorderStartLabel),
    insiderPrice: String(vars.insiderPrice ?? NOVEL_PRICING.insider),
    insiderSave: String(vars.insiderSave ?? NOVEL_PRICING.insiderSavePercent),
    retailPrice: String(vars.retailPrice ?? NOVEL_PRICING.retail),
    hardcoverDate: String(vars.hardcoverDate ?? NOVEL_PRICING.hardcoverOrderFromLabel),
  };
  const replace = (s) =>
    String(s).replace(/\{\{(\w+)\}\}/g, (_, key) => (map[key] != null ? map[key] : `{{${key}}}`));
  return {
    subject: replace(template.subject),
    text: replace(template.body),
  };
}

export function buildFollowUpEmail({ followUpKey, person, templates }) {
  const tpl = templates?.followUp?.[followUpKey];
  if (!tpl?.subject || !tpl?.body) {
    throw new Error(`Follow-up letter “${followUpKey}” is missing — save templates in Admin → Launch.`);
  }
  return renderEmailTemplate(tpl, {
    name: person.name,
    outlet: person.outlet,
    businessName: person.businessName,
  });
}
