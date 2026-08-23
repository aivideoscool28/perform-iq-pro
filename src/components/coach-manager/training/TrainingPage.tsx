import { useState } from "react";

import { useCoachAthletes } from "@/hooks/useCoachAthletes";
import { Sparkles } from "lucide-react";

import { TrainingOverview } from "@/components/coach-manager/training/TrainingOverview";
import { TrainingIntelligence } from "@/components/coach-manager/training/TrainingIntelligence";
import { TrainingTools } from "@/components/coach-manager/training/TrainingTools";
import { TrainingSidebar } from "@/components/coach-manager/training/TrainingSidebar";

type TrainingView = "today" | "create" | "history";

export function TrainingPage() {
  const [activeView, setActiveView] =
    useState<TrainingView>("today");

  const { athletes } = useCoachAthletes();

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Training
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Training
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Plan today's session, manage individual adjustments and reuse
            previous training efficiently.
          </p>
        </div>

        {activeView === "today" && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Training Check
          </button>
        )}
      </section>

      <nav className="flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setActiveView("today")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "today"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Today & Training Plan
        </button>

        <button
          type="button"
          onClick={() => setActiveView("create")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "create"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Create Training & Exercise Library
        </button>

        <button
          type="button"
          onClick={() => setActiveView("history")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "history"
              ? "bg-white text-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          History
        </button>
      </nav>

      {activeView === "today" && (
        <div className="grid grid-cols-[1fr_0.28fr] items-start gap-3">
          <main className="min-w-0 space-y-3">
            <TrainingOverview />
            <TrainingIntelligence athletes={athletes} />
          </main>

          <TrainingSidebar mode="today" athletes={athletes} />
        </div>
      )}

      {activeView === "create" && (
        <TrainingTools />
      )}

      {activeView === "history" && (
        <TrainingSidebar mode="history" athletes={athletes} />
      )}
    </div>
  );
}


