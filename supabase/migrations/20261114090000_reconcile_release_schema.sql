begin;
-- Forward-only reconciliation from committed generated types at 9d7980b.
-- MUST compare with live schema/migration ledger before approval; no live changes performed.
-- Existing tables/data are preserved. Historical files are deliberately unchanged.
-- gen_random_uuid() is built into supported PostgreSQL versions.

create table if not exists public.ai_conversations (
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  title text,
  updated_at timestamptz default now(),
  user_id uuid
);

alter table public.ai_conversations add column if not exists created_at timestamptz default now();

alter table public.ai_conversations add column if not exists title text;

alter table public.ai_conversations add column if not exists updated_at timestamptz default now();

alter table public.ai_conversations add column if not exists user_id uuid;

create table if not exists public.ai_messages (
  content text default '',
  conversation_id uuid,
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  role text default 'athlete',
  user_id uuid
);

alter table public.ai_messages add column if not exists content text default '';

alter table public.ai_messages add column if not exists conversation_id uuid;

alter table public.ai_messages add column if not exists created_at timestamptz default now();

alter table public.ai_messages add column if not exists role text default 'athlete';

alter table public.ai_messages add column if not exists user_id uuid;

create table if not exists public.analysis_boards (
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  improvements jsonb default '[]'::jsonb,
  is_ai_generated boolean default false,
  negatives jsonb default '[]'::jsonb,
  positives jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  user_id uuid,
  workout_id uuid
);

alter table public.analysis_boards add column if not exists created_at timestamptz default now();

alter table public.analysis_boards add column if not exists improvements jsonb default '[]'::jsonb;

alter table public.analysis_boards add column if not exists is_ai_generated boolean default false;

alter table public.analysis_boards add column if not exists negatives jsonb default '[]'::jsonb;

alter table public.analysis_boards add column if not exists positives jsonb default '[]'::jsonb;

alter table public.analysis_boards add column if not exists updated_at timestamptz default now();

alter table public.analysis_boards add column if not exists user_id uuid;

alter table public.analysis_boards add column if not exists workout_id uuid;

create table if not exists public.athlete_questions (
  answer text,
  answered_at timestamptz,
  asked_at timestamptz,
  athlete_id uuid,
  coach_id uuid,
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  question text default '',
  status text default '',
  updated_at timestamptz default now()
);

alter table public.athlete_questions add column if not exists answer text;

alter table public.athlete_questions add column if not exists answered_at timestamptz;

alter table public.athlete_questions add column if not exists asked_at timestamptz;

alter table public.athlete_questions add column if not exists athlete_id uuid;

alter table public.athlete_questions add column if not exists coach_id uuid;

alter table public.athlete_questions add column if not exists created_at timestamptz default now();

alter table public.athlete_questions add column if not exists question text default '';

alter table public.athlete_questions add column if not exists status text default '';

alter table public.athlete_questions add column if not exists updated_at timestamptz default now();

create table if not exists public.coach_athletes (
  athlete_id uuid,
  coach_id uuid,
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid()
);

alter table public.coach_athletes add column if not exists athlete_id uuid;

alter table public.coach_athletes add column if not exists coach_id uuid;

alter table public.coach_athletes add column if not exists created_at timestamptz default now();

create table if not exists public.coach_calendar_events (
  coach_id uuid,
  created_at timestamptz default now(),
  end_time text,
  event_date date default current_date,
  event_type text default '',
  id uuid primary key default gen_random_uuid(),
  location text,
  notes text,
  start_time text,
  title text default '',
  updated_at timestamptz default now()
);

alter table public.coach_calendar_events add column if not exists coach_id uuid;

alter table public.coach_calendar_events add column if not exists created_at timestamptz default now();

alter table public.coach_calendar_events add column if not exists end_time text;

alter table public.coach_calendar_events add column if not exists event_date date default current_date;

alter table public.coach_calendar_events add column if not exists event_type text default '';

alter table public.coach_calendar_events add column if not exists location text;

alter table public.coach_calendar_events add column if not exists notes text;

alter table public.coach_calendar_events add column if not exists start_time text;

