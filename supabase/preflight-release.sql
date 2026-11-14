-- READ ONLY. Run manually against the intended Supabase project before approving
-- any migration. Contains no schema changes, policy changes, or data changes.
begin transaction read only;
select version,name from supabase_migrations.schema_migrations order by version;
select schemaname,tablename,policyname,cmd,roles,qual,with_check
from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;
select table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
select tablename,indexname,indexdef from pg_indexes where schemaname='public' order by tablename,indexname;
select c.conrelid::regclass as table_name,c.conname,c.convalidated,pg_get_constraintdef(c.oid) as definition
from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public' order by table_name,c.conname;
select p.proname,pg_get_function_identity_arguments(p.oid) as arguments,p.prosecdef,p.proacl
from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by p.proname;
select id,public,file_size_limit,allowed_mime_types from storage.buckets where id in ('athlete-videos','avatars');
-- Counts only; no personal rows are exported. Unique indexes fail closed if
-- duplicates exist. Do not delete duplicates automatically.
do $$ declare item record; duplicates bigint; begin
 for item in select * from (values
 ('daily_checkins','user_id,checkin_date'),('regeneration_checkins','user_id,checkin_date'),
 ('coach_athletes','coach_id,athlete_id'),('friendships','user_id,friend_id'),
 ('analysis_boards','workout_id')) as items(table_name,key_columns) loop
 if to_regclass('public.'||item.table_name) is not null then
 execute format('select count(*) from (select %s from public.%I group by %s having count(*)>1) d',item.key_columns,item.table_name,item.key_columns) into duplicates;
 raise notice '% duplicate groups: %',item.table_name,duplicates;
 end if;
 end loop;
end $$;
rollback;
