import type { CoachAthlete } from "@/hooks/useCoachAthletes";

import {
  Activity,
  AlertCircle,
  Check,
  CircleHelp,
  HeartPulse,
  RefreshCw,
  Sparkles,
  Target,
  Dumbbell,
  Users,
} from "lucide-react";

type TrainingIntelligenceProps = {
  athletes: CoachAthlete[];
};
export function TrainingIntelligence({
  athletes,
}: TrainingIntelligenceProps) {
  const changes = athletes.map((athlete) => ({
    initials: athlete.display_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(""),
    name: athlete.display_name,
    reason: "Latest athlete data connected",
    tag: "Linked",
    icon: Activity,
    style: "bg-slate-50 text-slate-600",
  }));

  const adjustments = athletes.map((athlete) => ({
    initials: athlete.display_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(""),
    name: athlete.display_name,
    change: "Individual training connection pending",
    tag: "Linked",
    icon: Target,
    style: "bg-slate-50 text-slate-600",
  }));
  return (
    <div className="grid grid-cols-[1.05fr_0.95fr_0.9fr] gap-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-red-500" />

          <div>
            <h3 className="text-xs font-bold">Before You Coach</h3>
            <p className="text-[9px] text-muted-foreground">
              What changed since the latest athlete data.
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-3 bg-green-50/45 px-3 py-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-500 text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold text-green-600">
                  19 athletes
                </p>
              </div>

              <p className="text-[8px] text-muted-foreground">
                No relevant changes
              </p>

              <p className="text-[8px] font-medium text-green-600">
                Good to go
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 border-t border-orange-100 bg-orange-50/40 px-3 py-2 text-left transition hover:bg-orange-50/70"
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-100">
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-orange-600">
                3 athletes
              </p>

              <p className="text-[8px] text-muted-foreground">
                Changes worth reviewing
              </p>
            </div>

            <span className="text-[8px] font-semibold text-orange-600">
              View details →
            </span>
          </button>

          <div className="flex items-center gap-3 border-t border-border bg-slate-50/60 px-3 py-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100">
              <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-600">
                2 athletes
              </p>

              <p className="text-[8px] text-muted-foreground">
                Insufficient recent data
              </p>
            </div>

            <span className="text-[8px] text-muted-foreground">
              Not enough recent data
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="text-[9px] font-semibold text-muted-foreground">
            Key changes
          </p>

          {changes.map((athlete) => {
            const Icon = athlete.icon;

            return (
              <button
                key={athlete.name}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-border/70 px-2 py-1.5 text-left transition hover:bg-muted/20"
              >
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${athlete.style}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">{athlete.name}</p>
                  <p className="text-[8px] text-muted-foreground">
                    {athlete.reason}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${athlete.style}`}
                >
                  {athlete.tag}
                </span>

                <span className="text-[10px] text-muted-foreground">→</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />

          <div>
            <h3 className="text-xs font-bold">Training Adjustments</h3>
            <p className="text-[9px] text-muted-foreground">
              Individual changes you have made.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-green-100 bg-green-50/30 p-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold">Main training</p>
              <p className="text-[8px] text-muted-foreground">
                21 athletes following the main plan
              </p>
            </div>

            <Check className="h-4 w-4 text-green-600" />
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          <p className="text-[9px] font-semibold">
            3 individual adjustments
          </p>

          {adjustments.map((athlete) => (
            <button
              key={athlete.name}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-border/70 px-2 py-1.5 text-left"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-orange-50 text-[9px] font-bold text-orange-600">
                {athlete.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold">{athlete.name}</p>
                <p className="text-[8px] text-muted-foreground">
                  {athlete.change}
                </p>
              </div>

              <span className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${athlete.style}`}>
                {athlete.tag}
              </span>

              <span>›</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-2.5 w-full rounded-lg border border-border py-2 text-[9px] font-semibold"
        >
          Manage all adjustments →
        </button>
      </section>

      <section className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />

          <div>
            <h3 className="text-xs font-bold">AI Training Check</h3>
            <p className="text-[9px] text-muted-foreground">
              Suggestions based on today's context.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="text-[9px] font-semibold text-violet-700">
            Possible consideration
          </p>

          <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
            Three athletes may benefit from individual adjustments today.
            The main group training does not necessarily need to change.
          </p>

          <button
            type="button"
            className="mt-3 text-[9px] font-semibold text-violet-600"
          >
            Review suggestions →
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-border p-3">
          <p className="text-[9px] font-semibold">Focus areas</p>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-orange-50">
                <Target className="h-3 w-3 text-orange-500" />
              </div>

              <p className="text-[8px] text-muted-foreground">
                Sprint acceleration quality
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-red-50">
                <Dumbbell className="h-3 w-3 text-red-500" />
              </div>

              <p className="text-[8px] text-muted-foreground">
                Hamstring / posterior chain
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-green-50">
                <RefreshCw className="h-3 w-3 text-green-600" />
              </div>

              <p className="text-[8px] text-muted-foreground">
                Recovery management
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}








