BEGIN;

-- Demo IDs
-- Coach: 8702a6f0-8e4b-45cb-88ef-51208375a28f
-- Jonas: e86cb481-7ad8-4d87-a583-ec69d2460c03
-- Liam:  f0c3252c-cbed-4467-9bc3-9a4d21fdcce6
-- Sarah: 886ca750-7b72-49d0-aee8-af41968519ed

-- Remove earlier seeded demo competitions with these names
DELETE FROM public.competition_entries
WHERE competition_id IN (
  SELECT id
  FROM public.competitions
  WHERE coach_id = '8702a6f0-8e4b-45cb-88ef-51208375a28f'
    AND name IN (
      'Cologne Sprint Meeting',
      'NRW Youth Championships',
      'Summer Test Meet'
    )
);

DELETE FROM public.competitions
WHERE coach_id = '8702a6f0-8e4b-45cb-88ef-51208375a28f'
  AND name IN (
    'Cologne Sprint Meeting',
    'NRW Youth Championships',
    'Summer Test Meet'
  );

-- ==========================================================
-- 1. UPCOMING MAIN COMPETITION
-- ==========================================================

WITH comp AS (
  INSERT INTO public.competitions (
    coach_id,
    name,
    competition_date,
    competition_type,
    location,
    venue,
    phase,
    priority,
    notes
  )
  VALUES (
    '8702a6f0-8e4b-45cb-88ef-51208375a28f',
    'NRW Youth Championships',
    '2026-09-05',
    'Championship',
    'Düsseldorf',
    'Arena-Sportpark',
    'upcoming',
    'high',
    'Main competition of the current preparation block.'
  )
  RETURNING id
)
INSERT INTO public.competition_entries (
  competition_id,
  athlete_id,
  events,
  goal,
  notes
)
SELECT id,
       'e86cb481-7ad8-4d87-a583-ec69d2460c03'::uuid,
       ARRAY['100m', '200m'],
       'PB attempt in 100m and controlled 200m execution',
       'Focus on acceleration and transition.'
FROM comp

UNION ALL

SELECT id,
       'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6'::uuid,
       ARRAY['100m'],
       'Compete only if hamstring symptoms remain low',
       'Coach should review recent training response before final decision.'
FROM comp

UNION ALL

SELECT id,
       '886ca750-7b72-49d0-aee8-af41968519ed'::uuid,
       ARRAY['100m Hurdles'],
       'Stable rhythm through hurdles 6-10',
       'Main technical competition goal.'
FROM comp;


-- ==========================================================
-- 2. UPCOMING PREPARATION MEET
-- ==========================================================

WITH comp AS (
  INSERT INTO public.competitions (
    coach_id,
    name,
    competition_date,
    competition_type,
    location,
    venue,
    phase,
    priority,
    notes
  )
  VALUES (
    '8702a6f0-8e4b-45cb-88ef-51208375a28f',
    'Cologne Sprint Meeting',
    '2026-08-30',
    'Meeting',
    'Köln',
    'NetCologne Stadion',
    'upcoming',
    'medium',
    'Preparation meet before the main championship.'
  )
  RETURNING id
)
INSERT INTO public.competition_entries (
  competition_id,
  athlete_id,
  events,
  goal,
  notes
)
SELECT id,
       'e86cb481-7ad8-4d87-a583-ec69d2460c03'::uuid,
       ARRAY['100m'],
       'Execute first 30m cleanly',
       'No need to chase maximum result.'
FROM comp

UNION ALL

SELECT id,
       '886ca750-7b72-49d0-aee8-af41968519ed'::uuid,
       ARRAY['100m Hurdles'],
       'Practice race rhythm under competition pressure',
       'Use as preparation for NRW Championships.'
FROM comp;


-- ==========================================================
-- 3. PAST COMPETITION WITH RESULTS
-- ==========================================================

WITH comp AS (
  INSERT INTO public.competitions (
    coach_id,
    name,
    competition_date,
    competition_type,
    location,
    venue,
    phase,
    priority,
    notes
  )
  VALUES (
    '8702a6f0-8e4b-45cb-88ef-51208375a28f',
    'Summer Test Meet',
    '2026-08-16',
    'Test Meet',
    'Leverkusen',
    'Manfort Stadium',
    'completed',
    'low',
    'Used as a performance checkpoint before the next training block.'
  )
  RETURNING id
)
INSERT INTO public.competition_entries (
  competition_id,
  athlete_id,
  events,
  goal,
  result,
  notes
)
SELECT id,
       'e86cb481-7ad8-4d87-a583-ec69d2460c03'::uuid,
       ARRAY['100m'],
       'Strong acceleration and relaxed top speed',
       '11.42',
       'Good execution, especially through transition.'
FROM comp

UNION ALL

SELECT id,
       'f0c3252c-cbed-4467-9bc3-9a4d21fdcce6'::uuid,
       ARRAY['100m'],
       'Maintain form through final 30m',
       '11.78',
       'Performance dropped late in the race.'
FROM comp

UNION ALL

SELECT id,
       '886ca750-7b72-49d0-aee8-af41968519ed'::uuid,
       ARRAY['100m Hurdles'],
       'Consistent hurdle rhythm',
       '14.86',
       'Good first half, rhythm became less stable late.'
FROM comp;

COMMIT;

SELECT
  c.name,
  c.competition_date,
  c.phase,
  c.priority,
  COUNT(ce.id) AS athletes
FROM public.competitions c
LEFT JOIN public.competition_entries ce
  ON ce.competition_id = c.id
WHERE c.coach_id = '8702a6f0-8e4b-45cb-88ef-51208375a28f'
  AND c.name IN (
    'NRW Youth Championships',
    'Cologne Sprint Meeting',
    'Summer Test Meet'
  )
GROUP BY c.id, c.name, c.competition_date, c.phase, c.priority
ORDER BY c.competition_date;

