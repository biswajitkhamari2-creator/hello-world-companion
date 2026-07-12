import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { t as Badge } from "./badge-Bt-nVIZo.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { G as ListChecks, Rt as BookOpen, W as LoaderCircle, f as Target, q as Lightbulb, s as Upload, u as TriangleAlert, ut as FilePen, y as Sparkles } from "../_libs/lucide-react.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as Input } from "./input-DoD5W07l.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { a as finalizeUpload, i as extractDocument, l as uploadDocument, n as createUploadSession, o as getDocument, t as completeUploadFinalChunk } from "./documents.functions-RRwEEipk.mjs";
import { t as uploadFileResumable } from "./drive-upload-rPjjWF8E.mjs";
import { t as Card } from "./card-Bav9nr75.mjs";
import { t as Textarea } from "./textarea-Dfe41XSO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editorial-DK3vlnw9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var InputSchema = objectType({
	text: stringType().min(50, "Editorial too short").max(6e4),
	source: stringType().optional()
});
var analyseEditorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InputSchema.parse(data)).handler(createSsrRpc("77ffa6cdc1f81929823c7c3e4031250af9c364e2ef136cfec4c887aa4477d7fc"));
function EditorialPage() {
	const [text, setText] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)(null);
	const analyseFn = useServerFn(analyseEditorial);
	const startUploadSession = useServerFn(createUploadSession);
	const finalize = useServerFn(finalizeUpload);
	const completeFinalChunk = useServerFn(completeUploadFinalChunk);
	const uploadSmall = useServerFn(uploadDocument);
	const extractFn = useServerFn(extractDocument);
	const getDocFn = useServerFn(getDocument);
	const analyse = useMutation({
		mutationFn: async () => analyseFn({ data: {
			text: text.trim(),
			source: source.trim() || void 0
		} }),
		onSuccess: (r) => {
			setResult(r);
			toast.success("Editorial analysed");
		},
		onError: (e) => toast.error(e?.message ?? "Failed to analyse")
	});
	const onFile = async (file) => {
		try {
			toast.loading("Uploading editorial to Drive…", { id: "ext" });
			const mime = file.type || "application/pdf";
			const SMALL_MAX = 4 * 1024 * 1024;
			let uploaded;
			if (file.size <= SMALL_MAX) {
				const fd = new FormData();
				fd.set("file", file);
				fd.set("title", file.name);
				uploaded = await uploadSmall({ data: fd });
			} else {
				const session = await startUploadSession({ data: {
					fileName: file.name,
					mime,
					size: file.size,
					title: file.name
				} });
				let completedRow = null;
				const { driveFileId } = await uploadFileResumable({
					file,
					uploadUrl: session.uploadUrl,
					onProgress: (loaded, total) => {
						const pct = total ? Math.round(loaded / total * 100) : 0;
						toast.loading(`Uploading editorial… ${pct}%`, { id: "ext" });
					},
					uploadFinalChunk: async ({ blob, start, end, total }) => {
						const fd = new FormData();
						fd.set("documentId", session.documentId);
						fd.set("uploadUrl", session.uploadUrl);
						fd.set("start", String(start));
						fd.set("end", String(end));
						fd.set("total", String(total));
						fd.set("chunk", new File([blob], file.name, { type: mime }));
						completedRow = await completeFinalChunk({ data: fd });
						toast.loading("Uploading editorial… 100%", { id: "ext" });
						return { driveFileId: completedRow?.drive_file_id ?? null };
					}
				});
				uploaded = completedRow ?? await finalize({ data: {
					documentId: session.documentId,
					driveFileId
				} });
			}
			toast.loading("Extracting editorial from PDF…", { id: "ext" });
			if (!(await extractFn({ data: { documentId: uploaded.id } })).ok) throw new Error("Could not extract text from this PDF");
			const doc = await getDocFn({ data: { id: uploaded.id } });
			setText((doc.document.extracted_text || "").slice(0, 6e4));
			if (!source) setSource(file.name.replace(/\.pdf$/i, ""));
			toast.success("Editorial loaded — click Analyse", { id: "ext" });
		} catch (e) {
			toast.error(e?.message ?? "Failed to extract", { id: "ext" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative min-h-[calc(100vh-3rem)] bg-gradient-to-b from-background via-background to-indigo-50/30 dark:to-indigo-950/10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePen, { className: "h-6 w-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-2xl font-semibold sm:text-3xl",
						children: "Editorial Analyser"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "3-line summary, GS mapping, MCQs & mains in one click."
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-[1fr_auto]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Source (e.g., The Hindu — 'Decoding the new SC verdict')",
								value: source,
								onChange: (e) => setSource(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }),
									" Upload PDF",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "application/pdf",
										className: "hidden",
										onChange: (e) => {
											const f = e.target.files?.[0];
											if (f) onFile(f);
										}
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-3 min-h-[220px] resize-y font-serif text-[15px] leading-relaxed",
							placeholder: "Paste the full editorial text here…",
							value: text,
							onChange: (e) => setText(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [text.length.toLocaleString(), " characters"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => analyse.mutate(),
								disabled: analyse.isPending || text.trim().length < 50,
								className: "bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 text-white hover:opacity-95",
								children: [analyse.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), "Analyse Editorial"]
							})]
						})
					]
				}),
				result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultView, { r: result }),
				!result && !analyse.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground",
					children: [
						"Paste an editorial above (or upload a PDF) and hit ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Analyse Editorial" }),
						"."
					]
				})
			]
		})
	}) });
}
function ResultView({ r }) {
	const importanceTint = r.importance === "Very High" ? "bg-rose-500 text-white" : r.importance === "High" ? "bg-amber-500 text-white" : r.importance === "Medium" ? "bg-indigo-500 text-white" : "bg-muted text-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: r.source
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-serif text-xl font-semibold sm:text-2xl",
							children: r.title
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: importanceTint,
							children: ["Importance: ", r.importance]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: "3-line summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-1.5 text-[15px] leading-relaxed text-foreground",
							children: r.threeLineSummary?.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-indigo-600",
									children: [i + 1, "."]
								}), l]
							}, i))
						}),
						r.abstract && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-foreground/80",
							children: r.abstract
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "UPSC Syllabus Mapping",
				icon: Target,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: r.gsMapping?.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: g.paper
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted-foreground",
									children: g.subject
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 font-medium",
								children: g.topic
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-foreground/75",
								children: g.relevance
							})
						]
					}, i))
				})
			}),
			r.keyConcepts?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Key Concepts",
				icon: Lightbulb,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: r.keyConcepts.map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-indigo-700 dark:text-indigo-300",
							children: k.term
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 text-sm text-foreground/80",
							children: k.explanation
						})]
					}, i))
				})
			}),
			r.arguments?.for?.length || r.arguments?.against?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Arguments — For vs Against",
				icon: ListChecks,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300",
							children: "For"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1 text-sm",
							children: r.arguments.for?.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", x] }, i))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/40 dark:bg-rose-950/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300",
							children: "Against"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1 text-sm",
							children: r.arguments.against?.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", x] }, i))
						})]
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [r.facts?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Key Facts & Data",
					icon: TriangleAlert,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5 text-sm",
						children: r.facts.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", f] }, i))
					})
				}), r.vocabulary?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Exam-useful Vocabulary",
					icon: BookOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5 text-sm",
						children: r.vocabulary.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-indigo-700 dark:text-indigo-300",
								children: v.word
							}),
							" — ",
							v.meaning
						] }, i))
					})
				})]
			}),
			r.wayForward?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Way Forward",
				icon: Sparkles,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 text-sm",
					children: r.wayForward.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["→ ", w] }, i))
				})
			}),
			r.prelimsMCQs?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Prelims MCQs",
				icon: Target,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: r.prelimsMCQs.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-semibold",
								children: [
									"Q",
									i + 1,
									". ",
									m.q
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-2 space-y-1 text-sm",
								children: m.options?.map((o, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: j === m.answer ? "font-semibold text-emerald-700 dark:text-emerald-300" : "",
									children: [
										String.fromCharCode(65 + j),
										". ",
										o,
										" ",
										j === m.answer && "✓"
									]
								}, j))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Explanation:" }),
									" ",
									m.explanation
								]
							})
						]
					}, i))
				})
			}),
			r.mainsQuestions?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Mains Questions",
				icon: FilePen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: r.mainsQuestions.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-center gap-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: m.paper
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [m.marks, " marks"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: m.q
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-sm text-foreground/80",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Approach:" }),
									" ",
									m.approach
								]
							})
						]
					}, i))
				})
			}),
			r.pyqLinks?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Related PYQ Themes",
				icon: BookOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: r.pyqLinks.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", p] }, i))
				})
			})
		]
	});
}
function Section({ title, icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-indigo-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-serif text-lg font-semibold",
				children: title
			})]
		}), children]
	});
}
//#endregion
export { EditorialPage as component };
