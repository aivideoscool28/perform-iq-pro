import { useState } from "react";

import { useCoachAthletes } from "@/hooks/useCoachAthletes";
import {
  CalendarDays,
  Sparkles,
} from "lucide-react";

import {
  AnalysesTabs,
  type AnalysisTab,
} from "@/components/coach-manager/analyses/AnalysesTabs";

import { AnalysisOverviewPanels } from "@/components/coach-manager/analyses/overview/AnalysisOverviewPanels";
import { CheckinAnalysis } from "@/components/coach-manager/analyses/check-in/CheckinAnalysis";
import { RegenerationAnalysis } from "@/components/coach-manager/analyses/regeneration/RegenerationAnalysis";
import { TrainingResponse } from "@/components/coach-manager/analyses/TrainingResponse";
import { SessionComparison } from "@/components/coach-manager/analyses/session-comparison/SessionComparison";

export function AnalysesPage() {
  const [activeTab, setActiveTab] =
    useState<AnalysisTab>("overview");

  const { athletes } = useCoachAthletes();

  const isOverview = activeTab === "overview";
  const isCheckin = activeTab === "checkin";
  const isRegeneration = activeTab === "regeneration";
  const isTrainingResponse = activeTab === "training-response";
  const isSessionComparison = activeTab === "session-comparison";

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
            Analyses
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {isCheckin ? "Check-In Analysis" : isRegeneration ? "Regeneration Analysis" : isTrainingResponse ? "Training Response" : isSessionComparison ? "Session Comparison" : "Analyses"}
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            {isCheckin
              ? "Understand how athletes responded to training and what influenced them."
              : isRegeneration
                ? "Understand how athletes are recovering and which athletes may need attention."
                : isTrainingResponse
                  ? "Understand how athletes responded to recent training sessions."
                  : "See what changed and open only the analysis that deserves attention."}
          </p>
        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[10px] font-semibold">
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            Last 4 weeks
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Insights
          </button>
        </div>
      </section>

      <AnalysesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isOverview && (
        <AnalysisOverviewPanels
          onOpenAnalysis={setActiveTab}
        />
      )}

      {isCheckin && <CheckinAnalysis />}

      {isRegeneration && <RegenerationAnalysis athletes={athletes} />}

      {isTrainingResponse && <TrainingResponse />}

      {isSessionComparison && <SessionComparison />}

      {!isOverview && !isCheckin && !isRegeneration && !isTrainingResponse && !isSessionComparison && (
        <section className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-border bg-white">
          <div className="text-center">
            <Sparkles className="mx-auto h-6 w-6 text-violet-500" />

            <p className="mt-3 text-sm font-bold">
              This analysis is next
            </p>

            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              We will design this section before implementing it so each
              analysis has a clear coaching purpose.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}


















