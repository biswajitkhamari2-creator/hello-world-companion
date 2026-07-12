import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-44RWK3KY.js
var FALLBACK_SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
var FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh";
function readProcessEnv(name) {
	if (typeof process === "undefined") return void 0;
	return process.env?.[name];
}
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
	console.warn("[Supabase] Ignoring invalid VITE_SUPABASE_URL/SUPABASE_URL. Using configured fallback.");
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
function createSupabaseClient() {
	const SUPABASE_URL = normalizeSupabaseUrl("https://ffkyjnswyfeghmfmlapu.supabase.co") || normalizeSupabaseUrl(readProcessEnv("SUPABASE_URL")) || normalizeSupabaseUrl(readProcessEnv("VITE_SUPABASE_URL")) || FALLBACK_SUPABASE_URL;
	const SUPABASE_PUBLISHABLE_KEY = cleanEnvValue("sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh") || cleanEnvValue(readProcessEnv("SUPABASE_PUBLISHABLE_KEY")) || cleanEnvValue(readProcessEnv("VITE_SUPABASE_PUBLISHABLE_KEY")) || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
	return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
		auth: {
			storage: typeof window !== "undefined" ? localStorage : void 0,
			persistSession: true,
			autoRefreshToken: true
		}
	});
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
