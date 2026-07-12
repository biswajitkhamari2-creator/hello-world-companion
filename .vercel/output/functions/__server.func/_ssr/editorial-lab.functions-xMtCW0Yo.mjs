import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editorial-lab.functions-xMtCW0Yo.js
var TELEGRAM_SHARED_OWNER = "telegram-inbox";
function extractUrls(text) {
	return Array.from(new Set(text.match(/https?:\/\/[^\s)]+/gi) ?? []));
}
function extractDriveFileId(url) {
	try {
		const u = new URL(url);
		if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
		const m = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
		if (m) return m[1];
		const idParam = u.searchParams.get("id");
		return idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam) ? idParam : null;
	} catch {
		return null;
	}
}
function getDriveUrlFromInboxRow(row) {
	return [
		row?.source_url,
		row?.caption,
		row?.file_name,
		JSON.stringify(row?.raw ?? {})
	].filter(Boolean).flatMap((v) => extractUrls(String(v))).find((url) => Boolean(extractDriveFileId(url))) ?? null;
}
async function fetchPublicDrivePdf(fileId) {
	const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
	let res = await fetch(primary, { redirect: "follow" });
	let contentType = res.headers.get("content-type") || "";
	if (res.ok && /text\/html/i.test(contentType)) {
		const html = await res.text();
		const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
		const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] || "t";
		if (uuid) {
			const retry = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
			res = await fetch(retry, { redirect: "follow" });
			contentType = res.headers.get("content-type") || "";
		}
	}
	if (!res.ok) throw new Error(`Drive public download failed (${res.status}). Share it as "Anyone with the link — Viewer" and resend.`);
	if (/text\/html/i.test(contentType)) throw new Error("Drive returned a web page instead of PDF. Make the file public: Anyone with the link — Viewer.");
	const cd = res.headers.get("content-disposition") || "";
	const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
	const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
	const bytes = await res.arrayBuffer();
	const mime = contentType.split(";")[0].trim() || "application/pdf";
	if (!(mime.includes("pdf") || (name || "").toLowerCase().endsWith(".pdf"))) throw new Error("This Drive link is not a PDF file.");
	return {
		bytes,
		mime,
		name
	};
}
function getTelegramFileIdFromRaw(raw, kind) {
	const msg = raw?.message || raw?.channel_post || raw?.edited_message || raw?.edited_channel_post || {};
	if (kind === "pdf") return msg?.document?.file_id || null;
	if (Array.isArray(msg?.photo)) return msg.photo.at(-1)?.file_id || null;
	return null;
}
function getAdmin() {
	const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://ffkyjnswyfeghmfmlapu.supabase.co";
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.APP_SUPABASE_SECRET_KEY;
	if (!key) throw new Error("Supabase service key missing");
	return createClient(url, key, { auth: {
		storage: void 0,
		persistSession: false,
		autoRefreshToken: false
	} });
}
var listInboxNewspapers_createServerFn_handler = createServerRpc({
	id: "bf2f2a51eabf1972b4802a1db319f1db1c49e0eb2a55f3bf155bcc0859711eb8",
	name: "listInboxNewspapers",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => listInboxNewspapers.__executeServer(opts));
var listInboxNewspapers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listInboxNewspapers_createServerFn_handler, async ({ context }) => {
	const supabase = getAdmin();
	const { data: inboxRows, error: inboxError } = await supabase.from("telegram_inbox").select("id,kind,file_name,caption,posted_at,size_bytes,drive_file_id,drive_view_link,source_url,status,error_message,raw").in("kind", ["pdf", "link"]).is("archived_at", null).order("posted_at", { ascending: false }).limit(100);
	if (inboxError) throw new Error(inboxError.message);
	const usableInboxRows = (inboxRows ?? []).filter((r) => {
		if (r.kind === "pdf") return true;
		return Boolean(getDriveUrlFromInboxRow(r));
	});
	const { data: docRows, error: docError } = await supabase.from("documents").select("id,title,file_name,created_at,size_bytes,drive_file_id,drive_view_link,mime,source_type,status,error_message").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(50);
	if (docError) throw new Error(docError.message);
	const inboxIds = new Set(usableInboxRows.map((r) => r.drive_file_id).filter(Boolean));
	const documentPdfs = (docRows ?? []).filter((r) => {
		const name = String(r.file_name || r.title || "").toLowerCase();
		return String(r.mime || "").toLowerCase().includes("pdf") || name.endsWith(".pdf") || r.source_type === "telegram";
	}).filter((r) => !inboxIds.has(r.drive_file_id)).filter((r) => Boolean(r.drive_file_id)).map((r) => ({
		id: r.id,
		file_name: r.file_name || r.title || "Uploaded newspaper PDF",
		caption: r.title || null,
		posted_at: r.created_at,
		size_bytes: r.size_bytes,
		drive_file_id: r.drive_file_id,
		drive_view_link: r.drive_view_link,
		status: r.status,
		error_message: r.error_message,
		source: "documents"
	}));
	return [...(usableInboxRows ?? []).map((r) => ({
		...r,
		file_name: r.file_name || (r.kind === "link" ? "Google Drive newspaper PDF" : r.file_name),
		status: r.kind === "link" && !r.drive_file_id ? "drive_link_ready" : r.status,
		source: "telegram_inbox"
	})), ...documentPdfs].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
});
var listEditorials_createServerFn_handler = createServerRpc({
	id: "1da673cdad932c328d7c107d7bbbbfcd4bcdfa5fcc220da9aca953aae8e45e82",
	name: "listEditorials",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => listEditorials.__executeServer(opts));
var listEditorials = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listEditorials_createServerFn_handler, async () => {
	const { data, error } = await getAdmin().from("editorials").select("id,inbox_id,source_label,newspaper,edition_date,analysis,model,created_at").order("created_at", { ascending: false }).limit(80);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getEditorial_createServerFn_handler = createServerRpc({
	id: "528d2f102251903527a97fd8f0a7bf104c0e49db726566ec8fe6c67b552eeac2",
	name: "getEditorial",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => getEditorial.__executeServer(opts));
var getEditorial = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(getEditorial_createServerFn_handler, async ({ data }) => {
	const { data: row, error } = await getAdmin().from("editorials").select("id,inbox_id,source_label,newspaper,edition_date,analysis,model,created_at").eq("id", data.id).maybeSingle();
	if (error) throw new Error(error.message);
	if (!row) throw new Error("Editorial not found");
	return row;
});
var deleteEditorial_createServerFn_handler = createServerRpc({
	id: "3b8648c59f4edf77c2c5e3747d523608f0b66343ad3cd774950208c633cca859",
	name: "deleteEditorial",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => deleteEditorial.__executeServer(opts));
var deleteEditorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(deleteEditorial_createServerFn_handler, async ({ data, context }) => {
	const { error } = await getAdmin().from("editorials").delete().eq("id", data.id).eq("user_id", context.userId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var removeEditorialPiece_createServerFn_handler = createServerRpc({
	id: "91afd803edd6ec146e707970c14ff92fef35693bc7df9db64e8eece6572c497e",
	name: "removeEditorialPiece",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => removeEditorialPiece.__executeServer(opts));
var removeEditorialPiece = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	id: stringType().uuid(),
	index: numberType().int().min(0)
}).parse(d)).handler(removeEditorialPiece_createServerFn_handler, async ({ data, context }) => {
	const supabase = getAdmin();
	const { data: row, error: readErr } = await supabase.from("editorials").select("id,user_id,analysis").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
	if (readErr) throw new Error(readErr.message);
	if (!row) throw new Error("Editorial not found");
	const analysis = row.analysis || {
		editorials: [],
		detectedNewspaper: ""
	};
	const items = Array.isArray(analysis.editorials) ? analysis.editorials : [];
	if (data.index < 0 || data.index >= items.length) throw new Error("Piece index out of range");
	const nextItems = items.filter((_, i) => i !== data.index);
	if (nextItems.length === 0) {
		const { error } = await supabase.from("editorials").delete().eq("id", data.id).eq("user_id", context.userId);
		if (error) throw new Error(error.message);
		return {
			ok: true,
			rowDeleted: true
		};
	}
	const { error } = await supabase.from("editorials").update({ analysis: {
		...analysis,
		editorials: nextItems
	} }).eq("id", data.id).eq("user_id", context.userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		rowDeleted: false
	};
});
function bufferToBase64(buf) {
	return Buffer.from(buf).toString("base64");
}
var GEMINI_MODEL = "gemini-2.5-pro";
function extractJsonCandidate(raw) {
	const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
	if (cleaned.startsWith("{") || cleaned.startsWith("[")) return cleaned;
	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");
	if (start !== -1 && end > start) return cleaned.slice(start, end + 1);
	throw new Error("Gemini returned invalid JSON");
}
function parseEditorialJson(raw) {
	const candidate = extractJsonCandidate(raw);
	try {
		return JSON.parse(candidate);
	} catch {
		const cleaned = candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
		try {
			return JSON.parse(cleaned);
		} catch {
			return salvageEditorialJson(cleaned);
		}
	}
}
function salvageEditorialJson(raw) {
	const newspaperMatch = raw.match(/"detectedNewspaper"\s*:\s*"([^"]*)"/);
	const dateMatch = raw.match(/"editionDate"\s*:\s*"([^"]*)"/);
	const arrStart = raw.indexOf("\"editorials\"");
	const editorials = [];
	if (arrStart !== -1) {
		const bracket = raw.indexOf("[", arrStart);
		if (bracket !== -1) {
			let i = bracket + 1;
			const n = raw.length;
			while (i < n) {
				while (i < n && raw[i] !== "{") i++;
				if (i >= n) break;
				const objStart = i;
				let depth = 0;
				let inStr = false;
				let esc = false;
				let objEnd = -1;
				for (; i < n; i++) {
					const c = raw[i];
					if (inStr) {
						if (esc) esc = false;
						else if (c === "\\") esc = true;
						else if (c === "\"") inStr = false;
					} else if (c === "\"") inStr = true;
					else if (c === "{") depth++;
					else if (c === "}") {
						depth--;
						if (depth === 0) {
							objEnd = i;
							break;
						}
					}
				}
				if (objEnd === -1) break;
				const slice = raw.slice(objStart, objEnd + 1);
				try {
					editorials.push(JSON.parse(slice));
				} catch {}
				i = objEnd + 1;
			}
		}
	}
	return {
		detectedNewspaper: newspaperMatch?.[1] || "Unknown",
		editionDate: dateMatch?.[1],
		editorials
	};
}
async function callGeminiOnPdf(pdfBytes) {
	const key = (process.env.GEMINI_API_KEY || "").trim();
	if (!key) throw new Error("GEMINI_API_KEY not configured");
	const body = {
		contents: [{ parts: [{ text: `You are UPSC Genius. The attached PDF is a full newspaper.
STRICT SCOPE — READ THIS TWICE:
- Process ONLY the EDITORIAL and OP-ED pages (headers labelled "EDITORIAL", "COMMENT", "OPINION", "OP-ED", "Ideas", "Leaders").
- Completely IGNORE: front page, news, city, sports, business, markets, advertisements, obituaries, letters to the editor, cartoons, weather, TV listings, classifieds.
- Do NOT summarise a news article even if it looks analytical. Only pieces printed under the editorial/op-ed masthead qualify.
- Cover EVERY distinct editorial / op-ed piece present on those pages (typically 3-6 per issue). Do not skip any.

For each qualifying piece, output:
- title: exact headline.
- newspaper: detected name.
- pageHint: page label if visible.
- syllabus: Prelims/Mains stage + GS paper + subject + topic (+ subTopic if useful).
- crispNotes: 5-7 tight bullets.
- comprehensiveNotes: 160-220 words in Markdown with ## Context / ## Core Argument / ## Analysis / ## Way Forward.
- keyFacts, vocabulary (3-5 items), argumentsFor, argumentsAgainst, wayForward (3 items).
- diagramMermaid: short valid mermaid (flowchart TD or mindmap), quoted labels, only when it truly aids understanding.
- pyqLinks: real PYQ themes only — omit year if unsure. No fabrication.
- probablePrelimsMCQ + probableMainsQuestion grounded in the piece.
- importance.

Hard rules:
- Never invent facts, schemes, judgements or statistics.
- English only (translate if source is Hindi/Odia).
- Return valid JSON ONLY matching the schema. No prose outside JSON.
- Keep every string tight — no padding — to stay within the token budget.
- If the PDF has NO editorial/op-ed pages, return { "detectedNewspaper": "...", "editorials": [] }.` }, { inline_data: {
			mime_type: "application/pdf",
			data: bufferToBase64(pdfBytes)
		} }] }],
		generationConfig: {
			response_mime_type: "application/json",
			response_schema: {
				type: "object",
				properties: {
					detectedNewspaper: { type: "string" },
					editionDate: { type: "string" },
					editorials: {
						type: "array",
						items: {
							type: "object",
							properties: {
								title: { type: "string" },
								newspaper: { type: "string" },
								pageHint: { type: "string" },
								syllabus: {
									type: "object",
									properties: {
										stage: {
											type: "string",
											enum: [
												"Prelims",
												"Mains",
												"Both"
											]
										},
										paper: {
											type: "string",
											enum: [
												"GS-I",
												"GS-II",
												"GS-III",
												"GS-IV",
												"Essay",
												"Prelims"
											]
										},
										subject: { type: "string" },
										topic: { type: "string" },
										subTopic: { type: "string" }
									},
									required: [
										"stage",
										"paper",
										"subject",
										"topic"
									]
								},
								crispNotes: {
									type: "array",
									items: { type: "string" }
								},
								comprehensiveNotes: { type: "string" },
								keyFacts: {
									type: "array",
									items: { type: "string" }
								},
								vocabulary: {
									type: "array",
									items: {
										type: "object",
										properties: {
											word: { type: "string" },
											meaning: { type: "string" }
										},
										required: ["word", "meaning"]
									}
								},
								argumentsFor: {
									type: "array",
									items: { type: "string" }
								},
								argumentsAgainst: {
									type: "array",
									items: { type: "string" }
								},
								wayForward: {
									type: "array",
									items: { type: "string" }
								},
								diagramMermaid: { type: "string" },
								pyqLinks: {
									type: "array",
									items: {
										type: "object",
										properties: {
											year: { type: "integer" },
											paper: { type: "string" },
											question: { type: "string" }
										},
										required: ["question"]
									}
								},
								probablePrelimsMCQ: {
									type: "object",
									properties: {
										q: { type: "string" },
										options: {
											type: "array",
											items: { type: "string" }
										},
										answer: { type: "integer" },
										explanation: { type: "string" }
									},
									required: [
										"q",
										"options",
										"answer",
										"explanation"
									]
								},
								probableMainsQuestion: {
									type: "object",
									properties: {
										q: { type: "string" },
										paper: { type: "string" },
										marks: { type: "integer" },
										approach: { type: "string" }
									},
									required: [
										"q",
										"paper",
										"marks",
										"approach"
									]
								},
								importance: {
									type: "string",
									enum: [
										"Low",
										"Medium",
										"High",
										"Very High"
									]
								}
							},
							required: [
								"title",
								"newspaper",
								"syllabus",
								"crispNotes",
								"comprehensiveNotes",
								"importance"
							]
						}
					}
				},
				required: ["detectedNewspaper", "editorials"]
			},
			temperature: .15,
			maxOutputTokens: 16384
		}
	};
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
	const r = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	if (!r.ok) {
		const txt = await r.text().catch(() => "");
		throw new Error(`Gemini editorial extract failed: ${r.status} ${txt.slice(0, 240)}`);
	}
	const j = await r.json();
	const finishReason = j?.candidates?.[0]?.finishReason;
	const text = j?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? "").join("") ?? "";
	let parsed;
	try {
		parsed = parseEditorialJson(text);
	} catch (parseError) {
		throw new Error(`Gemini returned unrecoverable JSON (finishReason=${finishReason ?? "unknown"}): ${parseError.message.slice(0, 200)}`);
	}
	if (!Array.isArray(parsed.editorials)) parsed.editorials = [];
	return parsed;
}
var analyseEditorialFromInbox_createServerFn_handler = createServerRpc({
	id: "014b6d3319e7c1cc598de3764b3ffbf0f7e47d9570f8d687dc5aaec1db0d9024",
	name: "analyseEditorialFromInbox",
	filename: "src/lib/editorial-lab.functions.ts"
}, (opts) => analyseEditorialFromInbox.__executeServer(opts));
var analyseEditorialFromInbox = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ inboxId: stringType().uuid() }).parse(d)).handler(analyseEditorialFromInbox_createServerFn_handler, async ({ data, context }) => {
	const supabase = getAdmin();
	const { data: cached } = await supabase.from("editorials").select("id,analysis").eq("user_id", context.userId).eq("inbox_id", data.inboxId).order("created_at", { ascending: false }).limit(1).maybeSingle();
	if (cached?.id) {
		const a = cached.analysis ?? {};
		return {
			id: cached.id,
			editorialCount: Array.isArray(a?.editorials) ? a.editorials.length : 0,
			cached: true
		};
	}
	const { data: inbox, error } = await supabase.from("telegram_inbox").select("id,kind,file_name,caption,posted_at,drive_file_id,drive_view_link,source_url,mime,size_bytes,status,raw").eq("id", data.inboxId).maybeSingle();
	if (error) throw new Error(error.message);
	let source = inbox ? {
		id: inbox.id,
		inboxId: inbox.id,
		fileName: inbox.file_name,
		caption: inbox.caption,
		postedAt: inbox.posted_at,
		driveFileId: inbox.drive_file_id,
		mime: inbox.mime,
		sizeBytes: inbox.size_bytes,
		raw: inbox.raw
	} : null;
	if (source && !source.driveFileId) {
		const driveUrl = getDriveUrlFromInboxRow(inbox);
		const driveId = driveUrl ? extractDriveFileId(driveUrl) : null;
		if (driveId) try {
			const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
			const dl = await fetchPublicDrivePdf(driveId);
			const uploaded = await uploadBufferToDrive({
				userId: TELEGRAM_SHARED_OWNER,
				fileName: dl.name || source.fileName || `drive-${driveId}.pdf`,
				mime: dl.mime || "application/pdf",
				data: dl.bytes
			});
			await supabase.from("telegram_inbox").update({
				kind: "pdf",
				file_name: dl.name || source.fileName || `drive-${driveId}.pdf`,
				drive_file_id: uploaded.fileId,
				drive_view_link: uploaded.webViewLink,
				mime: uploaded.mimeType,
				size_bytes: uploaded.size,
				status: "ready",
				error_message: null,
				source_url: driveUrl
			}).eq("id", source.id);
			source.driveFileId = uploaded.fileId;
			source.fileName = dl.name || source.fileName || `drive-${driveId}.pdf`;
			source.mime = uploaded.mimeType;
			source.sizeBytes = uploaded.size;
		} catch (e) {
			throw new Error(`Could not import the Drive PDF for Editorial Lab. ${String(e?.message || e)}`);
		}
	}
	if (source && !source.driveFileId && inbox?.raw) {
		const telegramFileId = getTelegramFileIdFromRaw(inbox.raw, "pdf");
		if (telegramFileId) try {
			const [{ tgDownload }, { uploadBufferToDrive }] = await Promise.all([import("./telegram.server-CNrfEYV6.mjs").then((n) => n.r), import("./gdrive.server-Cyjwc2Ll.mjs")]);
			const { bytes } = await tgDownload(telegramFileId);
			const uploaded = await uploadBufferToDrive({
				userId: TELEGRAM_SHARED_OWNER,
				fileName: source.fileName || `telegram-${source.id}.pdf`,
				mime: source.mime || "application/pdf",
				data: bytes
			});
			await supabase.from("telegram_inbox").update({
				drive_file_id: uploaded.fileId,
				drive_view_link: uploaded.webViewLink,
				mime: uploaded.mimeType,
				size_bytes: uploaded.size,
				status: "ready",
				error_message: null
			}).eq("id", source.id);
			source.driveFileId = uploaded.fileId;
			source.mime = uploaded.mimeType;
			source.sizeBytes = uploaded.size;
		} catch (e) {
			const msg = String(e?.message || e || "");
			if (/file is too big/i.test(msg)) throw new Error("Telegram bots cannot download PDFs larger than 20 MB. Upload this newspaper manually or send a Drive link.");
			throw new Error(`Could not fetch this Telegram PDF. Please resend it to the bot, then refresh. Details: ${msg}`);
		}
	}
	if (!source?.driveFileId) {
		const { data: doc, error: docError } = await supabase.from("documents").select("id,title,file_name,created_at,drive_file_id,mime,source_type,size_bytes").eq("id", data.inboxId).eq("user_id", context.userId).maybeSingle();
		if (docError) throw new Error(docError.message);
		if (doc?.drive_file_id) source = {
			id: doc.id,
			inboxId: null,
			fileName: doc.file_name,
			caption: doc.title,
			postedAt: doc.created_at,
			driveFileId: doc.drive_file_id,
			mime: doc.mime,
			sizeBytes: doc.size_bytes
		};
	}
	if (!source?.driveFileId) throw new Error("Newspaper PDF is visible but has no downloadable file yet. Resend it to Telegram or upload it manually, then press Refresh.");
	const { downloadDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	const { buffer } = await downloadDriveFile(source.driveFileId);
	const analysis = await callGeminiOnPdf(buffer);
	const sourceLabel = source.fileName || source.caption || analysis.detectedNewspaper || "Newspaper";
	const editionDate = analysis.editionDate?.match(/^\d{4}-\d{2}-\d{2}$/) ? analysis.editionDate : String(source.postedAt).slice(0, 10);
	let safeInboxId = source.inboxId;
	if (safeInboxId) {
		const { data: existsRow } = await supabase.from("telegram_inbox").select("id").eq("id", safeInboxId).maybeSingle();
		if (!existsRow) safeInboxId = null;
	}
	const insertPayload = {
		user_id: context.userId,
		inbox_id: safeInboxId,
		source_label: sourceLabel,
		newspaper: analysis.detectedNewspaper || "Unknown",
		edition_date: editionDate,
		analysis,
		model: GEMINI_MODEL
	};
	let { data: inserted, error: insErr } = await supabase.from("editorials").insert(insertPayload).select("id").single();
	if (insErr && /foreign key|editorials_inbox_id_fkey/i.test(insErr.message)) {
		const retry = await supabase.from("editorials").insert({
			...insertPayload,
			inbox_id: null
		}).select("id").single();
		inserted = retry.data;
		insErr = retry.error;
	}
	if (insErr) throw new Error(insErr.message);
	if (!inserted) throw new Error("Failed to save editorial analysis.");
	return {
		id: inserted.id,
		editorialCount: analysis.editorials.length
	};
});
//#endregion
export { analyseEditorialFromInbox_createServerFn_handler, deleteEditorial_createServerFn_handler, getEditorial_createServerFn_handler, listEditorials_createServerFn_handler, listInboxNewspapers_createServerFn_handler, removeEditorialPiece_createServerFn_handler };
