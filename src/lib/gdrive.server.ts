// Google Drive storage adapter for UPSC Genius AI.
// All calls route through the Lovable connector gateway so OAuth refresh is automatic.
// Scope in use: drive.file — we can only see/manage files this app creates.

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
const APP_FOLDER_NAME = "UPSC-Genius-AI";

function authHeaders() {
  const lovableKey = process.env.LOVABLE_API_KEY?.trim();
  const driveKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
  if (!driveKey) throw new Error("Google Drive connector is not linked for this project.");
  return {
    ...(lovableKey ? { Authorization: `Bearer ${lovableKey}` } : {}),
    "X-Connection-Api-Key": driveKey,
  } as Record<string, string>;
}

async function throwDriveError(action: string, res: Response): Promise<never> {
  const body = await res.text();
  const safeBody = body.slice(0, 800);
  const authProblem = /lovable_api_key|api key|authorization|unauthorized|forbidden|undecryptable|not_registered/i.test(body);
  if (authProblem) {
    throw new Error(`Google Drive connector authentication failed during ${action} (${res.status}): ${safeBody}`);
  }
  throw new Error(`Google Drive ${action} failed (${res.status}): ${safeBody}`);
}

async function gw(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  return res;
}

async function ensureFolder(name: string, parentId?: string): Promise<string> {
  const qParent = parentId ? ` and '${parentId}' in parents` : "";
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${qParent}`,
  );
  const find = await gw(`/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`);
  if (!find.ok) await throwDriveError("folder lookup", find);
  const body = (await find.json()) as { files?: Array<{ id: string }> };
  if (body.files && body.files.length > 0) return body.files[0].id;

  // Create
  const meta: Record<string, unknown> = { name, mimeType: "application/vnd.google-apps.folder" };
  if (parentId) meta.parents = [parentId];
  const create = await gw(`/drive/v3/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meta),
  });
  if (!create.ok) await throwDriveError("folder create", create);
  const created = (await create.json()) as { id: string };
  return created.id;
}

export async function getUserFolderId(userId: string): Promise<string> {
  const root = await ensureFolder(APP_FOLDER_NAME);
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

  const res = await gw(`/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,size,mimeType`, {
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
  const res = await gw(`/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`);
  if (!res.ok) await throwDriveError("download", res);
  const mime = res.headers.get("content-type") || "application/octet-stream";
  const buffer = await res.arrayBuffer();
  return { buffer, mime };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const res = await gw(`/drive/v3/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
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
  const res = await gw(`/drive/v3/about?fields=storageQuota`);
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
  const res = await gw(`/upload/drive/v3/files?uploadType=resumable`, {
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
      "Drive did not return a resumable upload URL (Location header missing from gateway response).",
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
    `/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,size,mimeType,webViewLink`,
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
