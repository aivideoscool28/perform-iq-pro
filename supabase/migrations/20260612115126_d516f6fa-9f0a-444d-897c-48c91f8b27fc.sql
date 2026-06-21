ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS disciplines text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS goals text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS training_days_per_week integer,
  ADD COLUMN IF NOT EXISTS training_setup text,
  ADD COLUMN IF NOT EXISTS injuries text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;