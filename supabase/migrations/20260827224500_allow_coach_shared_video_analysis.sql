DROP POLICY IF EXISTS "Coaches can view shared athlete video analyses"
ON public.video_analyses;

CREATE POLICY "Coaches can view shared athlete video analyses"
ON public.video_analyses
FOR SELECT
TO authenticated
USING (
  shared_with_coach = true
  AND EXISTS (
    SELECT 1
    FROM public.coach_athletes ca
    WHERE ca.coach_id = auth.uid()
      AND ca.athlete_id = video_analyses.user_id
  )
);