alter table public.coach_calendar_events add column if not exists title text default '';

alter table public.coach_calendar_events add column if not exists updated_at timestamptz default now();

create table if not exists public.coach_exercise_library (
  category text default '',
  coach_id uuid,
  created_at timestamptz default now(),
  default_details text,
  default_rest text,
  description text,
  discipline text,
  id uuid primary key default gen_random_uuid(),
  name text default '',
  source text default '',
  updated_at timestamptz default now()
);

alter table public.coach_exercise_library add column if not exists category text default '';

alter table public.coach_exercise_library add column if not exists coach_id uuid;

alter table public.coach_exercise_library add column if not exists created_at timestamptz default now();

alter table public.coach_exercise_library add column if not exists default_details text;

alter table public.coach_exercise_library add column if not exists default_rest text;

alter table public.coach_exercise_library add column if not exists description text;

alter table public.coach_exercise_library add column if not exists discipline text;

alter table public.coach_exercise_library add column if not exists name text default '';

alter table public.coach_exercise_library add column if not exists source text default '';

alter table public.coach_exercise_library add column if not exists updated_at timestamptz default now();

create table if not exists public.coach_note_recipients (
  athlete_id uuid,
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  note_id uuid
);

alter table public.coach_note_recipients add column if not exists athlete_id uuid;

alter table public.coach_note_recipients add column if not exists created_at timestamptz default now();

alter table public.coach_note_recipients add column if not exists note_id uuid;

create table if not exists public.coach_notes (
  athlete_id uuid,
  coach_id uuid,
  content text default '',
  created_at timestamptz default now(),
  follow_up_completed boolean default false,
  follow_up_when text,
  id uuid primary key default gen_random_uuid(),
  kind text default '',
  linked_session text,
  measurement_method text,
  measurement_type text,
  measurement_unit text,
  measurement_value numeric,
  note_type text,
  pinned boolean default false,
  updated_at timestamptz default now(),
  visibility text default ''
);

alter table public.coach_notes add column if not exists athlete_id uuid;

alter table public.coach_notes add column if not exists coach_id uuid;

alter table public.coach_notes add column if not exists content text default '';

alter table public.coach_notes add column if not exists created_at timestamptz default now();

alter table public.coach_notes add column if not exists follow_up_completed boolean default false;

alter table public.coach_notes add column if not exists follow_up_when text;

alter table public.coach_notes add column if not exists kind text default '';

alter table public.coach_notes add column if not exists linked_session text;

alter table public.coach_notes add column if not exists measurement_method text;

alter table public.coach_notes add column if not exists measurement_type text;

alter table public.coach_notes add column if not exists measurement_unit text;

alter table public.coach_notes add column if not exists measurement_value numeric;

alter table public.coach_notes add column if not exists note_type text;

alter table public.coach_notes add column if not exists pinned boolean default false;

alter table public.coach_notes add column if not exists updated_at timestamptz default now();

alter table public.coach_notes add column if not exists visibility text default '';

create table if not exists public.coach_training_templates (
  category text default '',
  coach_id uuid,
  coach_note text,
  created_at timestamptz default now(),
  description text,
  discipline text,
  duration_minutes numeric,
  exercises jsonb default '[]'::jsonb,
  id uuid primary key default gen_random_uuid(),
  intensity text,
  name text default '',
  session_goal text,
  template_type text default '',
  updated_at timestamptz default now()
);

alter table public.coach_training_templates add column if not exists category text default '';

alter table public.coach_training_templates add column if not exists coach_id uuid;

alter table public.coach_training_templates add column if not exists coach_note text;

alter table public.coach_training_templates add column if not exists created_at timestamptz default now();

alter table public.coach_training_templates add column if not exists description text;

alter table public.coach_training_templates add column if not exists discipline text;

alter table public.coach_training_templates add column if not exists duration_minutes numeric;

alter table public.coach_training_templates add column if not exists exercises jsonb default '[]'::jsonb;

alter table public.coach_training_templates add column if not exists intensity text;

alter table public.coach_training_templates add column if not exists name text default '';

alter table public.coach_training_templates add column if not exists session_goal text;

