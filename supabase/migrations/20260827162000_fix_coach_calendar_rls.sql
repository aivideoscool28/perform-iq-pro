alter table public.coach_calendar_events
enable row level security;

drop policy if exists "Coaches can view own calendar events"
on public.coach_calendar_events;

drop policy if exists "Coaches can create own calendar events"
on public.coach_calendar_events;

drop policy if exists "Coaches can update own calendar events"
on public.coach_calendar_events;

drop policy if exists "Coaches can delete own calendar events"
on public.coach_calendar_events;


create policy "Coaches can view own calendar events"
on public.coach_calendar_events
for select
to authenticated
using (
  coach_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'coach'
  )
);


create policy "Coaches can create own calendar events"
on public.coach_calendar_events
for insert
to authenticated
with check (
  coach_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'coach'
  )
);


create policy "Coaches can update own calendar events"
on public.coach_calendar_events
for update
to authenticated
using (
  coach_id = auth.uid()
)
with check (
  coach_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'coach'
  )
);


create policy "Coaches can delete own calendar events"
on public.coach_calendar_events
for delete
to authenticated
using (
  coach_id = auth.uid()
);
