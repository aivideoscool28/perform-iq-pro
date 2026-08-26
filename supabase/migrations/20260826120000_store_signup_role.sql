create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role :=
    coalesce(
      new.raw_user_meta_data->>'role',
      'athlete'
    );

  if requested_role not in ('athlete', 'coach') then
    requested_role := 'athlete';
  end if;

  insert into public.profiles (
    id,
    display_name,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      'Athlete'
    ),
    requested_role
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    role = excluded.role;

  return new;
end;
$$;
