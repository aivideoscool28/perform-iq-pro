-- No live credentials, real health information, or external services.
create function public.test_assert(value boolean,message text) returns void language plpgsql as $$ begin if value is distinct from true then raise exception 'ASSERTION FAILED: %',message; end if; end $$;
create function public.test_denied(statement text) returns void language plpgsql as $$ begin
 begin execute statement; exception when insufficient_privilege or check_violation or raise_exception then return; end;
 raise exception 'EXPECTED DENIAL: %',statement;
end $$;
insert into auth.users(id,raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000001','{"role":"athlete"}'),
 ('00000000-0000-0000-0000-000000000002','{"role":"athlete"}'),
 ('00000000-0000-0000-0000-000000000011','{"role":"coach"}'),
 ('00000000-0000-0000-0000-000000000012','{"role":"coach"}');
update public.profiles set invite_code=id::text;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*)=1 from public.profiles),'athlete cannot read other profiles');
select public.test_denied($q$update public.profiles set role='coach' where id=auth.uid()$q$);
select public.test_denied($q$insert into public.friendships(user_id,friend_id,status) values(auth.uid(),'00000000-0000-0000-0000-000000000002','accepted')$q$);
select public.accept_invite('00000000-0000-0000-0000-000000000002');
select public.test_assert((select count(*)=1 from public.fetch_friend_profiles()),'friend safe projection works');
select public.test_assert((select count(*)=1 from public.profiles),'friendship does not reveal private profile');
select public.connect_coach('00000000-0000-0000-0000-000000000011');
select public.test_denied($q$select public.consume_ai_usage()$q$);
update public.profiles set ai_consent=true where id=auth.uid();
do $$ begin for i in 1..20 loop perform public.consume_ai_usage(); end loop; end $$;
select public.test_denied($q$select public.consume_ai_usage()$q$);
select public.test_denied($q$select public.record_workout('10000000-0000-0000-0000-000000000099','Sprint training',null)$q$);
select public.test_denied($q$select public.record_workout('10000000-0000-0000-0000-000000000099',null,current_date)$q$);
select public.test_denied($q$select public.record_checkin('{"is_rest_day":true}',null)$q$);
-- Retry safe workout identity and mismatched-key rejection.
select public.record_workout('10000000-0000-0000-0000-000000000001','Sprint training',current_date);
select public.record_workout('10000000-0000-0000-0000-000000000001','Sprint training',current_date);
select public.test_assert((select count(*)=1 from public.workouts),'workout retries produce one record');
select public.test_denied($q$select public.record_workout('10000000-0000-0000-0000-000000000001','Different text',current_date)$q$);
select public.record_checkin('{"is_rest_day":false,"discipline":"Sprint","rpe":7,"duration_min":60}',current_date);
select public.record_checkin('{"is_rest_day":false,"discipline":"Sprint","rpe":7,"duration_min":60}',current_date);
select public.test_assert((select count(*)=1 from public.daily_checkins),'check-in retry stable');
select public.record_checkin('{"is_rest_day":false,"discipline":"Hurdles","rpe":6,"duration_min":50}',current_date);
select public.test_assert((select count(*)=1 from public.workouts where checkin_id is not null),'discipline change preserves workout identity');
select public.test_denied($q$select public.record_checkin('{"is_rest_day":false,"duration_min":-1}',current_date)$q$);


