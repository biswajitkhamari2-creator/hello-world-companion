import { o as __toESM } from "../_runtime.mjs";
import { M as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as streamText, o as require_jsx_runtime, r as convertToModelMessages, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { a as getDefaultModel, c as resolveAvailableAiProvider, l as withLovableAiGatewayRunIdHeader, o as getLovableAiGatewayResponseHeaders, r as createGateway, s as getLovableAiGatewayRunId, t as UPSC_SYSTEM_PROMPT } from "./ai-gateway.server-BQYhT5NC.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as supabase } from "./client-44RWK3KY.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as ThemeProvider } from "./theme-provider-BDj6-vq5.mjs";
import { t as Route$24 } from "./mentor-DatVLPRl.mjs";
import { t as Route$25 } from "./revision-hub-BegHUqyT.mjs";
import { i as tgDownload, n as safeEqual, t as getTelegramWebhookSecret } from "./telegram.server-CNrfEYV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BUlZUI3L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-L59HghcF.css";
var og_cover_default = "/assets/og-cover-DYCGigfw.jpg";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif-display text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90",
						children: "Back to UPSC Mitra"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif-display text-xl font-semibold text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. You can retry or head home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$23 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "UPSC — AI Notes, MCQs & Current Affairs" },
			{
				name: "description",
				content: "AI-powered UPSC prep: turn any PDF, editorial or newspaper into syllabus-mapped notes, MCQs, infographics and Mains answers — PYQ-aligned."
			},
			{
				name: "theme-color",
				content: "#1a1f3a"
			},
			{
				name: "author",
				content: "Sidheswar Enterprises"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "UPSC Genius"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				property: "og:site_name",
				content: "UPSC"
			},
			{
				property: "og:locale",
				content: "en_IN"
			},
			{
				property: "og:title",
				content: "UPSC — AI Notes, MCQs & Current Affairs"
			},
			{
				property: "og:description",
				content: "AI-powered UPSC prep: turn any PDF, editorial or newspaper into syllabus-mapped notes, MCQs, infographics and Mains answers — PYQ-aligned."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "UPSC — AI Notes, MCQs & Current Affairs"
			},
			{
				name: "twitter:description",
				content: "AI-powered UPSC prep: turn any PDF, editorial or newspaper into syllabus-mapped notes, MCQs, infographics and Mains answers — PYQ-aligned."
			},
			{
				property: "og:image",
				content: `https://open-hello-bloom.lovable.app${og_cover_default}`
			},
			{
				property: "og:image:width",
				content: "1216"
			},
			{
				property: "og:image:height",
				content: "640"
			},
			{
				name: "twitter:image",
				content: `https://open-hello-bloom.lovable.app${og_cover_default}`
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "192x192",
				href: "/icon-192.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "512x512",
				href: "/icon-512.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			}
		],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@graph": [{
					"@type": "Organization",
					"@id": "https://open-hello-bloom.lovable.app/#org",
					name: "Sidheswar Enterprises",
					url: "https://open-hello-bloom.lovable.app",
					logo: `https://open-hello-bloom.lovable.app${og_cover_default}`
				}, {
					"@type": "WebSite",
					"@id": "https://open-hello-bloom.lovable.app/#site",
					name: "UPSC",
					url: "https://open-hello-bloom.lovable.app",
					publisher: { "@id": "https://open-hello-bloom.lovable.app/#org" },
					potentialAction: {
						"@type": "SearchAction",
						target: "https://open-hello-bloom.lovable.app/mentor?q={search_term_string}",
						"query-input": "required name=search_term_string"
					}
				}]
			})
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$23.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		try {
			const { data: sub } = supabase.auth.onAuthStateChange((event) => {
				if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
				router.invalidate();
				if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
			});
			return () => sub.subscription.unsubscribe();
		} catch (error) {
			console.error("[Supabase] Auth listener failed", error);
			return;
		}
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ThemeProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})] })
	});
}
var BASE_URL = "https://open-hello-bloom.lovable.app";
var Route$22 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[{
			path: "/",
			lastmod: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			changefreq: "weekly",
			priority: "1.0"
		}].map((e) => [
			`  <url>`,
			`    <loc>${BASE_URL}${e.path}</loc>`,
			e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
			e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
			e.priority ? `    <priority>${e.priority}</priority>` : null,
			`  </url>`
		].filter(Boolean).join("\n")),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$17 = () => import("./pcs-digest-CyAGCH3L.mjs");
