import { AthletesSummaryCards } from "@/components/coach-manager/athletes/AthletesSummaryCards";
import { AthletesTable } from "@/components/coach-manager/athletes/AthletesTable";
import { CoachActionCenter } from "@/components/coach-manager/athletes/CoachActionCenter";
import { AIAthleteBrief } from "@/components/coach-manager/athletes/AIAthleteBrief";
import { AthleteQuestionsCard } from "@/components/coach-manager/athletes/AthleteQuestionsCard";

export function AthletesPage() {
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
            100 athletes · Live overview · Focus on what matters.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          ✨ AI Athlete Brief
        </button>
      </section>

      <AthletesSummaryCards />

      <div className="grid grid-cols-[1fr_0.27fr] gap-3">
        <AthletesTable />

        <aside className="space-y-3">
          <CoachActionCenter />
          <AIAthleteBrief />
          <AthleteQuestionsCard />
        </aside>
      </div>
    </div>
  );
}


