import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Public Drive download (Anyone-with-the-link files). Handles the >100MB confirm interstitial. */
async function fetchPublicDriveFile(fileId: string): Promise<{ bytes: ArrayBuffer; mime: string; name: string | null }> {
  const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
  let res = await fetch(primary, { redirect: "follow" });
  let ct = res.headers.get("content-type") || "";
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
  if (!res.ok || /text\/html/i.test(ct)) {
    throw new Error(`Drive public download failed (${res.status}). Ensure the file is shared as "Anyone with the link — Viewer".`);
  }
  const cd = res.headers.get("content-disposition") || "";
  const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
  const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
  const bytes = await res.arrayBuffer();
  return { bytes, mime: ct.split(";")[0].trim() || "application/pdf", name };
}

export interface InboxItem {
  id: string;
  kind: "pdf" | "image" | "link";
  caption: string | null;
  posted_at: string;
  file_name: string | null;
  mime: string | null;
  size_bytes: number | null;
  drive_file_id: string | null;
  drive_view_link: string | null;
  source_url: string | null;
  status: string;
  archived_at: string | null;
}

function extractDriveFileIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
    const pathMatch = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
    if (pathMatch) return pathMatch[1];
    const idParam = u.searchParams.get("id");
    return idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam) ? idParam : null;
  } catch {
    return null;
  }
}

function extractUrls(text: string): string[] {
  return Array.from(new Set(text.match(/https?:\/\/[^\s)]+/gi) ?? []));
}

function getDriveRecovery(item: any): { driveId: string | null; sourceUrl: string | null } {
  const candidates = [item.source_url, item.caption, item.file_name, JSON.stringify(item.raw ?? {})]
    .filter(Boolean)
    .flatMap((value) => extractUrls(String(value)));
  for (const url of candidates) {
    const driveId = extractDriveFileIdFromUrl(url);
    if (driveId) return { driveId, sourceUrl: url };
  }
  return { driveId: null, sourceUrl: (item.source_url as string | null) ?? null };
}

export const listInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { archived?: boolean }) => d ?? {})
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("telegram_inbox")
      .select("id,kind,caption,posted_at,file_name,mime,size_bytes,drive_file_id,drive_view_link,source_url,status,archived_at")
      .order("posted_at", { ascending: false })
      .limit(100);
    if (data.archived) q = q.not("archived_at", "is", null);
    else q = q.is("archived_at", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as InboxItem[];
  });

