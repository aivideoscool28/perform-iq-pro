import { useState } from "react";

import type { CoachAthlete } from "@/hooks/useCoachAthletes";
import {
  BatteryCharging,
  ChevronRight,
  CircleCheckBig,
  MoonStar,
  Sparkles,
  ThermometerSun,
  Users,
} from "lucide-react";

const topMetrics = [
  {
    label: "Sleep Quality",
    value: "3.6",
    suffix: "/5",
    detail: "Group average today",
    icon: MoonStar,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Muscle Soreness",
    value: "3.2",
    suffix: "/5",
    detail: "Group average today",
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Energy Level",
    value: "3.8",
    suffix: "/5",
    detail: "Group average today",
    icon: BatteryCharging,
    style: "bg-green-50 text-green-600",
  },
  {
    label: "Notable Changes",
    value: "7",
    detail: "Compared with personal recent normal",
    icon: Users,
    style: "bg-blue-50 text-blue-600",
  },
];

type RegenerationAnalysisProps = {
  athletes: CoachAthlete[];
};
const recurringSignals = [
  {
    label: "Poor sleep repeatedly",
    detail: "3+ below-normal sleep responses",
    athletes: 4,
    icon: MoonStar,
    style: "bg-violet-50 text-violet-600",
  },
  {
    label: "Soreness staying elevated",
    detail: "3+ below-normal freshness responses",
    athletes: 3,
    icon: ThermometerSun,
    style: "bg-orange-50 text-orange-600",
  },
  {
    label: "Energy declining",
    detail: "Repeated change from personal normal",
    athletes: 5,
    icon: BatteryCharging,
    style: "bg-green-50 text-green-600",
  },
];

const combinations = [
  {
    label: "Low sleep only",
    detail: "Other regeneration signals remain near normal",
    athletes: 8,
    style: "bg-violet-50 text-violet-700",
  },
  {
    label: "Soreness elevated only",
    detail: "Energy and sleep remain near normal",
    athletes: 6,
    style: "bg-orange-50 text-orange-700",
  },
  {
    label: "Low energy + soreness",
    detail: "Two signals changed together",
    athletes: 5,
    style: "bg-red-50 text-red-700",
  },
];

const trainingTypes = [
  {
    label: "Speed Endurance",
    athletes: 4,
    width: 100,
    style: "bg-orange-500",
  },
  {
    label: "Hurdle Rhythm",
    athletes: 3,
    width: 75,
    style: "bg-violet-500",
  },
  {
    label: "Strength",
    athletes: 2,
    width: 50,
    style: "bg-blue-500",
  },
  {
    label: "Plyometrics",
    athletes: 1,
    width: 25,
    style: "bg-green-500",
  },
];

