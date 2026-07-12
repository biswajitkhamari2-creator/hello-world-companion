import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-inbox.functions-CKMBQv4C.js
/** Public Drive download (Anyone-with-the-link files). Handles the >100MB confirm interstitial. */
async function fetchPublicDriveFile(fileId) {
	const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
	let res = await fetch(primary, { redirect: "follow" });
	let ct = res.headers.get("content-type") || "";
	if (res.ok && /text\/html/i.test(ct)) {
		const html = await res.text();
		const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
		const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] || "t";
		if (uuid) {
			const retry = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
			res = await fetch(retry, { redirect: "follow" });
			ct = res.headers.get("content-type") || "";
		}
	}
	if (!res.ok || /text\/html/i.test(ct)) throw new Error(`Drive public download failed (${res.status}). Ensure the file is shared as "Anyone with the link — Viewer".`);
	const cd = res.headers.get("content-disposition") || "";
	const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
	const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
	return {
		bytes: await res.arrayBuffer(),
		mime: ct.split(";")[0].trim() || "application/pdf",
		name
	};
}
function extractDriveFileIdFromUrl(url) {
	try {
		const u = new URL(url);
		if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
		const pathMatch = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
		if (pathMatch) return pathMatch[1];
		const idParam = u.searchParams.get("id");
		return idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam) ? idParam : null;
	} catch {
		return null;
	}
}
function extractUrls(text) {
	return Array.from(new Set(text.match(/https?:\/\/[^\s)]+/gi) ?? []));
}
function getDriveRecovery(item) {
	const candidates = [
		item.source_url,
		item.caption,
		item.file_name,
		JSON.stringify(item.raw ?? {})
	].filter(Boolean).flatMap((value) => extractUrls(String(value)));
	for (const url of candidates) {
		const driveId = extractDriveFileIdFromUrl(url);
		if (driveId) return {
			driveId,
			sourceUrl: url
		};
	}
	return {
		driveId: null,
		sourceUrl: item.source_url ?? null
	};
}
var listInbox_createServerFn_handler = createServerRpc({
	id: "ed98bb8f5620ee3dff09894a3f181a04c6f035f38226aabffcf12895acc26142",
	name: "listInbox",
	filename: "src/lib/telegram-inbox.functions.ts"
}, (opts) => listInbox.__executeServer(opts));
var listInbox = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => d ?? {}).handler(listInbox_createServerFn_handler, async ({ data, context }) => {
	let q = context.supabase.from("telegram_inbox").select("id,kind,caption,posted_at,file_name,mime,size_bytes,drive_file_id,drive_view_link,source_url,status,archived_at").order("posted_at", { ascending: false }).limit(100);
	if (data.archived) q = q.not("archived_at", "is", null);
	else q = q.is("archived_at", null);
	const { data: rows, error } = await q;
	if (error) throw new Error(error.message);
	return rows ?? [];
});
var importInboxItem_createServerFn_handler = createServerRpc({
	id: "a0f536140d787bb66b77ee595842a61449c58a1a278ad7337e6988774079bea4",
	name: "importInboxItem",
	filename: "src/lib/telegram-inbox.functions.ts"
}, (opts) => importInboxItem.__executeServer(opts));
var importInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(importInboxItem_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: item, error } = await supabase.from("telegram_inbox").select("*").eq("id", data.itemId).maybeSingle();
	if (error) throw new Error(error.message);
	if (!item) throw new Error("Inbox item not found");
	const inboxItem = item;
	const driveRecovery = getDriveRecovery(inboxItem);
	if (inboxItem.kind === "link" && !driveRecovery.driveId) throw new Error("This link is not a recoverable Google Drive PDF. Open the URL directly or resend a public Drive PDF link.");
	if (inboxItem.status === "too_large" && !driveRecovery.driveId) throw new Error("This PDF is over Telegram's 20 MB bot limit and has no saved Google Drive recovery link. Please send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer'.");
	let driveFileId = inboxItem.drive_file_id;
	let driveViewLink = inboxItem.drive_view_link;
	let mime = inboxItem.mime;
	let sizeBytes = inboxItem.size_bytes;
	async function repairFromTelegram() {
		const rawMsg = inboxItem.raw?.message || inboxItem.raw?.channel_post || inboxItem.raw?.edited_message || inboxItem.raw?.edited_channel_post || {};
		const telegramFileId = rawMsg.document?.file_id || (Array.isArray(rawMsg.photo) ? rawMsg.photo.at(-1)?.file_id : void 0) || rawMsg.video?.file_id || rawMsg.audio?.file_id || rawMsg.voice?.file_id || rawMsg.animation?.file_id;
		const { driveId, sourceUrl } = getDriveRecovery(inboxItem);
		if (driveId) try {
			const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
			const { supabaseAdmin } = await import("./client.server-70dgAIAg.mjs");
			const dl = await fetchPublicDriveFile(driveId);
			const uploaded = await uploadBufferToDrive({
				userId: "telegram-inbox",
				fileName: inboxItem.file_name || dl.name || `drive-${driveId}.pdf`,
				mime: dl.mime || "application/pdf",
				data: dl.bytes
			});
			driveFileId = uploaded.fileId;
			driveViewLink = uploaded.webViewLink;
			mime = uploaded.mimeType;
			sizeBytes = uploaded.size;
			await supabaseAdmin.from("telegram_inbox").update({
				drive_file_id: driveFileId,
				drive_view_link: driveViewLink,
				source_url: sourceUrl,
				kind: "pdf",
				file_name: inboxItem.file_name || dl.name || `drive-${driveId}.pdf`,
				mime,
				size_bytes: sizeBytes,
				status: "ready",
				error_message: null
			}).eq("id", inboxItem.id);
			return;
		} catch (e) {
			throw new Error(`Could not fetch the Drive file. Make sure it is shared as "Anyone with the link — Viewer", then retry. Details: ${e.message}`);
		}
		if (!telegramFileId) throw new Error("This Telegram item has no permanent file reference. Send it as a Google Drive link shared with 'Anyone with the link — Viewer' so the app can recover it anytime.");
		try {
			const { tgDownload } = await import("./telegram.server-CNrfEYV6.mjs").then((n) => n.r);
			const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
			const { supabaseAdmin } = await import("./client.server-70dgAIAg.mjs");
			const { bytes } = await tgDownload(telegramFileId);
			const uploaded = await uploadBufferToDrive({
				userId: "telegram-inbox",
				fileName: inboxItem.file_name || `telegram-${inboxItem.message_id}.${inboxItem.kind === "image" ? "jpg" : "pdf"}`,
				mime: inboxItem.mime || (inboxItem.kind === "image" ? "image/jpeg" : "application/pdf"),
				data: bytes
			});
			driveFileId = uploaded.fileId;
			driveViewLink = uploaded.webViewLink;
			mime = uploaded.mimeType;
			sizeBytes = uploaded.size;
			await supabaseAdmin.from("telegram_inbox").update({
				drive_file_id: driveFileId,
				drive_view_link: driveViewLink,
				mime,
				size_bytes: sizeBytes,
				status: "ready",
				error_message: null
			}).eq("id", inboxItem.id);
		} catch (e) {
			const msg = e.message || "";
			if (/file is too big/i.test(msg)) throw new Error("Telegram bots cannot download files larger than 20 MB. Send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer' so it can be imported permanently.");
			if (/TELEGRAM_BOT_TOKEN is not configured/i.test(msg)) throw new Error("Telegram bot token missing on the server. Add TELEGRAM_BOT_TOKEN in your Vercel Project → Settings → Environment Variables (Production + Preview + Development), then redeploy. Meanwhile, send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer' and it will import automatically without needing the bot token.");
			throw new Error(`Telegram file could not be fetched. Please resend the PDF/image to the bot, then import the new inbox item. Details: ${msg}`);
		}
	}
	if (driveFileId) try {
		const { getDriveFileMetadata } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		await getDriveFileMetadata(driveFileId);
	} catch {
		await repairFromTelegram();
	}
	else await repairFromTelegram();
	if (!driveFileId) throw new Error("This item has no stored file. Please resend it to the bot.");
	const title = inboxItem.file_name || (inboxItem.caption?.slice(0, 80) ?? "Telegram import");
	const { data: doc, error: insertErr } = await supabase.from("documents").insert({
		user_id: userId,
		title,
		file_name: inboxItem.file_name,
		source_type: inboxItem.kind === "pdf" ? "pdf" : "image",
		mime,
		size_bytes: sizeBytes,
		storage_provider: "google_drive",
		drive_file_id: driveFileId,
		drive_view_link: driveViewLink,
		status: "uploaded"
	}).select("id").single();
	if (insertErr) throw new Error(insertErr.message);
	return { documentId: doc.id };
});
var archiveInboxItem_createServerFn_handler = createServerRpc({
	id: "80756e899abd2c9ef1af73c4587a432dc7f92ef051f57d540d532448233594b4",
	name: "archiveInboxItem",
	filename: "src/lib/telegram-inbox.functions.ts"
}, (opts) => archiveInboxItem.__executeServer(opts));
var archiveInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(archiveInboxItem_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-70dgAIAg.mjs");
	const { error } = await supabaseAdmin.from("telegram_inbox").update({ archived_at: data.archived ? (/* @__PURE__ */ new Date()).toISOString() : null }).eq("id", data.itemId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var deleteInboxItem_createServerFn_handler = createServerRpc({
	id: "0625e3685ecc541699abd64a34eb67a1066a78a6db88599bd4b051ebdac32cbe",
	name: "deleteInboxItem",
	filename: "src/lib/telegram-inbox.functions.ts"
}, (opts) => deleteInboxItem.__executeServer(opts));
var deleteInboxItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(deleteInboxItem_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-70dgAIAg.mjs");
	const { error } = await supabaseAdmin.from("telegram_inbox").delete().eq("id", data.itemId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var deleteInboxItems_createServerFn_handler = createServerRpc({
	id: "5efbe3fb097e72bb4adcf5fe8649f13ae32b925b890211fedd5ab61c38905a27",
	name: "deleteInboxItems",
	filename: "src/lib/telegram-inbox.functions.ts"
}, (opts) => deleteInboxItems.__executeServer(opts));
var deleteInboxItems = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(deleteInboxItems_createServerFn_handler, async ({ data }) => {
	if (!data.itemIds?.length) return {
		ok: true,
		deleted: 0
	};
	const { supabaseAdmin } = await import("./client.server-70dgAIAg.mjs");
	const { error } = await supabaseAdmin.from("telegram_inbox").delete().in("id", data.itemIds);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		deleted: data.itemIds.length
	};
});
//#endregion
export { archiveInboxItem_createServerFn_handler, deleteInboxItem_createServerFn_handler, deleteInboxItems_createServerFn_handler, importInboxItem_createServerFn_handler, listInbox_createServerFn_handler };
