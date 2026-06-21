DROP TRIGGER IF EXISTS workouts_update_streak_after_insert ON public.workouts;

CREATE TRIGGER workouts_update_streak_after_insert
AFTER INSERT ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_streak_on_workout();