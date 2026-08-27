DROP POLICY IF EXISTS "Coaches can view shared athlete videos"
ON storage.objects;

CREATE POLICY "Coaches can view shared athlete videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'athlete-videos'
  AND EXISTS (
    SELECT 1
    FROM public.video_analyses va
    JOIN public.coach_athletes ca
      ON ca.athlete_id = va.user_id
    WHERE ca.coach_id = auth.uid()
      AND va.shared_with_coach = true
      AND va.storage_path = storage.objects.name
  )
);
