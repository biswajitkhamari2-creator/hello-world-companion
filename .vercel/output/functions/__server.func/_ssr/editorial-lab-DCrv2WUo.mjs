import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { Ct as ChevronsDownUp, Dt as ChevronDown, F as Palette, G as ListChecks, L as Newspaper, M as PenLine, O as RefreshCw, Pt as Brain, Rt as BookOpen, St as ChevronsUpDown, W as LoaderCircle, Y as Layers, _ as Square, bt as CircleQuestionMark, d as Trash2, f as Target, lt as FileText, mt as Download, n as X, q as Lightbulb, u as TriangleAlert, ut as FilePen, v as SquareCheckBig, wt as ChevronUp, y as Sparkles } from "../_libs/lucide-react.mjs";
import { ct as objectType, lt as stringType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { r as deleteDocument } from "./documents.functions-RRwEEipk.mjs";
import { n as deleteInboxItem } from "./telegram-inbox.functions-Z2cjJrpK.mjs";
import { t as Card } from "./card-Bav9nr75.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editorial-lab-DCrv2WUo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var listInboxNewspapers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("bf2f2a51eabf1972b4802a1db319f1db1c49e0eb2a55f3bf155bcc0859711eb8"));
var listEditorials = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("1da673cdad932c328d7c107d7bbbbfcd4bcdfa5fcc220da9aca953aae8e45e82"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("528d2f102251903527a97fd8f0a7bf104c0e49db726566ec8fe6c67b552eeac2"));
var deleteEditorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("3b8648c59f4edf77c2c5e3747d523608f0b66343ad3cd774950208c633cca859"));
var removeEditorialPiece = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	id: stringType().uuid(),
	index: numberType().int().min(0)
}).parse(d)).handler(createSsrRpc("91afd803edd6ec146e707970c14ff92fef35693bc7df9db64e8eece6572c497e"));
var analyseEditorialFromInbox = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ inboxId: stringType().uuid() }).parse(d)).handler(createSsrRpc("014b6d3319e7c1cc598de3764b3ffbf0f7e47d9570f8d687dc5aaec1db0d9024"));
var _mermaid = null;
async function getMermaid() {
	if (!_mermaid) {
		_mermaid = (await import("../_libs/mermaid+[...].mjs").then((n) => n.t)).default;
		_mermaid.initialize({
			startOnLoad: false,
			theme: "default",
			securityLevel: "loose"
		});
	}
	return _mermaid;
}
function EditorialLabPage() {
	const listPdfs = useServerFn(listInboxNewspapers);
	const listNotes = useServerFn(listEditorials);
	const analyse = useServerFn(analyseEditorialFromInbox);
	const remove = useServerFn(deleteEditorial);
	const removePdf = useServerFn(deleteInboxItem);
	const removeDoc = useServerFn(deleteDocument);
	const qc = useQueryClient();
	const pdfsQ = useQuery({
		queryKey: ["editorial-lab", "pdfs"],
		queryFn: () => listPdfs(),
		refetchInterval: 12e4
	});
	const notesQ = useQuery({
		queryKey: ["editorial-lab", "notes"],
		queryFn: () => listNotes()
	});
	const analyseMut = useMutation({
		mutationFn: (inboxId) => analyse({ data: { inboxId } }),
		onSuccess: (r) => {
			toast.success(`Editorial extracted — ${r.editorialCount} pieces saved`);
			qc.invalidateQueries({ queryKey: ["editorial-lab"] });
		},
		onError: (e) => toast.error(e?.message ?? "Failed to analyse editorial")
	});
	const deleteMut = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: () => {
			toast.success("Deleted");
			qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
		},
		onError: (e) => toast.error(e?.message ?? "Delete failed")
	});
	const deletePdfMut = useMutation({
		mutationFn: ({ id, source }) => source === "documents" ? removeDoc({ data: { id } }) : removePdf({ data: { itemId: id } }),
		onSuccess: () => {
			toast.success("Newspaper removed from inbox");
			qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
		},
		onError: (e) => toast.error(e?.message ?? "Delete failed")
	});
	const notes = notesQ.data ?? [];
	const now = Date.now();
	const recent = notes.filter((r) => {
		const t = new Date(r.created_at || 0).getTime();
		return now - t < 4320 * 60 * 1e3;
	});
	const history = notes.filter((r) => !recent.includes(r));
	const [pdfSel, setPdfSel] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [noteSel, setNoteSel] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [bulkBusy, setBulkBusy] = (0, import_react.useState)(false);
	const [expandAll, setExpandAll] = (0, import_react.useState)(true);
	const [expandSignal, setExpandSignal] = (0, import_react.useState)(0);
	const toggleExpandAll = () => {
		setExpandAll((v) => {
			const next = !v;
			setExpandSignal((s) => s + 1);
			return next;
		});
	};
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const refreshAll = async () => {
		setRefreshing(true);
		try {
			await Promise.all([qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] }), qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] })]);
			toast.success("Refreshed");
		} catch (e) {
			toast.error(e?.message ?? "Refresh failed");
		} finally {
			setRefreshing(false);
		}
	};
	const [squashing, setSquashing] = (0, import_react.useState)(false);
	const findDuplicateGroups = () => {
		const rows = pdfsQ.data ?? [];
		const normalize = (s) => String(s || "").toLowerCase().replace(/\.pdf$/, "").replace(/[\s._-]+/g, " ").trim();
		const groups = /* @__PURE__ */ new Map();
		for (const r of rows) {
			const key = `${normalize(r.file_name || r.caption)}|${r.size_bytes ?? ""}`;
			if (!key.startsWith("|")) {
				const arr = groups.get(key) ?? [];
				arr.push(r);
				groups.set(key, arr);
			}
		}
		const dupes = [];
		for (const arr of groups.values()) {
			if (arr.length < 2) continue;
			arr.sort((a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
			dupes.push(...arr.slice(1));
		}
		return dupes;
	};
	const squashDuplicates = async () => {
		const dupes = findDuplicateGroups();
		if (dupes.length === 0) {
			toast.info("No duplicate newspapers found");
			return;
		}
		if (!confirm(`Trash ${dupes.length} duplicate ${dupes.length === 1 ? "PDF" : "PDFs"}? The oldest copy of each will be kept.`)) return;
		setSquashing(true);
		let ok = 0;
		let fail = 0;
		for (const d of dupes) try {
			if (d.source === "documents") await removeDoc({ data: { id: d.id } });
			else await removePdf({ data: { itemId: d.id } });
			ok++;
		} catch {
			fail++;
		}
		setSquashing(false);
		await qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
		if (fail === 0) toast.success(`Squashed ${ok} duplicate ${ok === 1 ? "PDF" : "PDFs"}`);
		else toast.warning(`Squashed ${ok}, ${fail} failed`);
	};
	const togglePdf = (id) => setPdfSel((prev) => {
		const n = new Set(prev);
		n.has(id) ? n.delete(id) : n.add(id);
		return n;
	});
	const toggleNote = (id) => setNoteSel((prev) => {
		const n = new Set(prev);
		n.has(id) ? n.delete(id) : n.add(id);
		return n;
	});
	const bulkDeletePdfs = async () => {
		if (pdfSel.size === 0) return;
		if (!confirm(`Delete ${pdfSel.size} newspaper(s) from the Telegram inbox?`)) return;
		setBulkBusy(true);
		try {
			const pdfs = pdfsQ.data ?? [];
			await Promise.all(Array.from(pdfSel).map((id) => {
				return pdfs.find((p) => p.id === id)?.source === "documents" ? removeDoc({ data: { id } }) : removePdf({ data: { itemId: id } });
			}));
			toast.success(`${pdfSel.size} newspaper(s) deleted`);
			setPdfSel(/* @__PURE__ */ new Set());
			qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
		} catch (e) {
			toast.error(e?.message ?? "Bulk delete failed");
		} finally {
			setBulkBusy(false);
		}
	};
	const bulkDeleteNotes = async () => {
		if (noteSel.size === 0) return;
		if (!confirm(`Delete ${noteSel.size} editorial(s)? This cannot be undone.`)) return;
		setBulkBusy(true);
		try {
			await Promise.all(Array.from(noteSel).map((id) => remove({ data: { id } })));
			toast.success(`${noteSel.size} editorial(s) deleted`);
			setNoteSel(/* @__PURE__ */ new Set());
			qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
		} catch (e) {
			toast.error(e?.message ?? "Bulk delete failed");
		} finally {
			setBulkBusy(false);
		}
	};
	const now2 = /* @__PURE__ */ new Date();
	const vol = `Vol. ${String(now2.getMonth() + 1).padStart(2, "0")} / ${now2.getFullYear()}`;
	const totalPdfs = (pdfsQ.data ?? []).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl bg-[#faf7f2] text-stone-800 dark:bg-[#1a1815] dark:text-stone-200 sm:border-x sm:border-stone-200/70 sm:dark:border-stone-800/70",
		style: { fontFamily: "\"Inter\", ui-sans-serif, system-ui, sans-serif" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b-2 border-stone-700/80 px-5 pt-7 pb-5 dark:border-stone-300/70 sm:px-8 sm:pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-[34px] font-bold italic leading-none tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl",
						style: { fontFamily: "\"Playfair Display\", ui-serif, Georgia, serif" },
						children: ["Editorial ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "not-italic",
							children: "Lab"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pb-1 text-[10px] uppercase tracking-widest opacity-60",
						style: { fontFamily: "\"JetBrains Mono\", ui-monospace, monospace" },
						children: vol
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/80 dark:text-amber-200/70",
					children: "Automated Research & Synthesis · Gemini 2.5 Pro"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pb-32",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between px-5 sm:px-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 animate-pulse rounded-full bg-blue-600" }), "Telegram Inbox"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: refreshAll,
										disabled: refreshing,
										className: "inline-flex items-center gap-1 border border-stone-300/70 bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 hover:bg-white disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-900",
										title: "Check for new newspapers",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3 " + (refreshing ? "animate-spin" : "") }), refreshing ? "Checking" : "Refresh"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: squashDuplicates,
										disabled: squashing || pdfsQ.isLoading,
										className: "inline-flex items-center gap-1 border border-amber-700/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-900 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-300/40 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60",
										title: "Trash duplicate PDFs, keep the oldest of each",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3 w-3 " + (squashing ? "animate-pulse" : "") }), squashing ? "Squashing" : "Squash dupes"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "border border-stone-300/70 bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-stone-600 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300",
										style: { fontFamily: "\"JetBrains Mono\", ui-monospace, monospace" },
										children: [
											totalPdfs,
											" ",
											totalPdfs === 1 ? "Pdf" : "Pdfs"
										]
									}),
									totalPdfs > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											const all = (pdfsQ.data ?? []).map((p) => p.id);
											setPdfSel((prev) => prev.size === all.length ? /* @__PURE__ */ new Set() : new Set(all));
										},
										className: "text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 opacity-70 hover:opacity-100",
										children: pdfSel.size === totalPdfs ? "Clear" : "Select all"
									})
								]
							})]
						}), pdfsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-5 flex items-center gap-2 border border-stone-200 bg-white p-3 text-[13px] text-stone-500 dark:border-stone-800 dark:bg-[#22201d] sm:mx-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
						}) : totalPdfs === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-5 border border-dashed border-stone-300 bg-white/60 p-6 text-center text-[13px] text-stone-500 dark:border-stone-700 dark:bg-[#22201d]/60 sm:mx-8",
							children: "No newspapers yet. Forward today's edition to the bot."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-px border-y border-stone-200 bg-stone-200/80 dark:border-stone-800 dark:bg-stone-800/70",
							children: (pdfsQ.data ?? []).map((p) => {
								const busy = analyseMut.isPending && analyseMut.variables === p.id;
								const delBusy = deletePdfMut.isPending && deletePdfMut.variables?.id === p.id;
								const selected = pdfSel.has(p.id);
								const linked = notes.find((n) => n.inbox_id === p.id) || null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-4 px-5 py-4 sm:px-8 " + (selected ? "bg-amber-50/70 ring-1 ring-inset ring-amber-700/60 dark:bg-stone-800/60 dark:ring-amber-200/40" : "bg-white dark:bg-[#22201d]"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => togglePdf(p.id),
										className: "relative grid h-10 w-10 shrink-0 place-items-center border transition-colors " + (selected ? "border-amber-700 bg-amber-700 text-white dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900" : "border-stone-400 text-stone-600 bg-transparent dark:border-stone-500 dark:text-stone-300"),
										"aria-label": selected ? "Unselect" : "Select",
										title: selected ? "Unselect" : "Select",
										children: [selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, {
											className: "h-5 w-5",
											strokeWidth: 2.5
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, {
											className: "h-5 w-5",
											strokeWidth: 1.5
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-amber-700 dark:border-[#22201d] dark:bg-amber-300" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "min-w-0 flex-1 truncate pr-2 text-sm font-semibold",
													children: p.file_name || p.caption || "Newspaper"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => {
														if (confirm("Delete this newspaper?")) deletePdfMut.mutate({
															id: p.id,
															source: p.source
														});
													},
													disabled: delBusy,
													className: "shrink-0 text-stone-300 hover:text-rose-600 disabled:opacity-40 dark:text-stone-700 dark:hover:text-rose-400",
													"aria-label": "Delete newspaper",
													title: "Delete",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
														className: "h-4 w-4",
														strokeWidth: 2
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex items-center gap-2 text-[10px] uppercase text-stone-500 dark:text-stone-400",
												style: { fontFamily: "\"JetBrains Mono\", ui-monospace, monospace" },
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatShortDate(p.posted_at) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "opacity-30",
														children: "|"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.size_bytes ? (p.size_bytes / 1024 / 1024).toFixed(1) + " MB" : "—" }),
													p.drive_view_link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "opacity-30",
														children: "|"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														href: p.drive_view_link,
														target: "_blank",
														rel: "noreferrer",
														className: "underline text-amber-800 dark:text-amber-200",
														children: "Open"
													})] }),
													p.status && p.status !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "opacity-30",
														children: "|"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-amber-800 dark:text-amber-200",
														children: String(p.status)
													})] })
												]
											}),
											p.error_message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs leading-relaxed text-rose-700 dark:text-rose-300",
												children: p.error_message
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxRowActions, {
												pdfId: p.id,
												busy,
												linked,
												onExtract: () => analyseMut.mutateAsync(p.id)
											})
										]
									})]
								}, p.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex items-baseline justify-between px-5 sm:px-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-[11px] font-bold uppercase tracking-widest",
									children: "Recent Extracts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] uppercase tracking-widest opacity-60",
											style: { fontFamily: "\"JetBrains Mono\", ui-monospace, monospace" },
											children: ["3d · ", recent.length]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: toggleExpandAll,
											className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 opacity-70 hover:opacity-100",
											title: expandAll ? "Collapse all" : "Expand all",
											children: [expandAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsDownUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "h-3 w-3" }), expandAll ? "Collapse all" : "Expand all"]
										}),
										recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												const ids = recent.map((r) => r.id);
												const allSelected = ids.every((id) => noteSel.has(id));
												setNoteSel((prev) => {
													const n = new Set(prev);
													if (allSelected) ids.forEach((id) => n.delete(id));
													else ids.forEach((id) => n.add(id));
													return n;
												});
											},
											className: "text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 opacity-70 hover:opacity-100",
											children: recent.every((r) => noteSel.has(r.id)) ? "Clear" : "Select all"
										})
									]
								})]
							}),
							notesQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-5 text-[13px] text-stone-500 sm:px-8",
								children: "Loading…"
							}),
							!notesQ.isLoading && recent.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-5 border border-dashed border-stone-300 bg-white/50 p-6 text-center text-[13px] text-stone-500 dark:border-stone-700 dark:bg-[#121212]/50 sm:mx-8",
								children: [
									"No recent editorials. Hit ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold",
										children: "Extract"
									}),
									" on any inbox PDF above."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3 px-5 sm:px-8",
								children: recent.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialCard, {
									row,
									onDelete: () => deleteMut.mutate(row.id),
									selected: noteSel.has(row.id),
									onToggleSelect: () => toggleNote(row.id),
									openSignal: expandSignal,
									openTarget: expandAll
								}, row.id))
							})
						]
					}),
					history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 px-5 sm:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistorySection, {
							items: history,
							onDelete: (id) => deleteMut.mutate(id),
							selected: noteSel,
							onToggleSelect: toggleNote,
							openSignal: expandSignal,
							openTarget: expandAll
						})
					})
				]
			}),
			(pdfSel.size > 0 || noteSel.size > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 sm:bottom-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full max-w-[380px] items-center justify-between gap-3 rounded-md border border-stone-800/40 bg-stone-800 px-5 py-3 text-stone-50 shadow-2xl dark:border-stone-100/30 dark:bg-stone-100 dark:text-stone-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-widest opacity-60",
							style: { fontFamily: "\"JetBrains Mono\", ui-monospace, monospace" },
							children: "Selected"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold",
							children: [
								pdfSel.size + noteSel.size,
								" ",
								pdfSel.size + noteSel.size === 1 ? "Item" : "Items"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setPdfSel(/* @__PURE__ */ new Set());
								setNoteSel(/* @__PURE__ */ new Set());
							},
							className: "grid h-9 w-9 place-items-center border border-white/20 text-white/70 hover:text-white dark:border-black/20 dark:text-black/60 dark:hover:text-black",
							"aria-label": "Clear selection",
							title: "Clear",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: async () => {
								if (pdfSel.size > 0) await bulkDeletePdfs();
								if (noteSel.size > 0) await bulkDeleteNotes();
							},
							disabled: bulkBusy,
							className: "inline-flex items-center gap-1.5 bg-red-600 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-red-700 disabled:opacity-60",
							children: [bulkBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), "Delete Bulk"]
						})]
					})]
				})
			})
		]
	}) });
}
function formatShortDate(iso) {
	try {
		return new Date(iso).toLocaleDateString(void 0, {
			month: "short",
			day: "2-digit"
		}).toUpperCase();
	} catch {
		return "—";
	}
}
function HistorySection({ items, onDelete, selected, onToggleSelect, openSignal, openTarget }) {
	const [open, setOpen] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setOpen(openTarget);
	}, [openSignal, openTarget]);
	const groups = items.reduce((acc, r) => {
		const key = (r.edition_date || r.created_at || "").slice(0, 7) || "older";
		(acc[key] ||= []).push(r);
		return acc;
	}, {});
	const keys = Object.keys(groups).sort().reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((v) => !v),
			className: "flex w-full items-center gap-2 rounded-2xl border bg-card/60 px-3 py-2.5 text-left shadow-sm backdrop-blur hover:bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4 text-indigo-500" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: "History"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-muted-foreground",
					children: [
						"· ",
						items.length,
						" archived"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-muted-foreground",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 space-y-6",
			children: keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: formatMonth(k)
				}), groups[k].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialCard, {
					row,
					onDelete: () => onDelete(row.id),
					selected: selected.has(row.id),
					onToggleSelect: () => onToggleSelect(row.id),
					openSignal,
					openTarget
				}, row.id))]
			}, k))
		})]
	});
}
function formatMonth(k) {
	if (!/^\d{4}-\d{2}$/.test(k)) return "Older";
	const [y, m] = k.split("-").map(Number);
	return new Date(y, m - 1, 1).toLocaleDateString(void 0, {
		month: "long",
		year: "numeric"
	});
}
function EditorialCard({ row, onDelete, selected, onToggleSelect, openSignal, openTarget }) {
	const items = row.analysis?.editorials ?? [];
	const [open, setOpen] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (typeof openTarget === "boolean") setOpen(openTarget);
	}, [openSignal, openTarget]);
	const [dlBusy, setDlBusy] = (0, import_react.useState)(null);
	const removePiece = useServerFn(removeEditorialPiece);
	const qc = useQueryClient();
	const pieceDeleteMut = useMutation({
		mutationFn: (index) => removePiece({ data: {
			id: row.id,
			index
		} }),
		onSuccess: () => {
			toast.success("Editorial removed");
			qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
		},
		onError: (e) => toast.error(e?.message ?? "Delete failed")
	});
	const baseName = `${(row.newspaper || "Editorial").replace(/[^\w-]+/g, "_")}_${row.edition_date || row.created_at?.slice(0, 10) || "notes"}`;
	const downloadMd = () => {
		const md = buildEditorialMarkdown(row);
		triggerDownload(new Blob([md], { type: "text/markdown;charset=utf-8" }), `${baseName}.md`);
	};
	const downloadPdf = async () => {
		try {
			setDlBusy("pdf");
			const { editorialsToPdf } = await import("./editorial-pdf-DIxUl8rv.mjs");
			triggerDownload(await editorialsToPdf(row), `${baseName}.pdf`);
		} catch (e) {
			toast.error(e?.message ?? "PDF export failed");
		} finally {
			setDlBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden transition " + (selected ? "ring-2 ring-indigo-400" : ""),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-4 sm:p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full items-start gap-2 text-left",
				children: [onToggleSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onToggleSelect,
					className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-background/60 text-muted-foreground hover:text-indigo-500",
					"aria-label": selected ? "Unselect" : "Select",
					title: selected ? "Unselect" : "Select",
					children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-4 w-4 text-indigo-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-4 w-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen((v) => !v),
					className: "flex min-w-0 flex-1 items-start justify-between gap-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:truncate sm:text-[11px]",
							children: [
								row.newspaper || "Newspaper",
								" · ",
								row.edition_date || row.created_at?.slice(0, 10)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 break-words font-serif text-[20px] font-bold leading-tight sm:mt-0 sm:truncate sm:text-lg sm:font-semibold",
							children: [
								row.source_label || "Editorial batch",
								" · ",
								items.length,
								" pieces"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "shrink-0 rounded-full border bg-background/60 p-2 text-muted-foreground",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-5 w-5" })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:mt-3 sm:flex sm:flex-wrap sm:items-center sm:justify-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: downloadMd,
						className: "inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-indigo-500 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs",
						"aria-label": "Download markdown",
						title: "Download as Markdown (.md)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5 sm:h-4 sm:w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Markdown" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							if (dlBusy) return;
							downloadPdf();
						},
						className: "inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-indigo-500 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs",
						"aria-label": "Download PDF",
						title: "Download as PDF",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5 sm:h-4 sm:w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dlBusy === "pdf" ? "Working…" : "PDF" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onDelete,
						className: "col-span-2 inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-rose-500 sm:col-span-1 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs",
						"aria-label": "Delete",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5 sm:h-4 sm:w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
					})
				]
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 border-t p-4 sm:space-y-5 sm:p-5",
			children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "No editorial pages were detected in this PDF."
			}), items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialPiece, {
				item: it,
				idx: i,
				rowId: row.id,
				rowMeta: {
					newspaper: row.newspaper,
					edition_date: row.edition_date,
					created_at: row.created_at
				},
				onDeletePiece: () => {
					if (confirm("Delete this editorial from history?")) pieceDeleteMut.mutate(i);
				}
			}, i))]
		})]
	});
}
function triggerDownload(blob, filename) {
	import("./downloads-store-CplUgcTw.mjs").then(({ saveAndDownload }) => saveAndDownload(blob, filename, { source: "editorial-lab" }));
}
function buildEditorialMarkdown(row) {
	const items = row.analysis?.editorials ?? [];
	const lines = [];
	lines.push(`# ${row.newspaper || "Newspaper"} — Editorial Notes`);
	lines.push(`*${row.edition_date || row.created_at?.slice(0, 10) || ""} · ${items.length} editorials · UPSC Genius AI*`);
	lines.push("");
	items.forEach((it, i) => {
		lines.push(`## ${i + 1}. ${it.title}`);
		lines.push(`**Syllabus:** ${it.syllabus.stage} · ${it.syllabus.paper} · ${it.syllabus.subject} · ${it.syllabus.topic}${it.syllabus.subTopic ? ` · ${it.syllabus.subTopic}` : ""}  `);
		lines.push(`**Importance:** ${it.importance}`);
		lines.push("");
		if (it.crispNotes?.length) {
			lines.push(`### Crisp Notes`);
			it.crispNotes.forEach((c) => lines.push(`- ${c}`));
			lines.push("");
		}
		if (it.comprehensiveNotes) {
			lines.push(`### Comprehensive Notes`);
			lines.push(it.comprehensiveNotes);
			lines.push("");
		}
		if (it.diagramMermaid) {
			lines.push(`### Diagram`);
			lines.push("```mermaid");
			lines.push(it.diagramMermaid);
			lines.push("```");
			lines.push("");
		}
		if (it.argumentsFor?.length) {
			lines.push(`### Arguments — For`);
			it.argumentsFor.forEach((x) => lines.push(`- ${x}`));
			lines.push("");
		}
		if (it.argumentsAgainst?.length) {
			lines.push(`### Arguments — Against`);
			it.argumentsAgainst.forEach((x) => lines.push(`- ${x}`));
			lines.push("");
		}
		if (it.keyFacts?.length) {
			lines.push(`### Key Facts`);
			it.keyFacts.forEach((f) => lines.push(`- ${f}`));
			lines.push("");
		}
		if (it.vocabulary?.length) {
			lines.push(`### Vocabulary`);
			it.vocabulary.forEach((v) => lines.push(`- **${v.word}** — ${v.meaning}`));
			lines.push("");
		}
		if (it.wayForward?.length) {
			lines.push(`### Way Forward`);
			it.wayForward.forEach((w) => lines.push(`- ${w}`));
			lines.push("");
		}
		if (it.pyqLinks?.length) {
			lines.push(`### PYQ Links`);
			it.pyqLinks.forEach((p) => lines.push(`- ${p.year ? `**${p.year}** ` : ""}${p.paper ? `(${p.paper}) ` : ""}${p.question}`));
			lines.push("");
		}
		if (it.probablePrelimsMCQ) {
			lines.push(`### Probable Prelims MCQ`);
			lines.push(it.probablePrelimsMCQ.q);
			it.probablePrelimsMCQ.options.forEach((o, j) => lines.push(`${j === it.probablePrelimsMCQ.answer ? "**✓** " : ""}${String.fromCharCode(65 + j)}. ${o}`));
			lines.push(`> ${it.probablePrelimsMCQ.explanation}`);
			lines.push("");
		}
		if (it.probableMainsQuestion) {
			lines.push(`### Probable Mains Question`);
			lines.push(`*${it.probableMainsQuestion.paper} · ${it.probableMainsQuestion.marks} marks*`);
			lines.push(it.probableMainsQuestion.q);
			lines.push(`> **Approach:** ${it.probableMainsQuestion.approach}`);
			lines.push("");
		}
		lines.push("---");
		lines.push("");
	});
	return lines.join("\n");
}
function EditorialPiece({ item, idx, rowId, rowMeta, onDeletePiece }) {
	const importanceTint = item.importance === "Very High" ? "bg-rose-500 text-white" : item.importance === "High" ? "bg-amber-500 text-white" : item.importance === "Medium" ? "bg-indigo-500 text-white" : "bg-muted text-foreground";
	const baseName = `${(item.title || "editorial").replace(/[^\w-]+/g, "_").slice(0, 60)}`;
	const downloadMindMap = async () => {
		if (!item.diagramMermaid) {
			toast.error("No mind map available for this editorial");
			return;
		}
		try {
			const { svg } = await (await getMermaid()).render(`mm-dl-${rowId}-${idx}`, item.diagramMermaid);
			triggerDownload(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${baseName}_mindmap.svg`);
		} catch (e) {
			toast.error(e?.message ?? "Mind map export failed");
		}
	};
	const downloadPyq = () => {
		const lines = [];
		lines.push(`# ${item.title} — PYQ & Probable Questions`);
		lines.push("");
		if (item.pyqLinks?.length) {
			lines.push(`## Previous Year Questions`);
			item.pyqLinks.forEach((p) => lines.push(`- ${p.year ? `**${p.year}** ` : ""}${p.paper ? `(${p.paper}) ` : ""}${p.question}`));
			lines.push("");
		}
		if (item.probablePrelimsMCQ) {
			lines.push(`## Probable Prelims MCQ`);
			lines.push(item.probablePrelimsMCQ.q);
			item.probablePrelimsMCQ.options.forEach((o, j) => lines.push(`${j === item.probablePrelimsMCQ.answer ? "**✓** " : ""}${String.fromCharCode(65 + j)}. ${o}`));
			lines.push(`> ${item.probablePrelimsMCQ.explanation}`);
			lines.push("");
		}
		if (item.probableMainsQuestion) {
			lines.push(`## Probable Mains Question`);
			lines.push(`*${item.probableMainsQuestion.paper} · ${item.probableMainsQuestion.marks} marks*`);
			lines.push(item.probableMainsQuestion.q);
			lines.push(`> **Approach:** ${item.probableMainsQuestion.approach}`);
		}
		if (!item.pyqLinks?.length && !item.probablePrelimsMCQ && !item.probableMainsQuestion) {
			toast.error("No PYQ / probable questions available");
			return;
		}
		triggerDownload(new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" }), `${baseName}_pyq.md`);
	};
	const downloadHandwritten = () => {
		const html = buildHandwrittenHtml(item, rowMeta);
		const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
		if (!w) {
			toast.error("Popup blocked — allow popups to save handwritten notes");
			return;
		}
		w.document.open();
		w.document.write(html);
		w.document.close();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border bg-card/60 p-4 sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "break-words font-serif text-[19px] font-bold leading-snug sm:text-lg sm:font-semibold",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-1.5 text-[12px] sm:mt-1 sm:text-[11px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: item.syllabus.stage
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.syllabus.paper }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									item.syllabus.subject,
									" · ",
									item.syllabus.topic,
									item.syllabus.subTopic ? ` · ${item.syllabus.subTopic}` : ""
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: importanceTint,
					children: item.importance
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: downloadMindMap,
						className: "inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-indigo-500",
						title: "Download Mind Map (SVG)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mind Map" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: downloadPyq,
						className: "inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-amber-600",
						title: "Download PYQ + probable questions (Markdown)",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PYQ" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: downloadHandwritten,
						className: "inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-fuchsia-600",
						title: "Open handwritten notes — use browser Print > Save as PDF",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Handwritten" })]
					}),
					onDeletePiece && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onDeletePiece,
						className: "inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-rose-600",
						title: "Delete this editorial from history",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
					})
				]
			}),
			item.crispNotes?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Crisp Notes",
				icon: ListChecks,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 text-[15px] leading-relaxed sm:text-sm",
					children: item.crispNotes.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", c] }, i))
				})
			}),
			item.comprehensiveNotes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Comprehensive Notes",
				icon: BookOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/85 sm:text-sm",
					children: item.comprehensiveNotes
				})
			}),
			item.diagramMermaid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Diagram",
				icon: Sparkles,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MermaidBlock, {
					code: item.diagramMermaid,
					id: `mmd-${rowId}-${idx}`
				})
			}),
			item.argumentsFor?.length || item.argumentsAgainst?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Arguments — For vs Against",
				icon: Target,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300",
							children: "For"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1 text-sm",
							children: item.argumentsFor?.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", x] }, i))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-rose-200/60 bg-rose-50/60 p-3 dark:border-rose-900/40 dark:bg-rose-950/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300",
							children: "Against"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1 text-sm",
							children: item.argumentsAgainst?.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", x] }, i))
						})]
					})]
				})
			}) : null,
			item.keyFacts?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Key Facts",
				icon: TriangleAlert,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: item.keyFacts.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", f] }, i))
				})
			}),
			item.vocabulary?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Vocabulary",
				icon: Lightbulb,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-1 text-sm sm:grid-cols-2",
					children: item.vocabulary.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-indigo-700 dark:text-indigo-300",
							children: v.word
						}),
						" —",
						" ",
						v.meaning
					] }, i))
				})
			}),
			item.wayForward?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Way Forward",
				icon: Sparkles,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: item.wayForward.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["→ ", w] }, i))
				})
			}),
			item.pyqLinks?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "PYQ Links",
				icon: BookOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: item.pyqLinks.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						p.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.year }) : null,
						" ",
						p.paper ? `· ${p.paper}` : "",
						" — ",
						p.question
					] }, i))
				})
			}),
			item.probablePrelimsMCQ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Probable Prelims MCQ",
				icon: Target,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-background p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: item.probablePrelimsMCQ.q
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 space-y-1 text-sm",
							children: item.probablePrelimsMCQ.options.map((o, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: j === item.probablePrelimsMCQ.answer ? "font-semibold text-emerald-700 dark:text-emerald-300" : "",
								children: [
									String.fromCharCode(65 + j),
									". ",
									o,
									j === item.probablePrelimsMCQ.answer && " ✓"
								]
							}, j))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Explanation:" }),
								" ",
								item.probablePrelimsMCQ.explanation
							]
						})
					]
				})
			}),
			item.probableMainsQuestion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Probable Mains Question",
				icon: FilePen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-background p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-center gap-2 text-[11px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: item.probableMainsQuestion.paper
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [item.probableMainsQuestion.marks, " marks"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: item.probableMainsQuestion.q
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 text-sm text-foreground/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Approach:" }),
								" ",
								item.probableMainsQuestion.approach
							]
						})
					]
				})
			})
		]
	});
}
function Section({ title, icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 text-indigo-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
				children: title
			})]
		}), children]
	});
}
function MermaidBlock({ code, id }) {
	const ref = (0, import_react.useRef)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const { svg } = await (await getMermaid()).render(id.replace(/[^a-zA-Z0-9_-]/g, "_"), code);
				if (!cancelled && ref.current) ref.current.innerHTML = svg;
			} catch (e) {
				if (!cancelled) setErr(e?.message ?? "Diagram render failed");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [code, id]);
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "overflow-auto rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground",
		children: code
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-auto rounded-xl border bg-background p-3",
		ref
	});
}
function esc(s) {
	return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function InboxRowActions({ pdfId, busy, linked, onExtract }) {
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [pyqOpen, setPyqOpen] = (0, import_react.useState)(false);
	const [working, setWorking] = (0, import_react.useState)(null);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const onDoc = (e) => {
			if (!ref.current?.contains(e.target)) setMenu(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [menu]);
	const ensureExtracted = async () => {
		if (linked) return linked;
		toast.message("Extracting editorial first…");
		try {
			await onExtract();
			toast.info("Extraction complete — click the format again to download");
		} catch (e) {
			toast.error(e?.message ?? "Extract failed");
		}
		return null;
	};
	const doDownload = async (kind) => {
		setMenu(false);
		const row = await ensureExtracted();
		if (!row) return;
		setWorking(kind);
		try {
			const baseName = `${(row.newspaper || "Editorial").replace(/[^\w-]+/g, "_")}_${row.edition_date || row.created_at?.slice(0, 10) || "notes"}`;
			if (kind === "pdf") {
				const { editorialsToPdf } = await import("./editorial-pdf-DIxUl8rv.mjs");
				triggerDownload(await editorialsToPdf(row), `${baseName}.pdf`);
			} else if (kind === "info") {
				const { editorialsToInfographicPdf } = await import("./editorial-infographic-CgmtekH4.mjs");
				triggerDownload(await editorialsToInfographicPdf(row), `${baseName}_infographic.pdf`);
			} else {
				const html = buildHandwrittenAllHtml(row);
				const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
				if (!w) return toast.error("Popup blocked — allow popups to save handwritten notes");
				w.document.open();
				w.document.write(html);
				w.document.close();
			}
		} catch (e) {
			toast.error(e?.message ?? "Download failed");
		} finally {
			setWorking(null);
		}
	};
	const pieces = linked?.analysis?.editorials ?? [];
	const hasPyq = pieces.some((it) => (it.pyqLinks?.length ?? 0) > 0 || it.probablePrelimsMCQ || it.probableMainsQuestion);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => onExtract().catch((e) => toast.error(e?.message ?? "Extract failed")),
					disabled: busy,
					className: "inline-flex items-center gap-1.5 rounded-sm bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-95 disabled:opacity-60",
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), busy ? "Extracting…" : linked ? "Re-extract" : "Extract Content"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					ref,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMenu((v) => !v),
						disabled: busy || working !== null,
						className: "inline-flex items-center gap-1 rounded-sm border border-emerald-400/70 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse hover:from-emerald-400 hover:via-green-400 hover:to-emerald-500 disabled:opacity-60",
						children: [
							working ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }),
							working === "pdf" ? "PDF…" : working === "info" ? "Infographic…" : working === "hand" ? "Handwritten…" : "Download",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3" })
						]
					}), menu && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-md border border-stone-300 bg-white text-[11px] shadow-xl dark:border-stone-700 dark:bg-stone-900",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => doDownload("pdf"),
								className: "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Notes PDF"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => doDownload("info"),
								className: "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "h-3.5 w-3.5" }), " Infographic PDF"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => doDownload("hand"),
								className: "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5" }), " Handwritten"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: async () => {
						if (await ensureExtracted()) setPyqOpen((v) => !v);
					},
					className: "inline-flex items-center gap-1 rounded-sm border border-amber-700/60 bg-amber-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-900 hover:bg-amber-100 dark:border-amber-300/40 dark:bg-amber-950/40 dark:text-amber-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-3 w-3" }), " PYQ & Mains"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500",
					children: linked ? `${pieces.length} editorial${pieces.length === 1 ? "" : "s"} · stamped` : "auto-stamped on every download"
				})
			]
		}), pyqOpen && linked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-amber-200 bg-amber-50/60 p-3 text-[12px] dark:border-amber-900/40 dark:bg-amber-950/20",
			children: [!hasPyq && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-stone-600 dark:text-stone-400",
				children: "No verifiable PYQ theme detected for these editorials."
			}), pieces.map((it, i) => (it.pyqLinks?.length ?? 0) === 0 && !it.probableMainsQuestion ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 last:mb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200",
						children: it.title
					}),
					it.pyqLinks?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 space-y-0.5 text-stone-700 dark:text-stone-300",
						children: it.pyqLinks.map((p, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"• ",
							p.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [p.year, " "] }) : null,
							p.paper ? `(${p.paper}) ` : "",
							p.question
						] }, j))
					}) : null,
					it.probableMainsQuestion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 text-stone-700 dark:text-stone-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-amber-800 dark:text-amber-200",
								children: "Probable Mains: "
							}),
							it.probableMainsQuestion.q,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "opacity-70",
								children: [
									"(",
									it.probableMainsQuestion.paper,
									" · ",
									it.probableMainsQuestion.marks,
									"m)"
								]
							})
						]
					})
				]
			}, i))]
		})]
	});
}
function buildHandwrittenAllHtml(row) {
	const items = row.analysis?.editorials ?? [];
	const meta = {
		newspaper: row.newspaper,
		edition_date: row.edition_date,
		created_at: row.created_at
	};
	const parts = items.map((it) => buildHandwrittenHtml(it, meta));
	const bodies = parts.map((h) => {
		const m = h.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		return m ? m[1] : "";
	}).join("<div style=\"page-break-before: always;\"></div>");
	return parts[0]?.replace(/<body[^>]*>[\s\S]*?<\/body>/i, `<body>${bodies}</body>`) ?? "<html><body>No editorials</body></html>";
}
function buildHandwrittenHtml(item, meta) {
	const date = meta?.edition_date || meta?.created_at?.slice(0, 10) || "";
	const paper = meta?.newspaper || "Editorial";
	const bullets = (arr) => arr && arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
	return `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(item.title)} — Handwritten Notes</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap" />
<style>
  @page { size: A4; margin: 18mm 16mm; }
  html, body { background: #fdfbf3; margin: 0; }
  body {
    font-family: "Kalam", "Patrick Hand", cursive;
    color: #1a1a1a; line-height: 1.55; font-size: 16pt;
    background-image: repeating-linear-gradient(#fdfbf3 0 30px, #e6dcc4 30px 31px);
    padding: 20px 28px;
  }
  h1 { font-size: 26pt; margin: 0 0 4px; color: #12306a; }
  .meta { font-size: 11pt; color: #6a5a3a; margin-bottom: 14px; }
  h2 { font-size: 17pt; margin: 18px 0 4px; color: #b0341f; border-bottom: 1px dashed #b0341f; padding-bottom: 2px; }
  ul { margin: 4px 0 8px 22px; padding: 0; }
  li { margin: 2px 0; }
  .box { border: 1.5px solid #12306a; border-radius: 6px; padding: 8px 12px; margin: 6px 0; background: rgba(255,255,255,0.5); }
  .toolbar { position: fixed; top: 8px; right: 8px; font-family: system-ui, sans-serif; font-size: 11pt; }
  .toolbar button { background: #12306a; color: #fff; border: 0; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
  @media print { .toolbar { display: none; } body { background: #fff; background-image: repeating-linear-gradient(#fff 0 30px, #d9d0b8 30px 31px); } }
</style></head><body>
<div class="toolbar"><button onclick="window.print()">Save as PDF</button></div>
<h1>${esc(item.title)}</h1>
<div class="meta">${esc(paper)} · ${esc(date)} · ${esc(item.syllabus.paper)} · ${esc(item.syllabus.subject)} — ${esc(item.syllabus.topic)}</div>
${item.crispNotes?.length ? `<h2>Crisp Notes</h2>${bullets(item.crispNotes)}` : ""}
${item.comprehensiveNotes ? `<h2>Comprehensive</h2><div>${esc(item.comprehensiveNotes).replace(/\n/g, "<br/>")}</div>` : ""}
${item.keyFacts?.length ? `<h2>Key Facts</h2>${bullets(item.keyFacts)}` : ""}
${item.argumentsFor?.length ? `<h2>Arguments — For</h2>${bullets(item.argumentsFor)}` : ""}
${item.argumentsAgainst?.length ? `<h2>Arguments — Against</h2>${bullets(item.argumentsAgainst)}` : ""}
${item.wayForward?.length ? `<h2>Way Forward</h2>${bullets(item.wayForward)}` : ""}
${item.vocabulary?.length ? `<h2>Vocabulary</h2><ul>${item.vocabulary.map((v) => `<li><b>${esc(v.word)}</b> — ${esc(v.meaning)}</li>`).join("")}</ul>` : ""}
${item.pyqLinks?.length ? `<h2>PYQ Links</h2><ul>${item.pyqLinks.map((p) => `<li>${p.year ? `<b>${p.year}</b> ` : ""}${p.paper ? `(${esc(p.paper)}) ` : ""}${esc(p.question)}</li>`).join("")}</ul>` : ""}
${item.probablePrelimsMCQ ? `<h2>Probable Prelims MCQ</h2><div class="box"><div>${esc(item.probablePrelimsMCQ.q)}</div><ol>${item.probablePrelimsMCQ.options.map((o, j) => `<li${j === item.probablePrelimsMCQ.answer ? " style=\"color:#0a7a2a;font-weight:700\"" : ""}>${esc(o)}${j === item.probablePrelimsMCQ.answer ? " ✓" : ""}</li>`).join("")}</ol><div style="font-size:12pt;color:#555">${esc(item.probablePrelimsMCQ.explanation)}</div></div>` : ""}
${item.probableMainsQuestion ? `<h2>Probable Mains</h2><div class="box"><div style="font-size:12pt;color:#555">${esc(item.probableMainsQuestion.paper)} · ${item.probableMainsQuestion.marks} marks</div><div>${esc(item.probableMainsQuestion.q)}</div><div style="margin-top:6px"><b>Approach:</b> ${esc(item.probableMainsQuestion.approach)}</div></div>` : ""}
</body></html>`;
}
//#endregion
export { EditorialLabPage as component };
