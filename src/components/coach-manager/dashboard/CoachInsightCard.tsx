import { Sparkles } from "lucide-react";

export function CoachInsightCard() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-background to-blue-50 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Coach Insight
            </p>

            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">
              PERFORMANCE
            </span>
          </div>

          <h3 className="mt-1 text-base font-bold">
            Sprint performance improving
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Your group has shown a positive acceleration trend across recent sessions.
          </p>

          <button
            type="button"
            className="mt-2 text-xs font-semibold text-violet-600"
          >
            Review insight →
          </button>
        </div>
      </div>
    </section>
  );
}
