import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getTelegramWebhookSecret, safeEqual, tgDownload } from "@/lib/telegram.server";

// Shared inbox owner: we store rows globally (RLS allows authenticated read).
// Drive files are uploaded under a shared "telegram-inbox" pseudo-user folder.
const SHARED_OWNER = "telegram-inbox";
const FALLBACK_SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
// If set, PDFs forwarded to the bot are also inserted into `documents`
// for this user id — they show up in the dashboard automatically, no
// manual upload needed. Set TELEGRAM_INBOX_OWNER_USER_ID in project secrets.
const INBOX_OWNER_USER_ID = process.env.TELEGRAM_INBOX_OWNER_USER_ID || "";

// Best-effort PDF shrink (Cloudflare Worker safe). Rewrites the PDF with
// object streams — typically 10-30% smaller for text-heavy newspaper PDFs.
// Image-heavy scans won't shrink much; that's expected.
async function shrinkPdf(bytes: ArrayBuffer): Promise<{ bytes: ArrayBuffer; ratio: number }> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const out = await src.save({ useObjectStreams: true, addDefaultPage: false });
    const outBuf = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    return { bytes: outBuf.byteLength < bytes.byteLength ? outBuf : bytes, ratio: outBuf.byteLength / bytes.byteLength };
  } catch {
    return { bytes, ratio: 1 };
  }
}

async function getAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing Supabase service-role key for Telegram webhook.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function upsertInbox(row: Record<string, unknown>) {
  const admin = await getAdmin();
  const { error } = await admin.from("telegram_inbox").upsert(row, { onConflict: "chat_id,message_id" });
  if (error) throw new Error(`Telegram inbox save failed: ${error.message}`);
}

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s)]+/gi;
  return Array.from(new Set(text.match(re) ?? []));
}

async function handlePdf(doc: { file_id: string; file_name?: string; mime_type?: string; file_size?: number }, base: {
  chat_id: number; message_id: number; caption: string | null; posted_at: string; raw: unknown;
}) {
  const fileName = doc.file_name || `telegram-${base.message_id}.pdf`;
  try {
    // Duplicate guard — same newspaper PDF (same name + size) already imported?
    // Skip the Drive upload + document insert entirely to save bandwidth/credit.
    if (INBOX_OWNER_USER_ID && doc.file_size) {
      try {
        const admin = await getAdmin();
        const { data: dupe } = await admin
          .from("documents")
          .select("id")
          .eq("user_id", INBOX_OWNER_USER_ID)
          .eq("file_name", fileName)
          .eq("size_bytes", doc.file_size)
          .limit(1)
          .maybeSingle();
        if (dupe) {
          await upsertInbox({
            chat_id: base.chat_id,
            message_id: base.message_id,
            kind: "pdf",
            caption: base.caption,
            posted_at: base.posted_at,
            file_name: fileName,
            mime: doc.mime_type || "application/pdf",
            size_bytes: doc.file_size,
            status: "duplicate",
            error_message: "Duplicate file not accepted — already imported.",
            raw: base.raw as any,
          });
          return;
        }
      } catch (e) {
        console.warn("[telegram dedup check failed]", (e as Error).message);
      }
    }
    const { bytes } = await tgDownload(doc.file_id);
    const { bytes: shrunk } = await shrinkPdf(bytes);
    const { uploadBufferToDrive } = await import("@/lib/gdrive.server");
    const up = await uploadBufferToDrive({
      userId: SHARED_OWNER,
      fileName,
      mime: doc.mime_type || "application/pdf",
      data: shrunk,
    });
    // Auto-push into the owner's documents so the dashboard picks it up.
    if (INBOX_OWNER_USER_ID) {
      try {
        const admin = await getAdmin();
        const { error: docErr } = await admin
          .from("documents")
          .insert({
            user_id: INBOX_OWNER_USER_ID,
            title: base.caption || fileName,
            file_name: fileName,
            mime: up.mimeType,
            size_bytes: up.size,
            source_type: "telegram",
            status: "uploaded",
            storage_provider: "google_drive",
            drive_file_id: up.fileId,
            drive_view_link: up.webViewLink,
          });
        if (docErr) console.error("[telegram → documents insert]", docErr.message);
      } catch (e) {
        console.error("[telegram → documents insert]", (e as Error).message);
      }
    }
    await upsertInbox({
      chat_id: base.chat_id,
      message_id: base.message_id,
      kind: "pdf",
      caption: base.caption,
      posted_at: base.posted_at,
      file_name: fileName,
      mime: up.mimeType,
      size_bytes: up.size,
      drive_file_id: up.fileId,
      drive_view_link: up.webViewLink,
      status: "ready",
      raw: base.raw as any,
    });
  } catch (e) {
    console.error("[telegram media import]", e);
    await upsertInbox({
      chat_id: base.chat_id,
      message_id: base.message_id,
      kind: "pdf",
      caption: base.caption,
      posted_at: base.posted_at,
      file_name: fileName,
      mime: doc.mime_type || "application/pdf",
      size_bytes: doc.file_size ?? null,
      status: "failed",
      error_message: (e as Error).message,
      raw: base.raw as any,
    });
  }
}

