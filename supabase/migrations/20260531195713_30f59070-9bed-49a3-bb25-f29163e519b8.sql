
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.gear_profile (
  user_id UUID PRIMARY KEY,
  shoe_size_eu NUMERIC(4,1),
  foot_width TEXT,
  preferred_brands TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_profile TO authenticated;
GRANT ALL ON public.gear_profile TO service_role;

ALTER TABLE public.gear_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gear_profile_select_own" ON public.gear_profile FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "gear_profile_insert_own" ON public.gear_profile FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "gear_profile_update_own" ON public.gear_profile FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "gear_profile_delete_own" ON public.gear_profile FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER gear_profile_set_updated_at
BEFORE UPDATE ON public.gear_profile
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.gear_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  discipline TEXT,
  started_on DATE NOT NULL DEFAULT CURRENT_DATE,
  distance_km INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gear_logs TO authenticated;
GRANT ALL ON public.gear_logs TO service_role;

ALTER TABLE public.gear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gear_logs_select_own" ON public.gear_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "gear_logs_insert_own" ON public.gear_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "gear_logs_update_own" ON public.gear_logs FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "gear_logs_delete_own" ON public.gear_logs FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX gear_logs_user_started_idx ON public.gear_logs (user_id, started_on DESC);
