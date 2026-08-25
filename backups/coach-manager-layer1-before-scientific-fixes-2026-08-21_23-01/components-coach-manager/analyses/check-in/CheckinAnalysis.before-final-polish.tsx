import { useState } from "react";
import {
  Activity,
  Brain,
  ChevronRight,
  CircleUserRound,
  HeartPulse,
  Info,
  MoonStar,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";

import { CoachReview } from "@/components/coach-manager/analyses/CoachReview";

const metrics = [
  {
    label: "Avg RPE",
    value: "6.4",
    suffix: "/10",
    detail: "↓ 0.4 vs previous 4 weeks",
    icon: CircleUserRound,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Goal Achievement",
    value: "78%",
    detail: "↑ 4% vs previous 4 weeks",
    icon: Target,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Performance Quality",
    value: "3.2",
    suffix: "/5",
    detail: "→ Stable vs previous 4 weeks",
    icon: Activity,
    style: "bg-blue-50 text-blue-600",
  },
  {
    label: "Physical Signals",
    value: "6",
    detail: "↑ 2 athletes vs previous period",
    icon: Users,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Mental Signals",
    value: "4",
    detail: "↑ 1 athlete vs previous period",
    icon: Brain,
    style: "bg-red-50 text-red-600",
  },
];

const unexpectedDifficulty = [
  { label: "Speed Endurance", percentage: 31, athletes: 5, sessions: 8 },
  { label: "Hurdle Rhythm", percentage: 19, athletes: 3, sessions: 5 },
  { label: "Acceleration", percentage: 12, athletes: 2, sessions: 3 },
  { label: "Max Velocity", percentage: 9, athletes: 2, sessions: 2 },
  { label: "Hurdles Technique", percentage: 7, athletes: 2, sessions: 2 },
];

const factors = [
  { label: "Poor sleep", value: 28, icon: MoonStar },
  { label: "Stress / pressure", value: 21, icon: Brain },
  { label: "School / work", value: 17, icon: Activity },
  { label: "Weather", value: 12, icon: Zap },
  { label: "Training conditions", value: 9, icon: Target },
  { label: "Competition nerves", value: 5, icon: Activity },
];

const matrix = [
  [
    { value: "58%", count: 58, style: "bg-green-100 text-green-800" },
    { value: "10%", count: 10, style: "bg-green-50 text-green-700" },
    { value: "3%", count: 3, style: "bg-orange-50 text-orange-700" },
    { value: "1%", count: 1, style: "bg-slate-50 text-slate-500" },
  ],
  [
    { value: "7%", count: 7, style: "bg-blue-50 text-blue-700" },
    { value: "12%", count: 12, style: "bg-blue-50 text-blue-700" },
    { value: "4%", count: 4, style: "bg-orange-50 text-orange-700" },
    { value: "—", count: 0, style: "bg-slate-50 text-slate-400" },
  ],
  [
    { value: "2%", count: 2, style: "bg-orange-50 text-orange-700" },
    { value: "2%", count: 2, style: "bg-red-50 text-red-600" },
    { value: "5%", count: 5, style: "bg-red-100 text-red-700" },
    { value: "1%", count: 1, style: "bg-slate-50 text-slate-500" },
  ],
];

export function CheckinAnalysis() {
  const [trendMetric, setTrendMetric] = useState("RPE");
  const [trendMode, setTrendMode] =
    useState<"average" | "unusual">("average");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2">
        <p className="text-[8px] text-muted-foreground">
          <span className="font-semibold text-foreground">Data coverage:</span>{" "}
          92% · 92 of 100 athletes submitted check-ins
        </p>

        <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
          <Info className="h-3 w-3" />
          Athlete-reported post-training data
        </div>
      </div>

      <section className="grid grid-cols-5 gap-2">
        {metrics.map(({ label, value, suffix, detail, icon: Icon, style }) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
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

                <p className={`text-[7px] ${style.split(" ")[1]}`}>
                  {detail}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-[1fr_0.9fr_1.12fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold">
                1. How are athletes responding?
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Trends across the selected period
              </p>
            </div>

            <div className="flex rounded-lg bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setTrendMode("average")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  trendMode === "average"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Team Average
              </button>

              <button
                type="button"
                onClick={() => setTrendMode("unusual")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  trendMode === "unusual"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Unusual Responses
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            {["RPE", "Physical Feeling", "Performance Quality", "Goal Achievement"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTrendMetric(item)}
                  className={[
                    "rounded-lg border px-2 py-1 text-[7px] font-semibold",
                    trendMetric === item
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-border text-muted-foreground",
                  ].join(" ")}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <div className="relative mt-4 h-40">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[10, 7.5, 5, 2.5, 0].map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <span className="w-5 text-[7px] text-muted-foreground">
                    {value}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
              ))}
            </div>

            <svg
              viewBox="0 0 420 150"
              className="absolute bottom-0 left-6 h-[135px] w-[calc(100%-24px)]"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,88 38,66 76,91 114,57 152,54 190,42 228,67 266,72 304,60 342,72 380,80 420,68"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-violet-600"
              />

              <polyline
                points="0,110 38,91 76,108 114,99 152,101 190,86 228,102 266,108 304,96 342,104 380,98 420,91"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5 5"
                className="text-slate-300"
              />

              {[
                [0, 88],
                [38, 66],
                [76, 91],
                [114, 57],
                [152, 54],
                [190, 42],
                [228, 67],
                [266, 72],
                [304, 60],
                [342, 72],
                [380, 80],
                [420, 68],
              ].map(([x, y], index) => (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="currentColor"
                  className="text-violet-600"
                />
              ))}
            </svg>
          </div>

          <div className="mt-2 flex items-center gap-4 text-[7px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-4 bg-violet-600" />
              Current 4 weeks
            </span>

            <span className="flex items-center gap-1">
              <span className="w-4 border-t border-dashed border-slate-400" />
              Previous 4 weeks
            </span>
          </div>

          <div className="mt-3 rounded-lg bg-violet-50 px-2.5 py-2 text-[8px] text-violet-700">
            Average RPE is slightly lower than during the previous period.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            2. Was training harder than expected?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Intended difficulty compared with athlete perception
          </p>

          <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-4">
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(#22c55e_0deg_43deg,#3b82f6_43deg_263deg,#f97316_263deg_342deg,#ef4444_342deg_360deg)]">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-base font-bold">100</p>
                  <p className="text-[7px] text-muted-foreground">
                    Sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                ["Easier than expected", "12%", "text-green-600"],
                ["As expected", "61%", "text-blue-600"],
                ["Harder than expected", "22%", "text-orange-600"],
                ["Much harder", "5%", "text-red-600"],
              ].map(([label, value, style]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-[8px]"
                >
                  <span>{label}</span>
                  <span className={`font-bold ${style}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[8px] font-semibold">
            Where is unexpected difficulty happening?
          </p>

          <div className="mt-2 space-y-2">
            {unexpectedDifficulty.map((item) => (
              <button
                key={item.label}
                type="button"
                className="grid w-full grid-cols-[100px_1fr_28px_28px_12px] items-center gap-2 text-left"
              >
                <span className="text-[7px] font-medium">
                  {item.label}
                </span>

                <div className="h-1.5 overflow-hidden rounded-full bg-orange-50">
                  <div
                    style={{ width: `${item.percentage * 2.5}%` }}
                    className="h-full rounded-full bg-orange-500"
                  />
                </div>

                <span className="text-[7px] font-semibold">
                  {item.percentage}%
                </span>

                <span className="text-[7px] text-muted-foreground">
                  {item.athletes}
                </span>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 rounded-lg border border-violet-100 bg-violet-50 px-2 py-1.5 text-[8px] font-semibold text-violet-700"
          >
            View 8 sessions →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            3. Did training work as intended?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Goal achievement × performance quality
          </p>

          <div className="mt-4">
            <div className="grid grid-cols-[76px_repeat(4,1fr)] gap-1 text-center">
              <div />

              {[
                "Improved / stable",
                "Stayed similar",
                "Declined",
                "Can't judge",
              ].map((label) => (
                <div
                  key={label}
                  className="px-1 text-[6px] font-semibold text-muted-foreground"
                >
                  {label}
                </div>
              ))}

              {matrix.map((row, rowIndex) => (
                <>
                  <div
                    key={`label-${rowIndex}`}
                    className="flex items-center text-left text-[7px] font-semibold"
                  >
                    {["Achieved", "Partly achieved", "Not achieved"][rowIndex]}
                  </div>

                  {row.map((cell, cellIndex) => (
                    <button
                      key={`${rowIndex}-${cellIndex}`}
                      type="button"
                      className={`rounded-lg border border-white p-2 text-center ${cell.style}`}
                    >
                      <p className="text-sm font-bold">{cell.value}</p>
                      {cell.count > 0 && (
                        <p className="text-[6px] opacity-70">
                          {cell.count} sessions
                        </p>
                      )}
                    </button>
                  ))}
                </>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-2.5 py-2">
            <div>
              <p className="text-[8px] font-semibold text-red-700">
                7 sessions worth reviewing
              </p>

              <p className="text-[7px] text-muted-foreground">
                Goal missed or performance quality declined significantly.
              </p>
            </div>

            <button
              type="button"
              className="text-[8px] font-semibold text-red-600"
            >
              View →
            </button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-[0.92fr_0.88fr_1fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            4. Frequently Reported Performance Factors
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Factors athletes say influenced their performance
          </p>

          <div className="mt-3 space-y-2">
            {factors.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid grid-cols-[20px_105px_1fr_32px] items-center gap-2"
              >
                <div className="grid h-5 w-5 place-items-center rounded-md bg-violet-50">
                  <Icon className="h-3 w-3 text-violet-600" />
                </div>

                <span className="text-[8px] font-medium">{label}</span>

                <div className="h-1.5 rounded-full bg-violet-50">
                  <div
                    style={{ width: `${value * 3}%` }}
                    className="h-full rounded-full bg-violet-500"
                  />
                </div>

                <span className="text-right text-[8px] font-semibold">
                  {value}%
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-[8px] font-semibold text-violet-600"
          >
            View factors in detail →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            5. Body & Mental Signals
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Important signals reported through check-ins
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-2.5">
              <HeartPulse className="h-4 w-4 text-red-500" />
              <p className="mt-2 text-lg font-bold">5</p>
              <p className="text-[8px] font-semibold">Pain reports</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                ↑ 2 vs previous period
              </p>
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-2.5">
              <Brain className="h-4 w-4 text-violet-600" />
              <p className="mt-2 text-lg font-bold">8</p>
              <p className="text-[8px] font-semibold">Stress reports</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                Especially U18
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-2.5">
              <Activity className="h-4 w-4 text-orange-600" />
              <p className="mt-2 text-sm font-bold">Hamstring</p>
              <p className="text-[8px] font-semibold">Most reported area</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                3 athletes
              </p>
            </div>
          </div>

          <div className="mt-2 rounded-lg border border-orange-100 bg-orange-50/50 p-2 text-[7px] text-orange-800">
            Multiple athletes reported fatigue or stress. Review before the
            next high-intensity session.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">Quick Filters</h3>

          <div className="mt-3 space-y-2">
            {[
              ["Athlete", "All athletes"],
              ["Group", "All groups"],
              ["Session Type", "All types"],
              ["Discipline", "All disciplines"],
              ["Training Phase", "All phases"],
            ].map(([label, value]) => (
              <label
                key={label}
                className="grid grid-cols-[86px_1fr] items-center gap-2"
              >
                <span className="text-[8px] font-medium">{label}</span>

                <select className="rounded-lg border border-border bg-background px-2 py-1.5 text-[8px] outline-none">
                  <option>{value}</option>
                </select>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-violet-100 bg-violet-50 py-2 text-[8px] font-semibold text-violet-700"
          >
            Reset filters
          </button>
        </section>
      </div>

      <CoachReview />

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-orange-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            AI Coach Insight
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            Speed Endurance was rated harder than expected in 31% of recent
            sessions. Tom Klein, Sarah Braun and Jonas Richter account for
            several of these responses, while goal achievement for this session
            type is also lower than during the previous period.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
        >
          View detailed AI report →
        </button>
      </section>
    </div>
  );
}
