
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_streak_on_workout() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_invite(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite(TEXT) TO authenticated;
