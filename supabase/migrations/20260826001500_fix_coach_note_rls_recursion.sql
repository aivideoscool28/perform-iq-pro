/*
=============================================================================
FIX COACH NOTES <-> RECIPIENT RLS RECURSION
=============================================================================
*/

drop policy if exists "Athletes can view shared coach notes"
on public.coach_notes;

drop policy if exists "Coaches can view recipients for own notes"
on public.coach_note_recipients;

drop policy if exists "Coaches can add recipients to own notes"
on public.coach_note_recipients;

drop policy if exists "Coaches can remove recipients from own notes"
on public.coach_note_recipients;

drop policy if exists "Athletes can view their note recipient rows"
on public.coach_note_recipients;


/*
-----------------------------------------------------------------------------
HELPER 1
Does the current authenticated user own this coach note?
-----------------------------------------------------------------------------
*/

create or replace function public.current_user_owns_coach_note(
  p_note_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.coach_notes
    where
      coach_notes.id = p_note_id
      and coach_notes.coach_id = auth.uid()
  );
$$;


/*
-----------------------------------------------------------------------------
HELPER 2
Is the current authenticated athlete a recipient of this note?
-----------------------------------------------------------------------------
*/

create or replace function public.current_user_is_coach_note_recipient(
  p_note_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.coach_note_recipients
    where
      coach_note_recipients.note_id = p_note_id
      and coach_note_recipients.athlete_id = auth.uid()
  );
$$;


/*
-----------------------------------------------------------------------------
HELPER 3
Can this coach assign this particular athlete to this note?
-----------------------------------------------------------------------------
*/

create or replace function public.current_coach_can_assign_note_recipient(
  p_note_id uuid,
  p_athlete_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    exists (
      select 1
      from public.coach_notes
      where
        coach_notes.id = p_note_id
        and coach_notes.coach_id = auth.uid()
    )
    and
    exists (
      select 1
      from public.coach_athletes
      where
        coach_athletes.coach_id = auth.uid()
        and coach_athletes.athlete_id = p_athlete_id
    );
$$;


/*
-----------------------------------------------------------------------------
REBUILD NOTE RECIPIENT POLICIES
-----------------------------------------------------------------------------
*/

create policy "Coaches can view recipients for own notes"
on public.coach_note_recipients
for select
to authenticated
using (
  public.current_user_owns_coach_note(note_id)
);


create policy "Coaches can add recipients to own notes"
on public.coach_note_recipients
for insert
to authenticated
with check (
  public.current_coach_can_assign_note_recipient(
    note_id,
    athlete_id
  )
);


create policy "Coaches can remove recipients from own notes"
on public.coach_note_recipients
for delete
to authenticated
using (
  public.current_user_owns_coach_note(note_id)
);


create policy "Athletes can view their note recipient rows"
on public.coach_note_recipients
for select
to authenticated
using (
  athlete_id = auth.uid()
);


/*
-----------------------------------------------------------------------------
ATHLETE NOTE READ POLICY
-----------------------------------------------------------------------------
*/

create policy "Athletes can view shared coach notes"
on public.coach_notes
for select
to authenticated
using (
  visibility = 'Athlete'
  and public.current_user_is_coach_note_recipient(id)
);


grant execute
on function public.current_user_owns_coach_note(uuid)
to authenticated;

grant execute
on function public.current_user_is_coach_note_recipient(uuid)
to authenticated;

grant execute
on function public.current_coach_can_assign_note_recipient(uuid, uuid)
to authenticated;
