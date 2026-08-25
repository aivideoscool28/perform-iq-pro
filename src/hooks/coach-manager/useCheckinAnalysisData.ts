import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CheckinAnalysisRow = Tables<"daily_checkins">;

export function useCheckinAnalysisData() {
  return useQuery({
    queryKey: ["coach-manager", "checkin-analysis"],

    queryFn: async (): Promise<CheckinAnalysisRow[]> => {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("is_rest_day", false)
        .order("checkin_date", { ascending: false });

      if (error) {
        throw new Error(
          `Could not load Daily Check-In analysis data: ${error.message}`,
        );
      }

      return data ?? [];
    },
  });
}
