import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { $ as Image, At as Calendar, Ht as Archive, K as Link, L as Newspaper, M as PenLine, O as RefreshCw, Q as Inbox, Rt as BookOpen, Ut as ArchiveRestore, W as LoaderCircle, d as Trash2, lt as FileText, mt as Download, pt as ExternalLink, y as Sparkles } from "../_libs/lucide-react.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { i as extractDocument } from "./documents.functions-RRwEEipk.mjs";
import { a as listInbox, i as importInboxItem, n as deleteInboxItem, r as deleteInboxItems, t as archiveInboxItem } from "./telegram-inbox.functions-Z2cjJrpK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inbox-BPpBzAnh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var running_kid_default = "/assets/running-kid-BgM5YTHh.png";
function InboxPage() {
	const navigate = useNavigate();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [showArchived, setShowArchived] = (0, import_react.useState)(false);
	const todayIso = () => {
		const d = /* @__PURE__ */ new Date();
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 10);
	};
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(todayIso());
	const [dateFilterOn, setDateFilterOn] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	const list = useServerFn(listInbox);
	const importer = useServerFn(importInboxItem);
	const archiver = useServerFn(archiveInboxItem);
	const deleter = useServerFn(deleteInboxItem);
	const bulkDeleter = useServerFn(deleteInboxItems);
	const extract = useServerFn(extractDocument);
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["telegram-inbox", showArchived ? "archived" : "active"],
		queryFn: () => list({ data: { archived: showArchived } }),
		enabled: ready,
		refetchInterval: 6e4
	});
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const [busyAction, setBusyAction] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	function toggleSelect(id) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}
	function setActiveDoc(documentId) {
		try {
			sessionStorage.setItem("active_doc_id", documentId);
		} catch {}
	}
	async function doImport(item, autoRun) {
		setBusyId(item.id);
		setBusyAction(autoRun ?? "import");
		try {
			const r = await importer({ data: { itemId: item.id } });
			setActiveDoc(r.documentId);
			if (autoRun) try {
				sessionStorage.setItem("auto_run_type", autoRun);
				sessionStorage.setItem("auto_run_doc", r.documentId);
			} catch {}
			extract({ data: { documentId: r.documentId } }).catch(() => {});
			toast.success(autoRun ? `Imported — starting ${autoRun.replace("_", " ")}…` : "Imported to your library");
			qc.invalidateQueries({ queryKey: ["documents"] });
			navigate({ to: "/dashboard" });
		} catch (e) {
			toast.error(e.message || "Import failed");
		} finally {
			setBusyId(null);
			setBusyAction(null);
		}
	}
	const archiveMut = useMutation({
		mutationFn: ({ itemId, archived }) => archiver({ data: {
			itemId,
			archived
		} }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["telegram-inbox"] });
			toast.success("Updated");
		},
		onError: (e) => toast.error(e.message)
	});
	const deleteMut = useMutation({
		mutationFn: (itemId) => deleter({ data: { itemId } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["telegram-inbox"] });
			toast.success("Deleted");
		},
		onError: (e) => toast.error(e.message)
	});
	const bulkDeleteMut = useMutation({
		mutationFn: (itemIds) => bulkDeleter({ data: { itemIds } }),
		onSuccess: (r) => {
			qc.invalidateQueries({ queryKey: ["telegram-inbox"] });
			setSelected(/* @__PURE__ */ new Set());
			toast.success(`Deleted ${r?.deleted ?? ""} item(s)`);
		},
		onError: (e) => toast.error(e.message)
	});
	const allItems = q.data ?? [];
	const sameLocalDay = (iso, ymd) => {
		const d = new Date(iso);
		return (/* @__PURE__ */ new Date(d.getTime() - d.getTimezoneOffset() * 6e4)).toISOString().slice(0, 10) === ymd;
	};
	const filteredItems = dateFilterOn ? allItems.filter((it) => sameLocalDay(it.posted_at, selectedDate)) : allItems;
	const pdfsForDay = filteredItems.filter((it) => it.kind === "pdf" && !it.archived_at);
	async function fetchDayMaterial() {
		if (!pdfsForDay.length) {
			toast.info(`No newspaper PDF posted on ${selectedDate}. Post it in the channel and retry.`);
			return;
		}
		const main = [...pdfsForDay].sort((a, b) => (b.size_bytes ?? 0) - (a.size_bytes ?? 0))[0];
		toast.success(`Found ${pdfsForDay.length} PDF${pdfsForDay.length > 1 ? "s" : ""} for ${selectedDate}. Starting newspaper analysis…`);
		await doImport(main, "newspaper");
	}
	function shiftDay(delta) {
		const d = /* @__PURE__ */ new Date(selectedDate + "T00:00:00");
		d.setDate(d.getDate() + delta);
		setSelectedDate(d.toISOString().slice(0, 10));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-[calc(100vh-3rem)] overflow-hidden bg-gradient-to-br from-indigo-200 via-sky-200 to-amber-100",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: running_kid_default,
				alt: "",
				"aria-hidden": "true",
				loading: "lazy",
				width: 140,
				height: 140,
				className: "pointer-events-none absolute bottom-24 left-0 z-0 h-28 w-28 sm:h-36 sm:w-36 animate-kid-run drop-shadow-xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 -z-0 opacity-70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 1440 320",
						xmlns: "http://www.w3.org/2000/svg",
						className: "w-full h-64 sm:h-80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							fill: "#6366f1",
							fillOpacity: "0.18",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animate", {
								attributeName: "d",
								dur: "9s",
								repeatCount: "indefinite",
								values: "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,165.3C960,149,1056,139,1152,154.7C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z;\r\n                        M0,192L48,202.7C96,213,192,235,288,224C384,213,480,171,576,165.3C672,160,768,192,864,213.3C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L0,320Z;\r\n                        M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,165.3C960,149,1056,139,1152,154.7C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 1440 320",
						xmlns: "http://www.w3.org/2000/svg",
						className: "w-full h-56 sm:h-72 -mt-48 sm:-mt-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							fill: "#0ea5e9",
							fillOpacity: "0.16",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animate", {
								attributeName: "d",
								dur: "12s",
								repeatCount: "indefinite",
								values: "M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,138.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z;\r\n                        M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,202.7C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z;\r\n                        M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,138.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 1440 320",
						xmlns: "http://www.w3.org/2000/svg",
						className: "w-full h-48 sm:h-64 -mt-40 sm:-mt-52",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							fill: "#f59e0b",
							fillOpacity: "0.14",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animate", {
								attributeName: "d",
								dur: "15s",
								repeatCount: "indefinite",
								values: "M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z;\r\n                        M0,224L48,240C96,256,192,288,288,282.7C384,277,480,235,576,224C672,213,768,235,864,234.7C960,235,1056,213,1152,213.3C1248,213,1344,235,1392,245.3L1440,256L1440,320L0,320Z;\r\n                        M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z"
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-end justify-between gap-3 mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-serif text-2xl sm:text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-700 via-sky-600 to-amber-600 bg-clip-text text-transparent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-5 w-5" })
								}), "Telegram Inbox"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-indigo-900/70 mt-1",
								children: "Auto-syncs every PDF, image, and link posted in your Sidheswar Civil Mentor channel."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: showArchived ? "default" : "outline",
								size: "sm",
								className: "rounded-full shadow-sm",
								onClick: () => setShowArchived((v) => !v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "h-4 w-4 mr-1.5" }), showArchived ? "Showing archived" : "Show archived"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "rounded-full bg-white/50 backdrop-blur hover:bg-white/70",
								onClick: () => q.refetch(),
								disabled: q.isFetching,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${q.isFetching ? "animate-spin" : ""}` })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mb-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-amber-50/40 p-4 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-indigo-900",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-serif font-semibold",
										children: "Pick a date"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => shiftDay(-1),
											children: "‹"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "date",
											value: selectedDate,
											max: todayIso(),
											onChange: (e) => {
												setSelectedDate(e.target.value || todayIso());
												setDateFilterOn(true);
											},
											className: "h-9 rounded-md border border-indigo-300 bg-indigo-50/80 backdrop-blur px-2 text-sm text-indigo-900"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => shiftDay(1),
											disabled: selectedDate >= todayIso(),
											children: "›"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: dateFilterOn ? "default" : "outline",
									onClick: () => setDateFilterOn((v) => !v),
									children: dateFilterOn ? "Date filter ON" : "Date filter OFF"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => {
										setSelectedDate(todayIso());
										setDateFilterOn(true);
									},
									variant: "ghost",
									children: "Today"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "text-[11px]",
										children: [
											filteredItems.length,
											" item",
											filteredItems.length === 1 ? "" : "s"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: fetchDayMaterial,
										disabled: busyId !== null,
										className: "bg-indigo-700 hover:bg-indigo-800",
										children: [
											busyId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
											"Fetch & analyse ",
											selectedDate
										]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-indigo-900/70",
							children: "AI will pull the newspaper PDF posted on the selected day from your Telegram channel and start the full UPSC analysis."
						})]
					}),
					filteredItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-white/70 backdrop-blur px-3 py-2 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm text-indigo-900",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "h-4 w-4 accent-indigo-600",
									checked: selected.size > 0 && filteredItems.every((it) => selected.has(it.id)),
									ref: (el) => {
										if (el) el.indeterminate = selected.size > 0 && !filteredItems.every((it) => selected.has(it.id));
									},
									onChange: (e) => {
										if (e.target.checked) setSelected(new Set(filteredItems.map((it) => it.id)));
										else setSelected(/* @__PURE__ */ new Set());
									}
								}), "Select all"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-indigo-900/70",
								children: [selected.size, " selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setSelected(/* @__PURE__ */ new Set()),
									disabled: !selected.size,
									children: "Clear"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "destructive",
									onClick: () => {
										const ids = Array.from(selected);
										if (!ids.length) return;
										if (confirm(`Delete ${ids.length} inbox item(s) permanently?`)) bulkDeleteMut.mutate(ids);
									},
									disabled: !selected.size || bulkDeleteMut.isPending,
									children: [bulkDeleteMut.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1.5" }), "Delete selected"]
								})]
							})
						]
					}),
					q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading inbox…"]
					}) : !filteredItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 backdrop-blur-md p-10 text-center shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-serif text-lg",
								children: showArchived ? "No archived items" : dateFilterOn ? `Nothing posted on ${selectedDate}` : "No incoming posts yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: dateFilterOn ? "Try another date, or turn off the date filter to see everything." : "Post a PDF, image, or link in the channel — it appears here within seconds."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-3",
						children: filteredItems.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "group relative rounded-2xl border border-white/60 bg-white/55 backdrop-blur-xl p-4 shadow-lg ring-1 ring-indigo-100/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-indigo-300/60 overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100/40 via-sky-100/30 to-amber-100/40 opacity-70 group-hover:opacity-100 transition-opacity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: `pointer-events-none absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${it.kind === "pdf" ? "bg-gradient-to-b from-rose-400 to-rose-600" : it.kind === "image" ? "bg-gradient-to-b from-emerald-400 to-emerald-600" : "bg-gradient-to-b from-sky-400 to-sky-600"}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "mt-2 h-4 w-4 shrink-0 accent-indigo-600",
											checked: selected.has(it.id),
											onChange: () => toggleSelect(it.id),
											"aria-label": "Select item"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${it.kind === "pdf" ? "bg-gradient-to-br from-rose-500 to-rose-700" : it.kind === "image" ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-sky-500 to-sky-700"}`,
											children: it.kind === "pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" }) : it.kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium truncate",
															children: it.file_name || it.source_url || it.caption?.slice(0, 80) || "Untitled"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "uppercase text-[10px]",
															children: it.kind
														}),
														it.archived_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "text-[10px]",
															children: "archived"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "icon",
															variant: "ghost",
															className: "ml-auto h-7 w-7 text-rose-600 hover:bg-rose-100 hover:text-rose-700",
															onClick: () => {
																if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
															},
															disabled: deleteMut.isPending,
															"aria-label": "Delete",
															title: "Delete",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
														})
													]
												}),
												it.caption && it.file_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground line-clamp-2 mt-1",
													children: it.caption
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[11px] text-muted-foreground mt-1",
													children: [new Date(it.posted_at).toLocaleString(), it.size_bytes ? ` · ${Math.round(it.size_bytes / 1024).toLocaleString()} KB` : ""]
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [it.kind === "link" && it.source_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: it.source_url,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5 mr-1.5" }), " Open link"]
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											onClick: () => doImport(it, null),
											disabled: busyId === it.id,
											children: [busyId === it.id && busyAction === "import" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), "Import"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											className: "border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800",
											onClick: () => {
												if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
											},
											disabled: deleteMut.isPending,
											"aria-label": "Delete",
											title: "Delete",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1.5" }), " Delete"]
										}),
										it.kind === "pdf" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => doImport(it, "newspaper"),
												disabled: busyId === it.id,
												className: "border-green-400 text-green-700 hover:bg-green-50 animate-pulse",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-3.5 w-3.5 mr-1.5" }), " Analyse as Newspaper"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => doImport(it, "short_notes"),
												disabled: busyId === it.id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5 mr-1.5" }), " Generate Notes"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => doImport(it, "handwritten_notes"),
												disabled: busyId === it.id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5 mr-1.5" }), " Handwritten Notes"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => doImport(it, "infographics"),
												disabled: busyId === it.id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 mr-1.5" }), " Generate Infographic"]
											})
										] })
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "ml-auto flex gap-2",
										children: [it.archived_at ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => archiveMut.mutate({
												itemId: it.id,
												archived: false
											}),
											disabled: archiveMut.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { className: "h-3.5 w-3.5 mr-1.5" }), " Unarchive"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => archiveMut.mutate({
												itemId: it.id,
												archived: true
											}),
											disabled: archiveMut.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "h-3.5 w-3.5 mr-1.5" }), " Archive"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											className: "text-rose-700 hover:bg-rose-50 hover:text-rose-800",
											onClick: () => {
												if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
											},
											disabled: deleteMut.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1.5" }), " Delete"]
										})]
									})]
								})
							]
						}, it.id))
					})
				]
			})
		]
	}) });
}
//#endregion
export { InboxPage as component };
