import { useState } from "react";
import {
  Activity,
  BatteryCharging,
  ChevronRight,
  MoonStar,
  Sparkles,
  ThermometerSun,
  Users,
} from "lucide-react";

import { RegenerationCoachReview } from "@/components/coach-manager/analyses/regeneration/RegenerationCoachReview";

const topMetrics = [
  {
    label: "Sleep Quality",
    value: "3.6",
    suffix: "/5",
    detail: "↑ 0.3 vs previous 4 weeks",
    icon: MoonStar,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Muscle Soreness",
    value: "3.2",
    suffix: "/5",
    detail: "↓ 0.2 vs previous 4 weeks",
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Energy Level",
    value: "3.8",
    suffix: "/5",
    detail: "↑ 0.2 vs previous 4 weeks",
    icon: BatteryCharging,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Athletes with notable changes",
    value: "7",
    detail: "One or more signals changed vs recent normal",
    icon: Users,
    style: "bg-blue-50 text-blue-600",
  },
];

const combinations = [
  {
    label: "All three positive",
    detail: "Sleep 4–5 · Soreness 4–5 · Energy 4–5",
    count: 43,
    icon: Sparkles,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Low sleep + otherwise okay",
    detail: "Sleep 1–2 · Other signals 3–5",
    count: 8,
    icon: MoonStar,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "High soreness",
    detail: "Soreness 1–2 · Other signals mostly normal",
    count: 6,
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Low energy + soreness",
    detail: "Energy 1–2 · Soreness 1–3",
    count: 5,
    icon: BatteryCharging,
    style: "bg-red-50 text-red-600",
  },
];

const recurring = [
  {
    label: "Poor sleep repeatedly",
    detail: "3+ low sleep responses",
    count: 4,
    icon: MoonStar,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Soreness staying elevated",
    detail: "3+ low soreness responses",
    count: 3,
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Energy declining",
    detail: "Lower than their recent normal",
    count: 5,
    icon: BatteryCharging,
    style: "bg-green-50 text-green-600",
  },
];

const athletesToCheck = [
  {
    initials: "JR",
    name: "Jonas Richter",
    reason: "Low energy + soreness",
    history: "3 check-ins",
    status: "bg-red-500",
  },
  {
    initials: "SB",
    name: "Sarah Braun",
    reason: "Poor sleep repeatedly",
    history: "3 check-ins",
    status: "bg-orange-500",
  },
  {
    initials: "TK",
    name: "Tom Klein",
    reason: "Soreness elevated",
    history: "2 check-ins",
    status: "bg-orange-500",
  },
  {
    initials: "LM",
    name: "Liam Peters",
    reason: "Energy declining",
    history: "2 check-ins",
    status: "bg-orange-400",
  },
];

const trainingTypes = [
  { label: "Speed Endurance", athletes: 4, width: 100, style: "bg-red-500" },
  { label: "Hurdle Rhythm", athletes: 3, width: 72, style: "bg-orange-500" },
  { label: "Strength", athletes: 2, width: 52, style: "bg-yellow-500" },
  { label: "Plyometrics", athletes: 1, width: 27, style: "bg-green-500" },
  { label: "Technical Work", athletes: 0, width: 4, style: "bg-slate-300" },
];

