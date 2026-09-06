-- ============================================================================
-- SHIKO PHOTOGRAPHY — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

-- Enable uuid-ossp for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ─── galleries ───────────────────────────────────────────────────────────────

create table if not exists public.galleries (
  id                uuid primary key default gen_random_uuid(),
  client_name       text        not null,
  title             text        not null,
  slug              text        not null unique,
  date              date        not null,
  location          text        not null,
  category          text        not null default 'other'
                      check (category in (
                        'wedding','portrait','event','family',
                        'newborn','commercial','landscape','other'
                      )),
  description       text,
  cover_image       uuid,                -- references photos.id (added after photos table)
  is_private        boolean     not null default false,
  password          text,                -- plain text for now; hash in production
  downloads_enabled boolean     not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── photos ──────────────────────────────────────────────────────────────────

create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  gallery_id    uuid        not null references public.galleries(id) on delete cascade,
  image_url     text        not null,
  thumbnail_url text        not null,
  filename      text        not null default '',
  width         integer     not null default 0,
  height        integer     not null default 0,
  caption       text,
  display_order integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- Add foreign key from galleries.cover_image → photos.id (nullable, no cascade)
alter table public.galleries
  add constraint fk_cover_image
  foreign key (cover_image) references public.photos(id)
  on delete set null
  deferrable initially deferred;

-- ─── favorites ───────────────────────────────────────────────────────────────

create table if not exists public.favorites (
  id                uuid primary key default gen_random_uuid(),
  gallery_id        uuid        not null references public.galleries(id) on delete cascade,
  photo_id          uuid        not null references public.photos(id)    on delete cascade,
  client_identifier text        not null,           -- anonymous device/session id
  created_at        timestamptz not null default now(),
  unique (photo_id, client_identifier)              -- one favorite per photo per client
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists idx_galleries_slug       on public.galleries(slug);
create index if not exists idx_galleries_category   on public.galleries(category);
create index if not exists idx_photos_gallery_id    on public.photos(gallery_id);
create index if not exists idx_photos_order         on public.photos(gallery_id, display_order);
create index if not exists idx_favorites_gallery    on public.favorites(gallery_id);
create index if not exists idx_favorites_photo      on public.favorites(photo_id);
create index if not exists idx_favorites_client     on public.favorites(client_identifier);

-- ─── updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_galleries_updated_at
  before update on public.galleries
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Public read access on galleries and photos (client-facing).
-- Write access is intentionally unrestricted for now — lock down with
-- admin auth (service-role key or Supabase Auth) in a later step.

alter table public.galleries enable row level security;
alter table public.photos    enable row level security;
alter table public.favorites enable row level security;

-- galleries: anyone can read
create policy "galleries_public_read"
  on public.galleries for select
  using (true);

-- galleries: write allowed for anon (swap for admin-auth check later)
create policy "galleries_anon_write"
  on public.galleries for all
  using (true) with check (true);

-- photos: anyone can read
create policy "photos_public_read"
  on public.photos for select
  using (true);

-- photos: write allowed for anon
create policy "photos_anon_write"
  on public.photos for all
  using (true) with check (true);

-- favorites: public read + write (client-side, identified by client_identifier)
create policy "favorites_public_read"
  on public.favorites for select
  using (true);

create policy "favorites_public_write"
  on public.favorites for all
  using (true) with check (true);

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this separately in the Supabase dashboard → Storage, OR via the CLI.
-- The bucket is public so image URLs work without signed tokens.
--
-- insert into storage.buckets (id, name, public)
-- values ('gallery-photos', 'gallery-photos', true)
-- on conflict do nothing;
--
-- create policy "gallery_photos_public_read"
--   on storage.objects for select
--   using ( bucket_id = 'gallery-photos' );
--
-- create policy "gallery_photos_anon_upload"
--   on storage.objects for insert
--   with check ( bucket_id = 'gallery-photos' );
--
-- create policy "gallery_photos_anon_delete"
--   on storage.objects for delete
--   using ( bucket_id = 'gallery-photos' );
