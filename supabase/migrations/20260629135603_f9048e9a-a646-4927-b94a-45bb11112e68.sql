
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
