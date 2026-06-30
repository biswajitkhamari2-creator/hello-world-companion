-- Run this in: Supabase Dashboard > SQL Editor > New query > paste & Run.
-- Project: https://ffkyjnswyfeghmfmlapu.supabase.co

-- ============================================================
-- ROLES
-- ============================================================
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PDF DOCUMENTS
-- ============================================================
create table if not exists public.pdf_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('upload', 'generated')),
  title text,
  storage_path text not null,
  size_bytes bigint,
  mime_type text default 'application/pdf',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pdf_documents_user_id_idx on public.pdf_documents(user_id);

grant select, insert, update, delete on public.pdf_documents to authenticated;
grant all on public.pdf_documents to service_role;

alter table public.pdf_documents enable row level security;

drop policy if exists "pdf select own or admin" on public.pdf_documents;
create policy "pdf select own or admin" on public.pdf_documents
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists "pdf insert own" on public.pdf_documents;
create policy "pdf insert own" on public.pdf_documents
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "pdf update own" on public.pdf_documents;
create policy "pdf update own" on public.pdf_documents
  for update to authenticated using (user_id = auth.uid());
drop policy if exists "pdf delete own or admin" on public.pdf_documents;
create policy "pdf delete own or admin" on public.pdf_documents
  for delete to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('pdf-uploads', 'pdf-uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('pdf-generated', 'pdf-generated', false)
  on conflict (id) do nothing;

-- Per-user folder convention: <bucket>/<auth.uid()>/<filename>
drop policy if exists "users read own pdf objects" on storage.objects;
create policy "users read own pdf objects" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('pdf-uploads','pdf-generated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users upload to own folder" on storage.objects;
create policy "users upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('pdf-uploads','pdf-generated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own pdf objects" on storage.objects;
create policy "users delete own pdf objects" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('pdf-uploads','pdf-generated')
    and (storage.foldername(name))[1] = auth.uid()::text
  );