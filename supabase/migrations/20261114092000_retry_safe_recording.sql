begin;
alter table public.workouts add column if not exists analysis_status text not null default 'pending';
-- Stable identity is reserved before any AI call. Retrying never inserts twice.
create or replace function public.record_workout(p_request_id uuid,p_text text,p_date date) returns public.workouts
language plpgsql security definer set search_path=public,pg_temp as $$
declare result public.workouts; expected_date date; begin
 if auth.uid() is null or p_text is null or length(trim(p_text)) not between 2 and 2000 or p_request_id is null then raise exception 'Invalid workout'; end if;
 select (now() at time zone timezone)::date into expected_date from public.profiles where id=auth.uid();
 if p_date is null or expected_date is null or p_date<>expected_date then raise exception 'Invalid workout date'; end if;
 insert into public.workouts(user_id,request_id,workout_date,raw_input,summary,exercises,analysis_status)
 values(auth.uid(),p_request_id,p_date,p_text,left(p_text,200),'[]','pending')
 on conflict(user_id,request_id) where request_id is not null do nothing;
 select * into result from public.workouts where user_id=auth.uid() and request_id=p_request_id;
 if result.raw_input is distinct from p_text then raise exception 'Idempotency key reused for different input'; end if;
 return result;
end $$;
revoke all on function public.record_workout(uuid,text,date) from public;
grant execute on function public.record_workout(uuid,text,date) to authenticated;

create or replace function public.record_checkin(p_payload jsonb,p_date date) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare saved public.daily_checkins; workout public.workouts; expected_date date; clean jsonb; column_names text; value_names text; update_names text; begin
 if auth.uid() is null or octet_length(p_payload::text)>16000 then raise exception 'Invalid check-in'; end if;
 select (now() at time zone timezone)::date into expected_date from public.profiles where id=auth.uid();
 if p_date is null or expected_date is null or p_date<>expected_date then raise exception 'Invalid check-in date'; end if;
 if (p_payload->>'is_rest_day')::boolean is null then raise exception 'Rest day required'; end if;
 if p_payload ? 'rpe' and (p_payload->>'rpe')::numeric not between 1 and 10 then raise exception 'Invalid RPE'; end if;
 if p_payload ? 'duration_min' and (p_payload->>'duration_min')::numeric not between 0 and 1440 then raise exception 'Invalid duration'; end if;
 -- Explicit allowlist: callers cannot set ownership, ids, summaries, or timestamps.
 select jsonb_object_agg(key,value) into clean from jsonb_each(p_payload) where key=any(array[
 'discipline','is_rest_day','workout_type','session_details','performance_results','rpe','expected_difficulty',
 'performance_quality','physical_feeling','mental_state','has_pain','pain_note','pain_area','pain_severity','performance_factors',
 'session_goal_achieved','session_goal_note','extra_note','duration_min','satisfaction','last_meal_before','ate_around_training',
 'food_note','water_intake','sleep_hours','sleep_quality','woke_recovered','overall_feeling']);
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_date::text,1));
 select * into saved from public.daily_checkins where user_id=auth.uid() and checkin_date=p_date for update;
 if saved.id is not null and to_jsonb(saved) @> clean then
  select * into workout from public.workouts where checkin_id=saved.id;
  return jsonb_build_object('checkin',to_jsonb(saved),'workout',case when workout.id is null then null else to_jsonb(workout) end);
 end if;
 clean:=clean||jsonb_build_object('user_id',auth.uid(),'checkin_date',p_date,'updated_at',clock_timestamp(),'context_summary',left(concat_ws(' · ',clean->>'discipline',clean->>'workout_type',clean->>'session_details'),200));
 select string_agg(format('%I',key),','),string_agg(format('r.%I',key),','),string_agg(format('%I=excluded.%I',key,key),',')
 into column_names,value_names,update_names from jsonb_each(clean);
 execute format('insert into public.daily_checkins(%s) select %s from jsonb_populate_record(null::public.daily_checkins,$1) r on conflict(user_id,checkin_date) do update set %s returning *',column_names,value_names,update_names)
 into saved using clean;
 if not saved.is_rest_day and saved.discipline is not null then
  insert into public.workouts(user_id,checkin_id,workout_date,raw_input,summary,duration_minutes,intensity,exercises,analysis_status)
  values(auth.uid(),saved.id,p_date,'Daily check-in',saved.discipline||'-Training',saved.duration_min,
    case when saved.rpe>=8 then 'high' when saved.rpe>=5 then 'moderate' else 'low' end,'[]','pending')
  on conflict(checkin_id) where checkin_id is not null do update set summary=excluded.summary,duration_minutes=excluded.duration_minutes,intensity=excluded.intensity,analysis_status='pending',superseded_by_rest=false
  returning * into workout;
 end if;
 return jsonb_build_object('checkin',to_jsonb(saved),'workout',case when workout.id is null then null else to_jsonb(workout) end);
