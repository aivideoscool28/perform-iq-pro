import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { CoachAthlete } from "@/hooks/useCoachAthletes";

export type RegenerationCheckin = {
  user_id: string;
  checkin_date: string;
  sleep_quality: number;
  muscle_soreness: number;
  energy_level: number;
  updated_at: string | null;
};

export type AthleteRegeneration = {
  athlete: CoachAthlete;
  checkins: RegenerationCheckin[];
  today: RegenerationCheckin | null;
};

type UseCoachRegenerationResult = {
  regeneration: AthleteRegeneration[];
  loading: boolean;
  error: string | null;
};

export function useCoachRegeneration(
  athletes: CoachAthlete[],
): UseCoachRegenerationResult {
  const [regeneration, setRegeneration] = useState<
    AthleteRegeneration[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRegeneration() {
      setLoading(true);
      setError(null);

      if (athletes.length === 0) {
        setRegeneration([]);
        setLoading(false);
        return;
      }

      const athleteIds = athletes.map((athlete) => athlete.id);

      /*
      ---------------------------------------------------------
      LOAD RECENT REGENERATION DATA
      ---------------------------------------------------------

      We currently load the latest 30 days.

      Supabase RLS must ensure that the logged-in coach can
      only read regeneration data belonging to athletes linked
      to that coach.
      ---------------------------------------------------------
      */

      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const startDate = thirtyDaysAgo
        .toISOString()
        .slice(0, 10);

      const { data, error: regenerationError } =
        await supabase
          .from("regeneration_checkins")
          .select(
            `
              user_id,
              checkin_date,
              sleep_quality,
              muscle_soreness,
              energy_level,
              updated_at
            `,
          )
          .in("user_id", athleteIds)
          .gte("checkin_date", startDate)
          .order("checkin_date", {
            ascending: false,
          });

      if (regenerationError) {
        console.error(
          "Could not load coach regeneration data:",
          regenerationError,
        );

        setRegeneration([]);
        setError(regenerationError.message);
        setLoading(false);
        return;
      }

      const checkins =
        (data ?? []) as RegenerationCheckin[];

      const today = new Date()
        .toISOString()
        .slice(0, 10);

      /*
      ---------------------------------------------------------
      GROUP CHECK-INS BY ATHLETE
      ---------------------------------------------------------
      */

      const result = athletes.map((athlete) => {
        const athleteCheckins = checkins.filter(
          (checkin) => checkin.user_id === athlete.id,
        );

        const todayCheckin =
          athleteCheckins.find(
            (checkin) => checkin.checkin_date === today,
          ) ?? null;

        return {
          athlete,
          checkins: athleteCheckins,
          today: todayCheckin,
        };
      });

      setRegeneration(result);
      setLoading(false);
    }

    void loadRegeneration();
  }, [athletes]);

  return {
    regeneration,
    loading,
    error,
  };
}
