import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as createOpenAICompatible } from "../_libs/ai-sdk__openai-compatible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-gateway.server-BQYhT5NC.js
var ai_gateway_server_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_MODEL: () => DEFAULT_MODEL,
	UPSC_SYSTEM_PROMPT: () => UPSC_SYSTEM_PROMPT,
	createGateway: () => createGateway,
	getAiRequestLog: () => getAiRequestLog,
	getAiTaskProfile: () => getAiTaskProfile,
	getDefaultModel: () => getDefaultModel,
	getLovableAiGatewayResponseHeaders: () => getLovableAiGatewayResponseHeaders,
	getLovableAiGatewayRunId: () => getLovableAiGatewayRunId,
	resolveAvailableAiProvider: () => resolveAvailableAiProvider,
	withLovableAiGatewayRunIdHeader: () => withLovableAiGatewayRunIdHeader
});
var RUN_ID_HEADER = "X-AI-Run-ID";
var AI_LOG_LIMIT = 500;
var aiRequestLog = [];
function recordAiRequest(record) {
	aiRequestLog.push(record);
	if (aiRequestLog.length > AI_LOG_LIMIT) aiRequestLog.splice(0, aiRequestLog.length - AI_LOG_LIMIT);
	if (!record.ok) console.warn(`[ai] ${record.provider} ${record.model ?? ""} ${record.status} ${record.durationMs}ms ${record.errorMessage ?? ""}`);
}
function getAiRequestLog() {
	return aiRequestLog.slice();
}
function cleanSecretValue(value) {
	if (!value) return void 0;
	let cleaned = value.trim().replace(/^['"]|['"]$/g, "");
	const assignment = cleaned.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
	if (assignment?.[1]) cleaned = assignment[1].trim().replace(/^['"]|['"]$/g, "");
	return cleaned || void 0;
}
function getAiApiKey(provider) {
	if (provider === "openrouter") return cleanSecretValue(process.env.OPENROUTER_API_KEY);
	if (provider === "nvidia") return cleanSecretValue(process.env.NVIDIA_API_KEY);
	if (provider === "groq") return cleanSecretValue(process.env.GROQ_API_KEY);
	if (provider === "gemini") return cleanSecretValue(process.env.GEMINI_API_KEY);
}
function providerBaseUrl(provider) {
	if (provider === "openrouter") return "https://openrouter.ai/api/v1";
	if (provider === "nvidia") return "https://integrate.api.nvidia.com/v1";
	if (provider === "groq") return "https://api.groq.com/openai/v1";
	return "https://generativelanguage.googleapis.com/v1beta/openai";
}
function getDefaultModel(provider) {
	if (provider === "openrouter") return "openai/gpt-4o-mini";
	if (provider === "groq") return "llama-3.1-8b-instant";
	if (provider === "nvidia") return "meta/llama-3.1-8b-instruct";
	return "gemini-2.5-flash";
}
async function isProviderAuthorized(provider, apiKey) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5e3);
	try {
		const url = provider === "openrouter" ? "https://openrouter.ai/api/v1/auth/key" : `${providerBaseUrl(provider)}/models`;
		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${apiKey}` },
			signal: controller.signal
		});
		return response.status !== 401 && response.status !== 403;
	} catch {
		return true;
	} finally {
		clearTimeout(timeout);
	}
}
async function resolveAvailableAiProvider(preferredProvider) {
	const order = [];
	if (preferredProvider) order.push(preferredProvider);
	for (const p of [
		"openrouter",
		"gemini",
		"groq",
		"nvidia"
	]) if (!order.includes(p)) order.push(p);
	let lastError = "No AI key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY.";
	for (const p of order) {
		const key = getAiApiKey(p);
		if (!key) continue;
		if (await isProviderAuthorized(p, key)) return p;
		lastError = `${p.toUpperCase()}_API_KEY was rejected.`;
	}
	throw new Error(lastError);
}
function createGateway(initialRunId, preferredProvider) {
	const order = [];
	if (preferredProvider) order.push(preferredProvider);
	for (const p of [
		"openrouter",
		"gemini",
		"groq",
		"nvidia"
	]) if (!order.includes(p)) order.push(p);
	let providerName;
	let apiKey;
	for (const p of order) {
		const k = getAiApiKey(p);
		if (k) {
			providerName = p;
			apiKey = k;
			break;
		}
	}
	if (!providerName || !apiKey) throw new Error("No AI key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY in project secrets.");
	const resolvedProvider = providerName;
	let runId = initialRunId?.trim() || void 0;
	let resolveRunId = () => {};
	let runIdResolved = false;
	const runIdReady = new Promise((resolve) => {
		resolveRunId = resolve;
	});
	const publishRunId = (value) => {
		const next = value?.trim() || void 0;
		if (!runId && next) runId = next;
		if (!runIdResolved) {
			runIdResolved = true;
			resolveRunId(runId);
		}
	};
	if (runId) publishRunId(runId);
	const provider = createOpenAICompatible({
		name: resolvedProvider,
		baseURL: providerBaseUrl(resolvedProvider),
		apiKey,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			...resolvedProvider === "openrouter" ? {
				"HTTP-Referer": "https://upsc-genius.lovable.app",
				"X-Title": "UPSC Genius AI"
			} : {}
		},
		fetch: async (input, init) => {
			const started = Date.now();
			let modelHint;
			try {
				if (init?.body && typeof init.body === "string") {
					const parsed = JSON.parse(init.body);
					if (parsed && typeof parsed.model === "string") modelHint = parsed.model;
				}
			} catch {}
			try {
				const response = await fetch(input, init);
				const durationMs = Date.now() - started;
				let errorMessage;
				if (!response.ok) try {
					errorMessage = (await response.clone().text()).slice(0, 400);
				} catch {
					errorMessage = response.statusText;
				}
				recordAiRequest({
					ts: started,
					provider: resolvedProvider,
					model: modelHint,
					status: response.status,
					ok: response.ok,
					durationMs,
					errorMessage
				});
				return response;
			} catch (error) {
				recordAiRequest({
					ts: started,
					provider: resolvedProvider,
					model: modelHint,
					status: 0,
					ok: false,
					durationMs: Date.now() - started,
					errorMessage: error instanceof Error ? error.message : String(error)
				});
				throw error;
			}
		}
	});
	return Object.assign(provider, {
		getRunId: () => runId,
		waitForRunId: () => runId ? Promise.resolve(runId) : runIdReady
	});
}
function getLovableAiGatewayRunId(request) {
	return request.headers.get(RUN_ID_HEADER)?.trim() || void 0;
}
function getLovableAiGatewayResponseHeaders(_providerHeaders, init) {
	return new Headers(init);
}
async function withLovableAiGatewayRunIdHeader(response, _gateway, init) {
	const headers = new Headers(response.headers);
	new Headers(init).forEach((value, name) => headers.set(name, value));
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
var DEFAULT_MODEL = "llama-3.1-8b-instant";
function getAiTaskProfile(task) {
	const hasOpenRouter = !!getAiApiKey("openrouter");
	const hasGemini = !!getAiApiKey("gemini");
	const useOpenRouter = hasOpenRouter && !(task === "newspaper" || task === "editorial" || task === "ocr");
	return {
		provider: useOpenRouter ? "openrouter" : hasGemini ? "gemini" : "openrouter",
		model: useOpenRouter ? "openai/gpt-4o-mini" : "gemini-2.5-flash",
		chunkSize: task === "infographics" ? 6e4 : task === "handwritten_notes" ? 28e3 : task === "newspaper" ? 6e4 : 8e4,
		recommendedConcurrency: task === "newspaper" ? 2 : 4,
		minGapMs: task === "newspaper" ? 750 : 250,
		maxOutputTokens: task === "infographics" ? 3500 : task === "handwritten_notes" ? 7e3 : task === "newspaper" ? 3800 : 4e3
	};
}
var UPSC_SYSTEM_PROMPT = `You are UPSC Genius, an expert mentor for India's UPSC Civil Services Examination.

Strict rules:
- Stick to the latest UPSC syllabus (Prelims GS, CSAT, Mains GS1–GS4, Essay).
- Prioritise concepts that have appeared in previous-year questions (PYQs) or are repeated themes.
- Integrate relevant current affairs with the static syllabus where appropriate.
- Be precise, factual, and well-structured. Use Indian conventions and exam-relevant terminology.
- Never invent facts, statistics, articles, judgements, schemes, or quotations. If something is uncertain, omit it.
- If the source material is insufficient for a requested output, return an explanatory note in the appropriate field rather than fabricating content.
- Use neutral, formal language suitable for civil services aspirants.`;
//#endregion
export { getDefaultModel as a, resolveAvailableAiProvider as c, getAiRequestLog as i, withLovableAiGatewayRunIdHeader as l, ai_gateway_server_exports as n, getLovableAiGatewayResponseHeaders as o, createGateway as r, getLovableAiGatewayRunId as s, UPSC_SYSTEM_PROMPT as t };