alter table public.coach_training_templates add column if not exists template_type text default '';

alter table public.coach_training_templates add column if not exists updated_at timestamptz default now();

create table if not exists public.competition_entries (
  athlete_id uuid,
  competition_id uuid,
  created_at timestamptz default now(),
  events text[] default '{}'::text[],
  goal text,
  id uuid primary key default gen_random_uuid(),
  notes text,
  result text,
  updated_at timestamptz default now()
);

alter table public.competition_entries add column if not exists athlete_id uuid;

alter table public.competition_entries add column if not exists competition_id uuid;

alter table public.competition_entries add column if not exists created_at timestamptz default now();

alter table public.competition_entries add column if not exists events text[] default '{}'::text[];

alter table public.competition_entries add column if not exists goal text;

alter table public.competition_entries add column if not exists notes text;

alter table public.competition_entries add column if not exists result text;

alter table public.competition_entries add column if not exists updated_at timestamptz default now();

create table if not exists public.competitions (
  coach_id uuid,
  competition_date date default current_date,
  competition_type text default '',
  created_at timestamptz default now(),
  id uuid primary key default gen_random_uuid(),
  location text,
  name text default '',
  notes text,
  phase text default '',
  priority text,
  updated_at timestamptz default now(),
  venue text
);

alter table public.competitions add column if not exists coach_id uuid;

alter table public.competitions add column if not exists competition_date date default current_date;

alter table public.competitions add column if not exists competition_type text default '';

alter table public.competitions add column if not exists created_at timestamptz default now();

alter table public.competitions add column if not exists location text;

alter table public.competitions add column if not exists name text default '';

alter table public.competitions add column if not exists notes text;

alter table public.competitions add column if not exists phase text default '';

alter table public.competitions add column if not exists priority text;

alter table public.competitions add column if not exists updated_at timestamptz default now();

alter table public.competitions add column if not exists venue text;

create table if not exists public.daily_checkins (
  ai_summary text,
  ate_around_training text,
  checkin_date date default current_date,
  context_summary text,
  created_at timestamptz default now(),
  discipline text,
  duration_min numeric,
  expected_difficulty text,
  extra_note text,
  food_note text,
  has_pain boolean,
  id uuid primary key default gen_random_uuid(),
  is_rest_day boolean default false,
  last_meal_before text,
  mental_state text,
  overall_feeling numeric,
  pain_area text,
  pain_note text,
  pain_severity text,
  performance_factors text[],
  performance_quality text,
  performance_results jsonb,
  physical_feeling numeric,
  rpe numeric,
  satisfaction numeric,
  session_details text,
  session_goal_achieved text,
  session_goal_note text,
  sleep_hours text,
  sleep_quality numeric,
  updated_at timestamptz default now(),
  user_id uuid,
  water_intake text,
  woke_recovered text,
  workout_type text
);

alter table public.daily_checkins add column if not exists ai_summary text;

alter table public.daily_checkins add column if not exists ate_around_training text;

alter table public.daily_checkins add column if not exists checkin_date date default current_date;

alter table public.daily_checkins add column if not exists context_summary text;

alter table public.daily_checkins add column if not exists created_at timestamptz default now();

alter table public.daily_checkins add column if not exists discipline text;

alter table public.daily_checkins add column if not exists duration_min numeric;

alter table public.daily_checkins add column if not exists expected_difficulty text;

alter table public.daily_checkins add column if not exists extra_note text;

alter table public.daily_checkins add column if not exists food_note text;

alter table public.daily_checkins add column if not exists has_pain boolean;

alter table public.daily_checkins add column if not exists is_rest_day boolean default false;

alter table public.daily_checkins add column if not exists last_meal_before text;

alter table public.daily_checkins add column if not exists mental_state text;

alter table public.daily_checkins add column if not exists overall_feeling numeric;

alter table public.daily_checkins add column if not exists pain_area text;

alter table public.daily_checkins add column if not exists pain_note text;

alter table public.daily_checkins add column if not exists pain_severity text;

alter table public.daily_checkins add column if not exists performance_factors text[];

