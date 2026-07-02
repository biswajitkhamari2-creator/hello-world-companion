// Persistent local downloads store (IndexedDB). Keeps every file the app
// generates/downloads until the user deletes it explicitly.

export type DownloadKind =
  | "pdf"
  | "notes"
  | "editorial"
  | "report"
  | "data"
  | "image"
  | "other";

export interface StoredDownloadRecord {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: DownloadKind;
  source?: string; // e.g. "editorial-lab", "final-checker", "pdf-export"
  meta?: Record<string, unknown>;
  created_at: number;
}

export interface StoredDownload extends StoredDownloadRecord {
  blob?: Blob;
  data?: ArrayBuffer;
}

const DB_NAME = "upsc_downloads_v1";
const STORE = "files";
const EVENT = "upsc-downloads-updated";

function isBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("created_at", "created_at");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function runTx<T = unknown>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result: T;
    const req = fn(store);
    req.onsuccess = () => {
      result = req.result as T;
    };
    req.onerror = () => reject(req.error);
    t.oncomplete = () => resolve(result as T);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function onDownloadsUpdated(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

function inferKind(mime: string, name: string): DownloadKind {
  const n = name.toLowerCase();
  if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/json" || n.endsWith(".json")) return "data";
  if (n.endsWith(".md") || n.endsWith(".txt")) return "notes";
  return "other";
}

export interface SaveDownloadOptions {
  kind?: DownloadKind;
  source?: string;
  meta?: Record<string, unknown>;
  saveToDrive?: boolean;
}

function stripPayload(row: StoredDownload): StoredDownloadRecord {
  const { blob: _blob, data: _data, ...meta } = row;
  return meta;
}

async function persistStoredDownload(record: StoredDownload, safeBlob: Blob) {
  try {
    await runTx("readwrite", (s) => s.put(record));
  } catch (e) {
    // Some browser/IDB combinations still reject Blob structured cloning.
    // Retry with raw bytes so the Downloads page can always restore the file.
    const fallback: StoredDownload = {
      ...record,
      blob: undefined,
      data: await safeBlob.arrayBuffer(),
    };
    await runTx("readwrite", (s) => s.put(fallback));
  }
}

/** Persist a Blob to the local downloads store. */
export async function saveDownload(blob: Blob, filename: string, opts: SaveDownloadOptions = {}): Promise<StoredDownloadRecord> {
  if (!isBrowser()) throw new Error("saveDownload only works in the browser");
  // Some Blob subclasses (e.g. streams) don't structured-clone cleanly.
  // Normalise to a plain Blob so IndexedDB always accepts it.
  const safeBlob =
    blob instanceof Blob && blob.constructor === Blob
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: blob.type || "application/octet-stream" });
  const record: StoredDownload = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: filename || "download",
    mime: safeBlob.type || "application/octet-stream",
    size: safeBlob.size,
    kind: opts.kind || inferKind(safeBlob.type || "", filename || ""),
    source: opts.source,
    meta: opts.meta,
    created_at: Date.now(),
    blob: safeBlob,
  };
  await persistStoredDownload(record, safeBlob);
  notify();
  return stripPayload(record);
}

export async function listDownloads(): Promise<StoredDownloadRecord[]> {
  if (!isBrowser()) return [];
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as StoredDownload[]) || [];
      resolve(
        rows
          .map(stripPayload)
          .sort((a, b) => b.created_at - a.created_at),
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getDownloadBlob(id: string): Promise<Blob | null> {
  if (!isBrowser()) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result as StoredDownload | undefined;
      if (!row) return resolve(null);
      if (row.blob instanceof Blob) return resolve(row.blob);
      if (row.data instanceof ArrayBuffer) {
        return resolve(new Blob([row.data], { type: row.mime || "application/octet-stream" }));
      }
      resolve(null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateDownloadMeta(id: string, metaPatch: Record<string, unknown>): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDB();
  const row = await new Promise<StoredDownload | undefined>((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredDownload | undefined);
    req.onerror = () => reject(req.error);
  });
  if (!row) return;
  row.meta = { ...(row.meta ?? {}), ...metaPatch };
  await runTx("readwrite", (s) => s.put(row));
  notify();
}

export async function deleteDownload(id: string): Promise<void> {
  if (!isBrowser()) return;
  await runTx("readwrite", (s) => s.delete(id));
  notify();
}

export async function clearDownloads(): Promise<void> {
  if (!isBrowser()) return;
  await runTx("readwrite", (s) => s.clear());
  notify();
}

/** Trigger a browser download AND persist the file in the local store. */
export async function saveAndDownload(blob: Blob, filename: string, opts: SaveDownloadOptions = {}): Promise<StoredDownloadRecord | null> {
  // Persist first so a failed browser download still keeps the file.
  let record: StoredDownloadRecord | null = null;
  try {
    record = await saveDownload(blob, filename, opts);
  } catch (e) {
    console.warn("[downloads-store] persist failed", e);
  }
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  if (opts.saveToDrive !== false) {
    void saveDownloadToDrive(blob, filename, opts, record?.id).catch((e) => {
      console.warn("[downloads-store] drive save failed", e);
    });
  }
  return record;
}

async function saveDownloadToDrive(blob: Blob, filename: string, opts: SaveDownloadOptions, localId?: string) {
  if (!isBrowser()) return;
  const fd = new FormData();
  const safeName = filename || "download";
  const safeBlob =
    blob instanceof Blob && blob.constructor === Blob
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: blob.type || "application/octet-stream" });
  fd.set("file", safeBlob, safeName);
  fd.set("source", opts.source || "download");
  fd.set("kind", opts.kind || inferKind(safeBlob.type || "", safeName));
  const { saveGeneratedDownloadToDrive } = await import("@/lib/downloads.functions");
  const saved = await saveGeneratedDownloadToDrive({ data: fd } as any);
  if (localId) {
    await updateDownloadMeta(localId, {
      driveDocumentId: saved.documentId,
      driveFileId: saved.driveFileId,
      driveViewLink: saved.driveViewLink,
      driveSavedAt: Date.now(),
    });
  }
}

/** Re-download a stored item by id. */
export async function redownload(id: string): Promise<void> {
  const blob = await getDownloadBlob(id);
  if (!blob) throw new Error("File not found");
  const rec = (await listDownloads()).find((r) => r.id === id);
  const name = rec?.name || "download";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
