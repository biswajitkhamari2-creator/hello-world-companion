CREATE TABLE public.telegram_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('pdf','image','link')),
  caption text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  chat_id bigint NOT NULL,
  message_id bigint NOT NULL,
  file_name text,
  mime text,
  size_bytes bigint,
  drive_file_id text,
  drive_view_link text,
  source_url text,
  status text NOT NULL DEFAULT 'ready',
  error_message text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chat_id, message_id)
);
GRANT SELECT ON public.telegram_inbox TO authenticated;
GRANT ALL ON public.telegram_inbox TO service_role;
ALTER TABLE public.telegram_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inbox readable by authenticated" ON public.telegram_inbox FOR SELECT TO authenticated USING (true);
CREATE INDEX telegram_inbox_posted_at_idx ON public.telegram_inbox (posted_at DESC);