alter table public.daily_checkins add column if not exists performance_quality text;

alter table public.daily_checkins add column if not exists performance_results jsonb;

alter table public.daily_checkins add column if not exists physical_feeling numeric;

alter table public.daily_checkins add column if not exists rpe numeric;

alter table public.daily_checkins add column if not exists satisfaction numeric;

alter table public.daily_checkins add column if not exists session_details text;

alter table public.daily_checkins add column if not exists session_goal_achieved text;

alter table public.daily_checkins add column if not exists session_goal_note text;

alter table public.daily_checkins add column if not exists sleep_hours text;

alter table public.daily_checkins add column if not exists sleep_quality numeric;

alter table public.daily_checkins add column if not exists updated_at timestamptz default now();

alter table public.daily_checkins add column if not exists user_id uuid;

alter table public.daily_checkins add column if not exists water_intake text;

alter table public.daily_checkins add column if not exists woke_recovered text;

alter table public.daily_checkins add column if not exists workout_type text;

create table if not exists public.friendships (
  created_at timestamptz default now(),
  friend_id uuid,
  id uuid primary key default gen_random_uuid(),
  status text default '',
  user_id uuid
);

alter table public.friendships add column if not exists created_at timestamptz default now();

alter table public.friendships add column if not exists friend_id uuid;

alter table public.friendships add column if not exists status text default '';

alter table public.friendships add column if not exists user_id uuid;

create table if not exists public.gear_logs (
  brand text default '',
  created_at timestamptz default now(),
  discipline text,
  distance_km numeric,
  id uuid primary key default gen_random_uuid(),
  model text default '',
  notes text,
  started_on text default '',
  user_id uuid
);

alter table public.gear_logs add column if not exists brand text default '';

alter table public.gear_logs add column if not exists created_at timestamptz default now();

alter table public.gear_logs add column if not exists discipline text;

alter table public.gear_logs add column if not exists distance_km numeric;

alter table public.gear_logs add column if not exists model text default '';

alter table public.gear_logs add column if not exists notes text;

alter table public.gear_logs add column if not exists started_on text default '';

alter table public.gear_logs add column if not exists user_id uuid;

create table if not exists public.gear_profile (
  created_at timestamptz default now(),
  foot_width text,
  notes text,
  preferred_brands text[] default '{}'::text[],
  shoe_size_eu numeric,
  updated_at timestamptz default now(),
  user_id uuid
);

alter table public.gear_profile add column if not exists created_at timestamptz default now();

alter table public.gear_profile add column if not exists foot_width text;

alter table public.gear_profile add column if not exists notes text;

alter table public.gear_profile add column if not exists preferred_brands text[] default '{}'::text[];

alter table public.gear_profile add column if not exists shoe_size_eu numeric;

alter table public.gear_profile add column if not exists updated_at timestamptz default now();

alter table public.gear_profile add column if not exists user_id uuid;

create table if not exists public.planned_workouts (
  athlete_id uuid,
  coach_id uuid,
  coach_note text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  discipline text,
  duration_minutes numeric,
  exercises jsonb default '[]'::jsonb,
  id uuid primary key default gen_random_uuid(),
  is_published boolean default false,
  session_goal text,
  source text default '',
  status text default 'planned',
  title text default '',
  training_session_id uuid,
  updated_at timestamptz default now(),
  workout_date date default current_date
);

alter table public.planned_workouts add column if not exists athlete_id uuid;

alter table public.planned_workouts add column if not exists coach_id uuid;

alter table public.planned_workouts add column if not exists coach_note text;

alter table public.planned_workouts add column if not exists completed_at timestamptz;

alter table public.planned_workouts add column if not exists created_at timestamptz default now();

alter table public.planned_workouts add column if not exists discipline text;

alter table public.planned_workouts add column if not exists duration_minutes numeric;

alter table public.planned_workouts add column if not exists exercises jsonb default '[]'::jsonb;

alter table public.planned_workouts add column if not exists is_published boolean default false;

alter table public.planned_workouts add column if not exists session_goal text;

alter table public.planned_workouts add column if not exists source text default '';

