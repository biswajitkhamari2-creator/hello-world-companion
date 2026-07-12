import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType, ot as enumType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/news-items.functions-D-hOPYf2.js
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
var listNewsItems_createServerFn_handler = createServerRpc({
	id: "184c7132927bba09e7fa4c7d009be2aef5a57b297a04c8f87ee231baec7ab269",
	name: "listNewsItems",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => listNewsItems.__executeServer(opts));
var listNewsItems = createServerFn({ method: "GET" }).inputValidator((input) => objectType({
	gs: enumType([
		"GS1",
		"GS2",
		"GS3",
		"GS4",
		"General",
		"all"
	]).optional(),
	limit: numberType().int().min(1).max(300).optional()
}).optional().parse(input)).handler(listNewsItems_createServerFn_handler, async ({ data }) => {
	const limit = data?.limit ?? 60;
	let q = getAdmin().from("telegram_news_items").select("id, inbox_id, gs_paper, subject, title, summary, importance, posted_at").order("posted_at", { ascending: false }).order("importance", { ascending: false }).limit(limit);
	if (data?.gs && data.gs !== "all") q = q.eq("gs_paper", data.gs);
	const { data: rows, error } = await q;
	if (error) throw new Error(error.message);
	return rows ?? [];
});
var countPendingInbox_createServerFn_handler = createServerRpc({
	id: "8c245f7bd6b3309f938541d57f7c4e715928a8d0a2d75be5c8d6e1a34e695310",
	name: "countPendingInbox",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => countPendingInbox.__executeServer(opts));
var countPendingInbox = createServerFn({ method: "GET" }).handler(countPendingInbox_createServerFn_handler, async () => {
	const { count, error } = await getAdmin().from("telegram_inbox").select("id", {
		count: "exact",
		head: true
	}).eq("kind", "pdf").eq("status", "ready").is("analysed_at", null);
	if (error) throw new Error(error.message);
	return { pending: count ?? 0 };
});
var hardResetNewsAnalysis_createServerFn_handler = createServerRpc({
	id: "e6c3ed89b1eb4507d3b894708545247749fb0d0a2501bb4056eb9ac002a5c3fd",
	name: "hardResetNewsAnalysis",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => hardResetNewsAnalysis.__executeServer(opts));
var hardResetNewsAnalysis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(hardResetNewsAnalysis_createServerFn_handler, async () => {
	const supabase = getAdmin();
	const { count: beforeCount } = await supabase.from("telegram_news_items").select("id", {
		count: "exact",
		head: true
	});
	const { error: deleteError } = await supabase.from("telegram_news_items").delete().not("id", "is", null);
	if (deleteError) throw new Error(deleteError.message);
	const { error: resetError } = await supabase.from("telegram_inbox").update({
		analysed_at: null,
		error_message: null
	}).eq("kind", "pdf").eq("status", "ready");
	if (resetError) throw new Error(resetError.message);
	const { count: pendingCount } = await supabase.from("telegram_inbox").select("id", {
		count: "exact",
		head: true
	}).eq("kind", "pdf").eq("status", "ready").is("analysed_at", null);
	return {
		deleted: beforeCount ?? 0,
		pending: pendingCount ?? 0
	};
});
var diagnoseInbox_createServerFn_handler = createServerRpc({
	id: "ab05eefda1673f19fb61acf88e0a947aee1ddafc44f3ade501b7c937714b5525",
	name: "diagnoseInbox",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => diagnoseInbox.__executeServer(opts));
var diagnoseInbox = createServerFn({ method: "GET" }).handler(diagnoseInbox_createServerFn_handler, async () => {
	const supabase = getAdmin();
	const { data: rows, error } = await supabase.from("telegram_inbox").select("kind,status,analysed_at,error_message,drive_file_id").order("posted_at", { ascending: false }).limit(500);
	if (error) throw new Error(error.message);
	let pending = 0, deadDrive = 0, duplicates = 0, failed = 0, links = 0, done = 0;
	const sampleErr = [];
	for (const r of rows ?? []) {
		if (r.kind === "link") links++;
		if (r.status === "duplicate") {
			duplicates++;
			continue;
		}
		if (r.status === "failed") {
			failed++;
			if (r.error_message && sampleErr.length < 3) sampleErr.push(r.error_message);
			continue;
		}
		if (r.status === "ready" && !r.analysed_at && r.kind === "pdf") pending++;
		if (r.analysed_at && r.error_message) {
			const m = r.error_message.toLowerCase();
			if (m.includes("no longer accessible") || m.includes("drive.file") || m.includes("not found") || m.includes("404")) {
				deadDrive++;
				if (sampleErr.length < 3) sampleErr.push(r.error_message);
			} else {
				failed++;
				if (sampleErr.length < 3) sampleErr.push(r.error_message);
			}
		}
		if (r.analysed_at && !r.error_message) done++;
	}
	const { count: newsCount } = await supabase.from("telegram_news_items").select("id", {
		count: "exact",
		head: true
	});
	return {
		total: (rows ?? []).length,
		pending,
		deadDrive,
		duplicates,
		failed,
		links,
		done,
		newsCount: newsCount ?? 0,
		sampleErr
	};
});
var resetFailedInbox_createServerFn_handler = createServerRpc({
	id: "8c1e3ccb2742668e189959c33848daf96eb02356874b8fe770141bffbcc59f5a",
	name: "resetFailedInbox",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => resetFailedInbox.__executeServer(opts));
var resetFailedInbox = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(resetFailedInbox_createServerFn_handler, async () => {
	const supabase = getAdmin();
	const { data: rows, error } = await supabase.from("telegram_inbox").select("id,error_message,drive_file_id,status").not("error_message", "is", null).limit(500);
	if (error) throw new Error(error.message);
	const retryIds = [];
	for (const r of rows ?? []) {
		const m = (r.error_message ?? "").toLowerCase();
		if (m.includes("no longer accessible") || m.includes("drive.file") || m.includes("not found") || m.includes("404")) continue;
		if (r.status !== "ready" || !r.drive_file_id) continue;
		retryIds.push(r.id);
	}
	if (retryIds.length) await supabase.from("telegram_inbox").update({
		analysed_at: null,
		error_message: null
	}).in("id", retryIds);
	return { reset: retryIds.length };
});
var searchNewsArchive_createServerFn_handler = createServerRpc({
	id: "fe7b0a19778bdac223c3ec63d85d9a65d322d9c7128cd01a660109712fbe7680",
	name: "searchNewsArchive",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => searchNewsArchive.__executeServer(opts));
var searchNewsArchive = createServerFn({ method: "GET" }).inputValidator((input) => objectType({
	from: stringType().optional(),
	to: stringType().optional(),
	gs: enumType([
		"GS1",
		"GS2",
		"GS3",
		"GS4",
		"General",
		"all"
	]).optional(),
	q: stringType().max(200).optional(),
	limit: numberType().int().min(1).max(2e3).optional()
}).optional().parse(input)).handler(searchNewsArchive_createServerFn_handler, async ({ data }) => {
	const supabase = getAdmin();
	let q = supabase.from("telegram_news_items").select("id, inbox_id, gs_paper, subject, title, summary, importance, posted_at").order("posted_at", { ascending: false }).order("importance", { ascending: false }).limit(data?.limit ?? 200);
	if (data?.from) q = q.gte("posted_at", `${data.from}T00:00:00Z`);
	if (data?.to) q = q.lte("posted_at", `${data.to}T23:59:59Z`);
	if (data?.gs && data.gs !== "all") q = q.eq("gs_paper", data.gs);
	if (data?.q && data.q.trim()) {
		const term = data.q.trim().replace(/[%,]/g, " ");
		q = q.or(`title.ilike.%${term}%,summary.ilike.%${term}%,subject.ilike.%${term}%`);
	}
	const { data: rows, error } = await q;
	if (error) throw new Error(error.message);
	const items = rows ?? [];
	const ids = Array.from(new Set(items.map((r) => r.inbox_id).filter(Boolean)));
	if (ids.length) {
		const { data: inboxRows } = await supabase.from("telegram_inbox").select("id,drive_view_link,source_url").in("id", ids);
		const linkMap = /* @__PURE__ */ new Map();
		for (const r of inboxRows ?? []) linkMap.set(r.id, r.drive_view_link || r.source_url || null);
		for (const it of items) it.link = linkMap.get(it.inbox_id) ?? null;
	}
	return items;
});
var listArchiveDates_createServerFn_handler = createServerRpc({
	id: "ca5794dbbb0ec15a221736627cb04e0ad47ebb96fec93f15ee0e3353728371af",
	name: "listArchiveDates",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => listArchiveDates.__executeServer(opts));
var listArchiveDates = createServerFn({ method: "GET" }).handler(listArchiveDates_createServerFn_handler, async () => {
	const { data, error } = await getAdmin().from("telegram_news_items").select("posted_at").order("posted_at", { ascending: false }).limit(2e3);
	if (error) throw new Error(error.message);
	const set = /* @__PURE__ */ new Set();
	for (const r of data ?? []) set.add(r.posted_at.slice(0, 10));
	return Array.from(set);
});
function bufferToBase64(buf) {
	return Buffer.from(buf).toString("base64");
}
async function geminiExtractStructured(pdfBytes) {
	const geminiKey = process.env.GEMINI_API_KEY?.trim();
	if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");
	const schema = {
		type: "object",
		properties: { items: {
			type: "array",
			items: {
				type: "object",
				properties: {
					gs_paper: {
						type: "string",
						enum: [
							"GS1",
							"GS2",
							"GS3",
							"GS4",
							"General"
						]
					},
					subject: { type: "string" },
					title: { type: "string" },
					summary: { type: "string" },
					importance: {
						type: "integer",
						minimum: 1,
						maximum: 5
					}
				},
				required: [
					"gs_paper",
					"title",
					"summary",
					"importance"
				]
			}
		} },
		required: ["items"]
	};
	const prompt = `You are a senior UPSC / OPSC mentor scanning a full newspaper PDF.
The newspaper may be in English, Hindi, Odia (ଓଡ଼ିଆ), or mixed-language. Read all scripts and return clean ENGLISH output.
Extract ONLY real, standalone news / editorial ARTICLES that are directly relevant to the UPSC / OPSC syllabus.

IMPORTANT LAYOUT METHOD:
1. First identify actual headline typography/article blocks on the page.
2. Then pair each headline with its body text.
3. Translate/rewrite the headline into complete English.
4. If the text is only a body paragraph, column continuation, caption, teaser, page pointer, or OCR noise, DROP it.

HARD REJECT — never emit an item whose title or summary is or contains any of:
 - Subscription banners, "give a missed call", phone numbers, QR-code prompts, "To subscribe", "IN BRIEF" section headers alone, page-jump pointers ("STATES » PAGE 3", "» PAGE 7", "contd. on page…").
 - Masthead / edition strip / date line / weather box / crossword / sudoku / horoscope / cartoons.
 - Crime blotter, local city notices, sports scores, advertisements, obituaries, movie reviews, film / celebrity gossip, share-market ticker, classifieds, tender notices.
 - Garbled OCR fragments, single-word titles, ALL-CAPS scream headers with no sentence, or titles that look like a mash-up of unrelated snippets from different columns.
 - MID-COLUMN CONTINUATIONS: text that starts lower-case, starts with "and/but/or/the/a/an/is/was/has/had/have", ends with an incomplete word or comma, or contains hyphen-space word breaks like "man- aged", "Wo- men's", "Is- lands" (these are line-wrap artifacts from the previous column, NOT headlines).
 - Sports match reports, tournament recaps (T20 / ODI / Test / IPL / World Cup / Olympics scores), celebrity/film pieces — REJECT even if they look like real articles; they are not UPSC-relevant.

If you are not confident the text is ONE coherent, standalone article HEADLINE (not a body-text sentence), DROP it. Better to return 3 great items than 15 broken ones.

Before returning, RE-READ every title you produced and delete any that:
 (a) starts with a lowercase letter, or
 (b) reads like the middle of a sentence rather than a headline, or
 (c) contains "- " inside a word (line-wrap artifact).

For every relevant article return:
 - gs_paper: one of GS1 (History, Geography, Society, Art & Culture), GS2 (Polity, Governance, IR, Social Justice), GS3 (Economy, Environment, S&T, Security, Disaster), GS4 (Ethics), General (only if truly cross-cutting).
 - subject: fine-grained tag (e.g. "Indian Polity", "Environment", "International Relations", "Economy").
 - title: full, complete, grammatical English headline in your own words describing ONE article — do NOT truncate, do NOT concatenate multiple headlines, do NOT copy subscription / QR / "IN BRIEF" text. Self-contained and specific (aim 60-160 chars, hard cap 220). Translate Odia/Hindi/non-English headlines fully to English.
 - summary: 2 to 4 sentence crisp brief in ENGLISH with WHAT / WHY it matters for UPSC — no fluff, no "according to article". Always translate source content to English regardless of original language.
 - importance: 1..5 where 5 = must-read for prelims/mains, 4 = high, 3 = useful, 2 = optional, 1 = skip.

Return at most 20 items. Prefer quality over quantity. Give special attention to Odisha state, OPSC-relevant governance, and regional angles when present. Return valid JSON only.`;
	const base = "https://generativelanguage.googleapis.com/v1beta/models";
	const pdfB64 = bufferToBase64(pdfBytes);
	const geminiBody = {
		contents: [{ parts: [{ text: prompt }, { inline_data: {
			mime_type: "application/pdf",
			data: pdfB64
		} }] }],
		generationConfig: {
			response_mime_type: "application/json",
			response_schema: schema,
			temperature: .2
		}
	};
	async function callDirectGemini(model) {
		if (!geminiKey) return null;
		const r = await fetch(`${base}/${model}:generateContent?key=${geminiKey}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(geminiBody)
		});
		if (!r.ok) {
			const body = await r.text().catch(() => "");
			throw new Error(`Gemini extract failed: ${r.status} ${body.slice(0, 200)}`);
		}
		return r.json();
	}
	let json = null;
	try {
		json = await callDirectGemini("gemini-2.5-flash");
	} catch (err) {
		console.warn("[news-extract] gemini-2.5-flash failed, falling back:", err.message);
		json = await callDirectGemini("gemini-2.0-flash");
	}
	if (!json) throw new Error("Gemini returned no response");
	const text = json?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? "").join("") ?? "";
	let parsed = null;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("Gemini did not return valid JSON");
	}
	const items = Array.isArray(parsed?.items) ? parsed.items : [];
	console.log(`[news-extract] gemini returned ${items.length} raw items`);
	const JUNK_RE = /(missed call|scan qr|to subscribe|subscribe.*call|\d{10}|in brief\s*$|»\s*page|contd\.?\s*on\s*page|cu-cuecm|crossword|sudoku|horoscope|classifieds?|advertisement|weather|edition|epaper|e-paper)/i;
	const WRAP_RE = /[A-Za-z]-\s+[a-z]/;
	const OFFTOPIC_RE = /\b(t20|odi|test match|ipl|world cup|olympics?|fifa|box office|bollywood|tollywood|celebrity)\b/i;
	const dropped = [];
	const kept = items.filter((it) => it && typeof it.title === "string" && it.title.trim().length).filter((it) => {
		const t = String(it.title).trim();
		if (t.length < 12) {
			dropped.push(`too-short:${t}`);
			return false;
		}
		if (t.length > 260) {
			dropped.push(`too-long:${t.slice(0, 40)}`);
			return false;
		}
		if (JUNK_RE.test(t)) {
			dropped.push(`junk:${t}`);
			return false;
		}
		if (JUNK_RE.test(String(it.summary || ""))) {
			dropped.push(`junk-summary:${t}`);
			return false;
		}
		if (WRAP_RE.test(t)) {
			dropped.push(`wrap:${t}`);
			return false;
		}
		if (OFFTOPIC_RE.test(t)) {
			dropped.push(`offtopic:${t}`);
			return false;
		}
		if (/[,;:]\s*$/.test(t)) {
			dropped.push(`trailing-punct:${t}`);
			return false;
		}
		if (/^(and|but|or|is|are|was|were|has|had|have|been|which|that|whom|whose)\b/i.test(t)) {
			dropped.push(`connector:${t}`);
			return false;
		}
		return true;
	}).map((it) => ({
		gs_paper: [
			"GS1",
			"GS2",
			"GS3",
			"GS4",
			"General"
		].includes(it.gs_paper) ? it.gs_paper : "General",
		subject: it.subject ? String(it.subject).slice(0, 80) : null,
		title: String(it.title).trim().slice(0, 240),
		summary: String(it.summary || "").slice(0, 900),
		importance: Math.max(1, Math.min(5, Number(it.importance) || 3))
	}));
	if (dropped.length) console.log(`[news-extract] dropped ${dropped.length} items:`, dropped.slice(0, 10));
	console.log(`[news-extract] kept ${kept.length} items`);
	return kept;
}
var extractPendingInboxNews_createServerFn_handler = createServerRpc({
	id: "780c381b0295751e044f1e27ba8e623c98e83e710d286f2bff532fe9b58c29af",
	name: "extractPendingInboxNews",
	filename: "src/lib/news-items.functions.ts"
}, (opts) => extractPendingInboxNews.__executeServer(opts));
var extractPendingInboxNews = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(extractPendingInboxNews_createServerFn_handler, async () => {
	const supabase = getAdmin();
	const { data: rows, error } = await supabase.from("telegram_inbox").select("id, drive_file_id, posted_at").eq("kind", "pdf").eq("status", "ready").is("analysed_at", null).not("drive_file_id", "is", null).order("posted_at", { ascending: false }).limit(8);
	if (error) throw new Error(error.message);
	const candidates = rows ?? [];
	if (candidates.length === 0) return {
		processed: 0,
		remaining: 0
	};
	const { downloadDriveFile } = await import("./gdrive.server-Cyjwc2Ll.mjs");
	let skipped = 0;
	for (const inbox of candidates) try {
		const { buffer } = await downloadDriveFile(inbox.drive_file_id);
		const items = await geminiExtractStructured(buffer);
		if (items.length) {
			const rowsToInsert = items.map((it) => ({
				inbox_id: inbox.id,
				gs_paper: it.gs_paper,
				subject: it.subject,
				title: it.title,
				summary: it.summary,
				importance: it.importance,
				posted_at: inbox.posted_at
			}));
			const { error: insErr } = await supabase.from("telegram_news_items").insert(rowsToInsert);
			if (insErr) throw new Error(insErr.message);
		}
		await supabase.from("telegram_inbox").update({ analysed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", inbox.id);
		const { count } = await supabase.from("telegram_inbox").select("id", {
			count: "exact",
			head: true
		}).eq("kind", "pdf").eq("status", "ready").is("analysed_at", null);
		return {
			processed: 1,
			extracted: items.length,
			remaining: count ?? 0,
			skipped
		};
	} catch (e) {
		const msg = e.message ?? "";
		const inaccessible = msg.includes("no longer accessible") || msg.includes("drive.file") || msg.includes("File not found") || msg.includes("404");
		await supabase.from("telegram_inbox").update({
			analysed_at: (/* @__PURE__ */ new Date()).toISOString(),
			error_message: msg.slice(0, 300) || "extract failed"
		}).eq("id", inbox.id);
		if (inaccessible) {
			skipped++;
			continue;
		}
		throw e;
	}
	const { count } = await supabase.from("telegram_inbox").select("id", {
		count: "exact",
		head: true
	}).eq("kind", "pdf").eq("status", "ready").is("analysed_at", null);
	return {
		processed: 0,
		extracted: 0,
		remaining: count ?? 0,
		skipped
	};
});
//#endregion
export { countPendingInbox_createServerFn_handler, diagnoseInbox_createServerFn_handler, extractPendingInboxNews_createServerFn_handler, hardResetNewsAnalysis_createServerFn_handler, listArchiveDates_createServerFn_handler, listNewsItems_createServerFn_handler, resetFailedInbox_createServerFn_handler, searchNewsArchive_createServerFn_handler };
