import { isValidAdminToken, readAdminTokenFromReq } from "@/lib/adminAuth";
import { assertDistributionFile, sendDistributionEmail, sendFollowUpEmail, sendSelectionEmail } from "@/lib/launchAdminMail";
import {
  addRecipient,
  addRecipientsBulk,
  dismissSubmissions,
  importSubmissions,
  launchAdminStorageMode,
  markRecipientSent,
  markSubmissionFollowUpSent,
  readLaunchAdminStore,
  removeRecipient,
  saveCountdown,
  saveDistributionFiles,
  saveDistributionUpload,
  saveEmailTemplates,
  updateRecipient,
} from "@/lib/launchAdminStore";
import { defaultEmailTemplates } from "@/lib/launchEmailTemplates";

function requireAdmin(req, res) {
  const token = readAdminTokenFromReq(req);
  if (!isValidAdminToken(token)) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
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
  if (!requireAdmin(req, res)) return;

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

      return res.status(400).json({ ok: false, error: "Unknown action." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("admin launch error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
