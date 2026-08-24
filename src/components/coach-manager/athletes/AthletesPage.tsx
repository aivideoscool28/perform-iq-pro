import { useCoachAthletes } from "@/hooks/useCoachAthletes";

import { AthletesSummaryCards } from "@/components/coach-manager/athletes/AthletesSummaryCards";
import { AthletesTable } from "@/components/coach-manager/athletes/AthletesTable";

export function AthletesPage() {
  const { athletes, loading, error } = useCoachAthletes();

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Athletes
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Manage Your Athletes
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Find who needs attention, understand why, and open the
            right athlete quickly.
          </p>
        </div>
      </section>

      <AthletesSummaryCards athletes={athletes} />

      <AthletesTable
        athletes={athletes}
        loading={loading}
        error={error}
      />
    </div>
  );
}
