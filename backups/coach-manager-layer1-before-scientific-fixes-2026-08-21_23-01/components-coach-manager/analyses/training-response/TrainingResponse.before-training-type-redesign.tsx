import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  ChevronRight,
  CircleCheck,
  MoonStar,
  Sparkles,
  Target,
  ThermometerSun,
  Zap,
} from "lucide-react";

import { TrainingResponseCoachReview } from "@/components/coach-manager/analyses/training-response/TrainingResponseCoachReview";

const topMetrics = [
  {
    label: "Sessions analyzed",
    value: "24",
    detail: "Selected period",
    icon: CircleCheck,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Goal achievement",
    value: "72%",
    detail: "↑ 6% vs previous 4 weeks",
    icon: Target,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Avg RPE",
    value: "6.4",
    suffix: "/10",
    detail: "↓ 0.3 vs previous period",
    icon: Activity,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Performance quality",
    value: "Stable",
    detail: "Improved vs previous period",
    icon: Zap,
    style: "bg-blue-50 text-blue-600",
  },
  {
    label: "Sessions to review",
    value: "5",
    detail: "Low goal achievement or declining quality",
    icon: AlertTriangle,
    style: "bg-red-50 text-red-600",
  },
];

const sessionsToReview = [
  {
    name: "Speed Endurance",
    date: "Jun 6",
    goal: "48%",
    rpe: "7.8",
    quality: "Strongly declined",
    qualityStyle: "bg-red-50 text-red-600",
  },
  {
    name: "Hurdle Rhythm",
    date: "Jun 2",
    goal: "55%",
    rpe: "6.9",
    quality: "Declined",
    qualityStyle: "bg-orange-50 text-orange-600",
  },
  {
    name: "Plyometric Power",
    date: "May 30",
    goal: "60%",
    rpe: "7.2",
    quality: "Declined",
    qualityStyle: "bg-orange-50 text-orange-600",
  },
  {
    name: "Speed Endurance",
    date: "May 23",
    goal: "52%",
    rpe: "8.1",
    quality: "Strongly declined",
    qualityStyle: "bg-red-50 text-red-600",
  },
  {
    name: "Starts + Acceleration",
    date: "May 16",
    goal: "58%",
    rpe: "6.5",
    quality: "Declined",
    qualityStyle: "bg-orange-50 text-orange-600",
  },
];

const contextFactors = [
  {
    label: "Poor sleep",
    detail: "Reported alongside several lower-response sessions",
    icon: MoonStar,
  },
  {
    label: "Stress / pressure",
    detail: "Reported more often in U18 athletes",
    icon: Brain,
  },
  {
    label: "School / work",
    detail: "Present in several sessions with lower goal achievement",
    icon: Activity,
  },
  {
    label: "Hot conditions",
    detail: "Reported during a smaller number of sessions",
    icon: ThermometerSun,
  },
  {
    label: "Competition nerves",
    detail: "Reported before selected sessions",
    icon: Zap,
  },
];

const trainingTypes = [
  {
    label: "Speed Endurance",
    result: "Mostly stable / some decline",
    delta: "↓ vs recent comparable sessions",
    width: 82,
    style: "bg-green-500",
  },
  {
    label: "Hurdle Rhythm",
    result: "Mostly stable",
    delta: "↑ slightly",
    width: 78,
    style: "bg-green-500",
  },
  {
    label: "Plyometrics",
    result: "Mixed",
    delta: "→ similar",
    width: 64,
    style: "bg-orange-500",
  },
  {
    label: "Strength",
    result: "Mixed",
    delta: "↓ slightly",
    width: 58,
    style: "bg-slate-400",
  },
  {
    label: "Technical Work",
    result: "Mostly stable",
    delta: "→ similar",
    width: 72,
    style: "bg-blue-500",
  },
  {
    label: "Starts / Acceleration",
    result: "More decline",
    delta: "↓ vs recent comparable sessions",
    width: 48,
    style: "bg-red-500",
  },
];

