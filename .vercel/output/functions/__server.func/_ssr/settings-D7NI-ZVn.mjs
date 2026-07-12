import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { E as RotateCcw, R as Moon, T as Save, at as Globe, b as Shield, c as Type, m as Sun, mt as Download, t as Zap, x as Settings, y as Sparkles, zt as Bell } from "../_libs/lucide-react.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-D7NI-ZVn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULTS = {
	language: "en",
	theme: "system",
	fontSize: "md",
	notifications: true,
	emailDigest: false,
	autoStamp: false,
	aiProvider: "auto",
	aiTone: "balanced",
	autoOcr: true,
	saveHistory: true,
	telegramImport: true,
	defaultSubject: "General Studies"
};
var KEY = "upsc_settings_v1";
function load() {
	if (typeof window === "undefined") return DEFAULTS;
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? {
			...DEFAULTS,
			...JSON.parse(raw)
		} : DEFAULTS;
	} catch {
		return DEFAULTS;
	}
}
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const resolved = theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
	root.classList.toggle("dark", resolved === "dark");
}
function applyFontSize(size) {
	if (typeof document === "undefined") return;
	const px = size === "sm" ? "15px" : size === "lg" ? "18px" : "16px";
	document.documentElement.style.fontSize = px;
}
function SettingsPage() {
	const [prefs, setPrefs] = (0, import_react.useState)(DEFAULTS);
	const [dirty, setDirty] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const p = load();
		setPrefs(p);
		applyTheme(p.theme);
		applyFontSize(p.fontSize);
	}, []);
	function update(k, v) {
		setPrefs((p) => ({
			...p,
			[k]: v
		}));
		setDirty(true);
	}
	function save() {
		localStorage.setItem(KEY, JSON.stringify(prefs));
		applyTheme(prefs.theme);
		applyFontSize(prefs.fontSize);
		setDirty(false);
		toast.success("Settings saved");
	}
	function reset() {
		setPrefs(DEFAULTS);
		localStorage.removeItem(KEY);
		applyTheme(DEFAULTS.theme);
		applyFontSize(DEFAULTS.fontSize);
		setDirty(false);
		toast.success("Reset to defaults");
	}
	function exportData() {
		const blob = new Blob([JSON.stringify({
			settings: prefs,
			bookmarks: JSON.parse(localStorage.getItem("upsc_bookmarks_v1") || "[]")
		}, null, 2)], { type: "application/json" });
		import("./downloads-store-CplUgcTw.mjs").then(({ saveAndDownload }) => saveAndDownload(blob, "upsc-genius-data.json", {
			kind: "data",
			source: "settings-export"
		}));
		toast.success("Data exported");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-3xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-center gap-3 animate-fade-in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-2xl font-bold",
						children: "Settings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Language, theme, notifications aur AI preferences — sab yahan customize karo."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						icon: Globe,
						title: "Language & Region",
						delay: 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							label: "App Language",
							value: prefs.language,
							onChange: (v) => update("language", v),
							options: [
								{
									v: "en",
									l: "English"
								},
								{
									v: "hi",
									l: "हिन्दी (Hindi)"
								},
								{
									v: "hinglish",
									l: "Hinglish (Mixed)"
								},
								{
									v: "or",
									l: "ଓଡ଼ିଆ (Odia)"
								}
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "Default Subject",
							value: prefs.defaultSubject,
							onChange: (v) => update("defaultSubject", v),
							placeholder: "e.g. Polity, Economy, GS-I"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						icon: prefs.theme === "dark" ? Moon : Sun,
						title: "Appearance",
						delay: 40,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							label: "Theme",
							value: prefs.theme,
							onChange: (v) => update("theme", v),
							options: [
								{
									v: "light",
									l: "Light"
								},
								{
									v: "dark",
									l: "Dark"
								},
								{
									v: "system",
									l: "Match system"
								}
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "h-3 w-3" }), " Font Size"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: [
								"sm",
								"md",
								"lg"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => update("fontSize", s),
								className: `flex-1 rounded-lg border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 ${prefs.fontSize === s ? "border-indigo-500 bg-indigo-500/10 font-semibold shadow-sm" : "border-border bg-background hover:bg-accent/40"}`,
								children: s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"
							}, s))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						icon: Bell,
						title: "Notifications",
						delay: 80,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "In-app notifications",
							hint: "Generation complete, Telegram inbox updates, AI quota alerts",
							checked: prefs.notifications,
							onChange: (v) => update("notifications", v)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Weekly email digest",
							hint: "Summary of what you studied last week",
							checked: prefs.emailDigest,
							onChange: (v) => update("emailDigest", v)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						icon: Sparkles,
						title: "AI & Generation",
						delay: 120,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Preferred AI Provider",
								value: prefs.aiProvider,
								onChange: (v) => update("aiProvider", v),
								options: [
									{
										v: "auto",
										l: "Auto (recommended)"
									},
									{
										v: "gemini",
										l: "Google Gemini 2.5 Flash"
									},
									{
										v: "groq",
										l: "Groq Llama 3.3"
									},
									{
										v: "nvidia",
										l: "NVIDIA NIM"
									}
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Response Style",
								value: prefs.aiTone,
								onChange: (v) => update("aiTone", v),
								options: [
									{
										v: "concise",
										l: "Concise — bullet points only"
									},
									{
										v: "balanced",
										l: "Balanced — default"
									},
									{
										v: "detailed",
										l: "Detailed — exam-ready notes"
									}
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Auto OCR fallback",
								hint: "Scanned PDFs pe automatically Vision OCR chalao",
								checked: prefs.autoOcr,
								onChange: (v) => update("autoOcr", v)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						icon: Shield,
						title: "Documents & Privacy",
						delay: 160,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Auto-stamp exported PDFs",
								hint: "Har download pe watermark/logo automatically lagao",
								checked: prefs.autoStamp,
								onChange: (v) => update("autoStamp", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Save generation history",
								hint: "Notes aur verifications ko history mein rakho",
								checked: prefs.saveHistory,
								onChange: (v) => update("saveHistory", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Telegram inbox import",
								hint: "Forwarded messages ko auto-import karo",
								checked: prefs.telegramImport,
								onChange: (v) => update("telegramImport", v)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						icon: Zap,
						title: "Data",
						delay: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: exportData,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), " Export my data (JSON)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: reset,
								className: "text-rose-700 hover:bg-rose-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-1.5 h-3.5 w-3.5" }), " Reset all settings"]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-4 mt-6 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					onClick: save,
					disabled: !dirty,
					className: "shadow-lg transition-all disabled:opacity-40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1.5 h-4 w-4" }),
						dirty ? "Save changes" : "Saved",
						dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "ml-2 border-white/40 bg-white/10 text-white",
							children: "Unsaved"
						})
					]
				})
			})
		]
	}) });
}
function Section({ icon: Icon, title, children, delay = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in",
		style: {
			animationDelay: `${delay}ms`,
			animationFillMode: "both"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-4 flex items-center gap-2 font-serif text-sm font-bold uppercase tracking-wide text-foreground/80",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-indigo-500" }),
				" ",
				title
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children
		})]
	});
}
function Select({ label, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (e) => onChange(e.target.value),
			className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: o.v,
				children: o.l
			}, o.v))
		})]
	});
}
function TextField({ label, value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "text",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
		})]
	});
}
function Toggle({ label, hint, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: label
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: hint
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "switch",
			"aria-checked": checked,
			onClick: () => onChange(!checked),
			className: `relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-all ${checked ? "border-indigo-500 bg-indigo-500" : "border-border bg-muted"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 h-4.5 w-4.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}` })
		})]
	});
}
//#endregion
export { SettingsPage as component };
