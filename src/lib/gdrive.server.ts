// Google Drive storage adapter for UPSC Genius AI.
// Talks directly to https://www.googleapis.com using your own OAuth refresh token.
// Required env vars (set in Vercel):
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   GOOGLE_REFRESH_TOKEN
//   GOOGLE_DRIVE_ROOT_FOLDER_ID  (optional — defaults to a folder named UPSC-Genius-AI in My Drive)
// Generate GOOGLE_REFRESH_TOKEN by visiting /api/oauth/google/start on your deployed site.

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const APP_FOLDER_NAME = "UPSC-Genius-AI";

// In-memory access token cache (per-worker). Google tokens live 1h; refresh ~5 min early.
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - 60_000 > now) return tokenCache.token;

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in Vercel. Visit /api/oauth/google/start on your deployed site to mint a refresh token.",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Google OAuth refresh failed (${res.status}): ${t.slice(0, 400)}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return tokenCache.token;
}

async function throwDriveError(action: string, res: Response): Promise<never> {
  const body = await res.text();
  const safeBody = body.slice(0, 800);
  if (res.status === 401 || res.status === 403) {
    // Force refresh next call
    tokenCache = null;
    throw new Error(`Google Drive auth failed during ${action} (${res.status}): ${safeBody}`);
  }
  if (res.status === 404 && action === "download") {
    throw new Error(
      "This file is no longer accessible in Google Drive. With the 'drive.file' scope, the app only sees files it created itself — files uploaded under a previous credential are invisible. Re-upload the document.",
    );
  }
  throw new Error(`Google Drive ${action} failed (${res.status}): ${safeBody}`);
}

async function gw(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function ensureFolder(name: string, parentId?: string): Promise<string> {
  const qParent = parentId ? ` and '${parentId}' in parents` : "";
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${qParent}`,
  );
  const find = await gw(`${DRIVE_API}/files?q=${q}&fields=files(id,name)&pageSize=1`);
  if (!find.ok) await throwDriveError("folder lookup", find);
  const body = (await find.json()) as { files?: Array<{ id: string }> };
  if (body.files && body.files.length > 0) return body.files[0].id;

  // Create
  const meta: Record<string, unknown> = { name, mimeType: "application/vnd.google-apps.folder" };
  if (parentId) meta.parents = [parentId];
  const create = await gw(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meta),
  });
  if (!create.ok) await throwDriveError("folder create", create);
  const created = (await create.json()) as { id: string };
  return created.id;
}

export async function getUserFolderId(userId: string): Promise<string> {
  const explicitRoot = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim();
  const root = explicitRoot || (await ensureFolder(APP_FOLDER_NAME));
  return ensureFolder(userId, root);
}

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string | null;
  size: number;
  mimeType: string;
}

export async function uploadBufferToDrive(opts: {
  userId: string;
  fileName: string;
  mime: string;
  data: ArrayBuffer | Uint8Array;
}): Promise<DriveUploadResult> {
  const parentId = await getUserFolderId(opts.userId);
  const metadata = {
    name: opts.fileName,
    parents: [parentId],
    mimeType: opts.mime || "application/octet-stream",
  };

  // Use multipart upload through the gateway upload endpoint.
  const boundary = `----lovable${crypto.randomUUID().replace(/-/g, "")}`;
  const pre =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${metadata.mimeType}\r\n\r\n`;
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
    body,
  });
  if (!res.ok) await throwDriveError("upload", res);
  const out = (await res.json()) as { id: string; webViewLink?: string; size?: string; mimeType?: string };
  return {
    fileId: out.id,
    webViewLink: out.webViewLink ?? null,
    size: Number(out.size ?? bytes.length),
    mimeType: out.mimeType ?? metadata.mimeType,
  };
}

