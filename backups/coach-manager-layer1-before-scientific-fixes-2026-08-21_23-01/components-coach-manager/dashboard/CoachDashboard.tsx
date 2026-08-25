import { TodaysTrainingCard } from "@/components/coach-manager/dashboard/TodaysTrainingCard";
import { GroupTodayCard } from "@/components/coach-manager/dashboard/GroupTodayCard";
import { LatestDevelopments } from "@/components/coach-manager/dashboard/LatestDevelopments";
import { AthleteQuestions } from "@/components/coach-manager/dashboard/AthleteQuestions";
import { WeeklyTrainingOverview } from "@/components/coach-manager/dashboard/WeeklyTrainingOverview";
import { CoachInsightCard } from "@/components/coach-manager/dashboard/CoachInsightCard";

export function CoachDashboard() {
  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Today
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Your coaching overview
          </h2>
        </div>
      </section>

      <TodaysTrainingCard />

      <div className="grid grid-cols-[1fr_1fr_0.72fr] gap-3">
        <div className="space-y-3">
          <GroupTodayCard />
          <AthleteQuestions />
        </div>

        <div className="space-y-3">
          <LatestDevelopments />
          <CoachInsightCard />
        </div>

        <WeeklyTrainingOverview />
      </div>
    </div>
  );
}
