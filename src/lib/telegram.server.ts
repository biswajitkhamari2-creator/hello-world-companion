// Telegram Bot API helpers (via Lovable connector gateway).
import { createHash, timingSafeEqual } from "node:crypto";

const GATEWAY = "https://connector-gateway.lovable.dev/telegram";

function headers() {
  const lovableKey = process.env.LOVABLE_API_KEY?.trim();
  const tgKey = process.env.TELEGRAM_API_KEY?.trim();
  if (!tgKey) throw new Error("Telegram connector is not linked for this project.");
  return {
    ...(lovableKey ? { Authorization: `Bearer ${lovableKey}` } : {}),
    "X-Connection-Api-Key": tgKey,
  } as Record<string, string>;
}

export function deriveTelegramWebhookSecret(): string {
  const tgKey = process.env.TELEGRAM_API_KEY ?? "";
  return createHash("sha256").update(`telegram-webhook:${tgKey}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function tgCall<T = unknown>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${GATEWAY}/${method}`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  return data.result as T;
}

export async function tgDownload(fileId: string): Promise<{ bytes: ArrayBuffer; path: string }> {
  const file = await tgCall<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`${GATEWAY}/file/${file.file_path}`, { headers: headers() });
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  return { bytes: await res.arrayBuffer(), path: file.file_path };
}
