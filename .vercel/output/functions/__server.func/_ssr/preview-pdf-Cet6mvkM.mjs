import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as getWatermarkSettings, i as getUserLogoDataUrl, l as sizeFactorFor, n as blurPxFor } from "./user-logo-0B89f-km.mjs";
import { t as sidheswar_logo_default } from "./sidheswar-logo-xt1QZwb2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preview-pdf-Cet6mvkM.js
var preview_pdf_exports = /* @__PURE__ */ __exportAll({
	downloadPreviewAsPdf: () => downloadPreviewAsPdf,
	verifyPreviewExport: () => verifyPreviewExport
});
var _html2canvas = null;
var _jsPDFCtor = null;
async function loadPdfLibs() {
	if (!_html2canvas) _html2canvas = (await import("../_libs/html2canvas-pro.mjs").then((n) => n.t)).default;
	if (!_jsPDFCtor) _jsPDFCtor = (await import("../_libs/jspdf.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).jsPDF;
	return {
		html2canvas: _html2canvas,
		jsPDF: _jsPDFCtor
	};
}
var A4_CSS_WIDTH = 794;
var A4_CSS_HEIGHT = 1123;
var A4_MM_W = 210;
var A4_MM_H = 297;
var CAPTURE_SCALE = 2.5;
var REQUIRED_FONTS = [
	"400 16px Caveat",
	"700 36px Caveat",
	"400 21px Kalam",
	"700 26px Kalam",
	"400 18px 'Patrick Hand'",
	"400 16px Fraunces",
	"600 18px Fraunces",
	"400 16px Inter"
];
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not decode image: " + src));
		img.src = src;
	});
}
async function waitForAssets(root) {
	if (document.fonts) try {
		await Promise.all(REQUIRED_FONTS.map((f) => document.fonts.load(f).catch(() => null)));
		await document.fonts.ready;
		console.log("[preview-pdf] fonts ready", { count: REQUIRED_FONTS.length });
	} catch (e) {
		console.warn("[preview-pdf] font wait failed", e);
	}
	const imgs = Array.from(root.querySelectorAll("img"));
	await Promise.all(imgs.map((img) => {
		if (img.complete && img.naturalWidth > 0) return Promise.resolve();
		return new Promise((resolve) => {
			img.addEventListener("load", () => resolve(), { once: true });
			img.addEventListener("error", () => resolve(), { once: true });
		});
	}));
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}
async function loadWatermark(canvasWidthPx) {
	const s = getWatermarkSettings();
	const userLogo = getUserLogoDataUrl();
	const useUserLogo = s.enabled && !!userLogo;
	let src = useUserLogo ? userLogo : null;
	if (!src) try {
		const blob = await (await fetch(sidheswar_logo_default)).blob();
		src = await new Promise((resolve, reject) => {
			const r = new FileReader();
			r.onload = () => resolve(String(r.result));
			r.onerror = () => reject(/* @__PURE__ */ new Error("logo read failed"));
			r.readAsDataURL(blob);
		});
	} catch (e) {
		console.warn("[preview-pdf] watermark logo missing", e);
		return null;
	}
	if (!src) return null;
	const img = await loadImage(src);
	const marginPx = Math.round(canvasWidthPx * .04);
	console.log("[preview-pdf] watermark loaded", {
		w: img.naturalWidth,
		h: img.naturalHeight,
		source: useUserLogo ? "user" : "default"
	});
	const opacity = Math.max(useUserLogo ? .25 : 0, Math.min(useUserLogo ? .85 : .15, s.opacity || (useUserLogo ? .45 : .08)));
	return {
		img,
		placement: s.placement,
		opacity,
		sizeFactor: sizeFactorFor(s.size),
		blurPx: blurPxFor(s.blur),
		rotationDeg: s.rotation || 0,
		marginPx
	};
}
function drawWatermark(ctx, pageW, pageH, wm) {
	const targetW = pageW * wm.sizeFactor;
	const targetH = targetW * (wm.img.naturalHeight / wm.img.naturalWidth || 1);
	let x = (pageW - targetW) / 2;
	let y = (pageH - targetH) / 2;
	switch (wm.placement) {
		case "top-left":
			x = wm.marginPx;
			y = wm.marginPx;
			break;
		case "top-right":
			x = pageW - targetW - wm.marginPx;
			y = wm.marginPx;
			break;
		case "bottom-left":
			x = wm.marginPx;
			y = pageH - targetH - wm.marginPx;
			break;
		case "bottom-right":
			x = pageW - targetW - wm.marginPx;
			y = pageH - targetH - wm.marginPx;
			break;
		case "header-center":
			x = (pageW - targetW) / 2;
			y = wm.marginPx;
			break;
		case "footer-center":
			x = (pageW - targetW) / 2;
			y = pageH - targetH - wm.marginPx;
			break;
	}
	ctx.save();
	ctx.globalAlpha = wm.opacity;
	if (wm.blurPx > 0) ctx.filter = `blur(${wm.blurPx}px)`;
	if (wm.rotationDeg) {
		const cx = x + targetW / 2, cy = y + targetH / 2;
		ctx.translate(cx, cy);
		ctx.rotate(wm.rotationDeg * Math.PI / 180);
		ctx.translate(-cx, -cy);
	}
	ctx.drawImage(wm.img, x, y, targetW, targetH);
	ctx.restore();
}
function isCanvasEffectivelyBlank(canvas) {
	const sample = document.createElement("canvas");
	sample.width = 96;
	sample.height = 136;
	const ctx = sample.getContext("2d", { willReadFrequently: true });
	if (!ctx) return false;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, sample.width, sample.height);
	ctx.drawImage(canvas, 0, 0, sample.width, sample.height);
	const pixels = ctx.getImageData(0, 0, sample.width, sample.height).data;
	let nonWhite = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
		if (pixels[i + 3] > 16 && (r < 246 || g < 246 || b < 246)) nonWhite++;
		if (nonWhite > 12) return false;
	}
	return true;
}
function buildPagedCaptureStage(node) {
	const stage = document.createElement("div");
	const mover = document.createElement("div");
	const clone = node.cloneNode(true);
	Object.assign(stage.style, {
		position: "fixed",
		left: "0",
		top: "0",
		width: `${A4_CSS_WIDTH}px`,
		height: `${A4_CSS_HEIGHT}px`,
		overflow: "hidden",
		background: "#ffffff",
		pointerEvents: "none",
		zIndex: "2147483647",
		contain: "layout paint style",
		color: "#0f172a"
	});
	for (const [k, v] of Object.entries({
		"--background": "#ffffff",
		"--foreground": "#0f172a",
		"--paper": "#ffffff",
		"--ink": "#0f172a",
		"--card": "#ffffff",
		"--card-foreground": "#0f172a",
		"--popover": "#ffffff",
		"--popover-foreground": "#0f172a",
		"--primary": "#064e3b",
		"--primary-foreground": "#ffffff",
		"--secondary": "#e2e8f0",
		"--secondary-foreground": "#0f172a",
		"--muted": "#f1f5f9",
		"--muted-foreground": "#475569",
		"--accent": "#c9a84c",
		"--accent-foreground": "#0f172a",
		"--destructive": "#dc2626",
		"--destructive-foreground": "#ffffff",
		"--border": "#e2e8f0",
		"--input": "#e2e8f0",
		"--ring": "#c9a84c"
	})) stage.style.setProperty(k, v);
	Object.assign(mover.style, {
		width: `${A4_CSS_WIDTH}px`,
		transformOrigin: "left top",
		willChange: "transform"
	});
	clone.style.boxSizing = "border-box";
	clone.style.position = "relative";
	clone.style.left = "0";
	clone.style.top = "0";
	clone.style.right = "auto";
	clone.style.bottom = "auto";
	clone.style.transform = "none";
	clone.style.opacity = "1";
	clone.style.overflow = "visible";
	clone.style.height = "auto";
	clone.style.maxHeight = "none";
	clone.style.width = `${A4_CSS_WIDTH}px`;
	clone.style.maxWidth = `${A4_CSS_WIDTH}px`;
	clone.style.margin = "0";
	clone.style.background = "#ffffff";
	clone.style.color = "#0f172a";
	clone.classList.remove("dark");
	clone.querySelectorAll(".dark").forEach((el) => el.classList.remove("dark"));
	mover.appendChild(clone);
	stage.appendChild(mover);
	document.body.appendChild(stage);
	return {
		stage,
		mover,
		clone
	};
}
/**
* Walk down single-child wrappers until we hit the first node with multiple
* children — that is the real block container we want to paginate.
*/
function findBlockContainer(root) {
	let node = root;
	for (let i = 0; i < 6; i++) {
		const kids = Array.from(node.children);
		if (kids.length > 1) return node;
		if (kids.length === 1) {
			node = kids[0];
			continue;
		}
		break;
	}
	return root;
}
/**
* Compute Y offsets at which to break pages. Each break aligns with a block
* boundary so headings / callout boxes / handwritten paragraphs are never
* split across pages. If a single block is taller than a page, it is sliced
* (last-resort) instead of being dropped.
*/
function computePageBreaks(stage, container, pageHeight) {
	const stageRect = stage.getBoundingClientRect();
	const children = Array.from(container.children);
	if (children.length === 0) return [0, Math.max(pageHeight, container.scrollHeight)];
	const blocks = children.map((c) => {
		const r = c.getBoundingClientRect();
		const top = r.top - stageRect.top;
		return {
			top,
			bottom: top + r.height,
			h: r.height
		};
	});
	const breaks = [0];
	let pageTop = 0;
	for (const b of blocks) {
		if (b.top - pageTop >= pageHeight) {
			pageTop = b.top;
			breaks.push(pageTop);
		}
		if (b.bottom - pageTop <= pageHeight) continue;
		const usedRatio = (b.top - pageTop) / pageHeight;
		if (b.top > pageTop && usedRatio >= .35) {
			pageTop = b.top;
			breaks.push(pageTop);
		}
		while (b.bottom - pageTop > pageHeight) {
			pageTop += pageHeight;
			breaks.push(pageTop);
		}
	}
	const total = Math.max(container.scrollHeight, blocks[blocks.length - 1].bottom);
	if (breaks[breaks.length - 1] < total) breaks.push(total);
	return breaks;
}
async function captureStagePage(stage, mover, offsetY, visibleHeight) {
	mover.style.transform = `translateY(-${offsetY}px)`;
	stage.style.height = `${visibleHeight}px`;
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
	const { html2canvas } = await loadPdfLibs();
	const canvas = await html2canvas(stage, {
		scale: CAPTURE_SCALE,
		useCORS: true,
		backgroundColor: "#ffffff",
		logging: false,
		width: A4_CSS_WIDTH,
		height: visibleHeight,
		windowWidth: A4_CSS_WIDTH,
		windowHeight: visibleHeight,
		scrollX: 0,
		scrollY: 0
	});
	if (canvas.height < A4_CSS_HEIGHT * CAPTURE_SCALE) {
		const padded = document.createElement("canvas");
		padded.width = A4_CSS_WIDTH * CAPTURE_SCALE;
		padded.height = A4_CSS_HEIGHT * CAPTURE_SCALE;
		const ctx = padded.getContext("2d");
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, padded.width, padded.height);
		ctx.drawImage(canvas, 0, 0);
		return padded;
	}
	return canvas;
}
function getPreviewText(node) {
	return (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
}
function isNodeOnScreen(node) {
	if (!node.isConnected) return {
		ok: false,
		reason: "Preview node is not attached to the document."
	};
	const style = window.getComputedStyle(node);
	if (style.display === "none") return {
		ok: false,
		reason: "Preview node has display:none."
	};
	if (style.visibility === "hidden") return {
		ok: false,
		reason: "Preview node has visibility:hidden."
	};
	const rect = node.getBoundingClientRect();
	if (rect.width < 10 || rect.height < 10) return {
		ok: false,
		reason: "Preview node has zero size."
	};
	if (rect.right < -500 || rect.bottom < -500 || rect.left > window.innerWidth + 5e3) return {
		ok: false,
		reason: "Preview node is rendered off-screen."
	};
	return { ok: true };
}
async function runCapture(node) {
	const vis = isNodeOnScreen(node);
	if (!vis.ok) {
		console.error("[preview-pdf] refusing to export hidden source", { reason: vis.reason });
		throw new Error(vis.reason || "Preview is not visible on screen.");
	}
	node.setAttribute("data-pdf-source", "active");
	console.log("[preview-pdf] capture source", {
		rect: node.getBoundingClientRect(),
		chars: (node.innerText || "").length
	});
	await waitForAssets(node);
	const previewText = getPreviewText(node);
	const { jsPDF } = await loadPdfLibs();
	const pdf = new jsPDF({
		unit: "mm",
		format: "a4",
		orientation: "portrait",
		compress: true
	});
	const { stage, mover, clone } = buildPagedCaptureStage(node);
	await waitForAssets(stage);
	const breaks = computePageBreaks(stage, findBlockContainer(clone), A4_CSS_HEIGHT);
	console.log("[preview-pdf] pagination plan", {
		totalHeight: clone.scrollHeight,
		pages: breaks.length - 1,
		breaks
	});
	const stageText = getPreviewText(stage);
	const blankPageNumbers = [];
	let firstContentSeen = false;
	let writtenPages = 0;
	let wm = null;
	try {
		for (let i = 0; i < breaks.length - 1; i++) {
			const offsetY = breaks[i];
			const next = breaks[i + 1];
			const visibleHeight = Math.min(A4_CSS_HEIGHT, Math.max(1, next - offsetY));
			const remainingHeight = A4_CSS_HEIGHT - visibleHeight;
			console.log(`[preview-pdf] page ${i + 1}`, {
				offsetY,
				visibleHeight,
				remainingHeight,
				blockBoundary: next
			});
			const pageCanvas = await captureStagePage(stage, mover, offsetY, visibleHeight);
			if (!wm) wm = await loadWatermark(pageCanvas.width);
			const blank = isCanvasEffectivelyBlank(pageCanvas);
			if (!blank) firstContentSeen = true;
			else blankPageNumbers.push(writtenPages + 1);
			const ctx = pageCanvas.getContext("2d");
			if (wm) drawWatermark(ctx, pageCanvas.width, pageCanvas.height, wm);
			const dataUrl = pageCanvas.toDataURL("image/jpeg", .94);
			if (writtenPages > 0) pdf.addPage();
			pdf.addImage(dataUrl, "JPEG", 0, 0, A4_MM_W, A4_MM_H, void 0, "FAST");
			writtenPages++;
			console.log(`[preview-pdf] page ${i + 1} added`, {
				blank,
				watermark: !!wm
			});
		}
	} finally {
		stage.remove();
	}
	const previewCharCount = previewText.length;
	const capturedCharCount = stageText.length;
	const coverageRatio = previewCharCount === 0 ? 1 : capturedCharCount / previewCharCount;
	const issues = [];
	if (!firstContentSeen) issues.push("Captured pages appear blank — preview may have been hidden during export.");
	if (blankPageNumbers.length > 0) issues.push(`Blank pages detected at: ${blankPageNumbers.join(", ")}.`);
	if (previewCharCount > 200 && coverageRatio < .9) issues.push(`Captured text covers only ${Math.round(coverageRatio * 100)}% of the preview.`);
	if (writtenPages === 0) issues.push("No pages were written to the PDF.");
	if (!wm) issues.push("Watermark logo failed to load.");
	return {
		pdf,
		report: {
			ok: issues.length === 0,
			pages: writtenPages,
			blankPageNumbers,
			previewCharCount,
			capturedCharCount,
			coverageRatio,
			issues
		}
	};
}
async function verifyPreviewExport(node) {
	if (!node) throw new Error("Preview node not ready.");
	const { report } = await runCapture(node);
	console.log("[preview-pdf] verify", report);
	return report;
}
async function downloadPreviewAsPdf(node, filename, options = {}) {
	if (!node) throw new Error("Preview node not ready.");
	const { verifyBefore = true, onReport } = options;
	const { pdf, report } = await runCapture(node);
	onReport?.(report);
	if (verifyBefore && !report.ok) {
		const err = /* @__PURE__ */ new Error(`Verify export failed: ${report.issues.join(" ")}`);
		err.report = report;
		throw err;
	}
	const safe = filename.replace(/[^\w\-]+/g, "_").slice(0, 80) || "document";
	const blob = pdf.output("blob");
	const { saveAndDownload } = await import("./downloads-store-CplUgcTw.mjs");
	await saveAndDownload(blob, `${safe}.pdf`, {
		kind: "pdf",
		source: "dashboard-preview"
	});
	console.log("[preview-pdf] exported", {
		filename: safe,
		pages: pdf.getNumberOfPages(),
		report
	});
	return report;
}
//#endregion
export { preview_pdf_exports as n, downloadPreviewAsPdf as t };
