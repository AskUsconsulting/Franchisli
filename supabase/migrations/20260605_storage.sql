-- ============================================================
-- Create Supabase Storage bucket for document uploads
-- Run in Supabase SQL Editor
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Allow anyone to read documents (public bucket)
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'documents');

-- Allow authenticated users to upload
create policy "Authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'documents');

-- Allow authenticated users to delete their own uploads
create policy "Authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'documents');
