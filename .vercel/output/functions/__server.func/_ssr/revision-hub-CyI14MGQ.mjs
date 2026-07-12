import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { Dt as ChevronDown, E as RotateCcw, Et as ChevronLeft, I as NotebookPen, It as Bookmark, Lt as BookmarkCheck, Mt as CalendarDays, Nt as CalendarClock, Ot as Check, Pt as Brain, Tt as ChevronRight, W as LoaderCircle, Y as Layers, bt as CircleQuestionMark, ct as Flame, h as Star, j as Printer, jt as CalendarRange, kt as ChartColumn, mt as Download, q as Lightbulb, t as Zap, w as Search, y as Sparkles } from "../_libs/lucide-react.mjs";
import { ct as objectType, lt as stringType, ot as enumType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as Input$1 } from "./input-DoD5W07l.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { n as Skeleton, t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { t as Progress } from "./progress-Rwu-UcSt.mjs";
import { t as Textarea } from "./textarea-Dfe41XSO.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { t as Route } from "./revision-hub-BegHUqyT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision-hub-CyI14MGQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = objectType({
	kind: enumType([
		"one_liners",
		"pyq",
		"static_link",
		"mind_map",
		"flashcards",
		"notes",
		"planner",
		"weekly",
		"monthly",
		"quiz_prelims",
		"quiz_mains",
		"evaluate_answer",
		"mnemonics"
	]),
	topic: stringType().max(400).optional(),
	period: enumType([
		"daily",
		"weekly",
		"monthly"
	]).optional(),
	gs: enumType([
		"all",
		"GS1",
		"GS2",
		"GS3",
		"GS4"
	]).optional(),
	answer: stringType().max(6e3).optional(),
	question: stringType().max(1e3).optional()
});
var runRevisionAi = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((raw) => Input.parse(raw)).handler(createSsrRpc("398b5b9dc8312768021828d171a14a6443ccfb0a2d5ffa050954ebb35f383531"));
var TABS = [
	{
		key: "one_liner",
		label: "One-Liners",
		icon: Zap,
		hint: "Ultra-short facts"
	},
	{
		key: "pyq",
		label: "PYQ Revision",
		icon: Layers,
		hint: "Repeated themes"
	},
	{
		key: "static",
		label: "Static ↔ CA",
		icon: Brain,
		hint: "News → book → PYQ"
	},
	{
		key: "mindmap",
		label: "Mind Maps",
		icon: Sparkles,
		hint: "Expandable"
	},
	{
		key: "flashcards",
		label: "Flashcards",
		icon: BookmarkCheck,
		hint: "Swipe + flip"
	},
	{
		key: "notes",
		label: "Notes",
		icon: NotebookPen,
		hint: "Handwritten style"
	},
	{
		key: "planner",
		label: "Today",
		icon: CalendarDays,
		hint: "Daily plan"
	},
	{
		key: "weekly",
		label: "Weekly",
		icon: CalendarRange,
		hint: "Week digest"
	},
	{
		key: "monthly",
		label: "Monthly",
		icon: CalendarClock,
		hint: "Month compile"
	},
	{
		key: "quiz",
		label: "AI Quiz",
		icon: CircleQuestionMark,
		hint: "MCQ + Mains"
	},
	{
		key: "mnemonics",
		label: "Memory",
		icon: Lightbulb,
		hint: "Tricks & stories"
	},
	{
		key: "analytics",
		label: "Analytics",
		icon: ChartColumn,
		hint: "Progress"
	}
];
var LS = {
	bookmarks: "rh_bookmarks_v1",
	read: "rh_read_v1",
	streak: "rh_streak_v1",
	timeLog: "rh_time_v1",
	topicScore: "rh_topicScore_v1"
};
function lsGet(k, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		return JSON.parse(localStorage.getItem(k) || "");
	} catch {
		return fallback;
	}
}
function lsSet(k, v) {
	if (typeof window === "undefined") return;
	localStorage.setItem(k, JSON.stringify(v));
}
function bumpStreak() {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const s = lsGet(LS.streak, {
		last: "",
		count: 0
	});
	if (s.last === today) return s;
	const y = (/* @__PURE__ */ new Date(Date.now() - 864e5)).toISOString().slice(0, 10);
	const next = {
		last: today,
		count: s.last === y ? s.count + 1 : 1
	};
	lsSet(LS.streak, next);
	return next;
}
function logTime(tab, ms) {
	const t = lsGet(LS.timeLog, {});
	t[tab] = (t[tab] || 0) + ms;
	lsSet(LS.timeLog, t);
}
function GlassCard({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]", "backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]", className),
		children
	});
}
function SectionHeader({ icon: Icon, title, subtitle, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-xl font-semibold tracking-tight",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: subtitle
			})] })]
		}), right]
	});
}
function Empty({ title, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid place-items-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mb-2 h-6 w-6 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium",
				children: title
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground mt-1",
				children: hint
			})
		]
	});
}
function LoadingSkeleton({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-xl" }, i))
	});
}
function RevisionHubPage() {
	const search = Route.useSearch();
	const [tab, setTab] = (0, import_react.useState)(TABS.find((t) => t.key === search.tab)?.key ?? "one_liner");
	(0, import_react.useEffect)(() => {
		const next = TABS.find((t) => t.key === search.tab)?.key;
		if (next && next !== tab) setTab(next);
	}, [search.tab]);
	const [streak, setStreak] = (0, import_react.useState)({
		last: "",
		count: 0
	});
	const startedAt = (0, import_react.useRef)(Date.now());
	(0, import_react.useEffect)(() => {
		setStreak(bumpStreak());
	}, []);
	(0, import_react.useEffect)(() => {
		startedAt.current = Date.now();
		return () => logTime(tab, Date.now() - startedAt.current);
	}, [tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-40 -right-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto max-w-6xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "mb-2 border-white/20 bg-white/40 text-foreground backdrop-blur dark:bg-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3 w-3" }), " Premium"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-serif text-3xl md:text-4xl font-semibold tracking-tight",
							children: ["AI Revision ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent",
								children: "Hub"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xl text-sm text-muted-foreground",
							children: "Twelve revision engines, one glass surface — from one-liners to PYQ chains, mind maps, quizzes and analytics."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassCard, {
						className: "px-4 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Revision streak"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-lg font-semibold leading-tight tabular-nums",
								children: [
									streak.count,
									" day",
									streak.count === 1 ? "" : "s"
								]
							})] })]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 -mx-2 overflow-x-auto pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-max gap-2 px-2",
						children: TABS.map((t) => {
							const Icon = t.icon;
							const active = tab === t.key;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setTab(t.key),
								className: cn("group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all", active ? "border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30" : "border-white/40 bg-white/50 text-foreground hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-3.5 w-3.5", active ? "" : "text-violet-500") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.label })]
							}, t.key);
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto mt-6 max-w-6xl animate-fade-in",
				children: [
					tab === "one_liner" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OneLinerTab, {}),
					tab === "pyq" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PyqTab, {}),
					tab === "static" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaticLinkTab, {}),
					tab === "mindmap" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindMapTab, {}),
					tab === "flashcards" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlashcardsTab, {}),
					tab === "notes" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesTab, {}),
					tab === "planner" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlannerTab, {}),
					tab === "weekly" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyTab, {}),
					tab === "monthly" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthlyTab, {}),
					tab === "quiz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizTab, {}),
					tab === "mnemonics" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MnemonicsTab, {}),
					tab === "analytics" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsTab, {})
				]
			})
		]
	}) });
}
function OneLinerTab() {
	const call = useServerFn(runRevisionAi);
	const [period, setPeriod] = (0, import_react.useState)("daily");
	const [gs, setGs] = (0, import_react.useState)("all");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [q, setQ] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [visible, setVisible] = (0, import_react.useState)(20);
	const [bookmarks, setBookmarks] = (0, import_react.useState)(() => lsGet(LS.bookmarks + ":oneliner", {}));
	const [read, setRead] = (0, import_react.useState)(() => lsGet(LS.read + ":oneliner", {}));
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return items.filter((it) => {
			if (gs !== "all" && it.gs && it.gs !== gs) return false;
			if (!needle) return true;
			return it.text.toLowerCase().includes(needle) || (it.tag || "").toLowerCase().includes(needle);
		});
	}, [
		items,
		q,
		gs
	]);
	(0, import_react.useEffect)(() => {
		lsSet(LS.bookmarks + ":oneliner", bookmarks);
	}, [bookmarks]);
	(0, import_react.useEffect)(() => {
		lsSet(LS.read + ":oneliner", read);
	}, [read]);
	const generate = async () => {
		setLoading(true);
		try {
			const list = (await call({ data: {
				kind: "one_liners",
				period,
				gs,
				topic: topic || void 0
			} }))?.data?.items ?? [];
			setItems(list.map((it, i) => ({
				...it,
				id: it.id || String(i + 1)
			})));
			setVisible(20);
		} catch (e) {
			toast.error(e?.message || "Failed to generate one-liners");
		} finally {
			setLoading(false);
		}
	};
	const readPct = items.length ? Math.round(Object.keys(read).filter((id) => items.some((it) => it.id === id)).length / items.length * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Zap,
				title: "One-Liner Revision",
				subtitle: "Ultra-short, exam-hitting facts. Filter, search, bookmark, and track what you've read.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), "Generate"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-[1fr_auto_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search facts, tags…",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PillGroup, {
						value: period,
						onChange: (v) => setPeriod(v),
						options: [
							["daily", "Daily"],
							["weekly", "Weekly"],
							["monthly", "Monthly"]
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PillGroup, {
						value: gs,
						onChange: (v) => setGs(v),
						options: [
							["all", "All"],
							["GS1", "GS1"],
							["GS2", "GS2"],
							["GS3", "GS3"],
							["GS4", "GS4"]
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
				value: topic,
				onChange: (e) => setTopic(e.target.value),
				placeholder: "Optional topic focus (e.g. Constitutional bodies)",
				className: "mt-3"
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Read progress" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: readPct,
						className: "h-1.5 flex-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums",
						children: [readPct, "%"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, {}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No one-liners yet",
					hint: "Pick a period, GS filter, then hit Generate."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: filtered.slice(0, visible).map((it) => {
						const isRead = !!read[it.id];
						const isBm = !!bookmarks[it.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("group flex items-start gap-3 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3 transition-all hover:scale-[1.005] hover:shadow-md", isRead && "opacity-70"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setRead((r) => ({
										...r,
										[it.id]: true
									})),
									className: cn("mt-0.5 grid h-5 w-5 place-items-center rounded-md border", isRead ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"),
									"aria-label": "Mark read",
									children: isRead && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 text-sm leading-snug",
									children: it.text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-end gap-1",
									children: [it.gs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px]",
										children: it.gs
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setBookmarks((b) => {
											const next = { ...b };
											if (isBm) delete next[it.id];
											else next[it.id] = it;
											return next;
										}),
										className: "text-muted-foreground hover:text-amber-500",
										children: isBm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "h-4 w-4 text-amber-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4" })
									})]
								})
							]
						}, it.id);
					})
				}), visible < filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setVisible((v) => v + 20),
						children: "Load more"
					})
				})]
			})
		]
	});
}
function PillGroup({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex rounded-xl border border-white/40 bg-white/60 p-1 dark:border-white/10 dark:bg-white/[0.04]",
		children: options.map(([val, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => onChange(val),
			className: cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all", value === val ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground"),
			children: label
		}, val))
	});
}
function PyqTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a topic to analyse");
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "pyq",
				topic
			} });
			setItems(res?.data?.items ?? []);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Layers,
				title: "PYQ-Based Revision",
				subtitle: "Repeated themes with importance & current-affairs links."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Topic (e.g. Fundamental Rights, Monsoon)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Analyse"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, {}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No PYQ analysis yet",
					hint: "Enter a topic to get repeated themes."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 md:grid-cols-2",
					children: items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: it.year
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
									children: it.paper
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-sm font-medium leading-snug",
								children: it.question
							}),
							it.why_important && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: "Why: "
								}), it.why_important]
							}),
							it.current_link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: "Current link: "
								}), it.current_link]
							})
						]
					}, i))
				})
			})
		]
	});
}
function StaticLinkTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [chain, setChain] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a current news / topic");
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "static_link",
				topic
			} });
			setChain(res?.data ?? null);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const stages = chain ? [
		{
			label: "Current News",
			value: chain.news
		},
		{
			label: "Static Topic",
			value: chain.static_topic
		},
		{
			label: "Reference",
			value: chain.reference_book
		},
		{
			label: "PYQ",
			value: chain.pyq
		},
		{
			label: "Expected Q",
			value: chain.expected_question
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Brain,
				title: "Static ↔ Current Affairs",
				subtitle: "Chain a news item to syllabus, book, PYQ and expected question."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Current news headline or topic",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Build chain"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 3 }) : !chain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No chain yet",
					hint: "Type a headline to see the static + PYQ linkage."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "relative space-y-3 border-l-2 border-violet-500/30 pl-6",
					children: stages.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -left-[30px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white shadow",
							children: i + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-white/40 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wide text-violet-500",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-sm",
								children: s.value
							})]
						})]
					}, i))
				})
			})
		]
	});
}
function MindMapTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [tree, setTree] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const printRef = (0, import_react.useRef)(null);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a mind-map root");
		setLoading(true);
		try {
			const d = (await call({ data: {
				kind: "mind_map",
				topic
			} }))?.data;
			if (d?.root) setTree({
				name: d.root,
				children: d.children || []
			});
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const doPrint = () => window.print();
	const doPdf = async () => {
		if (!printRef.current) return;
		try {
			const { downloadPreviewAsPdf } = await import("./preview-pdf-Cet6mvkM.mjs").then((n) => n.n);
			await downloadPreviewAsPdf(printRef.current, `mindmap-${topic || "upsc"}`, { verifyBefore: false });
		} catch {
			toast.info("Use Print → Save as PDF");
			window.print();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Sparkles,
				title: "Mind Maps",
				subtitle: "Interactive, expandable branches. Print or export to PDF.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: doPrint,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "mr-2 h-4 w-4" }), "Print"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: doPdf,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), "PDF"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Root topic (e.g. Indian Federalism)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Generate"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: printRef,
				className: "mt-5 pdf-light-scope rounded-xl bg-white/70 p-4 dark:bg-white/[0.03]",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 4 }) : !tree ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No mind map yet",
					hint: "Enter a topic to grow the tree."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindNodeView, {
					node: tree,
					level: 0,
					defaultOpen: true
				})
			})
		]
	});
}
function MindNodeView({ node, level, defaultOpen }) {
	const [open, setOpen] = (0, import_react.useState)(!!defaultOpen);
	const has = !!(node.children && node.children.length);
	const colors = [
		"from-indigo-500 to-violet-500",
		"from-violet-500 to-fuchsia-500",
		"from-fuchsia-500 to-pink-500",
		"from-pink-500 to-rose-500"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", level > 0 && "ml-4 border-l border-dashed border-violet-400/40 pl-4"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((o) => !o),
			className: cn("my-1 inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm text-white shadow", "bg-gradient-to-r", colors[level % colors.length]),
			children: [has ? open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-white" }), node.name]
		}), has && open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "animate-fade-in",
			children: node.children.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindNodeView, {
				node: c,
				level: level + 1,
				defaultOpen: level < 1
			}, i))
		})]
	});
}
function FlashcardsTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [cards, setCards] = (0, import_react.useState)([]);
	const [idx, setIdx] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [bm, setBm] = (0, import_react.useState)(() => lsGet(LS.bookmarks + ":cards", {}));
	(0, import_react.useEffect)(() => {
		lsSet(LS.bookmarks + ":cards", bm);
	}, [bm]);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a topic");
		setLoading(true);
		try {
			const list = (await call({ data: {
				kind: "flashcards",
				topic
			} }))?.data?.cards ?? [];
			setCards(list.map((c, i) => ({
				...c,
				id: c.id || String(i + 1)
			})));
			setIdx(0);
			setFlipped(false);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const card = cards[idx];
	const swipe = (dir) => {
		if (!cards.length) return;
		setFlipped(false);
		setIdx((i) => (i + dir + cards.length) % cards.length);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: BookmarkCheck,
				title: "Flashcards",
				subtitle: "Swipe, flip, bookmark — build daily streaks."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Topic",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Generate"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid place-items-center",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full max-w-md rounded-2xl" }) : !card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No cards yet",
					hint: "Generate a deck to start."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "[perspective:1200px]",
						onClick: () => setFlipped((f) => !f),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("relative h-56 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer", flipped && "[transform:rotateY(180deg)]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-xl [backface-visibility:hidden]",
								children: [
									card.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-white/20 text-white",
										children: card.tag
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-center text-lg font-semibold",
										children: card.front
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs opacity-70",
										children: "Tap to flip"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-foreground shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center text-sm",
									children: card.back
								})
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => swipe(-1),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-1 h-4 w-4" }), "Prev"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground tabular-nums",
								children: [
									idx + 1,
									" / ",
									cards.length
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setBm((b) => {
										const isBm = !!b[card.id];
										const next = { ...b };
										if (isBm) delete next[card.id];
										else next[card.id] = card;
										return next;
									}),
									children: bm[card.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "h-4 w-4 text-amber-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => swipe(1),
									className: "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white",
									children: ["Next", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-4 w-4" })]
								})]
							})
						]
					})]
				})
			})
		]
	});
}
function NotesTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [md, setMd] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const printRef = (0, import_react.useRef)(null);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a topic");
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "notes",
				topic
			} });
			setMd(res?.markdown || "");
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const doPdf = async () => {
		if (!printRef.current) return;
		try {
			const { downloadPreviewAsPdf } = await import("./preview-pdf-Cet6mvkM.mjs").then((n) => n.n);
			await downloadPreviewAsPdf(printRef.current, `notes-${topic || "upsc"}`, { verifyBefore: false });
		} catch {
			window.print();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: NotebookPen,
				title: "Revision Notes",
				subtitle: "Handwritten-style, bullet-first, UPSC-focused.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: doPdf,
					disabled: !md,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), "PDF"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Topic (e.g. Directive Principles)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Generate"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: printRef,
				className: "pdf-light-scope mt-5 rounded-xl bg-[#fffdf3] p-5 shadow-inner",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 5 }) : !md ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No notes yet",
					hint: "Enter a topic and generate."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: "prose prose-sm max-w-none font-serif prose-headings:font-serif prose-p:leading-relaxed",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
						remarkPlugins: [remarkGfm],
						children: md
					})
				})
			})
		]
	});
}
function PlannerTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [blocks, setBlocks] = (0, import_react.useState)([]);
	const [done, setDone] = (0, import_react.useState)(() => lsGet(LS.read + ":planner", {}));
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		lsSet(LS.read + ":planner", done);
	}, [done]);
	const generate = async () => {
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "planner",
				topic: topic || void 0
			} });
			setBlocks(res?.data?.blocks || []);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const total = blocks.length;
	const doneCount = blocks.filter((b) => done[b.id]).length;
	const pct = total ? Math.round(doneCount / total * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: CalendarDays,
				title: "Daily Revision Planner",
				subtitle: "AI schedules your day. Tick as you go."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Focus (optional, e.g. Polity + Environment)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Plan today"]
				})]
			}),
			total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Today's progress" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: pct,
						className: "h-1.5 flex-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums",
						children: [pct, "%"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 5 }) : total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "No plan yet",
					hint: "Generate today's schedule."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: blocks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-start gap-3 rounded-xl border border-white/40 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]", done[b.id] && "opacity-60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setDone((d) => ({
								...d,
								[b.id]: !d[b.id]
							})),
							className: cn("mt-0.5 grid h-5 w-5 place-items-center rounded-md border", done[b.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"),
							children: done[b.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: b.time
									}), b.gs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
										children: b.gs
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-medium",
									children: b.topic
								}),
								b.goal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: b.goal
								})
							]
						})]
					}, b.id))
				})
			})
		]
	});
}
function WeeklyTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [payload, setPayload] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const generate = async () => {
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "weekly",
				topic: topic || void 0
			} });
			setPayload(res?.data ?? null);
			setAnswers({});
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: CalendarRange,
				title: "Weekly Revision",
				subtitle: "Summary + quick quiz for the week."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Focus (optional)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Summarise week"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500",
						children: "Summary"
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 4 }) : !payload?.summary_md ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No summary yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: "prose prose-sm max-w-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
							remarkPlugins: [remarkGfm],
							children: payload.summary_md
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500",
						children: "Quiz"
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 4 }) : !payload?.quiz?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No quiz yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizList, {
						items: payload.quiz,
						answers,
						setAnswers
					})]
				})]
			})
		]
	});
}
function QuizList({ items, answers, setAnswers }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-4",
		children: items.map((qq, i) => {
			const picked = answers[i];
			const correct = qq.answer;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm font-medium",
					children: [
						i + 1,
						". ",
						qq.q
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-1.5",
					children: (qq.options || []).map((opt, k) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setAnswers({
								...answers,
								[i]: k
							}),
							disabled: picked !== void 0,
							className: cn("rounded-lg border px-3 py-2 text-left text-sm transition-all", picked === void 0 && "hover:bg-muted", picked !== void 0 && k === correct && "border-emerald-500 bg-emerald-500/10", picked === k && k !== correct && "border-rose-500 bg-rose-500/10"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mr-2 text-xs font-bold text-muted-foreground",
								children: [String.fromCharCode(65 + k), "."]
							}), opt]
						}, k);
					})
				}),
				picked !== void 0 && qq.explain && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground",
					children: ["💡 ", qq.explain]
				})
			] }, i);
		})
	});
}
function MonthlyTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [sections, setSections] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const generate = async () => {
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "monthly",
				topic: topic || void 0
			} });
			setSections(res?.data?.sections || []);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: CalendarClock,
				title: "Monthly Revision",
				subtitle: "Compiled current affairs across GS domains."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Focus (optional)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Compile month"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 6 }) : sections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No compilation yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: sections.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: s.title
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "list-disc space-y-1 pl-5 text-sm",
							children: (s.points || []).map((p, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: p }, k))
						})]
					}, i))
				})
			})
		]
	});
}
function QuizTab() {
	const call = useServerFn(runRevisionAi);
	const [mode, setMode] = (0, import_react.useState)("prelims");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [prelims, setPrelims] = (0, import_react.useState)([]);
	const [mains, setMains] = (0, import_react.useState)([]);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [evalQ, setEvalQ] = (0, import_react.useState)("");
	const [evalA, setEvalA] = (0, import_react.useState)("");
	const [evalRes, setEvalRes] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const run = async () => {
		setLoading(true);
		try {
			if (mode === "prelims") {
				if (!topic.trim()) return toast.info("Enter a topic");
				const res = await call({ data: {
					kind: "quiz_prelims",
					topic
				} });
				setPrelims(res?.data?.items || []);
				setAnswers({});
			} else if (mode === "mains") {
				if (!topic.trim()) return toast.info("Enter a topic");
				const res = await call({ data: {
					kind: "quiz_mains",
					topic
				} });
				setMains(res?.data?.items || []);
			} else {
				if (!evalQ.trim() || !evalA.trim()) return toast.info("Enter question and your answer");
				const res = await call({ data: {
					kind: "evaluate_answer",
					question: evalQ,
					answer: evalA
				} });
				setEvalRes(res?.data ?? null);
			}
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: CircleQuestionMark,
				title: "AI Quiz",
				subtitle: "Unlimited Prelims MCQs, Mains questions, and answer evaluation."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PillGroup, {
						value: mode,
						onChange: (v) => setMode(v),
						options: [
							["prelims", "Prelims MCQ"],
							["mains", "Mains Q"],
							["evaluate", "Evaluate Answer"]
						]
					}),
					mode !== "evaluate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
						value: topic,
						onChange: (e) => setTopic(e.target.value),
						placeholder: "Topic",
						className: "flex-1 min-w-[220px]"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: run,
						disabled: loading,
						className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
						children: [
							loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }),
							" ",
							mode === "evaluate" ? "Evaluate" : "Generate"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 5 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					mode === "prelims" && (prelims.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No MCQs yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizList, {
						items: prelims,
						answers,
						setAnswers
					})),
					mode === "mains" && (mains.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No Mains questions yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-3",
						children: mains.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
										children: q.paper
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										children: [q.words, " words"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 text-sm font-medium",
									children: [
										i + 1,
										". ",
										q.question
									]
								}),
								q.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Hint: ", q.hint]
								})
							]
						}, i))
					})),
					mode === "evaluate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
								value: evalQ,
								onChange: (e) => setEvalQ(e.target.value),
								placeholder: "Mains question"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: evalA,
								onChange: (e) => setEvalA(e.target.value),
								placeholder: "Paste your answer…",
								rows: 8
							}),
							evalRes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-2xl font-bold text-emerald-600",
											children: [evalRes.score, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-sm text-muted-foreground",
												children: ["/", evalRes.max]
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 md:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-semibold text-emerald-600",
											children: "Strengths"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-1 list-disc pl-4 text-xs",
											children: (evalRes.strengths || []).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, i))
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-semibold text-rose-600",
											children: "Gaps"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-1 list-disc pl-4 text-xs",
											children: (evalRes.gaps || []).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, i))
										})] })]
									}),
									evalRes.model_answer_md && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-semibold text-violet-600",
											children: "Model answer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
											className: "prose prose-sm max-w-none",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
												remarkPlugins: [remarkGfm],
												children: evalRes.model_answer_md
											})
										})]
									})
								]
							})
						]
					})
				] })
			})
		]
	});
}
function MnemonicsTab() {
	const call = useServerFn(runRevisionAi);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const generate = async () => {
		if (!topic.trim()) return toast.info("Enter a topic");
		setLoading(true);
		try {
			const res = await call({ data: {
				kind: "mnemonics",
				topic
			} });
			setItems(res?.data?.items || []);
		} catch (e) {
			toast.error(e?.message || "Failed");
		} finally {
			setLoading(false);
		}
	};
	const styles = {
		acronym: "from-indigo-500 to-violet-500",
		mnemonic: "from-violet-500 to-fuchsia-500",
		visual: "from-fuchsia-500 to-pink-500",
		story: "from-amber-500 to-orange-500"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: Lightbulb,
				title: "Memory Tricks",
				subtitle: "Mnemonics, acronyms, visuals, story-based learning."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
					value: topic,
					onChange: (e) => setTopic(e.target.value),
					placeholder: "Topic (e.g. Fundamental Duties)",
					className: "flex-1 min-w-[220px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: generate,
					disabled: loading,
					className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), " Generate"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingSkeleton, { rows: 4 }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: "No memory tricks yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("inline-block rounded-md bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white", styles[it.kind] || "from-slate-500 to-slate-700"),
								children: it.kind
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-lg font-bold",
								children: it.trigger
							}),
							it.expansion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: it.expansion
							}),
							it.story && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs italic text-muted-foreground",
								children: [
									"\"",
									it.story,
									"\""
								]
							})
						]
					}, i))
				})
			})
		]
	});
}
function AnalyticsTab() {
	const [time, setTime] = (0, import_react.useState)({});
	const [streak, setStreak] = (0, import_react.useState)({
		last: "",
		count: 0
	});
	const [bmCount, setBmCount] = (0, import_react.useState)(0);
	const [readCount, setReadCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setTime(lsGet(LS.timeLog, {}));
		setStreak(lsGet(LS.streak, {
			last: "",
			count: 0
		}));
		const bm1 = Object.keys(lsGet(LS.bookmarks + ":oneliner", {})).length;
		const bm2 = Object.keys(lsGet(LS.bookmarks + ":cards", {})).length;
		setBmCount(bm1 + bm2);
		setReadCount(Object.keys(lsGet(LS.read + ":oneliner", {})).length);
	}, []);
	const total = Object.values(time).reduce((a, b) => a + b, 0);
	const sorted = Object.entries(time).sort((a, b) => b[1] - a[1]);
	const strong = sorted.slice(0, 3).map(([k]) => k);
	const weak = TABS.map((t) => t.key).filter((k) => !time[k] || time[k] < 6e4).slice(0, 3);
	const fmt = (ms) => {
		const m = Math.floor(ms / 6e4);
		const s = Math.floor(ms % 6e4 / 1e3);
		return m ? `${m}m ${s}s` : `${s}s`;
	};
	const reset = () => {
		[
			"timeLog",
			"streak",
			"read",
			"bookmarks"
		].forEach((_) => {});
		localStorage.removeItem(LS.timeLog);
		localStorage.removeItem(LS.streak);
		localStorage.removeItem(LS.read + ":oneliner");
		localStorage.removeItem(LS.read + ":planner");
		localStorage.removeItem(LS.bookmarks + ":oneliner");
		localStorage.removeItem(LS.bookmarks + ":cards");
		setTime({});
		setStreak({
			last: "",
			count: 0
		});
		setBmCount(0);
		setReadCount(0);
		toast.success("Reset analytics");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GlassCard, {
		className: "p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				icon: ChartColumn,
				title: "Revision Analytics",
				subtitle: "Time, strong & weak areas, AI recommendations.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: reset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-2 h-4 w-4" }), "Reset"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total time",
						value: fmt(total),
						accent: "from-indigo-500 to-violet-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Streak",
						value: `${streak.count}d`,
						accent: "from-amber-500 to-orange-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Bookmarks",
						value: String(bmCount),
						accent: "from-fuchsia-500 to-pink-500"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Facts read",
						value: String(readCount),
						accent: "from-emerald-500 to-teal-500"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 text-xs font-semibold uppercase tracking-wide text-violet-500",
						children: "Time by module"
					}), sorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: "No activity yet",
						hint: "Use any tab to start tracking."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: sorted.map(([k, v]) => {
							const label = TABS.find((t) => t.key === k)?.label || k;
							const pct = total ? Math.round(v / total * 100) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-muted-foreground",
									children: fmt(v)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 h-1.5 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500",
									style: { width: `${pct}%` }
								})
							})] }, k);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 text-xs font-semibold uppercase tracking-wide text-violet-500",
						children: "AI recommendations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold text-emerald-600",
								children: "Strong"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: strong.length ? strong.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-emerald-500/10 text-emerald-600",
									children: TABS.find((t) => t.key === k)?.label || k
								}, k)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Not enough data"
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold text-rose-600",
								children: "Needs work"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: weak.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-rose-500/10 text-rose-600",
									children: TABS.find((t) => t.key === k)?.label || k
								}, k))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground",
								children: "Tip: revise weak modules for 15 minutes today to keep your streak growing."
							})
						]
					})]
				})]
			})
		]
	});
}
function StatCard({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br opacity-70 blur-xl", accent) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-2xl font-bold tabular-nums",
				children: value
			})]
		})]
	});
}
//#endregion
export { RevisionHubPage as component };
