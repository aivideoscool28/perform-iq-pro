create table if not exists public.coach_note_recipients (
  id uuid primary key default gen_random_uuid(),

  note_id uuid not null
    references public.coach_notes(id)
    on delete cascade,

  athlete_id uuid not null
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  unique (
    note_id,
    athlete_id
  )
);

create index if not exists coach_note_recipients_note_idx
  on public.coach_note_recipients (
    note_id
  );

create index if not exists coach_note_recipients_athlete_idx
  on public.coach_note_recipients (
    athlete_id
  );

alter table public.coach_note_recipients
  enable row level security;

create policy "Coaches can view recipients for own notes"
on public.coach_note_recipients
for select
to authenticated
using (
  exists (
    select 1
    from public.coach_notes
    where
      coach_notes.id = coach_note_recipients.note_id
      and coach_notes.coach_id = auth.uid()
  )
);

create policy "Coaches can add recipients to own notes"
on public.coach_note_recipients
for insert
to authenticated
with check (
  exists (
    select 1
    from public.coach_notes
    where
      coach_notes.id = coach_note_recipients.note_id
      and coach_notes.coach_id = auth.uid()
  )
  and
  exists (
    select 1
    from public.coach_athletes
    where
      coach_athletes.coach_id = auth.uid()
      and coach_athletes.athlete_id = coach_note_recipients.athlete_id
  )
);

create policy "Coaches can remove recipients from own notes"
on public.coach_note_recipients
for delete
to authenticated
using (
  exists (
    select 1
    from public.coach_notes
    where
      coach_notes.id = coach_note_recipients.note_id
      and coach_notes.coach_id = auth.uid()
  )
);

create policy "Athletes can view their note recipient rows"
on public.coach_note_recipients
for select
to authenticated
using (
  athlete_id = auth.uid()
);
