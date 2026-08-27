ALTER TABLE public.video_analyses
ADD COLUMN IF NOT EXISTS shared_with_coach boolean NOT NULL DEFAULT false;

ALTER TABLE public.video_analyses
ADD COLUMN IF NOT EXISTS shared_with_coach_at timestamptz;
