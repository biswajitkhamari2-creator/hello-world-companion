import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { At as Calendar, E as RotateCcw, L as Newspaper, V as MapPin, W as LoaderCircle, ct as Flame, k as RefreshCcw, pt as ExternalLink, y as Sparkles } from "../_libs/lucide-react.mjs";
import { ct as objectType, lt as stringType, ot as enumType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { N as addDays, l as format } from "../_libs/date-fns.mjs";
import { i as PopoverTrigger, n as Popover, r as PopoverContent, t as Calendar$1 } from "./popover-CpjalvxJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/news-archive-C0rZ7F1W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
createServerFn({ method: "GET" }).inputValidator((input) => objectType({
	gs: enumType([
		"GS1",
		"GS2",
		"GS3",
		"GS4",
		"General",
		"all"
	]).optional(),
	limit: numberType().int().min(1).max(300).optional()
}).optional().parse(input)).handler(createSsrRpc("184c7132927bba09e7fa4c7d009be2aef5a57b297a04c8f87ee231baec7ab269"));
var countPendingInbox = createServerFn({ method: "GET" }).handler(createSsrRpc("8c245f7bd6b3309f938541d57f7c4e715928a8d0a2d75be5c8d6e1a34e695310"));
var hardResetNewsAnalysis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("e6c3ed89b1eb4507d3b894708545247749fb0d0a2501bb4056eb9ac002a5c3fd"));
createServerFn({ method: "GET" }).handler(createSsrRpc("ab05eefda1673f19fb61acf88e0a947aee1ddafc44f3ade501b7c937714b5525"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("8c1e3ccb2742668e189959c33848daf96eb02356874b8fe770141bffbcc59f5a"));
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
}).optional().parse(input)).handler(createSsrRpc("fe7b0a19778bdac223c3ec63d85d9a65d322d9c7128cd01a660109712fbe7680"));
var listArchiveDates = createServerFn({ method: "GET" }).handler(createSsrRpc("ca5794dbbb0ec15a221736627cb04e0ad47ebb96fec93f15ee0e3353728371af"));
var extractPendingInboxNews = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("780c381b0295751e044f1e27ba8e623c98e83e710d286f2bff532fe9b58c29af"));
var ODISHA_REGEX = /odisha|odia|ଓଡ|opsc|bhubanes|cuttack|puri\b|balasore|sambalpur|rourkela|jagannath|koraput|kalinga|jajpur|jharsuguda|kendrapara|mayurbhanj|angul|dhenkanal|ganjam|nabarangpur|nayagarh|rayagada|sundargarh|kandhamal|malkangiri|boudh|deogarh|khordha|nuapada|subarnapur|bargarh|bolangir/i;
function isOdishaItem(it) {
	const hay = `${it.title} ${it.summary ?? ""} ${it.subject ?? ""}`;
	return ODISHA_REGEX.test(hay);
}
function ArchivePage() {
	const [date, setDate] = (0, import_react.useState)(void 0);
	const [tab, setTab] = (0, import_react.useState)("national");
	const [items, setItems] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const [dates, setDates] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [resetting, setResetting] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(0);
	async function refreshDates() {
		try {
			const d = await listArchiveDates();
			setDates(new Set(d));
			return d;
		} catch {
			return [];
		}
	}
	async function refreshPendingCount() {
		try {
			const { pending } = await countPendingInbox();
			setPending(pending);
			return pending;
		} catch {
			return 0;
		}
	}
	async function runSync(silent = false) {
		if (syncing) return;
		setSyncing(true);
		try {
			let processedAny = false;
			for (let i = 0; i < 60; i++) {
				const res = await extractPendingInboxNews();
				if (res.processed) processedAny = true;
				if (!res.remaining) break;
				await refreshPendingCount();
			}
			await Promise.all([refreshDates(), refreshPendingCount()]);
			if (!silent) toast.success(processedAny ? "Sync complete — new headlines added." : "Sab kuch already synced hai.");
			return processedAny;
		} catch (e) {
			if (!silent) toast.error(`Sync failed: ${e.message}`);
			return false;
		} finally {
			setSyncing(false);
		}
	}
	async function runHardReset() {
		if (resetting || syncing) return;
		if (!window.confirm("Hard reset news archive? This will delete extracted headlines and re-extract all ready Telegram newspaper PDFs using direct Gemini.")) return;
		setResetting(true);
		try {
			const res = await hardResetNewsAnalysis();
			setPending(res.pending);
			toast.success(`Reset done — ${res.deleted} old headlines removed. Re-extracting with Gemini…`);
			await runSync(false);
			await refreshDates();
			if (date) setDate(new Date(date));
		} catch (e) {
			toast.error(`Hard reset failed: ${e.message}`);
		} finally {
			setResetting(false);
		}
	}
	(0, import_react.useEffect)(() => {
		(async () => {
			const d = await refreshDates();
			if (!date && d.length) {
				const latest = [...d].sort().pop();
				if (latest) setDate(/* @__PURE__ */ new Date(`${latest}T00:00:00`));
			}
			if (await refreshPendingCount() > 0) {
				if (await runSync(true)) {
					const d2 = await refreshDates();
					if (d2.length) {
						const latest = [...d2].sort().pop();
						if (latest) setDate(/* @__PURE__ */ new Date(`${latest}T00:00:00`));
					}
				}
			}
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!date) {
			setItems(null);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setErr(null);
		const ymdLocal = format(date, "yyyy-MM-dd");
		searchNewsArchive({ data: {
			from: format(addDays(date, -1), "yyyy-MM-dd"),
			to: format(addDays(date, 1), "yyyy-MM-dd"),
			limit: 1e3
		} }).then((res) => {
			if (cancelled) return;
			const filtered = res.filter((it) => {
				return format(new Date(it.posted_at), "yyyy-MM-dd") === ymdLocal;
			});
			setItems(filtered);
		}).catch((e) => {
			if (!cancelled) setErr(e.message);
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [date]);
	const { odisha, national } = (0, import_react.useMemo)(() => {
		const o = [];
		const n = [];
		for (const it of items ?? []) (isOdishaItem(it) ? o : n).push(it);
		return {
			odisha: o,
			national: n
		};
	}, [items]);
	const list = tab === "odisha" ? odisha : national;
	const dateLabel = date ? format(date, "d MMM yyyy") : "Pick a date";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-4xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " Daily headlines archive"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-semibold tracking-tight sm:text-3xl",
						children: "News Archive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Ek date choose karo — us din ke Odisha aur National headlines seedhe source PDF ke link ke saath."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), dateLabel]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: date,
							onSelect: (d) => d && setDate(d),
							numberOfMonths: 1,
							initialFocus: true,
							modifiers: { hasNews: (d) => dates.has(format(d, "yyyy-MM-dd")) },
							modifiersClassNames: { hasNews: "font-bold text-emerald-600 dark:text-emerald-400 underline underline-offset-2" },
							className: cn("p-3 pointer-events-auto")
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex rounded-full border border-border bg-background/60 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab("national"),
							className: cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition", tab === "national" ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-3 w-3" }),
								" National",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 rounded-full bg-black/20 px-1.5 text-[10px]",
									children: national.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab("odisha"),
							className: cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition", tab === "odisha" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "text-muted-foreground hover:text-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
								" Odisha",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 rounded-full bg-black/20 px-1.5 text-[10px]",
									children: odisha.length
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "ml-auto gap-1.5",
						onClick: async () => {
							if (await runSync(false) && date) setDate(new Date(date));
						},
						disabled: syncing,
						children: [
							syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "h-3.5 w-3.5" }),
							"Sync ",
							pending > 0 ? `(${pending})` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "gap-1.5 border-rose-400/40 text-rose-300 hover:bg-rose-500/10",
						onClick: runHardReset,
						disabled: syncing || resetting,
						children: [resetting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), "Hard reset"]
					})
				]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300",
				children: err
			}),
			!date && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
				children: "Date select karo — us din ke sabhi headlines yahan aa jayenge."
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
					" Loading ",
					dateLabel,
					"…"
				]
			}),
			!loading && items && list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						dateLabel,
						" ke liye ",
						tab === "odisha" ? "Odisha" : "National",
						" headlines nahi mile."
					] }),
					pending > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-400",
								children: pending
							}),
							" newspaper Telegram inbox mein pending hai — ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sync" }),
							" dabao, us din ka bhi analyse ho jayega."
						]
					}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs",
						children: [
							"Is date ka newspaper Telegram bot pe forward nahi hua. Bhejo, phir ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sync" }),
							" click karo."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "gap-1.5",
						disabled: syncing,
						onClick: () => runSync(false),
						children: [syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "h-3.5 w-3.5" }), "Sync now"]
					})
				]
			}),
			!loading && list.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-2",
				children: list.slice().sort((a, b) => b.importance - a.importance).map((it, idx) => {
					const hot = it.importance >= 4;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("group rounded-xl border p-3 transition hover:border-indigo-400/50", hot ? "border-amber-400/30 bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-fuchsia-500/5" : "border-border bg-background/60"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 w-6 shrink-0 text-right text-xs font-semibold text-muted-foreground",
									children: [idx + 1, "."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-300",
													children: it.gs_paper
												}),
												it.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-full border border-border px-2 py-0.5 text-muted-foreground",
													children: it.subject
												}),
												hot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-0.5 text-rose-400",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3 w-3" }), " Must read"]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-semibold leading-snug",
											children: it.title
										}),
										it.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 line-clamp-3 text-xs text-muted-foreground",
											children: it.summary
										})
									]
								}),
								it.link ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: it.link,
									target: "_blank",
									rel: "noreferrer noopener",
									className: "inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-medium text-foreground/80 hover:text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), " Open"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex shrink-0 items-center rounded-full border border-dashed border-border px-2.5 py-1 text-[10px] text-muted-foreground",
									children: "no link"
								})
							]
						})
					}, it.id);
				})
			})
		]
	}) });
}
//#endregion
export { ArchivePage as component };
