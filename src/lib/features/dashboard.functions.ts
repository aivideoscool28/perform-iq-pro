import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ------------------------ DASHBOARD ------------------------ */
export const fetchDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: workouts }, { data: boards }, { data: checkins }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("workouts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("analysis_boards").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("daily_checkins").select("checkin_date,is_rest_day,discipline,rpe,expected_difficulty,performance_quality,session_goal_achieved,physical_feeling,has_pain,performance_factors,ai_summary").eq("user_id", userId).order("checkin_date", { ascending: false }).limit(180),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const workedOutToday = (workouts ?? []).some((w) => w.workout_date === today);
    const computedStreak = computeStreakFromCheckins(checkins ?? []);
    return {
      profile,
      workouts: workouts ?? [],
      boards: boards ?? [],
      workedOutToday,
      checkins: checkins ?? [],
      computedStreak,
    };
  });

function computeStreakFromCheckins(
  rows: Array<{ checkin_date: string; is_rest_day: boolean | null }>,
): number {
  const map = new Map<string, boolean>(); // date -> is_rest_day
  for (const r of rows) map.set(r.checkin_date, !!r.is_rest_day);
  let streak = 0;
  let missed = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (map.has(iso)) {
      if (!map.get(iso)) streak += 1;
      missed = 0;
    } else {
      // Today not yet checked in: don't count as missed
      if (i > 0) {
        missed += 1;
        if (missed > 2) break;
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}


