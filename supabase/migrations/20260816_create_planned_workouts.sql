create table if not exists public.planned_workouts (
  id uuid primary key default gen_random_uuid(),

  athlete_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid references auth.users(id) on delete set null,

  workout_date date not null,

  title text not null,
  discipline text,
  duration_minutes integer,

  session_goal text,
  coach_note text,

  exercises jsonb not null default '[]'::jsonb,

  status text not null default 'planned'
    check (status in ('planned', 'completed', 'changed', 'not_completed')),

  source text not null default 'coach'
    check (source = 'coach'),

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planned_workouts_athlete_date_idx
  on public.planned_workouts (athlete_id, workout_date);

create index if not exists planned_workouts_coach_date_idx
  on public.planned_workouts (coach_id, workout_date);

alter table public.planned_workouts enable row level security;

create policy "Athletes can view own planned workouts"
on public.planned_workouts
for select
using (auth.uid() = athlete_id);

create policy "Athletes can update own planned workouts"
on public.planned_workouts
for update
using (auth.uid() = athlete_id)
with check (auth.uid() = athlete_id);

create policy "Coaches can view workouts they created"
on public.planned_workouts
for select
using (auth.uid() = coach_id);

create policy "Coaches can create planned workouts"
on public.planned_workouts
for insert
with check (auth.uid() = coach_id);

create policy "Coaches can update workouts they created"
on public.planned_workouts
for update
using (auth.uid() = coach_id)
with check (auth.uid() = coach_id);

create policy "Coaches can delete workouts they created"
on public.planned_workouts
for delete
using (auth.uid() = coach_id);
