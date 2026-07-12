import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-quota-status.functions-D8kz1K7B.js
var LABELS = {
	nvidia: "NVIDIA",
	groq: "Groq",
	gemini: "Gemini"
};
function cleanKey(v) {
	if (!v) return void 0;
	let c = v.trim().replace(/^['"]|['"]$/g, "");
	const m = c.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
	if (m?.[1]) c = m[1].trim().replace(/^['"]|['"]$/g, "");
	return c || void 0;
}
function urlFor(p) {
	if (p === "nvidia") return "https://integrate.api.nvidia.com/v1/models";
	if (p === "groq") return "https://api.groq.com/openai/v1/models";
	return "https://generativelanguage.googleapis.com/v1beta/openai/models";
}
async function checkProvider(p, key) {
	const ac = new AbortController();
	const t = setTimeout(() => ac.abort(), 4e3);
	try {
		const r = await fetch(urlFor(p), {
			headers: { Authorization: `Bearer ${key}` },
			signal: ac.signal
		});
		return {
			authorized: r.status !== 401 && r.status !== 403,
			rateLimited: r.status === 429
		};
	} catch {
		return {
			authorized: true,
			rateLimited: false
		};
	} finally {
		clearTimeout(t);
	}
}
var getAiQuotaStatus_createServerFn_handler = createServerRpc({
	id: "3d7295961ffeeef6109fc6a0b62201b1101d8b9c0cc1bbed513bce60d8bbc675",
	name: "getAiQuotaStatus",
	filename: "src/lib/ai-quota-status.functions.ts"
}, (opts) => getAiQuotaStatus.__executeServer(opts));
var getAiQuotaStatus = createServerFn({ method: "GET" }).handler(getAiQuotaStatus_createServerFn_handler, async () => {
	const keys = {
		nvidia: cleanKey(process.env.NVIDIA_API_KEY),
		groq: cleanKey(process.env.GROQ_API_KEY),
		gemini: cleanKey(process.env.GEMINI_API_KEY)
	};
	const results = await Promise.all([
		"nvidia",
		"groq",
		"gemini"
	].map(async (name) => {
		const key = keys[name];
		if (!key) return {
			name,
			label: LABELS[name],
			configured: false,
			authorized: false,
			rateLimited: false
		};
		const { authorized, rateLimited } = await checkProvider(name, key);
		return {
			name,
			label: LABELS[name],
			configured: true,
			authorized,
			rateLimited
		};
	}));
	const healthy = results.filter((r) => r.configured && r.authorized && !r.rateLimited);
	const active = healthy[0]?.name ?? null;
	let level = "ok";
	let message = "";
	if (!active) {
		level = "down";
		message = "All AI providers exhausted or unauthorized. AI features paused.";
	} else if (healthy.length === 1) {
		level = "critical";
		message = `Only ${LABELS[active]} is available. Other AI providers exhausted.`;
	} else if (active !== "nvidia" && results.find((r) => r.name === "nvidia")?.configured) {
		level = "warn";
		message = `NVIDIA quota exhausted — switched to ${LABELS[active]}.`;
	} else message = `AI running on ${LABELS[active]}. ${healthy.length} providers healthy.`;
	return {
		providers: results,
		active,
		message,
		level
	};
});
//#endregion
export { getAiQuotaStatus_createServerFn_handler };
