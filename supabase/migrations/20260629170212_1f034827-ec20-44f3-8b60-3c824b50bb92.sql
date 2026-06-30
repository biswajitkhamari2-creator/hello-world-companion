ALTER TABLE public.telegram_inbox ADD COLUMN IF NOT EXISTS archived_at timestamptz;
GRANT UPDATE, DELETE ON public.telegram_inbox TO authenticated;
CREATE POLICY "Inbox archive by authenticated" ON public.telegram_inbox FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Inbox delete by authenticated" ON public.telegram_inbox FOR DELETE TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS telegram_inbox_archived_idx ON public.telegram_inbox (archived_at);