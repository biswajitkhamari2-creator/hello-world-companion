// Client-side resumable upload helper for Google Drive.
// The browser PUTs file chunks directly to Google's resumable session URL,
// so request-body limits on Vercel/Cloudflare do not apply. Supports
// progress reporting and automatic resume on transient network errors.

export interface ResumableUploadOptions {
  file: File;
  uploadUrl: string;
  chunkSize?: number; // bytes; default 8 MiB
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

const DEFAULT_CHUNK = 8 * 1024 * 1024;
const MAX_RETRIES = 6;

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

export async function uploadFileResumable(
  opts: ResumableUploadOptions,
): Promise<{ driveFileId: string }> {
  const total = opts.file.size;
  const chunkSize = opts.chunkSize ?? DEFAULT_CHUNK;
  let offset = 0;

  opts.onProgress?.(0, total);

  while (offset < total) {
    if (opts.signal?.aborted) throw new Error("Upload aborted");
    const end = Math.min(offset + chunkSize, total);
    const chunk = opts.file.slice(offset, end);
    let attempt = 0;

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
          const meta = (await res.json()) as { id: string };
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

        const text = await res.text().catch(() => "");
        throw new Error(`Drive upload failed (${res.status}): ${text.slice(0, 300)}`);
      } catch (err) {
        if (opts.signal?.aborted) throw err;
        if (attempt >= MAX_RETRIES) {
          // Last-ditch: query the server for the true offset and resume.
          const resumed = await queryResumeOffset(opts.uploadUrl, total, opts.signal);
          if (resumed === null) throw err;
          offset = resumed;
          opts.onProgress?.(offset, total);
          break;
        }
        await sleep(1000 * 2 ** attempt);
        attempt++;
      }
    }
  }

  // Loop exited without a final 200/201 — defensive.
  throw new Error("Upload completed without a final response from Drive");
}