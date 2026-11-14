begin;
-- Keep note assignment scoped even when a coach calls PostgREST directly.
create or replace function public.validate_note_assignment() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin
 if new.athlete_id is not null and not public.is_coach_for(new.athlete_id) then raise exception 'Athlete is not connected or has revoked sharing'; end if;
 return new;
end $$;
drop trigger if exists release_note_assignment on public.coach_notes;
create trigger release_note_assignment before insert or update on public.coach_notes for each row execute function public.validate_note_assignment();

-- Original nested storage SQL is retained as historical evidence. This forward
-- migration repairs the affected bucket while leaving unrelated buckets alone.
do $$ declare p record; begin
 if to_regclass('storage.objects') is null then raise exception 'Supabase storage schema required'; end if;
 for p in select policyname from pg_policies where schemaname='storage' and tablename='objects'
   and (coalesce(qual,'')||coalesce(with_check,'')) like '%athlete-videos%' loop
  execute format('drop policy %I on storage.objects',p.policyname);
 end loop;
end $$;
create policy release_video_owner_read on storage.objects for select to authenticated using(bucket_id='athlete-videos' and split_part(name,'/',1)=auth.uid()::text);
create policy release_video_owner_insert on storage.objects for insert to authenticated with check(bucket_id='athlete-videos' and split_part(name,'/',1)=auth.uid()::text);
create policy release_video_owner_update on storage.objects for update to authenticated using(bucket_id='athlete-videos' and split_part(name,'/',1)=auth.uid()::text) with check(bucket_id='athlete-videos' and split_part(name,'/',1)=auth.uid()::text);
create policy release_video_owner_delete on storage.objects for delete to authenticated using(bucket_id='athlete-videos' and split_part(name,'/',1)=auth.uid()::text);
create policy release_video_coach_read on storage.objects for select to authenticated using(
 bucket_id='athlete-videos' and exists(select 1 from public.video_analyses va where va.storage_path=storage.objects.name and va.shared_with_coach=true and public.is_coach_for(va.user_id)));
-- A private bucket is required. This changes configuration only when separately approved.
update storage.buckets set public=false where id='athlete-videos';

create or replace function public.validate_video_path() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin
 if split_part(new.storage_path,'/',1)<>new.user_id::text then raise exception 'Video must belong to athlete folder'; end if;
 return new;
end $$;
drop trigger if exists release_video_path on public.video_analyses;
create trigger release_video_path before insert or update on public.video_analyses for each row execute function public.validate_video_path();

commit;
