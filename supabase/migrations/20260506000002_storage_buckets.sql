-- Public bucket for tool logos and blog post images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do nothing;

create policy "images_public_read" on storage.objects for select using (bucket_id = 'images');
create policy "images_auth_upload" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "images_auth_delete" on storage.objects for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
