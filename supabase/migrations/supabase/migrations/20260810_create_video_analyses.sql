create table if not exists public.video_analyses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  storage_path text not null,

  discipline text,

  athlete_request text,

  ai_analysis jsonb,

  overall_rating numeric,

  coach_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_analyses enable row level security;

create policy "Users can view own video analyses"
on public.video_analyses
for select
using (auth.uid() = user_id);

create policy "Users can create own video analyses"
on public.video_analyses
for insert
with check (auth.uid() = user_id);

create policy "Users can update own video analyses"
on public.video_analyses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own video analyses"
on public.video_analyses
for delete
using (auth.uid() = user_id);

create index if not exists video_analyses_user_id_idx
on public.video_analyses(user_id);

create index if not exists video_analyses_created_at_idx
on public.video_analyses(created_at desc);