import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type CoachAthlete = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  disciplines: string[] | null;
  current_focus: string | null;
};

export function useCoachAthletes() {
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAthletes() {
      setLoading(true);
      setError(null);

      let coachId: string | null = null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        coachId = user.id;
      } else {
        // TEMPORARY development fallback.
        // Remove once Coach Manager authentication is connected.
        coachId = "8702a6f0-8e4b-45cb-88ef-51208375a28f";
      }

      const { data: links, error: linksError } = await supabase
        .from("coach_athletes")
        .select("athlete_id")
        .eq("coach_id", coachId);

      if (linksError) {
        console.error("Could not load coach athletes:", linksError);
        setAthletes([]);
        setError(linksError.message);
        setLoading(false);
        return;
      }

      const athleteIds =
        links?.map((link) => link.athlete_id) ?? [];

      if (athleteIds.length === 0) {
        setAthletes([]);
        setLoading(false);
        return;
      }

      const { data, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, age, disciplines, current_focus",
        )
        .in("id", athleteIds);

      if (profilesError) {
        console.error(
          "Could not load athlete profiles:",
          profilesError,
        );
        setAthletes([]);
        setError(profilesError.message);
      } else {
        setAthletes((data ?? []) as CoachAthlete[]);
      }

      setLoading(false);
    }

    void loadAthletes();
  }, []);

  return {
    athletes,
    loading,
    error,
  };
}

