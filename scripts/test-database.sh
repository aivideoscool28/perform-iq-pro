#!/usr/bin/env bash
set -euo pipefail
# Fixed local disposable container only. Never accepts a remote database URL.
container=aether-release-test
run_sql() { docker --host=unix:///var/run/docker.sock exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 "$@"; }
run_sql <<'SQL'
drop database if exists aether_test;
create database aether_test;
SQL
run_sql -d aether_test <<'SQL'
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema auth;
create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create schema storage;
create table storage.buckets(id text primary key, name text, public boolean default false);
insert into storage.buckets values('athlete-videos','athlete-videos',false);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated;
grant select,insert,update,delete on storage.objects to authenticated;
grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
SQL
for migration in supabase/migrations/20261114*.sql; do
  echo "Testing $migration"
  run_sql -d aether_test < "$migration"
done
if [ -f tests/release/database.sql ]; then run_sql -d aether_test < tests/release/database.sql; fi

run_sql -d aether_test <<'SQL'
do $$ declare item record; begin
 for item in select conrelid::regclass as table_name,conname from pg_constraint
 where contype='f' and not convalidated and conname like 'release_fk_%' loop
  execute format('alter table %s validate constraint %I',item.table_name,item.conname);
 end loop;
end $$;
SQL
