import { useState } from "react";

import { useCoachAthletes } from "@/hooks/useCoachAthletes";

import { AthletesSummaryCards } from "@/components/coach-manager/athletes/AthletesSummaryCards";
import { AthletesTable } from "@/components/coach-manager/athletes/AthletesTable";
import { CoachActionCenter } from "@/components/coach-manager/athletes/CoachActionCenter";
import { AIAthleteBrief } from "@/components/coach-manager/athletes/AIAthleteBrief";
import { AthleteQuestionsCard } from "@/components/coach-manager/athletes/AthleteQuestionsCard";

type AthleteView = "overview" | "intelligence";

export function AthletesPage() {
  const [activeView, setActiveView] =
    useState<AthleteView>("overview");

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

      <nav className="flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setActiveView("overview")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "overview"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Athlete Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveView("intelligence")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "intelligence"
              ? "bg-white text-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          ✨ Athlete Intelligence
        </button>
      </nav>

      {activeView === "overview" && (
        <>
          <AthletesSummaryCards athletes={athletes} />
          <AthletesTable
            athletes={athletes}
            loading={loading}
            error={error}
          />
        </>
      )}

      {activeView === "intelligence" && (
        <div className="grid grid-cols-[1.05fr_0.95fr] items-start gap-3">
          <div className="space-y-3">
            <AIAthleteBrief />
          </div>

          <div className="space-y-3">
            <CoachActionCenter />
            <AthleteQuestionsCard />
          </div>
        </div>
      )}
    </div>
  );
}


