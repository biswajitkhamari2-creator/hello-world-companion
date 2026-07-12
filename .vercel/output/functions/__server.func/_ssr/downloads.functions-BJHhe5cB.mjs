import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/downloads.functions-BJHhe5cB.js
var DRIVE_DOWNLOAD_SELECT = "id,title,file_name,mime,size_bytes,created_at,drive_file_id,drive_view_link,summary,source_type,storage_provider,status";
function cleanFileName(name) {
	return (name || "download").trim().replace(/[\\/]+/g, "-").slice(0, 180) || "download";
}
var saveGeneratedDownloadToDrive_createServerFn_handler = createServerRpc({
	id: "f73e398ba40feece16bc2cb188c398e3ee40ecabc48918f7beef5d36c394842a",
	name: "saveGeneratedDownloadToDrive",
	filename: "src/lib/downloads.functions.ts"
}, (opts) => saveGeneratedDownloadToDrive.__executeServer(opts));
var saveGeneratedDownloadToDrive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const file = d.get("file");
	if (!(file instanceof File)) throw new Error("Missing file");
	return {
		file,
		source: String(d.get("source") || "download").slice(0, 80),
		kind: String(d.get("kind") || "other").slice(0, 40)
	};
}).handler(saveGeneratedDownloadToDrive_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const fileName = cleanFileName(data.file.name);
	const mime = data.file.type || "application/octet-stream";
	const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const upload = await uploadBufferToDrive({
		userId,
		fileName,
		mime,
		data: await data.file.arrayBuffer(),
		folderName: "Downloads"
	});
	const { data: row, error } = await supabase.from("documents").insert({
		user_id: userId,
		title: fileName,
		file_name: fileName,
		mime,
		size_bytes: upload.size,
		source_type: "download",
		status: "ready",
		storage_provider: "google_drive",
		drive_file_id: upload.fileId,
		drive_view_link: upload.webViewLink,
		summary: `Saved download${data.source ? ` from ${data.source}` : ""}${data.kind ? ` · ${data.kind}` : ""}`
	}).select(DRIVE_DOWNLOAD_SELECT).single();
	if (error) {
		try {
			const { deleteDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
			await deleteDriveFile(upload.fileId);
		} catch {}
		throw error;
	}
	return {
		documentId: row.id,
		name: row.file_name || row.title || fileName,
		mime: row.mime || mime,
		size: Number(row.size_bytes || upload.size),
		createdAt: row.created_at,
		driveFileId: row.drive_file_id,
		driveViewLink: row.drive_view_link
	};
});
var listDriveDownloads_createServerFn_handler = createServerRpc({
	id: "0cd892e3ac78e76d145ae4e9b363cf798a54a7459f1f4cc8fbaa150795311a57",
	name: "listDriveDownloads",
	filename: "src/lib/downloads.functions.ts"
}, (opts) => listDriveDownloads.__executeServer(opts));
var listDriveDownloads = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listDriveDownloads_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("documents").select(DRIVE_DOWNLOAD_SELECT).eq("user_id", userId).eq("source_type", "download").order("created_at", { ascending: false });
	if (error) throw error;
	return data ?? [];
});
var deleteDriveDownload_createServerFn_handler = createServerRpc({
	id: "4d91a1929876b7ed1a9b3e215e5d9915f00c14af9ca66c2d75648962e46c6d3f",
	name: "deleteDriveDownload",
	filename: "src/lib/downloads.functions.ts"
}, (opts) => deleteDriveDownload.__executeServer(opts));
var deleteDriveDownload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(deleteDriveDownload_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc } = await supabase.from("documents").select("drive_file_id").eq("id", data.id).eq("user_id", userId).eq("source_type", "download").single();
	if (doc?.drive_file_id) try {
		const { deleteDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		await deleteDriveFile(doc.drive_file_id);
	} catch (e) {
		console.warn("[downloads] drive delete failed, removing row anyway", e);
	}
	const { error } = await supabase.from("documents").delete().eq("id", data.id).eq("user_id", userId).eq("source_type", "download");
	if (error) throw error;
	return { ok: true };
});
//#endregion
export { deleteDriveDownload_createServerFn_handler, listDriveDownloads_createServerFn_handler, saveGeneratedDownloadToDrive_createServerFn_handler };
