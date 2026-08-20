import { Sparkles } from "lucide-react";

import { TrainingOverview } from "@/components/coach-manager/training/TrainingOverview";
import { TrainingIntelligence } from "@/components/coach-manager/training/TrainingIntelligence";
import { TrainingTools } from "@/components/coach-manager/training/TrainingTools";
import { TrainingSidebar } from "@/components/coach-manager/training/TrainingSidebar";

export function TrainingPage() {
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
            Plan, adjust and deliver the best training for your athletes.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Training Check
        </button>
      </section>

      <div className="grid grid-cols-[1fr_0.28fr] gap-3">
        <main className="min-w-0 space-y-3">
          <TrainingOverview />
          <TrainingIntelligence />
          <TrainingTools />
        </main>

        <TrainingSidebar />
      </div>
    </div>
  );
}
