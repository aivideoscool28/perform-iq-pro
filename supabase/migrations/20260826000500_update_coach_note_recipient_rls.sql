drop policy if exists "Athletes can view shared coach notes"
on public.coach_notes;

create policy "Athletes can view shared coach notes"
on public.coach_notes
for select
to authenticated
using (
  visibility = 'Athlete'
  and exists (
    select 1
    from public.coach_note_recipients
    where
      coach_note_recipients.note_id = coach_notes.id
      and coach_note_recipients.athlete_id = auth.uid()
  )
);
