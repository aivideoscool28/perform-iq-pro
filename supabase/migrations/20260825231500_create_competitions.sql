create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),

  coach_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  competition_date date not null,

  location text,
  venue text,

  competition_type text not null default 'MEETING'
    check (
      competition_type in (
        'MEETING',
        'CHAMPIONSHIP'
      )
    ),

  priority text,

  phase text not null default 'Competition',

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.competition_entries (
  id uuid primary key default gen_random_uuid(),

  competition_id uuid not null
    references public.competitions(id)
    on delete cascade,

  athlete_id uuid not null
    references auth.users(id)
    on delete cascade,

  events text[] not null default '{}',

  goal text,
  result text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (
    competition_id,
    athlete_id
  )
);


create index if not exists competitions_coach_date_idx
  on public.competitions (
    coach_id,
    competition_date
  );


create index if not exists competition_entries_competition_idx
  on public.competition_entries (
    competition_id
  );


create index if not exists competition_entries_athlete_idx
  on public.competition_entries (
    athlete_id
  );


alter table public.competitions
  enable row level security;

alter table public.competition_entries
  enable row level security;


/*
=============================================================================
COMPETITIONS

Coach owns and manages the competition.

An athlete may read a competition only when that athlete has an entry.
=============================================================================
*/

create policy "Coaches can view own competitions"
on public.competitions
for select
to authenticated
using (
  coach_id = auth.uid()
);


create policy "Coaches can create own competitions"
on public.competitions
for insert
to authenticated
with check (
  coach_id = auth.uid()
);


create policy "Coaches can update own competitions"
on public.competitions
for update
to authenticated
using (
  coach_id = auth.uid()
)
with check (
  coach_id = auth.uid()
);


create policy "Coaches can delete own competitions"
on public.competitions
for delete
to authenticated
using (
  coach_id = auth.uid()
);


create policy "Athletes can view entered competitions"
on public.competitions
for select
to authenticated
using (
  exists (
    select 1
    from public.competition_entries
    where
      competition_entries.competition_id = competitions.id
      and competition_entries.athlete_id = auth.uid()
  )
);


/*
=============================================================================
COMPETITION ENTRIES

Coach can manage entries belonging to competitions they own.

An athlete can read only their own entry.
=============================================================================
*/

create policy "Coaches can view entries for own competitions"
on public.competition_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.competitions
    where
      competitions.id = competition_entries.competition_id
      and competitions.coach_id = auth.uid()
  )
);


create policy "Coaches can create entries for own connected athletes"
on public.competition_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.competitions
    where
      competitions.id = competition_entries.competition_id
      and competitions.coach_id = auth.uid()
  )
  and
  exists (
    select 1
    from public.coach_athletes
    where
      coach_athletes.coach_id = auth.uid()
      and coach_athletes.athlete_id = competition_entries.athlete_id
  )
);


create policy "Coaches can update entries for own competitions"
on public.competition_entries
for update
to authenticated
using (
  exists (
    select 1
    from public.competitions
    where
      competitions.id = competition_entries.competition_id
      and competitions.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.competitions
    where
      competitions.id = competition_entries.competition_id
      and competitions.coach_id = auth.uid()
  )
);


create policy "Coaches can delete entries for own competitions"
on public.competition_entries
for delete
to authenticated
using (
  exists (
    select 1
    from public.competitions
    where
      competitions.id = competition_entries.competition_id
      and competitions.coach_id = auth.uid()
  )
);


create policy "Athletes can view own competition entries"
on public.competition_entries
for select
to authenticated
using (
  athlete_id = auth.uid()
);