export function RegenerationAnalysis() {
  const [metric, setMetric] = useState<"sleep" | "soreness" | "energy">("sleep");
  const [mode, setMode] = useState<"average" | "unusual">("average");

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-4 gap-2.5">
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

              <div className="min-w-0 flex-1">
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

              {label === "Athletes with notable changes" && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-[1.1fr_0.9fr_0.78fr_0.82fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold">
                1. How is regeneration changing?
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Average score over time · 1 = low, 5 = high
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {[
                ["sleep", "Sleep"],
                ["soreness", "Soreness"],
                ["energy", "Energy"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setMetric(id as "sleep" | "soreness" | "energy")
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

            <div className="flex rounded-lg bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setMode("average")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  mode === "average"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Team Average
              </button>

              <button
                type="button"
                onClick={() => setMode("unusual")}
                className={[
                  "rounded-md px-2 py-1 text-[7px] font-semibold",
                  mode === "unusual"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Unusual Responses
              </button>
            </div>
          </div>

          <div className="relative mt-3 h-40">
            <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
              {[5, 3.75, 2.5, 1.25, 0].map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <span className="w-6 text-[7px] text-muted-foreground">
                    {value}
                  </span>

                  <div className="h-px flex-1 bg-border/50" />
                </div>
              ))}
            </div>

            <svg
              viewBox="0 0 500 120"
              className="absolute left-7 top-1 h-[108px] w-[calc(100%-28px)]"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,66 50,48 100,56 150,47 200,55 250,37 300,39 350,53 400,42 450,33 500,48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  metric === "soreness"
                    ? "text-orange-500"
                    : metric === "energy"
                      ? "text-green-600"
                      : "text-violet-600"
                }
              />

              <polyline
                points="0,90 50,81 100,88 150,82 200,93 250,74 300,72 350,88 400,78 450,69 500,80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                className="text-slate-300"
              />

              {[
                [0, 66],
                [50, 48],
                [100, 56],
                [150, 47],
                [200, 55],
                [250, 37],
                [300, 39],
                [350, 53],
                [400, 42],
                [450, 33],
                [500, 48],
              ].map(([x, y], index) => (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2.6"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={
                    metric === "soreness"
                      ? "text-orange-500"
                      : metric === "energy"
                        ? "text-green-600"
                        : "text-violet-600"
                  }
                />
              ))}
            </svg>

            <div className="absolute bottom-0 left-7 right-0 flex justify-between text-[7px] text-muted-foreground">
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

          <div className="mt-2 rounded-lg bg-violet-50 px-2.5 py-2 text-[8px] text-violet-700">
            Sleep and energy are slightly above the previous period. Soreness
            is slightly lower.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            2. What combinations are appearing?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Common patterns from the selected period
          </p>

          <div className="mt-3 space-y-1.5">
            {combinations.map(({ label, detail, count, icon: Icon, style }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-border/70 p-2 text-left hover:bg-muted/20"
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold">{label}</p>
                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {detail}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-base font-bold ${style.split(" ")[1]}`}>
                    {count}
                  </p>
                  <p className="text-[6px] text-muted-foreground">
                    athletes
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-[8px] font-semibold text-violet-600"
          >
            View athletes in each pattern →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">3. Recurring signals</h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Repeated patterns across multiple check-ins
          </p>

          <div className="mt-3 space-y-2">
            {recurring.map(({ label, detail, count, icon: Icon, style }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-border/70 p-2.5 text-left hover:bg-muted/20"
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold">{label}</p>
                  <p className="text-[7px] text-muted-foreground">
                    {detail}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold">{count}</p>
                  <p className="text-[6px] text-muted-foreground">
                    athletes
                  </p>
                </div>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-[8px] font-semibold text-violet-600"
          >
            View athletes →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">Athletes to check today</h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Repeated or combined regeneration signals
          </p>

          <div className="mt-3 space-y-1">
            {athletesToCheck.map((athlete) => (
              <button
                key={athlete.name}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-1 py-2 text-left hover:bg-muted/20"
              >
                <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-[8px] font-bold text-orange-600">
                  {athlete.initials}

                  <span
                    className={`absolute right-0 top-0 h-2 w-2 rounded-full border border-white ${athlete.status}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold">{athlete.name}</p>
                  <p className="text-[7px] text-muted-foreground">
                    {athlete.reason}
                  </p>
                  <p className="text-[6px] text-muted-foreground">
                    {athlete.history}
                  </p>
                </div>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-[8px] font-semibold text-violet-600"
          >
            View all 7 athletes →
          </button>
        </section>
      </div>

      <div className="grid grid-cols-[1.1fr_0.75fr_0.85fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            4. Today vs recent normal
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Compare today's group signals with recent personal baselines
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              {
                label: "Sleep Quality",
                value: "3.6",
                normal: "Normal: 3.3",
                status: "↑ Above normal",
                icon: MoonStar,
                style: "bg-violet-50 text-violet-600",
              },
              {
                label: "Muscle Soreness",
                value: "3.2",
                normal: "Normal: 3.1",
                status: "→ Near normal",
                icon: ThermometerSun,
                style: "bg-orange-50 text-orange-600",
              },
              {
                label: "Energy Level",
                value: "3.8",
                normal: "Normal: 3.5",
                status: "↑ Above normal",
                icon: BatteryCharging,
                style: "bg-green-50 text-green-600",
              },
            ].map(({ label, value, normal, status, icon: Icon, style }) => (
              <div
                key={label}
                className="rounded-xl border border-border/70 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full ${style}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div>
                    <p className="text-[8px] font-semibold">{label}</p>
                    <p className="text-base font-bold">
                      {value}
                      <span className="ml-1 text-[7px] font-normal text-muted-foreground">
                        /5
                      </span>
                    </p>
                  </div>
                </div>

                <p className={`mt-2 text-[7px] ${style.split(" ")[1]}`}>
                  {status}
                </p>

                <p className="mt-1 text-[6px] text-muted-foreground">
                  {normal}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2 text-[7px] text-violet-700">
            A low absolute score is not automatically a problem. Athletic IQ
            also compares each athlete with their own recent normal.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Linked to recent training types
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Where low regeneration signals appeared most often
          </p>

          <div className="mt-3 space-y-2">
            {trainingTypes.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[90px_1fr_55px] items-center gap-2"
              >
                <span className="text-[7px] font-medium">
                  {item.label}
                </span>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    style={{ width: `${item.width}%` }}
                    className={`h-full rounded-full ${item.style}`}
                  />
                </div>

                <span className="text-right text-[7px] text-muted-foreground">
                  {item.athletes} athletes
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[7px] leading-relaxed text-muted-foreground">
            This shows association only. It does not mean the training type
            caused the regeneration response.
          </p>

          <button
            type="button"
            className="mt-2 text-[8px] font-semibold text-violet-600"
          >
            View by training type →
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">Group status today</h3>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            Most athletes are within their recent normal. A smaller group has
            repeated or combined signals worth reviewing.
          </p>

          <div className="mt-3 space-y-2">
            {[
              ["Within recent normal", "61 athletes", "bg-green-500"],
              ["Some changes", "24 athletes", "bg-orange-400"],
              ["Repeated / combined signals", "11 athletes", "bg-red-500"],
              ["Not enough recent data", "4 athletes", "bg-slate-300"],
            ].map(([label, value, style]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border/60 px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${style}`} />
                  <span className="text-[7px] font-medium">{label}</span>
                </div>

                <span className="text-[7px] font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-orange-50 p-2 text-[7px] text-orange-800">
            Review individual athletes before making training changes.
          </div>
        </section>
      </div>

      <RegenerationCoachReview />

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-green-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            Regeneration Insight
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            Five athletes show repeated low-energy responses. Their soreness,
            sleep and recent training context should be reviewed individually;
            stable performance in some athletes may mean no training change is
            necessary.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
        >
          View evidence →
        </button>
      </section>
    </div>
  );
}
