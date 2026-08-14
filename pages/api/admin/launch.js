import { requireAuth } from "@/lib/adminAuth";
import { ADMIN_ROLE, assistantCanLaunchAction } from "@/lib/adminRoles";
import { assertDistributionFile, sendDistributionEmail, sendFollowUpEmail, sendSelectionEmail } from "@/lib/launchAdminMail";
import {
  addRecipient,
  addRecipientsBulk,
  addContact,
  addDiscountCode,
  dismissSubmissions,
  importSubmissions,
  launchAdminStorageMode,
  markRecipientSent,
  markSubmissionFollowUpSent,
  readLaunchAdminStore,
  removeContact,
  removeDiscountCode,
  removeRecipient,
  saveCountdown,
  saveDistributionFiles,
  saveDistributionUpload,
  saveEmailTemplates,
  saveTrackingNote,
  updateContact,
  updateDiscountCode,
  updateRecipient,
} from "@/lib/launchAdminStore";
import { defaultEmailTemplates } from "@/lib/launchEmailTemplates";

function requireAdmin(req, res) {
  return requireAuth(req, res);
}

function requireOwner(req, res) {
  return requireAuth(req, res, { ownerOnly: true });
}

function copyFileForType(store, copyType) {
  if (copyType === "sneakPeek") return store.distributionFiles.sneakPeek;
  if (copyType === "fullDigital") return store.distributionFiles.fullDigital;
  if (copyType === "arc") {
    const arc = store.distributionFiles.fullDigital?.path
      ? store.distributionFiles.fullDigital
      : store.distributionFiles.sneakPeek;
    return arc;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = requireAdmin(req, res);
    if (!session) return;
  } else if (req.method === "POST") {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const action = String(body.action || "").trim();
    const session =
      assistantCanLaunchAction(action) || !action
        ? requireAdmin(req, res)
        : requireOwner(req, res);
    if (!session) return;
    if (session.role === ADMIN_ROLE.ASSISTANT && action && !assistantCanLaunchAction(action)) {
      return res.status(403).json({ ok: false, error: "Studio owner access required for this action." });
    }
  } else {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    if (req.method === "GET") {
      const store = await readLaunchAdminStore();
      return res.status(200).json({
        ok: true,
        ...store,
        storage: launchAdminStorageMode(),
      });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const action = String(body.action || "").trim();

      if (action === "save-countdown") {
        await saveCountdown({
          countdownMatrix: body.countdownMatrix,
          countdownTargets: body.countdownTargets,
        });
        return res.status(200).json({ ok: true });
      }

      if (action === "save-files") {
        await saveDistributionFiles(body.files || {});
        return res.status(200).json({ ok: true });
      }

      if (action === "save-templates") {
        await saveEmailTemplates(body.emailTemplates || {});
        return res.status(200).json({ ok: true });
      }

      if (action === "save-tracking-note") {
        const email = String(body.email || "").trim();
        if (!email) return res.status(400).json({ ok: false, error: "Email is required." });
        const saved = await saveTrackingNote({ email, note: body.note });
        return res.status(200).json({ ok: true, note: saved });
      }

      if (action === "add-contact") {
        const row = await addContact(body);
        return res.status(200).json({ ok: true, contact: row });
      }

      if (action === "update-contact") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing contact id." });
        const row = await updateContact(id, body);
        return res.status(200).json({ ok: true, contact: row });
      }

      if (action === "remove-contact") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing contact id." });
        await removeContact(id);
        return res.status(200).json({ ok: true });
      }

      if (action === "upload-file") {
        const slot = body.slot === "fullDigital" ? "fullDigital" : "sneakPeek";
        const uploaded = await saveDistributionUpload({
          slot,
          filename: body.filename,
          base64: body.base64,
          mimeType: body.mimeType,
        });
        return res.status(200).json({ ok: true, ...uploaded });
      }

      if (action === "add-recipient") {
        const row = await addRecipient(body);
        return res.status(200).json({ ok: true, recipient: row });
      }

      if (action === "add-recipients-bulk") {
        const result = await addRecipientsBulk({
          text: body.text,
          role: body.role,
          format: body.format,
          reviewSpot: body.reviewSpot,
          notes: body.notes,
        });
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === "update-recipient") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing recipient id." });
        const row = await updateRecipient(id, body);
        return res.status(200).json({ ok: true, recipient: row });
      }

      if (action === "remove-recipient") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing recipient id." });
        await removeRecipient(id);
        return res.status(200).json({ ok: true });
      }

      if (action === "select-arc") {
        const ids = Array.isArray(body.ids) ? body.ids : [];
        for (const id of ids) {
          await updateRecipient(String(id).trim(), { role: "arc-selected" });
        }
        return res.status(200).json({ ok: true, count: ids.length });
      }

      if (action === "import-submissions") {
        const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
        const role = String(body.role || "arc-applicant").trim();
        const imported = await importSubmissions(ids, role);
        return res.status(200).json({ ok: true, imported, count: imported.length });
      }

      if (action === "dismiss-submissions") {
        const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
        await dismissSubmissions(ids);
        return res.status(200).json({ ok: true, count: ids.length });
      }

      if (action === "send-copies") {
        const copyType = ["sneakPeek", "fullDigital", "arc"].includes(body.copyType)
          ? body.copyType
          : null;
        const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
        if (!copyType) return res.status(400).json({ ok: false, error: "Choose a copy type." });
        if (!ids.length) return res.status(400).json({ ok: false, error: "Select at least one person." });

        const store = await readLaunchAdminStore();
        const fileSlot = copyFileForType(store, copyType);
        if (!fileSlot?.path) {
          return res.status(400).json({
            ok: false,
            error: "Set the distribution file path first (Extended Sneak Peek or Full Digital Copy).",
          });
        }
        assertDistributionFile(fileSlot.path);

        const results = [];
        const errors = [];
        for (const id of ids) {
          const person = store.recipients.find((r) => r.id === id && !r.removed);
          if (!person) {
            errors.push({ id, error: "Not found" });
            continue;
          }
          try {
            const sent = await sendDistributionEmail({
              to: person.email,
              name: person.name,
              copyType,
              publicPath: fileSlot.path,
              fileLabel: fileSlot.label,
              templates: store.emailTemplates,
            });
            await markRecipientSent(id, copyType, sent);
            results.push({ id, email: person.email, ok: true });
          } catch (err) {
            errors.push({ id, email: person.email, error: err.message || "Send failed" });
          }
        }

        return res.status(200).json({
          ok: errors.length === 0,
          sent: results.length,
          results,
          errors,
        });
      }

      if (action === "send-notice") {
        const noticeType = body.noticeType === "giveawayWinner" ? "giveawayWinner" : "selectionArc";
        const markKey = noticeType === "giveawayWinner" ? "selectionGiveaway" : "selectionArc";
        const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
        if (!ids.length) {
          return res.status(400).json({ ok: false, error: "Select at least one person." });
        }

        const store = await readLaunchAdminStore();
        const results = [];
        const errors = [];
        for (const id of ids) {
          const person = store.recipients.find((r) => r.id === id && !r.removed);
          if (!person) {
            errors.push({ id, error: "Not found" });
            continue;
          }
          try {
            const tplNotice = noticeType === "giveawayWinner" ? "giveawayWinner" : "arcSelected";
            const sent = await sendSelectionEmail({
              to: person.email,
              name: person.name,
              noticeType: tplNotice,
              templates: store.emailTemplates,
            });
            await markRecipientSent(id, markKey, sent);
            results.push({ id, email: person.email, ok: true });
          } catch (err) {
            errors.push({ id, email: person.email, error: err.message || "Send failed" });
          }
        }

        return res.status(200).json({
          ok: errors.length === 0,
          sent: results.length,
          results,
          errors,
        });
      }

      if (action === "send-follow-up") {
        const followUpKey = String(body.followUpKey || "").trim();
        const validKeys = Object.keys(defaultEmailTemplates().followUp);
        if (!validKeys.includes(followUpKey)) {
          return res.status(400).json({ ok: false, error: "Invalid follow-up letter." });
        }

        const recipientIds = Array.isArray(body.recipientIds)
          ? body.recipientIds.map(String).filter(Boolean)
          : [];
        const submissionIds = Array.isArray(body.submissionIds)
          ? body.submissionIds.map(String).filter(Boolean)
          : [];
        if (!recipientIds.length && !submissionIds.length) {
          return res.status(400).json({ ok: false, error: "Check at least one person to email." });
        }

        const store = await readLaunchAdminStore();
        const results = [];
        const errors = [];

        for (const id of recipientIds) {
          const person = store.recipients.find((r) => r.id === id && !r.removed);
          if (!person) {
            errors.push({ id, error: "Not found" });
            continue;
          }
          try {
            const sent = await sendFollowUpEmail({
              to: person.email,
              person: {
                name: person.name,
                outlet: person.notes || "",
                businessName: person.notes || "",
              },
              followUpKey,
              templates: store.emailTemplates,
            });
            await markRecipientSent(id, `followUp:${followUpKey}`, sent);
            results.push({ id, email: person.email, source: "recipient", ok: true });
          } catch (err) {
            errors.push({ id, email: person.email, error: err.message || "Send failed" });
          }
        }

        for (const id of submissionIds) {
          const sub = (store.submissions || []).find((s) => s.id === id);
          if (!sub?.email) {
            errors.push({ id, error: "Submission not found" });
            continue;
          }
          try {
            const sent = await sendFollowUpEmail({
              to: sub.email,
              person: {
                name: sub.name,
                outlet: sub.outlet,
                businessName: sub.businessName,
              },
              followUpKey,
              templates: store.emailTemplates,
            });
            await markSubmissionFollowUpSent(id, followUpKey, sent);
            results.push({ id, email: sub.email, source: "submission", ok: true });
          } catch (err) {
            errors.push({ id, email: sub.email, error: err.message || "Send failed" });
          }
        }

        return res.status(200).json({
          ok: errors.length === 0,
          sent: results.length,
          results,
          errors,
        });
      }

      if (action === "add-discount-code") {
        const code = await addDiscountCode(body);
        return res.status(200).json({ ok: true, code });
      }

      if (action === "update-discount-code") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing code id." });
        const code = await updateDiscountCode(id, body);
        return res.status(200).json({ ok: true, code });
      }

      if (action === "remove-discount-code") {
        const id = String(body.id || "").trim();
        if (!id) return res.status(400).json({ ok: false, error: "Missing code id." });
        await removeDiscountCode(id);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("admin launch error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
