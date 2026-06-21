
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Athlete',
  avatar_url TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT lower(substring(md5(random()::text) from 1 for 8)),
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_workout_date DATE,
  streak_freezes_remaining INT NOT NULL DEFAULT 1,
  streak_freezes_last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_input TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INT,
  intensity TEXT,
  summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workouts_user_date ON public.workouts (user_id, workout_date DESC);

CREATE TABLE public.analysis_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  positives JSONB NOT NULL DEFAULT '[]'::jsonb,
  negatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analysis_user_created ON public.analysis_boards (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_boards ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "profiles_select_own_or_friend" ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
        AND ((f.user_id = auth.uid() AND f.friend_id = profiles.id)
          OR (f.friend_id = auth.uid() AND f.user_id = profiles.id))
    )
  );
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Policies: friendships
CREATE POLICY "friendships_select_involved" ON public.friendships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "friendships_insert_self" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "friendships_delete_involved" ON public.friendships FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Policies: workouts
CREATE POLICY "workouts_select_own" ON public.workouts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "workouts_insert_own" ON public.workouts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "workouts_update_own" ON public.workouts FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "workouts_delete_own" ON public.workouts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Policies: analysis_boards
CREATE POLICY "analysis_select_own" ON public.analysis_boards FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "analysis_insert_own" ON public.analysis_boards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "analysis_update_own" ON public.analysis_boards FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "analysis_delete_own" ON public.analysis_boards FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             split_part(NEW.email, '@', 1),
             'Athlete')
  );
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Streak updater on workout insert
CREATE OR REPLACE FUNCTION public.update_streak_on_workout()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p RECORD;
  gap INT;
  new_streak INT;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id) VALUES (NEW.user_id);
    SELECT * INTO p FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  END IF;

  IF date_trunc('week', p.streak_freezes_last_reset) <> date_trunc('week', CURRENT_DATE) THEN
    UPDATE public.profiles
      SET streak_freezes_remaining = 1,
          streak_freezes_last_reset = CURRENT_DATE
      WHERE id = NEW.user_id;
    p.streak_freezes_remaining := 1;
  END IF;

  IF p.last_workout_date IS NULL THEN
    new_streak := 1;
  ELSIF p.last_workout_date = NEW.workout_date THEN
    new_streak := GREATEST(p.current_streak, 1);
  ELSE
    gap := NEW.workout_date - p.last_workout_date;
    IF gap = 1 THEN
      new_streak := p.current_streak + 1;
    ELSIF gap = 2 AND p.streak_freezes_remaining > 0 THEN
      UPDATE public.profiles
        SET streak_freezes_remaining = streak_freezes_remaining - 1
        WHERE id = NEW.user_id;
      new_streak := p.current_streak + 1;
    ELSE
      new_streak := 1;
    END IF;
  END IF;

  UPDATE public.profiles
    SET current_streak = new_streak,
        longest_streak = GREATEST(longest_streak, new_streak),
        last_workout_date = NEW.workout_date,
        updated_at = now()
    WHERE id = NEW.user_id;

  RETURN NEW;
END $$;

CREATE TRIGGER trg_update_streak
  AFTER INSERT ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_workout();

-- Accept invite code -> creates symmetric friendship
CREATE OR REPLACE FUNCTION public.accept_invite(invite_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM public.profiles WHERE profiles.invite_code = lower(accept_invite.invite_code);
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  IF target_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot add yourself';
  END IF;

  INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (auth.uid(), target_id, 'accepted')
    ON CONFLICT DO NOTHING;
  INSERT INTO public.friendships (user_id, friend_id, status)
    VALUES (target_id, auth.uid(), 'accepted')
    ON CONFLICT DO NOTHING;

  RETURN target_id;
END $$;

GRANT EXECUTE ON FUNCTION public.accept_invite(TEXT) TO authenticated;
