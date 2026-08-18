-- Athletic IQ Onboarding V2 multi-select refinement

ALTER TABLE public.profiles
  ALTER COLUMN goal_motivation TYPE text[]
  USING CASE
    WHEN goal_motivation IS NULL THEN NULL
    ELSE ARRAY[goal_motivation]
  END,
  ALTER COLUMN current_focus TYPE text[]
  USING CASE
    WHEN current_focus IS NULL THEN NULL
    ELSE ARRAY[current_focus]
  END;
