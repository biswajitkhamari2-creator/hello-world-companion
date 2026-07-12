import { a as getWatermarkSettings, i as getUserLogoDataUrl, l as sizeFactorFor, n as blurPxFor, r as dataUrlToBytes } from "./user-logo-0B89f-km.mjs";
import { a as degrees } from "../_libs/pdf-lib.mjs";
import { t as sidheswar_logo_default } from "./sidheswar-logo-xt1QZwb2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pdf-watermark-Dyl5UKws.js
var cachedDefaultBytes = null;
var WATERMARK_MISSING_MESSAGE = "Watermark logo missing. Please upload the official SIDHESWAR PUBLICATION logo.";
async function loadDefaultLogoBytes() {
	if (cachedDefaultBytes) return cachedDefaultBytes;
	const res = await fetch(sidheswar_logo_default);
	if (!res.ok) throw new Error(WATERMARK_MISSING_MESSAGE);
	const buf = await res.arrayBuffer();
	if (!buf.byteLength) throw new Error(WATERMARK_MISSING_MESSAGE);
	cachedDefaultBytes = new Uint8Array(buf);
	return cachedDefaultBytes;
}
var activeOpts = null;
function setActiveDrawOptions(opts) {
	activeOpts = opts;
}
var DEFAULT_DRAW = {
	placement: "center",
	opacity: .07,
	sizeFactor: .82,
	blurPx: 0,
	rotationDeg: 0,
	margin: 36
};
function buildDrawOptions(s) {
	return {
		placement: s.placement,
		opacity: Math.max(0, Math.min(.15, s.opacity)),
		sizeFactor: sizeFactorFor(s.size),
		blurPx: blurPxFor(s.blur),
		rotationDeg: s.rotation,
		margin: s.margin
	};
}
/** Decide which logo (user vs default) to embed for this PDF. */
async function loadActiveWatermarkImage(pdf) {
	const settings = getWatermarkSettings();
	const userUrl = getUserLogoDataUrl();
	if (settings.enabled && userUrl) try {
		const bytes = dataUrlToBytes(userUrl);
		const img = await pdf.embedPng(bytes);
		console.info("[watermark] embedded USER logo", {
			w: img.width,
			h: img.height
		});
		return {
			img,
			isUserLogo: true,
			opts: buildDrawOptions(settings)
		};
	} catch (err) {
		console.warn("[watermark] user logo embed failed, falling back to default", err);
	}
	const bytes = await loadDefaultLogoBytes();
	return {
		img: await pdf.embedPng(bytes),
		isUserLogo: false,
		opts: DEFAULT_DRAW
	};
}
/** Backwards-compatible: returns default SIDHESWAR-or-user image without opts. */
async function loadWatermarkImage(pdf) {
	const { img, opts } = await loadActiveWatermarkImage(pdf);
	setActiveDrawOptions(opts);
	return img;
}
function placeBox(pw, ph, iw, ih, placement, sizeFactor, margin) {
	let maxW = pw * sizeFactor;
	let maxH = ph * sizeFactor;
	if (placement !== "center") {
		maxW = Math.min(pw * .3, maxW);
		maxH = Math.min(ph * .22, maxH);
	}
	const scale = Math.min(maxW / iw, maxH / ih, 1);
	const w = iw * scale;
	const h = ih * scale;
	let x = (pw - w) / 2;
	let y = (ph - h) / 2;
	switch (placement) {
		case "top-left":
			x = margin;
			y = ph - h - margin;
			break;
		case "top-right":
			x = pw - w - margin;
			y = ph - h - margin;
			break;
		case "bottom-left":
			x = margin;
			y = margin;
			break;
		case "bottom-right":
			x = pw - w - margin;
			y = margin;
			break;
		case "header-center":
			x = (pw - w) / 2;
			y = ph - h - margin;
			break;
		case "footer-center":
			x = (pw - w) / 2;
			y = margin;
			break;
		default: break;
	}
	return {
		x,
		y,
		w,
		h
	};
}
function drawWatermarkOnPage(page, img) {
	const opts = activeOpts ?? DEFAULT_DRAW;
	const { width: pw, height: ph } = page.getSize();
	const { x, y, w, h } = placeBox(pw, ph, img.width, img.height, opts.placement, opts.sizeFactor, opts.margin);
	const rotate = degrees(opts.rotationDeg);
	if (opts.blurPx > 0) {
		const haloOp = Math.max(.005, opts.opacity * .12);
		page.drawImage(img, {
			x: x - opts.blurPx,
			y,
			width: w,
			height: h,
			rotate,
			opacity: haloOp
		});
		page.drawImage(img, {
			x: x + opts.blurPx,
			y,
			width: w,
			height: h,
			rotate,
			opacity: haloOp
		});
		page.drawImage(img, {
			x,
			y: y - opts.blurPx,
			width: w,
			height: h,
			rotate,
			opacity: haloOp
		});
		page.drawImage(img, {
			x,
			y: y + opts.blurPx,
			width: w,
			height: h,
			rotate,
			opacity: haloOp
		});
	}
	page.drawImage(img, {
		x,
		y,
		width: w,
		height: h,
		rotate,
		opacity: opts.opacity
	});
}
async function applyWatermarkToAllPages(pdf, context = "pdf-export") {
	const startedAt = Date.now();
	const { img, opts } = await loadActiveWatermarkImage(pdf);
	setActiveDrawOptions(opts);
	const pages = pdf.getPages();
	for (const page of pages) drawWatermarkOnPage(page, img);
	console.info(`[watermark:${context}] applied`, {
		pageCount: pages.length,
		durationMs: Date.now() - startedAt
	});
}
//#endregion
export { applyWatermarkToAllPages, drawWatermarkOnPage, loadActiveWatermarkImage, loadWatermarkImage };
