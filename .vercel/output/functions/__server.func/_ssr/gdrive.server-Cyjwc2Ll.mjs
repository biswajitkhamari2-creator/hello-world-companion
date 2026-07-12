//#region node_modules/.nitro/vite/services/ssr/assets/gdrive.server-Cyjwc2Ll.js
var DRIVE_API = "https://www.googleapis.com/drive/v3";
var DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
var OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
var DRIVE_GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
var APP_FOLDER_NAME = "UPSC-Genius-AI";
var tokenCache = null;
function cleanEnvValue(value) {
	const cleaned = (value ?? "").trim();
	if (cleaned.startsWith("\"") && cleaned.endsWith("\"") || cleaned.startsWith("'") && cleaned.endsWith("'")) return cleaned.slice(1, -1).trim();
	return cleaned;
}
function getGoogleEnv(name) {
	const aliases = {
		clientId: ["GOOGLE_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_ID"],
		clientSecret: ["GOOGLE_CLIENT_SECRET", "GOOGLE_OAUTH_CLIENT_SECRET"],
		refreshToken: [
			"GOOGLE_REFRESH_TOKEN",
			"GOOGLE_OAUTH_REFRESH_TOKEN",
			"GOOGLE_DRIVE_REFRESH_TOKEN"
		]
	}[name];
	for (const key of aliases) {
		const value = cleanEnvValue(process.env[key]);
		if (value) return value;
	}
	return "";
}
function getConnectorEnv(name) {
	const aliases = {
		lovable: ["LOVABLE_API_KEY"],
		drive: ["GOOGLE_DRIVE_API_KEY", "GOOGLE_API_KEY"]
	}[name];
	for (const key of aliases) {
		const value = cleanEnvValue(process.env[key]);
		if (value) return value;
	}
	return "";
}
function hasDirectGoogleOAuth() {
	return Boolean(getGoogleEnv("clientId") && getGoogleEnv("clientSecret") && getGoogleEnv("refreshToken"));
}
function toDriveGatewayUrl(url) {
	const parsed = new URL(url);
	if (parsed.hostname !== "www.googleapis.com") return url;
	return `${DRIVE_GATEWAY}${parsed.pathname}${parsed.search}`;
}
async function getAccessToken() {
	const now = Date.now();
	if (tokenCache && tokenCache.expiresAt - 6e4 > now) return tokenCache.token;
	const clientId = getGoogleEnv("clientId");
	const clientSecret = getGoogleEnv("clientSecret");
	const refreshToken = getGoogleEnv("refreshToken");
	if (!clientId || !clientSecret || !refreshToken) {
		const missing = [
			!clientId ? "GOOGLE_CLIENT_ID" : "",
			!clientSecret ? "GOOGLE_CLIENT_SECRET" : "",
			!refreshToken ? "GOOGLE_REFRESH_TOKEN" : ""
		].filter(Boolean);
		throw new Error(`Google Drive is not configured. Missing: ${missing.join(", ")}. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in Vercel. Visit /api/oauth/google/start on your deployed site to mint a refresh token.`);
	}
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: "refresh_token"
	});
	const res = await fetch(OAUTH_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body
	});
	if (!res.ok) {
		const t = await res.text().catch(() => "");
		if (res.status === 400 || res.status === 401) throw new Error(`Google OAuth refresh failed (${res.status}). Your GOOGLE_CLIENT_SECRET or GOOGLE_REFRESH_TOKEN is invalid/mismatched for GOOGLE_CLIENT_ID. Re-copy the OAuth client secret from Google Cloud and mint a fresh refresh token. Details: ${t.slice(0, 300)}`);
		throw new Error(`Google OAuth refresh failed (${res.status}): ${t.slice(0, 400)}`);
	}
	const data = await res.json();
	tokenCache = {
		token: data.access_token,
		expiresAt: now + data.expires_in * 1e3
	};
	return tokenCache.token;
}
async function throwDriveError(action, res) {
	const safeBody = (await res.text()).slice(0, 800);
	if (res.status === 401 || res.status === 403) {
		tokenCache = null;
		throw new Error(`Google Drive auth failed during ${action} (${res.status}): ${safeBody}`);
	}
	if (res.status === 404 && action === "download") throw new Error("This file is no longer accessible in Google Drive. With the 'drive.file' scope, the app only sees files it created itself — files uploaded under a previous credential are invisible. Re-upload the document.");
	throw new Error(`Google Drive ${action} failed (${res.status}): ${safeBody}`);
}
async function gw(url, init = {}) {
	if (!hasDirectGoogleOAuth()) {
		const lovableApiKey = getConnectorEnv("lovable");
		const driveApiKey = getConnectorEnv("drive");
		if (!lovableApiKey || !driveApiKey) throw new Error("Google Drive is not configured. Link the Google Drive connector in Lovable, or set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in Vercel.");
		return fetch(toDriveGatewayUrl(url), {
			...init,
			headers: {
				Authorization: `Bearer ${lovableApiKey}`,
				"X-Connection-Api-Key": driveApiKey,
				...init.headers
			}
		});
	}
	const token = await getAccessToken();
	return fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			...init.headers
		}
	});
}
async function ensureFolder(name, parentId) {
	const qParent = parentId ? ` and '${parentId}' in parents` : "";
	const find = await gw(`${DRIVE_API}/files?q=${encodeURIComponent(`name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${qParent}`)}&fields=files(id,name)&pageSize=1`);
	if (!find.ok) await throwDriveError("folder lookup", find);
	const body = await find.json();
	if (body.files && body.files.length > 0) return body.files[0].id;
	const meta = {
		name,
		mimeType: "application/vnd.google-apps.folder"
	};
	if (parentId) meta.parents = [parentId];
	const create = await gw(`${DRIVE_API}/files?fields=id`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(meta)
	});
	if (!create.ok) await throwDriveError("folder create", create);
	return (await create.json()).id;
}
async function getUserFolderId(userId) {
	return ensureFolder(userId, cleanEnvValue(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) || await ensureFolder(APP_FOLDER_NAME));
}
async function uploadBufferToDrive(opts) {
	const userFolderId = await getUserFolderId(opts.userId);
	const parentId = opts.folderName ? await ensureFolder(opts.folderName.slice(0, 80), userFolderId) : userFolderId;
	const metadata = {
		name: opts.fileName,
		parents: [parentId],
		mimeType: opts.mime || "application/octet-stream"
	};
	const boundary = `----lovable${crypto.randomUUID().replace(/-/g, "")}`;
	const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`;
	const post = `\r\n--${boundary}--\r\n`;
	const bytes = opts.data instanceof Uint8Array ? opts.data : new Uint8Array(opts.data);
	const preBytes = new TextEncoder().encode(pre);
	const postBytes = new TextEncoder().encode(post);
	const body = new Uint8Array(preBytes.length + bytes.length + postBytes.length);
	body.set(preBytes, 0);
	body.set(bytes, preBytes.length);
	body.set(postBytes, preBytes.length + bytes.length);
	const res = await gw(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,webViewLink,size,mimeType`, {
		method: "POST",
		headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
		body
	});
	if (!res.ok) await throwDriveError("upload", res);
	const out = await res.json();
	return {
		fileId: out.id,
		webViewLink: out.webViewLink ?? null,
		size: Number(out.size ?? bytes.length),
		mimeType: out.mimeType ?? metadata.mimeType
	};
}
async function downloadDriveFile(fileId) {
	const res = await gw(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`);
	if (!res.ok) await throwDriveError("download", res);
	const mime = res.headers.get("content-type") || "application/octet-stream";
	return {
		buffer: await res.arrayBuffer(),
		mime
	};
}
async function deleteDriveFile(fileId) {
	const res = await gw(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
	if (!res.ok && res.status !== 404) await throwDriveError("delete", res);
}
async function getDriveStorageQuota() {
	const res = await gw(`${DRIVE_API}/about?fields=storageQuota`);
	if (!res.ok) await throwDriveError("quota check", res);
	const q = (await res.json()).storageQuota ?? {};
	return {
		limit: q.limit ? Number(q.limit) : null,
		usage: Number(q.usage ?? 0),
		usageInDrive: Number(q.usageInDrive ?? 0)
	};
}
async function createResumableUploadSession(opts) {
	const parentId = await getUserFolderId(opts.userId);
	const metadata = {
		name: opts.fileName,
		parents: [parentId],
		mimeType: opts.mime || "application/octet-stream"
	};
	const res = await gw(`${DRIVE_UPLOAD}/files?uploadType=resumable`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
			"X-Upload-Content-Type": metadata.mimeType,
			"X-Upload-Content-Length": String(opts.size)
		},
		body: JSON.stringify(metadata)
	});
	if (!res.ok && res.status !== 200) await throwDriveError("resumable session init", res);
	const uploadUrl = res.headers.get("location") || res.headers.get("Location") || res.headers.get("x-goog-upload-url");
	if (!uploadUrl) throw new Error("Drive did not return a resumable upload URL (Location header missing).");
	return { uploadUrl };
}
async function getDriveFileMetadata(fileId) {
	const res = await gw(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,size,mimeType,webViewLink`);
	if (!res.ok) await throwDriveError("metadata", res);
	const body = await res.json();
	return {
		id: body.id,
		name: body.name,
		size: Number(body.size ?? 0),
		mimeType: body.mimeType ?? "application/octet-stream",
		webViewLink: body.webViewLink ?? null
	};
}
async function findLatestDriveFileByUpload(opts) {
	const parentId = await getUserFolderId(opts.userId);
	const escapedName = opts.fileName.replace(/'/g, "\\'");
	const res = await gw(`${DRIVE_API}/files?q=${encodeURIComponent(`'${parentId}' in parents and name='${escapedName}' and trashed=false`)}&fields=${encodeURIComponent("files(id,name,size,mimeType,webViewLink,createdTime,modifiedTime)")}&pageSize=10&orderBy=createdTime desc`);
	if (!res.ok) await throwDriveError("metadata recovery", res);
	const exact = ((await res.json()).files ?? []).find((f) => Number(f.size ?? 0) === opts.size);
	if (!exact) return null;
	return {
		id: exact.id,
		name: exact.name,
		size: Number(exact.size ?? 0),
		mimeType: exact.mimeType ?? opts.mime ?? "application/octet-stream",
		webViewLink: exact.webViewLink ?? null
	};
}
async function uploadFinalResumableChunk(opts) {
	const url = new URL(opts.uploadUrl);
	if (url.protocol !== "https:" || url.hostname !== "www.googleapis.com" || !url.pathname.startsWith("/upload/drive/v3/files")) throw new Error("Invalid Drive upload session URL.");
	const bytes = opts.chunk instanceof Uint8Array ? opts.chunk : new Uint8Array(opts.chunk);
	const requestBody = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(requestBody).set(bytes);
	const useDirectOAuth = hasDirectGoogleOAuth();
	const lovableApiKey = getConnectorEnv("lovable");
	const driveApiKey = getConnectorEnv("drive");
	const res = await fetch(useDirectOAuth ? opts.uploadUrl : toDriveGatewayUrl(opts.uploadUrl), {
		method: "PUT",
		headers: {
			...useDirectOAuth ? { Authorization: `Bearer ${await getAccessToken()}` } : {
				Authorization: `Bearer ${lovableApiKey}`,
				"X-Connection-Api-Key": driveApiKey
			},
			"Content-Length": String(bytes.byteLength),
			"Content-Range": `bytes ${opts.start}-${opts.end - 1}/${opts.total}`
		},
		body: requestBody
	});
	if (!res.ok) await throwDriveError("final upload chunk", res);
	const body = await res.json();
	if (!body.id) throw new Error("Drive accepted final chunk but did not return a file id.");
	return {
		id: body.id,
		name: body.name ?? "uploaded-file",
		size: Number(body.size ?? opts.total),
		mimeType: body.mimeType ?? "application/octet-stream",
		webViewLink: body.webViewLink ?? null
	};
}
async function listFolderFiles(folderId) {
	const out = [];
	const q = encodeURIComponent(`'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`);
	const fields = encodeURIComponent("nextPageToken,files(id,name,size,mimeType,webViewLink,modifiedTime)");
	let pageToken;
	for (let i = 0; i < 20; i++) {
		const res = await gw(`${DRIVE_API}/files?q=${q}&fields=${fields}&pageSize=200${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`);
		if (!res.ok) await throwDriveError("folder list", res);
		const body = await res.json();
		for (const f of body.files ?? []) out.push({
			id: f.id,
			name: f.name,
			size: Number(f.size ?? 0),
			mimeType: f.mimeType ?? "application/octet-stream",
			webViewLink: f.webViewLink ?? null,
			modifiedTime: f.modifiedTime ?? null
		});
		if (!body.nextPageToken) break;
		pageToken = body.nextPageToken;
	}
	return out;
}
//#endregion
export { createResumableUploadSession, deleteDriveFile, downloadDriveFile, findLatestDriveFileByUpload, getDriveFileMetadata, getDriveStorageQuota, getUserFolderId, listFolderFiles, uploadBufferToDrive, uploadFinalResumableChunk };
