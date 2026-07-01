// Direct Telegram Bot API — no Lovable gateway. Requires TELEGRAM_BOT_TOKEN.
import { createHash, timingSafeEqual } from "node:crypto";

function botToken(): string {
  const t = (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY)?.trim();
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return t;
}

/** Derived from bot token so webhook register and verify agree without a manual secret. */
export function getTelegramWebhookSecret(): string {
  return createHash("sha256").update(`telegram-webhook:${botToken()}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function tgCall<T = unknown>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : "{}",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string };
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${data.description || JSON.stringify(data)}`);
  return data.result as T;
}

export async function tgDownload(fileId: string): Promise<{ bytes: ArrayBuffer; path: string }> {
  const file = await tgCall<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`https://api.telegram.org/file/bot${botToken()}/${file.file_path}`);
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  return { bytes: await res.arrayBuffer(), path: file.file_path };
}
