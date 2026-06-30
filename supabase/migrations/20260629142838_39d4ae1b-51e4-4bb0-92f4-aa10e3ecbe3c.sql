ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_view_link text;

ALTER TABLE public.documents
  ALTER COLUMN storage_provider SET DEFAULT 'google_drive';

CREATE INDEX IF NOT EXISTS documents_drive_file_id_idx ON public.documents (drive_file_id);
