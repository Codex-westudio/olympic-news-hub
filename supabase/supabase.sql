-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'trial' check (plan in ('trial','personal','enterprise')),
  plan_expires_at timestamptz,
  plan_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.profiles
  add column if not exists plan text not null default 'trial' check (plan in ('trial','personal','enterprise'));
alter table if exists public.profiles
  add column if not exists plan_expires_at timestamptz;
alter table if exists public.profiles
  add column if not exists plan_notes text;
alter table if exists public.profiles
  add column if not exists is_active boolean not null default true;

-- Sources
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organisation_type text not null check (organisation_type in ('IF', 'IOC', 'NOC', 'OCOG')),
  sport text,
  country char(3),
  language_primary text,
  website_url text,
  is_fake boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Articles
create table if not exists public.articles (
  id text primary key,
  source_id uuid not null references public.sources (id) on delete cascade,
  source_name text not null,
  organisation_type text not null check (organisation_type in ('IF', 'IOC', 'NOC', 'OCOG')),
  sport text not null,
  country char(3) not null,
  language text not null,
  content_type text not null check (content_type in ('news','communiqué','résultat','règlement','nomination','rapport','événement')),
  title text not null,
  summary text not null,
  published_at timestamptz not null,
  source_url text not null,
  image_url text,
  topics text[] not null default '{}',
  official_weight numeric(3,2) not null default 0.5,
  status text not null default 'published' check (status in ('published','review','draft')),
  is_fake boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Widgets
create table if not exists public.widgets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  filters jsonb not null default '{}'::jsonb,
  "limit" int not null default 12 check ("limit" between 1 and 50),
  sort text not null default 'date_desc' check (sort in ('date_desc','date_asc','official_desc')),
  owner_id uuid references auth.users (id) on delete set null,
  is_public boolean not null default true,
  allowed_domains text[] not null default '{}',
  is_fake boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- View used by API routes
create or replace view public.v_widget_articles as
select
  a.id,
  a.source_id,
  a.source_name,
  a.organisation_type,
  a.sport,
  a.country,
  a.language,
  a.content_type,
  a.title,
  a.summary,
  a.published_at,
  a.source_url,
  a.image_url,
  a.topics,
  a.official_weight,
  a.status
from public.articles a;

-- Indexes
create index if not exists idx_articles_published_at on public.articles (published_at desc);
create index if not exists idx_articles_facets on public.articles (sport, organisation_type, country, content_type);
create index if not exists idx_articles_source_id on public.articles (source_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.widgets enable row level security;

-- Profiles policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles select self'
  ) then
    create policy "profiles select self" on public.profiles
      for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles update self'
  ) then
    create policy "profiles update self" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- Sources policies (public read, service role manage)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sources' and policyname = 'sources public read'
  ) then
    create policy "sources public read" on public.sources
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sources' and policyname = 'sources service manage'
  ) then
    create policy "sources service manage" on public.sources
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Articles policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles' and policyname = 'articles published read'
  ) then
    create policy "articles published read" on public.articles
      for select using (status = 'published');
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles' and policyname = 'articles service manage'
  ) then
    create policy "articles service manage" on public.articles
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Widgets policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'widgets' and policyname = 'widgets public read'
  ) then
    create policy "widgets public read" on public.widgets
      for select using (is_public or owner_id = auth.uid() or auth.role() = 'service_role');
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'widgets' and policyname = 'widgets owners write'
  ) then
    create policy "widgets owners write" on public.widgets
      for all using (owner_id = auth.uid() or auth.role() = 'service_role')
      with check (owner_id = auth.uid() or auth.role() = 'service_role');
  end if;
end $$;

comment on table public.articles is
  'n8n exploite la clé service_role côté serveur uniquement pour insérer les articles officiels.';
