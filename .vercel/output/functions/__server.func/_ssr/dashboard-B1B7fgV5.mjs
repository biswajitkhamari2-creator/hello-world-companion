import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { $ as Image, A as Quote, Dt as ChevronDown, It as Bookmark, J as LayoutDashboard, K as Link$1, L as Newspaper, O as RefreshCw, Ot as Check, Pt as Brain, Q as Inbox, Rt as BookOpen, S as Settings2, W as LoaderCircle, X as Landmark, Z as Info, ct as Flame, d as Trash2, dt as FileCheckCorner, et as ImagePlus, ft as Eye, h as Star, lt as FileText, mt as Download, n as X, nt as Hash, ot as Gavel, p as Tag, pt as ExternalLink, r as WandSparkles, s as Upload, st as FolderSync, tt as History, u as TriangleAlert, vt as ClipboardCheck, wt as ChevronUp, xt as CircleCheck, y as Sparkles, yt as CircleX } from "../_libs/lucide-react.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as supabase } from "./client-44RWK3KY.mjs";
import { t as Label } from "./label-B1jF9p8Y.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$2, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { a as getWatermarkSettings, c as setWatermarkSettings, i as getUserLogoDataUrl, o as normaliseLogoToPng, s as setUserLogoDataUrl, t as DEFAULT_SETTINGS } from "./user-logo-0B89f-km.mjs";
import { a as generateOutput, c as processChunk, i as finalizeGeneration, n as OUTPUT_TYPES, o as listGenerations, r as deleteGeneration, s as planGeneration, t as OUTPUT_LABELS } from "./generations.functions-BY61jt9l.mjs";
import { a as finalizeUpload, c as syncFromDrive, i as extractDocument, l as uploadDocument, n as createUploadSession, r as deleteDocument, s as listDocuments, t as completeUploadFinalChunk } from "./documents.functions-RRwEEipk.mjs";
import { t as uploadFileResumable } from "./drive-upload-rPjjWF8E.mjs";
import { t as Progress } from "./progress-Rwu-UcSt.mjs";
import { t as Slider } from "./slider-DJrOTwgp.mjs";
import { a as listInbox, i as importInboxItem } from "./telegram-inbox.functions-Z2cjJrpK.mjs";
import { a as degrees, i as rgb, n as PDFDocument, r as StandardFonts } from "../_libs/pdf-lib.mjs";
import { t as fontkit } from "../_libs/pako+pdf-lib__fontkit.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-B1B7fgV5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var runFinalCheck = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ documentId: stringType().uuid() }).parse(d)).handler(createSsrRpc("8e0ab9589ee0a7502584f7c321343cba5cb52c4bf63c618a95075f1c3cf838b3"));
var QUESTION_TYPE_LABEL_TO_OUTPUT = {
	"Prelims MCQs": "prelims_mcqs",
	"Mains Questions": "mains_questions"
};
var ASSET_LABEL_TO_OUTPUT = {
	"Handwritten Notes": "handwritten_notes",
	"Short Notes": "short_notes"
};
var PAGE$1 = {
	width: 595.28,
	height: 841.89,
	margin: 48
};
function sanitize(s) {
	return (s || "").replace(/\r/g, "").replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, "\"").replace(/[\u2013\u2014\u2015]/g, "-").replace(/[\u2022\u25CF\u25E6\u2043]/g, "-").replace(/\u2026/g, "...").replace(/[\u2192\u27A1]/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->").replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u00D7/g, "x").replace(/[\u00A0\u2009\u200A\u202F]/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}
function splitLong(word, font, size, maxW) {
	const out = [];
	let cur = "";
	for (const ch of word) {
		const next = cur + ch;
		if (font.widthOfTextAtSize(next, size) > maxW && cur) {
			out.push(cur);
			cur = ch;
		} else cur = next;
	}
	if (cur) out.push(cur);
	return out;
}
function wrap(text, font, size, maxW) {
	const out = [];
	for (const para of sanitize(text).split("\n")) {
		const words = para.split(/\s+/);
		let line = "";
		for (const w of words) {
			if (!w) continue;
			if (font.widthOfTextAtSize(w, size) > maxW) {
				if (line) {
					out.push(line);
					line = "";
				}
				const chunks = splitLong(w, font, size, maxW);
				for (let i = 0; i < chunks.length - 1; i++) out.push(chunks[i]);
				line = chunks[chunks.length - 1] ?? "";
				continue;
			}
			const next = line ? `${line} ${w}` : w;
			if (font.widthOfTextAtSize(next, size) > maxW && line) {
				out.push(line);
				line = w;
			} else line = next;
		}
		if (line) out.push(line);
	}
	return out;
}
async function downloadFinalCheckerPdf(report) {
	const wmCtx = "final-checker-pdf";
	const startedAt = Date.now();
	console.info(`[watermark:${wmCtx}] export starting`, { documentTitle: report.document_title });
	const pdf = await PDFDocument.create();
	const { loadWatermarkImage, drawWatermarkOnPage } = await import("./pdf-watermark-Dyl5UKws.mjs");
	let watermark;
	try {
		watermark = await loadWatermarkImage(pdf);
		console.info(`[watermark:${wmCtx}] logo loaded & embedded`);
	} catch (err) {
		const msg = err?.message || "Watermark logo missing.";
		console.error(`[watermark:${wmCtx}] watermark unavailable — aborting export`, { error: msg });
		toast.error("SIDHESWAR watermark missing", { description: `${msg} Final Checker PDF export aborted.` });
		throw err;
	}
	const regular = await pdf.embedFont(StandardFonts.Helvetica);
	const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
	let page = pdf.addPage([PAGE$1.width, PAGE$1.height]);
	drawWatermarkOnPage(page, watermark);
	let y = PAGE$1.height - PAGE$1.margin;
	const maxW = PAGE$1.width - PAGE$1.margin * 2;
	const indigo = rgb(.1, .12, .26);
	const gold = rgb(.68, .47, .18);
	const ink = rgb(.15, .16, .22);
	const muted = rgb(.4, .42, .5);
	function newPage() {
		page = pdf.addPage([PAGE$1.width, PAGE$1.height]);
		drawWatermarkOnPage(page, watermark);
		y = PAGE$1.height - PAGE$1.margin;
	}
	function ensure(h) {
		if (y - h < PAGE$1.margin) newPage();
	}
	function draw(text, opts = {}) {
		const font = opts.font ?? regular;
		const size = opts.size ?? 10;
		const color = opts.color ?? ink;
		for (const line of wrap(text, font, size, maxW)) {
			ensure(size + 2);
			page.drawText(line, {
				x: PAGE$1.margin,
				y: y - size,
				size,
				font,
				color
			});
			y -= size + 3;
		}
		y -= opts.gap ?? 4;
	}
	draw("UPSC Mitra — Final Checker Report", {
		font: bold,
		size: 18,
		color: indigo,
		gap: 6
	});
	draw(`Document: ${report.document_title}`, {
		font: bold,
		size: 11,
		gap: 2
	});
	draw(`Detected type: ${report.document_type} (${report.mode === "source_coverage" ? "Source-coverage mode" : "Syllabus mode"})`, {
		size: 10,
		gap: 2
	});
	if (report.document_type_reason) draw(report.document_type_reason, {
		size: 9,
		color: muted,
		gap: 2
	});
	draw(`Generated: ${new Date(report.generated_at).toLocaleString()}`, {
		size: 9,
		color: muted,
		gap: 10
	});
	draw(`Overall Completeness: ${report.overall_score}%`, {
		font: bold,
		size: 14,
		color: gold,
		gap: 6
	});
	for (const [k, v] of Object.entries(report.scores)) draw(`- ${k.replace(/_/g, " ")}: ${v}%`, { size: 10 });
	y -= 6;
	if (report.mode === "source_coverage") {
		draw("Chapter-by-Chapter Coverage", {
			font: bold,
			size: 13,
			color: indigo,
			gap: 4
		});
		if (report.chapters.length === 0) draw("(no chapters detected — generate notes first)", {
			size: 10,
			color: muted
		});
		for (const c of report.chapters) {
			draw(`${c.status === "covered" ? "[X]" : c.status === "partial" ? "[~]" : "[ ]"} ${c.chapter} — ${c.coverage_pct}%`, {
				font: bold,
				size: 11,
				gap: 2
			});
			for (const s of c.subtopics) draw(`  ${s.status === "covered" ? "[X]" : s.status === "partial" ? "[~]" : "[ ]"} ${s.topic}${s.note ? ` — ${s.note}` : ""}`, { size: 9 });
			if (c.missing_items.length) {
				draw("  Missing items:", {
					font: bold,
					size: 9,
					color: gold
				});
				for (const m of c.missing_items) draw(`    • [${m.kind}] ${m.text}`, { size: 9 });
			}
			y -= 4;
		}
		draw("Content Integrity", {
			font: bold,
			size: 13,
			color: indigo,
			gap: 4
		});
		draw(`Sequence preserved: ${report.integrity.sequence_preserved ? "yes" : "no"}`, { size: 10 });
		draw(`Pages skipped: ${report.integrity.pages_skipped.length ? report.integrity.pages_skipped.join(", ") : "none"}`, { size: 10 });
		if (report.integrity.notes) draw(report.integrity.notes, {
			size: 9,
			color: muted
		});
		y -= 6;
	} else if (report.syllabus) {
		draw("UPSC Syllabus Coverage", {
			font: bold,
			size: 13,
			color: indigo,
			gap: 4
		});
		for (const s of report.syllabus) {
			draw(`${s.label} — ${s.coverage_pct}%`, {
				font: bold,
				size: 11,
				gap: 2
			});
			for (const m of s.micro_topics) draw(`  ${m.status === "covered" ? "[X]" : m.status === "partial" ? "[~]" : "[ ]"} ${m.topic}${m.note ? ` — ${m.note}` : ""}`, { size: 9 });
			y -= 4;
		}
		if (report.pyq) {
			draw("PYQ Coverage", {
				font: bold,
				size: 13,
				color: indigo,
				gap: 4
			});
			if (report.pyq.note) draw(report.pyq.note, { size: 10 });
			if (report.pyq.covered_themes.length) draw("Covered themes: " + report.pyq.covered_themes.join(", "), { size: 10 });
			if (report.pyq.frequently_tested.length) draw("Frequently tested: " + report.pyq.frequently_tested.join(", "), { size: 10 });
			if (report.pyq.gaps.length) draw("Gaps: " + report.pyq.gaps.join(", "), { size: 10 });
			y -= 6;
		}
	}
	draw("Question Bank Status", {
		font: bold,
		size: 13,
		color: indigo,
		gap: 4
	});
	for (const q of report.question_types) draw(`${q.present ? "[X]" : "[ ]"} ${q.type}${q.note ? ` — ${q.note}` : ""}`, { size: 10 });
	y -= 6;
	draw("Revision Material Status", {
		font: bold,
		size: 13,
		color: indigo,
		gap: 4
	});
	for (const r of report.revision_assets) draw(`${r.present ? "[X]" : "[ ]"} ${r.asset}${r.note ? ` — ${r.note}` : ""}`, { size: 10 });
	y -= 6;
	if (report.weak_areas.length) {
		draw("Weak Areas", {
			font: bold,
			size: 13,
			color: indigo,
			gap: 4
		});
		for (const w of report.weak_areas) draw("- " + w, { size: 10 });
		y -= 6;
	}
	if (report.recommendations.length) {
		draw("Recommendations", {
			font: bold,
			size: 13,
			color: indigo,
			gap: 4
		});
		for (const r of report.recommendations) draw("- " + r, { size: 10 });
	}
	draw(report.mode === "source_coverage" ? "\nNote: Source-coverage mode evaluates only what appears in your uploaded material. Unrelated UPSC areas are intentionally not flagged." : "\nNote: Syllabus mode audits against the official UPSC taxonomy because this document was detected as full-syllabus material.", {
		size: 8,
		color: muted
	});
	const bytes = await pdf.save();
	const pageCount = pdf.getPages().length;
	console.info(`[watermark:${wmCtx}] export complete`, {
		documentTitle: report.document_title,
		pageCount,
		durationMs: Date.now() - startedAt
	});
	const { getWatermarkSettings, getUserLogoDataUrl } = await import("./user-logo-0B89f-km.mjs").then((n) => n.u).then((n) => n.u);
	const usingUser = getWatermarkSettings().enabled && !!getUserLogoDataUrl();
	toast.success(usingUser ? "Your logo stamped" : "SIDHESWAR watermark applied", { description: `Logo ✓ applied to all ${pageCount} page${pageCount === 1 ? "" : "s"} (Final Checker report).` });
	const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
	const filename = `final-checker-${report.document_title.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60)}.pdf`;
	const { saveAndDownload } = await import("./downloads-store-CplUgcTw.mjs");
	await saveAndDownload(blob, filename, {
		kind: "report",
		source: "final-checker",
		meta: { documentTitle: report.document_title }
	});
}
var STATUS_COLOR = {
	covered: "bg-emerald-100 text-emerald-900 border-emerald-200",
	partial: "bg-amber-100 text-amber-900 border-amber-200",
	missing: "bg-rose-100 text-rose-900 border-rose-200"
};
var STATUS_ICON = {
	covered: "✅",
	partial: "🟡",
	missing: "🔴"
};
function FinalChecker({ documentId, documentTitle }) {
	const run = useServerFn(runFinalCheck);
	const gen = useServerFn(generateOutput);
	const qc = useQueryClient();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [fixing, setFixing] = (0, import_react.useState)(false);
	const [regenChapter, setRegenChapter] = (0, import_react.useState)(null);
	const [report, setReport] = (0, import_react.useState)(null);
	async function runAudit() {
		setLoading(true);
		try {
			const r = await run({ data: { documentId } });
			setReport(r);
			toast.success(`Audit complete — ${r.overall_score}% (${r.document_type})`);
		} catch (e) {
			toast.error(e?.message || "Final Checker failed");
		} finally {
			setLoading(false);
		}
	}
	async function fixMissing() {
		if (!report) return;
		const toGenerate = new Set(report.missing_output_types);
		for (const q of report.question_types) if (!q.present && QUESTION_TYPE_LABEL_TO_OUTPUT[q.type]) toGenerate.add(QUESTION_TYPE_LABEL_TO_OUTPUT[q.type]);
		for (const a of report.revision_assets) if (!a.present && ASSET_LABEL_TO_OUTPUT[a.asset]) toGenerate.add(ASSET_LABEL_TO_OUTPUT[a.asset]);
		if (report.mode === "source_coverage" && report.chapters.some((c) => c.status !== "covered" || c.missing_items.length)) toGenerate.add("handwritten_notes");
		if (toGenerate.size === 0) {
			toast.info("Nothing missing — every output already covers the source.");
			return;
		}
		setFixing(true);
		try {
			for (const t of toGenerate) {
				toast.message(`Generating ${OUTPUT_LABELS[t].label}…`);
				try {
					await gen({ data: {
						documentId,
						outputType: t
					} });
				} catch (e) {
					toast.error(`${OUTPUT_LABELS[t].label}: ${e?.message || "failed"}`);
				}
			}
			qc.invalidateQueries({ queryKey: ["documents"] });
			toast.success("Missing content regenerated — re-running audit");
			await runAudit();
		} finally {
			setFixing(false);
		}
	}
	async function regenerateForChapter(chapter) {
		setRegenChapter(chapter);
		try {
			toast.message(`Regenerating handwritten notes (focus: ${chapter})…`);
			await gen({ data: {
				documentId,
				outputType: "handwritten_notes"
			} });
			qc.invalidateQueries({ queryKey: ["documents"] });
			toast.success("Regenerated — re-running audit");
			await runAudit();
		} catch (e) {
			toast.error(e?.message || "Regeneration failed");
		} finally {
			setRegenChapter(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-lg border border-accent/40 bg-accent/5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-serif text-base font-semibold",
							children: "Final Checker"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Context-aware coverage audit"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "default",
						onClick: runAudit,
						disabled: loading,
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "mr-2 h-3.5 w-3.5" }), report ? "Re-run Final Checker" : "Final Checker"]
					}), report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => downloadFinalCheckerPdf(report),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-3.5 w-3.5" }), " Report PDF"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: fixMissing,
						disabled: fixing,
						children: [fixing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 h-3.5 w-3.5" }), "Fix Missing Content"]
					})] })]
				})]
			}),
			!report && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"First detects the document type, then verifies every concept from ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: documentTitle
					}),
					" has been converted into the generated notes. Magazines, reports and single books are checked source-to-notes only — never against the entire UPSC syllabus."
				]
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocTypeBanner, { report }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreDashboard, { report }),
					report.mode === "source_coverage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChaptersSection, {
						chapters: report.chapters,
						onRegenerate: regenerateForChapter,
						regenChapter
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegritySection, { report })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyllabusSection, { report }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistGrid, {
						title: "Question Bank",
						items: report.question_types.map((q) => ({
							label: q.type,
							present: q.present,
							note: q.note
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistGrid, {
						title: "Revision Material",
						items: report.revision_assets.map((r) => ({
							label: r.asset,
							present: r.present,
							note: r.note
						}))
					}),
					report.weak_areas.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, {
						title: "Weak Areas",
						items: report.weak_areas,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 text-amber-600" })
					}),
					report.recommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, {
						title: "Recommendations",
						items: report.recommendations,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-600" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] leading-5 text-muted-foreground",
						children: report.mode === "source_coverage" ? "Source-coverage mode: only items present in your uploaded material are evaluated. Unrelated UPSC areas are intentionally not flagged." : "Syllabus mode: this document was detected as full-syllabus material, so it was audited against the official UPSC taxonomy."
					})
				]
			})
		]
	});
}
function DocTypeBanner({ report }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-paper px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: "Detected type:"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					children: report.document_type
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: report.mode === "source_coverage" ? "Source-coverage mode" : "Syllabus mode"
				})
			]
		}), report.document_type_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: report.document_type_reason
		})]
	});
}
function ScoreDashboard({ report }) {
	const items = Object.entries(report.scores).map(([k, v]) => [k.replace(/_/g, " "), v]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-paper p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
				className: "font-serif text-lg font-semibold",
				children: report.mode === "source_coverage" ? "Source-to-Notes Completeness" : "Quality Score"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-serif text-3xl font-bold text-primary",
				children: [report.overall_score, "%"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-3 sm:grid-cols-2",
			children: items.map(([label, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "capitalize text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium",
					children: [val, "%"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: val,
				className: "mt-1 h-1.5"
			})] }, label))
		})]
	});
}
function ChaptersSection({ chapters, onRegenerate, regenChapter }) {
	if (chapters.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-md border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground",
		children: "No chapters/sections detected yet. Generate handwritten notes first, then re-run the checker."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "font-serif text-lg font-semibold",
			children: "Chapter-by-Chapter Coverage"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "✅ Fully covered · 🟡 Partially covered · 🔴 Not covered"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-3",
			children: chapters.map((c, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-background p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base",
									children: STATUS_ICON[c.status] || "🔴"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h6", {
									className: "font-serif font-semibold",
									children: c.chapter
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: [c.coverage_pct, "% covered"]
								})
							]
						}), c.status !== "covered" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							disabled: regenChapter === c.chapter,
							onClick: () => onRegenerate(c.chapter),
							children: [regenChapter === c.chapter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1.5 h-3.5 w-3.5" }), "Regenerate missing parts"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: c.coverage_pct,
						className: "mt-2 h-1.5"
					}),
					c.subtopics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: c.subtopics.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: s.note || s.status,
							className: `rounded border px-2 py-0.5 text-[11px] ${STATUS_COLOR[s.status]}`,
							children: s.topic
						}, i))
					}),
					c.missing_items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold text-rose-700",
							children: "Missing from generated notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-0.5 text-xs",
							children: c.missing_items.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 inline-block rounded bg-rose-100 px-1.5 text-[10px] uppercase text-rose-800",
									children: m.kind
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.text })]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetRow, { assets: c.preserved_assets })
				]
			}, `${c.chapter}-${idx}`))
		})
	] });
}
function AssetRow({ assets }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 flex flex-wrap gap-1.5 text-[11px]",
		children: [
			["Tables", assets.tables],
			["Diagrams", assets.diagrams],
			["Maps", assets.maps],
			["Case studies", assets.case_studies],
			["Examples", assets.examples],
			["Keywords", assets.keywords]
		].map(([label, ok]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: `rounded border px-2 py-0.5 ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`,
			children: [
				ok ? "✓" : "✗",
				" ",
				label
			]
		}, label))
	});
}
function IntegritySection({ report }) {
	const { integrity } = report;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-background p-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "font-serif text-lg font-semibold",
			children: "Content Integrity"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-2 space-y-1 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [integrity.sequence_preserved ? "✅" : "🔴", " Original sequence preserved"] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: integrity.pages_skipped.length === 0 ? "✅ No pages skipped" : `🔴 Pages skipped: ${integrity.pages_skipped.join(", ")}` }),
				integrity.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-xs text-muted-foreground",
					children: integrity.notes
				})
			]
		})]
	});
}
function SyllabusSection({ report }) {
	if (!report.syllabus) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "font-serif text-lg font-semibold",
			children: "UPSC Syllabus Coverage"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "This document was detected as full-syllabus material."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-3",
			children: report.syllabus.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-background p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h6", {
							className: "font-serif font-semibold",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [s.coverage_pct, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: s.coverage_pct,
						className: "mt-2 h-1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1.5",
						children: s.micro_topics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: m.note || m.status,
							className: `rounded border px-2 py-0.5 text-[11px] ${STATUS_COLOR[m.status]}`,
							children: m.topic
						}, m.topic))
					})
				]
			}, s.key))
		})
	] });
}
function ChecklistGrid({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
		className: "font-serif text-lg font-semibold",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 grid gap-1.5 sm:grid-cols-2",
		children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm",
			children: [i.present ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-4 w-4 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mt-0.5 h-4 w-4 text-rose-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium",
				children: i.label
			}), i.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: i.note
			})] })]
		}, i.label))
	})] });
}
function Bullet({ title, items, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
		className: "font-serif text-lg font-semibold",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1 text-sm",
		children: items.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-start gap-2",
			children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t })]
		}, i))
	})] });
}
var Select$1 = Select$2;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var PAGE = {
	width: 595.28,
	height: 841.89,
	margin: 48
};
var COLORS = {
	ink: rgb(.11, .12, .22),
	muted: rgb(.35, .38, .48),
	indigo: rgb(.1, .12, .26),
	gold: rgb(.68, .47, .18),
	line: rgb(.83, .78, .68),
	paper: rgb(1, .99, .96),
	softGold: rgb(.96, .9, .76)
};
function asArray(value) {
	return Array.isArray(value) ? value : [];
}
function text(value, fallback = "") {
	if (typeof value === "string") return normalizePdfText(value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function normalizePdfText(value) {
	return value.replace(/\r/g, "").replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, "\"").replace(/[\u2013\u2014\u2015]/g, "-").replace(/[\u2022\u25CF\u25E6\u2043]/g, "-").replace(/\u2026/g, "...").replace(/[\u2192\u27A1]/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->").replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u00D7/g, "x").replace(/[\u00A0\u2009\u200A\u202F]/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}
function splitLongWord(word, maxWidth, font, size) {
	const parts = [];
	let current = "";
	for (const char of word) {
		const next = `${current}${char}`;
		if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
			parts.push(current);
			current = char;
		} else current = next;
	}
	if (current) parts.push(current);
	return parts;
}
function wrapLine(line, maxWidth, font, size) {
	const words = line.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";
	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
			current = candidate;
			continue;
		}
		if (current) lines.push(current);
		if (font.widthOfTextAtSize(word, size) > maxWidth) {
			const chunks = splitLongWord(word, maxWidth, font, size);
			lines.push(...chunks.slice(0, -1));
			current = chunks.at(-1) ?? "";
		} else current = word;
	}
	if (current) lines.push(current);
	return lines.length ? lines : [""];
}
function wrapText(input, maxWidth, font, size) {
	return input.replace(/\r/g, "").split("\n").flatMap((line) => wrapLine(line.trim(), maxWidth, font, size));
}
function addPage(state) {
	state.page = state.pdf.addPage([PAGE.width, PAGE.height]);
	state.page.drawRectangle({
		x: 0,
		y: 0,
		width: PAGE.width,
		height: PAGE.height,
		color: COLORS.paper
	});
	state.drawWatermark(state.page, state.watermark);
	state.page.drawText("UPSC Mitra", {
		x: PAGE.margin,
		y: PAGE.height - 28,
		size: 9,
		font: state.fonts.bold,
		color: COLORS.gold
	});
	state.page.drawLine({
		start: {
			x: PAGE.margin,
			y: PAGE.height - 38
		},
		end: {
			x: PAGE.width - PAGE.margin,
			y: PAGE.height - 38
		},
		thickness: .7,
		color: COLORS.line
	});
	state.y = PAGE.height - PAGE.margin - 20;
}
function ensureSpace(state, needed = 48) {
	if (state.y < PAGE.margin + needed) addPage(state);
}
function drawParagraph(state, value, options = {}) {
	const size = options.size ?? 11;
	const font = options.font ?? state.fonts.regular;
	const gap = options.gap ?? 5;
	const indent = options.indent ?? 0;
	const lines = wrapText(value, PAGE.width - PAGE.margin * 2 - indent, font, size);
	for (const line of lines) {
		ensureSpace(state, size + 8);
		state.page.drawText(line, {
			x: PAGE.margin + indent,
			y: state.y,
			size,
			font,
			color: options.color ?? COLORS.ink
		});
		state.y -= size + gap;
	}
}
function drawHeading(state, value, level = 2) {
	const size = level === 1 ? 21 : level === 2 ? 15 : 12;
	ensureSpace(state, size + 22);
	if (level !== 1) state.y -= 4;
	drawParagraph(state, value, {
		size,
		font: state.fonts.bold,
		color: level === 1 ? COLORS.indigo : COLORS.gold,
		gap: 7
	});
	if (level === 1) {
		state.page.drawLine({
			start: {
				x: PAGE.margin,
				y: state.y + 2
			},
			end: {
				x: PAGE.width - PAGE.margin,
				y: state.y + 2
			},
			thickness: 1,
			color: COLORS.line
		});
		state.y -= 12;
	}
}
function drawList(state, items, prefix = "•") {
	for (const item of items) {
		const value = text(item);
		if (!value) continue;
		drawParagraph(state, `${prefix} ${value}`, {
			size: 10.5,
			indent: 12
		});
	}
}
function drawKeyValue(state, label, value) {
	const clean = text(value);
	if (!clean) return;
	drawParagraph(state, `${label}: ${clean}`, {
		size: 10.5,
		font: state.fonts.bold,
		color: COLORS.indigo
	});
}
function drawShortNotes(state, content) {
	drawKeyValue(state, "Definition", content.definition);
	drawHeading(state, "Key Facts", 2);
	drawList(state, asArray(content.key_facts));
	drawHeading(state, "PYQ Relevance", 2);
	drawParagraph(state, text(content.pyq_relevance));
	drawHeading(state, "UPSC Relevance", 2);
	drawParagraph(state, text(content.upsc_relevance));
	if (asArray(content.keywords).length) drawKeyValue(state, "Keywords", asArray(content.keywords).map((item) => text(item)).join(", "));
	if (asArray(content.examples).length) {
		drawHeading(state, "Examples", 2);
		drawList(state, asArray(content.examples));
	}
	if (asArray(content.revision_tips).length) {
		drawHeading(state, "Revision Tips", 2);
		drawList(state, asArray(content.revision_tips));
	}
}
function drawPrelimsMcqs(state, content) {
	asArray(content.questions).forEach((question, index) => {
		const record = question;
		drawHeading(state, `Q${index + 1}. ${text(record.stem, "Question")}`, 2);
		asArray(record.options).forEach((option, optionIndex) => {
			drawParagraph(state, `${String.fromCharCode(65 + optionIndex)}. ${text(option)}`, {
				size: 10.5,
				indent: 14
			});
		});
		drawKeyValue(state, "Answer", String.fromCharCode(65 + Number(record.answer_index ?? 0)));
		drawKeyValue(state, "Difficulty", text(record.difficulty, "medium"));
		drawParagraph(state, `Explanation: ${text(record.explanation)}`, {
			size: 10.5,
			color: COLORS.muted
		});
	});
}
function drawMainsQuestions(state, content) {
	asArray(content.questions).forEach((question, index) => {
		const record = question;
		drawHeading(state, `Q${index + 1}. ${text(record.question, "Discuss this topic.")}`, 2);
		drawKeyValue(state, "Paper", record.gs_paper);
		drawKeyValue(state, "Marks", record.marks);
		drawKeyValue(state, "Word Limit", record.word_limit);
		drawHeading(state, "Intro", 3);
		drawList(state, asArray(record.intro_points));
		drawHeading(state, "Body", 3);
		drawList(state, asArray(record.body_points));
		drawHeading(state, "Conclusion", 3);
		drawList(state, asArray(record.conclusion_points));
		if (asArray(record.keywords).length) drawKeyValue(state, "Keywords", asArray(record.keywords).map((item) => text(item)).join(", "));
		if (asArray(record.value_add).length) {
			drawHeading(state, "Value Add", 3);
			drawList(state, asArray(record.value_add));
		}
	});
}
function safeFileName(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "upsc-notes";
}
var NB = {
	width: 595.28,
	height: 841.89,
	marginLeft: 82,
	marginRight: 44,
	marginTop: 78,
	marginBottom: 60,
	lineHeight: 28,
	baseFont: 15,
	headingFont: 22,
	redMarginX: 68
};
var INK = {
	blueInk: rgb(.1, .18, .55),
	blackInk: rgb(.08, .09, .16),
	redInk: rgb(.78, .13, .18),
	greenInk: rgb(.06, .42, .24),
	pencil: rgb(.4, .42, .5),
	rule: rgb(.72, .82, .93),
	redMargin: rgb(.88, .45, .5),
	paper: rgb(.998, .995, .978),
	highlightYellow: rgb(1, .93, .45),
	highlightPink: rgb(1, .78, .85),
	highlightGreen: rgb(.8, .95, .72),
	stickyYellow: rgb(1, .94, .58),
	stickyPink: rgb(1, .84, .86),
	stickyBlue: rgb(.78, .9, 1),
	stickyBorder: rgb(.78, .7, .3)
};
async function fetchFontBytes(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to load font: ${url}`);
	return new Uint8Array(await res.arrayBuffer());
}
async function loadNotebookFonts(pdf) {
	pdf.registerFontkit(fontkit);
	const [handBytes, boldBytes, scriptBytes] = await Promise.all([
		fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/patrickhand/PatrickHand-Regular.ttf"),
		fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Bold.ttf"),
		fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Regular.ttf")
	]);
	return {
		hand: await pdf.embedFont(handBytes, { subset: true }),
		handBold: await pdf.embedFont(boldBytes, { subset: true }),
		script: await pdf.embedFont(scriptBytes, { subset: true })
	};
}
function jitter(amp) {
	return (Math.random() - .5) * 2 * amp;
}
function drawRuledPage(state) {
	const p = state.page;
	p.drawRectangle({
		x: 0,
		y: 0,
		width: NB.width,
		height: NB.height,
		color: INK.paper
	});
	state.drawWatermark(p, state.watermark);
	for (let i = 0; i < 14; i++) p.drawRectangle({
		x: Math.random() * NB.width,
		y: Math.random() * NB.height,
		width: .6,
		height: .6,
		color: rgb(.93, .91, .86),
		opacity: .3
	});
	let ly = NB.height - NB.marginTop;
	while (ly > NB.marginBottom) {
		p.drawLine({
			start: {
				x: NB.marginLeft - 6,
				y: ly
			},
			end: {
				x: NB.width - NB.marginRight,
				y: ly
			},
			thickness: .4,
			color: INK.rule,
			opacity: .85
		});
		ly -= NB.lineHeight;
	}
	p.drawLine({
		start: {
			x: NB.redMarginX,
			y: NB.marginBottom - 10
		},
		end: {
			x: NB.redMarginX,
			y: NB.height - 30
		},
		thickness: 1,
		color: INK.redMargin,
		opacity: .85
	});
	p.drawText("UPSC Mitra  •  Topper Notebook", {
		x: NB.marginLeft,
		y: NB.height - 42,
		size: 11,
		font: state.fonts.script,
		color: INK.pencil
	});
	p.drawText(state.documentTitle.slice(0, 70), {
		x: NB.marginLeft,
		y: NB.height - 56,
		size: 10,
		font: state.fonts.script,
		color: INK.pencil
	});
	p.drawText(`pg. ${state.pageIndex}`, {
		x: NB.width - NB.marginRight - 36,
		y: NB.height - 48,
		size: 11,
		font: state.fonts.script,
		color: INK.redInk,
		rotate: degrees(-4)
	});
	p.drawLine({
		start: {
			x: NB.width - NB.marginRight - 60,
			y: NB.marginBottom - 18
		},
		end: {
			x: NB.width - NB.marginRight,
			y: NB.marginBottom - 22
		},
		thickness: .7,
		color: INK.pencil,
		opacity: .5
	});
	state.y = NB.height - NB.marginTop;
}
function nbAddPage(state) {
	state.page = state.pdf.addPage([NB.width, NB.height]);
	state.pageIndex += 1;
	drawRuledPage(state);
}
function nbEnsureSpace(state, needed) {
	if (state.y - needed < NB.marginBottom + 10) nbAddPage(state);
}
function nbSnapToLine(state) {
	const fromTop = NB.height - NB.marginTop - state.y;
	const lines = Math.round(fromTop / NB.lineHeight);
	state.y = NB.height - NB.marginTop - lines * NB.lineHeight;
}
function nbWrap(value, maxWidth, font, size) {
	return wrapText(value.replace(/\*\*/g, "").replace(/__/g, "").replace(/==/g, ""), maxWidth, font, size);
}
function parseSpans(input) {
	const src = normalizePdfText(input);
	const spans = [];
	const re = /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==|::[^:]+::|~~[^~]+~~)/g;
	let last = 0;
	let m;
	while (m = re.exec(src)) {
		if (m.index > last) spans.push({ text: src.slice(last, m.index) });
		const tok = m[0];
		if (tok.startsWith("**")) spans.push({
			text: tok.slice(2, -2),
			bold: true
		});
		else if (tok.startsWith("__")) spans.push({
			text: tok.slice(2, -2),
			underline: true
		});
		else if (tok.startsWith("==")) spans.push({
			text: tok.slice(2, -2),
			highlight: "yellow"
		});
		else if (tok.startsWith("::")) spans.push({
			text: tok.slice(2, -2),
			highlight: "pink"
		});
		else if (tok.startsWith("~~")) spans.push({
			text: tok.slice(2, -2),
			highlight: "green"
		});
		last = m.index + tok.length;
	}
	if (last < src.length) spans.push({ text: src.slice(last) });
	return spans.length ? spans : [{ text: src }];
}
function layoutSpanLines(spans, maxWidth, font, size) {
	const tokens = [];
	for (const sp of spans) {
		const parts = sp.text.split(/(\s+)/);
		for (const part of parts) {
			if (!part) continue;
			if (!/^\s+$/.test(part) && font.widthOfTextAtSize(part, size) > maxWidth) for (const chunk of splitLongWord(part, maxWidth, font, size)) tokens.push({
				...sp,
				text: chunk
			});
			else tokens.push({
				...sp,
				text: part
			});
		}
	}
	const lines = [];
	let cur = [];
	let curWidth = 0;
	for (const t of tokens) {
		if (t.text === "\n") {
			lines.push(cur);
			cur = [];
			curWidth = 0;
			continue;
		}
		const w = font.widthOfTextAtSize(t.text, size);
		if (curWidth + w > maxWidth && cur.length) {
			lines.push(cur);
			cur = [];
			curWidth = 0;
			if (/^\s+$/.test(t.text)) continue;
		}
		cur.push(t);
		curWidth += w;
	}
	if (cur.length) lines.push(cur);
	return lines;
}
function drawSpanLine(state, spans, opts) {
	const font = state.fonts.hand;
	const boldFont = state.fonts.handBold;
	let cursorX = opts.x;
	const baseY = opts.y;
	let measureX = cursorX;
	for (const span of spans) {
		if (!span.text) continue;
		const w = (span.bold || opts.bold ? boldFont : font).widthOfTextAtSize(span.text, opts.size);
		if (span.highlight) {
			const hc = span.highlight === "pink" ? INK.highlightPink : span.highlight === "green" ? INK.highlightGreen : INK.highlightYellow;
			state.page.drawRectangle({
				x: measureX - 1,
				y: baseY - 2,
				width: w + 2,
				height: opts.size + 3,
				color: hc,
				opacity: .5
			});
		}
		measureX += w;
	}
	for (const span of spans) {
		if (!span.text) continue;
		const useFont = span.bold || opts.bold ? boldFont : font;
		const w = useFont.widthOfTextAtSize(span.text, opts.size);
		state.page.drawText(span.text, {
			x: cursorX,
			y: baseY,
			size: opts.size,
			font: useFont,
			color: span.bold ? INK.blackInk : opts.color
		});
		if (span.underline) state.page.drawLine({
			start: {
				x: cursorX,
				y: baseY - 2
			},
			end: {
				x: cursorX + w,
				y: baseY - 2
			},
			thickness: .9,
			color: INK.redInk
		});
		cursorX += w;
	}
}
function nbWriteRich(state, raw, opts = {}) {
	if (!raw || !raw.trim()) return;
	const size = opts.size ?? NB.baseFont;
	const indent = opts.indent ?? 0;
	const color = opts.color ?? INK.blueInk;
	const gap = opts.gap ?? 0;
	const maxWidth = NB.width - NB.marginRight - (NB.marginLeft + indent);
	const lines = layoutSpanLines(parseSpans(raw), maxWidth, state.fonts.hand, size);
	for (const line of lines) {
		nbEnsureSpace(state, NB.lineHeight + 4);
		nbSnapToLine(state);
		if (state.y > NB.height - NB.marginTop) state.y = NB.height - NB.marginTop;
		drawSpanLine(state, line, {
			x: NB.marginLeft + indent,
			y: state.y - size + 5,
			size,
			color,
			bold: opts.bold
		});
		state.y -= NB.lineHeight;
	}
	if (gap) state.y -= gap;
}
function nbHeading(state, value, level = 2) {
	if (!value) return;
	const size = level === 1 ? NB.headingFont : level === 2 ? 18 : 16;
	nbEnsureSpace(state, NB.lineHeight * 2);
	state.y -= 6;
	nbSnapToLine(state);
	const yLine = state.y - size + 5;
	const useFont = state.fonts.handBold;
	const heading = value.slice(0, 110);
	const width = useFont.widthOfTextAtSize(heading, size);
	if (level === 2) state.page.drawRectangle({
		x: NB.marginLeft - 2,
		y: yLine - 2,
		width: Math.min(width + 6, NB.width - NB.marginRight - NB.marginLeft),
		height: size + 2,
		color: INK.highlightYellow,
		opacity: .45
	});
	state.page.drawText(heading, {
		x: NB.marginLeft,
		y: yLine,
		size,
		font: useFont,
		color: level === 1 ? INK.redInk : level === 2 ? INK.blackInk : INK.greenInk
	});
	if (level === 1) {
		const uy = yLine - 4;
		state.page.drawLine({
			start: {
				x: NB.marginLeft,
				y: uy
			},
			end: {
				x: NB.marginLeft + width + 6,
				y: uy
			},
			thickness: 1.4,
			color: INK.redInk
		});
		state.page.drawLine({
			start: {
				x: NB.marginLeft,
				y: uy - 3
			},
			end: {
				x: NB.marginLeft + width + 6,
				y: uy - 3
			},
			thickness: .8,
			color: INK.redInk
		});
	} else if (level === 3) state.page.drawLine({
		start: {
			x: NB.marginLeft,
			y: yLine - 3
		},
		end: {
			x: NB.marginLeft + width + 4,
			y: yLine - 3
		},
		thickness: .7,
		color: INK.greenInk
	});
	state.y -= NB.lineHeight + (level === 1 ? 12 : 4);
}
function nbBullets(state, items, marker = "dot") {
	const symbol = marker === "star" ? "*" : marker === "arrow" ? ">" : "•";
	for (const it of items) {
		const value = typeof it === "string" ? it : String(it ?? "");
		if (!value.trim()) continue;
		nbEnsureSpace(state, NB.lineHeight + 4);
		nbSnapToLine(state);
		const markerY = state.y - NB.baseFont + 5;
		state.page.drawText(symbol, {
			x: NB.marginLeft + 4,
			y: markerY,
			size: NB.baseFont + 1,
			font: state.fonts.handBold,
			color: INK.redInk
		});
		const indent = 20;
		const maxWidth = NB.width - NB.marginRight - (NB.marginLeft + indent);
		layoutSpanLines(parseSpans(value), maxWidth, state.fonts.hand, NB.baseFont).forEach((line, i) => {
			if (i > 0) {
				nbEnsureSpace(state, NB.lineHeight);
				nbSnapToLine(state);
			}
			drawSpanLine(state, line, {
				x: NB.marginLeft + indent,
				y: state.y - NB.baseFont + 5,
				size: NB.baseFont,
				color: INK.blueInk
			});
			state.y -= NB.lineHeight;
		});
	}
}
function nbStickyNote(state, label, body, variant = "yellow") {
	if (!body || !body.trim()) return;
	const fill = variant === "pink" ? INK.stickyPink : variant === "blue" ? INK.stickyBlue : INK.stickyYellow;
	const innerWidth = NB.width - NB.marginRight - NB.marginLeft - 36;
	const lines = nbWrap(body, innerWidth, state.fonts.hand, 12);
	const height = Math.max(60, lines.length * 18 + 36);
	nbEnsureSpace(state, height + 14);
	nbSnapToLine(state);
	const x = NB.marginLeft + 8;
	const top = state.y + 2;
	const rotateDeg = jitter(1.8);
	state.page.drawRectangle({
		x: x + 4,
		y: top - height - 4,
		width: innerWidth + 28,
		height,
		color: rgb(.85, .82, .7),
		opacity: .5,
		rotate: degrees(rotateDeg)
	});
	state.page.drawRectangle({
		x,
		y: top - height,
		width: innerWidth + 28,
		height,
		color: fill,
		rotate: degrees(rotateDeg)
	});
	state.page.drawRectangle({
		x: x + innerWidth / 2 - 10,
		y: top - 4,
		width: 36,
		height: 12,
		color: rgb(.95, .93, .82),
		opacity: .85,
		rotate: degrees(rotateDeg + 8)
	});
	state.page.drawText(label.toUpperCase(), {
		x: x + 14,
		y: top - 22,
		size: 11,
		font: state.fonts.handBold,
		color: INK.redInk,
		rotate: degrees(rotateDeg)
	});
	let ly = top - 40;
	for (const line of lines) {
		state.page.drawText(line, {
			x: x + 14 + jitter(.4),
			y: ly + jitter(.4),
			size: 12,
			font: state.fonts.hand,
			color: INK.blackInk,
			rotate: degrees(rotateDeg)
		});
		ly -= 18;
	}
	state.y -= height + 12;
}
function nbMarginNote(state, value) {
	if (!value || !value.trim()) return;
	nbEnsureSpace(state, NB.lineHeight * 2);
	nbSnapToLine(state);
	const x = 8;
	const lines = nbWrap(value, NB.redMarginX - 12, state.fonts.hand, 9);
	const yStart = state.y - 4;
	lines.forEach((line, i) => {
		state.page.drawText(line, {
			x,
			y: yStart - i * 11,
			size: 9,
			font: state.fonts.hand,
			color: INK.pencil,
			rotate: degrees(-2 + jitter(1))
		});
	});
	state.page.drawText(">", {
		x: NB.redMarginX - 8,
		y: yStart - 1,
		size: 9,
		font: state.fonts.handBold,
		color: INK.redInk
	});
}
function nbConceptCircle(state, center, leaves) {
	if (!leaves.length) return;
	const boxW = 130;
	const boxH = 36;
	const totalH = 180;
	nbEnsureSpace(state, 190);
	const cx = (NB.marginLeft + NB.width - NB.marginRight) / 2;
	const topY = state.y - 6;
	state.page.drawEllipse({
		x: cx,
		y: topY - 30,
		xScale: boxW / 2,
		yScale: boxH / 2,
		borderColor: INK.blueInk,
		borderWidth: 1.4,
		color: INK.highlightYellow,
		opacity: .85
	});
	const centerLabel = center.slice(0, 28);
	const cw = state.fonts.handBold.widthOfTextAtSize(centerLabel, 13);
	state.page.drawText(centerLabel, {
		x: cx - cw / 2,
		y: topY - 36,
		size: 13,
		font: state.fonts.handBold,
		color: INK.blackInk
	});
	const n = Math.min(leaves.length, 5);
	for (let i = 0; i < n; i++) {
		const angle = -Math.PI / 2 + Math.PI / (n - 1 || 1) * i - Math.PI / 4;
		const lx = cx + Math.cos(angle) * 150;
		const ly = topY - 30 + Math.sin(angle) * 80;
		state.page.drawLine({
			start: {
				x: cx + Math.cos(angle) * (boxW / 2),
				y: topY - 30 + Math.sin(angle) * (boxH / 2)
			},
			end: {
				x: lx,
				y: ly
			},
			thickness: .9,
			color: INK.pencil
		});
		const label = leaves[i].slice(0, 22);
		const lw = state.fonts.hand.widthOfTextAtSize(label, 11);
		state.page.drawRectangle({
			x: lx - lw / 2 - 6,
			y: ly - 8,
			width: lw + 12,
			height: 18,
			color: INK.highlightGreen,
			opacity: .7,
			borderColor: INK.greenInk,
			borderWidth: .6
		});
		state.page.drawText(label, {
			x: lx - lw / 2,
			y: ly - 4,
			size: 11,
			font: state.fonts.hand,
			color: INK.blackInk
		});
	}
	state.y -= totalH;
}
function autoEnrichRich(text) {
	if (/[*_=~]/.test(text)) return text;
	return text.replace(/\b(Article\s+\d+[A-Z]?|Schedule\s+[IVX]+|Section\s+\d+|Section\s+\d+\([a-z0-9]+\)|\d{4}\b|Committee|Commission|Act,\s+\d{4})/g, "==$1==");
}
async function drawHandwrittenNotebook(pdf, content, documentTitle, watermark, drawWatermark) {
	const fonts = await loadNotebookFonts(pdf);
	const state = {
		pdf,
		page: pdf.addPage([NB.width, NB.height]),
		watermark,
		drawWatermark,
		fonts,
		y: NB.height - NB.marginTop,
		pageIndex: 1,
		documentTitle
	};
	drawRuledPage(state);
	const title = (content?.title || "Topper Notes").toString().slice(0, 80);
	nbSnapToLine(state);
	state.page.drawText(title, {
		x: NB.marginLeft,
		y: state.y - 26,
		size: 28,
		font: fonts.script,
		color: INK.redInk,
		rotate: degrees(-1.5)
	});
	const tw = fonts.script.widthOfTextAtSize(title, 28);
	state.page.drawLine({
		start: {
			x: NB.marginLeft,
			y: state.y - 32
		},
		end: {
			x: NB.marginLeft + tw + 8,
			y: state.y - 34
		},
		thickness: 1.4,
		color: INK.redInk
	});
	state.page.drawLine({
		start: {
			x: NB.marginLeft,
			y: state.y - 38
		},
		end: {
			x: NB.marginLeft + tw + 8,
			y: state.y - 40
		},
		thickness: .8,
		color: INK.redInk
	});
	state.y -= NB.lineHeight * 3;
	if (content?.intro) {
		nbWriteRich(state, autoEnrichRich(text(content.intro)), { color: INK.blueInk });
		state.y -= 6;
	}
	asArray(content?.sections).forEach((rawSection, sIdx) => {
		const section = rawSection;
		const heading = text(section.heading, `Topic ${sIdx + 1}`);
		nbHeading(state, heading, 2);
		const body = text(section.body);
		if (body) nbWriteRich(state, autoEnrichRich(body), { color: INK.blueInk });
		const subPoints = asArray(section.key_points || section.points);
		if (subPoints.length) nbBullets(state, subPoints.map((p) => autoEnrichRich(text(p))), "arrow");
		for (const callout of asArray(section.callouts)) {
			const c = callout;
			const kind = text(c.kind, "key").toLowerCase();
			const variant = kind.includes("warn") || kind.includes("mistake") ? "pink" : kind.includes("pyq") || kind.includes("fact") ? "blue" : "yellow";
			nbStickyNote(state, kind, text(c.text), variant);
		}
		const mnemonics = asArray(section.mnemonics);
		if (mnemonics.length) {
			nbHeading(state, "Memory Hack", 3);
			mnemonics.forEach((m) => nbWriteRich(state, `:: ${text(m)} ::`, { color: INK.greenInk }));
		}
		const valueAdd = asArray(section.value_add);
		if (valueAdd.length) {
			nbHeading(state, "Value Add", 3);
			valueAdd.forEach((v) => {
				const s = text(v);
				if (!s) return;
				if (s.length < 60) nbMarginNote(state, s);
				else nbBullets(state, [autoEnrichRich(s)], "star");
			});
		}
		if (subPoints.length >= 3 && sIdx % 2 === 0) nbConceptCircle(state, heading, subPoints.slice(0, 5).map((p) => text(p)));
	});
	if (content?.conclusion) {
		nbHeading(state, "Conclusion", 2);
		nbWriteRich(state, autoEnrichRich(text(content.conclusion)), { color: INK.blueInk });
	}
	nbEnsureSpace(state, 60);
	state.y -= 10;
	state.page.drawText("— end of notes —", {
		x: NB.marginLeft + 60,
		y: state.y - 10,
		size: 14,
		font: fonts.script,
		color: INK.pencil,
		rotate: degrees(-2)
	});
}
async function downloadGeneratedPdf(outputType, content, documentTitle) {
	const exportStartedAt = Date.now();
	const wmCtx = `pdf-export:${outputType}`;
	console.info(`[watermark:${wmCtx}] export starting`, { documentTitle });
	const pdf = await PDFDocument.create();
	const { loadWatermarkImage, drawWatermarkOnPage } = await import("./pdf-watermark-Dyl5UKws.mjs");
	let watermark;
	try {
		watermark = await loadWatermarkImage(pdf);
		console.info(`[watermark:${wmCtx}] logo loaded & embedded`);
	} catch (err) {
		const msg = err?.message || "Watermark logo missing.";
		console.error(`[watermark:${wmCtx}] watermark unavailable — aborting export`, { error: msg });
		toast.error("SIDHESWAR watermark missing", { description: `${msg} PDF export aborted (${outputType}).` });
		throw err;
	}
	if (outputType === "infographics") {
		const { drawInfographics } = await import("./infographics-pdf-kCEtP_OG.mjs");
		await drawInfographics(pdf, content, documentTitle, watermark);
	} else if (outputType === "handwritten_notes") try {
		await drawHandwrittenNotebook(pdf, content, documentTitle, watermark, drawWatermarkOnPage);
	} catch (err) {
		console.error("Notebook render failed, falling back to standard", err);
		const fonts = {
			regular: await pdf.embedFont(StandardFonts.TimesRoman),
			bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
			italic: await pdf.embedFont(StandardFonts.TimesRomanItalic)
		};
		const state = {
			pdf,
			page: pdf.addPage([PAGE.width, PAGE.height]),
			watermark,
			drawWatermark: drawWatermarkOnPage,
			fonts,
			y: PAGE.height - PAGE.margin
		};
		state.page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE.width,
			height: PAGE.height,
			color: COLORS.paper
		});
		drawWatermarkOnPage(state.page, watermark);
		drawHeading(state, text(content?.title, OUTPUT_LABELS[outputType].label), 1);
		drawParagraph(state, `Source: ${documentTitle}`, {
			size: 9.5,
			color: COLORS.muted
		});
		for (const section of asArray(content?.sections)) {
			const r = section;
			drawHeading(state, text(r.heading, "Notes"), 2);
			drawParagraph(state, text(r.body));
		}
	}
	else {
		const fonts = {
			regular: await pdf.embedFont(StandardFonts.TimesRoman),
			bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
			italic: await pdf.embedFont(StandardFonts.TimesRomanItalic)
		};
		const state = {
			pdf,
			page: pdf.addPage([PAGE.width, PAGE.height]),
			watermark,
			drawWatermark: drawWatermarkOnPage,
			fonts,
			y: PAGE.height - PAGE.margin
		};
		state.page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE.width,
			height: PAGE.height,
			color: COLORS.paper
		});
		drawWatermarkOnPage(state.page, watermark);
		drawHeading(state, text(content?.title, OUTPUT_LABELS[outputType].label), 1);
		drawParagraph(state, `Source: ${documentTitle}`, {
			size: 9.5,
			color: COLORS.muted
		});
		state.y -= 6;
		if (outputType === "short_notes") drawShortNotes(state, content);
		if (outputType === "prelims_mcqs") drawPrelimsMcqs(state, content);
		if (outputType === "mains_questions") drawMainsQuestions(state, content);
		const pages = pdf.getPages();
		pages.forEach((page, index) => {
			page.drawText(`${index + 1} / ${pages.length}`, {
				x: PAGE.width - PAGE.margin - 28,
				y: 24,
				size: 9,
				font: fonts.regular,
				color: COLORS.muted
			});
		});
	}
	const finalPageCount = pdf.getPages().length;
	console.info(`[watermark:${wmCtx}] export complete`, {
		documentTitle,
		pageCount: finalPageCount,
		durationMs: Date.now() - exportStartedAt
	});
	const { getWatermarkSettings, getUserLogoDataUrl } = await import("./user-logo-0B89f-km.mjs").then((n) => n.u).then((n) => n.u);
	const usingUser = getWatermarkSettings().enabled && !!getUserLogoDataUrl();
	toast.success(usingUser ? "Your logo stamped" : "SIDHESWAR watermark applied", { description: `Logo ✓ applied to all ${finalPageCount} page${finalPageCount === 1 ? "" : "s"} (${OUTPUT_LABELS[outputType]?.label ?? outputType}).` });
	const bytes = await pdf.save();
	const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: "application/pdf" });
	const filename = `${safeFileName(documentTitle)}-${outputType}.pdf`;
	const { saveAndDownload } = await import("./downloads-store-CplUgcTw.mjs");
	await saveAndDownload(blob, filename, {
		kind: "pdf",
		source: "pdf-export",
		meta: {
			documentTitle,
			outputType
		}
	});
}
function StampLogoButton() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				"aria-label": "Stamp your logo",
				className: "min-h-9 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-base leading-none",
					"aria-hidden": "true",
					children: "🖼️"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "Stamp Your Logo"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Stamp Your Logo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Upload your brand logo and apply it automatically to every PDF, infographic, and exported document." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampLogoEditor, { onDone: () => setOpen(false) })]
		})]
	});
}
function StampLogoEditor({ onDone }) {
	const fileRef = (0, import_react.useRef)(null);
	const [logo, setLogo] = (0, import_react.useState)(null);
	const [settings, setSettings] = (0, import_react.useState)(DEFAULT_SETTINGS);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [applyingExisting, setApplyingExisting] = (0, import_react.useState)(false);
	const listDocs = useServerFn(listDocuments);
	const listGens = useServerFn(listGenerations);
	(0, import_react.useEffect)(() => {
		setLogo(getUserLogoDataUrl());
		setSettings(getWatermarkSettings());
	}, []);
	function patch(p) {
		const next = {
			...settings,
			...p
		};
		setSettings(next);
		setWatermarkSettings(next);
	}
	async function handleFile(e) {
		const f = e.target.files?.[0];
		e.target.value = "";
		if (!f) return;
		setBusy(true);
		try {
			const pngUrl = await normaliseLogoToPng(f);
			setUserLogoDataUrl(pngUrl);
			setLogo(pngUrl);
			patch({ enabled: true });
			toast.success("Logo uploaded", { description: "Stamping enabled — applying to your existing PDFs now…" });
			applyToExisting({
				silent: false,
				logoOverride: pngUrl
			});
		} catch (err) {
			toast.error(err?.message || "Could not load logo.");
		} finally {
			setBusy(false);
		}
	}
	function clearLogo() {
		setUserLogoDataUrl(null);
		setLogo(null);
		patch({ enabled: false });
		toast("Logo removed");
	}
	async function applyToExisting(opts) {
		if (!(opts?.logoOverride ?? logo)) {
			if (!opts?.silent) toast.error("Upload a logo first.");
			return;
		}
		if (!settings.enabled) patch({ enabled: true });
		setApplyingExisting(true);
		try {
			const docs = await listDocs();
			let total = 0;
			for (const d of docs) {
				const gens = await listGens({ data: { document_id: d.id } });
				for (const g of gens) try {
					await downloadGeneratedPdf(g.output_type, g.content, d.title);
					total += 1;
					await new Promise((r) => setTimeout(r, 350));
				} catch (err) {
					console.warn("[stamp-logo] re-export failed", {
						docId: d.id,
						type: g.output_type,
						err
					});
				}
			}
			if (total === 0) toast("No existing generations to stamp — new ones will be stamped automatically.");
			else toast.success(`Re-stamped ${total} existing document${total === 1 ? "" : "s"}.`);
		} catch (err) {
			toast.error(err?.message || "Could not re-stamp existing files.");
		} finally {
			setApplyingExisting(false);
		}
	}
	const previewStyle = (0, import_react.useMemo)(() => {
		const sizePct = settings.size === "small" ? 25 : settings.size === "medium" ? 50 : 78;
		const blurPx = settings.blur === "off" ? 0 : settings.blur === "low" ? 1 : 2.5;
		return {
			maxWidth: `${sizePct}%`,
			maxHeight: `${sizePct}%`,
			opacity: settings.opacity,
			transform: `rotate(${settings.rotation}deg)`,
			filter: `blur(${blurPx}px)`
		};
	}, [settings]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border border-border bg-muted/30 p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-14 w-14 place-items-center overflow-hidden rounded-md border border-border bg-background",
									children: logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: logo,
										alt: "Your logo",
										className: "h-full w-full object-contain"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-6 w-6 text-muted-foreground" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: logo ? "Logo uploaded" : "No logo yet"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "PNG, JPG, SVG, or WebP — up to 6 MB."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "image/png,image/jpeg,image/svg+xml,image/webp",
									className: "hidden",
									onChange: handleFile
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => fileRef.current?.click(),
									disabled: busy,
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : logo ? "Replace" : "Upload"
								}),
								logo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: clearLogo,
									"aria-label": "Remove logo",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-md border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "✓ Apply My Logo to All Generated Content"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Stamps onto every page of every export."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: settings.enabled,
							onCheckedChange: (v) => patch({ enabled: v }),
							disabled: !logo
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Placement"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select$1, {
									value: settings.placement,
									onValueChange: (v) => patch({ placement: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "center",
											children: "Center watermark"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "top-left",
											children: "Top left"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "top-right",
											children: "Top right"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "bottom-left",
											children: "Bottom left"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "bottom-right",
											children: "Bottom right"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "header-center",
											children: "Header center"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "footer-center",
											children: "Footer center"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Size"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select$1, {
									value: settings.size,
									onValueChange: (v) => patch({ size: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "small",
											children: "Small"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "medium",
											children: "Medium"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "large",
											children: "Large"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Blur"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select$1, {
									value: settings.blur,
									onValueChange: (v) => patch({ blur: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "off",
											children: "Off"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "low",
											children: "Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "medium",
											children: "Medium"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Rotation"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select$1, {
									value: String(settings.rotation),
									onValueChange: (v) => patch({ rotation: Number(v) }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "0",
											children: "0°"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "45",
											children: "45°"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "-45",
											children: "Diagonal (-45°)"
										})
									] })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Opacity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs tabular-nums text-muted-foreground",
								children: [Math.round(settings.opacity * 100), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 1,
							max: 15,
							step: 1,
							value: [Math.round(settings.opacity * 100)],
							onValueChange: ([v]) => patch({ opacity: v / 100 })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Margin"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs tabular-nums text-muted-foreground",
								children: [settings.margin, "pt"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							min: 0,
							max: 96,
							step: 4,
							value: [settings.margin],
							onValueChange: ([v]) => patch({ margin: v })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Live preview"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto aspect-[1/1.414] w-full max-w-[280px] overflow-hidden rounded-md border border-border bg-[#fdfcf7] shadow-inner",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-6 top-6 space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-1/2 rounded bg-slate-300/80" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-full rounded bg-slate-200/80" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-5/6 rounded bg-slate-200/80" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-2/3 rounded bg-slate-200/80" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `absolute inset-0 flex p-3 ${{
								center: "items-center justify-center",
								"top-left": "items-start justify-start",
								"top-right": "items-start justify-end",
								"bottom-left": "items-end justify-start",
								"bottom-right": "items-end justify-end",
								"header-center": "items-start justify-center",
								"footer-center": "items-end justify-center"
							}[settings.placement]}`,
							children: logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: logo,
								alt: "",
								style: previewStyle,
								className: "object-contain"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Upload a logo to preview"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-muted-foreground",
						children: "Preview is indicative — exports embed the logo at full PDF quality."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: "md:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => applyToExisting(),
					disabled: applyingExisting || !logo,
					children: [applyingExisting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 h-3.5 w-3.5" }), "Stamp Now (Re-download all)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onDone,
					children: "Done"
				})]
			})
		]
	});
}
var DEFAULT_PREFS = {
	syllabusTagging: true,
	pyqMapping: false,
	generateQuestions: true,
	questionPrelimsMcqs: true,
	questionMains: true,
	questionEssay: false,
	questionEthicsCases: false,
	questionInterview: false,
	generateShortNotes: true,
	generateHandwritten: true,
	generateInfographics: true,
	runFinalChecker: true
};
var KEY = "upsc_processing_prefs_v1";
var EVENT = "upsc-prefs-changed";
function isBrowser() {
	return typeof window !== "undefined" && typeof localStorage !== "undefined";
}
function getProcessingPrefs() {
	if (!isBrowser()) return DEFAULT_PREFS;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return DEFAULT_PREFS;
		return {
			...DEFAULT_PREFS,
			...JSON.parse(raw)
		};
	} catch {
		return DEFAULT_PREFS;
	}
}
function setProcessingPrefs(p) {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(p));
		window.dispatchEvent(new CustomEvent(EVENT));
	} catch (e) {
		console.warn("[prefs] write failed", e);
	}
}
function subscribeProcessingPrefs(cb) {
	if (!isBrowser()) return () => {};
	const handler = () => cb();
	window.addEventListener(EVENT, handler);
	window.addEventListener("storage", handler);
	return () => {
		window.removeEventListener(EVENT, handler);
		window.removeEventListener("storage", handler);
	};
}
function prefsToOptions(p) {
	return {
		syllabusTagging: true,
		pyqMapping: p.pyqMapping,
		mainsCategories: {
			essay: p.questionEssay,
			ethics: p.questionEthicsCases,
			interview: p.questionInterview
		}
	};
}
function useProcessingPrefs() {
	const [p, setP] = (0, import_react.useState)(() => getProcessingPrefs());
	(0, import_react.useEffect)(() => subscribeProcessingPrefs(() => setP(getProcessingPrefs())), []);
	return p;
}
function Row({ title, desc, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4 rounded-md border border-border/60 bg-paper/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-sm font-medium",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: desc
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
function ProcessingOptionsButton() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(getProcessingPrefs());
	(0, import_react.useEffect)(() => {
		if (open) setDraft(getProcessingPrefs());
	}, [open]);
	const set = (k, v) => setDraft((d) => ({
		...d,
		[k]: v
	}));
	function save() {
		setProcessingPrefs(draft);
		toast.success("Processing options saved");
		setOpen(false);
	}
	function reset() {
		setDraft(DEFAULT_PREFS);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				"aria-label": "Processing options",
				className: "min-h-9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
					className: "h-4 w-4 sm:mr-2",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "Processing options"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[85vh] max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-serif text-xl",
					children: "Processing options"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Control how uploaded material is processed. The app always preserves and organises your source content — these toggles only enable the optional UPSC-specific layers." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-2 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-serif text-sm font-semibold text-muted-foreground",
							children: "UPSC layers (optional)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "UPSC Syllabus Tagging",
							desc: "Map every concept to Prelims / GS-I / GS-II / GS-III / GS-IV / Essay / Optional. When OFF, no GS Paper labels are added.",
							checked: draft.syllabusTagging,
							onChange: (v) => set("syllabusTagging", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "PYQ Mapping",
							desc: "Link concepts to actual UPSC Previous Year Questions. AI-generated practice questions are kept separate.",
							checked: draft.pyqMapping,
							onChange: (v) => set("pyqMapping", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-serif text-sm font-semibold text-muted-foreground",
							children: "Question generation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Generate Questions",
							desc: "Master toggle. When OFF, no question banks are generated.",
							checked: draft.generateQuestions,
							onChange: (v) => set("generateQuestions", v)
						}),
						draft.generateQuestions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-2 space-y-2 border-l-2 border-accent/30 pl-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									title: "Prelims MCQs",
									desc: "Objective questions with 4 options and explanations.",
									checked: draft.questionPrelimsMcqs,
									onChange: (v) => set("questionPrelimsMcqs", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									title: "Mains Questions",
									desc: "Long-answer questions with introduction, body, conclusion outlines.",
									checked: draft.questionMains,
									onChange: (v) => set("questionMains", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									title: "Essay Questions",
									desc: "Adds broad essay-style prompts inside the Mains output.",
									checked: draft.questionEssay,
									onChange: (v) => set("questionEssay", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									title: "Ethics Case Studies",
									desc: "Adds GS-4 style case studies inside the Mains output.",
									checked: draft.questionEthicsCases,
									onChange: (v) => set("questionEthicsCases", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									title: "Interview Questions",
									desc: "Adds Personality-Test style opinion/probing questions.",
									checked: draft.questionInterview,
									onChange: (v) => set("questionInterview", v)
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-serif text-sm font-semibold text-muted-foreground",
							children: "Other outputs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Short Notes",
							desc: "1–2 page revision sheets per topic.",
							checked: draft.generateShortNotes,
							onChange: (v) => set("generateShortNotes", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Handwritten Notes",
							desc: "Notebook-style pages — unlimited length to cover the full document.",
							checked: draft.generateHandwritten,
							onChange: (v) => set("generateHandwritten", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Infographics",
							desc: "One infographic page per detected topic. No upper limit.",
							checked: draft.generateInfographics,
							onChange: (v) => set("generateInfographics", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							title: "Final Checker",
							desc: "Audit generated outputs for coverage of the source. Shows syllabus mapping only if Syllabus Tagging is ON.",
							checked: draft.runFinalChecker,
							onChange: (v) => set("runFinalChecker", v)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "mt-4 flex-row justify-between gap-2 sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: reset,
						children: "Reset to defaults"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: save,
						children: "Save options"
					})]
				})
			]
		})]
	});
}
var SOURCE_STYLE = {
	"The Hindu": "bg-rose-100 text-rose-900 border-rose-300",
	"The Indian Express": "bg-amber-100 text-amber-900 border-amber-300",
	PIB: "bg-indigo-100 text-indigo-900 border-indigo-300",
	PRS: "bg-emerald-100 text-emerald-900 border-emerald-300",
	Yojana: "bg-violet-100 text-violet-900 border-violet-300",
	Kurukshetra: "bg-teal-100 text-teal-900 border-teal-300",
	Other: "bg-slate-100 text-slate-900 border-slate-300"
};
var GS_STYLE = {
	GS1: "bg-amber-50 text-amber-900 border-amber-300",
	GS2: "bg-indigo-50 text-indigo-900 border-indigo-300",
	GS3: "bg-emerald-50 text-emerald-900 border-emerald-300",
	GS4: "bg-rose-50 text-rose-900 border-rose-300",
	Essay: "bg-violet-50 text-violet-900 border-violet-300"
};
var PRIORITY_STYLE = {
	high: "bg-rose-600 text-white border-rose-700",
	medium: "bg-amber-500 text-white border-amber-600",
	low: "bg-slate-400 text-white border-slate-500"
};
function Importance({ value }) {
	const stars = Array.from({ length: 5 }, (_, i) => i < value);
	const label = value >= 5 ? "Must Read" : value === 4 ? "Important" : value === 3 ? "Moderate" : value === 2 ? "Low Priority" : "Skip";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1",
		title: `${label} (${value}/5)`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "text-amber-500",
			children: stars.map((on, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `inline h-3.5 w-3.5 ${on ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}` }, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-medium text-muted-foreground",
			children: label
		})]
	});
}
function SyllabusPath({ path }) {
	if (!path?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center gap-1 text-[12px]",
		children: path.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `rounded px-1.5 py-0.5 ${i === 0 ? "bg-primary/10 font-semibold text-primary" : "bg-muted text-foreground"}`,
				children: p
			}), i < path.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: "›"
			})]
		}, i))
	});
}
function ArticleBadges({ a }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [
			a.gs_papers.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: GS_STYLE[g] ?? "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-1 h-3 w-3" }), g]
			}, g)),
			a.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "border-primary/30 bg-primary/5 text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "mr-1 h-3 w-3" }), a.subject]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: PRIORITY_STYLE[a.prelims_priority],
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "mr-1 h-3 w-3" }),
					"Prelims · ",
					a.prelims_priority
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: PRIORITY_STYLE[a.mains_priority],
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "mr-1 h-3 w-3" }),
					"Mains · ",
					a.mains_priority
				]
			}),
			a.pyqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "border-emerald-300 bg-emerald-50 text-emerald-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "mr-1 h-3 w-3" }),
					a.pyqs.length,
					" PYQ",
					a.pyqs.length === 1 ? "" : "s"
				]
			}),
			a.handwritten_outline.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "border-amber-300 bg-amber-50 text-amber-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3 w-3" }), "Notes Ready"]
			}),
			a.mind_map.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "border-violet-300 bg-violet-50 text-violet-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "mr-1 h-3 w-3" }), "Mind Map"]
			}),
			a.tags.slice(0, 4).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: "text-[10px]",
				children: t
			}, t))
		]
	});
}
var RELATED_LABELS = {
	articles: "Articles",
	current_affairs: "Current Affairs",
	constitution: "Constitution Articles",
	sc_cases: "Supreme Court Cases",
	committees: "Committees",
	reports: "Reports",
	schemes: "Government Schemes",
	intl_orgs: "International Orgs",
	static_topic: "Static Topic",
	ncert: "NCERT",
	laxmikanth: "Laxmikanth",
	spectrum: "Spectrum"
};
function RelatedLinks({ article, openInMentor }) {
	const entries = Object.entries(article.related).filter(([, v]) => Array.isArray(v) && v.length > 0);
	if (!entries.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-md border border-border bg-paper p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
			className: "mb-2 flex items-center gap-1.5 font-serif text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { className: "h-4 w-4 text-accent" }), " Smart Related Links"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: entries.map(([key, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				children: RELATED_LABELS[key]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex flex-wrap gap-1",
				children: items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => openInMentor(`${RELATED_LABELS[key]}: ${it}`),
					className: "rounded-md border border-border bg-background px-2 py-0.5 text-[11px] transition-colors hover:border-accent hover:bg-accent/10",
					children: it
				}, i))
			})] }, key))
		})]
	});
}
function ArticleCard({ a, openInMentor }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-border p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-serif text-2xl font-bold leading-snug text-neutral-900 dark:text-neutral-50",
							children: a.title
						}), a.source_page && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-400",
							children: ["Page ", a.source_page]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Importance, { value: a.importance })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyllabusPath, { path: a.syllabus_path })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleBadges, { a })
				}),
				a.summary_30s && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 rounded-md bg-neutral-100 px-4 py-3 text-[17px] font-medium leading-7 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-xs font-bold uppercase tracking-wider text-primary",
						children: "30s"
					}), a.summary_30s]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setOpen((o) => !o),
						children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "mr-1 h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "mr-1 h-3.5 w-3.5" }), open ? "Collapse" : "Open full briefing"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => openInMentor(a.title, `Source: ${a.subject}. ${a.summary_2min || a.summary_30s}`),
						className: "text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3.5 w-3.5" }), " Ask Mentor"]
					})]
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5 p-5 text-[17px] leading-7 text-neutral-900 dark:text-neutral-100",
			children: [
				a.summary_2min && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "2-Minute Revision",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[17px] leading-8",
						children: a.summary_2min
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 md:grid-cols-2",
					children: [
						a.keywords.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Keywords",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "h-4 w-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: a.keywords.map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-sm",
									children: k
								}, i))
							})
						}),
						a.facts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Important Facts",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "list-disc space-y-1.5 pl-5 text-[16px] leading-7",
								children: a.facts.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f }, i))
							})
						}),
						a.stats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Data & Statistics",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "h-4 w-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1 text-[16px] leading-7",
								children: a.stats.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded bg-emerald-50 px-2 py-1 text-emerald-900",
									children: s
								}, i))
							})
						}),
						a.constitutional_articles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Constitutional Articles",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4 w-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: a.constitutional_articles.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-indigo-600 text-white",
									children: c
								}, i))
							})
						}),
						a.quotes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Quotes",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "h-4 w-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-[16px] italic leading-7",
								children: a.quotes.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "border-l-4 border-accent pl-3",
									children: [
										"“",
										q,
										"”"
									]
								}, i))
							})
						})
					]
				}),
				a.pyqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "PYQ Mapping",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[15px] leading-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-neutral-100 text-left text-xs font-bold uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2",
										children: "Year"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2",
										children: "Paper"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2",
										children: "Question"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2",
										children: "×"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2",
										children: "State PCS"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: a.pyqs.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono text-sm",
										children: p.year
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-sm",
										children: p.paper
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: p.question
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-center font-semibold",
										children: p.repeat_count
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300",
										children: p.state_pcs || "—"
									})
								]
							}, i)) })]
						})
					})
				}),
				a.short_notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Short Notes",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc space-y-1.5 pl-5 text-[16px] leading-7",
						children: a.short_notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n }, i))
					})
				}),
				a.one_pager && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "One-Page Revision",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[17px] leading-8",
						children: a.one_pager
					})
				}),
				a.handwritten_outline.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Handwritten Outline",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: a.handwritten_outline.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border-l-4 border-amber-400 bg-amber-50 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-serif text-lg font-bold text-amber-950",
								children: h.heading
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[16px] leading-7 text-neutral-900",
								children: h.body
							})]
						}, i))
					})
				}),
				a.mind_map.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Mind Map",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: a.mind_map.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-violet-200 bg-violet-50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold text-violet-950",
								children: m.branch
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-1 list-disc space-y-1 pl-5 text-[15px] leading-6 text-neutral-900",
								children: m.leaves.map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l }, j))
							})]
						}, i))
					})
				}),
				a.flashcards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Flashcards",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: a.flashcards.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "rounded-md border border-border bg-neutral-50 p-3 text-[15px] dark:bg-neutral-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer font-semibold text-neutral-900 dark:text-neutral-100",
								children: f.q
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 leading-7 text-neutral-800 dark:text-neutral-200",
								children: f.a
							})]
						}, i))
					})
				}),
				a.prelims_mcqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Prelims MCQs",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-3",
						children: a.prelims_mcqs.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border p-4 text-[16px] leading-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-bold",
									children: [
										"Q",
										i + 1,
										". ",
										q.stem
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "mt-2 grid gap-1.5",
									type: "A",
									children: q.options.map((o, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: `ml-5 pl-1 ${j === q.answer_index ? "font-bold text-emerald-800" : ""}`,
										children: o
									}, j))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-neutral-700 dark:text-neutral-300",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold",
											children: "Answer:"
										}),
										" ",
										String.fromCharCode(65 + q.answer_index),
										" — ",
										q.explanation
									]
								})
							]
						}, i))
					})
				}),
				a.mains_questions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Mains Questions",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-2",
						children: a.mains_questions.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border p-4 text-[16px] leading-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: m.gs_paper
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [m.marks, " marks"] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold",
									children: m.question
								}),
								m.outline.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 list-disc space-y-1 pl-5",
									children: m.outline.map((o, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: o }, j))
								})
							]
						}, i))
					})
				}),
				a.interview_questions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Interview Questions",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "h-4 w-4" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-decimal space-y-1.5 pl-6 text-[16px] leading-7",
						children: a.interview_questions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: q }, i))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelatedLinks, {
					article: a,
					openInMentor: (topic) => openInMentor(topic, `Parent article: ${a.title}\nSubject: ${a.subject}\nSummary: ${a.summary_2min || a.summary_30s}`)
				})
			]
		})]
	});
}
function Block({ title, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
		className: "mb-2 flex items-center gap-2 font-serif text-base font-bold text-primary",
		children: [icon, title]
	}), children] });
}
function NewspaperIssue({ content, onRetry }) {
	const navigate = useNavigate();
	const issue = {
		title: content?.title ?? "Newspaper Analysis",
		source: content?.source ?? "Other",
		date: content?.date ?? "",
		edition: content?.edition ?? "",
		articles: Array.isArray(content?.articles) ? content.articles : []
	};
	const [fGs, setFGs] = (0, import_react.useState)("");
	const [fSubject, setFSubject] = (0, import_react.useState)("");
	const [fPriority, setFPriority] = (0, import_react.useState)("");
	const [fImportance, setFImportance] = (0, import_react.useState)(0);
	const allSubjects = (0, import_react.useMemo)(() => Array.from(new Set(issue.articles.map((a) => a.subject).filter(Boolean))).sort(), [issue.articles]);
	const visible = issue.articles.filter((a) => {
		if (fGs && !a.gs_papers.includes(fGs)) return false;
		if (fSubject && a.subject !== fSubject) return false;
		if (fPriority && a.prelims_priority !== fPriority && a.mains_priority !== fPriority) return false;
		if (fImportance && a.importance < fImportance) return false;
		return true;
	});
	function openInMentor(topic, context) {
		try {
			if (context) sessionStorage.setItem("mentor_seed_context", context);
			else sessionStorage.removeItem("mentor_seed_context");
		} catch {}
		navigate({
			to: "/mentor",
			search: { seed: topic }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "rounded-xl border-2 border-accent/40 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-6 w-6 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-serif text-lg font-semibold leading-tight",
						children: issue.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex flex-wrap items-center gap-1.5 text-[11px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: SOURCE_STYLE[issue.source] ?? SOURCE_STYLE.Other,
								children: ["📖 ", issue.source]
							}),
							issue.date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: ["📅 ", issue.date]
							}),
							issue.edition && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: issue.edition
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "border-emerald-300 bg-emerald-50 text-emerald-900",
								children: [
									issue.articles.length,
									" article",
									issue.articles.length === 1 ? "" : "s"
								]
							})
						]
					})] })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Subject",
						value: fSubject,
						onChange: setFSubject,
						options: ["", ...allSubjects]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Priority",
						value: fPriority,
						onChange: setFPriority,
						options: [
							"",
							"high",
							"medium",
							"low"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Min ★",
						value: String(fImportance),
						onChange: (v) => setFImportance(Number(v)),
						options: [
							"0",
							"1",
							"2",
							"3",
							"4",
							"5"
						]
					}),
					(fGs || fSubject || fPriority || fImportance) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-7",
						onClick: () => {
							setFGs("");
							setFSubject("");
							setFPriority("");
							setFImportance(0);
						},
						children: "Clear"
					})
				]
			})]
		}), issue.articles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-border bg-white p-8 text-center dark:bg-neutral-900",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50",
					children: "We couldn't read this newspaper clearly"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-xl text-[16px] leading-7 text-neutral-700 dark:text-neutral-300",
					children: "The text in this PDF was too blurry or low quality for us to extract complete articles. Please try a sharper scan or the publisher's original PDF, then run the analysis again."
				}),
				onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onRetry,
						className: "bg-primary text-primary-foreground",
						children: "Retry Analysis"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md border border-dashed border-border bg-white p-6 text-center text-[15px] text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
				children: "No articles match these filters."
			}), visible.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleCard, {
				a,
				openInMentor
			}, i))]
		})]
	});
}
function Select({ label, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (e) => onChange(e.target.value),
			className: "bg-transparent text-xs outline-none",
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: o,
				children: o === "" ? "All" : o === "0" ? "Any" : o
			}, o))
		})]
	});
}
function TelegramInbox({ onImported }) {
	const list = useServerFn(listInbox);
	const importer = useServerFn(importInboxItem);
	const extract = useServerFn(extractDocument);
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["telegram-inbox"],
		queryFn: () => list(),
		refetchInterval: 6e4
	});
	const m = useMutation({
		mutationFn: (itemId) => importer({ data: { itemId } }),
		onSuccess: (r, itemId) => {
			const isPdf = (q.data?.find((x) => x.id === itemId))?.kind === "pdf";
			if (typeof window !== "undefined") {
				sessionStorage.setItem("active_doc_id", r.documentId);
				if (isPdf) sessionStorage.setItem("auto_run_newspaper", r.documentId);
			}
			toast.success(isPdf ? "Imported — extracting & analysing as newspaper…" : "Imported to your dashboard");
			qc.invalidateQueries({ queryKey: ["documents"] });
			onImported?.(r.documentId);
			extract({ data: { documentId: r.documentId } }).then(() => qc.invalidateQueries({ queryKey: ["documents"] })).catch((e) => toast.error(e.message || "Extraction failed"));
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-5 w-5 text-indigo-700" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-lg text-indigo-900",
						children: "Telegram Inbox"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "ml-1",
						children: "Sidheswar Civil Mentor"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => q.refetch(),
				disabled: q.isFetching,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${q.isFetching ? "animate-spin" : ""}` })
			})]
		}), q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
		}) : !q.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No posts yet. Add the bot as an admin to your channel and post a PDF, image, or link — items will appear here automatically."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-indigo-50",
			children: q.data.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-3 flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0 mt-1",
						children: it.kind === "pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-rose-600" }) : it.kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-5 w-5 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { className: "h-5 w-5 text-sky-600" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-sm truncate",
									children: it.file_name || it.source_url || it.caption?.slice(0, 60) || "Untitled"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "uppercase text-[10px]",
									children: it.kind
								})]
							}),
							it.caption && it.file_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground line-clamp-2 mt-0.5",
								children: it.caption
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground mt-1",
								children: new Date(it.posted_at).toLocaleString()
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0 flex gap-1",
						children: it.kind === "link" && it.source_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: it.source_url,
								target: "_blank",
								rel: "noreferrer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5 mr-1" }), "Open"]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => m.mutate(it.id),
							disabled: m.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1" }), "Import"]
						})
					})
				]
			}, it.id))
		})]
	});
}
function Dashboard() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [userEmail, setUserEmail] = (0, import_react.useState)(null);
	const [checkedAuth, setCheckedAuth] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabase.auth.getSession();
			setUserEmail(data.session?.user.email ?? null);
			setCheckedAuth(true);
		})();
	}, [navigate]);
	const list = useServerFn(listDocuments);
	const [activeDocId, setActiveDocId] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return null;
		return sessionStorage.getItem("active_doc_id");
	});
	const docsQ = useQuery({
		queryKey: ["documents", activeDocId],
		queryFn: async () => {
			const all = await list();
			if (!activeDocId) return [];
			return (all || []).filter((d) => d.id === activeDocId);
		},
		enabled: checkedAuth && Boolean(activeDocId),
		refetchInterval: (q) => {
			return (q.state.data || []).some((d) => d.status === "processing" || d.status === "uploaded") ? 3e3 : false;
		}
	});
	const startUploadSession = useServerFn(createUploadSession);
	const finalize = useServerFn(finalizeUpload);
	const completeFinalChunk = useServerFn(completeUploadFinalChunk);
	const syncDrive = useServerFn(syncFromDrive);
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [showDriveAccessInfo, setShowDriveAccessInfo] = (0, import_react.useState)(false);
	async function onSyncFromDrive() {
		if (syncing) return;
		setSyncing(true);
		try {
			const res = await syncDrive();
			if (res.imported > 0) {
				toast.success(`Imported ${res.imported} file${res.imported === 1 ? "" : "s"} from Drive`);
				await qc.invalidateQueries({ queryKey: ["documents"] });
				await qc.invalidateQueries({ queryKey: ["all-documents"] });
			} else toast.message(`No new files. ${res.scanned} already in your library.`);
		} catch (e) {
			toast.error(e?.message || "Sync failed");
		} finally {
			setSyncing(false);
		}
	}
	const uploadSmall = useServerFn(uploadDocument);
	const extract = useServerFn(extractDocument);
	const del = useServerFn(deleteDocument);
	const fileRef = (0, import_react.useRef)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [uploadProgress, setUploadProgress] = (0, import_react.useState)(0);
	async function clearActive(opts = {}) {
		const prevId = typeof window !== "undefined" ? sessionStorage.getItem("active_doc_id") : null;
		console.log("[ActivePDF] Clearing previous document", { previousDocumentId: prevId });
		try {
			sessionStorage.removeItem("active_doc_id");
			sessionStorage.removeItem("session_doc_ids");
		} catch {}
		setActiveDocId(null);
		qc.removeQueries({ queryKey: ["documents"] });
		qc.removeQueries({ queryKey: ["generations"] });
		qc.setQueryData(["documents", prevId], []);
		if (!opts.silent) toast.success("Cleared current PDF — releasing storage…");
		if (prevId) del({ data: { id: prevId } }).then(() => console.log("[ActivePDF] Backend cache + storage released", { previousDocumentId: prevId })).catch((e) => console.warn("[ActivePDF] Failed to delete previous doc (ignored)", e));
		console.log("[ActivePDF] Cache cleared. No active document.");
	}
	async function onPick(file) {
		setUploading(true);
		setUploadProgress(0);
		try {
			const prevId = typeof window !== "undefined" ? sessionStorage.getItem("active_doc_id") : null;
			console.log("[ActivePDF] New upload starting", {
				previousDocumentId: prevId,
				fileName: file.name
			});
			if (prevId) try {
				await del({ data: { id: prevId } });
				console.log("[ActivePDF] Previous document deleted from backend", { previousDocumentId: prevId });
			} catch (e) {
				console.warn("[ActivePDF] Could not delete previous doc", e);
			}
			try {
				sessionStorage.removeItem("active_doc_id");
				sessionStorage.removeItem("session_doc_ids");
			} catch {}
			setActiveDocId(null);
			qc.removeQueries({ queryKey: ["documents"] });
			qc.removeQueries({ queryKey: ["generations"] });
			const { data: sess } = await supabase.auth.getSession();
			if (!sess.session?.user.id) throw new Error("Not signed in");
			const mime = file.type || "application/pdf";
			const SMALL_MAX = 4 * 1024 * 1024;
			let row;
			if (file.size <= SMALL_MAX) {
				const fd = new FormData();
				fd.set("file", file);
				fd.set("title", file.name);
				setUploadProgress(10);
				row = await uploadSmall({ data: fd });
				setUploadProgress(100);
				console.log("[Drive] Server-side upload complete", { id: row?.id });
			} else {
				const session = await startUploadSession({ data: {
					fileName: file.name,
					mime,
					size: file.size,
					title: file.name
				} });
				console.log("[Drive] Resumable session created", { documentId: session.documentId });
				let completedRow = null;
				const { driveFileId } = await uploadFileResumable({
					file,
					uploadUrl: session.uploadUrl,
					onProgress: (loaded, total) => {
						setUploadProgress(total ? Math.round(loaded / total * 100) : 0);
					},
					uploadFinalChunk: async ({ blob, start, end, total }) => {
						const fd = new FormData();
						fd.set("documentId", session.documentId);
						fd.set("uploadUrl", session.uploadUrl);
						fd.set("start", String(start));
						fd.set("end", String(end));
						fd.set("total", String(total));
						fd.set("chunk", new File([blob], file.name, { type: mime }));
						completedRow = await completeFinalChunk({ data: fd });
						setUploadProgress(100);
						return { driveFileId: completedRow?.drive_file_id ?? null };
					}
				});
				console.log("[Drive] Upload complete", {
					driveFileId,
					recoveredByServer: !driveFileId
				});
				row = completedRow ?? await finalize({ data: {
					documentId: session.documentId,
					driveFileId
				} });
				console.log("[Drive] Finalised", {
					driveFileId: row?.drive_file_id,
					viewLink: row?.drive_view_link
				});
			}
			try {
				sessionStorage.setItem("active_doc_id", row.id);
			} catch {}
			setActiveDocId(row.id);
			console.log("[ActivePDF] New active document loaded", {
				previousDocumentId: prevId,
				newDocumentId: row.id,
				fileName: file.name,
				cacheCleared: true,
				embeddingsRebuilt: true
			});
			toast.success("New PDF active — extracting…");
			qc.invalidateQueries({ queryKey: ["documents", row.id] });
			extract({ data: { documentId: row.id } }).then((res) => {
				console.log("[ActivePDF] Extraction complete", { activeDocumentId: row.id });
				if (res?.ok === false) toast.error(res?.message || "Extraction failed. Please re-upload the document.");
				qc.invalidateQueries({ queryKey: ["documents", row.id] });
			}).catch((e) => toast.error(e?.message || "Extraction failed"));
		} catch (e) {
			toast.error(e?.message || "Upload failed");
		} finally {
			setUploading(false);
			setUploadProgress(0);
			if (fileRef.current) fileRef.current.value = "";
		}
	}
	const deleteMut = useMutation({
		mutationFn: async (id) => del({ data: { id } }),
		onSuccess: () => {
			try {
				sessionStorage.removeItem("active_doc_id");
			} catch {}
			setActiveDocId(null);
			qc.removeQueries({ queryKey: ["generations"] });
			toast.success("Deleted");
			qc.removeQueries({ queryKey: ["documents"] });
		},
		onError: (e) => toast.error(e?.message || "Delete failed")
	});
	const activeDoc = (docsQ.data || [])[0] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [activeDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-accent/30 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 text-sm sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, {
						className: "h-4 w-4 shrink-0 text-accent",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold",
							children: "Active:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-serif",
							children: activeDoc.title
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "capitalize",
						children: activeDoc.status
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Study library",
					className: "relative overflow-hidden rounded-3xl border border-primary/30 gradient-hero p-6 text-primary-foreground shadow-paper sm:p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0 gradient-emerald-glow opacity-90",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-float-slow",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/40 blur-3xl",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative max-w-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2 rounded-full border border-accent/40 bg-primary/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent backdrop-blur",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "h-3.5 w-3.5",
										"aria-hidden": "true"
									}), "UPSC Genius Studio"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-4 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl",
									children: ["Your ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gold-shimmer",
										children: "study library"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base",
									children: "Upload a PDF, sync from Drive, or pick a newspaper date — then let the mentor turn it into notes, MCQs, mains & more."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-8 flex flex-wrap gap-2 sm:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
									className: "hidden",
									onChange: (e) => {
										const f = e.target.files?.[0];
										if (f) onPick(f);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => fileRef.current?.click(),
									disabled: uploading,
									className: "min-h-11 shrink-0 bg-accent text-accent-foreground shadow-gold hover:bg-accent/90",
									children: [
										uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											className: "mr-2 h-4 w-4 animate-spin",
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
											className: "mr-2 h-4 w-4",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: uploading ? `Uploading… ${uploadProgress}%` : activeDoc ? "Replace PDF" : "Upload material"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sm:hidden",
											children: uploading ? `${uploadProgress}%` : activeDoc ? "Replace" : "Upload"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "min-h-11 shrink-0 border-accent/40 bg-primary/30 text-primary-foreground backdrop-blur hover:bg-primary/50 hover:text-primary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/inbox",
										children: "📅 Newspaper date"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									onClick: onSyncFromDrive,
									disabled: syncing || uploading,
									className: "min-h-11 shrink-0 border-accent/40 bg-primary/30 text-primary-foreground backdrop-blur hover:bg-primary/50 hover:text-primary-foreground",
									title: "Scan your Google Drive folder for files not yet in your library",
									children: [
										syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											className: "mr-2 h-4 w-4 animate-spin",
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderSync, {
											className: "mr-2 h-4 w-4",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: syncing ? "Syncing…" : "Sync from Drive"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sm:hidden",
											children: syncing ? "…" : "Sync"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon",
									onClick: () => setShowDriveAccessInfo(true),
									className: "min-h-11 shrink-0 text-primary-foreground/80 hover:bg-primary/40 hover:text-primary-foreground",
									title: "Why don't I see my manually-uploaded Drive files?",
									"aria-label": "Drive access info",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										className: "h-4 w-4",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessingOptionsButton, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampLogoButton, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "sm",
											className: "gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/mentor",
												"aria-label": "AI Mentor chat",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
													className: "h-4 w-4",
													"aria-hidden": "true"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "hidden sm:inline",
													children: "AI Mentor"
												})]
											})
										})
									]
								})
							]
						}),
						uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: uploadProgress,
								className: "h-2 bg-primary/40"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-primary-foreground/80",
								children: [
									"Uploading directly to Google Drive — ",
									uploadProgress,
									"% complete. Resumes automatically on network drops."
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramInbox, { onImported: (id) => setActiveDocId(id) })
				}),
				activeDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivePdfPanel, {
					doc: activeDoc,
					onClear: () => clearActive()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-4",
					children: [
						docsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Loading…"
						}),
						!docsQ.isLoading && !activeDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/25 bg-card p-12 text-center shadow-paper",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pointer-events-none absolute inset-0 gradient-emerald-glow opacity-30",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-gold shadow-gold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-8 w-8 text-accent-foreground" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "relative mt-4 font-serif text-2xl",
									children: "No active document"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "relative mx-auto mt-1 max-w-md text-sm text-muted-foreground",
									children: "Upload a PDF, DOCX, or text file — or pick a newspaper date to start crafting mentor-grade notes."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => fileRef.current?.click(),
									className: "relative mt-5 bg-primary text-primary-foreground shadow-paper hover:bg-primary/90",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 h-4 w-4" }), " Upload your first PDF"]
								})
							]
						}),
						activeDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocCard, {
							doc: activeDoc,
							onDelete: () => deleteMut.mutate(activeDoc.id)
						}, activeDoc.id)
					]
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: showDriveAccessInfo,
		onOpenChange: setShowDriveAccessInfo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "About \"Sync from Drive\"" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Why some Drive files don't appear, and how to expand access." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "Current access:"
							}),
							" the app uses Google's",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "mx-1 rounded bg-muted px-1 py-0.5 text-xs",
								children: "drive.file"
							}),
							"scope — it can only see files the app itself created (uploads through this dashboard or the Telegram bot)."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "What \"Sync from Drive\" does:"
							}),
							" scans your ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "mx-1 rounded bg-muted px-1 py-0.5 text-xs",
								children: "UPSC-Genius-AI/<your-id>/"
							}),
							"folder and imports any app-created files that aren't yet in your library."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "PDFs you dropped manually"
							}),
							" into Drive via drive.google.com will ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "not" }),
							" appear — Google blocks the app from seeing them at the OAuth level."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: "Want full Drive read access?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs",
								children: [
									"Open ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Lovable → Connectors → Google Drive" }),
									", disconnect, and reconnect choosing the ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "drive.readonly" }),
									" scope. After that, \"Sync from Drive\" can pull in PDFs you uploaded manually anywhere in your Drive."
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setShowDriveAccessInfo(false),
					children: "Got it"
				}) })
			]
		})
	})] });
}
function ActivePdfPanel({ doc, onClear }) {
	const uploaded = new Date(doc.created_at).toLocaleString();
	const sizeKb = doc.size_bytes ? Math.round(doc.size_bytes / 1024) : null;
	const charCount = typeof doc.extracted_text === "string" ? doc.extracted_text.length : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-xl border-2 border-accent/40 bg-gradient-to-br from-accent/5 to-primary/5 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: "h-5 w-5 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-lg font-semibold",
						children: "Current Active PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "capitalize",
						children: doc.status
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: onClear,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1.5 h-3.5 w-3.5" }), " Clear Current PDF"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "File Name",
					value: doc.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Upload Time",
					value: uploaded
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Document ID",
					value: doc.id,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Status",
					value: doc.status
				}),
				sizeKb !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Size",
					value: `${sizeKb.toLocaleString()} KB`
				}),
				charCount !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Extracted Chars",
					value: charCount.toLocaleString()
				})
			]
		})]
	});
}
function Field({ label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: `truncate ${mono ? "font-mono text-xs" : ""}`,
			children: value
		})]
	});
}
function ReprocessButton({ docId, variant = "outline", label = "Reprocess (OCR)" }) {
	const qc = useQueryClient();
	const extract = useServerFn(extractDocument);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant,
		disabled: busy,
		onClick: async () => {
			setBusy(true);
			qc.setQueryData(["documents", docId], (rows) => Array.isArray(rows) ? rows.map((r) => r.id === docId ? {
				...r,
				status: "processing",
				error_message: null
			} : r) : rows);
			try {
				const res = await extract({ data: { documentId: docId } });
				if (res?.ok === false) toast.error(res?.message || "Still no readable text found in this file.");
				else toast.success("Reprocessed — extraction complete.");
			} catch (e) {
				toast.error(e?.message || "Reprocess failed");
			} finally {
				setBusy(false);
				qc.invalidateQueries({ queryKey: ["documents"] });
			}
		},
		children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1.5 h-3.5 w-3.5" }), busy ? "Reprocessing…" : label]
	});
}
function DocCard({ doc, onDelete }) {
	const qc = useQueryClient();
	const prefs = useProcessingPrefs();
	useServerFn(generateOutput);
	const planFn = useServerFn(planGeneration);
	const chunkFn = useServerFn(processChunk);
	const finalizeFn = useServerFn(finalizeGeneration);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [results, setResults] = (0, import_react.useState)({});
	const [progress, setProgress] = (0, import_react.useState)(null);
	const autoRanRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const legacy = sessionStorage.getItem("auto_run_newspaper");
		const typed = sessionStorage.getItem("auto_run_type");
		const docFlag = sessionStorage.getItem("auto_run_doc");
		let requested = null;
		if (legacy && legacy === doc.id) requested = "newspaper";
		else if (typed && docFlag === doc.id && OUTPUT_TYPES.includes(typed)) requested = typed;
		if (!requested) return;
		if (doc.status !== "ready") return;
		if (pending !== null) return;
		if (autoRanRef.current === doc.id + ":" + requested) return;
		autoRanRef.current = doc.id + ":" + requested;
		sessionStorage.removeItem("auto_run_newspaper");
		sessionStorage.removeItem("auto_run_type");
		sessionStorage.removeItem("auto_run_doc");
		toast.info(`Starting ${OUTPUT_LABELS[requested].label}…`);
		run(requested);
	}, [
		doc.id,
		doc.status,
		pending
	]);
	function handleStaleDocError(e) {
		const msg = String(e?.message || e || "");
		if (/Document not found|not ready/i.test(msg)) {
			try {
				sessionStorage.removeItem("active_doc_id");
			} catch {}
			qc.removeQueries({ queryKey: ["documents"] });
			qc.removeQueries({ queryKey: ["generations"] });
			qc.invalidateQueries({ queryKey: ["documents"] });
			toast.error("That PDF is no longer available. Please upload it again.");
			console.warn("[ActivePDF] Stale document cleared after generation error", { msg });
			return true;
		}
		return false;
	}
	async function runChunked(type) {
		try {
			sessionStorage.setItem("active_doc_id", doc.id);
		} catch {}
		console.log("[ActivePDF] AI query starting", {
			activeDocumentId: doc.id,
			outputType: type
		});
		setPending(type);
		setProgress({
			done: 0,
			total: 0,
			failed: 0,
			retrying: 0
		});
		try {
			const options = prefsToOptions(prefs);
			const { totalChunks, recommendedConcurrency, minGapMs, chunkSize } = await planFn({ data: {
				documentId: doc.id,
				outputType: type
			} });
			setProgress({
				done: 0,
				total: totalChunks,
				failed: 0,
				retrying: 0
			});
			const parts = new Array(totalChunks).fill(null);
			const MAX_RETRIES = 5;
			const CONCURRENCY = Math.max(1, Number(recommendedConcurrency || 1));
			const MIN_GAP_MS = Math.max(0, Number(minGapMs || 0));
			let lastStartedAt = 0;
			let aborted = null;
			async function attempt(i) {
				for (let retry = 0; retry <= MAX_RETRIES; retry++) {
					if (aborted) {
						setProgress((p) => p && {
							...p,
							failed: p.failed + 1,
							retrying: Math.max(0, p.retrying - 1)
						});
						return;
					}
					try {
						const gap = Date.now() - lastStartedAt;
						if (gap < MIN_GAP_MS) await new Promise((r) => setTimeout(r, MIN_GAP_MS - gap));
						lastStartedAt = Date.now();
						const chunkResult = await chunkFn({ data: {
							documentId: doc.id,
							outputType: type,
							chunkIndex: i,
							chunkSize,
							options
						} });
						if (chunkResult?.retryable) throw new Error(`${chunkResult.reason || "AI is busy. Retrying…"} __retry_after_ms=${chunkResult.retryAfterMs || 65e3}`);
						const { part } = chunkResult;
						parts[i] = part;
						setProgress((p) => p && {
							...p,
							done: p.done + 1,
							retrying: retry > 0 ? Math.max(0, p.retrying - 1) : p.retrying
						});
						return;
					} catch (e) {
						const msg = String(e?.message || e);
						if (/Payment Required|402|insufficient|credits|unauthorized|401|forbidden|403/i.test(msg)) {
							aborted = /Payment Required|402|insufficient|credits/i.test(msg) ? "AI credits are exhausted for this workspace. Add credits or retry after credits are available." : "AI runtime authorization failed. Please retry after the server refreshes.";
							setProgress((p) => p && {
								...p,
								failed: p.failed + 1,
								retrying: Math.max(0, p.retrying - 1)
							});
							return;
						}
						if (retry === MAX_RETRIES) {
							console.warn(`chunk ${i} permanently failed`, msg.slice(0, 200));
							setProgress((p) => p && {
								...p,
								failed: p.failed + 1,
								retrying: Math.max(0, p.retrying - 1)
							});
							return;
						}
						const isRate = /429|Too Many Requests|rate limit|quota/i.test(msg);
						const base = isRate ? 15e3 : 2e3;
						const delay = Number(msg.match(/__retry_after_ms=(\d+)/)?.[1] || 0) || Math.min(base * Math.pow(2, retry), 6e4) + Math.floor(Math.random() * 1500);
						if (retry === 0) setProgress((p) => p && {
							...p,
							retrying: p.retrying + 1
						});
						if (isRate) toast.info(`AI is busy — waiting ${Math.ceil(delay / 1e3)}s, then continuing automatically.`);
						await new Promise((r) => setTimeout(r, delay));
					}
				}
			}
			let next = 0;
			const workers = Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, async () => {
				while (true) {
					if (aborted) return;
					const i = next++;
					if (i >= totalChunks) return;
					await attempt(i);
				}
			});
			await Promise.all(workers);
			if (aborted) throw new Error(aborted);
			const valid = parts.filter(Boolean);
			if (!valid.length) throw new Error("All chunks failed. Please wait ~60s and try again.");
			const row = await finalizeFn({ data: {
				documentId: doc.id,
				outputType: type,
				parts: valid
			} });
			setResults((r) => ({
				...r,
				[type]: row.content
			}));
			const failedCount = totalChunks - valid.length;
			if (failedCount > 0) toast.warning(`${OUTPUT_LABELS[type].label} ready — ${failedCount}/${totalChunks} chunks skipped after retries`);
			else toast.success(`${OUTPUT_LABELS[type].label} ready`);
			qc.invalidateQueries({ queryKey: ["documents"] });
			qc.invalidateQueries({ queryKey: ["generations", doc.id] });
		} catch (e) {
			if (!handleStaleDocError(e)) toast.error(e?.message || "Generation failed");
		} finally {
			setPending(null);
			setProgress(null);
		}
	}
	async function run(type) {
		return runChunked(type);
	}
	const statusBadge = () => {
		const s = doc.status;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: {
				ready: "bg-emerald-100 text-emerald-900",
				processing: "bg-amber-100 text-amber-900",
				uploaded: "bg-slate-100 text-slate-700",
				failed: "bg-rose-100 text-rose-900"
			}[s] ?? "",
			children: s
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-paper p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate font-serif text-lg font-semibold",
								children: doc.title
							}),
							statusBadge(),
							doc.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: doc.subject
							}),
							doc.priority && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "capitalize",
								children: [doc.priority, " priority"]
							})
						]
					}), doc.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: doc.summary
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onDelete,
					"aria-label": "Delete",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				})]
			}),
			doc.status === "ready" && (() => {
				const enabledOutputs = [];
				if (prefs.generateShortNotes) enabledOutputs.push("short_notes");
				if (prefs.generateHandwritten) enabledOutputs.push("handwritten_notes");
				if (prefs.generateQuestions && prefs.questionPrelimsMcqs) enabledOutputs.push("prelims_mcqs");
				if (prefs.generateQuestions && (prefs.questionMains || prefs.questionEssay || prefs.questionEthicsCases || prefs.questionInterview)) enabledOutputs.push("mains_questions");
				const nonInfo = enabledOutputs.filter((t) => t !== "infographics");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					prefs.generateInfographics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-accent/40 bg-gradient-to-r from-primary/5 to-accent/10 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 font-serif font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4 text-accent" }), " One-Click Infographic Pack"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: "Auto-detects every topic in this document and produces unlimited A4 infographic pages with flowcharts, timelines, mind maps and key takeaways."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => run("infographics"),
								disabled: pending !== null,
								children: [pending === "infographics" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-3.5 w-3.5" }), "Generate Infographics"]
							})]
						}), pending === "infographics" && progress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: progress.total ? progress.done / progress.total * 100 : 0,
								className: "h-2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: progress.total === 0 ? "Planning chunks…" : `Processing ${progress.done}/${progress.total} chunks` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [progress.retrying > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-amber-700",
										children: ["↻ retrying ", progress.retrying]
									}), progress.failed > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-rose-700",
										children: [progress.failed, " skipped"]
									})]
								})]
							})]
						})]
					}),
					nonInfo.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: nonInfo.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => run(t),
							disabled: pending !== null,
							children: [pending === t ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-3.5 w-3.5" }), OUTPUT_LABELS[t].label]
						}, t))
					}),
					pending && pending !== "infographics" && pending !== "newspaper" && nonInfo.includes(pending) && progress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1.5 rounded-lg border border-border bg-muted/40 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Generating ",
									OUTPUT_LABELS[pending]?.label ?? pending,
									"…"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-muted-foreground",
									children: [progress.total ? Math.round(progress.done / progress.total * 100) : 0, "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: progress.total ? progress.done / progress.total * 100 : 0,
								className: "h-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: progress.total === 0 ? "Planning chunks…" : `Processing ${progress.done}/${progress.total} chunks` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [progress.retrying > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-amber-700",
										children: ["↻ retrying ", progress.retrying]
									}), progress.failed > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-rose-700",
										children: [progress.failed, " skipped"]
									})]
								})]
							})
						]
					}),
					nonInfo.length === 0 && !prefs.generateInfographics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "All outputs are disabled in Processing options."
					}),
					Object.entries(results).map(([type, content]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneratedResult, {
						type,
						content,
						docTitle: doc.title,
						docId: doc.id,
						onDelete: () => setResults((r) => {
							const n = { ...r };
							delete n[type];
							return n;
						})
					}, type)),
					prefs.runFinalChecker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinalChecker, {
						documentId: doc.id,
						documentTitle: doc.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {
						documentId: doc.id,
						docTitle: doc.title,
						onOpen: (type, content) => setResults((r) => ({
							...r,
							[type]: content
						}))
					})
				] });
			})(),
			(doc.status === "processing" || doc.status === "uploaded") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-amber-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium text-amber-900",
						children: "Extracting your document…"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-amber-800/80",
						children: "Generation options will appear here as soon as extraction is complete. This usually takes 10–60 seconds."
					})] })]
				})
			}),
			doc.status === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-rose-700",
					children: [
						"Extraction failed",
						doc.error_message ? `: ${doc.error_message}` : ".",
						" ",
						doc.error_message?.includes("Google Drive file is no longer accessible") ? "Please delete and upload it again." : "You can retry with OCR."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReprocessButton, { docId: doc.id })]
			}),
			doc.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReprocessButton, {
					docId: doc.id,
					variant: "ghost",
					label: "Re-run extraction (OCR)"
				})
			})
		]
	});
}
var VERIFIED_KEY_PREFIX = "verified-export:";
function verifiedStorageKey(docId, type) {
	return `${VERIFIED_KEY_PREFIX}${docId}:${type}`;
}
function isAlreadyVerified(docId, type) {
	if (typeof window === "undefined") return false;
	try {
		return !!window.localStorage.getItem(verifiedStorageKey(docId, type));
	} catch {
		return false;
	}
}
function markVerified(docId, type) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(verifiedStorageKey(docId, type), (/* @__PURE__ */ new Date()).toISOString());
	} catch {}
}
function GeneratedResult({ type, content, docTitle, docId, onDelete }) {
	const previewRef = (0, import_react.useRef)(null);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	const [verified, setVerified] = (0, import_react.useState)(() => isAlreadyVerified(docId, type));
	const qcRef = useQueryClient();
	const delGenFn = useServerFn(deleteGeneration);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const handleDelete = async () => {
		if (!confirm(`Delete this ${OUTPUT_LABELS[type].label} PDF? This removes it from history too.`)) return;
		setDeleting(true);
		try {
			const latest = (qcRef.getQueryData(["generations", docId]) || []).filter((r) => r.output_type === type).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
			if (latest?.id) {
				await delGenFn({ data: { id: latest.id } });
				qcRef.invalidateQueries({ queryKey: ["generations", docId] });
			}
			try {
				window.localStorage.removeItem(verifiedStorageKey(docId, type));
			} catch {}
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.success("Deleted");
			onDelete?.();
		} catch (e) {
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.error(e instanceof Error ? e.message : "Delete failed");
		} finally {
			setDeleting(false);
		}
	};
	const handleVerify = async () => {
		if (!previewRef.current) return;
		if (verified) {
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.success("Already verified ✓ — sent to history. Download will not re-verify.");
			return;
		}
		setVerifying(true);
		try {
			const { verifyPreviewExport } = await import("./preview-pdf-Cet6mvkM.mjs").then((n) => n.n);
			const report = await verifyPreviewExport(previewRef.current);
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			if (report.ok) {
				markVerified(docId, type);
				setVerified(true);
				toast.success(`Verified ✓ ${report.pages} page${report.pages === 1 ? "" : "s"}, ${Math.round(report.coverageRatio * 100)}% content coverage.`);
			} else toast.error(`Verify export found ${report.issues.length} issue(s)`, { description: report.issues.join(" ") });
		} catch (e) {
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.error(e instanceof Error ? e.message : "Verification failed.");
		} finally {
			setVerifying(false);
		}
	};
	const handleDownload = async () => {
		if (!previewRef.current) return;
		setExporting(true);
		try {
			const { downloadPreviewAsPdf } = await import("./preview-pdf-Cet6mvkM.mjs").then((n) => n.n);
			const shouldVerify = !verified;
			const report = await downloadPreviewAsPdf(previewRef.current, `${docTitle}-${OUTPUT_LABELS[type].label}`, { verifyBefore: shouldVerify });
			if (shouldVerify) {
				markVerified(docId, type);
				setVerified(true);
			}
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.success(shouldVerify ? `Saved ${report.pages} page${report.pages === 1 ? "" : "s"} (verified ${Math.round(report.coverageRatio * 100)}%). Future downloads will skip verify.` : `Saved ${report.pages} page${report.pages === 1 ? "" : "s"} — used cached verification.`);
		} catch (e) {
			console.error("[download] failed", e);
			const { toast } = await import("../_libs/sonner.mjs").then((n) => n.n);
			toast.error(e instanceof Error ? e.message : "Could not export PDF.", { description: "Open the preview, scroll to top, and try again. The verifier blocks blank or partial PDFs." });
		} finally {
			setExporting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-lg border border-border bg-background p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
					className: "font-serif text-base font-semibold",
					children: [OUTPUT_LABELS[type].label, verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs font-normal text-emerald-600",
						children: "✓ Verified"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: handleVerify,
						disabled: verifying || exporting || verified,
						children: [verifying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-3.5 w-3.5 animate-spin" }) : null, verifying ? "Verifying…" : verified ? "Verified ✓" : "Verify export"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: handleDownload,
						disabled: exporting || verifying,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-3.5 w-3.5" }), exporting ? "Exporting…" : "Download PDF"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: previewRef,
				className: `mt-4 rounded-md border border-border ${type === "handwritten_notes" ? "" : "bg-paper p-5"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormattedOutput, {
					type,
					content
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: handleDelete,
					disabled: deleting || exporting || verifying,
					className: "border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800",
					children: [deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1.5 h-3.5 w-3.5" }), "Delete this PDF"]
				})
			})
		]
	});
}
function HistoryPdfButton({ type, content, docTitle }) {
	const previewRef = (0, import_react.useRef)(null);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const [showPreview, setShowPreview] = (0, import_react.useState)(false);
	async function handleDownload() {
		setShowPreview(true);
		setExporting(true);
		try {
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
			const node = previewRef.current;
			if (!node) throw new Error("Preview not ready.");
			node.scrollIntoView({
				block: "center",
				behavior: "auto"
			});
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
			const { downloadPreviewAsPdf } = await import("./preview-pdf-Cet6mvkM.mjs").then((n) => n.n);
			await downloadPreviewAsPdf(node, `${docTitle}-${OUTPUT_LABELS[type].label}`);
		} catch (e) {
			console.error("[history-download] failed", e);
			toast.error(e instanceof Error ? e.message : "Could not export PDF.");
		} finally {
			setExporting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "outline",
		onClick: handleDownload,
		disabled: exporting,
		children: [exporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), exporting ? "PDF…" : "PDF"]
	}), showPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-2 text-xs text-muted-foreground",
			children: "Rendering preview for export…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: previewRef,
			className: `rounded-md border border-border ${type === "handwritten_notes" ? "" : "bg-paper p-5"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormattedOutput, {
				type,
				content
			})
		})]
	})] });
}
function HandwrittenNotebook({ content }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-md shadow-inner",
		style: {
			fontFamily: "Caveat, \"Comic Sans MS\", cursive",
			color: "#1a2a6c",
			backgroundImage: "linear-gradient(to bottom, transparent 0, transparent 30px, #a9c7e8 30px, #a9c7e8 31px, transparent 31px), linear-gradient(to right, transparent 0, transparent 56px, #e89393 56px, #e89393 57px, transparent 57px)",
			backgroundSize: "100% 32px, 100% 100%",
			backgroundColor: "#fdfcf7"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-16 py-8",
			style: { paddingLeft: 72 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
					style: {
						fontFamily: "Caveat, cursive",
						fontSize: 36,
						fontWeight: 700,
						color: "#b8860b",
						lineHeight: "32px",
						margin: 0,
						transform: "rotate(-1deg)"
					},
					children: content.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontSize: 22,
						lineHeight: "32px",
						marginTop: 8
					},
					children: content.intro
				}),
				(content.sections || []).map((section, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: 24 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
							style: {
								fontFamily: "Kalam, Caveat, cursive",
								fontSize: 26,
								fontWeight: 700,
								color: "#7a1e1e",
								lineHeight: "32px",
								margin: 0,
								textDecoration: "underline",
								textDecorationColor: "#d4a857",
								textUnderlineOffset: 4
							},
							children: [
								index + 1,
								". ",
								section.heading
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								fontSize: 21,
								lineHeight: "32px",
								margin: 0,
								whiteSpace: "pre-wrap"
							},
							children: section.body
						}),
						!!section.callouts?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: 12,
								marginTop: 12
							},
							children: section.callouts.map((c, ci) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: {
											warning: "#ffd1d1",
											tip: "#d6f5d6",
											fact: "#fff3a3",
											insight: "#cfe5ff"
										}[String(c.kind).toLowerCase()] || "#fff3a3",
										padding: "10px 14px",
										maxWidth: 280,
										fontSize: 19,
										lineHeight: "26px",
										boxShadow: "2px 3px 0 rgba(0,0,0,0.08)",
										transform: `rotate(${ci % 2 === 0 ? -1.5 : 1.5}deg)`
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										style: {
											textTransform: "uppercase",
											fontSize: 14,
											letterSpacing: 1
										},
										children: [c.kind, ": "]
									}), c.text]
								}, ci);
							})
						}),
						!!section.mnemonics?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								fontSize: 20,
								lineHeight: "32px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									background: "linear-gradient(transparent 55%, #fff59d 55%)",
									fontWeight: 700
								},
								children: "★ Mnemonics:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								style: {
									margin: "4px 0 0 24px",
									padding: 0
								},
								children: section.mnemonics.map((m, mi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: m }, mi))
							})]
						}),
						!!section.value_add?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								fontSize: 20,
								lineHeight: "32px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									background: "linear-gradient(transparent 55%, #b9f6ca 55%)",
									fontWeight: 700
								},
								children: "➤ UPSC Value Add:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								style: {
									margin: "4px 0 0 24px",
									padding: 0
								},
								children: section.value_add.map((v, vi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: v }, vi))
							})]
						})
					]
				}, index)),
				content.conclusion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					style: {
						marginTop: 24,
						fontSize: 22,
						lineHeight: "32px",
						borderTop: "2px dashed #b8860b",
						paddingTop: 12
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						style: { color: "#7a1e1e" },
						children: "Conclusion ~ "
					}), content.conclusion]
				})
			]
		})
	});
}
function FormattedOutput({ type, content }) {
	if (type === "handwritten_notes") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandwrittenNotebook, { content });
	if (type === "infographics") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfographicsViewer, { content });
	if (type === "newspaper") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewspaperIssue, { content });
	if (type === "short_notes") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
				className: "font-serif text-xl font-semibold",
				children: content.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyBlock, {
				label: "Definition",
				value: content.definition
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
				title: "Key Facts",
				items: content.key_facts
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyBlock, {
				label: "PYQ Relevance",
				value: content.pyq_relevance
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyBlock, {
				label: "UPSC Relevance",
				value: content.upsc_relevance
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
				title: "Keywords",
				items: content.keywords,
				compact: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
				title: "Examples",
				items: content.examples
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
				title: "Revision Tips",
				items: content.revision_tips
			})
		]
	});
	if (type === "prelims_mcqs") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "font-serif text-xl font-semibold",
			children: content.title
		}), (content.questions || []).map((question, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-md border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
					className: "font-serif font-semibold",
					children: [
						"Q",
						index + 1,
						". ",
						question.stem
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 grid gap-2 text-sm",
					type: "A",
					children: (question.options || []).map((option, optionIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "ml-5 pl-1",
						children: option
					}, optionIndex))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm font-semibold",
					children: ["Answer: ", String.fromCharCode(65 + Number(question.answer_index || 0))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-6 text-muted-foreground",
					children: question.explanation
				})
			]
		}, index))]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "font-serif text-xl font-semibold",
			children: content.title
		}), (content.questions || []).map((question, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-md border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: question.gs_paper }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [question.marks, " marks"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [question.word_limit, " words"] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
					className: "mt-2 font-serif font-semibold",
					children: [
						"Q",
						index + 1,
						". ",
						question.question
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
					title: "Intro",
					items: question.intro_points
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
					title: "Body",
					items: question.body_points
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
					title: "Conclusion",
					items: question.conclusion_points
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
					title: "Keywords",
					items: question.keywords,
					compact: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
					title: "Value Add",
					items: question.value_add
				})
			]
		}, index))]
	});
}
function KeyBlock({ label, value }) {
	if (!value) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h6", {
		className: "font-serif font-semibold text-primary",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm leading-6",
		children: value
	})] });
}
function BulletList({ title, items, compact = false }) {
	if (!items?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h6", {
			className: "font-serif font-semibold text-primary",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: compact ? "mt-2 flex flex-wrap gap-2" : "mt-2 list-disc space-y-1 pl-5 text-sm leading-6",
			children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: compact ? "rounded-md border border-border px-2 py-1 text-xs" : void 0,
				children: item
			}, index))
		})]
	});
}
var THEME_BG = {
	indigo: {
		bar: "#1a1f3a",
		soft: "#eef0fa",
		text: "#1a1f3a",
		accent: "#d4a857"
	},
	gold: {
		bar: "#8c6212",
		soft: "#fdf6e3",
		text: "#5c3f06",
		accent: "#1a1f3a"
	},
	rose: {
		bar: "#9d2b4d",
		soft: "#fdeaf0",
		text: "#5c1024",
		accent: "#d4a857"
	},
	emerald: {
		bar: "#1a6e51",
		soft: "#e3f7ed",
		text: "#0d3a2a",
		accent: "#d4a857"
	},
	amber: {
		bar: "#a5750f",
		soft: "#fff4d6",
		text: "#3d2a04",
		accent: "#1a6e51"
	},
	teal: {
		bar: "#0f6671",
		soft: "#dff3f5",
		text: "#08323a",
		accent: "#d4a857"
	},
	violet: {
		bar: "#612b8c",
		soft: "#f3eafa",
		text: "#2f0f4a",
		accent: "#d4a857"
	}
};
function InfographicsViewer({ content }) {
	const pages = Array.isArray(content?.pages) ? content.pages : [];
	if (!pages.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-4 text-sm text-muted-foreground",
		children: "No infographic pages generated."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
				className: "font-serif text-xl font-semibold",
				children: content.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				children: [
					pages.length,
					" infographic",
					pages.length === 1 ? "" : "s"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children: pages.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfographicCard, {
				page: p,
				index: i + 1,
				total: pages.length
			}, i))
		})]
	});
}
function InfographicCard({ page, index, total }) {
	const theme = THEME_BG[page.color] || THEME_BG.indigo;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "overflow-hidden rounded-lg border border-border bg-white shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			style: {
				background: theme.bar,
				color: "white"
			},
			className: "px-5 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-[11px] uppercase tracking-wider opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (page.layout || "summary").toUpperCase() }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						index,
						" / ",
						total
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h6", {
					className: "mt-1 font-serif text-lg font-bold",
					children: [page.topic, page.total_parts > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-sm opacity-80",
						children: [
							"(Part ",
							page.part,
							"/",
							page.total_parts,
							")"
						]
					}) : null]
				}),
				page.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs italic opacity-90",
					children: page.subtitle
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: (page.sections || []).map((s, si) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border-l-4 bg-white p-3",
						style: {
							borderColor: theme.bar,
							background: theme.soft
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-serif font-semibold",
							style: { color: theme.text },
							children: s.heading
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 list-disc space-y-0.5 pl-4 text-xs leading-5",
							style: { color: theme.text },
							children: (s.points || []).map((pt, pi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: pt }, pi))
						})]
					}, si))
				}),
				(page.key_facts || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-1.5",
					children: page.key_facts.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded border px-2 py-0.5 text-[11px]",
						style: {
							borderColor: theme.bar,
							color: theme.text,
							background: theme.soft
						},
						children: f
					}, i))
				}),
				page.mnemonic && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-md px-3 py-2 text-sm font-semibold",
					style: {
						background: theme.accent,
						color: "white"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-wider opacity-90",
						children: "Mnemonic · "
					}), page.mnemonic]
				}),
				page.takeaway && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-md border-l-4 bg-paper px-3 py-2 text-sm",
					style: {
						borderColor: theme.accent,
						color: theme.text
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold uppercase tracking-wider",
						children: "Key Takeaway · "
					}), page.takeaway]
				}),
				(page.pyq_link || page.current_affairs) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-3 text-[11px] italic text-muted-foreground",
					children: [page.pyq_link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["PYQ: ", page.pyq_link] }), page.current_affairs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["CA: ", page.current_affairs] })]
				})
			]
		})]
	});
}
function HistoryPanel({ documentId, docTitle, onOpen }) {
	const qc = useQueryClient();
	const listFn = useServerFn(listGenerations);
	const delFn = useServerFn(deleteGeneration);
	const [open, setOpen] = (0, import_react.useState)(false);
	const histQ = useQuery({
		queryKey: ["generations", documentId],
		queryFn: () => listFn({ data: { documentId } }),
		enabled: open
	});
	const rows = (histQ.data || []).filter((r) => OUTPUT_TYPES.includes(r.output_type));
	async function remove(id) {
		try {
			await delFn({ data: { id } });
			toast.success("Deleted from history");
			qc.invalidateQueries({ queryKey: ["generations", documentId] });
		} catch (e) {
			toast.error(e?.message || "Delete failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-lg border border-border bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((o) => !o),
			className: "flex w-full items-center justify-between gap-2 px-4 py-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2 font-serif text-base font-semibold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-accent" }),
					"History",
					rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "ml-1",
						children: rows.length
					})
				]
			}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border p-4",
			children: [
				histQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading history…"
				}),
				!histQ.isLoading && rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No past generations for this document yet."
				}),
				rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: rows.map((r) => {
						const label = OUTPUT_LABELS[r.output_type]?.label ?? r.output_type;
						const when = new Date(r.created_at).toLocaleString();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm",
										children: r.title || docTitle
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: when
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => onOpen(r.output_type, r.content),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1.5 h-3.5 w-3.5" }), " View"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPdfButton, {
										type: r.output_type,
										content: r.content,
										docTitle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => remove(r.id),
										"aria-label": "Delete",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								]
							})]
						}, r.id);
					})
				})
			]
		})]
	});
}
//#endregion
export { Dashboard as component };