export function RegenerationAnalysis({
  athletes,
}: RegenerationAnalysisProps) {
  const athletesToCheck = athletes.map((athlete) => ({
    initials: athlete.display_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(""),
    name: athlete.display_name,
    reason: "Linked athlete",
    detail: "Real regeneration analysis connects next",
    context: "No regeneration status calculated yet",
    status: "bg-slate-400",
    signals: [] as string[],
  }));
  const [metric, setMetric] =
    useState<"sleep" | "soreness" | "energy">("sleep");

  const [mode, setMode] =
    useState<"average" | "unusual">("average");

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-4 gap-2">
        {topMetrics.map(
          ({
            label,
            value,
            suffix,
            detail,
            icon: Icon,
            style,
          }) => (
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
                    <p className="text-xl font-bold">
                      {value}
                    </p>

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
          ),
        )}
      </section>

      <div className="grid grid-cols-[1.05fr_0.95fr] gap-3">
        <section className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">
                Most Important
              </p>

              <h3 className="mt-1 text-sm font-bold">
                Today vs each athlete's recent normal
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Personal change matters more than a generic group threshold.
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-50">
              <CircleCheckBig className="h-4 w-4 text-violet-600" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              {
                label: "Sleep",
                today: "3.6",
                normal: "Recent normal 3.3",
                result: "Mostly near normal",
                icon: MoonStar,
                style: "bg-violet-50 text-violet-600",
              },
              {
                label: "Soreness",
                today: "3.2",
                normal: "Recent normal 3.1",
                result: "Mostly near normal",
                icon: ThermometerSun,
                style: "bg-orange-50 text-orange-600",
              },
              {
                label: "Energy",
                today: "3.8",
                normal: "Recent normal 3.5",
                result: "Mostly near normal",
                icon: BatteryCharging,
                style: "bg-green-50 text-green-600",
              },
            ].map(
              ({
                label,
                today,
                normal,
                result,
                icon: Icon,
                style,
              }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full ${style}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <p className="text-[9px] font-semibold">
                      {label}
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold">
                    {today}
                    <span className="ml-1 text-[8px] font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>

                  <p className="mt-1 text-[7px] text-muted-foreground">
                    {normal}
                  </p>

                  <p className={`mt-1 text-[7px] font-semibold ${style.split(" ")[1]}`}>
                    {result}
                  </p>
                </div>
              ),
            )}
          </div>

          <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2">
            <p className="text-[8px] font-semibold text-violet-700">
              7 athletes differ meaningfully from their own recent pattern.
            </p>

            <p className="mt-0.5 text-[7px] text-muted-foreground">
              A low absolute score alone is not enough to classify an athlete
              as needing attention.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold">
                Athletes to check
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                Repeated or combined changes worth inspecting.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-[8px] font-bold text-orange-600">
              7 athletes
            </span>
          </div>

          <div className="mt-3 divide-y divide-border/60">
            {athletesToCheck.map((athlete) => (
              <button
                key={athlete.name}
                type="button"
                className="flex w-full items-center gap-2 py-2 text-left transition hover:bg-muted/20"
              >
                <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-[8px] font-bold text-orange-600">
                  {athlete.initials}

                  <span
                    className={`absolute right-0 top-0 h-2 w-2 rounded-full border border-white ${athlete.status}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">
                    {athlete.name}
                  </p>

                  <p className="text-[8px] text-muted-foreground">
                    {athlete.reason}
                  </p>

                  <p className="text-[7px] text-muted-foreground">
                    {athlete.detail}
                  </p>

                  <p className="mt-0.5 text-[7px] font-medium text-green-700">
                    {athlete.context}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {athlete.signals.includes("sleep") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-violet-50">
                      <MoonStar className="h-3 w-3 text-violet-600" />
                    </div>
                  )}

                  {athlete.signals.includes("soreness") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-orange-50">
                      <ThermometerSun className="h-3 w-3 text-orange-600" />
                    </div>
                  )}

                  {athlete.signals.includes("energy") && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-green-50">
                      <BatteryCharging className="h-3 w-3 text-green-600" />
                    </div>
                  )}
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

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold">
                Regeneration over time
              </h3>

              <p className="mt-1 text-[8px] text-muted-foreground">
                One trend view for the three athlete-reported signals.
              </p>
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
                Group Trend
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
                Individual Changes
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            {[
              ["sleep", "Sleep"],
              ["soreness", "Soreness"],
              ["energy", "Energy"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setMetric(
                    id as "sleep" | "soreness" | "energy",
                  )
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

          {mode === "average" ? (
            <>
              <div className="relative mt-3 h-36">
                <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="w-5 text-[7px] text-muted-foreground">
                        {value}
                      </span>

                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                  ))}
                </div>

                <svg
                  viewBox="0 0 500 120"
                  className="absolute left-6 top-1 h-[105px] w-[calc(100%-24px)]"
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
                      r="2.3"
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

                <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[7px] text-muted-foreground">
                  <span>May 13</span>
                  <span>May 20</span>
                  <span>May 27</span>
                  <span>Jun 3</span>
                  <span>Jun 9</span>
                </div>
              </div>

              <div className="mt-2 rounded-lg bg-violet-50/60 px-2.5 py-2 text-[8px] text-violet-700">
                Group trend is relatively stable. Individual changes are more
                important than this average alone.
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              {athletesToCheck.slice(0, 3).map((athlete) => (
                <button
                  key={athlete.name}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left"
                >
                  <div>
                    <p className="text-[9px] font-semibold">
                      {athlete.name}
                    </p>

                    <p className="text-[8px] text-muted-foreground">
                      {athlete.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-semibold text-orange-700">
                      {athlete.detail}
                    </span>

                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              ))}

              <p className="text-[7px] text-muted-foreground">
                Layer 2 will calculate these against each athlete's valid
                personal baseline rather than a universal threshold.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Recurring signals
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Repetition matters more than one unusual day.
          </p>

          <div className="mt-3 space-y-2">
            {recurringSignals.map(
              ({
                label,
                detail,
                athletes,
                icon: Icon,
                style,
              }) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl border border-border/70 p-2.5 text-left"
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-semibold">
                      {label}
                    </p>

                    <p className="text-[7px] text-muted-foreground">
                      {detail}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {athletes}
                    </p>

                    <p className="text-[6px] text-muted-foreground">
                      athletes
                    </p>
                  </div>

                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-[0.9fr_1.1fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Signals appearing together
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Useful context — not a diagnosis or readiness score.
          </p>

          <div className="mt-3 space-y-2">
            {combinations.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-left"
              >
                <div>
                  <p className="text-[8px] font-semibold">
                    {item.label}
                  </p>

                  <p className="mt-0.5 text-[7px] text-muted-foreground">
                    {item.detail}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[7px] font-semibold ${item.style}`}
                  >
                    {item.athletes} athletes
                  </span>

                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Where were low regeneration signals reported?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Shown alongside recent training types — association only.
          </p>

          <div className="mt-3 space-y-2.5">
            {trainingTypes.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[110px_1fr_70px] items-center gap-3"
              >
                <span className="text-[8px] font-medium">
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

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
            <p className="text-[7px] leading-relaxed text-muted-foreground">
              These responses occurred after or around these training types.
              Athletic IQ should not claim the training type caused the
              regeneration change.
            </p>
          </div>
        </section>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-green-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            Athletic IQ Interpretation
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            Five athletes show repeated low-energy responses. Some continue to
            report stable training performance, so the regeneration change alone
            should not be treated as evidence that their performance is poor.
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


