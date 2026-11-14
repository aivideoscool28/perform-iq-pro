begin;
-- Review and test only: applying this file to production requires separate approval.
-- All privileges are enforced at the database boundary, including direct PostgREST calls.
create or replace function public.is_coach_for(p_athlete uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.coach_athletes ca
    join public.profiles c on c.id=ca.coach_id join public.profiles a on a.id=ca.athlete_id
    where ca.coach_id=auth.uid() and ca.athlete_id=p_athlete
      and c.role='coach' and a.share_with_coach=true);
$$;
revoke all on function public.is_coach_for(uuid) from public;
grant execute on function public.is_coach_for(uuid) to authenticated;
create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='coach');
$$;
revoke all on function public.is_coach() from public;
grant execute on function public.is_coach() to authenticated;

-- Remove permissive legacy policies on the affected public tables. PostgreSQL ORs
-- policies, so adding a strict policy without removing old ones is insufficient.
do $$ declare t text; p record; begin
 foreach t in array array['profiles','friendships','coach_athletes','planned_workouts','training_sessions','coach_calendar_events','coach_exercise_library','coach_training_templates','daily_checkins','regeneration_checkins','workouts','analysis_boards','video_analyses','coach_notes','coach_note_recipients','competitions','competition_entries','ai_conversations','ai_messages','athlete_questions','gear_profile','gear_logs'] loop
  execute format('alter table public.%I enable row level security',t);
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
  execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;

grant select,update on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_coach_for(id));
create policy profile_write on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create or replace function public.protect_profile_identity() returns trigger
language plpgsql set search_path=public,pg_temp as $$ begin
 if current_user in ('authenticated','anon') and
   (new.id is distinct from old.id or new.role is distinct from old.role or new.invite_code is distinct from old.invite_code
     or new.current_streak is distinct from old.current_streak or new.longest_streak is distinct from old.longest_streak) then
  raise exception 'Protected profile fields';
 end if;
 if not exists(select 1 from pg_timezone_names where name=new.timezone) then raise exception 'Invalid timezone'; end if;
 return new;
end $$;
drop trigger if exists release_protect_profile on public.profiles;
create trigger release_protect_profile before update on public.profiles for each row execute function public.protect_profile_identity();

-- Signup choice is legitimate; subsequent role changes are privileged operations.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin
 insert into public.profiles(id,display_name,role,timezone,ai_consent,share_with_coach)
 values(new.id,coalesce(new.raw_user_meta_data->>'display_name','Athlete'),
 case when new.raw_user_meta_data->>'role'='coach' then 'coach' else 'athlete' end,'UTC',false,true);
 return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

