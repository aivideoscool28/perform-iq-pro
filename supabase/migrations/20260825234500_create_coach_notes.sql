create table if not exists public.coach_notes (
  id uuid primary key default gen_random_uuid(),

  coach_id uuid not null
    references auth.users(id)
    on delete cascade,

  athlete_id uuid
    references auth.users(id)
    on delete cascade,

  kind text not null
    check (
      kind in (
        'note',
        'measurement',
        'follow-up'
      )
    ),

  note_type text,

  content text not null,

  visibility text not null default 'Private'
    check (
      visibility in (
        'Private',
        'Athlete',
        'Staff'
      )
    ),

  pinned boolean not null default false,

  linked_session text,

  measurement_type text,
  measurement_value numeric,
  measurement_unit text,
  measurement_method text,

  follow_up_when text,
  follow_up_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists coach_notes_coach_created_idx
  on public.coach_notes (
    coach_id,
    created_at desc
  );


create index if not exists coach_notes_athlete_idx
  on public.coach_notes (
    athlete_id
  );


alter table public.coach_notes
  enable row level security;


/*
=============================================================================
COACH ACCESS
=============================================================================
*/

create policy "Coaches can view own notes"
on public.coach_notes
for select
to authenticated
using (
  coach_id = auth.uid()
);


create policy "Coaches can create notes for connected athletes"
on public.coach_notes
for insert
to authenticated
with check (
  coach_id = auth.uid()
  and
  (
    athlete_id is null
    or exists (
      select 1
      from public.coach_athletes
      where
        coach_athletes.coach_id = auth.uid()
        and coach_athletes.athlete_id = coach_notes.athlete_id
    )
  )
);


create policy "Coaches can update own notes"
on public.coach_notes
for update
to authenticated
using (
  coach_id = auth.uid()
)
with check (
  coach_id = auth.uid()
);


create policy "Coaches can delete own notes"
on public.coach_notes
for delete
to authenticated
using (
  coach_id = auth.uid()
);


/*
=============================================================================
ATHLETE READ ACCESS

Only notes explicitly shared with that athlete.
=============================================================================
*/

create policy "Athletes can view shared coach notes"
on public.coach_notes
for select
to authenticated
using (
  athlete_id = auth.uid()
  and visibility = 'Athlete'
);
