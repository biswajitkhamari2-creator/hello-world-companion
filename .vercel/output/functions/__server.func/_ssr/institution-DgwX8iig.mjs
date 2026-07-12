import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { At as Calendar, Dt as ChevronDown, Mt as CalendarDays, Rt as BookOpen, W as LoaderCircle, it as GraduationCap, jt as CalendarRange, k as RefreshCcw, mt as Download, n as X, pt as ExternalLink, r as WandSparkles, y as Sparkles } from "../_libs/lucide-react.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as downloadPreviewAsPdf } from "./preview-pdf-Cet6mvkM.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { i as PopoverTrigger, n as Popover, r as PopoverContent, t as Calendar$1 } from "./popover-CpjalvxJ.mjs";
import { a as getInstitutionCrispNotes, i as getInstitutionComprehensiveNotes, o as getInstitutionNews, r as getInstitutionArticle } from "./institution-news.functions-BJVeekZ0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/institution-DgwX8iig.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function gsColor(gs) {
	switch (gs) {
		case "GS-1": return "from-amber-500 to-orange-500";
		case "GS-2": return "from-sky-500 to-blue-600";
		case "GS-3": return "from-emerald-500 to-teal-600";
		case "GS-4": return "from-fuchsia-500 to-pink-600";
		case "Essay": return "from-violet-500 to-indigo-600";
		default: return "from-slate-500 to-slate-700";
	}
}
function CrispNotesView({ notes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `rounded-2xl bg-gradient-to-br ${gsColor(notes.gsPaper)} p-[1px] shadow-sm`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full bg-gradient-to-r ${gsColor(notes.gsPaper)} px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow`,
									children: notes.gsPaper
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-[10px]",
									children: notes.subject
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px]",
									children: notes.topic
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-serif text-lg font-bold leading-snug",
							children: notes.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs italic text-muted-foreground",
							children: ["Syllabus anchor: ", notes.syllabusAnchor]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed",
							children: notes.oneLine
						})
					]
				})
			}),
			notes.whyInNews?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Why in News",
				children: notes.whyInNews.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.keyPoints?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Key Points",
				children: notes.keyPoints.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.facts?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Facts & Figures",
				children: notes.facts.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, {
					accent: "amber",
					children: b
				}, i))
			}),
			notes.keyTerms?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Key Terms",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: notes.keyTerms.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-muted/30 p-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold",
							children: t.term
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: t.meaning
						})]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [notes.prelimsAngle?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Prelims Angle",
					tone: "sky",
					children: notes.prelimsAngle.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
				}), notes.mainsAngle?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Mains Angle",
					tone: "emerald",
					children: notes.mainsAngle.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
				})]
			}),
			notes.probableQuestion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border-l-4 border-fuchsia-500 bg-fuchsia-50 p-3.5 text-sm dark:bg-fuchsia-950/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300",
					children: "Probable Question"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "italic",
					children: notes.probableQuestion
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: ["Source: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "underline",
					href: notes.sourceUrl,
					target: "_blank",
					rel: "noreferrer",
					children: notes.sourceUrl
				})]
			})
		]
	});
}
function Section({ title, tone, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-xl border ${tone === "sky" ? "border-sky-200 dark:border-sky-900/50" : tone === "emerald" ? "border-emerald-200 dark:border-emerald-900/50" : "border-border"} bg-card p-3.5`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children
		})]
	});
}
function Bullet({ children, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2 text-sm leading-snug",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${accent === "amber" ? "bg-amber-500" : "bg-emerald-500"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children })]
	});
}
function InstitutionPage() {
	const fetchNews = useServerFn(getInstitutionNews);
	const fetchArticle = useServerFn(getInstitutionArticle);
	const fetchCrisp = useServerFn(getInstitutionCrispNotes);
	const fetchComprehensive = useServerFn(getInstitutionComprehensiveNotes);
	const [tab, setTab] = (0, import_react.useState)("daily");
	const [open, setOpen] = (0, import_react.useState)(null);
	const [articleHtml, setArticleHtml] = (0, import_react.useState)("");
	const [articleTitle, setArticleTitle] = (0, import_react.useState)("");
	const [crisp, setCrisp] = (0, import_react.useState)(null);
	const [comprehensive, setComprehensive] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("crisp");
	const [showFull, setShowFull] = (0, import_react.useState)(false);
	const [expanded, setExpanded] = (0, import_react.useState)({});
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(void 0);
	const printRef = (0, import_react.useRef)(null);
	const q = useQuery({
		queryKey: ["institution-news"],
		queryFn: () => fetchNews(),
		staleTime: 300 * 1e3
	});
	const articleMut = useMutation({
		mutationFn: (url) => fetchArticle({ data: { url } }),
		onSuccess: (res) => {
			setArticleHtml(res.html);
			setArticleTitle(res.title);
		},
		onError: (e) => {
			toast.error(e instanceof Error ? e.message : "Could not load article");
		}
	});
	const crispMut = useMutation({
		mutationFn: (url) => fetchCrisp({ data: { url } }),
		onSuccess: (res) => setCrisp(res),
		onError: (e) => {
			toast.error(e instanceof Error ? e.message : "Could not generate crisp notes");
		}
	});
	const comprehensiveMut = useMutation({
		mutationFn: (url) => fetchComprehensive({ data: { url } }),
		onSuccess: (res) => setComprehensive(res),
		onError: (e) => {
			toast.error(e instanceof Error ? e.message : "Could not generate comprehensive notes");
		}
	});
	const items = (0, import_react.useMemo)(() => {
		if (!q.data) return [];
		return tab === "daily" ? q.data.daily : q.data.weekly;
	}, [q.data, tab]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const it of items) {
			const list = map.get(it.date) ?? [];
			list.push(it);
			map.set(it.date, list);
		}
		let entries = Array.from(map.entries()).sort((a, b) => a[0] < b[0] ? 1 : -1);
		if (selectedDate) {
			const key = format(selectedDate, "yyyy-MM-dd");
			entries = entries.filter(([d]) => d === key);
		}
		return entries;
	}, [items, selectedDate]);
	const availableDates = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		for (const it of items) s.add(it.date);
		return s;
	}, [items]);
	function openArticle(it, initialMode = "crisp") {
		setOpen(it);
		setArticleHtml("");
		setArticleTitle(it.title);
		setCrisp(null);
		setComprehensive(null);
		setShowFull(false);
		setMode(initialMode);
		if (initialMode === "comprehensive") comprehensiveMut.mutate(it.link);
		else crispMut.mutate(it.link);
	}
	function switchMode(next) {
		if (!open) return;
		setMode(next);
		if (next === "crisp" && !crisp && !crispMut.isPending) crispMut.mutate(open.link);
		if (next === "comprehensive" && !comprehensive && !comprehensiveMut.isPending) comprehensiveMut.mutate(open.link);
	}
	function loadFullArticle() {
		setShowFull(true);
		if (!articleHtml && !articleMut.isPending) articleMut.mutate(open.link);
	}
	async function saveAsPdf() {
		if (!printRef.current || !open) return;
		if (!(mode === "crisp" ? !!crisp : !!comprehensive)) {
			toast.error("Notes are still loading — hang on a second.");
			return;
		}
		setDownloading(true);
		const t = toast.loading("Building your PDF with your logo…");
		try {
			await downloadPreviewAsPdf(printRef.current, `${open.title}-${mode}`, { verifyBefore: false });
			toast.success("PDF saved to your downloads", { id: t });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "PDF export failed", { id: t });
		} finally {
			setDownloading(false);
		}
	}
	const INITIAL_PER_GROUP = 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-6 print:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex flex-wrap items-center gap-3 animate-fade-in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-2xl font-bold",
							children: "Institution Engine"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Curated exclusively from ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Vision IAS"
								}),
								". No Google, no third-party feeds."
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => q.refetch(),
						disabled: q.isFetching,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: `h-3.5 w-3.5 mr-1.5 ${q.isFetching ? "animate-spin" : ""}` }), "Refresh"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 inline-flex rounded-full border border-border bg-card p-1 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab("daily"),
					className: `inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${tab === "daily" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "text-muted-foreground hover:text-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }), " Daily News Blast"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab("weekly"),
					className: `inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${tab === "weekly" ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { className: "h-3.5 w-3.5" }), " Weekly Focus"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: cn("gap-1.5", !selectedDate && "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), selectedDate ? format(selectedDate, "PPP") : "Filter by date"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: selectedDate,
							onSelect: setSelectedDate,
							initialFocus: true,
							modifiers: { hasNews: (d) => availableDates.has(format(d, "yyyy-MM-dd")) },
							modifiersClassNames: { hasNews: "font-bold text-emerald-600 dark:text-emerald-400 underline underline-offset-2" },
							className: cn("p-3 pointer-events-auto")
						})
					})] }),
					selectedDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "gap-1",
						onClick: () => setSelectedDate(void 0),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Clear"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: selectedDate ? `Showing ${grouped.reduce((n, [, l]) => n + l.length, 0)} items` : `${availableDates.size} dates available`
					})
				]
			}),
			q.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 rounded-xl border border-border bg-muted/30 animate-pulse" }, i))
			}),
			q.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-rose-300/50 bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
				children: "Could not reach Vision IAS. Try refreshing in a moment."
			}),
			!q.isLoading && !items.length && !q.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
				children: "Nothing published in this section right now."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: grouped.map(([date, list], gi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "animate-fade-in",
					style: {
						animationDelay: `${gi * 60}ms`,
						animationFillMode: "both"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-card px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: new Date(date).toLocaleDateString(void 0, {
									weekday: "short",
									day: "numeric",
									month: "short",
									year: "numeric"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
						]
					}), (() => {
						const isOpen = !!expanded[date];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2.5 sm:grid-cols-2",
							children: (isOpen ? list : list.slice(0, INITIAL_PER_GROUP)).map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "group flex flex-col rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-md animate-fade-in",
								style: {
									animationDelay: `${i * 30}ms`,
									animationFillMode: "both"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex flex-wrap items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: it.category
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase tracking-wider text-muted-foreground",
											children: it.source
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-3 line-clamp-3 text-sm font-medium leading-snug",
										children: it.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-auto flex flex-wrap items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												className: "h-7 gap-1 text-xs",
												onClick: () => openArticle(it, "crisp"),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " Read & Save PDF"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												className: "h-7 gap-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-xs text-white hover:opacity-90",
												onClick: () => openArticle(it, "comprehensive"),
												title: "Generate comprehensive AI notes",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI Notes"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												className: "h-7 gap-1 text-xs",
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
													href: it.link,
													target: "_blank",
													rel: "noreferrer",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), " Open"]
												})
											})
										]
									})
								]
							}, it.link))
						}), list.length > INITIAL_PER_GROUP && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setExpanded((e) => ({
									...e,
									[date]: !isOpen
								})),
								className: "gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}` }), isOpen ? "Show less" : `View ${list.length - INITIAL_PER_GROUP} more`]
							})
						})] });
					})()]
				}, date))
			})
		]
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-t-2xl border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs uppercase tracking-wider text-muted-foreground",
							children: open.source
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold",
							children: articleTitle || open.title
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex rounded-full border border-border p-0.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => switchMode("crisp"),
							className: `rounded-full px-2.5 py-1 font-medium transition ${mode === "crisp" ? "bg-emerald-500 text-white" : "text-muted-foreground"}`,
							children: "Crisp"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => switchMode("comprehensive"),
							className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition ${mode === "comprehensive" ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "h-3 w-3" }), " Comprehensive"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: saveAsPdf,
						disabled: downloading || (mode === "crisp" ? !crisp : !comprehensive),
						children: [downloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), " Download PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setOpen(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-[75vh] overflow-y-auto px-6 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: printRef,
					className: "pdf-light-scope bg-white p-2 text-slate-900",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-bold",
									children: articleTitle || open.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-slate-500",
									children: [
										open.source,
										" · ",
										new Date(open.date).toLocaleDateString(),
										" · ",
										open.link
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-3" })
							]
						}),
						mode === "crisp" && crispMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 py-8 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Crisping notes & tagging GS paper…"]
						}),
						mode === "crisp" && crisp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrispNotesView, { notes: crisp }),
						mode === "comprehensive" && comprehensiveMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 py-8 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Building comprehensive 360° notes…"]
						}),
						mode === "comprehensive" && comprehensive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComprehensiveNotesView, { notes: comprehensive }),
						showFull && articleMut.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-2 py-4 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Fetching full article…"]
						}),
						showFull && articleHtml && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
							className: "prose prose-sm mt-6 max-w-none border-t border-border pt-6 dark:prose-invert prose-headings:font-serif prose-a:text-primary",
							dangerouslySetInnerHTML: { __html: articleHtml }
						})
					]
				}), (crisp || comprehensive) && !showFull && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-center print:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: loadFullArticle,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-1.5 h-3.5 w-3.5" }), " Load full article (optional)"]
					})
				})]
			})]
		})
	})] });
}
function ComprehensiveNotesView({ notes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrispNotesView, { notes }),
			notes.background?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Background & Evolution",
				children: notes.background.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.currentStatus?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Current Status",
				children: notes.currentStatus.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.stakeholders?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Stakeholders",
				children: notes.stakeholders.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.challenges?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Challenges",
				tone: "sky",
				children: notes.challenges.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.wayForward?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Way Forward",
				tone: "emerald",
				children: notes.wayForward.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.relatedSchemes?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Related Schemes / Acts / Reports",
				children: notes.relatedSchemes.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, {
					accent: "amber",
					children: b
				}, i))
			}),
			notes.internationalAngle?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "International / Global Angle",
				children: notes.internationalAngle.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullet, { children: b }, i))
			}),
			notes.quotes?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-3.5 text-sm dark:bg-indigo-950/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300",
					children: "Quotable Lines for Mains"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: notes.quotes.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "italic",
						children: [
							"“",
							q,
							"”"
						]
					}, i))
				})]
			}),
			notes.mindMap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Mind Map (One-shot Recap)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed",
					children: notes.mindMap
				})
			})
		]
	});
}
//#endregion
export { InstitutionPage as component };
