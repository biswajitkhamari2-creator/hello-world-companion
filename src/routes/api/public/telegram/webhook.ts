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

type TelegramBase = {
  chat_id: number;
  message_id: number;
  caption: string | null;
  posted_at: string;
  raw: unknown;
  source_url?: string | null;
};

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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.APP_SUPABASE_SECRET_KEY;
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

/** Download a public Google Drive file (shared as "Anyone with the link").
 *  Handles the >100 MB virus-scan interstitial by parsing the confirm token. */
async function fetchPublicDriveFile(fileId: string): Promise<{ bytes: ArrayBuffer; mime: string; name: string | null }> {
  const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
  let res = await fetch(primary, { redirect: "follow" });
  let ct = res.headers.get("content-type") || "";
  // If Drive returns an HTML interstitial, parse the confirm token and retry.
  if (res.ok && /text\/html/i.test(ct)) {
    const html = await res.text();
    const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
    const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] || "t";
    if (uuid) {
      const retry = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
      res = await fetch(retry, { redirect: "follow" });
      ct = res.headers.get("content-type") || "";
    }
  }
  if (!res.ok) {
    throw new Error(`Drive public download failed (${res.status}). Ensure the file is shared as "Anyone with the link — Viewer".`);
  }
  if (/text\/html/i.test(ct)) {
    throw new Error(`Drive returned an HTML page instead of the file — sharing is likely still restricted. Set it to "Anyone with the link — Viewer" and resend.`);
  }
  const cd = res.headers.get("content-disposition") || "";
  const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
  const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
  const bytes = await res.arrayBuffer();
  return { bytes, mime: ct.split(";")[0].trim() || "application/pdf", name };
}

/** Extract a Google Drive file id from any share URL. Returns null if not a Drive file link. */
function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
    // /file/d/{id}/... or /d/{id}
    const m = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
    if (m) return m[1];
    // ?id={id}  (open?id=, uc?id=)
    const idParam = u.searchParams.get("id");
    if (idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam)) return idParam;
    return null;
  } catch {
    return null;
  }
}

async function handleDrivePdfLink(url: string, driveId: string, base: TelegramBase) {
  try {
    const { uploadBufferToDrive } = await import("@/lib/gdrive.server");
    // Public download — works for any "Anyone with the link" Drive file,
    // no OAuth scope needed. The authenticated Drive API with drive.file
    // scope can't see files this app didn't create itself.
    const dl = await fetchPublicDriveFile(driveId);
    const isPdf = (dl.mime || "").includes("pdf") || (dl.name || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      // Not a PDF — save as a plain link so the user can still open it.
      await handleLink(url, base);
      return;
    }
    const fileName = dl.name || `drive-${driveId}.pdf`;
    const sizeBytes = dl.bytes.byteLength;
    // Duplicate guard on file name + size.
    if (INBOX_OWNER_USER_ID) {
      const admin = await getAdmin();
      const { data: dupe } = await admin
        .from("documents")
        .select("id")
        .eq("user_id", INBOX_OWNER_USER_ID)
        .eq("file_name", fileName)
        .eq("size_bytes", sizeBytes)
        .limit(1)
        .maybeSingle();
      if (dupe) {
        await upsertInbox({
          chat_id: base.chat_id, message_id: base.message_id, kind: "pdf",
          caption: base.caption, posted_at: base.posted_at,
          file_name: fileName, mime: dl.mime, size_bytes: sizeBytes,
          status: "duplicate", error_message: "Duplicate file — already imported.",
          source_url: url, raw: base.raw as any,
        });
        return;
      }
    }
    const { bytes: shrunk } = await shrinkPdf(dl.bytes);
    const up = await uploadBufferToDrive({
      userId: SHARED_OWNER,
      fileName,
      mime: dl.mime || "application/pdf",
      data: shrunk,
    });
    if (INBOX_OWNER_USER_ID) {
      const admin = await getAdmin();
      await admin.from("documents").insert({
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
    }
    await upsertInbox({
      chat_id: base.chat_id, message_id: base.message_id, kind: "pdf",
      caption: base.caption, posted_at: base.posted_at,
      file_name: fileName, mime: up.mimeType, size_bytes: up.size,
      drive_file_id: up.fileId, drive_view_link: up.webViewLink,
      source_url: url, status: "ready", raw: base.raw as any,
    });
  } catch (e) {
    console.error("[telegram drive-link import]", e);
    const msg = (e as Error).message || "";
    const friendly = /not found|permission|403|404/i.test(msg)
      ? "Cannot access this Drive file. Share it as 'Anyone with the link — Viewer', then resend."
      : msg;
    await upsertInbox({
      chat_id: base.chat_id, message_id: base.message_id, kind: "pdf",
      caption: base.caption, posted_at: base.posted_at,
      source_url: url, status: "failed", error_message: friendly, raw: base.raw as any,
    });
  }
}

async function handlePdf(doc: { file_id: string; file_name?: string; mime_type?: string; file_size?: number }, base: TelegramBase) {
  const fileName = doc.file_name || `telegram-${base.message_id}.pdf`;
  // Telegram Bot API has a hard 20 MB download cap (server-side, non-negotiable).
  // We CANNOT fetch the file first and then shrink — the download itself is blocked.
  // Save a clear "too_large" row so the user sees actionable guidance in the inbox
  // instead of a generic failure.
  const TG_BOT_LIMIT = 20 * 1024 * 1024;
  if (typeof doc.file_size === "number" && doc.file_size > TG_BOT_LIMIT) {
    const mb = (doc.file_size / (1024 * 1024)).toFixed(1);
    await upsertInbox({
      chat_id: base.chat_id,
      message_id: base.message_id,
      kind: "pdf",
      caption: base.caption,
      posted_at: base.posted_at,
      file_name: fileName,
      mime: doc.mime_type || "application/pdf",
      size_bytes: doc.file_size,
      status: "too_large",
      error_message:
        `PDF is ${mb} MB. Telegram bots can only download files up to 20 MB (Telegram's own limit — we cannot bypass it). ` +
        `Please compress the PDF first (e.g. ilovepdf.com / Adobe compress) OR share a Google Drive link — the Drive link will be imported permanently.`,
      source_url: base.source_url ?? null,
      raw: base.raw as any,
    });
    return;
  }
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
            source_url: base.source_url ?? null,
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
      source_url: base.source_url ?? null,
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
      source_url: base.source_url ?? null,
      raw: base.raw as any,
    });
  }
}

