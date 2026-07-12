import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/user-logo-0B89f-km.js
var user_logo_0B89f_km_exports = /* @__PURE__ */ __exportAll({
	a: () => getWatermarkSettings,
	c: () => setWatermarkSettings,
	i: () => getUserLogoDataUrl,
	l: () => sizeFactorFor,
	n: () => blurPxFor,
	o: () => normaliseLogoToPng,
	r: () => dataUrlToBytes,
	s: () => setUserLogoDataUrl,
	t: () => DEFAULT_SETTINGS,
	u: () => user_logo_exports
});
var user_logo_exports = /* @__PURE__ */ __exportAll$1({
	DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
	blurPxFor: () => blurPxFor,
	dataUrlToBytes: () => dataUrlToBytes,
	getUserLogoDataUrl: () => getUserLogoDataUrl,
	getWatermarkSettings: () => getWatermarkSettings,
	normaliseLogoToPng: () => normaliseLogoToPng,
	setUserLogoDataUrl: () => setUserLogoDataUrl,
	setWatermarkSettings: () => setWatermarkSettings,
	sizeFactorFor: () => sizeFactorFor
});
var DEFAULT_SETTINGS = {
	enabled: false,
	placement: "center",
	opacity: .08,
	size: "large",
	blur: "off",
	rotation: 0,
	margin: 36
};
var LOGO_KEY = "stamp_logo_data_url_v1";
var SETTINGS_KEY = "stamp_logo_settings_v1";
function isBrowser() {
	return typeof window !== "undefined" && typeof localStorage !== "undefined";
}
function getUserLogoDataUrl() {
	if (!isBrowser()) return null;
	try {
		return localStorage.getItem(LOGO_KEY);
	} catch {
		return null;
	}
}
function setUserLogoDataUrl(url) {
	if (!isBrowser()) return;
	try {
		if (url) localStorage.setItem(LOGO_KEY, url);
		else localStorage.removeItem(LOGO_KEY);
	} catch (e) {
		console.warn("[stamp-logo] storage write failed", e);
	}
}
function getWatermarkSettings() {
	if (!isBrowser()) return DEFAULT_SETTINGS;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return DEFAULT_SETTINGS;
		return {
			...DEFAULT_SETTINGS,
			...JSON.parse(raw)
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}
function setWatermarkSettings(s) {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
	} catch (e) {
		console.warn("[stamp-logo] settings write failed", e);
	}
}
/** Convert any uploaded logo file (PNG/JPG/SVG/WebP) to a PNG data URL. */
async function normaliseLogoToPng(file) {
	const ALLOWED = [
		"image/png",
		"image/jpeg",
		"image/jpg",
		"image/svg+xml",
		"image/webp"
	];
	if (file.size > 6 * 1024 * 1024) throw new Error("Logo must be under 6 MB.");
	if (!ALLOWED.includes(file.type) && !/\.(png|jpe?g|svg|webp)$/i.test(file.name)) throw new Error("Logo must be PNG, JPG, SVG, or WebP.");
	const img = await loadImage(await readAsDataUrl(file));
	const MAX = 1024;
	let { width: w, height: h } = img;
	if (w > MAX || h > MAX) {
		const s = Math.min(MAX / w, MAX / h);
		w = Math.round(w * s);
		h = Math.round(h * s);
	}
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, w);
	canvas.height = Math.max(1, h);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas not supported.");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/png");
}
function readAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(/* @__PURE__ */ new Error("Could not read file."));
		r.readAsDataURL(file);
	});
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not decode image."));
		img.src = src;
	});
}
/** Decode a data URL into raw bytes for pdf-lib. */
function dataUrlToBytes(dataUrl) {
	const comma = dataUrl.indexOf(",");
	const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function sizeFactorFor(size) {
	if (size === "small") return .22;
	if (size === "medium") return .45;
	return .78;
}
function blurPxFor(blur) {
	if (blur === "off") return 0;
	if (blur === "low") return .3;
	return .8;
}
//#endregion
export { getWatermarkSettings as a, setWatermarkSettings as c, getUserLogoDataUrl as i, sizeFactorFor as l, blurPxFor as n, normaliseLogoToPng as o, dataUrlToBytes as r, setUserLogoDataUrl as s, DEFAULT_SETTINGS as t, user_logo_0B89f_km_exports as u };
