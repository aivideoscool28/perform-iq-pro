import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

import { canCoachAccessAthlete } from "@/lib/coach-manager/coach-athlete-access";

export type AthleteCheckin =
  Tables<"daily_checkins">;

export type AthleteWorkout =
  Tables<"workouts">;

export type AthleteAnalysis =
  Tables<"analysis_boards">;

export type AthleteVideoAnalysis =
  Tables<"video_analyses">;

type AthleteDetailData = {
  latestCheckin: AthleteCheckin | null;
  latestWorkout: AthleteWorkout | null;
  latestAnalysis: AthleteAnalysis | null;
  latestVideoAnalysis: AthleteVideoAnalysis | null;
};

const emptyData: AthleteDetailData = {
  latestCheckin: null,
  latestWorkout: null,
  latestAnalysis: null,
  latestVideoAnalysis: null,
};

export function useAthleteDetailData(
  athleteId: string | null | undefined,
) {
  const [data, setData] =
    useState<AthleteDetailData>(emptyData);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [accessDenied, setAccessDenied] =
    useState(false);

  useEffect(() => {
    if (!athleteId) {
      setData(emptyData);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAthleteData() {
      setLoading(true);
      setError(null);
      setAccessDenied(false);

      const access =
        await canCoachAccessAthlete(athleteId!);

      if (cancelled) {
        return;
      }

      if (!access.allowed) {
        setData(emptyData);
        setAccessDenied(true);
        setError(
          access.error ??
            "This athlete is not linked to the current coach.",
        );
        setLoading(false);
        return;
      }

      const [
        checkinResult,
        workoutResult,
        analysisResult,
        videoResult,
      ] = await Promise.all([
        supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", athleteId!)
          .order("checkin_date", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("workouts")
          .select("*")
          .eq("user_id", athleteId!)
          .order("workout_date", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("analysis_boards")
          .select("*")
          .eq("user_id", athleteId!)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("video_analyses")
          .select("*")
          .eq("user_id", athleteId!)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) {
        return;
      }

      const errors = [
        checkinResult.error,
        workoutResult.error,
        analysisResult.error,
        videoResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error(
          "Could not load complete athlete detail data:",
          errors,
        );

        setError(
          errors
            .map((item) => item?.message)
            .filter(Boolean)
            .join(" | "),
        );
      }

      setData({
        latestCheckin:
          checkinResult.data ?? null,
        latestWorkout:
          workoutResult.data ?? null,
        latestAnalysis:
          analysisResult.data ?? null,
        latestVideoAnalysis:
          videoResult.data ?? null,
      });

      setLoading(false);
    }

    void loadAthleteData();

    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  return {
    ...data,
    loading,
    error,
    accessDenied,
  };
}
