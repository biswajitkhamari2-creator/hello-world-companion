import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-70dgAIAg.js
var FALLBACK_SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function cleanEnvValue(value) {
	if (!value) return void 0;
	let cleaned = value.trim().replace(/^['"]|['"]$/g, "");
	const assignment = cleaned.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
	if (assignment?.[1]) cleaned = assignment[1].trim().replace(/^['"]|['"]$/g, "");
	return cleaned || void 0;
}
function normalizeSupabaseUrl(value) {
	const cleaned = cleanEnvValue(value);
	if (!cleaned) return void 0;
	const candidates = [cleaned];
	if (/^[a-z0-9-]{15,}\.supabase\.co$/i.test(cleaned)) candidates.push(`https://${cleaned}`);
	if (/^[a-z0-9-]{15,}$/i.test(cleaned)) candidates.push(`https://${cleaned}.supabase.co`);
	for (const candidate of candidates) try {
		const url = new URL(candidate);
		if ((url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes("supabase.co")) return url.origin;
	} catch {}
	console.warn("[Supabase] Ignoring invalid SUPABASE_URL/VITE_SUPABASE_URL. Using configured fallback.");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseAdminClient() {
	const SUPABASE_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL) || normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
	const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanEnvValue(process.env.APP_SUPABASE_SERVICE_ROLE_KEY) || cleanEnvValue(process.env.SUPABASE_SECRET_KEY) || cleanEnvValue(process.env.APP_SUPABASE_SECRET_KEY);
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []].join(", ")}. Add the personal Supabase secret key (sb_secret_...) as SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY).`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY) },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
var _supabaseAdmin;
var supabaseAdmin = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
	return Reflect.get(_supabaseAdmin, prop, receiver);
} });
//#endregion
export { supabaseAdmin };
