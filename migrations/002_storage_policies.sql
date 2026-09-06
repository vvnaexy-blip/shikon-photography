-- ============================================================================
-- SHIKO PHOTOGRAPHY — Storage Bucket Policies
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Fixes: "new row violates row-level security policy" on photo uploads.
--
-- IMPORTANT:
--   • Do NOT include "alter table storage.objects enable row level security"
--     — that table is owned by Supabase and will throw "must be owner".
--   • RLS is already enabled on storage.objects by Supabase infrastructure.
--   • The gallery-photos bucket already exists; this only creates policies.
-- ============================================================================

-- ─── Drop old policies if they exist (safe to re-run) ────────────────────────
drop policy if exists "gallery_photos_public_read"  on storage.objects;
drop policy if exists "gallery_photos_anon_upload"  on storage.objects;
drop policy if exists "gallery_photos_anon_update"  on storage.objects;
drop policy if exists "gallery_photos_anon_delete"  on storage.objects;

-- ─── 1. Public READ — anyone can view images (public gallery URLs) ─────────── 
create policy "gallery_photos_public_read"
  on storage.objects
  for select
  using ( bucket_id = 'gallery-photos' );

-- ─── 2. Allow INSERT (upload) for anon role ───────────────────────────────────
-- Needed so the Admin dashboard can upload photos without user auth.
-- Restrict to authenticated admin once auth is implemented.
create policy "gallery_photos_anon_upload"
  on storage.objects
  for insert
  with check ( bucket_id = 'gallery-photos' );

-- ─── 3. Allow UPDATE for anon role ───────────────────────────────────────────
create policy "gallery_photos_anon_update"
  on storage.objects
  for update
  using ( bucket_id = 'gallery-photos' );

-- ─── 4. Allow DELETE for anon role ───────────────────────────────────────────
-- Needed when admin removes a photo.
create policy "gallery_photos_anon_delete"
  on storage.objects
  for delete
  using ( bucket_id = 'gallery-photos' );

-- ─── Done ────────────────────────────────────────────────────────────────────
-- After running this SQL:
--   ✓ Admin can upload photos → gallery-photos bucket
--   ✓ Public gallery URLs load in browsers and Next.js Image component
--   ✓ Admin can delete photos
--   ✓ Client galleries remain open with no password
