import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { Vt as ArrowLeft, W as LoaderCircle, X as Landmark, mt as Download, n as X, pt as ExternalLink, y as Sparkles } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as downloadPreviewAsPdf } from "./preview-pdf-Cet6mvkM.mjs";
import { n as getOdishaNews, t as extractPcsPoints } from "./odisha-news.functions-CDzyM680.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pcs-digest-CyAGCH3L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACCENTS = {
	emerald: {
		from: "#059669",
		to: "#0d9488",
		ring: "#10b981"
	},
	rose: {
		from: "#e11d48",
		to: "#f59e0b",
		ring: "#fb7185"
	},
	indigo: {
		from: "#4f46e5",
		to: "#d946ef",
		ring: "#818cf8"
	}
};
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
/** Minimal markdown → HTML for headings, bold, italics, lists, paragraphs. */
function mdToHtml(md) {
	const lines = md.replace(/\r\n/g, "\n").split("\n");
	const out = [];
	let inList = null;
	const closeList = () => {
		if (inList) {
			out.push(`</${inList}>`);
			inList = null;
		}
	};
	const inline = (s) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
	for (const raw of lines) {
		const line = raw.trimEnd();
		if (!line.trim()) {
			closeList();
			continue;
		}
		let m;
		if (m = line.match(/^###\s+(.*)$/)) {
			closeList();
			out.push(`<h3>${inline(m[1])}</h3>`);
			continue;
		}
		if (m = line.match(/^##\s+(.*)$/)) {
			closeList();
			out.push(`<h2>${inline(m[1])}</h2>`);
			continue;
		}
		if (m = line.match(/^#\s+(.*)$/)) {
			closeList();
			out.push(`<h1>${inline(m[1])}</h1>`);
			continue;
		}
		if (m = line.match(/^\s*[-*•]\s+(.*)$/)) {
			if (inList !== "ul") {
				closeList();
				out.push("<ul>");
				inList = "ul";
			}
			out.push(`<li>${inline(m[1])}</li>`);
			continue;
		}
		if (m = line.match(/^\s*\d+[.)]\s+(.*)$/)) {
			if (inList !== "ol") {
				closeList();
				out.push("<ol>");
				inList = "ol";
			}
			out.push(`<li>${inline(m[1])}</li>`);
			continue;
		}
		closeList();
		out.push(`<p>${inline(line)}</p>`);
	}
	closeList();
	return out.join("\n");
}
async function downloadStylishArticlePdf(input) {
	const accent = ACCENTS[input.accent ?? "emerald"];
	const bodyHtml = input.html ?? (input.markdown ? mdToHtml(input.markdown) : "");
	const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
	const wrapper = document.createElement("div");
	wrapper.setAttribute("data-stylish-article-pdf", "true");
	wrapper.style.cssText = `
    position: fixed; left: 0; top: 100vh; width: 794px;
    background: #ffffff; color: #0f172a;
    font-family: 'Fraunces', 'Georgia', serif;
    padding: 56px 60px 72px; box-sizing: border-box;
    line-height: 1.6;
    opacity: 1; pointer-events: none; z-index: 0;
  `;
	wrapper.innerHTML = `
    <style>
      [data-stylish-article-pdf] .hero { position: relative; padding: 28px 30px; border-radius: 22px;
        background: linear-gradient(135deg, ${accent.from}, ${accent.to});
        color: #fff; box-shadow: 0 24px 60px -28px ${accent.ring};
        overflow: hidden;
      }
      [data-stylish-article-pdf] .hero::after { content:""; position:absolute; inset:0;
        background: radial-gradient(1200px 200px at 100% 0%, rgba(255,255,255,0.28), transparent 60%);
        pointer-events:none;
      }
      [data-stylish-article-pdf] .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; position:relative; z-index:1; }
      [data-stylish-article-pdf] .chip { display:inline-flex; align-items:center; gap:6px;
        padding:5px 12px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.08em;
        text-transform:uppercase; background:rgba(255,255,255,0.22); color:#fff;
        backdrop-filter: blur(6px); border:1px solid rgba(255,255,255,0.35);
        font-family: 'Inter', system-ui, sans-serif;
      }
      [data-stylish-article-pdf] h1.title { position:relative; z-index:1;
        font-family: 'Fraunces', 'Georgia', serif; font-weight: 800;
        font-size: 40px; line-height: 1.1; margin: 0;
        letter-spacing: -0.02em;
      }
      [data-stylish-article-pdf] .meta { position:relative; z-index:1; margin-top:14px;
        display:flex; gap:18px; align-items:center; font-size:12px;
        font-family: 'Inter', system-ui, sans-serif; color: rgba(255,255,255,0.9);
      }
      [data-stylish-article-pdf] .meta .dot { width:4px; height:4px; border-radius:50%; background:rgba(255,255,255,0.7); }
      [data-stylish-article-pdf] .rule { height:6px; margin: 22px 0 26px; border-radius:999px;
        background: linear-gradient(90deg, ${accent.from}, ${accent.to}, transparent);
      }
      [data-stylish-article-pdf] .body { font-size: 16px; color:#0f172a; }
      [data-stylish-article-pdf] .body h1 { font-size:26px; margin: 26px 0 10px; color:${accent.from}; font-weight:800; }
      [data-stylish-article-pdf] .body h2 { font-size:22px; margin: 22px 0 8px; color:${accent.from}; font-weight:700;
        border-left: 4px solid ${accent.to}; padding-left: 10px;
      }
      [data-stylish-article-pdf] .body h3 { font-size:18px; margin: 18px 0 6px; color:#0f172a; font-weight:700; }
      [data-stylish-article-pdf] .body p { margin: 8px 0 12px; }
      [data-stylish-article-pdf] .body ul, [data-stylish-article-pdf] .body ol { padding-left: 22px; margin: 6px 0 14px; }
      [data-stylish-article-pdf] .body li { margin: 4px 0; }
      [data-stylish-article-pdf] .body strong { color:${accent.from}; }
      [data-stylish-article-pdf] .body code { background:#f1f5f9; padding: 1px 6px; border-radius:6px; font-size: 13px; }
      [data-stylish-article-pdf] .foot { margin-top: 36px; padding-top: 14px;
        border-top: 1px dashed #cbd5e1; font-size: 11px; color:#64748b;
        font-family: 'Inter', system-ui, sans-serif; display:flex; justify-content:space-between; gap:12px;
      }
    </style>
    <div class="hero">
      <div class="chips">
        ${input.category ? `<span class="chip">${escapeHtml(input.category)}</span>` : ""}
        ${input.source ? `<span class="chip">${escapeHtml(input.source)}</span>` : ""}
        <span class="chip">UPSC Genius AI</span>
      </div>
      <h1 class="title">${escapeHtml(input.title)}</h1>
      <div class="meta">
        <span>${dateStr}</span>
        <span class="dot"></span>
        <span>Syllabus-mapped notes</span>
      </div>
    </div>
    <div class="rule"></div>
    <div class="body">${bodyHtml || "<p><em>No content available.</em></p>"}</div>
    <div class="foot">
      <span>Generated by UPSC Genius AI</span>
      ${input.url ? `<span>${escapeHtml(input.url)}</span>` : ""}
    </div>
  `;
	document.body.appendChild(wrapper);
	try {
		await downloadPreviewAsPdf(wrapper, (input.filename || input.title || "article").slice(0, 80), { verifyBefore: false });
	} finally {
		wrapper.remove();
	}
}
function timeAgo(iso) {
	const t = Date.parse(iso);
	if (!t) return "";
	const diff = Date.now() - t;
	const mins = Math.floor(diff / 6e4);
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.floor(hrs / 24)}d ago`;
}
function PcsDigestPage() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [err, setErr] = (0, import_react.useState)(null);
	const [active, setActive] = (0, import_react.useState)(null);
	const [extract, setExtract] = (0, import_react.useState)("");
	const [extracting, setExtracting] = (0, import_react.useState)(false);
	const [extractErr, setExtractErr] = (0, import_react.useState)(null);
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("All");
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			try {
				const res = await getOdishaNews();
				if (alive) setItems(res.items);
			} catch (e) {
				if (alive) setErr(e instanceof Error ? e.message : "Failed to load");
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, []);
	async function runExtract(item) {
		setActive(item);
		setExtract("");
		setExtractErr(null);
		setExtracting(true);
		try {
			const res = await extractPcsPoints({ data: {
				url: item.link,
				title: item.title
			} });
			setExtract(res.markdown);
		} catch (e) {
			setExtractErr(e instanceof Error ? e.message : "Extraction failed");
		} finally {
			setExtracting(false);
		}
	}
	async function downloadActive() {
		if (!active || !extract) return;
		setDownloading(true);
		try {
			await downloadStylishArticlePdf({
				title: active.title,
				source: active.source,
				category: active.category,
				url: active.link,
				markdown: extract,
				accent: "emerald",
				filename: `pcs-${active.title}`
			});
		} finally {
			setDownloading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to home"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-7 w-7 text-emerald-500" }), "National News · PCS Digest"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"Live headlines mapped to the OPSC / State PCS syllabus. Click ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-emerald-600",
							children: "Extract PCS Points"
						}),
						" for exam-ready notes."
					]
				})]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-white/40 backdrop-blur dark:bg-white/5" }, i))
			}),
			err && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-rose-300/40 bg-rose-50/60 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
				children: ["Couldn't load news. ", err]
			}),
			!loading && !err && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: ["All", ...Array.from(new Set(items.map((i) => i.category)))].map((c) => {
					const count = c === "All" ? items.length : items.filter((i) => i.category === c).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(c),
						className: `rounded-full px-3 py-1 text-xs font-semibold transition ${tab === c ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"}`,
						children: [
							c,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "opacity-70",
								children: ["· ", count]
							})
						]
					}, c);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: items.filter((n) => tab === "All" || n.category === tab).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.45)] dark:border-white/10 dark:bg-white/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
									children: n.category
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
									children: n.source
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: n.link,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3",
							children: n.title
						}),
						n.pubDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: timeAgo(n.pubDate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => runExtract(n),
							className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " Extract PCS Points"]
						})
					]
				}, n.link))
			})] }),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
				onClick: () => setActive(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-900",
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] font-semibold uppercase tracking-wider text-emerald-600",
									children: ["PCS Digest · ", active.source]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "mt-1 font-serif text-base font-semibold leading-snug line-clamp-2",
									children: active.title
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setActive(null),
								className: "rounded-full p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-h-[65vh] overflow-y-auto p-5 text-sm",
							children: [
								extracting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Extracting exam-ready points…"]
								}),
								extractErr && !extracting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border border-rose-300/40 bg-rose-50 p-3 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
									children: extractErr
								}),
								!extracting && extract && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "whitespace-pre-wrap font-sans leading-relaxed text-foreground",
									children: extract
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-t border-border/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: active.link,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-xs font-semibold text-emerald-600 hover:underline",
								children: "Open original article →"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: downloadActive,
									disabled: !extract || extracting || downloading,
									className: "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-300/60 transition-all hover:brightness-110 hover:shadow-emerald-500/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse",
									children: [downloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), downloading ? "Preparing…" : "Download PDF"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setActive(null),
									className: "rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground",
									children: "Close"
								})]
							})]
						})
					]
				})
			})
		]
	}) });
}
//#endregion
export { PcsDigestPage as component };
