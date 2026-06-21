CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  discipline TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  duration_min INT,
  rpe INT,
  has_pain BOOLEAN,
  pain_note TEXT,
  satisfaction INT,
  last_meal_before TEXT,
  ate_around_training TEXT,
  food_note TEXT,
  water_intake TEXT,
  sleep_hours TEXT,
  sleep_quality INT,
  woke_recovered TEXT,
  overall_feeling INT,
  extra_note TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own daily checkins"
  ON public.daily_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins (user_id, checkin_date DESC);