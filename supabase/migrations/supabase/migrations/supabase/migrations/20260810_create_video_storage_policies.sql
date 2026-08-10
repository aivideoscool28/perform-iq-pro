-- =========================================================
-- ATHLETIC IQ — VIDEO STORAGE POLICIES
-- Bucket: athlete-videos
-- Folder structure: user_id/file.mp4
-- =========================================================


-- Athlete can view only their own videos
create policy "Users can view own athlete videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'athlete-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- Athlete can upload only into their own folder
create policy "Users can upload own athlete videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'athlete-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- Athlete can update only their own videos
create policy "Users can update own athlete videos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'athlete-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'athlete-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- Athlete can delete only their own videos
create policy "Users can delete own athlete videos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'athlete-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);