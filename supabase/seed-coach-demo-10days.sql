-- ============================================================
-- AETHER ATHLETE IQ
-- Coach Manager demo dataset
-- 3 athletes × 10 days
-- 2026-08-17 through 2026-08-26
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- DEMO USERS
-- Coach:
-- 8702a6f0-8e4b-45cb-88ef-51208375a28f
--
-- Jonas:
-- e86cb481-7ad8-4d87-a583-ec69d2460c03
--
-- Liam:
-- f0c3252c-cbed-4467-9bc3-9a4d21fdcce6
--
-- Sarah:
-- 886ca750-7b72-49d0-aee8-af41968519ed
-- ------------------------------------------------------------


-- ============================================================
-- 1. MAKE SURE THEY ARE ATHLETES
-- ============================================================

UPDATE public.profiles
SET
  display_name = CASE id
    WHEN 'e86cb481-7ad8-4d87-a583-ec69d2460c03'::uuid THEN 'Jonas'
    WHEN 'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6'::uuid THEN 'Liam'
    WHEN '886ca750-7b72-49d0-aee8-af41968519ed'::uuid THEN 'Sarah'
    ELSE display_name
  END,
  role = 'athlete',
  disciplines = CASE id
    WHEN 'e86cb481-7ad8-4d87-a583-ec69d2460c03'::uuid
      THEN ARRAY['Sprint']
    WHEN 'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6'::uuid
      THEN ARRAY['Sprint']
    WHEN '886ca750-7b72-49d0-aee8-af41968519ed'::uuid
      THEN ARRAY['Hurdles']
    ELSE disciplines
  END
WHERE id IN (
  'e86cb481-7ad8-4d87-a583-ec69d2460c03',
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
  '886ca750-7b72-49d0-aee8-af41968519ed'
);


-- ============================================================
-- 2. LINK ALL 3 ATHLETES TO DEMO COACH
-- ============================================================

