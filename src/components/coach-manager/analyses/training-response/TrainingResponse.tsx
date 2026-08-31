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
    label: "Stable / Improved",
    value: "68%",
    detail: "Athlete-reported performance quality",
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
    goal: 61,
    quality: "More decline",
    qualityStyle: "bg-red-50 text-red-600",
    rpe: 7.8,
    delta: "↓ more decline vs recent similar sessions",
    deltaStyle: "text-red-500",
  },
  {
    label: "Hurdle Rhythm",
    goal: 79,
    quality: "Mostly stable",
    qualityStyle: "bg-green-50 text-green-700",
    rpe: 6.4,
    delta: "↑ more stable responses",
    deltaStyle: "text-green-600",
  },
  {
    label: "Plyometrics",
    goal: 71,
    quality: "Mixed",
    qualityStyle: "bg-orange-50 text-orange-700",
    rpe: 7.1,
    delta: "→ similar",
    deltaStyle: "text-muted-foreground",
  },
  {
    label: "Strength",
    goal: 75,
    quality: "Mostly stable",
    qualityStyle: "bg-blue-50 text-blue-700",
    rpe: 6.8,
    delta: "→ similar",
    deltaStyle: "text-muted-foreground",
  },
  {
    label: "Technical Work",
    goal: 84,
    quality: "Stable / improved",
    qualityStyle: "bg-green-50 text-green-700",
    rpe: 5.4,
    delta: "↑ more stable responses",
    deltaStyle: "text-green-600",
  },
  {
    label: "Starts / Acceleration",
    goal: 68,
    quality: "Some decline",
    qualityStyle: "bg-orange-50 text-orange-700",
    rpe: 6.7,
    delta: "↓ slightly more decline",
    deltaStyle: "text-red-500",
  },
];

function TrainingTypeResponseTable() {
  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-wide text-violet-600">
            Main comparison
          </p>

          <h3 className="mt-1 text-sm font-bold">
            Which training types stand out?
          </h3>

          <p className="mt-1 text-[12px] text-muted-foreground">
            Compare goal achievement, athlete-reported performance quality
            and RPE with recent similar sessions.
          </p>
        </div>

        <button
          type="button"
          className="text-[12px] font-semibold text-violet-600"
        >
          View detailed comparison →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[160px_130px_165px_85px_1fr] gap-3 border-b border-border pb-2 text-[12px] font-semibold text-muted-foreground">
        <span>Training type</span>
        <span>Goal achievement</span>
        <span>Performance quality</span>
        <span>Avg RPE</span>
        <span>Compared with recent similar sessions</span>
      </div>

      <div className="divide-y divide-border/60">
        {trainingTypes.map((item) => (
          <button
            key={item.label}
            type="button"
            className="grid w-full grid-cols-[160px_130px_165px_85px_1fr] items-center gap-3 py-3 text-left transition hover:bg-muted/15"
          >
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-50">
                <Activity className="h-3.5 w-3.5 text-violet-600" />
              </div>

              <span className="text-[12px] font-semibold">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  style={{ width: `${item.goal}%` }}
                  className={[
                    "h-full rounded-full",
                    item.goal >= 80
                      ? "bg-green-500"
                      : item.goal >= 70
                        ? "bg-blue-500"
                        : item.goal >= 60
                          ? "bg-orange-500"
                          : "bg-red-500",
                  ].join(" ")}
                />
              </div>

              <span className="text-[12px] font-bold">
                {item.goal}%
              </span>
            </div>

            <span
              className={`w-fit rounded-full px-2 py-1 text-[12px] font-semibold ${item.qualityStyle}`}
            >
              {item.quality}
            </span>

            <span className="text-[12px] font-semibold">
              {item.rpe}
            </span>

            <div className="flex items-center justify-between gap-2">
              <span className={`text-[12px] font-medium ${item.deltaStyle}`}>
                {item.delta}
              </span>

              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2">
        <div>
          <p className="text-[12px] font-semibold text-orange-800">
            Speed Endurance currently stands out
          </p>

          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Recent comparable sessions show lower goal achievement,
            higher RPE and more declining performance responses.
          </p>
        </div>

        <button
          type="button"
          className="text-[12px] font-semibold text-orange-700"
        >
          Review sessions →
        </button>
      </div>
    </section>
  );
}

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
                <p className="text-[12px] font-semibold text-muted-foreground">
                  {label}
                </p>

                <div className="mt-0.5 flex items-baseline gap-1">
                  <p className="text-xl font-bold">{value}</p>

                  {suffix && (
                    <span className="text-[13px] text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </div>

                <p className={`mt-0.5 text-[12px] ${style.split(" ")[1]}`}>
                  {detail}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <TrainingTypeResponseTable />

      <div className="grid grid-cols-[1fr_1.08fr_0.92fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            1. How are training responses changing over time?
          </h3>

          <p className="mt-1 text-[12px] text-muted-foreground">
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
                  "rounded-lg border px-2.5 py-1 text-[12px] font-semibold",
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
                  <span className="w-7 text-[12px] text-muted-foreground">
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

            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[12px] text-muted-foreground">
              <span>May 13</span>
              <span>May 20</span>
              <span>May 27</span>
              <span>Jun 3</span>
              <span>Jun 9</span>
            </div>
          </div>

          <div className="mt-2 flex gap-4 text-[12px] text-muted-foreground">
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
              className="text-[12px] font-semibold text-violet-700"
            >
              View response distribution →
            </button>

            <div className="flex gap-2 text-[12px]">
              <span className="text-green-600">Improved 26%</span>
              <span className="text-muted-foreground">Stable 52%</span>
              <span className="text-red-500">Declined 22%</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">2. Sessions worth investigating</h3>

          <p className="mt-1 text-[12px] text-muted-foreground">
            Different goal or performance responses compared with the recent pattern
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
                  <p className="text-[12px] font-semibold">{session.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {session.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[12px] text-muted-foreground">
                    Goal {session.goal} · RPE {session.rpe}
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold ${session.qualityStyle}`}
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
            className="mt-2 text-[12px] font-semibold text-violet-600"
          >
            View all 5 sessions →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            3. Context reported with these responses
          </h3>

          <p className="mt-1 text-[12px] text-muted-foreground">
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
                  <p className="text-[12px] font-semibold">{label}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[12px] font-semibold text-violet-600"
          >
            View all context factors →
          </button>
        </section>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-blue-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-violet-700">
            Athletic IQ Interpretation
          </p>

          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Speed Endurance shows the clearest difference from recent
            comparable sessions: higher RPE, lower goal achievement and
            more declining performance responses.
          </p>

          <p className="mt-1 text-[12px] text-muted-foreground">
            This is a pattern to investigate, not evidence that the training
            type caused the response.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[12px] font-semibold text-violet-700"
        >
          View evidence →
        </button>
      </section>
      <p className="text-center text-[12px] text-muted-foreground">
        Athletic IQ uses athlete-reported responses. Review individual athletes
        and session context before making training changes.
      </p>
    </div>
  );
}