alter table public.planned_workouts add column if not exists status text default 'planned';

alter table public.planned_workouts add column if not exists title text default '';

alter table public.planned_workouts add column if not exists training_session_id uuid;

alter table public.planned_workouts add column if not exists updated_at timestamptz default now();

alter table public.planned_workouts add column if not exists workout_date date default current_date;

create table if not exists public.profiles (
  timezone text default 'UTC',
  ai_consent boolean default false,
  share_with_coach boolean default true,
  age numeric,
  avatar_url text,
  created_at timestamptz default now(),
  current_focus text[],
  current_streak numeric default 0,
  disciplines text[],
  display_name text default 'Athlete',
  experience text,
  favourite_athlete text,
  goal_motivation text[],
  goal_text text,
  goals text[],
  height_cm numeric,
  id uuid primary key default gen_random_uuid(),
  injuries text,
  invite_code text default replace(gen_random_uuid()::text, '-', ''),
  last_workout_date date default current_date,
  longest_streak numeric default 0,
  onboarded_at timestamptz,
  receive_news_and_motivation boolean,
  role text default 'athlete',
  streak_freezes_last_reset date default current_date,
  streak_freezes_remaining numeric default 0,
  training_days_per_week numeric,
  training_setup text,
  updated_at timestamptz default now(),
  weight_kg numeric
);

alter table public.profiles add column if not exists timezone text default 'UTC';

alter table public.profiles add column if not exists ai_consent boolean default false;

alter table public.profiles add column if not exists share_with_coach boolean default true;

alter table public.profiles add column if not exists age numeric;

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles add column if not exists created_at timestamptz default now();

alter table public.profiles add column if not exists current_focus text[];

alter table public.profiles add column if not exists current_streak numeric default 0;

alter table public.profiles add column if not exists disciplines text[];

alter table public.profiles add column if not exists display_name text default 'Athlete';

alter table public.profiles add column if not exists experience text;

alter table public.profiles add column if not exists favourite_athlete text;

alter table public.profiles add column if not exists goal_motivation text[];

alter table public.profiles add column if not exists goal_text text;

alter table public.profiles add column if not exists goals text[];

alter table public.profiles add column if not exists height_cm numeric;

alter table public.profiles add column if not exists injuries text;

alter table public.profiles add column if not exists invite_code text default replace(gen_random_uuid()::text, '-', '');

alter table public.profiles add column if not exists last_workout_date date default current_date;

alter table public.profiles add column if not exists longest_streak numeric default 0;

alter table public.profiles add column if not exists onboarded_at timestamptz;

alter table public.profiles add column if not exists receive_news_and_motivation boolean;

alter table public.profiles add column if not exists role text default 'athlete';

alter table public.profiles add column if not exists streak_freezes_last_reset date default current_date;

alter table public.profiles add column if not exists streak_freezes_remaining numeric default 0;

alter table public.profiles add column if not exists training_days_per_week numeric;

alter table public.profiles add column if not exists training_setup text;

alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.profiles add column if not exists weight_kg numeric;

create table if not exists public.regeneration_checkins (
  checkin_date date default current_date,
  created_at timestamptz default now(),
  energy_level numeric default 0,
  id uuid primary key default gen_random_uuid(),
  muscle_soreness numeric default 0,
  sleep_quality numeric default 0,
  updated_at timestamptz default now(),
  user_id uuid
);

alter table public.regeneration_checkins add column if not exists checkin_date date default current_date;

alter table public.regeneration_checkins add column if not exists created_at timestamptz default now();

alter table public.regeneration_checkins add column if not exists energy_level numeric default 0;

alter table public.regeneration_checkins add column if not exists muscle_soreness numeric default 0;

alter table public.regeneration_checkins add column if not exists sleep_quality numeric default 0;

alter table public.regeneration_checkins add column if not exists updated_at timestamptz default now();

alter table public.regeneration_checkins add column if not exists user_id uuid;

