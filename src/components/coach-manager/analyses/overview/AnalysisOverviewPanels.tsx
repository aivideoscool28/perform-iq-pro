import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Sparkles,
} from "lucide-react";

import type {
  AnalysisTab,
} from "../AnalysesTabs";

const overviewSignals = [
  {
    eyebrow: "CHECK-IN",
    title: "Review athlete training responses",
    description:
      "Understand perceived difficulty, goal achievement, performance quality and athlete-reported factors.",
    action: "Open Check-In Analysis",
    tab: "checkin" as const,
    icon: Activity,
    iconBox: "bg-orange-50",
    iconColor: "text-orange-600",
    border: "border-orange-100",
    tint: "bg-orange-50/25",
    actionColor: "text-orange-600",
  },
  {
    eyebrow: "REGENERATION",
    title: "Review regeneration patterns",
    description:
      "Inspect sleep, soreness and energy responses and compare athletes with their recent personal patterns.",
    action: "Open Regeneration Analysis",
    tab: "regeneration" as const,
    icon: BatteryCharging,
    iconBox: "bg-green-50",
    iconColor: "text-green-600",
    border: "border-green-100",
    tint: "bg-green-50/25",
    actionColor: "text-green-600",
  },
  {
    eyebrow: "TRAINING RESPONSE",
    title: "Compare responses by training type",
    description:
      "See how athletes responded to different training types and compare them with recent similar sessions.",
    action: "Open Training Response",
    tab: "training-response" as const,
    icon: Sparkles,
    iconBox: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
    tint: "bg-violet-50/25",
    actionColor: "text-violet-600",
  },
];

export function AnalysisOverviewPanels({
  onOpenAnalysis,
}: {
  onOpenAnalysis: (tab: AnalysisTab) => void;
}) {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-violet-600">
            Analysis Overview
          </p>

          <h2 className="mt-1 text-lg font-bold">
            Choose what you want to investigate
          </h2>

          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            Open a focused analysis to understand athlete responses,
            regeneration patterns or differences between training sessions.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {overviewSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <button
              key={signal.eyebrow}
              type="button"
              onClick={() => onOpenAnalysis(signal.tab)}
              className={`group flex min-h-[180px] flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${signal.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${signal.iconBox}`}
                >
                  <Icon
                    className={`h-5 w-5 ${signal.iconColor}`}
                  />
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>

              <p
                className={`mt-4 text-[13px] font-bold tracking-wide ${signal.actionColor}`}
              >
                {signal.eyebrow}
              </p>

              <h3 className="mt-1 text-sm font-bold">
                {signal.title}
              </h3>

              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {signal.description}
              </p>

              <div
                className={`mt-auto rounded-xl border border-white/50 px-3 py-2 ${signal.tint}`}
              >
                <span
                  className={`text-[12px] font-semibold ${signal.actionColor}`}
                >
                  {signal.action} →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-white px-4 py-3">
        <p className="text-[13px] text-muted-foreground">
          Analysis findings are based on available athlete data. Open the
          relevant analysis to inspect the underlying evidence before making
          coaching decisions.
        </p>
      </section>
    </div>
  );
}