var Route$21 = createFileRoute("/pcs-digest")({
	head: () => ({ meta: [{ title: "National News · PCS Digest" }, {
		name: "description",
		content: "Full National News feed from PCS Digest — syllabus-mapped headlines with AI extraction for OPSC / State PCS aspirants."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./auth-BwGVc0_4.mjs");
var Route$20 = createFileRoute("/auth")({
	validateSearch: (s) => ({ redirect: typeof s.redirect === "string" ? s.redirect : void 0 }),
	head: () => ({
		meta: [
			{ title: "Sign in — UPSC" },
			{
				name: "description",
				content: "Sign in to UPSC to access your AI mentor, notes, MCQs and current affairs library."
			},
			{
				name: "robots",
				content: "noindex, nofollow"
			},
			{
				property: "og:title",
				content: "Sign in — UPSC"
			},
			{
				property: "og:url",
				content: "https://open-hello-bloom.lovable.app/auth"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://open-hello-bloom.lovable.app/auth"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./route-Di7iQBCH.mjs");
var Route$19 = createFileRoute("/_authenticated")({
	ssr: false,
	head: () => ({ meta: [{
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	beforeLoad: async ({ location }) => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({
			to: "/auth",
			search: { redirect: location.href }
		});
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./routes-BNwB6H0u.mjs");
var Route$18 = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "UPSC — AI Notes, MCQs & Current Affairs for UPSC" },
			{
				name: "description",
				content: "Premium AI mentor for UPSC aspirants. Upload any PDF or editorial and get syllabus-mapped notes, MCQs, infographics, handwritten notes and Mains answers — PYQ-aligned."
			},
			{
				property: "og:title",
				content: "UPSC — AI Notes, MCQs & Current Affairs for UPSC"
			},
			{
				property: "og:description",
				content: "Premium AI mentor for UPSC aspirants. Syllabus-mapped notes, MCQs, infographics and Mains answers from any study material."
			},
			{
				property: "og:url",
				content: "https://open-hello-bloom.lovable.app/"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://open-hello-bloom.lovable.app/"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var MODE_NOTES = {
	simple: "Explain in simple, clear language. Use short sentences, everyday analogies, and step-by-step structure. Avoid jargon unless you define it.",
	advanced: "Explain at an advanced aspirant level. Use precise terminology, cite Articles / Sections / Committees / Reports / judgements where relevant, and surface PYQ linkages and inter-topic connections."
};
function jsonError(message, status = 400, code = "MENTOR_ERROR") {
	return Response.json({
		ok: false,
		error: {
			code,
			message
		}
	}, {
		status,
		headers: { "cache-control": "no-store" }
	});
}
function mentorErrorMessage(error) {
	const err = error;
	const message = `${err?.message ?? ""} ${err?.responseBody ?? ""}`.toLowerCase();
	const causeMessage = err?.cause instanceof Error ? err.cause.message.toLowerCase() : "";
	if (err?.statusCode === 401 || err?.statusCode === 403 || message.includes("api key")) return "AI Mentor is not authorised right now. Please retry after the server refreshes.";
	if (err?.statusCode === 429 || message.includes("quota") || message.includes("rate") || causeMessage.includes("too many requests")) return "AI Mentor limit reached for the moment. Please wait about one minute and retry.";
	if (message.includes("missing gemini_api_key")) return "AI Mentor is not configured yet. Please retry after the server refreshes.";
	return "AI Mentor could not answer right now. Please retry.";
}
var Route$17 = createFileRoute("/api/mentor")({ server: { handlers: {
	GET: async () => jsonError("Use POST to chat with the AI Mentor.", 405, "METHOD_NOT_ALLOWED"),
	OPTIONS: async () => new Response(null, {
		status: 204,
		headers: {
			allow: "POST, OPTIONS",
			"cache-control": "no-store"
		}
	}),
	POST: async ({ request }) => {
		let body;
		try {
			body = await request.json();
		} catch {
			return jsonError("Invalid request body. Please retry.", 400, "BAD_JSON");
		}
		const { messages, mode, language } = body;
		if (!Array.isArray(messages)) return jsonError("Please send a message before asking the mentor.", 400, "MESSAGES_REQUIRED");
		if (mode && mode !== "simple" && mode !== "advanced") return jsonError("Invalid mentor mode.", 400, "INVALID_MODE");
		const languageDirective = language === "or" ? "\n\nLANGUAGE MODE: PURE ODIA (ଓଡ଼ିଆ). You MUST respond ENTIRELY in the Odia script (ଓଡ଼ିଆ ଲିପି). Absolutely NO English words, NO Roman letters, NO Hindi/Devanagari, NO transliteration, NO code-mixing. Translate every technical term (Constitution → ସମ୍ବିଧାନ, Article → ଅନୁଚ୍ଛେଦ, Fundamental Rights → ମୌଳିକ ଅଧିକାର, etc.) into pure Odia. Use standard Odia punctuation (।). Numbers may be written in Odia numerals (୦-୯) or Arabic numerals. If you cannot express something in pure Odia, describe it in Odia rather than inserting English. Every single sentence — headings, bullets, examples, takeaways — must be in Odia script only." : language === "hi" ? "\n\nLanguage: Respond in Hindi (हिन्दी). Use Devanagari script. UPSC terminology may retain standard English/Sanskrit-origin terms when natural." : language === "hinglish" ? "\n\nLanguage: Respond in Hinglish — natural mix of Hindi and English as UPSC aspirants speak." : "";
		try {
			const initialRunId = getLovableAiGatewayRunId(request);
			if (!process.env.OPENROUTER_API_KEY?.trim() && !process.env.NVIDIA_API_KEY?.trim() && !process.env.GROQ_API_KEY?.trim() && !process.env.GEMINI_API_KEY?.trim()) return jsonError("AI Mentor is not configured: set OPENROUTER_API_KEY (preferred), NVIDIA_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY.", 503, "AI_KEY_MISSING");
			const availableProvider = await resolveAvailableAiProvider(process.env.OPENROUTER_API_KEY?.trim() ? "openrouter" : process.env.GROQ_API_KEY?.trim() ? "groq" : process.env.NVIDIA_API_KEY?.trim() ? "nvidia" : "gemini");
			const gateway = createGateway(initialRunId, availableProvider);
			return withLovableAiGatewayRunIdHeader(streamText({
				model: gateway(getDefaultModel(availableProvider)),
				maxRetries: 0,
				system: `${UPSC_SYSTEM_PROMPT}\n\nMentor mode: ${MODE_NOTES[mode ?? "simple"]}\n\nTeach like an experienced UPSC mentor: anchor concepts in the syllabus, link to PYQs and current affairs, and end with a one-line takeaway whenever useful.${languageDirective}`,
				messages: await convertToModelMessages(messages),
				onError: ({ error }) => {
					console.error("[mentor stream]", error);
				}
			}).toUIMessageStreamResponse({
				originalMessages: messages,
				headers: getLovableAiGatewayResponseHeaders(void 0, {
					"cache-control": "no-store",
					...initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}
				}),
				onError: mentorErrorMessage
			}), gateway, { "cache-control": "no-store" });
		} catch (error) {
			console.error("[mentor api]", error);
			return jsonError(mentorErrorMessage(error), 500);
		}
	}
} } });
var $$splitComponentImporter$13 = () => import("./stamp-DN6o-slk.mjs");
var Route$16 = createFileRoute("/_authenticated/stamp")({
	head: () => ({ meta: [{ title: "PDF Stamp — Sidheswar Publication" }, {
		name: "description",
		content: "Upload any PDF and instantly stamp 'Sidheswar Publication' on every page, then download."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./settings-D7NI-ZVn.mjs");
var Route$15 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Settings — UPSC Genius AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./profile-DewQgyfl.mjs");
var Route$14 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [{ title: "Profile — UPSC Genius AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./newspaper-Dy22_gPX.mjs");
var Route$13 = createFileRoute("/_authenticated/newspaper")({
	head: () => ({ meta: [{ title: "Newspaper Analyser — UPSC Mitra" }, {
		name: "description",
		content: "Upload a newspaper photo and get only the UPSC-relevant headlines with GS mapping, summaries and exam angle."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./news-archive-C0rZ7F1W.mjs");
var Route$12 = createFileRoute("/_authenticated/news-archive")({
	head: () => ({ meta: [{ title: "News Archive — UPSC Genius AI" }, {
		name: "description",
		content: "Search every important UPSC/OPSC news item AI has extracted from your forwarded newspapers — by date and keyword."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./mocks-Br3RZ0n1.mjs");
var Route$11 = createFileRoute("/_authenticated/mocks")({
	head: () => ({ meta: [{ title: "Mock Tests — UPSC Genius AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./institution-DgwX8iig.mjs");
var Route$10 = createFileRoute("/_authenticated/institution")({
	head: () => ({ meta: [{ title: "Institution Engine — Vision IAS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./inbox-BPpBzAnh.mjs");
var Route$9 = createFileRoute("/_authenticated/inbox")({
	head: () => ({ meta: [{ title: "Telegram Inbox — UPSC Mitra" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./editorial-lab-DCrv2WUo.mjs");
var Route$8 = createFileRoute("/_authenticated/editorial-lab")({
	head: () => ({ meta: [{ title: "Editorial Lab — UPSC Genius AI" }, {
		name: "description",
		content: "Auto-detect editorial pages from any newspaper PDF forwarded via Telegram. Crisp + comprehensive notes, mermaid diagrams, PYQ links — paid Gemini quality."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./editorial-DK3vlnw9.mjs");
var Route$7 = createFileRoute("/_authenticated/editorial")({
	head: () => ({ meta: [{ title: "Editorial Analyser — UPSC" }, {
		name: "description",
		content: "Paste or upload any newspaper editorial. AI returns 3-line summary, GS mapping, key concepts, vocabulary, prelims MCQs and mains questions."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./downloads-DuVuLyPE.mjs");
var Route$6 = createFileRoute("/_authenticated/downloads")({
	head: () => ({ meta: [{ title: "Downloads — UPSC Genius AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./dashboard-B1B7fgV5.mjs");
var Route$5 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — UPSC Mitra" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./bookmarks-CsTfN6vw.mjs");
var Route$4 = createFileRoute("/_authenticated/bookmarks")({
	head: () => ({ meta: [{ title: "Bookmarks — UPSC Genius AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin.ai-analytics-Bmu-BpVV.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/ai-analytics")({
	head: () => ({ meta: [{ title: "AI Analytics — UPSC Genius AI" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SHARED_OWNER = "telegram-inbox";
var FALLBACK_SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
var INBOX_OWNER_USER_ID = process.env.TELEGRAM_INBOX_OWNER_USER_ID || "";
async function shrinkPdf(bytes) {
	try {
		const { PDFDocument } = await import("../_libs/pdf-lib.mjs").then((n) => n.t);
		const out = await (await PDFDocument.load(bytes, {
			ignoreEncryption: true,
			updateMetadata: false
		})).save({
			useObjectStreams: true,
			addDefaultPage: false
		});
		const outBuf = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
		return {
			bytes: outBuf.byteLength < bytes.byteLength ? outBuf : bytes,
			ratio: outBuf.byteLength / bytes.byteLength
		};
	} catch {
		return {
			bytes,
			ratio: 1
		};
	}
}
async function getAdmin() {
	const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.APP_SUPABASE_SECRET_KEY;
	if (!serviceRoleKey) throw new Error("Missing Supabase service-role key for Telegram webhook.");
	return createClient(supabaseUrl, serviceRoleKey, { auth: {
		storage: void 0,
		persistSession: false,
		autoRefreshToken: false
	} });
}
async function upsertInbox(row) {
	const { error } = await (await getAdmin()).from("telegram_inbox").upsert(row, { onConflict: "chat_id,message_id" });
	if (error) throw new Error(`Telegram inbox save failed: ${error.message}`);
}
function extractUrls(text) {
	return Array.from(new Set(text.match(/https?:\/\/[^\s)]+/gi) ?? []));
}
/** Download a public Google Drive file (shared as "Anyone with the link").
*  Handles the >100 MB virus-scan interstitial by parsing the confirm token. */
async function fetchPublicDriveFile(fileId) {
	const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
	let res = await fetch(primary, { redirect: "follow" });
	let ct = res.headers.get("content-type") || "";
	if (res.ok && /text\/html/i.test(ct)) {
		const html = await res.text();
		const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
		const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] || "t";
		if (uuid) {
			const retry = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
			res = await fetch(retry, { redirect: "follow" });
			ct = res.headers.get("content-type") || "";
		}
	}
	if (!res.ok) throw new Error(`Drive public download failed (${res.status}). Ensure the file is shared as "Anyone with the link — Viewer".`);
	if (/text\/html/i.test(ct)) throw new Error(`Drive returned an HTML page instead of the file — sharing is likely still restricted. Set it to "Anyone with the link — Viewer" and resend.`);
	const cd = res.headers.get("content-disposition") || "";
	const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
	const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
	return {
		bytes: await res.arrayBuffer(),
		mime: ct.split(";")[0].trim() || "application/pdf",
		name
	};
}
/** Extract a Google Drive file id from any share URL. Returns null if not a Drive file link. */
function extractDriveFileId(url) {
	try {
		const u = new URL(url);
		if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
		const m = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
		if (m) return m[1];
		const idParam = u.searchParams.get("id");
		if (idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam)) return idParam;
		return null;
	} catch {
		return null;
	}
}
async function handleDrivePdfLink(url, driveId, base) {
	try {
		const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		const dl = await fetchPublicDriveFile(driveId);
		if (!((dl.mime || "").includes("pdf") || (dl.name || "").toLowerCase().endsWith(".pdf"))) {
			await handleLink(url, base);
			return;
		}
		const fileName = dl.name || `drive-${driveId}.pdf`;
		const sizeBytes = dl.bytes.byteLength;
		if (INBOX_OWNER_USER_ID) {
			const { data: dupe } = await (await getAdmin()).from("documents").select("id").eq("user_id", INBOX_OWNER_USER_ID).eq("file_name", fileName).eq("size_bytes", sizeBytes).limit(1).maybeSingle();
			if (dupe) {
				await upsertInbox({
					chat_id: base.chat_id,
					message_id: base.message_id,
					kind: "pdf",
					caption: base.caption,
					posted_at: base.posted_at,
					file_name: fileName,
					mime: dl.mime,
					size_bytes: sizeBytes,
					status: "duplicate",
					error_message: "Duplicate file — already imported.",
					source_url: url,
					raw: base.raw
				});
				return;
			}
		}
		const { bytes: shrunk } = await shrinkPdf(dl.bytes);
		const up = await uploadBufferToDrive({
			userId: SHARED_OWNER,
			fileName,
			mime: dl.mime || "application/pdf",
			data: shrunk
		});
		if (INBOX_OWNER_USER_ID) await (await getAdmin()).from("documents").insert({
			user_id: INBOX_OWNER_USER_ID,
			title: base.caption || fileName,
			file_name: fileName,
			mime: up.mimeType,
			size_bytes: up.size,
			source_type: "telegram",
			status: "uploaded",
			storage_provider: "google_drive",
			drive_file_id: up.fileId,
			drive_view_link: up.webViewLink
		});
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "pdf",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: up.mimeType,
			size_bytes: up.size,
			drive_file_id: up.fileId,
			drive_view_link: up.webViewLink,
			source_url: url,
			status: "ready",
			raw: base.raw
		});
	} catch (e) {
		console.error("[telegram drive-link import]", e);
		const msg = e.message || "";
		const friendly = /not found|permission|403|404/i.test(msg) ? "Cannot access this Drive file. Share it as 'Anyone with the link — Viewer', then resend." : msg;
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "pdf",
			caption: base.caption,
			posted_at: base.posted_at,
			source_url: url,
			status: "failed",
			error_message: friendly,
			raw: base.raw
		});
	}
}
async function handlePdf(doc, base) {
	const fileName = doc.file_name || `telegram-${base.message_id}.pdf`;
	if (typeof doc.file_size === "number" && doc.file_size > 20 * 1024 * 1024) {
		const mb = (doc.file_size / (1024 * 1024)).toFixed(1);
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "pdf",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: doc.mime_type || "application/pdf",
			size_bytes: doc.file_size,
			status: "too_large",
			error_message: `PDF is ${mb} MB. Telegram bots can only download files up to 20 MB (Telegram's own limit — we cannot bypass it). Please compress the PDF first (e.g. ilovepdf.com / Adobe compress) OR share a Google Drive link — the Drive link will be imported permanently.`,
			source_url: base.source_url ?? null,
			raw: base.raw
		});
		return;
	}
	try {
		if (INBOX_OWNER_USER_ID && doc.file_size) try {
			const { data: dupe } = await (await getAdmin()).from("documents").select("id").eq("user_id", INBOX_OWNER_USER_ID).eq("file_name", fileName).eq("size_bytes", doc.file_size).limit(1).maybeSingle();
			if (dupe) {
				await upsertInbox({
					chat_id: base.chat_id,
					message_id: base.message_id,
					kind: "pdf",
					caption: base.caption,
					posted_at: base.posted_at,
					file_name: fileName,
					mime: doc.mime_type || "application/pdf",
					size_bytes: doc.file_size,
					status: "duplicate",
					error_message: "Duplicate file not accepted — already imported.",
					source_url: base.source_url ?? null,
					raw: base.raw
				});
				return;
			}
		} catch (e) {
			console.warn("[telegram dedup check failed]", e.message);
		}
		const { bytes } = await tgDownload(doc.file_id);
		const { bytes: shrunk } = await shrinkPdf(bytes);
		const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		const up = await uploadBufferToDrive({
			userId: SHARED_OWNER,
			fileName,
			mime: doc.mime_type || "application/pdf",
			data: shrunk
		});
		if (INBOX_OWNER_USER_ID) try {
			const { error: docErr } = await (await getAdmin()).from("documents").insert({
				user_id: INBOX_OWNER_USER_ID,
				title: base.caption || fileName,
				file_name: fileName,
				mime: up.mimeType,
				size_bytes: up.size,
				source_type: "telegram",
				status: "uploaded",
				storage_provider: "google_drive",
				drive_file_id: up.fileId,
				drive_view_link: up.webViewLink
			});
			if (docErr) console.error("[telegram → documents insert]", docErr.message);
		} catch (e) {
			console.error("[telegram → documents insert]", e.message);
		}
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "pdf",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: up.mimeType,
			size_bytes: up.size,
			drive_file_id: up.fileId,
			drive_view_link: up.webViewLink,
			source_url: base.source_url ?? null,
			status: "ready",
			raw: base.raw
		});
	} catch (e) {
		console.error("[telegram media import]", e);
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "pdf",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: doc.mime_type || "application/pdf",
			size_bytes: doc.file_size ?? null,
			status: "failed",
			error_message: e.message,
			source_url: base.source_url ?? null,
			raw: base.raw
		});
	}
}
async function handlePhoto(photo, base) {
	const fileName = `telegram-${base.message_id}.jpg`;
	try {
		const { bytes } = await tgDownload(photo.file_id);
		const { uploadBufferToDrive } = await import("./gdrive.server-Cyjwc2Ll.mjs");
		const up = await uploadBufferToDrive({
			userId: SHARED_OWNER,
			fileName,
			mime: "image/jpeg",
			data: bytes
		});
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "image",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: up.mimeType,
			size_bytes: up.size,
			drive_file_id: up.fileId,
			drive_view_link: up.webViewLink,
			status: "ready",
			raw: base.raw
		});
	} catch (e) {
		console.error("[telegram media import]", e);
		await upsertInbox({
			chat_id: base.chat_id,
			message_id: base.message_id,
			kind: "image",
			caption: base.caption,
			posted_at: base.posted_at,
			file_name: fileName,
			mime: "image/jpeg",
			size_bytes: photo.file_size ?? null,
			status: "failed",
			error_message: e.message,
			raw: base.raw
		});
	}
}
async function handleLink(url, base) {
	await upsertInbox({
		chat_id: base.chat_id,
		message_id: base.message_id,
		kind: "link",
		caption: base.caption,
		posted_at: base.posted_at,
		source_url: url,
		status: "ready",
		raw: base.raw
	});
}
var Route$2 = createFileRoute("/api/public/telegram/webhook")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const expected = getTelegramWebhookSecret();
		if (!safeEqual(request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "", expected)) return new Response("Unauthorized", { status: 401 });
		const update = await request.json();
		const msg = update.channel_post || update.message || update.edited_channel_post || update.edited_message;
		if (!msg?.chat?.id || typeof msg.message_id !== "number") return Response.json({
			ok: true,
			ignored: true
		});
		const base = {
			chat_id: Number(msg.chat.id),
			message_id: Number(msg.message_id),
			caption: msg.caption || msg.text || null,
			posted_at: (/* @__PURE__ */ new Date((msg.date ?? Math.floor(Date.now() / 1e3)) * 1e3)).toISOString(),
			raw: update
		};
		const textCandidates = [msg.text, msg.caption].filter((v) => typeof v === "string");
		const entityUrls = [];
		for (const ent of [...msg.entities ?? [], ...msg.caption_entities ?? []]) if (ent?.type === "text_link" && typeof ent.url === "string") entityUrls.push(ent.url);
		const allUrls = Array.from(/* @__PURE__ */ new Set([...textCandidates.flatMap(extractUrls), ...entityUrls]));
		console.log("[telegram webhook]", {
			chat_id: base.chat_id,
			message_id: base.message_id,
			has_document: !!msg.document,
			has_photo: Array.isArray(msg.photo),
			text_preview: (msg.text || msg.caption || "").slice(0, 120),
			url_count: allUrls.length,
			urls: allUrls
		});
		const driveUrls = allUrls.map((url, index) => ({
			url,
			index,
			driveId: extractDriveFileId(url)
		})).filter((item) => Boolean(item.driveId));
		const nonDriveUrls = allUrls.filter((url) => !extractDriveFileId(url));
		const hasPdfDocument = Boolean(msg.document && (msg.document.mime_type === "application/pdf" || (msg.document.file_name || "").toLowerCase().endsWith(".pdf")));
		for (const item of driveUrls) {
			const perLinkBase = {
				...base,
				message_id: -(base.message_id * 1e3 + item.index + 1),
				source_url: item.url
			};
			console.log("[telegram webhook] drive url routed", {
				url: item.url,
				driveId: item.driveId
			});
			await handleDrivePdfLink(item.url, item.driveId, perLinkBase);
		}
		if (hasPdfDocument && driveUrls.length === 0) await handlePdf(msg.document, base);
		else if (Array.isArray(msg.photo) && msg.photo.length && driveUrls.length === 0) {
			const best = msg.photo[msg.photo.length - 1];
			await handlePhoto(best, base);
		} else if (!hasPdfDocument && nonDriveUrls.length) for (const [index, u] of nonDriveUrls.entries()) {
			const perLinkBase = {
				...base,
				message_id: -(base.message_id * 1e3 + driveUrls.length + index + 1)
			};
			console.log("[telegram webhook] url routed", {
				url: u,
				driveId: null
			});
			await handleLink(u, perLinkBase);
		}
		return Response.json({ ok: true });
	} catch (e) {
		console.error("[telegram webhook]", e);
		return Response.json({
			ok: false,
			error: e.message
		}, { status: 500 });
	}
} } } });
function cleanEnvValue$1(value) {
	const cleaned = (value ?? "").trim();
	if (cleaned.startsWith("\"") && cleaned.endsWith("\"") || cleaned.startsWith("'") && cleaned.endsWith("'")) return cleaned.slice(1, -1).trim();
	return cleaned;
}
function getClientId$1() {
	return cleanEnvValue$1(process.env.GOOGLE_CLIENT_ID) || cleanEnvValue$1(process.env.GOOGLE_OAUTH_CLIENT_ID);
}
var Route$1 = createFileRoute("/api/oauth/google/start")({ server: { handlers: { GET: async ({ request }) => {
	const clientId = getClientId$1();
	if (!clientId) return new Response("GOOGLE_CLIENT_ID is not set in this deployment's environment variables.", { status: 500 });
	const redirectUri = `${new URL(request.url).origin}/api/oauth/google/callback`;
	const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "https://www.googleapis.com/auth/drive.file",
		access_type: "offline",
		prompt: "consent",
		include_granted_scopes: "true"
	}).toString();
	return Response.redirect(authUrl, 302);
} } } });
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function cleanEnvValue(value) {
	const cleaned = (value ?? "").trim();
	if (cleaned.startsWith("\"") && cleaned.endsWith("\"") || cleaned.startsWith("'") && cleaned.endsWith("'")) return cleaned.slice(1, -1).trim();
	return cleaned;
}
function getClientId() {
	return cleanEnvValue(process.env.GOOGLE_CLIENT_ID) || cleanEnvValue(process.env.GOOGLE_OAUTH_CLIENT_ID);
}
function getClientSecret() {
	return cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET) || cleanEnvValue(process.env.GOOGLE_OAUTH_CLIENT_SECRET);
}
var Route = createFileRoute("/api/oauth/google/callback")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const error = url.searchParams.get("error");
	if (error) return new Response(`Google OAuth error: ${error}`, { status: 400 });
	if (!code) return new Response("Missing ?code in callback", { status: 400 });
	const clientId = getClientId();
	const clientSecret = getClientSecret();
	if (!clientId || !clientSecret) return new Response("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured on this deployment.", { status: 500 });
	const redirectUri = `${url.origin}/api/oauth/google/callback`;
	const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: "authorization_code"
		})
	});
	const tokenJson = await tokenRes.json();
	if (!tokenRes.ok) {
		const hint = tokenJson.error === "invalid_client" ? " The OAuth client secret in Vercel is present but invalid/mismatched for this GOOGLE_CLIENT_ID. Re-copy the secret from Google Cloud → Credentials → same OAuth Web client." : "";
		return new Response(`Token exchange failed (${tokenRes.status}): ${tokenJson.error ?? ""} ${tokenJson.error_description ?? ""}.${hint}`, { status: 500 });
	}
	if (!tokenJson.refresh_token) return new Response("Google did not return a refresh_token. This usually means you've already authorized this app — revoke access at https://myaccount.google.com/permissions and try again.", { status: 400 });
	const html = `<!doctype html><html><head><meta charset="utf-8"><title>Google Refresh Token</title>
<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.5}code{background:#f4f4f5;padding:2px 6px;border-radius:4px}pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;word-break:break-all;white-space:pre-wrap}</style>
</head><body>
<h1>✅ Refresh token generated</h1>
<p>Copy this value and paste it into Vercel → Settings → Environment Variables as <code>GOOGLE_REFRESH_TOKEN</code> (Production + Preview), then redeploy.</p>
<pre id="t">${escapeHtml(tokenJson.refresh_token)}</pre>
<p><b>Important:</b> Do not share this token. After saving it in Vercel, you can delete this tab.</p>
<p>Then delete the route files <code>src/routes/api/oauth/google/start.ts</code> and <code>src/routes/api/oauth/google/callback.ts</code> if you don't want anyone else hitting these endpoints.</p>
</body></html>`;
	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": "no-store"
		}
	});
} } } });
var SitemapDotxmlRoute = Route$22.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$23
});
var PcsDigestRoute = Route$21.update({
	id: "/pcs-digest",
	path: "/pcs-digest",
	getParentRoute: () => Route$23
});
var AuthRoute = Route$20.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$23
});
var AuthenticatedRouteRoute = Route$19.update({
	id: "/_authenticated",
	getParentRoute: () => Route$23
});
var IndexRoute = Route$18.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$23
});
var ApiMentorRoute = Route$17.update({
	id: "/api/mentor",
	path: "/api/mentor",
	getParentRoute: () => Route$23
});
var AuthenticatedStampRoute = Route$16.update({
	id: "/stamp",
	path: "/stamp",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$15.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRevisionHubRoute = Route$25.update({
	id: "/revision-hub",
	path: "/revision-hub",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$14.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNewspaperRoute = Route$13.update({
	id: "/newspaper",
	path: "/newspaper",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNewsArchiveRoute = Route$12.update({
	id: "/news-archive",
	path: "/news-archive",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMocksRoute = Route$11.update({
	id: "/mocks",
	path: "/mocks",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMentorRoute = Route$24.update({
	id: "/mentor",
	path: "/mentor",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedInstitutionRoute = Route$10.update({
	id: "/institution",
	path: "/institution",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedInboxRoute = Route$9.update({
	id: "/inbox",
	path: "/inbox",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedEditorialLabRoute = Route$8.update({
	id: "/editorial-lab",
	path: "/editorial-lab",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedEditorialRoute = Route$7.update({
	id: "/editorial",
	path: "/editorial",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDownloadsRoute = Route$6.update({
	id: "/downloads",
	path: "/downloads",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$5.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBookmarksRoute = Route$4.update({
	id: "/bookmarks",
	path: "/bookmarks",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAiAnalyticsRoute = Route$3.update({
	id: "/admin/ai-analytics",
	path: "/admin/ai-analytics",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiPublicTelegramWebhookRoute = Route$2.update({
	id: "/api/public/telegram/webhook",
	path: "/api/public/telegram/webhook",
	getParentRoute: () => Route$23
});
var ApiOauthGoogleStartRoute = Route$1.update({
	id: "/api/oauth/google/start",
	path: "/api/oauth/google/start",
	getParentRoute: () => Route$23
});
var ApiOauthGoogleCallbackRoute = Route.update({
	id: "/api/oauth/google/callback",
	path: "/api/oauth/google/callback",
	getParentRoute: () => Route$23
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedBookmarksRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedDownloadsRoute,
	AuthenticatedEditorialRoute,
	AuthenticatedEditorialLabRoute,
	AuthenticatedInboxRoute,
	AuthenticatedInstitutionRoute,
	AuthenticatedMentorRoute,
	AuthenticatedMocksRoute,
	AuthenticatedNewsArchiveRoute,
	AuthenticatedNewspaperRoute,
	AuthenticatedProfileRoute,
	AuthenticatedRevisionHubRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedStampRoute,
	AuthenticatedAdminAiAnalyticsRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	PcsDigestRoute,
	SitemapDotxmlRoute,
	ApiMentorRoute,
	ApiOauthGoogleCallbackRoute,
	ApiOauthGoogleStartRoute,
	ApiPublicTelegramWebhookRoute
};
var routeTree = Route$23._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
