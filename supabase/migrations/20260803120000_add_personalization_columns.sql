ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favourite_athlete text,
  ADD COLUMN IF NOT EXISTS receive_news_and_motivation boolean DEFAULT true; 