export const importInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("telegram_inbox")
      .select("*")
      .eq("id", data.itemId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item) throw new Error("Inbox item not found");
    const inboxItem = item as any;
    const driveRecovery = getDriveRecovery(inboxItem);
    if (inboxItem.kind === "link" && !driveRecovery.driveId) {
      throw new Error("This link is not a recoverable Google Drive PDF. Open the URL directly or resend a public Drive PDF link.");
    }
    if (inboxItem.status === "too_large" && !driveRecovery.driveId) {
      throw new Error(
        "This PDF is over Telegram's 20 MB bot limit and has no saved Google Drive recovery link. Please send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer'.",
      );
    }

    let driveFileId = inboxItem.drive_file_id as string | null;
    let driveViewLink = inboxItem.drive_view_link as string | null;
    let mime = inboxItem.mime as string | null;
    let sizeBytes = inboxItem.size_bytes as number | null;

    async function repairFromTelegram() {
      const rawMsg = (inboxItem.raw as any)?.message || (inboxItem.raw as any)?.channel_post || (inboxItem.raw as any)?.edited_message || (inboxItem.raw as any)?.edited_channel_post || {};
      const telegramFileId: string | undefined =
        rawMsg.document?.file_id
        || (Array.isArray(rawMsg.photo) ? rawMsg.photo.at(-1)?.file_id : undefined)
        || rawMsg.video?.file_id
        || rawMsg.audio?.file_id
        || rawMsg.voice?.file_id
        || rawMsg.animation?.file_id;

      // Fallback: if the item originally came from a Google Drive share link,
      // re-fetch it from Drive directly (public "Anyone with the link" files).
      const { driveId, sourceUrl } = getDriveRecovery(inboxItem);
      if (driveId) {
          try {
            const { uploadBufferToDrive } = await import("@/lib/gdrive.server");
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const dl = await fetchPublicDriveFile(driveId);
            const uploaded = await uploadBufferToDrive({
              userId: "telegram-inbox",
              fileName: inboxItem.file_name || dl.name || `drive-${driveId}.pdf`,
              mime: dl.mime || "application/pdf",
              data: dl.bytes,
            });
            driveFileId = uploaded.fileId;
            driveViewLink = uploaded.webViewLink;
            mime = uploaded.mimeType;
            sizeBytes = uploaded.size;
            await supabaseAdmin.from("telegram_inbox").update({
              drive_file_id: driveFileId, drive_view_link: driveViewLink,
              source_url: sourceUrl,
              kind: "pdf",
              file_name: inboxItem.file_name || dl.name || `drive-${driveId}.pdf`,
              mime, size_bytes: sizeBytes, status: "ready", error_message: null,
            }).eq("id", inboxItem.id);
            return;
          } catch (e) {
            throw new Error(
              `Could not fetch the Drive file. Make sure it is shared as "Anyone with the link — Viewer", then retry. Details: ${(e as Error).message}`,
            );
          }
      }

      if (!telegramFileId) {
        throw new Error(
          "This Telegram item has no permanent file reference. Send it as a Google Drive link shared with 'Anyone with the link — Viewer' so the app can recover it anytime.",
        );
      }
      try {
        const { tgDownload } = await import("@/lib/telegram.server");
        const { uploadBufferToDrive } = await import("@/lib/gdrive.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { bytes } = await tgDownload(telegramFileId);
        const uploaded = await uploadBufferToDrive({
          userId: "telegram-inbox",
          fileName: inboxItem.file_name || `telegram-${inboxItem.message_id}.${inboxItem.kind === "image" ? "jpg" : "pdf"}`,
          mime: inboxItem.mime || (inboxItem.kind === "image" ? "image/jpeg" : "application/pdf"),
          data: bytes,
        });
        driveFileId = uploaded.fileId;
        driveViewLink = uploaded.webViewLink;
        mime = uploaded.mimeType;
        sizeBytes = uploaded.size;
        await supabaseAdmin
          .from("telegram_inbox")
          .update({
            drive_file_id: driveFileId,
            drive_view_link: driveViewLink,
            mime,
            size_bytes: sizeBytes,
            status: "ready",
            error_message: null,
          })
          .eq("id", inboxItem.id);
      } catch (e) {
        const msg = (e as Error).message || "";
        if (/file is too big/i.test(msg)) {
          throw new Error(
            "Telegram bots cannot download files larger than 20 MB. Send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer' so it can be imported permanently.",
          );
        }
        if (/TELEGRAM_BOT_TOKEN is not configured/i.test(msg)) {
          throw new Error(
            "Telegram bot token missing on the server. Add TELEGRAM_BOT_TOKEN in your Vercel Project → Settings → Environment Variables (Production + Preview + Development), then redeploy. Meanwhile, send the newspaper as a Google Drive link shared with 'Anyone with the link — Viewer' and it will import automatically without needing the bot token.",
          );
        }
        throw new Error(
          `Telegram file could not be fetched. Please resend the PDF/image to the bot, then import the new inbox item. Details: ${msg}`,
        );
      }
    }

    if (driveFileId) {
      try {
        const { getDriveFileMetadata } = await import("@/lib/gdrive.server");
        await getDriveFileMetadata(driveFileId);
      } catch {
        await repairFromTelegram();
      }
    } else {
      await repairFromTelegram();
    }

    if (!driveFileId) throw new Error("This item has no stored file. Please resend it to the bot.");

    const title = inboxItem.file_name || (inboxItem.caption?.slice(0, 80) ?? "Telegram import");
    const { data: doc, error: insertErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title,
        file_name: inboxItem.file_name,
        source_type: inboxItem.kind === "pdf" ? "pdf" : "image",
        mime,
        size_bytes: sizeBytes,
        storage_provider: "google_drive",
        drive_file_id: driveFileId,
        drive_view_link: driveViewLink,
        status: "uploaded",
      })
      .select("id")
      .single();
    if (insertErr) throw new Error(insertErr.message);
    return { documentId: doc.id };
  });

export const archiveInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string; archived: boolean }) => d)
  .handler(async ({ data }) => {
    // Writes go through the service role — RLS on telegram_inbox forbids
    // direct client writes so authenticated users cannot tamper with the
    // shared inbox. Server functions are the trusted boundary.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("telegram_inbox")
      .update({ archived_at: data.archived ? new Date().toISOString() : null })
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("telegram_inbox")
      .delete()
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInboxItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemIds: string[] }) => d)
  .handler(async ({ data }) => {
    if (!data.itemIds?.length) return { ok: true, deleted: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("telegram_inbox")
      .delete()
      .in("id", data.itemIds);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: data.itemIds.length };
  });