end $$;
revoke all on function public.record_checkin(jsonb,date) from public;
grant execute on function public.record_checkin(jsonb,date) to authenticated;

alter table public.analysis_boards add column if not exists checkin_revision timestamptz;
create or replace function public.save_checkin_analysis(p_checkin_id uuid,p_revision timestamptz,p_analysis jsonb) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare checkin public.daily_checkins; workout public.workouts; board uuid; begin
 if auth.uid() is null or p_analysis is null or octet_length(p_analysis::text)>16000 then raise exception 'Invalid analysis'; end if;
 select * into checkin from public.daily_checkins where id=p_checkin_id and user_id=auth.uid() for update;
 if not found or checkin.updated_at is distinct from p_revision or checkin.is_rest_day then return null; end if;
 select * into workout from public.workouts where checkin_id=checkin.id and user_id=auth.uid();
 if not found then return null; end if;
 if jsonb_typeof(p_analysis->'positives') is distinct from 'array' or jsonb_typeof(p_analysis->'negatives') is distinct from 'array' or jsonb_typeof(p_analysis->'improvements') is distinct from 'array' then raise exception 'Invalid analysis'; end if;
 insert into public.analysis_boards(workout_id,user_id,positives,negatives,improvements,is_ai_generated,checkin_revision)
 values(workout.id,auth.uid(),p_analysis->'positives',p_analysis->'negatives',p_analysis->'improvements',true,p_revision)
 on conflict(workout_id) do update set positives=excluded.positives,negatives=excluded.negatives,improvements=excluded.improvements,checkin_revision=excluded.checkin_revision,updated_at=now() returning id into board;
 update public.workouts set analysis_status='completed' where id=workout.id;
 return board;
end $$;
revoke all on function public.save_checkin_analysis(uuid,timestamptz,jsonb) from public;
grant execute on function public.save_checkin_analysis(uuid,timestamptz,jsonb) to authenticated;

-- Rest-day corrections retain generated history without showing it as training.
alter table public.workouts add column if not exists superseded_by_rest boolean not null default false;
create or replace function public.sync_checkin_rest_state() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$ begin
 update public.workouts set superseded_by_rest=new.is_rest_day where checkin_id=new.id;
 return new;
end $$;
drop trigger if exists release_checkin_rest_state on public.daily_checkins;
create trigger release_checkin_rest_state after update on public.daily_checkins for each row execute function public.sync_checkin_rest_state();
drop policy if exists own_data on public.workouts;
drop policy if exists coach_read on public.workouts;
create policy workout_select on public.workouts for select to authenticated using(not superseded_by_rest and (user_id=auth.uid() or public.is_coach_for(user_id)));
create policy workout_insert on public.workouts for insert to authenticated with check(user_id=auth.uid());
create policy workout_update on public.workouts for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy workout_delete on public.workouts for delete to authenticated using(user_id=auth.uid());
drop policy if exists own_data on public.analysis_boards;
drop policy if exists coach_read on public.analysis_boards;
create policy analysis_select on public.analysis_boards for select to authenticated using(
 (user_id=auth.uid() or public.is_coach_for(user_id)) and exists(select 1 from public.workouts w where w.id=workout_id and not w.superseded_by_rest));
create policy analysis_insert on public.analysis_boards for insert to authenticated with check(user_id=auth.uid());
create policy analysis_update on public.analysis_boards for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy analysis_delete on public.analysis_boards for delete to authenticated using(user_id=auth.uid());

commit;
