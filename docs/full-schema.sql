-- UPSC Genius AI — full schema. Run in Supabase Dashboard → SQL Editor.

-- ============================================================
-- supabase/migrations/20260627171657_6192215d-3184-4084-9fea-78d68089468e.sql
-- ============================================================

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'pdf',
  storage_path TEXT,
  mime TEXT,
  size_bytes BIGINT,
  extracted_text TEXT,
  subject TEXT,
  priority TEXT CHECK (priority IN ('high','medium','low')),
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','processing','ready','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX documents_user_idx ON public.documents(user_id, created_at DESC);
CREATE INDEX documents_subject_idx ON public.documents(user_id, subject);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents manage own" ON public.documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Generations
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('handwritten_notes','short_notes','prelims_mcqs','mains_questions')),
  title TEXT,
  content JSONB NOT NULL,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('processing','ready','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX generations_doc_idx ON public.generations(document_id, created_at DESC);
CREATE INDEX generations_user_idx ON public.generations(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Generations manage own" ON public.generations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER documents_touch BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ============================================================
-- supabase/migrations/20260627171740_72dfbbb2-dd88-48d9-bda7-3ce345ceaa88.sql
-- ============================================================

-- Fix function search_path & revoke public execute
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage RLS for 'uploads' bucket (user-scoped folder: <auth.uid()>/<filename>)
CREATE POLICY "uploads read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- supabase/migrations/20260629082356_b6a209df-faef-464e-a1e0-5b6271d6156a.sql
-- ============================================================
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_output_type_check;
ALTER TABLE public.generations ADD CONSTRAINT generations_output_type_check CHECK (output_type = ANY (ARRAY['handwritten_notes'::text, 'short_notes'::text, 'prelims_mcqs'::text, 'mains_questions'::text, 'infographics'::text]));

-- ============================================================
-- supabase/migrations/20260629135603_f9048e9a-a646-4927-b94a-45bb11112e68.sql
-- ============================================================

-- 1) Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2) Documents: add R2 fields + expiry
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS r2_key text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS expiry_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'r2';

CREATE INDEX IF NOT EXISTS documents_expiry_at_idx ON public.documents (expiry_at);
CREATE INDEX IF NOT EXISTS documents_r2_key_idx ON public.documents (r2_key);

-- 3) Generations: expiry mirrors parent doc
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS expiry_at timestamptz NOT NULL DEFAULT (now() + interval '3 days');
CREATE INDEX IF NOT EXISTS generations_expiry_at_idx ON public.generations (expiry_at);

-- 4) Cleanup log
CREATE TABLE IF NOT EXISTS public.storage_cleanup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  files_deleted int NOT NULL DEFAULT 0,
  generations_deleted int NOT NULL DEFAULT 0,
  documents_deleted int NOT NULL DEFAULT 0,
  errors int NOT NULL DEFAULT 0,
  detail jsonb
);
GRANT SELECT ON public.storage_cleanup_log TO authenticated;
GRANT ALL ON public.storage_cleanup_log TO service_role;
ALTER TABLE public.storage_cleanup_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read cleanup log" ON public.storage_cleanup_log;
CREATE POLICY "Admins read cleanup log" ON public.storage_cleanup_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- supabase/migrations/20260629142838_39d4ae1b-51e4-4bb0-92f4-aa10e3ecbe3c.sql
-- ============================================================
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_view_link text;

ALTER TABLE public.documents
  ALTER COLUMN storage_provider SET DEFAULT 'google_drive';

CREATE INDEX IF NOT EXISTS documents_drive_file_id_idx ON public.documents (drive_file_id);


-- ============================================================
-- supabase/migrations/20260629164916_7d6f2bae-66d0-4fbb-aae0-e2712769dc58.sql
-- ============================================================
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

-- ============================================================
-- supabase/migrations/20260629170212_1f034827-ec20-44f3-8b60-3c824b50bb92.sql
-- ============================================================
ALTER TABLE public.telegram_inbox ADD COLUMN IF NOT EXISTS archived_at timestamptz;
GRANT UPDATE, DELETE ON public.telegram_inbox TO authenticated;
CREATE POLICY "Inbox archive by authenticated" ON public.telegram_inbox FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Inbox delete by authenticated" ON public.telegram_inbox FOR DELETE TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS telegram_inbox_archived_idx ON public.telegram_inbox (archived_at);

-- ============================================================
-- supabase/migrations/20260629172002_0a518933-87c6-47cb-b069-2980188a4485.sql
-- ============================================================
ALTER TABLE public.generations DROP CONSTRAINT generations_output_type_check; ALTER TABLE public.generations ADD CONSTRAINT generations_output_type_check CHECK (output_type = ANY (ARRAY['handwritten_notes'::text, 'short_notes'::text, 'prelims_mcqs'::text, 'mains_questions'::text, 'infographics'::text, 'newspaper'::text, 'final_checker'::text]));

-- ============================================================
-- supabase/migrations/20260629191509_5f340077-8786-49f4-8178-3b607c798fa1.sql
-- ============================================================

DROP POLICY IF EXISTS "Inbox archive by authenticated" ON public.telegram_inbox;
DROP POLICY IF EXISTS "Inbox delete by authenticated" ON public.telegram_inbox;
-- Keep SELECT (shared inbox is intentional read-only for signed-in users).
-- Writes are performed only by server code using the service role (admin client),
-- which bypasses RLS. No authenticated UPDATE/DELETE policies = no client-side write access.


