import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { Bt as ArrowRight, Ft as Bot, L as Newspaper, M as PenLine, Pt as Brain, R as Moon, Rt as BookOpen, W as LoaderCircle, X as Landmark, f as Target, kt as ChartColumn, m as Sun, mt as Download, n as X, pt as ExternalLink, r as WandSparkles, w as Search, y as Sparkles } from "../_libs/lucide-react.mjs";
import { n as useTheme } from "./theme-provider-BDj6-vq5.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as downloadPreviewAsPdf } from "./preview-pdf-Cet6mvkM.mjs";
import { n as getArticleCrispNotes, t as getArticleComprehensiveNotes } from "./institution-news.functions-BJVeekZ0.mjs";
import { n as getOdishaNews } from "./odisha-news.functions-CDzyM680.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BNwB6H0u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getUpscNews = createServerFn({ method: "GET" }).handler(createSsrRpc("0a2e5ee9c78971b91aa04d603f966113c047e01469f51c5517ae446647c0d84f"));
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
function AuroraBackdrop() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.35),transparent_60%)] blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.30),transparent_60%)] blur-3xl animate-[auroraA_14s_ease-in-out_infinite]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.28),transparent_60%)] blur-3xl animate-[auroraB_16s_ease-in-out_infinite]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.25),transparent_60%)] blur-3xl animate-[auroraC_18s_ease-in-out_infinite]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-[0.08] dark:opacity-[0.12]",
				style: {
					backgroundImage: "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
					maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)"
				}
			}),
			Array.from({ length: 22 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute h-1 w-1 rounded-full bg-white/80 shadow-[0_0_12px_2px_rgba(147,197,253,0.7)]",
				style: {
					top: `${i * 41 % 100}%`,
					left: `${i * 67 % 100}%`,
					animation: `particleFloat ${8 + i % 6}s ease-in-out ${i * .25}s infinite alternate`,
					opacity: .5
				}
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes auroraA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
        @keyframes auroraB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,20px) scale(1.15)} }
        @keyframes auroraC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-40px) scale(1.1)} }
        @keyframes particleFloat { from{transform:translateY(0);opacity:.3} to{transform:translateY(-30px);opacity:.9} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatYRev { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        @keyframes typing { from{width:0} to{width:100%} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 30px rgba(37,99,235,.35),0 0 60px rgba(124,58,237,.25)} 50%{box-shadow:0 0 45px rgba(37,99,235,.6),0 0 90px rgba(124,58,237,.4)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .fade-up { animation: fadeUp .8s ease-out both; }
      ` })
		]
	});
}
var PLACEHOLDERS = [
	"Ask about Indian Polity…",
	"Explain Fundamental Rights…",
	"Prepare today's Current Affairs…",
	"Generate an Ethics answer…",
	"Solve CSAT questions…",
	"Summarise The Hindu editorial…"
];
function useRotatingPlaceholder() {
	const [text, setText] = (0, import_react.useState)("");
	const [i, setI] = (0, import_react.useState)(0);
	const [phase, setPhase] = (0, import_react.useState)("typing");
	(0, import_react.useEffect)(() => {
		const current = PLACEHOLDERS[i % PLACEHOLDERS.length];
		let t;
		if (phase === "typing") if (text.length < current.length) t = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
		else t = setTimeout(() => setPhase("pausing"), 1400);
		else if (phase === "pausing") t = setTimeout(() => setPhase("deleting"), 400);
		else if (text.length > 0) t = setTimeout(() => setText(current.slice(0, text.length - 1)), 25);
		else {
			setI((v) => v + 1);
			setPhase("typing");
		}
		return () => clearTimeout(t);
	}, [
		text,
		phase,
		i
	]);
	return text;
}
function AiMentorArt() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto aspect-square w-full max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-4 rounded-full border border-white/10",
				style: { animation: "spinSlow 40s linear infinite" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-10 rounded-full border border-white/5",
				style: { animation: "spinSlow 60s linear infinite reverse" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] p-[2px]",
				style: { animation: "glowPulse 4s ease-in-out infinite" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full w-full items-center justify-center rounded-full bg-slate-950/90 backdrop-blur-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-8 w-8 text-white" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 bg-gradient-to-r from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text text-sm font-bold tracking-wide text-transparent",
								children: "GENIUS AI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[10px] uppercase tracking-widest text-white/50",
								children: "Mentor Online"
							})
						]
					})
				})
			}),
			[
				{
					icon: BookOpen,
					label: "Current Affairs",
					top: "6%",
					left: "-4%",
					d: 0
				},
				{
					icon: Brain,
					label: "AI Mentor",
					top: "0%",
					right: "-6%",
					d: 1
				},
				{
					icon: PenLine,
					label: "Answer Writing",
					top: "58%",
					left: "-8%",
					d: 2
				},
				{
					icon: ChartColumn,
					label: "Performance",
					top: "62%",
					right: "-10%",
					d: 3
				},
				{
					icon: Target,
					label: "Daily Planner",
					top: "30%",
					right: "-14%",
					d: 1.5
				}
			].map((c, idx) => {
				const Icon = c.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] backdrop-blur-xl",
					style: {
						top: c.top,
						left: c.left,
						right: c.right,
						animation: `${idx % 2 ? "floatYRev" : "floatY"} ${5 + idx}s ease-in-out ${c.d}s infinite`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-white/90 whitespace-nowrap",
							children: c.label
						})]
					})
				}, c.label);
			})
		]
	});
}
function HeroStatChips() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: [
			{
				k: "50,000+",
				v: "Questions"
			},
			{
				k: "AI",
				v: "Powered"
			},
			{
				k: "24×7",
				v: "Mentor"
			},
			{
				k: "UPSC",
				v: "Ready"
			}
		].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center backdrop-blur-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-gradient-to-r from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text text-sm font-black text-transparent",
				children: s.k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-widest text-white/60",
				children: s.v
			})]
		}, s.v))
	});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative isolate bg-[#020617] text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuroraBackdrop, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PcsDigestPreview, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpscNews, {})
			]
		})]
	}) });
}
function Hero() {
	const [q, setQ] = (0, import_react.useState)("");
	const { theme, toggle } = useTheme();
	const placeholder = useRotatingPlaceholder();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fade-up text-center lg:text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 backdrop-blur",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI · Syllabus aligned · PYQ mapped"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-5 font-serif text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[64px]",
						children: [
							"Crack UPSC with the",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#FB923C] bg-clip-text text-transparent",
								children: "Power of AI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggle,
								"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
								className: "ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 align-middle text-white shadow-md backdrop-blur-xl transition-all hover:scale-110",
								children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4 text-amber-300" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4 text-blue-200" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-xl text-base text-white/70 lg:mx-0 sm:text-lg",
						children: "Your personal AI mentor for Prelims, Mains, Optional, Current Affairs, Answer Writing and Interview Preparation."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							const t = q.trim();
							window.location.href = t ? `/mentor?q=${encodeURIComponent(t)}` : "/mentor";
						},
						className: "mt-7 w-full max-w-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "group relative flex items-center rounded-2xl border border-white/15 bg-white/[0.06] p-1.5 shadow-[0_15px_50px_-18px_rgba(37,99,235,0.7)] backdrop-blur-xl transition-all focus-within:border-blue-400/60 focus-within:shadow-[0_20px_60px_-18px_rgba(124,58,237,0.8)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "ml-3 h-4 w-4 shrink-0 text-white/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: q,
									onChange: (e) => setQ(e.target.value),
									placeholder: placeholder || "Ask Genius AI anything…",
									className: "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-white placeholder:text-white/50 focus:outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									className: "inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Ask"]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStatChips, {})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fade-up relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiMentorArt, {})
			})]
		})
	});
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
function UpscNews() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [err, setErr] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("GS1");
	const [active, setActive] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("crisp");
	const [crisp, setCrisp] = (0, import_react.useState)(null);
	const [comprehensive, setComprehensive] = (0, import_react.useState)(null);
	const [notesErr, setNotesErr] = (0, import_react.useState)(null);
	const [notesLoading, setNotesLoading] = (0, import_react.useState)(false);
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const notesRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			try {
				const res = await getUpscNews();
				if (!alive) return;
				setItems(res.items);
			} catch (e) {
				if (!alive) return;
				setErr(e instanceof Error ? e.message : "Failed to load news");
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, []);
	async function openNotes(item, next) {
		setActive(item);
		setMode(next);
		setCrisp(null);
		setComprehensive(null);
		setNotesErr(null);
		setNotesLoading(true);
		try {
			if (next === "crisp") {
				const res = await getArticleCrispNotes({ data: {
					url: item.link,
					sourceLabel: item.source
				} });
				setCrisp(res);
			} else {
				const res = await getArticleComprehensiveNotes({ data: {
					url: item.link,
					sourceLabel: item.source
				} });
				setComprehensive(res);
			}
		} catch (e) {
			setNotesErr(e instanceof Error ? e.message : "Could not generate notes");
		} finally {
			setNotesLoading(false);
		}
	}
	async function switchMode(next) {
		if (!active || next === mode) return;
		setMode(next);
		if (next === "crisp" && crisp) return;
		if (next === "comprehensive" && comprehensive) return;
		setNotesErr(null);
		setNotesLoading(true);
		try {
			if (next === "crisp") {
				const res = await getArticleCrispNotes({ data: {
					url: active.link,
					sourceLabel: active.source
				} });
				setCrisp(res);
			} else {
				const res = await getArticleComprehensiveNotes({ data: {
					url: active.link,
					sourceLabel: active.source
				} });
				setComprehensive(res);
			}
		} catch (e) {
			setNotesErr(e instanceof Error ? e.message : "Could not generate notes");
		} finally {
			setNotesLoading(false);
		}
	}
	const tabs = [
		{
			key: "GS1",
			label: "GS-I · History & Society"
		},
		{
			key: "GS2",
			label: "GS-II · Polity & IR"
		},
		{
			key: "GS3",
			label: "GS-III · Economy, Env, S&T"
		},
		{
			key: "GS4",
			label: "GS-IV · Ethics"
		}
	];
	const filtered = items.filter((n) => n.gs === tab);
	async function downloadNotesPdf() {
		if (!active || !notesRef.current) return;
		setDownloading(true);
		try {
			await downloadPreviewAsPdf(notesRef.current, `${active.source}-${active.title}`.slice(0, 80), { verifyBefore: false });
		} finally {
			setDownloading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "h-6 w-6 text-rose-500" }), "UPSC News · Today"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Live headlines mapped to GS papers."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: tabs.map((t) => {
					const active = tab === t.key;
					const count = items.filter((n) => n.gs === t.key).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.key),
						className: `rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active ? "border-transparent bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md" : "border-white/40 bg-white/60 text-foreground/70 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`,
						children: [t.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-foreground/10"}`,
							children: count
						})]
					}, t.key);
				})
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-white/40 backdrop-blur dark:bg-white/5" }, i))
			}),
			err && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-rose-300/40 bg-rose-50/60 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
				children: ["Couldn't load news right now. ", err]
			}),
			!loading && !err && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-white/40 bg-white/60 p-6 text-center text-sm text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-white/5",
				children: [
					"No ",
					tab,
					" headlines right now. Try another paper."
				]
			}),
			!loading && !err && filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: filtered.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative flex flex-col rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(244,63,94,0.45)] dark:border-white/10 dark:bg-white/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
									children: n.gs
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
									children: n.source
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: n.link,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-muted-foreground hover:text-foreground",
								title: "Open source article",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3",
							children: n.title
						}),
						n.pubDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-[11px] text-muted-foreground",
							children: timeAgo(n.pubDate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openNotes(n, "crisp"),
								className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " Crisp Notes"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openNotes(n, "comprehensive"),
								className: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "h-3 w-3" }), " Comprehensive"]
							})]
						})
					]
				}, n.link))
			}),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm",
				onClick: () => setActive(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative my-6 w-full max-w-3xl rounded-2xl border border-border bg-card text-foreground shadow-2xl",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-t-2xl border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs uppercase tracking-wider text-muted-foreground",
									children: active.source
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: active.title
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: downloadNotesPdf,
								disabled: downloading || notesLoading || !crisp && !comprehensive,
								className: "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/40 ring-1 ring-rose-300/60 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse",
								title: "Download stylish PDF",
								children: [downloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), downloading ? "Preparing…" : "Download PDF"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setActive(null),
								className: "rounded-full p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: notesRef,
						className: "max-h-[75vh] overflow-y-auto px-6 py-5",
						children: [
							notesLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 py-8 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Generating syllabus-tagged notes…"]
							}),
							notesErr && !notesLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border border-rose-300/40 bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
								children: notesErr
							}),
							!notesLoading && !notesErr && mode === "crisp" && crisp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrispNotesView, { notes: crisp }),
							!notesLoading && !notesErr && mode === "comprehensive" && comprehensive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComprehensiveNotesView, { notes: comprehensive })
						]
					})]
				})
			})
		]
	});
}
function PcsDigestPreview() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [err, setErr] = (0, import_react.useState)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
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
	(0, import_react.useEffect)(() => {
		const el = document.getElementById("pcs-digest-preview");
		if (!el) return;
		const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)), { threshold: .12 });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	const top3 = items.slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "pcs-digest-preview",
		className: `mt-10 transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-6 w-6 text-emerald-400" }), "National News · PCS Digest"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-white/60",
					children: "Latest 3 syllabus-mapped headlines from across the country."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/pcs-digest",
					className: "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/10",
					children: ["View All National News ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
				})]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-white/5 backdrop-blur" }, i))
			}),
			err && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm text-rose-200",
				children: ["Couldn't load PCS Digest. ", err]
			}),
			!loading && !err && top3.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: top3.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/pcs-digest",
					className: "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.07] hover:shadow-[0_20px_50px_-18px_rgba(16,185,129,0.55)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
								children: n.category
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-wider text-white/50",
								children: n.source
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 font-serif text-[15px] font-semibold leading-snug text-white line-clamp-3",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto flex items-center justify-between pt-3 text-[11px] text-white/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n.pubDate ? timeAgo(n.pubDate) : "" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-emerald-300 opacity-0 transition-opacity group-hover:opacity-100",
								children: ["Read ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
							})]
						})
					]
				}, n.link))
			})
		]
	});
}
//#endregion
export { Landing as component };
