// Client-side resumable upload helper for Google Drive.
// The browser PUTs file chunks directly to Google's resumable session URL,
// so request-body limits on Vercel/Cloudflare do not apply. Supports
// progress reporting and automatic resume on transient network errors.

export interface ResumableUploadOptions {
  file: File;
  uploadUrl: string;
  chunkSize?: number; // bytes; optional override
  onProgress?: (loaded: number, total: number) => void;
  uploadFinalChunk?: (chunk: {
    blob: Blob;
    start: number;
    end: number;
    total: number;
  }) => Promise<ResumableUploadResult>;
  signal?: AbortSignal;
}

export interface ResumableUploadResult {
  driveFileId: string | null;
  completedWithoutMetadata?: boolean;
}

// Larger direct-to-Drive chunks mean far fewer sequential HTTP round trips.
// The last chunk is still capped because it is sent through our server to avoid
// Google's flaky final browser/CORS response.
const MIB = 1024 * 1024;
const DEFAULT_CHUNK = 32 * MIB;
const FINAL_SERVER_CHUNK = 4 * MIB;
const MAX_RETRIES = 8;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseRangeEnd(range: string | null): number | null {
  if (!range) return null;
  // Google returns: "bytes=0-12345"
  const m = /bytes=\d+-(\d+)/.exec(range);
  return m ? Number(m[1]) : null;
}

async function queryResumeOffset(uploadUrl: string, total: number, signal?: AbortSignal): Promise<number | null> {
  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Range": `bytes */${total}` },
      signal,
    });
    if (res.status === 308) {
      const end = parseRangeEnd(res.headers.get("range"));
      return end === null ? 0 : end + 1;
    }
    if (res.status === 200 || res.status === 201) return total;
    return null;
  } catch {
    return null;
  }
}

function isNetworkFetchError(err: unknown): boolean {
  const message = String((err as any)?.message || err || "");
  return err instanceof TypeError || /failed to fetch|networkerror|load failed|cors/i.test(message);
}

function getChunkSize(total: number, override?: number): number {
  if (override) return override;
  if (total >= 512 * MIB) return 64 * MIB;
  if (total >= 96 * MIB) return DEFAULT_CHUNK;
  return 16 * MIB;
}

export async function uploadFileResumable(
  opts: ResumableUploadOptions,
): Promise<ResumableUploadResult> {
  const total = opts.file.size;
  const chunkSize = getChunkSize(total, opts.chunkSize);
  let offset = 0;

  opts.onProgress?.(0, total);

  while (offset < total) {
    if (opts.signal?.aborted) throw new Error("Upload aborted");
    const remaining = total - offset;

    // If finalization goes through the server, reserve a <=4 MiB final chunk.
    // This keeps large regular chunks fast without tripping server body limits.
    if (opts.uploadFinalChunk && remaining <= FINAL_SERVER_CHUNK) {
      const chunk = opts.file.slice(offset, total);
      opts.onProgress?.(Math.max(offset, total - 1), total);
      return opts.uploadFinalChunk({ blob: chunk, start: offset, end: total, total });
    }

    const directChunkSize = opts.uploadFinalChunk
      ? Math.min(chunkSize, Math.max(FINAL_SERVER_CHUNK, remaining - FINAL_SERVER_CHUNK))
      : chunkSize;
    const end = Math.min(offset + directChunkSize, total);
    const chunk = opts.file.slice(offset, end);
    let attempt = 0;

    // Google Drive's final resumable-upload response is the flaky part in
    // browsers. It can complete the upload but leave fetch hanging/rejected
    // because the final metadata response is not readable by CORS. Send only
    // the small final chunk through our authenticated server function instead.
    if (end >= total && opts.uploadFinalChunk) {
      opts.onProgress?.(Math.max(offset, total - 1), total);
      return opts.uploadFinalChunk({ blob: chunk, start: offset, end, total });
    }

    // Per-chunk retry loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const res = await fetch(opts.uploadUrl, {
          method: "PUT",
          headers: { "Content-Range": `bytes ${offset}-${end - 1}/${total}` },
          body: chunk,
          signal: opts.signal,
        });

        if (res.status === 200 || res.status === 201) {
          // Final chunk accepted; body contains the file metadata JSON.
          const text = await res.text();
          let meta: { id?: string } = {};
          try { meta = JSON.parse(text) as { id?: string }; } catch {}
          opts.onProgress?.(total, total);
          if (!meta?.id) throw new Error("Drive did not return a file id");
          return { driveFileId: meta.id };
        }

        if (res.status === 308) {
          // Partial accepted; advance offset based on Range header.
          const acceptedEnd = parseRangeEnd(res.headers.get("range"));
          offset = acceptedEnd === null ? end : acceptedEnd + 1;
          opts.onProgress?.(offset, total);
          break; // continue outer loop with new offset
        }

        if (res.status >= 500 && attempt < MAX_RETRIES) {
          await sleep(1000 * 2 ** attempt);
          attempt++;
          continue;
        }

        const errText = await res.text().catch(() => "");
        throw new Error(`Drive upload failed (${res.status}): ${errText.slice(0, 300)}`);
      } catch (err) {
        if (opts.signal?.aborted) throw err;
        // Network-level error (TypeError: Failed to fetch). Wait, ask Google
        // how many bytes it actually received, then resume from there.
        await sleep(Math.min(1000 * 2 ** attempt, 15000));
        attempt++;
        const resumed = await queryResumeOffset(opts.uploadUrl, total, opts.signal);
        if (resumed !== null) {
          if (resumed >= total) {
            // Server already has the whole file but we didn't get the meta JSON.
            // Re-PUT a zero-length finalize to fetch metadata. Some Google Drive
            // resumable sessions complete the final chunk but the browser cannot
            // read the final response because the response lacks usable CORS
            // headers; in that case the server can recover the file by metadata.
            try {
              const finalRes = await fetch(opts.uploadUrl, {
                method: "PUT",
                headers: { "Content-Range": `bytes */${total}` },
                signal: opts.signal,
              });
              if (finalRes.status === 200 || finalRes.status === 201) {
                const t = await finalRes.text();
                const m = (() => { try { return JSON.parse(t) as { id?: string }; } catch { return {}; } })();
                if (m?.id) {
                  opts.onProgress?.(total, total);
                  return { driveFileId: m.id };
                }
              }
            } catch {}
            opts.onProgress?.(total, total);
            return { driveFileId: null, completedWithoutMetadata: true };
          }
          offset = resumed;
          opts.onProgress?.(offset, total);
          break;
        }
        if (attempt >= MAX_RETRIES) {
          if (end >= total && isNetworkFetchError(err)) {
            opts.onProgress?.(total, total);
            return { driveFileId: null, completedWithoutMetadata: true };
          }
          throw err;
        }
      }
    }
  }

  // Loop exited because Drive reported all bytes are present, but the browser
  // did not receive readable final metadata. Let the server locate the uploaded
  // file by document id / filename / size and finish the database row.
  opts.onProgress?.(total, total);
  return { driveFileId: null, completedWithoutMetadata: true };
}