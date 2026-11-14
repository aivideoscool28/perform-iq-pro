import { calendarDate } from "@/lib/dates";
import { assertQueriesSucceeded, computeStreakFromCheckins } from "@/lib/dashboard-data";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ------------------------ DASHBOARD ------------------------ */
export const fetchDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const results = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("analysis_boards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("daily_checkins")
        .select(
          "checkin_date,is_rest_day,discipline,rpe,expected_difficulty,performance_quality,session_goal_achieved,physical_feeling,has_pain,performance_factors,ai_summary",
        )
        .eq("user_id", userId)
        .order("checkin_date", { ascending: false })
        .limit(180),
    ]);
    assertQueriesSucceeded(results);
    const [{ data: profile }, { data: workouts }, { data: boards }, { data: checkins }] = results;
    const today = calendarDate(new Date(), profile?.timezone ?? "UTC");
    const workedOutToday = (workouts ?? []).some((w) => w.workout_date === today);
    const computedStreak = computeStreakFromCheckins(checkins ?? [], today);
    return {
      today,
      profile,
      workouts: workouts ?? [],
      boards: boards ?? [],
      workedOutToday,
      checkins: checkins ?? [],
      computedStreak,
    };
  });
