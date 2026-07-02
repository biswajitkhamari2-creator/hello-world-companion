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
  blob: Blob;
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
  await runTx("readwrite", (s) => s.put(record));
  notify();
  const { blob: _b, ...meta } = record;
  return meta;
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
          .map(({ blob: _b, ...m }) => m)
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
    req.onsuccess = () => resolve(((req.result as StoredDownload | undefined)?.blob) ?? null);
    req.onerror = () => reject(req.error);
  });
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
  return record;
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
