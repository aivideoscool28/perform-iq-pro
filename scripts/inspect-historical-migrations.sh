#!/usr/bin/env bash
set -euo pipefail
# Historical reproduction ONLY inside the disposable local container.
container=aether-release-test
sql(){ docker --host=unix:///var/run/docker.sock exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 "$@"; }
sql <<'SQL'
drop database if exists aether_history;
create database aether_history;
SQL
sql -d aether_history <<'SQL'
create schema auth;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
SQL
while IFS= read -r file; do
 echo "Historical migration: $file"
 if ! sql -d aether_history < "$file"; then
  echo "HISTORY REPLAY BLOCKED AT $file"
  exit 1
 fi
done < <(find supabase/migrations -maxdepth 1 -type f -name '*.sql' ! -name '20261114*' | sort)
