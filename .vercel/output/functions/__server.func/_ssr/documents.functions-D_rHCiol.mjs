import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType, ot as enumType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents.functions-D_rHCiol.js
var SUBJECTS = [
	"Polity",
	"History",
	"Geography",
	"Economy",
	"Environment",
	"Science & Technology",
	"International Relations",
	"Security",
	"Society",
	"Governance",
	"Ethics",
	"Current Affairs"
];
var DRIVE_FILE_INACCESSIBLE_MESSAGE = "This Google Drive file is no longer accessible. Delete this document and upload/forward it again.";
function isDriveFileInaccessibleError(error) {
	const message = String(error?.message || error || "");
	return /no longer accessible in Google Drive|File not found|uploaded under a previous connector grant|drive\.file scope/i.test(message);
}
async function extractTextFromBuffer(buf, mime, filename) {
	const lower = (mime || "").toLowerCase();
	const name = filename.toLowerCase();
	if (lower.includes("pdf") || name.endsWith(".pdf")) {
		const { extractText, getDocumentProxy } = await import("../_libs/unpdf.mjs").then((n) => n.t);
		const { text } = await extractText(await getDocumentProxy(new Uint8Array(buf)), { mergePages: true });
		return (text || "").trim();
	}
	if (lower.includes("officedocument.wordprocessingml") || name.endsWith(".docx")) return ((await (await import("../_libs/mammoth+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).extractRawText({ buffer: Buffer.from(buf) })).value || "").trim();
	if (lower.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) return new TextDecoder().decode(buf).trim();
	return "";
}
function bufferToBase64(buf) {
	return Buffer.from(buf).toString("base64");
}
async function ocrWithGemini(buf, mime) {
	const apiKey = process.env.GEMINI_API_KEY?.trim();
	if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
	const sendMime = mime?.startsWith("image/") || mime === "application/pdf" ? mime : "application/pdf";
	const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contents: [{ parts: [{ text: "Extract ALL readable text from this document (newspaper / scanned pages). Return only the plain text, preserving paragraph order. Do not summarise." }, { inline_data: {
			mime_type: sendMime,
			data: bufferToBase64(buf)
		} }] }] })
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Gemini OCR failed: ${res.status} ${body.slice(0, 200)}`);
	}
	return ((await res.json())?.candidates?.[0]?.content?.parts ?? []).map((p) => p?.text || "").join("\n").trim();
}
var uploadDocument_createServerFn_handler = createServerRpc({
	id: "6a84d6c06bda3996250281bc9a5b708962e14a0bb9447d5b3830fcdc867fe8cc",
	name: "uploadDocument",
	filename: "src/lib/documents.functions.ts"
}, (opts) => uploadDocument.__executeServer(opts));
var uploadDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const file = d.get("file");
	if (!(file instanceof File)) throw new Error("Missing file");
	return {
		file,
		title: d.get("title") || file.name
	};
}).handler(uploadDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const buf = await data.file.arrayBuffer();
	const mime = data.file.type || "application/octet-stream";
	const { data: existing } = await supabase.from("documents").select("id, title").eq("user_id", userId).eq("file_name", data.file.name).eq("size_bytes", buf.byteLength).limit(1).maybeSingle();
	if (existing) throw new Error(`Duplicate file not accepted — "${data.file.name}" is already in your library as "${existing.title}".`);
	const upload = await uploadBufferToDrive({
		userId,
		fileName: data.file.name,
		mime,
		data: buf
	});
	const { data: row, error } = await supabase.from("documents").insert({
		user_id: userId,
		title: data.title,
		file_name: data.file.name,
		mime,
		size_bytes: upload.size,
		source_type: "upload",
		status: "uploaded",
		storage_provider: "google_drive",
		drive_file_id: upload.fileId,
		drive_view_link: upload.webViewLink
	}).select().single();
	if (error) {
		try {
			const { deleteDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
			await deleteDriveFile(upload.fileId);
		} catch {}
		throw error;
	}
	return row;
});
var extractDocument_createServerFn_handler = createServerRpc({
	id: "9f4a2e509de3a6ebee26ea537bbb93f73c055c6c3cee4bae0d19507949404074",
	name: "extractDocument",
	filename: "src/lib/documents.functions.ts"
}, (opts) => extractDocument.__executeServer(opts));
var extractDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ documentId: stringType().uuid() }).parse(d)).handler(extractDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error: docErr } = await supabase.from("documents").select("*").eq("id", data.documentId).eq("user_id", userId).single();
	if (docErr || !doc) throw new Error("Document not found");
	if (!doc.drive_file_id) throw new Error("Document has no Drive file reference");
	await supabase.from("documents").update({
		status: "processing",
		error_message: null
	}).eq("id", doc.id);
	try {
		const { downloadDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		const { buffer } = await downloadDriveFile(doc.drive_file_id);
		let text = await extractTextFromBuffer(buffer, doc.mime || "", doc.title);
		const isImage = (doc.mime || "").startsWith("image/");
		const looksScanned = text.length < 200 || (text.match(/[a-zA-Z]/g) || []).length < 50;
		const isPdf = (doc.mime || "").includes("pdf") || (doc.title || "").toLowerCase().endsWith(".pdf");
		if (looksScanned && (isImage || isPdf)) try {
			const ocr = await ocrWithGemini(buffer, doc.mime || (isPdf ? "application/pdf" : ""));
			if (ocr && ocr.length > text.length) text = ocr;
		} catch (e) {
			console.error("ocr fallback failed", e);
		}
		if (!text) {
			await supabase.from("documents").update({
				status: "failed",
				error_message: "Could not extract any text from this file."
			}).eq("id", doc.id);
			return {
				ok: false,
				reason: "no_text"
			};
		}
		const trimmed = text.slice(0, 15e5);
		const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
		const { generateObject } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
		const gw = createGateway();
		const sample = trimmed.length > 16e3 ? trimmed.slice(0, 8e3) + "\n...\n" + trimmed.slice(-8e3) : trimmed;
		let subject = null;
		let priority = null;
		let summary = null;
		try {
			const { object } = await generateObject({
				model: gw(DEFAULT_MODEL),
				system: `${UPSC_SYSTEM_PROMPT}\nReturn only a valid JSON object matching the requested schema.`,
				schema: objectType({
					subject: enumType(SUBJECTS),
					priority: enumType([
						"high",
						"medium",
						"low"
					]),
					summary: stringType().min(20).max(600)
				}),
				prompt: `Classify the following study material for UPSC preparation and return JSON only.

Pick the single best subject from this list: ${SUBJECTS.join(", ")}.
Assess UPSC priority (high / medium / low) based on how frequently this topic appears in PYQs and the current syllabus.
Write a crisp 2–3 sentence summary highlighting UPSC relevance.

Material (excerpt):
"""
${sample}
"""`
			});
			subject = object.subject;
			priority = object.priority;
			summary = object.summary;
		} catch (e) {
			console.error("classify failed", e);
		}
		await supabase.from("documents").update({
			extracted_text: trimmed,
			subject,
			priority,
			summary,
			status: "ready"
		}).eq("id", doc.id);
		return {
			ok: true,
			subject,
			priority
		};
	} catch (e) {
		console.error("extract failed", e);
		if (isDriveFileInaccessibleError(e)) {
			await supabase.from("documents").update({
				status: "failed",
				error_message: DRIVE_FILE_INACCESSIBLE_MESSAGE
			}).eq("id", doc.id);
			return {
				ok: false,
				reason: "drive_file_inaccessible",
				message: DRIVE_FILE_INACCESSIBLE_MESSAGE
			};
		}
		await supabase.from("documents").update({
			status: "failed",
			error_message: e?.message || "Extraction failed"
		}).eq("id", doc.id);
		throw e;
	}
});
var listDocuments_createServerFn_handler = createServerRpc({
	id: "7bbe916d0c0b14b33e289192f7ab12893c0b8286759f1948b274b5c959369258",
	name: "listDocuments",
	filename: "src/lib/documents.functions.ts"
}, (opts) => listDocuments.__executeServer(opts));
var listDocuments = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listDocuments_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("documents").select("id,title,source_type,subject,priority,summary,status,error_message,size_bytes,created_at,mime,drive_file_id,drive_view_link,storage_provider").eq("user_id", userId).neq("source_type", "download").order("created_at", { ascending: false });
	if (error) throw error;
	return data;
});
var getDocument_createServerFn_handler = createServerRpc({
	id: "1697f68c362f0f7295091ed4dfd426e28abdf8975e9ae613689d562bea4cd6c8",
	name: "getDocument",
	filename: "src/lib/documents.functions.ts"
}, (opts) => getDocument.__executeServer(opts));
var getDocument = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(getDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error } = await supabase.from("documents").select("*").eq("id", data.id).eq("user_id", userId).single();
	if (error || !doc) throw new Error("Not found");
	const { data: gens } = await supabase.from("generations").select("id,output_type,title,content,model,status,error_message,created_at").eq("document_id", doc.id).order("created_at", { ascending: false });
	return {
		document: doc,
		generations: gens ?? []
	};
});
var deleteDocument_createServerFn_handler = createServerRpc({
	id: "3aa19b2f79082c5ff1f5628e9f17c9b708bb5ffaa61831d8c1a2062fe799a8a2",
	name: "deleteDocument",
	filename: "src/lib/documents.functions.ts"
}, (opts) => deleteDocument.__executeServer(opts));
var deleteDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(deleteDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc } = await supabase.from("documents").select("drive_file_id").eq("id", data.id).eq("user_id", userId).single();
	if (doc?.drive_file_id) try {
		const { deleteDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		await deleteDriveFile(doc.drive_file_id);
	} catch (e) {
		console.warn("[gdrive] delete failed, removing DB row anyway", e);
	}
	const { error } = await supabase.from("documents").delete().eq("id", data.id).eq("user_id", userId);
	if (error) throw error;
	return { ok: true };
});
var getDriveQuota_createServerFn_handler = createServerRpc({
	id: "473946ff68d52f95c94aecfb156d06f65a209403a7869810543b6c4fd0e18f66",
	name: "getDriveQuota",
	filename: "src/lib/documents.functions.ts"
}, (opts) => getDriveQuota.__executeServer(opts));
var getDriveQuota = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getDriveQuota_createServerFn_handler, async () => {
	const { getDriveStorageQuota } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	return getDriveStorageQuota();
});
var syncFromDrive_createServerFn_handler = createServerRpc({
	id: "2eb8266105f7bcf21a1c57716d13a8c75753530bc6a371c50d50730320978e46",
	name: "syncFromDrive",
	filename: "src/lib/documents.functions.ts"
}, (opts) => syncFromDrive.__executeServer(opts));
var syncFromDrive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(syncFromDrive_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { getUserFolderId, listFolderFiles } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const driveFiles = await listFolderFiles(await getUserFolderId(userId));
	const { data: existing, error: exErr } = await supabase.from("documents").select("drive_file_id").eq("user_id", userId).not("drive_file_id", "is", null);
	if (exErr) throw exErr;
	const known = new Set((existing ?? []).map((r) => r.drive_file_id));
	const toImport = driveFiles.filter((f) => !known.has(f.id));
	if (toImport.length === 0) return {
		imported: 0,
		alreadyPresent: driveFiles.length,
		scanned: driveFiles.length
	};
	const rows = toImport.map((f) => ({
		user_id: userId,
		title: f.name,
		file_name: f.name,
		mime: f.mimeType,
		size_bytes: f.size,
		source_type: "upload",
		status: "uploaded",
		storage_provider: "google_drive",
		drive_file_id: f.id,
		drive_view_link: f.webViewLink
	}));
	const { error: insErr } = await supabase.from("documents").insert(rows);
	if (insErr) throw insErr;
	return {
		imported: toImport.length,
		alreadyPresent: driveFiles.length - toImport.length,
		scanned: driveFiles.length
	};
});
var createUploadSession_createServerFn_handler = createServerRpc({
	id: "1c02fba283a30dffb787f202dd34588bad84f2b765c1b305c7ca891e18b78f4a",
	name: "createUploadSession",
	filename: "src/lib/documents.functions.ts"
}, (opts) => createUploadSession.__executeServer(opts));
var createUploadSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	fileName: stringType().min(1).max(255),
	mime: stringType().min(1).max(200),
	size: numberType().int().positive().max(5 * 1024 * 1024 * 1024),
	title: stringType().min(1).max(255).optional()
}).parse(d)).handler(createUploadSession_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { createResumableUploadSession } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const { uploadUrl } = await createResumableUploadSession({
		userId,
		fileName: data.fileName,
		mime: data.mime,
		size: data.size
	});
	const { data: row, error } = await supabase.from("documents").insert({
		user_id: userId,
		title: data.title || data.fileName,
		file_name: data.fileName,
		mime: data.mime,
		size_bytes: data.size,
		source_type: "upload",
		status: "uploaded",
		storage_provider: "google_drive"
	}).select("id").single();
	if (error) throw error;
	return {
		documentId: row.id,
		uploadUrl
	};
});
var finalizeUpload_createServerFn_handler = createServerRpc({
	id: "bedd29c4906ffa72332e57093046b44f233aed43b342b2b28d6ffc9b02e1bb49",
	name: "finalizeUpload",
	filename: "src/lib/documents.functions.ts"
}, (opts) => finalizeUpload.__executeServer(opts));
var finalizeUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	driveFileId: stringType().min(1).max(200).nullable().optional()
}).parse(d)).handler(finalizeUpload_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error: docErr } = await supabase.from("documents").select("id,file_name,size_bytes,mime").eq("id", data.documentId).eq("user_id", userId).single();
	if (docErr || !doc) throw docErr || /* @__PURE__ */ new Error("Document not found");
	const { getDriveFileMetadata, findLatestDriveFileByUpload } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const meta = data.driveFileId ? await getDriveFileMetadata(data.driveFileId) : await findLatestDriveFileByUpload({
		userId,
		fileName: doc.file_name || doc.id,
		size: Number(doc.size_bytes || 0),
		mime: doc.mime || void 0
	});
	if (!meta) throw new Error("Upload reached Google Drive but the final response was not readable. Please click Sync from Drive or retry once; the file may already be in your Drive folder.");
	const { data: row, error } = await supabase.from("documents").update({
		status: "uploaded",
		drive_file_id: meta.id,
		drive_view_link: meta.webViewLink,
		size_bytes: meta.size,
		mime: meta.mimeType
	}).eq("id", data.documentId).eq("user_id", userId).select().single();
	if (error) throw error;
	return row;
});
var completeUploadFinalChunk_createServerFn_handler = createServerRpc({
	id: "459337d2ecbd91590ccdd61860ad886393cfec8c4fd9ceed1b81ca5a64c718a7",
	name: "completeUploadFinalChunk",
	filename: "src/lib/documents.functions.ts"
}, (opts) => completeUploadFinalChunk.__executeServer(opts));
var completeUploadFinalChunk = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const documentId = String(d.get("documentId") || "");
	const uploadUrl = String(d.get("uploadUrl") || "");
	const start = Number(d.get("start"));
	const end = Number(d.get("end"));
	const total = Number(d.get("total"));
	const chunk = d.get("chunk");
	if (!stringType().uuid().safeParse(documentId).success) throw new Error("Invalid document id");
	if (!uploadUrl.startsWith("https://www.googleapis.com/upload/drive/v3/files")) throw new Error("Invalid upload URL");
	if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(total) || start < 0 || end <= start || total < end) throw new Error("Invalid upload range");
	if (!(chunk instanceof File)) throw new Error("Missing upload chunk");
	if (chunk.size !== end - start) throw new Error("Upload chunk size mismatch");
	if (chunk.size > 4 * 1024 * 1024) throw new Error("Final upload chunk is too large");
	return {
		documentId,
		uploadUrl,
		start,
		end,
		total,
		chunk
	};
}).handler(completeUploadFinalChunk_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error: docErr } = await supabase.from("documents").select("id").eq("id", data.documentId).eq("user_id", userId).single();
	if (docErr || !doc) throw docErr || /* @__PURE__ */ new Error("Document not found");
	const { uploadFinalResumableChunk } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const meta = await uploadFinalResumableChunk({
		uploadUrl: data.uploadUrl,
		start: data.start,
		end: data.end,
		total: data.total,
		chunk: await data.chunk.arrayBuffer()
	});
	const { data: row, error } = await supabase.from("documents").update({
		status: "uploaded",
		drive_file_id: meta.id,
		drive_view_link: meta.webViewLink,
		size_bytes: meta.size,
		mime: meta.mimeType
	}).eq("id", data.documentId).eq("user_id", userId).select().single();
	if (error) throw error;
	return row;
});
//#endregion
export { completeUploadFinalChunk_createServerFn_handler, createUploadSession_createServerFn_handler, deleteDocument_createServerFn_handler, extractDocument_createServerFn_handler, finalizeUpload_createServerFn_handler, getDocument_createServerFn_handler, getDriveQuota_createServerFn_handler, listDocuments_createServerFn_handler, syncFromDrive_createServerFn_handler, uploadDocument_createServerFn_handler };
