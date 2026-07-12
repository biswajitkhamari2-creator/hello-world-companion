import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odisha-news.functions-CDzyM680.js
var getOdishaNews = createServerFn({ method: "GET" }).handler(createSsrRpc("af21a84db81c25cdd63f03c12409cd34e677557546d046036a663dbb20ae1158"));
var extractPcsPoints = createServerFn({ method: "POST" }).inputValidator((d) => {
	const o = d;
	if (!o?.url) throw new Error("Missing url");
	return {
		url: o.url,
		title: o.title || ""
	};
}).handler(createSsrRpc("866d6b0cba3f7eb0bae89ec01e03dec15eb896691edb17a751bea6f05a106c95"));
//#endregion
export { getOdishaNews as n, extractPcsPoints as t };
