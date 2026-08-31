import { Sparkles } from "lucide-react";

export function AIAthleteBrief() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-blue-50/40 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div>
          <p className="text-[14px] font-semibold uppercase tracking-wide text-violet-600">
            AI Athlete Brief
          </p>

          <h3 className="text-sm font-bold">
            What matters right now
          </h3>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Three athletes have meaningful changes worth reviewing today.
        Tom reported hamstring discomfort after training. Jonas has shown
        elevated fatigue across recent check-ins. Most athletes currently
        show no significant negative changes.
      </p>

      <button
        type="button"
        className="mt-3 text-[14px] font-semibold text-violet-600"
      >
        View deeper athlete insights →
      </button>
    </section>
  );
}

