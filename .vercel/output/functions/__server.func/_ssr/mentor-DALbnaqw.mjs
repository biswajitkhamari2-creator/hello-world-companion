import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as DefaultChatTransport, o as require_jsx_runtime, s as require_react, t as useChat } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-CCQEfgNs.mjs";
import { $ as Image, B as MicOff, C as Send, N as Paperclip, O as RefreshCw, Ot as Check, Vt as ArrowLeft, _ as Square, a as Volume2, ht as Copy, i as VolumeX, lt as FileText, n as X, y as Sparkles, z as Mic } from "../_libs/lucide-react.mjs";
import { t as BrandMark } from "./brand-mark-Cd5Ie8dl.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-Dfe41XSO.mjs";
import { t as Route } from "./mentor-DatVLPRl.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mentor-DALbnaqw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getSpeechRecognition() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function messageText(m) {
	return (m.parts ?? []).map((p) => p.type === "text" ? p.text : "").join("");
}
function friendlyMentorError(message) {
	const raw = message?.trim();
	if (!raw) return "AI Mentor could not answer right now. Please retry.";
	const lower = raw.toLowerCase();
	if (lower.includes("<!doctype") || lower.includes("<html") || lower.includes("this page didn't load")) return "AI Mentor service did not load correctly. Please retry.";
	if (lower.includes("quota") || lower.includes("rate") || lower.includes("too many requests") || lower.includes("limit reached")) return "AI Mentor limit reached for the moment. Please wait about one minute and retry.";
	if (lower.includes("api key") || lower.includes("unauthorised") || lower.includes("unauthorized") || lower.includes("forbidden")) return "AI Mentor is not authorised right now. Please check the AI key configuration.";
	return raw.length > 180 ? "AI Mentor could not answer right now. Please retry." : raw;
}
var ACCEPTED_TYPES = "application/pdf,image/png,image/jpeg,image/webp,image/gif";
var MAX_FILE_BYTES = 100 * 1024 * 1024;
var MAX_FILES = 4;
function readFileAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onerror = () => reject(r.error);
		r.onload = () => resolve(String(r.result));
		r.readAsDataURL(file);
	});
}
var STARTERS = [
	"Explain Fundamental Rights vs Directive Principles with PYQ links.",
	"Walk me through the Indian monsoon mechanism for Prelims & Mains.",
	"Summarise the Doctrine of Basic Structure with landmark judgements.",
	"What current affairs themes are likely in GS2 this year?"
];
function MentorPage() {
	const [mode, setMode] = (0, import_react.useState)("simple");
	const [input, setInput] = (0, import_react.useState)("");
	const [voiceOut, setVoiceOut] = (0, import_react.useState)(false);
	const [listening, setListening] = (0, import_react.useState)(false);
	const recognitionRef = (0, import_react.useRef)(null);
	const spokenIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const scrollerRef = (0, import_react.useRef)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const [attachments, setAttachments] = (0, import_react.useState)([]);
	const addFiles = (0, import_react.useCallback)(async (files) => {
		if (!files) return;
		const list = Array.from(files);
		if (!list.length) return;
		const accepted = [];
		for (const f of list) {
			const isImg = f.type.startsWith("image/");
			const isPdf = f.type === "application/pdf";
			if (!isImg && !isPdf) {
				toast.error(`Unsupported file: ${f.name}`, { description: "Attach PDFs or images only." });
				continue;
			}
			if (f.size > MAX_FILE_BYTES) {
				toast.error(`${f.name} is too large`, { description: "Max 15 MB per file." });
				continue;
			}
			try {
				const url = await readFileAsDataUrl(f);
				accepted.push({
					id: crypto.randomUUID(),
					name: f.name,
					mediaType: f.type,
					url,
					size: f.size
				});
			} catch {
				toast.error(`Could not read ${f.name}`);
			}
		}
		setAttachments((prev) => {
			const merged = [...prev, ...accepted];
			if (merged.length > MAX_FILES) {
				toast.error(`Max ${MAX_FILES} attachments`, { description: "Extra files were dropped." });
				return merged.slice(0, MAX_FILES);
			}
			return merged;
		});
	}, []);
	const removeAttachment = (0, import_react.useCallback)((id) => {
		setAttachments((prev) => prev.filter((a) => a.id !== id));
	}, []);
	const { messages, sendMessage, status, stop, error, regenerate } = useChat({
		transport: (0, import_react.useMemo)(() => new DefaultChatTransport({
			api: "/api/mentor",
			body: () => {
				let language;
				try {
					const raw = localStorage.getItem("upsc_settings_v1");
					if (raw) language = JSON.parse(raw)?.language;
				} catch {}
				return {
					mode,
					language
				};
			}
		}), [mode]),
		onError: (e) => {
			console.error("[mentor]", e);
			toast.error("Mentor error", { description: friendlyMentorError(e.message) });
		}
	});
	const seed = Route.useSearch().seed;
	const seededRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (seededRef.current || !seed) return;
		seededRef.current = true;
		let context = "";
		try {
			context = sessionStorage.getItem("mentor_seed_context") || "";
			sessionStorage.removeItem("mentor_seed_context");
		} catch {}
		const text = context ? `${seed}\n\nContext from my current study material:\n${context}` : seed;
		sendMessage({
			role: "user",
			parts: [{
				type: "text",
				text
			}]
		});
	}, [seed, sendMessage]);
	const [copiedId, setCopiedId] = (0, import_react.useState)(null);
	const copy = (0, import_react.useCallback)(async (id, text) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedId(id);
			setTimeout(() => setCopiedId((c) => c === id ? null : c), 1500);
		} catch {
			toast.error("Copy failed");
		}
	}, []);
	const isLoading = status === "submitted" || status === "streaming";
	(0, import_react.useEffect)(() => {
		const el = scrollerRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [messages, status]);
	(0, import_react.useEffect)(() => {
		if (!isLoading) textareaRef.current?.focus();
	}, [isLoading]);
	(0, import_react.useEffect)(() => {
		if (!voiceOut || typeof window === "undefined" || !("speechSynthesis" in window)) return;
		if (isLoading) return;
		const last = messages[messages.length - 1];
		if (!last || last.role !== "assistant") return;
		if (spokenIdsRef.current.has(last.id)) return;
		spokenIdsRef.current.add(last.id);
		const text = messageText(last).replace(/[#*_`>]/g, "").slice(0, 1200);
		if (!text.trim()) return;
		const u = new SpeechSynthesisUtterance(text);
		u.lang = "en-IN";
		u.rate = 1;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(u);
	}, [
		messages,
		isLoading,
		voiceOut
	]);
	(0, import_react.useEffect)(() => () => {
		if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
		recognitionRef.current?.abort();
	}, []);
	const toggleMic = (0, import_react.useCallback)(() => {
		const Ctor = getSpeechRecognition();
		if (!Ctor) {
			toast.error("Voice input not supported", { description: "Use Chrome or Edge for built-in speech recognition." });
			return;
		}
		if (listening) {
			recognitionRef.current?.stop();
			return;
		}
		const rec = new Ctor();
		rec.lang = "en-IN";
		rec.continuous = false;
		rec.interimResults = true;
		let finalText = "";
		rec.onresult = (e) => {
			let interim = "";
			for (let i = 0; i < e.results.length; i++) {
				const r = e.results[i];
				const t = r[0].transcript;
				if (r.isFinal) finalText += t;
				else interim += t;
			}
			setInput((finalText + interim).trim());
		};
		rec.onerror = (e) => {
			console.warn("[mentor:mic]", e.error);
			if (e.error && e.error !== "no-speech") toast.error(`Mic: ${e.error}`);
		};
		rec.onend = () => {
			setListening(false);
			recognitionRef.current = null;
		};
		recognitionRef.current = rec;
		setListening(true);
		rec.start();
	}, [listening]);
	const submit = (0, import_react.useCallback)((text) => {
		const t = text.trim();
		if (!t && attachments.length === 0 || isLoading) return;
		if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
		const fileParts = attachments.map((a) => ({
			type: "file",
			mediaType: a.mediaType,
			url: a.url,
			filename: a.name
		}));
		const textPart = t ? [{
			type: "text",
			text: t
		}] : [{
			type: "text",
			text: "Please analyse the attached material in UPSC context."
		}];
		sendMessage({
			role: "user",
			parts: [...fileParts, ...textPart]
		});
		setInput("");
		setAttachments([]);
	}, [
		attachments,
		isLoading,
		sendMessage
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-border/60 bg-paper/85 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "icon",
							"aria-label": "Back",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: "sm" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-1 rounded-full border border-border bg-background p-1 sm:flex",
							children: ["simple", "advanced"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMode(m),
								className: cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
								children: m === "simple" ? "Simple" : "Advanced"
							}, m))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: voiceOut ? "default" : "outline",
							size: "icon",
							onClick: () => {
								if (voiceOut && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
								setVoiceOut((v) => !v);
							},
							"aria-label": voiceOut ? "Mute voice replies" : "Enable voice replies",
							title: voiceOut ? "Voice replies on" : "Voice replies off",
							children: voiceOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 pb-2 sm:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1 rounded-full border border-border bg-background p-1",
						children: ["simple", "advanced"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(m),
							className: cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"),
							children: m === "simple" ? "Simple" : "Advanced"
						}, m))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground",
						children: voiceOut ? "Voice replies on" : "Voice replies off"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				ref: scrollerRef,
				className: "mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-6 sm:px-6",
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-2 rounded-full border border-border bg-paper px-3 py-1 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-accent" }), " Your AI UPSC mentor"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl",
							children: [
								"Ask anything across the ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "UPSC syllabus"
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-lg text-sm text-muted-foreground",
							children: "Text or voice. Switch between Simple and Advanced explanations. The mentor anchors every reply in the syllabus and PYQ trends."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 grid gap-2 text-left sm:grid-cols-2",
							children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => submit(s),
								className: "rounded-xl border border-border bg-paper p-4 text-sm transition-colors hover:border-accent hover:bg-paper/80",
								children: s
							}, s))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-5",
					children: [
						messages.map((m) => {
							const text = messageText(m);
							const isUser = m.role === "user";
							const fileParts = (m.parts ?? []).filter((p) => p.type === "file");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("flex", isUser ? "justify-end" : "justify-start"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[78%]", isUser ? "bg-primary text-primary-foreground" : "border border-border bg-paper text-foreground"),
									children: [fileParts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("mb-2 flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start"),
										children: fileParts.map((p, i) => {
											return (p.mediaType ?? "").startsWith("image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: p.url,
												target: "_blank",
												rel: "noreferrer",
												className: "block overflow-hidden rounded-lg border border-border/40",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: p.url,
													alt: p.filename ?? "image",
													className: "max-h-40 max-w-[180px] object-cover"
												})
											}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: p.url,
												target: "_blank",
												rel: "noreferrer",
												className: cn("inline-flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs", isUser ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground" : "border-border bg-background text-foreground"),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "max-w-[160px] truncate",
													children: p.filename ?? "document.pdf"
												})]
											}, i);
										})
									}), isUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "whitespace-pre-wrap",
										children: text
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "prose prose-sm max-w-none prose-headings:font-serif prose-p:my-2 prose-li:my-0.5 prose-pre:bg-muted prose-pre:text-foreground prose-code:before:hidden prose-code:after:hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
											remarkPlugins: [remarkGfm],
											children: text || "…"
										})
									}), text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => copy(m.id, text),
											className: "inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground",
											"aria-label": "Copy reply",
											children: [copiedId === m.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3 w-3" }), copiedId === m.id ? "Copied" : "Copy"]
										})
									})] })]
								})
							}, m.id);
						}),
						status === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-2xl border border-border bg-paper px-4 py-3 text-sm text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1",
									children: ["Thinking", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-1 inline-flex gap-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-accent" })
										]
									})]
								})
							})
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-md text-xs text-destructive",
								children: friendlyMentorError(error.message)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => regenerate(),
								className: "gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Retry"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "sticky bottom-0 z-20 border-t border-border/60 bg-paper/90 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-4xl px-4 pt-3 sm:px-6",
					onDragOver: (e) => {
						e.preventDefault();
					},
					onDrop: (e) => {
						e.preventDefault();
						addFiles(e.dataTransfer.files);
					},
					children: attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mb-2 flex flex-wrap gap-2",
						children: attachments.map((a) => {
							const isImg = a.mediaType.startsWith("image/");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "group relative flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs",
								children: [
									isImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: a.url,
										alt: a.name,
										className: "h-8 w-8 rounded object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "max-w-[160px] truncate font-medium text-foreground",
											children: a.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[10px] text-muted-foreground",
											children: [
												isImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "mr-1 inline h-3 w-3" }) : null,
												(a.size / 1024).toFixed(0),
												" KB"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => removeAttachment(a.id),
										"aria-label": `Remove ${a.name}`,
										className: "ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
									})
								]
							}, a.id);
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mx-auto flex max-w-4xl items-end gap-2 px-4 py-3 sm:px-6",
					onSubmit: (e) => {
						e.preventDefault();
						submit(input);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInputRef,
							type: "file",
							accept: ACCEPTED_TYPES,
							multiple: true,
							className: "hidden",
							onChange: (e) => {
								addFiles(e.target.files);
								e.target.value = "";
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							onClick: () => fileInputRef.current?.click(),
							"aria-label": "Attach PDF or image",
							title: "Attach PDF or image",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: listening ? "default" : "outline",
							size: "icon",
							onClick: toggleMic,
							"aria-label": listening ? "Stop listening" : "Voice input",
							title: listening ? "Stop" : "Voice input",
							className: cn(listening && "animate-pulse"),
							children: listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							ref: textareaRef,
							value: input,
							onChange: (e) => setInput(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit(input);
								}
							},
							onPaste: (e) => {
								const files = Array.from(e.clipboardData.files ?? []);
								if (files.length) {
									e.preventDefault();
									addFiles(files);
								}
							},
							rows: 1,
							placeholder: listening ? "Listening…" : "Ask the mentor anything (Shift+Enter for new line)",
							className: "max-h-40 min-h-[44px] flex-1 resize-none bg-background"
						}),
						isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "destructive",
							size: "icon",
							onClick: stop,
							"aria-label": "Stop generating",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-4 w-4" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							disabled: !input.trim() && attachments.length === 0,
							"aria-label": "Send",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { MentorPage as component };
