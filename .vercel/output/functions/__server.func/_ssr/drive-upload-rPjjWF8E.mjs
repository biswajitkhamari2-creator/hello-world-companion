//#region node_modules/.nitro/vite/services/ssr/assets/drive-upload-rPjjWF8E.js
var MIB = 1024 * 1024;
var DEFAULT_CHUNK = 32 * MIB;
var FINAL_SERVER_CHUNK = 4 * MIB;
var MAX_RETRIES = 8;
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function parseRangeEnd(range) {
	if (!range) return null;
	const m = /bytes=\d+-(\d+)/.exec(range);
	return m ? Number(m[1]) : null;
}
async function queryResumeOffset(uploadUrl, total, signal) {
	try {
		const res = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Range": `bytes */${total}` },
			signal
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
function isNetworkFetchError(err) {
	const message = String(err?.message || err || "");
	return err instanceof TypeError || /failed to fetch|networkerror|load failed|cors/i.test(message);
}
function getChunkSize(total, override) {
	if (override) return override;
	if (total >= 512 * MIB) return 64 * MIB;
	if (total >= 96 * MIB) return DEFAULT_CHUNK;
	return 16 * MIB;
}
async function uploadFileResumable(opts) {
	const total = opts.file.size;
	const chunkSize = getChunkSize(total, opts.chunkSize);
	let offset = 0;
	opts.onProgress?.(0, total);
	while (offset < total) {
		if (opts.signal?.aborted) throw new Error("Upload aborted");
		const remaining = total - offset;
		if (opts.uploadFinalChunk && remaining <= FINAL_SERVER_CHUNK) {
			const chunk = opts.file.slice(offset, total);
			opts.onProgress?.(Math.max(offset, total - 1), total);
			return opts.uploadFinalChunk({
				blob: chunk,
				start: offset,
				end: total,
				total
			});
		}
		const directChunkSize = opts.uploadFinalChunk ? Math.min(chunkSize, Math.max(FINAL_SERVER_CHUNK, remaining - FINAL_SERVER_CHUNK)) : chunkSize;
		const end = Math.min(offset + directChunkSize, total);
		const chunk = opts.file.slice(offset, end);
		let attempt = 0;
		if (end >= total && opts.uploadFinalChunk) {
			opts.onProgress?.(Math.max(offset, total - 1), total);
			return opts.uploadFinalChunk({
				blob: chunk,
				start: offset,
				end,
				total
			});
		}
		while (true) try {
			const res = await fetch(opts.uploadUrl, {
				method: "PUT",
				headers: { "Content-Range": `bytes ${offset}-${end - 1}/${total}` },
				body: chunk,
				signal: opts.signal
			});
			if (res.status === 200 || res.status === 201) {
				const text = await res.text();
				let meta = {};
				try {
					meta = JSON.parse(text);
				} catch {}
				opts.onProgress?.(total, total);
				if (!meta?.id) throw new Error("Drive did not return a file id");
				return { driveFileId: meta.id };
			}
			if (res.status === 308) {
				const acceptedEnd = parseRangeEnd(res.headers.get("range"));
				offset = acceptedEnd === null ? end : acceptedEnd + 1;
				opts.onProgress?.(offset, total);
				break;
			}
			if (res.status >= 500 && attempt < MAX_RETRIES) {
				await sleep(1e3 * 2 ** attempt);
				attempt++;
				continue;
			}
			const errText = await res.text().catch(() => "");
			throw new Error(`Drive upload failed (${res.status}): ${errText.slice(0, 300)}`);
		} catch (err) {
			if (opts.signal?.aborted) throw err;
			await sleep(Math.min(1e3 * 2 ** attempt, 15e3));
			attempt++;
			const resumed = await queryResumeOffset(opts.uploadUrl, total, opts.signal);
			if (resumed !== null) {
				if (resumed >= total) {
					try {
						const finalRes = await fetch(opts.uploadUrl, {
							method: "PUT",
							headers: { "Content-Range": `bytes */${total}` },
							signal: opts.signal
						});
						if (finalRes.status === 200 || finalRes.status === 201) {
							const t = await finalRes.text();
							const m = (() => {
								try {
									return JSON.parse(t);
								} catch {
									return {};
								}
							})();
							if (m?.id) {
								opts.onProgress?.(total, total);
								return { driveFileId: m.id };
							}
						}
					} catch {}
					opts.onProgress?.(total, total);
					return {
						driveFileId: null,
						completedWithoutMetadata: true
					};
				}
				offset = resumed;
				opts.onProgress?.(offset, total);
				break;
			}
			if (attempt >= MAX_RETRIES) {
				if (end >= total && isNetworkFetchError(err)) {
					opts.onProgress?.(total, total);
					return {
						driveFileId: null,
						completedWithoutMetadata: true
					};
				}
				throw err;
			}
		}
	}
	opts.onProgress?.(total, total);
	return {
		driveFileId: null,
		completedWithoutMetadata: true
	};
}
//#endregion
export { uploadFileResumable as t };