create table if not exists public.training_sessions (
  coach_id uuid,
  coach_note text,
  created_at timestamptz default now(),
  discipline text,
  duration_minutes numeric,
  end_time text,
  exercises jsonb default '[]'::jsonb,
  group_name text,
  id uuid primary key default gen_random_uuid(),
  intensity text,
  location text,
  session_date date default current_date,
  session_goal text,
  start_time text,
  status text default '',
  title text default '',
  updated_at timestamptz default now()
);

alter table public.training_sessions add column if not exists coach_id uuid;

alter table public.training_sessions add column if not exists coach_note text;

alter table public.training_sessions add column if not exists created_at timestamptz default now();

alter table public.training_sessions add column if not exists discipline text;

alter table public.training_sessions add column if not exists duration_minutes numeric;

alter table public.training_sessions add column if not exists end_time text;

alter table public.training_sessions add column if not exists exercises jsonb default '[]'::jsonb;

alter table public.training_sessions add column if not exists group_name text;

alter table public.training_sessions add column if not exists intensity text;

alter table public.training_sessions add column if not exists location text;

alter table public.training_sessions add column if not exists session_date date default current_date;

alter table public.training_sessions add column if not exists session_goal text;

alter table public.training_sessions add column if not exists start_time text;

alter table public.training_sessions add column if not exists status text default '';

alter table public.training_sessions add column if not exists title text default '';

alter table public.training_sessions add column if not exists updated_at timestamptz default now();

create table if not exists public.video_analyses (
  ai_analysis jsonb,
  athlete_request text,
  coach_notes text,
  created_at timestamptz default now(),
  detected_movement text,
  discipline text,
  findings jsonb,
  id uuid primary key default gen_random_uuid(),
  kpis jsonb,
  overall_rating numeric,
  overall_reasoning text,
  overall_recommendation text,
  score_breakdown jsonb,
  shared_with_coach boolean default false,
  shared_with_coach_at timestamptz,
  storage_path text default '',
  updated_at timestamptz default now(),
  user_id uuid
);

alter table public.video_analyses add column if not exists ai_analysis jsonb;

alter table public.video_analyses add column if not exists athlete_request text;

alter table public.video_analyses add column if not exists coach_notes text;

alter table public.video_analyses add column if not exists created_at timestamptz default now();

alter table public.video_analyses add column if not exists detected_movement text;

alter table public.video_analyses add column if not exists discipline text;

alter table public.video_analyses add column if not exists findings jsonb;

alter table public.video_analyses add column if not exists kpis jsonb;

alter table public.video_analyses add column if not exists overall_rating numeric;

alter table public.video_analyses add column if not exists overall_reasoning text;

alter table public.video_analyses add column if not exists overall_recommendation text;

alter table public.video_analyses add column if not exists score_breakdown jsonb;

alter table public.video_analyses add column if not exists shared_with_coach boolean default false;

alter table public.video_analyses add column if not exists shared_with_coach_at timestamptz;

alter table public.video_analyses add column if not exists storage_path text default '';

alter table public.video_analyses add column if not exists updated_at timestamptz default now();

alter table public.video_analyses add column if not exists user_id uuid;

create table if not exists public.workouts (
  created_at timestamptz default now(),
  duration_minutes numeric,
  exercises jsonb default '[]'::jsonb,
  id uuid primary key default gen_random_uuid(),
  intensity text,
  notes text,
  raw_input text,
  summary text,
  user_id uuid,
  workout_date date default current_date,
  workout_type text
);

alter table public.workouts add column if not exists created_at timestamptz default now();

alter table public.workouts add column if not exists duration_minutes numeric;

alter table public.workouts add column if not exists exercises jsonb default '[]'::jsonb;

alter table public.workouts add column if not exists intensity text;

alter table public.workouts add column if not exists notes text;

alter table public.workouts add column if not exists raw_input text;

alter table public.workouts add column if not exists summary text;

alter table public.workouts add column if not exists user_id uuid;

alter table public.workouts add column if not exists workout_date date default current_date;

alter table public.workouts add column if not exists workout_type text;

create unique index if not exists release_checkin_user_date on public.daily_checkins(user_id,checkin_date);

create unique index if not exists release_regeneration_user_date on public.regeneration_checkins(user_id,checkin_date);

