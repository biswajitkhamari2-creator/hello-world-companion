import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { ct as objectType, lt as stringType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents.functions-RRwEEipk.js
var uploadDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const file = d.get("file");
	if (!(file instanceof File)) throw new Error("Missing file");
	return {
		file,
		title: d.get("title") || file.name
	};
}).handler(createSsrRpc("6a84d6c06bda3996250281bc9a5b708962e14a0bb9447d5b3830fcdc867fe8cc"));
var extractDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ documentId: stringType().uuid() }).parse(d)).handler(createSsrRpc("9f4a2e509de3a6ebee26ea537bbb93f73c055c6c3cee4bae0d19507949404074"));
var listDocuments = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("7bbe916d0c0b14b33e289192f7ab12893c0b8286759f1948b274b5c959369258"));
var getDocument = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("1697f68c362f0f7295091ed4dfd426e28abdf8975e9ae613689d562bea4cd6c8"));
var deleteDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("3aa19b2f79082c5ff1f5628e9f17c9b708bb5ffaa61831d8c1a2062fe799a8a2"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("473946ff68d52f95c94aecfb156d06f65a209403a7869810543b6c4fd0e18f66"));
var syncFromDrive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2eb8266105f7bcf21a1c57716d13a8c75753530bc6a371c50d50730320978e46"));
var createUploadSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	fileName: stringType().min(1).max(255),
	mime: stringType().min(1).max(200),
	size: numberType().int().positive().max(5 * 1024 * 1024 * 1024),
	title: stringType().min(1).max(255).optional()
}).parse(d)).handler(createSsrRpc("1c02fba283a30dffb787f202dd34588bad84f2b765c1b305c7ca891e18b78f4a"));
var finalizeUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	driveFileId: stringType().min(1).max(200).nullable().optional()
}).parse(d)).handler(createSsrRpc("bedd29c4906ffa72332e57093046b44f233aed43b342b2b28d6ffc9b02e1bb49"));
var completeUploadFinalChunk = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => {
	if (!(d instanceof FormData)) throw new Error("Expected FormData");
	const documentId = String(d.get("documentId") || "");
	const uploadUrl = String(d.get("uploadUrl") || "");
	const start = Number(d.get("start"));
	const end = Number(d.get("end"));
	const total = Number(d.get("total"));
	const chunk = d.get("chunk");
	if (!stringType().uuid().safeParse(documentId).success) throw new Error("Invalid document id");
	if (!uploadUrl.startsWith("https://www.googleapis.com/upload/drive/v3/files")) throw new Error("Invalid upload URL");
	if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(total) || start < 0 || end <= start || total < end) throw new Error("Invalid upload range");
	if (!(chunk instanceof File)) throw new Error("Missing upload chunk");
	if (chunk.size !== end - start) throw new Error("Upload chunk size mismatch");
	if (chunk.size > 4 * 1024 * 1024) throw new Error("Final upload chunk is too large");
	return {
		documentId,
		uploadUrl,
		start,
		end,
		total,
		chunk
	};
}).handler(createSsrRpc("459337d2ecbd91590ccdd61860ad886393cfec8c4fd9ceed1b81ca5a64c718a7"));
//#endregion
export { finalizeUpload as a, syncFromDrive as c, extractDocument as i, uploadDocument as l, createUploadSession as n, getDocument as o, deleteDocument as r, listDocuments as s, completeUploadFinalChunk as t };
