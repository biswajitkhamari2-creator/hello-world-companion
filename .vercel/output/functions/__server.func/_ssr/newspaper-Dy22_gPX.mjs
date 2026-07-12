import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { L as Newspaper, W as LoaderCircle, et as ImagePlus, n as X, s as Upload, y as Sparkles } from "../_libs/lucide-react.mjs";
import { ct as objectType, it as arrayType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/newspaper-Dy22_gPX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var InputSchema = objectType({ images: arrayType(stringType().min(20)).min(1).max(8) });
var analyseNewspaper = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InputSchema.parse(data)).handler(createSsrRpc("9820c5dec79ab9a518a05a3104e4233dc1709d9a8f0b34bbc10b547ea490d000"));
var MAX_FILES = 6;
var MAX_MB = 8;
async function fileToDataUrl(file) {
	return new Promise((res, rej) => {
		const r = new FileReader();
		r.onload = () => res(r.result);
		r.onerror = () => rej(r.error);
		r.readAsDataURL(file);
	});
}
var RELEVANCE_STYLES = {
	"Very High": "bg-emerald-600 text-white",
	High: "bg-emerald-500/90 text-white",
	Medium: "bg-amber-400 text-emerald-950",
	Low: "bg-muted text-muted-foreground"
};
function NewspaperPage() {
	const analyse = useServerFn(analyseNewspaper);
	const [files, setFiles] = (0, import_react.useState)([]);
	const [result, setResult] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const mutation = useMutation({
		mutationFn: async () => {
			if (!files.length) throw new Error("Add at least one newspaper photo.");
			const images = await Promise.all(files.map((f) => fileToDataUrl(f.file)));
			return analyse({ data: { images } });
		},
		onSuccess: (r) => {
			setResult(r);
			if (!r.headlines?.length) toast.info("No UPSC-relevant headlines detected on this page.");
			else toast.success(`Found ${r.headlines.length} UPSC-relevant items`);
		},
		onError: (e) => toast.error(e.message ?? "Analysis failed")
	});
	function addFiles(list) {
		const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
		if (Array.from(list).length - arr.length) toast.error("Only image files (JPG/PNG) are supported.");
		const good = arr.filter((f) => {
			if (f.size > MAX_MB * 1024 * 1024) {
				toast.error(`${f.name}: over ${MAX_MB}MB`);
				return false;
			}
			return true;
		});
		setFiles((prev) => [...prev, ...good.map((file) => ({
			file,
			url: URL.createObjectURL(file)
		}))].slice(0, MAX_FILES));
	}
	function removeAt(i) {
		setFiles((prev) => {
			URL.revokeObjectURL(prev[i].url);
			return prev.filter((_, idx) => idx !== i);
		});
	}
	function reset() {
		files.forEach((f) => URL.revokeObjectURL(f.url));
		setFiles([]);
		setResult(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-amber-500" }), " Newspaper Analyser"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-serif text-3xl sm:text-4xl leading-tight text-foreground",
						children: [
							"Upload today's newspaper. Get only what ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold-shimmer",
								children: "UPSC"
							}),
							" asks."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm text-muted-foreground",
						children: "Snap or scan any page (English or Hindi). AI reads it, discards sports/ads/gossip, and gives you the headlines that matter for Prelims & Mains with GS mapping."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onDragOver: (e) => {
					e.preventDefault();
					setDragOver(true);
				},
				onDragLeave: () => setDragOver(false),
				onDrop: (e) => {
					e.preventDefault();
					setDragOver(false);
					if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
				},
				className: cn("relative rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all backdrop-blur-xl", dragOver ? "border-amber-400 bg-amber-400/10 shadow-gold" : "border-emerald-700/30 dark:border-amber-400/30 bg-card/70"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: "image/*",
					multiple: true,
					capture: "environment",
					className: "hidden",
					onChange: (e) => {
						if (e.target.files) addFiles(e.target.files);
						e.currentTarget.value = "";
					}
				}), files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center gap-3 py-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-500 to-amber-400 text-white shadow-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-8 w-8" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl",
							children: "Drop a newspaper photo here"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"or tap to pick from your phone/camera · up to ",
								MAX_FILES,
								" pages · ",
								MAX_MB,
								"MB each"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => inputRef.current?.click(),
							className: "mt-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), " Choose photos"]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
					children: [files.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: f.url,
								alt: f.file.name,
								className: "h-full w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeAt(i),
								className: "absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100",
								"aria-label": "Remove",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white",
								children: ["p", i + 1]
							})
						]
					}, f.url)), files.length < MAX_FILES && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => inputRef.current?.click(),
						className: "grid aspect-[3/4] place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-amber-400 hover:text-amber-500",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-6 w-6" }), " Add more"]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							files.length,
							" page",
							files.length > 1 ? "s" : "",
							" ready"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: reset,
							disabled: mutation.isPending,
							children: "Clear"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => mutation.mutate(),
							disabled: mutation.isPending,
							className: "gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 text-white shadow-gold hover:opacity-90",
							children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), mutation.isPending ? "Reading newspaper…" : "Extract UPSC headlines"]
						})]
					})]
				})] })]
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-baseline gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "UPSC-Relevant Headlines"
						}),
						result.source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: ["· ", result.source]
						}),
						result.date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: ["· ", result.date]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "ml-auto",
							children: [result.headlines.length, " items"]
						})
					]
				}), result.headlines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border bg-card/70 p-8 text-center text-sm text-muted-foreground backdrop-blur",
					children: "Nothing UPSC-relevant on this page. Try a page with editorial/national/international news."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: result.headlines.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "group relative overflow-hidden rounded-2xl border bg-card/80 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", RELEVANCE_STYLES[h.relevance] ?? RELEVANCE_STYLES.Medium),
										children: h.relevance
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-emerald-700/30 bg-emerald-700/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300",
										children: h.gsPaper
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: h.topic
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-serif text-lg leading-snug text-foreground",
								children: h.headline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: h.summary
							}),
							h.whyItMatters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-amber-700 dark:text-amber-300",
									children: "Why it matters: "
								}), h.whyItMatters]
							}),
							h.keywords?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-1.5",
								children: h.keywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
									children: ["#", k]
								}, k))
							}) : null
						]
					}, i))
				})]
			})
		]
	}) });
}
//#endregion
export { NewspaperPage as component };
