import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-CCQEfgNs.mjs";
import { $ as Image, W as LoaderCircle, d as Trash2, dt as FileCheckCorner, g as Stamp, lt as FileText, mt as Download, n as X, s as Upload } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-DoD5W07l.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-D2wd5m0r.mjs";
import { t as Slider } from "./slider-DJrOTwgp.mjs";
import { a as degrees, i as rgb, n as PDFDocument, r as StandardFonts } from "../_libs/pdf-lib.mjs";
import { deleteDownload, formatSize, getDownloadBlob, listDownloads, onDownloadsUpdated, saveDownload } from "./downloads-store-CplUgcTw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stamp-DN6o-slk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAMP_SOURCE = "pdf-stamp";
var BRAND_IMAGE_KEY = "stamp:brand-image";
var BRAND_OPACITY_KEY = "stamp:brand-opacity";
var BRAND_SIZE_KEY = "stamp:brand-size";
var STAMP_TEXT_KEY = "stamp:text";
function StampPage() {
	const inputRef = (0, import_react.useRef)(null);
	const brandInputRef = (0, import_react.useRef)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [fileName, setFileName] = (0, import_react.useState)(null);
	const [pageCount, setPageCount] = (0, import_react.useState)(0);
	const [tookMs, setTookMs] = (0, import_react.useState)(0);
	const [stampText, setStampText] = (0, import_react.useState)("SIDHESWAR PUBLICATION");
	const [brandImage, setBrandImage] = (0, import_react.useState)(null);
	const [brandOpacity, setBrandOpacity] = (0, import_react.useState)(20);
	const [brandSize, setBrandSize] = (0, import_react.useState)(55);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		setBrandImage(window.localStorage.getItem(BRAND_IMAGE_KEY));
		const op = window.localStorage.getItem(BRAND_OPACITY_KEY);
		const sz = window.localStorage.getItem(BRAND_SIZE_KEY);
		const txt = window.localStorage.getItem(STAMP_TEXT_KEY);
		if (op) setBrandOpacity(Number(op));
		if (sz) setBrandSize(Number(sz));
		if (txt !== null) setStampText(txt);
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(STAMP_TEXT_KEY, stampText);
	}, [stampText]);
	const handleBrandImage = (0, import_react.useCallback)(async (file) => {
		if (!/^image\//.test(file.type)) {
			toast.error("Please choose a PNG or JPG image.");
			return;
		}
		if (file.size > 4 * 1024 * 1024) {
			toast.error("Brand image too large (max 4 MB). Please resize it.");
			return;
		}
		const dataUrl = await new Promise((resolve, reject) => {
			const r = new FileReader();
			r.onload = () => resolve(String(r.result));
			r.onerror = () => reject(r.error);
			r.readAsDataURL(file);
		});
		try {
			window.localStorage.setItem(BRAND_IMAGE_KEY, dataUrl);
		} catch {
			toast.error("Image is too large to save locally. Try a smaller file.");
			return;
		}
		setBrandImage(dataUrl);
		toast.success("Brand image saved");
	}, []);
	const clearBrandImage = (0, import_react.useCallback)(() => {
		window.localStorage.removeItem(BRAND_IMAGE_KEY);
		setBrandImage(null);
		toast.success("Brand image removed");
	}, []);
	const updateBrandOpacity = (0, import_react.useCallback)((v) => {
		setBrandOpacity(v);
		window.localStorage.setItem(BRAND_OPACITY_KEY, String(v));
	}, []);
	const updateBrandSize = (0, import_react.useCallback)((v) => {
		setBrandSize(v);
		window.localStorage.setItem(BRAND_SIZE_KEY, String(v));
	}, []);
	const handleFile = (0, import_react.useCallback)(async (file) => {
		if (!file) return;
		if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
			toast.error("Please upload a PDF file.");
			return;
		}
		setStatus("working");
		setFileName(file.name);
		const t0 = performance.now();
		try {
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
			const font = await pdf.embedFont(StandardFonts.HelveticaBold);
			const text = (stampText || "SIDHESWAR PUBLICATION").trim().toUpperCase();
			let brandImg = null;
			if (brandImage) try {
				const [, mime, b64] = brandImage.match(/^data:(image\/[^;]+);base64,(.+)$/) ?? [];
				if (mime && b64) {
					const raw = atob(b64);
					const buf = new Uint8Array(raw.length);
					for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
					brandImg = mime === "image/jpeg" ? await pdf.embedJpg(buf) : await pdf.embedPng(buf);
				}
			} catch (e) {
				console.warn("[stamp] brand image embed failed", e);
			}
			const pages = pdf.getPages();
			for (const page of pages) {
				const { width: pw, height: ph } = page.getSize();
				const diag = Math.sqrt(pw * pw + ph * ph);
				if (brandImg) {
					const maxDim = diag * (brandSize / 100);
					const scale = Math.min(maxDim / brandImg.width, maxDim / brandImg.height);
					const iw = brandImg.width * scale;
					const ih = brandImg.height * scale;
					const angle = Math.atan2(ph, pw);
					const cos = Math.cos(angle);
					const sin = Math.sin(angle);
					const cx = pw / 2;
					const cy = ph / 2;
					const x = cx - iw / 2 * cos + ih / 2 * sin;
					const y = cy - iw / 2 * sin - ih / 2 * cos;
					page.drawImage(brandImg, {
						x,
						y,
						width: iw,
						height: ih,
						rotate: degrees(angle * 180 / Math.PI),
						opacity: Math.max(.05, Math.min(1, brandOpacity / 100))
					});
				}
				const size = Math.max(24, diag * .045);
				const textWidth = font.widthOfTextAtSize(text, size);
				const cx = pw / 2;
				const cy = ph / 2;
				const angle = Math.atan2(ph, pw);
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);
				const x = cx - textWidth / 2 * cos + size / 2 * sin;
				const y = cy - textWidth / 2 * sin - size / 2 * cos;
				if (text) page.drawText(text, {
					x,
					y,
					size,
					font,
					color: rgb(.85, .15, .15),
					opacity: brandImg ? .12 : .18,
					rotate: degrees(angle * 180 / Math.PI)
				});
				if (text) {
					const footerSize = Math.max(9, Math.min(14, pw * .014));
					const footerText = `© ${text}`;
					const fw = font.widthOfTextAtSize(footerText, footerSize);
					page.drawText(footerText, {
						x: (pw - fw) / 2,
						y: 14,
						size: footerSize,
						font,
						color: rgb(.1, .1, .1),
						opacity: .55
					});
				}
			}
			const out = await pdf.save({ useObjectStreams: true });
			const blob = new Blob([out.buffer], { type: "application/pdf" });
			const stampedName = `${file.name.replace(/\.pdf$/i, "")}-stamped.pdf`;
			await saveDownload(blob, stampedName, {
				kind: "pdf",
				source: STAMP_SOURCE,
				meta: {
					pages: pages.length,
					stampText: text,
					original: file.name
				}
			});
			triggerBrowserDownload(blob, stampedName);
			setPageCount(pages.length);
			setTookMs(Math.round(performance.now() - t0));
			setStatus("done");
			toast.success(`Stamped ${pages.length} page${pages.length === 1 ? "" : "s"} — download started`);
		} catch (err) {
			console.error("[stamp] failed", err);
			setStatus("error");
			toast.error(err instanceof Error ? err.message : "Failed to stamp PDF");
		}
	}, [
		stampText,
		brandImage,
		brandOpacity,
		brandSize
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stamp, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif-display text-3xl sm:text-4xl font-bold text-foreground",
						children: "PDF Stamping"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm sm:text-base text-muted-foreground",
						children: "Upload any PDF — every page instantly stamped with your publication mark, then downloaded."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-border/60 bg-card/60 p-5 sm:p-8 backdrop-blur-md shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Brand image (logo) — optional"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 rounded-2xl border border-dashed border-border/70 bg-background/40 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: brandInputRef,
							type: "file",
							accept: "image/png,image/jpeg,image/webp",
							className: "sr-only",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (f) handleBrandImage(f);
								e.target.value = "";
							}
						}), brandImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 sm:flex-row sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-white p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: brandImage,
									alt: "Brand logo preview",
									className: "h-full w-full object-contain"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 flex items-center justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Opacity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular-nums",
											children: [brandOpacity, "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: [brandOpacity],
										onValueChange: (v) => updateBrandOpacity(v[0] ?? 20),
										min: 5,
										max: 100,
										step: 5
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 flex items-center justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular-nums",
											children: [brandSize, "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: [brandSize],
										onValueChange: (v) => updateBrandSize(v[0] ?? 55),
										min: 20,
										max: 100,
										step: 5
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "outline",
											size: "sm",
											onClick: () => brandInputRef.current?.click(),
											className: "gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), " Replace"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: clearBrandImage,
											className: "gap-1.5 text-red-600 hover:text-red-700",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Remove"]
										})]
									})
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3 py-4 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground",
									children: "Upload your brand logo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "PNG, JPG or WebP · saved on this device"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => brandInputRef.current?.click(),
									className: "gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), " Choose image"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Stamp text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: stampText,
						onChange: (e) => setStampText(e.target.value),
						placeholder: "SIDHESWAR PUBLICATION",
						className: "mb-6",
						maxLength: 64
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onDragOver: (e) => {
							e.preventDefault();
							e.stopPropagation();
						},
						onDrop: (e) => {
							e.preventDefault();
							e.stopPropagation();
							const f = e.dataTransfer.files?.[0];
							if (f) handleFile(f);
						},
						className: "relative rounded-2xl border-2 border-dashed border-border/70 bg-background/40 p-8 sm:p-12 text-center transition-colors hover:border-primary/60 hover:bg-primary/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							type: "file",
							accept: "application/pdf,.pdf",
							className: "sr-only",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (f) handleFile(f);
								e.target.value = "";
							}
						}), status === "working" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [
									"Stamping ",
									fileName,
									"…"
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto mb-3 h-10 w-10 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-1 text-base font-semibold text-foreground",
								children: "Drop your PDF here"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-5 text-xs text-muted-foreground",
								children: "Fully processed on your device — nothing uploaded to a server."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "lg",
								onClick: () => inputRef.current?.click(),
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), "Choose PDF"]
							})
						] })]
					}),
					status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { className: "mt-0.5 h-5 w-5 shrink-0 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: "Done — download started"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-muted-foreground",
									children: [
										"Stamped ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pageCount }),
										" page",
										pageCount === 1 ? "" : "s",
										" of ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fileName }),
										" in",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [tookMs, " ms"] }),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "mt-3 gap-2",
									onClick: () => inputRef.current?.click(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Stamp another PDF"]
								})
							]
						})]
					}),
					status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600",
						children: "Something went wrong. The PDF may be encrypted or corrupt — try another file."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-lg border border-border/50 bg-card/40 p-3",
						children: "⚡ Instant — runs in your browser"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-lg border border-border/50 bg-card/40 p-3",
						children: "🔒 Private — file never leaves your device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-lg border border-border/50 bg-card/40 p-3",
						children: "📄 Every page stamped diagonally + footer"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StampedHistory, {})
		]
	}) });
}
function triggerBrowserDownload(blob, filename) {
	if (typeof window !== "undefined" && window.AndroidInterface) {
		const reader = new FileReader();
		reader.onloadend = function() {
			const base64Data = reader.result;
			window.AndroidInterface.downloadFile(base64Data, filename, blob.type);
		};
		reader.readAsDataURL(blob);
	} else {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 4e3);
	}
}
function StampedHistory() {
	const [rows, setRows] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const load = () => listDownloads().then((all) => {
			if (!alive) return;
			setRows(all.filter((r) => r.source === STAMP_SOURCE));
		});
		load();
		const off = onDownloadsUpdated(load);
		return () => {
			alive = false;
			off();
		};
	}, []);
	const redownload = (0, import_react.useCallback)(async (row) => {
		const blob = await getDownloadBlob(row.id);
		if (!blob) {
			toast.error("File data missing — please stamp again.");
			return;
		}
		triggerBrowserDownload(blob, row.name);
	}, []);
	const remove = (0, import_react.useCallback)(async (row) => {
		await deleteDownload(row.id);
		toast.success(`Removed ${row.name}`);
	}, []);
	if (!rows || rows.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-3xl border border-border/60 bg-card/60 p-5 sm:p-6 backdrop-blur-md shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-serif-display text-lg font-semibold text-foreground",
				children: [
					"Stamped files (",
					rows.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: "Kept until you remove them"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-foreground",
							children: row.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								formatSize(row.size),
								typeof row.meta?.pages === "number" ? ` · ${row.meta.pages} pages` : "",
								" · ",
								new Date(row.created_at).toLocaleString()
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						onClick: () => redownload(row),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Download"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "text-muted-foreground hover:text-red-600",
						onClick: () => remove(row),
						"aria-label": `Remove ${row.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}, row.id))
		})]
	});
}
//#endregion
export { StampPage as component };