async function handlePhoto(photo: { file_id: string; file_size?: number }, base: TelegramBase) {
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

async function handleLink(url: string, base: TelegramBase) {
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

          // Collect URLs from text, caption, and telegram entities (link previews).
          const textCandidates = [msg.text, msg.caption].filter((v: unknown): v is string => typeof v === "string");
          const entityUrls: string[] = [];
          for (const ent of [...(msg.entities ?? []), ...(msg.caption_entities ?? [])]) {
            if (ent?.type === "text_link" && typeof ent.url === "string") entityUrls.push(ent.url);
          }
          const allUrls = Array.from(new Set([
            ...textCandidates.flatMap(extractUrls),
            ...entityUrls,
          ]));
          console.log("[telegram webhook]", {
            chat_id: base.chat_id, message_id: base.message_id,
            has_document: !!msg.document, has_photo: Array.isArray(msg.photo),
            text_preview: (msg.text || msg.caption || "").slice(0, 120),
            url_count: allUrls.length, urls: allUrls,
          });

          const driveUrls = allUrls
            .map((url, index) => ({ url, index, driveId: extractDriveFileId(url) }))
            .filter((item): item is { url: string; index: number; driveId: string } => Boolean(item.driveId));
          const nonDriveUrls = allUrls.filter((url) => !extractDriveFileId(url));
          const hasPdfDocument = Boolean(
            msg.document && (msg.document.mime_type === "application/pdf" || (msg.document.file_name || "").toLowerCase().endsWith(".pdf")),
          );

          // Drive links are the permanent path for >20 MB newspapers. Handle them
          // before Telegram media so a captioned Drive link never gets hidden by
          // Telegram's bot download limit.
          for (const item of driveUrls) {
            const perLinkBase = {
              ...base,
              message_id: -(base.message_id * 1000 + item.index + 1),
              source_url: item.url,
            };
            console.log("[telegram webhook] drive url routed", { url: item.url, driveId: item.driveId });
            await handleDrivePdfLink(item.url, item.driveId, perLinkBase);
          }

          if (hasPdfDocument && driveUrls.length === 0) {
            await handlePdf(msg.document, base);
          } else if (Array.isArray(msg.photo) && msg.photo.length && driveUrls.length === 0) {
            const best = msg.photo[msg.photo.length - 1];
            await handlePhoto(best, base);
          } else if (!hasPdfDocument && nonDriveUrls.length) {
            for (const [index, u] of nonDriveUrls.entries()) {
              const perLinkBase = { ...base, message_id: -(base.message_id * 1000 + driveUrls.length + index + 1) };
              console.log("[telegram webhook] url routed", { url: u, driveId: null });
              await handleLink(u, perLinkBase);
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