export async function downloadDriveFile(fileId: string): Promise<{ buffer: ArrayBuffer; mime: string }> {
  const res = await gw(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`);
  if (!res.ok) await throwDriveError("download", res);
  const mime = res.headers.get("content-type") || "application/octet-stream";
  const buffer = await res.arrayBuffer();
  return { buffer, mime };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const res = await gw(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
  // 404 = already gone, treat as success.
  if (!res.ok && res.status !== 404) {
    await throwDriveError("delete", res);
  }
}

export async function getDriveStorageQuota(): Promise<{
  limit: number | null;
  usage: number;
  usageInDrive: number;
}> {
  const res = await gw(`${DRIVE_API}/about?fields=storageQuota`);
  if (!res.ok) await throwDriveError("quota check", res);
  const body = (await res.json()) as { storageQuota?: { limit?: string; usage?: string; usageInDrive?: string } };
  const q = body.storageQuota ?? {};
  return {
    limit: q.limit ? Number(q.limit) : null,
    usage: Number(q.usage ?? 0),
    usageInDrive: Number(q.usageInDrive ?? 0),
  };
}

// --- Resumable upload (direct browser → Google) ---

export async function createResumableUploadSession(opts: {
  userId: string;
  fileName: string;
  mime: string;
  size: number;
}): Promise<{ uploadUrl: string }> {
  const parentId = await getUserFolderId(opts.userId);
  const metadata = {
    name: opts.fileName,
    parents: [parentId],
    mimeType: opts.mime || "application/octet-stream",
  };
  const res = await gw(`${DRIVE_UPLOAD}/files?uploadType=resumable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": metadata.mimeType,
      "X-Upload-Content-Length": String(opts.size),
    },
    body: JSON.stringify(metadata),
  });
  if (!res.ok && res.status !== 200) await throwDriveError("resumable session init", res);
  const uploadUrl =
    res.headers.get("location") ||
    res.headers.get("Location") ||
    res.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error(
      "Drive did not return a resumable upload URL (Location header missing).",
    );
  }
  return { uploadUrl };
}

export async function getDriveFileMetadata(fileId: string): Promise<{
  id: string;
  name: string;
  size: number;
  mimeType: string;
  webViewLink: string | null;
}> {
  const res = await gw(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,size,mimeType,webViewLink`,
  );
  if (!res.ok) await throwDriveError("metadata", res);
  const body = (await res.json()) as {
    id: string;
    name: string;
    size?: string;
    mimeType?: string;
    webViewLink?: string;
  };
  return {
    id: body.id,
    name: body.name,
    size: Number(body.size ?? 0),
    mimeType: body.mimeType ?? "application/octet-stream",
    webViewLink: body.webViewLink ?? null,
  };
}

// List every non-folder, non-trashed file inside a Drive folder. Pages through results.
export async function listFolderFiles(folderId: string): Promise<Array<{
  id: string;
  name: string;
  size: number;
  mimeType: string;
  webViewLink: string | null;
  modifiedTime: string | null;
}>> {
  const out: Array<{ id: string; name: string; size: number; mimeType: string; webViewLink: string | null; modifiedTime: string | null }> = [];
  const q = encodeURIComponent(
    `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`,
  );
  const fields = encodeURIComponent("nextPageToken,files(id,name,size,mimeType,webViewLink,modifiedTime)");
  let pageToken: string | undefined;
  for (let i = 0; i < 20; i++) {
    const tokenPart = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const res = await gw(`${DRIVE_API}/files?q=${q}&fields=${fields}&pageSize=200${tokenPart}`);
    if (!res.ok) await throwDriveError("folder list", res);
    const body = (await res.json()) as {
      nextPageToken?: string;
      files?: Array<{ id: string; name: string; size?: string; mimeType?: string; webViewLink?: string; modifiedTime?: string }>;
    };
    for (const f of body.files ?? []) {
      out.push({
        id: f.id,
        name: f.name,
        size: Number(f.size ?? 0),
        mimeType: f.mimeType ?? "application/octet-stream",
        webViewLink: f.webViewLink ?? null,
        modifiedTime: f.modifiedTime ?? null,
      });
    }
    if (!body.nextPageToken) break;
    pageToken = body.nextPageToken;
  }
  return out;
}
