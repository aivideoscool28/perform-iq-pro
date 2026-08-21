import {
  Activity,
  ArrowRight,
  BatteryCharging,
  CircleCheck,
  Sparkles,
  Users,
} from "lucide-react";

const overviewSignals = [
  {
    eyebrow: "CHECK-IN",
    title: "Training felt harder than intended",
    description:
      "8 recent sessions include athletes who reported higher difficulty than expected.",
    evidence: "5 athletes · 8 sessions",
    action: "Open Check-In Analysis",
    icon: Activity,
    iconBox: "bg-orange-50",
    iconColor: "text-orange-600",
    border: "border-orange-100",
    tint: "bg-orange-50/25",
    actionColor: "text-orange-600",
  },
  {
    eyebrow: "REGENERATION",
    title: "5 athletes differ from their recent normal",
    description:
      "Repeated or combined changes in sleep, soreness or energy are worth reviewing.",
    evidence: "5 athletes · repeated signals",
    action: "Open Regeneration Analysis",
    icon: BatteryCharging,
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    border: "border-green-100",
    tint: "bg-green-50/25",
    actionColor: "text-green-600",
  },
  {
    eyebrow: "TRAINING RESPONSE",
    title: "Speed Endurance stands out",
    description:
      "Recent comparable Speed Endurance sessions show a different athlete response pattern.",
    evidence: "2 comparable sessions · 5 athletes",
    action: "Open Training Response",
    icon: Sparkles,
    iconBox: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
    tint: "bg-violet-50/25",
    actionColor: "text-violet-600",
  },
];

export function AnalysisOverviewPanels() {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600">
              Analysis Overview
            </p>

            <h2 className="mt-1 text-lg font-bold">
              What deserves your attention?
            </h2>

            <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-muted-foreground">
              Athletic IQ highlights meaningful changes first. Open a deeper
              analysis only when you want to understand the evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/40 px-3 py-2">
            <CircleCheck className="h-4 w-4 text-green-600" />

            <div>
              <p className="text-[9px] font-semibold text-green-700">
                Most athletes within recent normal
              </p>

              <p className="text-[8px] text-muted-foreground">
                No broad group-level concern detected
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {overviewSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <button
              key={signal.eyebrow}
              type="button"
              className={`group flex min-h-[190px] flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${signal.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${signal.iconBox}`}
                >
                  <Icon className={`h-5 w-5 ${signal.iconColor}`} />
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>

              <p className={`mt-4 text-[9px] font-bold tracking-wide ${signal.actionColor}`}>
                {signal.eyebrow}
              </p>

              <h3 className="mt-1 text-sm font-bold">
                {signal.title}
              </h3>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                {signal.description}
              </p>

              <div
                className={`mt-auto rounded-xl border border-white/50 px-3 py-2 ${signal.tint}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-[8px] font-medium text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {signal.evidence}
                  </span>

                  <span className={`text-[8px] font-semibold ${signal.actionColor}`}>
                    {signal.action} →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold">
            Data context
          </p>

          <p className="mt-0.5 text-[8px] text-muted-foreground">
            92 of 100 athletes submitted recent check-in data. Athletes without
            enough recent history should not receive confident baseline-based
            interpretations.
          </p>
        </div>

        <button
          type="button"
          className="text-[9px] font-semibold text-violet-600"
        >
          View data coverage →
        </button>
      </section>
    </div>
  );
}