create unique index if not exists release_coach_athlete on public.coach_athletes(coach_id,athlete_id);

create unique index if not exists release_session_athlete on public.planned_workouts(training_session_id,athlete_id) where training_session_id is not null;

alter table public.workouts add column if not exists request_id uuid;

alter table public.workouts add column if not exists checkin_id uuid;

create unique index if not exists release_workout_request on public.workouts(user_id,request_id) where request_id is not null;

create unique index if not exists release_workout_checkin on public.workouts(checkin_id) where checkin_id is not null;

create unique index if not exists release_analysis_workout on public.analysis_boards(workout_id);

create unique index if not exists release_friend_pair on public.friendships(user_id,friend_id);

-- Restore relationship metadata required by Supabase joins and account cleanup.
-- NOT VALID avoids silently discarding legacy orphans; new writes are checked.
-- Owners must inspect/validate existing rows in staging before live approval.
do $$ declare item record; constraint_name text; begin
 for item in select * from (values
 ('profiles','id','auth.users','CASCADE'),
 ('coach_athletes','coach_id','public.profiles','CASCADE'),
 ('coach_athletes','athlete_id','public.profiles','CASCADE'),
 ('regeneration_checkins','user_id','public.profiles','CASCADE'),
 ('training_sessions','coach_id','auth.users','CASCADE'),
 ('coach_calendar_events','coach_id','auth.users','CASCADE'),
 ('coach_exercise_library','coach_id','auth.users','CASCADE'),
 ('coach_training_templates','coach_id','auth.users','CASCADE'),
 ('daily_checkins','user_id','auth.users','CASCADE'),
 ('workouts','user_id','auth.users','CASCADE'),
 ('workouts','checkin_id','public.daily_checkins','SET NULL'),
 ('analysis_boards','user_id','auth.users','CASCADE'),
 ('analysis_boards','workout_id','public.workouts','CASCADE'),
 ('planned_workouts','athlete_id','auth.users','CASCADE'),
 ('planned_workouts','coach_id','auth.users','SET NULL'),
 ('planned_workouts','training_session_id','public.training_sessions','SET NULL'),
 ('video_analyses','user_id','auth.users','CASCADE'),
 ('friendships','user_id','auth.users','CASCADE'),
 ('friendships','friend_id','auth.users','CASCADE'),
 ('coach_notes','coach_id','auth.users','CASCADE'),
 ('coach_notes','athlete_id','auth.users','CASCADE'),
 ('coach_note_recipients','note_id','public.coach_notes','CASCADE'),
 ('coach_note_recipients','athlete_id','auth.users','CASCADE'),
 ('competitions','coach_id','auth.users','CASCADE'),
 ('competition_entries','competition_id','public.competitions','CASCADE'),
 ('competition_entries','athlete_id','auth.users','CASCADE'),
 ('ai_conversations','user_id','auth.users','CASCADE'),
 ('ai_messages','user_id','auth.users','CASCADE'),
 ('ai_messages','conversation_id','public.ai_conversations','CASCADE'),
 ('gear_profile','user_id','auth.users','CASCADE'),
 ('gear_logs','user_id','auth.users','CASCADE'),
 ('athlete_questions','athlete_id','auth.users','CASCADE'),
 ('athlete_questions','coach_id','auth.users','SET NULL')
 ) as refs(table_name,column_name,parent_table,delete_action) loop
 constraint_name:='release_fk_'||item.table_name||'_'||item.column_name;
 if not exists(select 1 from pg_constraint c where c.contype='f'
   and c.conrelid=to_regclass('public.'||item.table_name) and c.confrelid=to_regclass(item.parent_table)
   and c.conkey=array[(select attnum from pg_attribute where attrelid=c.conrelid and attname=item.column_name)]) then
  execute format('alter table public.%I add constraint %I foreign key(%I) references %s(id) on delete %s not valid',item.table_name,constraint_name,item.column_name,item.parent_table,item.delete_action);
 end if;
 end loop;
end $$;
create unique index if not exists release_profile_invite on public.profiles(invite_code);
create unique index if not exists release_gear_profile_user on public.gear_profile(user_id);

commit;
