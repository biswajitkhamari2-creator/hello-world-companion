// Telegram helpers — routed through the Lovable connector gateway so we don't
// need a raw bot token. Required env vars (provided by the Telegram connector
// + Lovable runtime): TELEGRAM_API_KEY, LOVABLE_API_KEY.
import { createHash, timingSafeEqual } from "node:crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

function connectionKey(): string {
  const t = process.env.TELEGRAM_API_KEY?.trim();
  if (!t) throw new Error("TELEGRAM_API_KEY is not configured (link the Telegram connector).");
  return t;
}

function lovableKey(): string {
  const t = process.env.LOVABLE_API_KEY?.trim();
  if (!t) throw new Error("LOVABLE_API_KEY is not configured.");
  return t;
}

/** Derived from TELEGRAM_API_KEY so both webhook register and verify agree without a manual secret. */
export function getTelegramWebhookSecret(): string {
  return createHash("sha256").update(`telegram-webhook:${connectionKey()}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function tgCall<T = unknown>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey()}`,
      "X-Connection-Api-Key": connectionKey(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : "{}",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string };
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${data.description || JSON.stringify(data)}`);
  return data.result as T;
}

export async function tgDownload(fileId: string): Promise<{ bytes: ArrayBuffer; path: string }> {
  const file = await tgCall<{ file_path: string }>("getFile", { file_id: fileId });
  const res = await fetch(`${GATEWAY_URL}/file/${file.file_path}`, {
    headers: {
      Authorization: `Bearer ${lovableKey()}`,
      "X-Connection-Api-Key": connectionKey(),
    },
  });
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  return { bytes: await res.arrayBuffer(), path: file.file_path };
}
