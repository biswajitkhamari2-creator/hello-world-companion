//#region node_modules/.nitro/vite/services/ssr/assets/downloads-store-CplUgcTw.js
var DB_NAME = "upsc_downloads_v1";
var STORE = "files";
var EVENT = "upsc-downloads-updated";
function isBrowser() {
	return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}
function triggerDownloadHelper(blob, filename) {
	if (typeof window === "undefined") return;
	if (window.AndroidInterface) {
		const reader = new FileReader();
		reader.onloadend = function() {
			const base64Data = reader.result;
			window.AndroidInterface.downloadFile(base64Data, filename, blob.type);
		};
		reader.readAsDataURL(blob);
	} else {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 5e3);
	}
}
function openDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" }).createIndex("created_at", "created_at");
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function runTx(mode, fn) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const t = db.transaction(STORE, mode);
		const store = t.objectStore(STORE);
		let result;
		const req = fn(store);
		req.onsuccess = () => {
			result = req.result;
		};
		req.onerror = () => reject(req.error);
		t.oncomplete = () => resolve(result);
		t.onerror = () => reject(t.error);
		t.onabort = () => reject(t.error);
	});
}
function notify() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}
function onDownloadsUpdated(cb) {
	if (typeof window === "undefined") return () => {};
	const h = () => cb();
	window.addEventListener(EVENT, h);
	return () => window.removeEventListener(EVENT, h);
}
function inferKind(mime, name) {
	const n = name.toLowerCase();
	if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
	if (mime.startsWith("image/")) return "image";
	if (mime === "application/json" || n.endsWith(".json")) return "data";
	if (n.endsWith(".md") || n.endsWith(".txt")) return "notes";
	return "other";
}
function stripPayload(row) {
	const { blob: _blob, data: _data, ...meta } = row;
	return meta;
}
async function persistStoredDownload(record, safeBlob) {
	try {
		await runTx("readwrite", (s) => s.put(record));
	} catch (e) {
		const fallback = {
			...record,
			blob: void 0,
			data: await safeBlob.arrayBuffer()
		};
		await runTx("readwrite", (s) => s.put(fallback));
	}
}
/** Persist a Blob to the local downloads store. */
async function saveDownload(blob, filename, opts = {}) {
	if (!isBrowser()) throw new Error("saveDownload only works in the browser");
	const safeBlob = blob instanceof Blob && blob.constructor === Blob ? blob : new Blob([await blob.arrayBuffer()], { type: blob.type || "application/octet-stream" });
	const record = {
		id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
		name: filename || "download",
		mime: safeBlob.type || "application/octet-stream",
		size: safeBlob.size,
		kind: opts.kind || inferKind(safeBlob.type || "", filename || ""),
		source: opts.source,
		meta: opts.meta,
		created_at: Date.now(),
		blob: safeBlob
	};
	await persistStoredDownload(record, safeBlob);
	notify();
	return stripPayload(record);
}
async function listDownloads() {
	if (!isBrowser()) return [];
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => {
			resolve((req.result || []).map(stripPayload).sort((a, b) => b.created_at - a.created_at));
		};
		req.onerror = () => reject(req.error);
	});
}
async function getDownloadBlob(id) {
	if (!isBrowser()) return null;
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
		req.onsuccess = () => {
			const row = req.result;
			if (!row) return resolve(null);
			if (row.blob instanceof Blob) return resolve(row.blob);
			if (row.data instanceof ArrayBuffer) return resolve(new Blob([row.data], { type: row.mime || "application/octet-stream" }));
			resolve(null);
		};
		req.onerror = () => reject(req.error);
	});
}
async function updateDownloadMeta(id, metaPatch) {
	if (!isBrowser()) return;
	const db = await openDB();
	const row = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
	if (!row) return;
	row.meta = {
		...row.meta ?? {},
		...metaPatch
	};
	await runTx("readwrite", (s) => s.put(row));
	notify();
}
async function deleteDownload(id) {
	if (!isBrowser()) return;
	await runTx("readwrite", (s) => s.delete(id));
	notify();
}
async function clearDownloads() {
	if (!isBrowser()) return;
	await runTx("readwrite", (s) => s.clear());
	notify();
}
/** Trigger a browser download AND persist the file in the local store. */
async function saveAndDownload(blob, filename, opts = {}) {
	let record = null;
	try {
		record = await saveDownload(blob, filename, opts);
	} catch (e) {
		console.warn("[downloads-store] persist failed", e);
	}
	if (typeof window !== "undefined") triggerDownloadHelper(blob, filename);
	if (opts.saveToDrive !== false) saveDownloadToDrive(blob, filename, opts, record?.id).catch((e) => {
		console.warn("[downloads-store] drive save failed", e);
	});
	return record;
}
async function saveDownloadToDrive(blob, filename, opts, localId) {
	if (!isBrowser()) return;
	const fd = new FormData();
	const safeName = filename || "download";
	const safeBlob = blob instanceof Blob && blob.constructor === Blob ? blob : new Blob([await blob.arrayBuffer()], { type: blob.type || "application/octet-stream" });
	fd.set("file", safeBlob, safeName);
	fd.set("source", opts.source || "download");
	fd.set("kind", opts.kind || inferKind(safeBlob.type || "", safeName));
	const { saveGeneratedDownloadToDrive } = await import("./downloads.functions-DsESSCxw.mjs");
	const saved = await saveGeneratedDownloadToDrive({ data: fd });
	if (localId) await updateDownloadMeta(localId, {
		driveDocumentId: saved.documentId,
		driveFileId: saved.driveFileId,
		driveViewLink: saved.driveViewLink,
		driveSavedAt: Date.now()
	});
}
/** Re-download a stored item by id. */
async function redownload(id) {
	const blob = await getDownloadBlob(id);
	if (!blob) throw new Error("File not found");
	triggerDownloadHelper(blob, (await listDownloads()).find((r) => r.id === id)?.name || "download");
}
function formatSize(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
//#endregion
export { clearDownloads, deleteDownload, formatSize, getDownloadBlob, listDownloads, onDownloadsUpdated, redownload, saveAndDownload, saveDownload, updateDownloadMeta };
