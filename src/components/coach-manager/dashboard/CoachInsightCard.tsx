import {
  Sparkles,
  Users,
  Layers3,
  ArrowRight,
} from "lucide-react";

export function CoachInsightCard() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-background to-blue-50 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Athletic IQ Insight
            </p>

            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">
              TRAINING RESPONSE
            </span>
          </div>

          <h3 className="mt-1 text-base font-bold">
            Speed Endurance is worth reviewing
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Recent Speed Endurance sessions show a different athlete response
            compared with recent similar sessions.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-white/70 px-2 py-1">
              <Users className="h-3 w-3 text-violet-500" />

              <span className="text-[9px] font-medium">
                5 athletes affected
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-white/70 px-2 py-1">
              <Layers3 className="h-3 w-3 text-violet-500" />

              <span className="text-[9px] font-medium">
                Repeated across 2 sessions
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600"
          >
            View evidence
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