INSERT INTO public.coach_athletes (
  coach_id,
  athlete_id
)
VALUES
(
  '8702a6f0-8e4b-45cb-88ef-51208375a28f',
  'e86cb481-7ad8-4d87-a583-ec69d2460c03'
),
(
  '8702a6f0-8e4b-45cb-88ef-51208375a28f',
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6'
),
(
  '8702a6f0-8e4b-45cb-88ef-51208375a28f',
  '886ca750-7b72-49d0-aee8-af41968519ed'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. REMOVE OLD DEMO CHECK-INS FOR THIS 10-DAY WINDOW
-- Makes this script safe to run again.
-- ============================================================

DELETE FROM public.daily_checkins
WHERE
  user_id IN (
    'e86cb481-7ad8-4d87-a583-ec69d2460c03',
    'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
    '886ca750-7b72-49d0-aee8-af41968519ed'
  )
  AND checkin_date BETWEEN '2026-08-17' AND '2026-08-26';


DELETE FROM public.regeneration_checkins
WHERE
  user_id IN (
    'e86cb481-7ad8-4d87-a583-ec69d2460c03',
    'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
    '886ca750-7b72-49d0-aee8-af41968519ed'
  )
  AND checkin_date BETWEEN '2026-08-17' AND '2026-08-26';


-- ============================================================
-- 4. JONAS
-- Scenario: STABLE / HEALTHY
-- ============================================================

INSERT INTO public.daily_checkins (
  user_id,
  checkin_date,
  discipline,
  is_rest_day,
  duration_min,
  workout_type,
  rpe,
  physical_feeling,
  overall_feeling,
  satisfaction,
  expected_difficulty,
  performance_quality,
  session_goal_achieved,
  has_pain,
  pain_area,
  pain_note,
  performance_factors,
  mental_state,
  context_summary
)
SELECT
  'e86cb481-7ad8-4d87-a583-ec69d2460c03',
  d::date,
  'Sprint',
  false,

  CASE
    WHEN extract(day from d)::int % 3 = 0 THEN 80
    ELSE 70
  END,

  CASE
    WHEN extract(day from d)::int % 3 = 0 THEN 'Speed Endurance'
    WHEN extract(day from d)::int % 3 = 1 THEN 'Acceleration'
    ELSE 'Max Velocity'
  END,

  CASE
    WHEN extract(day from d)::int % 3 = 0 THEN 6
    ELSE 5
  END,

  4,
  4,
  4,

  'Wie erwartet',

  CASE
    WHEN extract(day from d)::int % 4 = 0
      THEN 'Besser geworden'
    ELSE 'Gleich geblieben'
  END,

  CASE
    WHEN extract(day from d)::int % 5 = 0
      THEN 'Teilweise'
    ELSE 'Ja'
  END,

  false,
  null,
  null,

  ARRAY['Schlaf'],

  'Fokussiert',

  'Stable training response with good consistency.'

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


INSERT INTO public.regeneration_checkins (
  user_id,
  checkin_date,
  sleep_quality,
  muscle_soreness,
  energy_level
)
SELECT
  'e86cb481-7ad8-4d87-a583-ec69d2460c03',
  d::date,

  CASE
    WHEN extract(day from d)::int % 4 = 0 THEN 4
    ELSE 5
  END,

  CASE
    WHEN extract(day from d)::int % 3 = 0 THEN 4
    ELSE 5
  END,

  CASE
    WHEN extract(day from d)::int % 5 = 0 THEN 4
    ELSE 5
  END

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


-- ============================================================
-- 5. LIAM
-- Scenario: WORSENING / NEEDS ATTENTION
-- ============================================================

INSERT INTO public.daily_checkins (
  user_id,
  checkin_date,
  discipline,
  is_rest_day,
  duration_min,
  workout_type,
  rpe,
  physical_feeling,
  overall_feeling,
  satisfaction,
  expected_difficulty,
  performance_quality,
  session_goal_achieved,
  has_pain,
  pain_area,
  pain_note,
  pain_severity,
  performance_factors,
  mental_state,
  context_summary
)
SELECT
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
  d::date,
  'Sprint',
  false,
  80,

  CASE
    WHEN extract(day from d)::int % 2 = 0
      THEN 'Speed Endurance'
    ELSE 'Acceleration'
  END,

  LEAST(
    9,
    5 + ((d::date - '2026-08-17'::date) / 2)
  ),

  GREATEST(
    2,
    4 - ((d::date - '2026-08-17'::date) / 4)
  ),

  GREATEST(
    2,
    4 - ((d::date - '2026-08-17'::date) / 4)
  ),

  GREATEST(
    2,
    4 - ((d::date - '2026-08-17'::date) / 4)
  ),

  CASE
    WHEN d::date >= '2026-08-24'
      THEN 'Viel härter als erwartet'
    WHEN d::date >= '2026-08-21'
      THEN 'Härter als erwartet'
    ELSE 'Wie erwartet'
  END,

  CASE
    WHEN d::date >= '2026-08-24'
      THEN 'Stark abgefallen'
    WHEN d::date >= '2026-08-21'
      THEN 'Schlechter geworden'
    ELSE 'Gleich geblieben'
  END,

  CASE
    WHEN d::date >= '2026-08-24'
      THEN 'Nein'
    WHEN d::date >= '2026-08-21'
      THEN 'Teilweise'
    ELSE 'Ja'
  END,

  d::date >= '2026-08-23',

  CASE
    WHEN d::date >= '2026-08-23'
      THEN 'Hamstring'
    ELSE null
  END,

  CASE
    WHEN d::date >= '2026-08-23'
      THEN 'Increasing tightness after sprint sessions.'
    ELSE null
  END,

  CASE
    WHEN d::date >= '2026-08-25'
      THEN 'mittel'
    WHEN d::date >= '2026-08-23'
      THEN 'leicht'
    ELSE null
  END,

  CASE
    WHEN d::date >= '2026-08-22'
      THEN ARRAY['Schlaf', 'Stress', 'Schule']
    ELSE ARRAY['Schlaf']
  END,

  CASE
    WHEN d::date >= '2026-08-23'
      THEN 'Müde'
    ELSE 'Okay'
  END,

  CASE
    WHEN d::date >= '2026-08-23'
      THEN 'Rising effort with poorer recovery and hamstring discomfort.'
    ELSE 'Training response beginning to worsen.'
  END

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


INSERT INTO public.regeneration_checkins (
  user_id,
  checkin_date,
  sleep_quality,
  muscle_soreness,
  energy_level
)
SELECT
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
  d::date,

  GREATEST(
    2,
    5 - ((d::date - '2026-08-17'::date) / 3)
  ),

  GREATEST(
    2,
    5 - ((d::date - '2026-08-17'::date) / 3)
  ),

  GREATEST(
    2,
    5 - ((d::date - '2026-08-17'::date) / 3)
  )

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


-- ============================================================
-- 6. SARAH
-- Scenario: MIXED / OCCASIONAL UNUSUAL RESPONSE
-- ============================================================

INSERT INTO public.daily_checkins (
  user_id,
  checkin_date,
  discipline,
  is_rest_day,
  duration_min,
  workout_type,
  rpe,
  physical_feeling,
  overall_feeling,
  satisfaction,
  expected_difficulty,
  performance_quality,
  session_goal_achieved,
  has_pain,
  pain_area,
  pain_note,
  performance_factors,
  mental_state,
  context_summary
)
SELECT
  '886ca750-7b72-49d0-aee8-af41968519ed',
  d::date,
  'Hurdles',
  false,
  75,

  CASE
    WHEN extract(day from d)::int % 2 = 0
      THEN 'Hurdle Technique'
    ELSE 'Acceleration'
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 8
    ELSE 6
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 'Härter als erwartet'
    ELSE 'Wie erwartet'
  END,

  CASE
    WHEN d::date = '2026-08-25'
      THEN 'Schlechter geworden'
    WHEN d::date IN ('2026-08-18', '2026-08-23')
      THEN 'Besser geworden'
    ELSE 'Gleich geblieben'
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 'Teilweise'
    ELSE 'Ja'
  END,

  false,
  null,
  null,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN ARRAY['Schule', 'Stress']
    ELSE ARRAY['Schlaf']
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 'Etwas müde'
    ELSE 'Fokussiert'
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 'Temporary harder-than-normal training response.'
    ELSE 'Generally stable hurdle-training response.'
  END

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


INSERT INTO public.regeneration_checkins (
  user_id,
  checkin_date,
  sleep_quality,
  muscle_soreness,
  energy_level
)
SELECT
  '886ca750-7b72-49d0-aee8-af41968519ed',
  d::date,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END,

  CASE
    WHEN d::date IN ('2026-08-20', '2026-08-25')
      THEN 3
    ELSE 4
  END

FROM generate_series(
  '2026-08-17'::date,
  '2026-08-26'::date,
  interval '1 day'
) AS d;


COMMIT;


-- ============================================================
-- VERIFY
-- ============================================================

SELECT
  p.display_name,
  COUNT(dc.id) AS checkins
FROM public.profiles p
LEFT JOIN public.daily_checkins dc
  ON dc.user_id = p.id
  AND dc.checkin_date BETWEEN '2026-08-17' AND '2026-08-26'
WHERE p.id IN (
  'e86cb481-7ad8-4d87-a583-ec69d2460c03',
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
  '886ca750-7b72-49d0-aee8-af41968519ed'
)
GROUP BY p.id, p.display_name
ORDER BY p.display_name;


SELECT
  p.display_name,
  COUNT(rc.id) AS regeneration_days
FROM public.profiles p
LEFT JOIN public.regeneration_checkins rc
  ON rc.user_id = p.id
  AND rc.checkin_date BETWEEN '2026-08-17' AND '2026-08-26'
WHERE p.id IN (
  'e86cb481-7ad8-4d87-a583-ec69d2460c03',
  'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6',
  '886ca750-7b72-49d0-aee8-af41968519ed'
)
GROUP BY p.id, p.display_name
ORDER BY p.display_name;
