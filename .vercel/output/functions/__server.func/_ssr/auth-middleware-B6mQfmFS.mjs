import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as getRequest } from "./request-response-BEPp1C2k.mjs";
import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-B6mQfmFS.js
var FALLBACK_SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
var FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh";
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
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const SUPABASE_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL) || normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
	const SUPABASE_PUBLISHABLE_KEY = cleanEnvValue(process.env.SUPABASE_PUBLISHABLE_KEY) || cleanEnvValue(process.env.VITE_SUPABASE_PUBLISHABLE_KEY) || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	if (token.split(".").length !== 3) throw new Error("Unauthorized: Invalid token");
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: {
			fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
			headers: { Authorization: `Bearer ${token}` }
		},
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	return next({ context: {
		supabase,
		userId: data.claims.sub,
		claims: data.claims
	} });
});
//#endregion
export { requireSupabaseAuth as t };
