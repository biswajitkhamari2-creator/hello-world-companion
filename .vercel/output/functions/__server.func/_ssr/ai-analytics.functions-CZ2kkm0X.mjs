import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { i as getAiRequestLog } from "./ai-gateway.server-BQYhT5NC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-analytics.functions-CZ2kkm0X.js
function pct(nums, p) {
	if (!nums.length) return 0;
	const sorted = nums.slice().sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p / 100 * sorted.length)))];
}
var getAiAnalytics_createServerFn_handler = createServerRpc({
	id: "90708ca8baf538803510cebcf1e2b94c9be349f4cf1319d1e12c56744712a51d",
	name: "getAiAnalytics",
	filename: "src/lib/ai-analytics.functions.ts"
}, (opts) => getAiAnalytics.__executeServer(opts));
var getAiAnalytics = createServerFn({ method: "GET" }).inputValidator((input) => ({ windowMinutes: Math.min(1440, Math.max(5, input?.windowMinutes ?? 60)) })).handler(getAiAnalytics_createServerFn_handler, async ({ data }) => {
	const log = getAiRequestLog();
	const cutoff = Date.now() - data.windowMinutes * 6e4;
	const scoped = log.filter((r) => r.ts >= cutoff);
	const providerMap = /* @__PURE__ */ new Map();
	for (const r of scoped) {
		if (!providerMap.has(r.provider)) providerMap.set(r.provider, []);
		providerMap.get(r.provider).push(r);
	}
	const perProvider = Array.from(providerMap.entries()).map(([provider, rows]) => {
		const success = rows.filter((r) => r.ok).length;
		const durations = rows.map((r) => r.durationMs);
		return {
			provider,
			total: rows.length,
			success,
			failure: rows.length - success,
			successRate: rows.length ? success / rows.length : 0,
			avgDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
			p95DurationMs: Math.round(pct(durations, 95))
		};
	}).sort((a, b) => b.total - a.total);
	const modelMap = /* @__PURE__ */ new Map();
	for (const r of scoped) {
		const key = `${r.provider}::${r.model ?? "unknown"}`;
		if (!modelMap.has(key)) modelMap.set(key, []);
		modelMap.get(key).push(r);
	}
	const perModel = Array.from(modelMap.entries()).map(([key, rows]) => {
		const [provider, model] = key.split("::");
		const success = rows.filter((r) => r.ok).length;
		const durations = rows.map((r) => r.durationMs);
		return {
			model,
			provider,
			total: rows.length,
			success,
			failure: rows.length - success,
			avgDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
		};
	}).sort((a, b) => b.total - a.total);
	const recentFailures = scoped.filter((r) => !r.ok).slice(-20).reverse().map((r) => ({
		ts: r.ts,
		provider: r.provider,
		model: r.model,
		status: r.status,
		errorMessage: r.errorMessage
	}));
	const bucketMap = /* @__PURE__ */ new Map();
	for (const r of scoped) {
		const bucket = Math.floor(r.ts / 6e4) * 6e4;
		if (!bucketMap.has(bucket)) bucketMap.set(bucket, {
			success: 0,
			failure: 0
		});
		const b = bucketMap.get(bucket);
		if (r.ok) b.success++;
		else b.failure++;
	}
	const bucketsPerMinute = Array.from(bucketMap.entries()).sort(([a], [b]) => a - b).map(([ts, b]) => ({
		ts,
		success: b.success,
		failure: b.failure
	}));
	const totalSuccess = scoped.filter((r) => r.ok).length;
	const allDurations = scoped.map((r) => r.durationMs);
	return {
		windowMinutes: data.windowMinutes,
		totalRequests: scoped.length,
		successRate: scoped.length ? totalSuccess / scoped.length : 0,
		avgDurationMs: allDurations.length ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length) : 0,
		perProvider,
		perModel,
		recentFailures,
		bucketsPerMinute,
		note: "In-memory metrics from the current server instance. Resets on cold start / redeploy."
	};
});
//#endregion
export { getAiAnalytics_createServerFn_handler };
