-- Athletic IQ Onboarding V2
-- Adds the two new athlete-personalization fields used by onboarding and Profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal_motivation text,
  ADD COLUMN IF NOT EXISTS current_focus text;