grant select,delete on public.coach_athletes to authenticated;
create policy link_read on public.coach_athletes for select to authenticated using(athlete_id=auth.uid() or (coach_id=auth.uid() and public.is_coach_for(athlete_id)));
create policy link_revoke on public.coach_athletes for delete to authenticated using(athlete_id=auth.uid());
-- The athlete enters a coach's private invite code to consent to the relationship.
create or replace function public.connect_coach(p_code text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare target uuid; begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 select id into target from public.profiles where invite_code=lower(p_code) and role='coach';
 if target is null or target=auth.uid() then raise exception 'Invalid coach invite'; end if;
 insert into public.coach_athletes(coach_id,athlete_id) values(target,auth.uid()) on conflict(coach_id,athlete_id) do nothing;
 return target;
end $$;
revoke all on function public.connect_coach(text) from public; grant execute on function public.connect_coach(text) to authenticated;

grant select,delete on public.friendships to authenticated;
create policy friendship_read on public.friendships for select to authenticated using(user_id=auth.uid() or friend_id=auth.uid());
create policy friendship_delete on public.friendships for delete to authenticated using(user_id=auth.uid() or friend_id=auth.uid());
-- Possession of the private invite code is the invitation. No direct INSERT grant.
create or replace function public.accept_invite(invite_code text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare target uuid; begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 select id into target from public.profiles where profiles.invite_code=lower(accept_invite.invite_code);
 if target is null or target=auth.uid() then raise exception 'Invalid invite'; end if;
 insert into public.friendships(user_id,friend_id,status) values(auth.uid(),target,'accepted'),(target,auth.uid(),'accepted') on conflict(user_id,friend_id) do nothing;
 return target;
end $$;
revoke all on function public.accept_invite(text) from public; grant execute on function public.accept_invite(text) to authenticated;
create or replace function public.fetch_friend_profiles() returns table(id uuid,display_name text,avatar_url text,current_streak numeric,longest_streak numeric,last_workout_date date)
language sql stable security definer set search_path=public,pg_temp as $$
 select p.id,p.display_name,p.avatar_url,p.current_streak::numeric,p.longest_streak::numeric,p.last_workout_date from public.profiles p
 where exists(select 1 from public.friendships f where f.user_id=auth.uid() and f.friend_id=p.id and f.status='accepted');
$$;
revoke all on function public.fetch_friend_profiles() from public; grant execute on function public.fetch_friend_profiles() to authenticated;

-- Own data plus explicit coach relationship. Video additionally requires per-video consent.
do $$ declare t text; begin
 foreach t in array array['daily_checkins','regeneration_checkins','workouts','analysis_boards','video_analyses'] loop
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy own_data on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
  execute format('create policy coach_read on public.%I for select to authenticated using(public.is_coach_for(user_id)%s)',t,case when t='video_analyses' then ' and shared_with_coach=true' else '' end);
 end loop;
end $$;
-- Prevent an analysis row claiming another athlete's workout.
create or replace function public.validate_analysis_owner() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin
 if not exists(select 1 from public.workouts where id=new.workout_id and user_id=new.user_id) then raise exception 'Invalid analysis workout'; end if; return new; end $$;
drop trigger if exists release_analysis_owner on public.analysis_boards;
create trigger release_analysis_owner before insert or update on public.analysis_boards for each row execute function public.validate_analysis_owner();

do $$ declare t text; begin
 foreach t in array array['training_sessions','coach_calendar_events','coach_training_templates','competitions','coach_notes'] loop
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy coach_owner on public.%I for all to authenticated using(coach_id=auth.uid() and public.is_coach()) with check(coach_id=auth.uid() and public.is_coach())',t);
 end loop;
end $$;
grant select,insert,update,delete on public.coach_exercise_library to authenticated;
create policy exercise_read on public.coach_exercise_library for select to authenticated using(public.is_coach() and (coach_id=auth.uid() or (coach_id is null and source='system')));
create policy exercise_owner on public.coach_exercise_library for all to authenticated using(coach_id=auth.uid() and public.is_coach()) with check(coach_id=auth.uid() and public.is_coach());

-- Linked athlete assignment must hold even for direct browser writes.
grant select,insert,update,delete on public.planned_workouts to authenticated;
create policy plan_athlete_read on public.planned_workouts for select to authenticated using(athlete_id=auth.uid() and is_published=true);
create policy plan_coach on public.planned_workouts for all to authenticated using(coach_id=auth.uid() and public.is_coach_for(athlete_id)) with check(coach_id=auth.uid() and public.is_coach_for(athlete_id));
create or replace function public.complete_planned_workout(p_workout_id uuid,p_status text) returns public.planned_workouts
language plpgsql security definer set search_path=public,pg_temp as $$ declare result public.planned_workouts; begin
 if auth.uid() is null or p_status is null or p_status not in ('completed','changed','not_completed') then raise exception 'Invalid completion'; end if;
 update public.planned_workouts set status=p_status,completed_at=case when p_status='completed' then coalesce(completed_at,now()) else null end,updated_at=now()
 where id=p_workout_id and athlete_id=auth.uid() and is_published=true returning * into result;
 if not found then raise exception 'Workout unavailable'; end if; return result;
end $$;
revoke all on function public.complete_planned_workout(uuid,text) from public; grant execute on function public.complete_planned_workout(uuid,text) to authenticated;

-- One transaction, serialized per session; ON CONFLICT preserves completion fields.
create or replace function public.publish_training_session(p_session_id uuid) returns public.training_sessions
language plpgsql security definer set search_path=public,pg_temp as $$ declare master public.training_sessions; begin
 if not public.is_coach() then raise exception 'Coach access required'; end if;
 select * into master from public.training_sessions where id=p_session_id and coach_id=auth.uid() for update;
 if not found then raise exception 'Session unavailable'; end if;
 if not exists(select 1 from public.coach_athletes where coach_id=auth.uid() and public.is_coach_for(athlete_id)) then raise exception 'No connected athletes'; end if;
 insert into public.planned_workouts(athlete_id,coach_id,training_session_id,workout_date,title,discipline,duration_minutes,session_goal,coach_note,exercises,status,source,is_published)
 select athlete_id,auth.uid(),master.id,master.session_date,master.title,master.discipline,master.duration_minutes,master.session_goal,master.coach_note,master.exercises,'planned','coach',true
 from public.coach_athletes where coach_id=auth.uid() and public.is_coach_for(athlete_id)
 on conflict(training_session_id,athlete_id) where training_session_id is not null do update set
 workout_date=excluded.workout_date,title=excluded.title,discipline=excluded.discipline,duration_minutes=excluded.duration_minutes,
 session_goal=excluded.session_goal,coach_note=excluded.coach_note,exercises=excluded.exercises,is_published=true,updated_at=now();
 update public.training_sessions set status='published',updated_at=now() where id=master.id returning * into master;
 return master;
end $$;
revoke all on function public.publish_training_session(uuid) from public; grant execute on function public.publish_training_session(uuid) to authenticated;

-- Shared notes and entries must belong to the current coach and a consenting athlete.
grant select,insert,delete on public.coach_note_recipients to authenticated;
create policy recipient_coach on public.coach_note_recipients for all to authenticated using(exists(select 1 from public.coach_notes n where n.id=note_id and n.coach_id=auth.uid()) and public.is_coach_for(athlete_id)) with check(exists(select 1 from public.coach_notes n where n.id=note_id and n.coach_id=auth.uid()) and public.is_coach_for(athlete_id));
create policy recipient_athlete on public.coach_note_recipients for select to authenticated using(athlete_id=auth.uid());
-- SECURITY DEFINER avoids notes/recipient RLS recursion.
create or replace function public.is_note_recipient(p_note_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.coach_note_recipients where note_id=p_note_id and athlete_id=auth.uid()); $$;
revoke all on function public.is_note_recipient(uuid) from public; grant execute on function public.is_note_recipient(uuid) to authenticated;
create policy note_athlete on public.coach_notes for select to authenticated using(public.is_note_recipient(id) or (athlete_id=auth.uid() and visibility='Athlete'));
grant select,insert,update,delete on public.competition_entries to authenticated;
create policy entry_coach on public.competition_entries for all to authenticated using(exists(select 1 from public.competitions c where c.id=competition_id and c.coach_id=auth.uid()) and public.is_coach_for(athlete_id)) with check(exists(select 1 from public.competitions c where c.id=competition_id and c.coach_id=auth.uid()) and public.is_coach_for(athlete_id));
create policy entry_athlete on public.competition_entries for select to authenticated using(athlete_id=auth.uid());
create or replace function public.is_competition_entrant(p_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.competition_entries where competition_id=p_id and athlete_id=auth.uid()); $$;
revoke all on function public.is_competition_entrant(uuid) from public; grant execute on function public.is_competition_entrant(uuid) to authenticated;
create policy competition_athlete on public.competitions for select to authenticated using(public.is_competition_entrant(id));

do $$ declare t text; begin
 foreach t in array array['ai_conversations','ai_messages','gear_profile','gear_logs'] loop
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy private_owner on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
 end loop;
end $$;
-- A message must reference an owned conversation, not merely set its own user_id.
create or replace function public.validate_chat_owner() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin
 if not exists(select 1 from public.ai_conversations where id=new.conversation_id and user_id=new.user_id) then raise exception 'Invalid conversation'; end if; return new; end $$;
drop trigger if exists release_chat_owner on public.ai_messages;
create trigger release_chat_owner before insert or update on public.ai_messages for each row execute function public.validate_chat_owner();

create table if not exists public.ai_usage(user_id uuid not null, bucket timestamptz not null, calls integer not null, primary key(user_id,bucket));
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from public,anon,authenticated;
create or replace function public.consume_ai_usage() returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare current_bucket timestamptz:=date_trunc('hour',now()); current_calls integer; begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 if not exists(select 1 from public.profiles where id=auth.uid() and ai_consent=true) then raise exception 'AI_CONSENT_REQUIRED'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if coalesce((select sum(calls) from public.ai_usage where user_id=auth.uid() and bucket>=date_trunc('day',now())),0)>=100 then raise exception 'AI_RATE_LIMIT'; end if;
 insert into public.ai_usage values(auth.uid(),current_bucket,1) on conflict(user_id,bucket) do update set calls=ai_usage.calls+1 returning calls into current_calls;
 if current_calls>20 then raise exception 'AI_RATE_LIMIT'; end if;
end $$;
revoke all on function public.consume_ai_usage() from public; grant execute on function public.consume_ai_usage() to authenticated;

grant select,insert,update on public.athlete_questions to authenticated;
create policy question_athlete on public.athlete_questions for all to authenticated using(athlete_id=auth.uid()) with check(athlete_id=auth.uid());
create policy question_coach on public.athlete_questions for select to authenticated using(coach_id=auth.uid() and public.is_coach_for(athlete_id));

create or replace function public.list_my_coaches() returns table(coach_id uuid,display_name text)
language sql stable security definer set search_path=public,pg_temp as $$
 select ca.coach_id,p.display_name from public.coach_athletes ca join public.profiles p on p.id=ca.coach_id where ca.athlete_id=auth.uid();
$$;
revoke all on function public.list_my_coaches() from public;grant execute on function public.list_my_coaches() to authenticated;

commit;