export function TrainingResponse() {
  const [metric, setMetric] = useState<
    "goal" | "quality" | "rpe"
  >("goal");

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-5 gap-2.5">
        {topMetrics.map(({ label, value, suffix, detail, icon: Icon, style }) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${style}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-semibold text-muted-foreground">
                  {label}
                </p>

                <div className="mt-0.5 flex items-baseline gap-1">
                  <p className="text-xl font-bold">{value}</p>

                  {suffix && (
                    <span className="text-[9px] text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </div>

                <p className={`mt-0.5 text-[7px] ${style.split(" ")[1]}`}>
                  {detail}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-[1fr_1.08fr_0.92fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            1. How is performance changing?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Athlete-reported response over the selected period
          </p>

          <div className="mt-3 flex gap-1">
            {[
              ["goal", "Goal Achievement"],
              ["quality", "Performance Quality"],
              ["rpe", "RPE"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setMetric(id as "goal" | "quality" | "rpe")
                }
                className={[
                  "rounded-lg border px-2.5 py-1 text-[7px] font-semibold",
                  metric === id
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-border text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative mt-3 h-40">
            <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <span className="w-7 text-[7px] text-muted-foreground">
                    {value}%
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              ))}
            </div>

            <svg
              viewBox="0 0 500 120"
              className="absolute left-8 top-1 h-[108px] w-[calc(100%-32px)]"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,73 50,49 100,56 150,52 200,58 250,39 300,31 350,42 400,41 450,35 500,39"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-600"
              />

              <polyline
                points="0,91 50,75 100,76 150,77 200,82 250,64 300,60 350,80 400,70 450,60 500,68"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                className="text-slate-300"
              />

              {[
                [0, 73],
                [50, 49],
                [100, 56],
                [150, 52],
                [200, 58],
                [250, 39],
                [300, 31],
                [350, 42],
                [400, 41],
                [450, 35],
                [500, 39],
              ].map(([x, y], index) => (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2.3"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-violet-600"
                />
              ))}
            </svg>

            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[7px] text-muted-foreground">
              <span>May 13</span>
              <span>May 20</span>
              <span>May 27</span>
              <span>Jun 3</span>
              <span>Jun 9</span>
            </div>
          </div>

          <div className="mt-2 flex gap-4 text-[7px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 bg-violet-600" />
              Current 4 weeks
            </span>

            <span className="flex items-center gap-1">
              <span className="w-4 border-t border-dashed border-slate-400" />
              Previous 4 weeks
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50/50 px-2.5 py-2">
            <button
              type="button"
              className="text-[8px] font-semibold text-violet-700"
            >
              View response distribution →
            </button>

            <div className="flex gap-2 text-[7px]">
              <span className="text-green-600">Improved 26%</span>
              <span className="text-muted-foreground">Stable 52%</span>
              <span className="text-red-500">Declined 22%</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">2. Sessions to review</h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Low goal achievement or declining performance responses
          </p>

          <div className="mt-3 divide-y divide-border/60">
            {sessionsToReview.map((session) => (
              <button
                key={`${session.name}-${session.date}`}
                type="button"
                className="flex w-full items-center gap-2 py-2 text-left"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50">
                  <Activity className="h-4 w-4 text-violet-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold">{session.name}</p>
                  <p className="text-[7px] text-muted-foreground">
                    {session.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[7px] text-muted-foreground">
                    Goal {session.goal} · RPE {session.rpe}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[7px] font-semibold ${session.qualityStyle}`}
                  >
                    {session.quality}
                  </span>
                </div>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[8px] font-semibold text-violet-600"
          >
            View all 5 sessions →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            3. Context reported with these responses
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Athlete-reported context, not proven causes
          </p>

          <div className="mt-3 divide-y divide-border/60">
            {contextFactors.map(({ label, detail, icon: Icon }) => (
              <div
                key={label}
                className="flex items-start gap-2 py-2.5"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50">
                  <Icon className="h-4 w-4 text-violet-600" />
                </div>

                <div>
                  <p className="text-[8px] font-semibold">{label}</p>
                  <p className="mt-0.5 text-[7px] leading-relaxed text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[8px] font-semibold text-violet-600"
          >
            View all context factors →
          </button>
        </section>
      </div>

      <div className="grid grid-cols-[1.18fr_0.82fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            4. Response by training type
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Based on goal achievement, performance quality and RPE context
          </p>

          <div className="mt-3 space-y-2">
            {trainingTypes.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[120px_1fr_150px_120px] items-center gap-3"
              >
                <span className="text-[8px] font-semibold">
                  {item.label}
                </span>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    style={{ width: `${item.width}%` }}
                    className={`h-full rounded-full ${item.style}`}
                  />
                </div>

                <span className="text-[7px] text-muted-foreground">
                  {item.result}
                </span>

                <span
                  className={[
                    "text-right text-[7px] font-medium",
                    item.delta.startsWith("↑")
                      ? "text-green-600"
                      : item.delta.startsWith("↓")
                        ? "text-red-500"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {item.delta}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-[8px] font-semibold text-violet-600"
          >
            View by training type →
          </button>
        </section>

        <div className="space-y-3">
          <section className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-blue-50/30 p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-violet-700">
                  Athletic IQ Summary
                </h3>

                <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
                  Goal achievement has improved compared with the previous
                  period. Speed Endurance sessions show more unexpected
                  difficulty and declining performance responses than other
                  session types.
                </p>
              </div>
            </div>
          </section>

          <TrainingResponseCoachReview />
        </div>
      </div>

      <p className="text-center text-[7px] text-muted-foreground">
        Athletic IQ uses athlete-reported responses. Review individual athletes
        and session context before making training changes.
      </p>
    </div>
  );
}
