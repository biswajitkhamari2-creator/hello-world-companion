// Telegram Bot API helpers — talks directly to api.telegram.org with your bot token.
// Required env vars (set in Vercel):
//   TELEGRAM_BOT_TOKEN       — from @BotFather
//   TELEGRAM_WEBHOOK_SECRET  — random 32+ char string you generate; used to verify webhook authenticity
import { timingSafeEqual } from "node:crypto";

function botToken(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return t;
}

export function getTelegramWebhookSecret(): string {
  const s = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!s) throw new Error("TELEGRAM_WEBHOOK_SECRET is not configured.");
  return s;
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
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  return data.result as T;
}

export async function tgDownload(fileId: string): Promise<{ bytes: ArrayBuffer; path: string }> {
  const file = await tgCall<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`https://api.telegram.org/file/bot${botToken()}/${file.file_path}`);
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  return { bytes: await res.arrayBuffer(), path: file.file_path };
}
