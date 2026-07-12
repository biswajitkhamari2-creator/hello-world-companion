import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/downloads.functions-DsESSCxw.js
var saveGeneratedDownloadToDrive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const file = d.get("file");
	if (!(file instanceof File)) throw new Error("Missing file");
	return {
		file,
		source: String(d.get("source") || "download").slice(0, 80),
		kind: String(d.get("kind") || "other").slice(0, 40)
	};
}).handler(createSsrRpc("f73e398ba40feece16bc2cb188c398e3ee40ecabc48918f7beef5d36c394842a"));
var listDriveDownloads = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0cd892e3ac78e76d145ae4e9b363cf798a54a7459f1f4cc8fbaa150795311a57"));
var deleteDriveDownload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("4d91a1929876b7ed1a9b3e215e5d9915f00c14af9ca66c2d75648962e46c6d3f"));
//#endregion
export { deleteDriveDownload, listDriveDownloads, saveGeneratedDownloadToDrive };
