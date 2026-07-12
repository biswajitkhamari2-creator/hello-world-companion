import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram.server-CNrfEYV6.js
var telegram_server_exports = /* @__PURE__ */ __exportAll({
	getTelegramWebhookSecret: () => getTelegramWebhookSecret,
	safeEqual: () => safeEqual,
	tgCall: () => tgCall,
	tgDownload: () => tgDownload
});
function botToken() {
	const t = (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY)?.trim();
	if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
	return t;
}
/** Derived from bot token so webhook register and verify agree without a manual secret. */
function getTelegramWebhookSecret() {
	return createHash("sha256").update(`telegram-webhook:${botToken()}`).digest("base64url");
}
function safeEqual(a, b) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}
async function tgCall(method, body) {
	const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : "{}"
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${data.description || JSON.stringify(data)}`);
	return data.result;
}
async function tgDownload(fileId) {
	const file = await tgCall("getFile", { file_id: fileId });
	const res = await fetch(`https://api.telegram.org/file/bot${botToken()}/${file.file_path}`);
	if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
	return {
		bytes: await res.arrayBuffer(),
		path: file.file_path
	};
}
//#endregion
export { tgDownload as i, safeEqual as n, telegram_server_exports as r, getTelegramWebhookSecret as t };
