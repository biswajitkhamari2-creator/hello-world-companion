import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DRIVE_DOWNLOAD_SELECT =
  "id,title,file_name,mime,size_bytes,created_at,drive_file_id,drive_view_link,summary,source_type,storage_provider,status";

function cleanFileName(name: string): string {
  const trimmed = (name || "download").trim().replace(/[\\/]+/g, "-");
  return trimmed.slice(0, 180) || "download";
}

export const saveGeneratedDownloadToDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("Expected FormData");
    const file = d.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    return {
      file,
      source: String(d.get("source") || "download").slice(0, 80),
      kind: String(d.get("kind") || "other").slice(0, 40),
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const fileName = cleanFileName(data.file.name);
    const mime = data.file.type || "application/octet-stream";
    const { uploadBufferToDrive } = await import("./gdrive.server");
    const upload = await uploadBufferToDrive({
      userId,
      fileName,
      mime,
      data: await data.file.arrayBuffer(),
      folderName: "Downloads",
    });

    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title: fileName,
        file_name: fileName,
        mime,
        size_bytes: upload.size,
        source_type: "download",
        status: "ready",
        storage_provider: "google_drive",
        drive_file_id: upload.fileId,
        drive_view_link: upload.webViewLink,
        summary: `Saved download${data.source ? ` from ${data.source}` : ""}${data.kind ? ` · ${data.kind}` : ""}`,
      })
      .select(DRIVE_DOWNLOAD_SELECT)
      .single();

    if (error) {
      try {
        const { deleteDriveFile } = await import("./gdrive.server");
        await deleteDriveFile(upload.fileId);
      } catch {}
      throw error;
    }

    return {
      documentId: row.id,
      name: row.file_name || row.title || fileName,
      mime: row.mime || mime,
      size: Number(row.size_bytes || upload.size),
      createdAt: row.created_at,
      driveFileId: row.drive_file_id,
      driveViewLink: row.drive_view_link,
    };
  });

export const listDriveDownloads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("documents")
      .select(DRIVE_DOWNLOAD_SELECT)
      .eq("user_id", userId)
      .eq("source_type", "download")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const deleteDriveDownload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc } = await supabase
      .from("documents")
      .select("drive_file_id")
      .eq("id", data.id)
      .eq("user_id", userId)
      .eq("source_type", "download")
      .single();
    if (doc?.drive_file_id) {
      try {
        const { deleteDriveFile } = await import("./gdrive.server");
        await deleteDriveFile(doc.drive_file_id);
      } catch (e) {
        console.warn("[downloads] drive delete failed, removing row anyway", e);
      }
    }
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId)
      .eq("source_type", "download");
    if (error) throw error;
    return { ok: true };
  });