-- AI results from an earlier edit cannot overwrite the current check-in.
select public.test_assert(public.save_checkin_analysis(
 (select id from public.daily_checkins limit 1),
 (select updated_at - interval '1 second' from public.daily_checkins limit 1),
 '{"positives":["old"],"negatives":[],"improvements":[]}'
) is null,'stale check-in analysis rejected');
select public.record_checkin('{"is_rest_day":true,"discipline":null,"rpe":null,"duration_min":0}',current_date);
select public.test_assert((select count(*)=1 from public.workouts),'rest-day correction hides generated workout and retains manual workout');
select public.record_checkin('{"is_rest_day":false,"discipline":"Hurdles","rpe":6,"duration_min":50}',current_date);
select public.test_assert((select count(*)=1 from public.workouts where checkin_id is not null),'returning to training restores the same generated workout');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
select public.test_assert((select count(*)=0 from public.workouts),'second athlete cannot read first workouts');
select public.connect_coach('00000000-0000-0000-0000-000000000012');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_assert((select count(*)=2 from public.profiles),'coach sees self and linked athlete only');
select public.test_assert((select count(*)=2 from public.workouts),'linked coach sees athlete records');
select public.test_denied($q$insert into public.planned_workouts(athlete_id,coach_id,title,workout_date) values('00000000-0000-0000-0000-000000000002',auth.uid(),'Unlinked plan',current_date)$q$);
insert into public.training_sessions(id,coach_id,title,session_date,status,exercises) values('20000000-0000-0000-0000-000000000001',auth.uid(),'Sprint',current_date,'draft','[]');
select public.publish_training_session('20000000-0000-0000-0000-000000000001');
select public.publish_training_session('20000000-0000-0000-0000-000000000001');
select public.test_assert((select count(*)=1 from public.planned_workouts),'republish idempotent');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select public.complete_planned_workout((select id from public.planned_workouts limit 1),'completed');
select public.test_denied($q$select public.complete_planned_workout((select id from public.planned_workouts limit 1),null)$q$);
update public.planned_workouts set title='Tampered';
select public.test_assert((select title='Sprint' and status='completed' and completed_at is not null from public.planned_workouts limit 1),'athlete cannot alter plan content');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.publish_training_session('20000000-0000-0000-0000-000000000001');
select public.test_assert((select status='completed' and completed_at is not null from public.planned_workouts limit 1),'republish preserves completion');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
update public.profiles set share_with_coach=false where id=auth.uid();
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_assert((select count(*)=0 from public.workouts),'coach consent revocation enforced');
select public.test_assert((select count(*)=1 from public.profiles),'coach loses private profile after revocation');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000012';
select public.test_denied($q$select public.publish_training_session('20000000-0000-0000-0000-000000000001')$q$);

reset role;
update public.profiles set share_with_coach=true where id='00000000-0000-0000-0000-000000000001';
insert into public.coach_athletes(coach_id,athlete_id) values('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000002');
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
insert into public.planned_workouts(athlete_id,coach_id,title,workout_date,is_published) values('00000000-0000-0000-0000-000000000001',auth.uid(),'Private draft',current_date,false);
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*)=0 from public.planned_workouts where title='Private draft'),'athlete cannot read drafts');
insert into public.video_analyses(user_id,storage_path,shared_with_coach) values(auth.uid(),auth.uid()::text||'/video.mp4',false);
insert into storage.objects(bucket_id,name) values('athlete-videos',auth.uid()::text||'/video.mp4');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_assert((select count(*)=0 from storage.objects),'coach cannot see unshared video');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
update public.video_analyses set shared_with_coach=true where user_id=auth.uid();
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_assert((select count(*)=1 from storage.objects),'linked coach can read shared video');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
update public.video_analyses set shared_with_coach=false where user_id=auth.uid();
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_assert((select count(*)=0 from storage.objects),'video consent revocation enforced');
insert into public.training_sessions(id,coach_id,title,session_date,status,exercises) values('20000000-0000-0000-0000-000000000002',auth.uid(),'Atomic publish',current_date,'draft','[]');
reset role;
create function public.test_publish_failure() returns trigger language plpgsql as $$ begin if new.training_session_id='20000000-0000-0000-0000-000000000002' and new.athlete_id='00000000-0000-0000-0000-000000000002' then raise exception 'Injected storage failure'; end if; return new; end $$;
create trigger test_publish_failure before insert on public.planned_workouts for each row execute function public.test_publish_failure();
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000011';
select public.test_denied($q$select public.publish_training_session('20000000-0000-0000-0000-000000000002')$q$);
select public.test_assert((select count(*)=0 from public.planned_workouts where training_session_id='20000000-0000-0000-0000-000000000002'),'failed publication rolls back all athlete copies');
select public.test_assert((select status='draft' from public.training_sessions where id='20000000-0000-0000-0000-000000000002'),'failed publication leaves master draft');
reset role;
select 'DATABASE AUTHORIZATION AND RETRY TESTS PASSED' as result;