async function handlePhoto(photo: { file_id: string; file_size?: number }, base: {
  chat_id: number; message_id: number; caption: string | null; posted_at: string; raw: unknown;
}) {
  const fileName = `telegram-${base.message_id}.jpg`;
  try {
    const { bytes } = await tgDownload(photo.file_id);
    const { uploadBufferToDrive } = await import("@/lib/gdrive.server");
    const up = await uploadBufferToDrive({
      userId: SHARED_OWNER,
      fileName,
      mime: "image/jpeg",
      data: bytes,
    });
    await upsertInbox({
      chat_id: base.chat_id,
      message_id: base.message_id,
      kind: "image",
      caption: base.caption,
      posted_at: base.posted_at,
      file_name: fileName,
      mime: up.mimeType,
      size_bytes: up.size,
      drive_file_id: up.fileId,
      drive_view_link: up.webViewLink,
      status: "ready",
      raw: base.raw as any,
    });
  } catch (e) {
    console.error("[telegram media import]", e);
    await upsertInbox({
      chat_id: base.chat_id,
      message_id: base.message_id,
      kind: "image",
      caption: base.caption,
      posted_at: base.posted_at,
      file_name: fileName,
      mime: "image/jpeg",
      size_bytes: photo.file_size ?? null,
      status: "failed",
      error_message: (e as Error).message,
      raw: base.raw as any,
    });
  }
}

async function handleLink(url: string, base: {
  chat_id: number; message_id: number; caption: string | null; posted_at: string; raw: unknown;
}) {
  await upsertInbox({
    chat_id: base.chat_id,
    message_id: base.message_id,
    kind: "link",
    caption: base.caption,
    posted_at: base.posted_at,
    source_url: url,
    status: "ready",
    raw: base.raw as any,
  });
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const expected = getTelegramWebhookSecret();
          const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
          if (!safeEqual(actual, expected)) {
            return new Response("Unauthorized", { status: 401 });
          }
          const update = (await request.json()) as Record<string, unknown>;
          const msg: any = update.channel_post || update.message || update.edited_channel_post || update.edited_message;
          if (!msg?.chat?.id || typeof msg.message_id !== "number") {
            return Response.json({ ok: true, ignored: true });
          }
          const base = {
            chat_id: Number(msg.chat.id),
            message_id: Number(msg.message_id),
            caption: (msg.caption || msg.text || null) as string | null,
            posted_at: new Date((msg.date ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
            raw: update,
          };

          if (msg.document && (msg.document.mime_type === "application/pdf" || (msg.document.file_name || "").toLowerCase().endsWith(".pdf"))) {
            await handlePdf(msg.document, base);
          } else if (Array.isArray(msg.photo) && msg.photo.length) {
            const best = msg.photo[msg.photo.length - 1];
            await handlePhoto(best, base);
          } else if (typeof msg.text === "string") {
            const urls = extractUrls(msg.text);
            if (urls.length) {
              for (const u of urls) {
                await handleLink(u, { ...base, message_id: base.message_id + Math.floor(Math.random() * 1000) });
              }
            }
          }
          return Response.json({ ok: true });
        } catch (e) {
          console.error("[telegram webhook]", e);
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
