import { useEffect, useMemo, useState } from "react";

import {
  getCoachCheckinData,
  type CoachCheckinData,
} from "./CheckinAnalysisData";

import {
  compareCheckinPeriods,
} from "./CheckinAnalysisComparisons";

import {
  calculateCheckinTrend,
  calculateGoalPerformanceMatrix,
  calculateUnexpectedDifficulty,
  calculateUnusualResponses,
} from "./CheckinAnalysisCalculations";
import {
  Activity,
  Brain,
  ChevronRight,
  CircleUserRound,
  HeartPulse,
  MoonStar,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";


function getPerformanceFactorIcon(
  label: string,
) {
  const normalized =
    label.toLowerCase();

  if (
    normalized.includes("schlaf") ||
    normalized.includes("sleep")
  ) {
    return MoonStar;
  }

  if (
    normalized.includes("stress") ||
    normalized.includes("druck") ||
    normalized.includes("pressure")
  ) {
    return Brain;
  }

  if (
    normalized.includes("schule") ||
    normalized.includes("school") ||
    normalized.includes("arbeit") ||
    normalized.includes("work")
  ) {
    return Activity;
  }

  if (
    normalized.includes("wetter") ||
    normalized.includes("weather")
  ) {
    return Zap;
  }

  if (
    normalized.includes("training")
  ) {
    return Target;
  }

  if (
    normalized.includes("wettkampf") ||
    normalized.includes("competition")
  ) {
    return Activity;
  }

  return Activity;
}

export function CheckinAnalysis() {
  const [trendMetric, setTrendMetric] = useState<"RPE" | "Physical Feeling" | "Performance Quality" | "Goal Achievement">("RPE");
  const [trendMode, setTrendMode] =
    useState<"average" | "unusual">("average");

  const [data, setData] =
    useState<CoachCheckinData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCheckins() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCoachCheckinData();

        if (!cancelled) {
          setData(result);
        }
      } catch (loadError) {
        console.error(
          "Could not load Check-In Analysis:",
          loadError,
        );

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load check-in analysis.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCheckins();

    return () => {
      cancelled = true;
    };
  }, []);

  const comparison = useMemo(
    () =>
      compareCheckinPeriods(
        data?.checkins ?? [],
      ),
    [data],
  );

  const summary = comparison.current;

  /*
  ============================================================
  CURRENT 4-WEEK RAW ROWS

  These rows power sections that need session-level data rather
  than only the summary totals.
  ============================================================
  */
  const currentPeriodCheckins =
    useMemo(
      () => {
        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0,
        );

        const start =
          new Date(today);

        start.setDate(
          start.getDate() -
            27,
        );

        return (
          data?.checkins ?? []
        ).filter(
          (checkin) => {
            const date =
              new Date(
                `${checkin.checkin_date}T00:00:00`,
              );

            return (
              date >= start &&
              date <= today &&
              checkin.is_rest_day !== true
            );
          },
        );
      },
      [data],
    );

  const previousPeriodCheckins =
    useMemo(
      () => {
        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0,
        );

        const previousEnd =
          new Date(today);

        previousEnd.setDate(
          previousEnd.getDate() -
            28,
        );

        const previousStart =
          new Date(today);

        previousStart.setDate(
          previousStart.getDate() -
            55,
        );

        return (
          data?.checkins ?? []
        ).filter(
          (checkin) => {
            const date =
              new Date(
                `${checkin.checkin_date.slice(
                  0,
                  10,
                )}T00:00:00`,
              );

            return (
              date >= previousStart &&
              date <= previousEnd
            );
          },
        );
      },
      [data],
    );
  const unexpectedDifficulty =
    useMemo(
      () =>
        calculateUnexpectedDifficulty(
          currentPeriodCheckins,
        ),
      [currentPeriodCheckins],
    );

  const matrix =
    useMemo(
      () =>
        calculateGoalPerformanceMatrix(
          currentPeriodCheckins,
        ),
      [currentPeriodCheckins],
    );

  const athleteNameById =
    useMemo(
      () =>
        new Map(
          (data?.athletes ?? []).map(
            (athlete) => [
              athlete.id,
              athlete.display_name ??
                "Unnamed athlete",
            ],
          ),
        ),
      [data],
    );

  const unusualResponses =
    useMemo(
      () =>
        calculateUnusualResponses(
          currentPeriodCheckins,
        ).map((item) => ({
          ...item,
          athlete:
            athleteNameById.get(
              item.athleteId,
            ) ?? "Unknown athlete",
        })),
      [
        currentPeriodCheckins,
        athleteNameById,
      ],
    );

  const trendData =
    useMemo(
      () =>
        calculateCheckinTrend(
          currentPeriodCheckins,
          trendMetric,
        ),
      [
        currentPeriodCheckins,
        trendMetric,
      ],
    );

  const previousTrendData =
    useMemo(
      () =>
        calculateCheckinTrend(
          previousPeriodCheckins,
          trendMetric,
        ),
      [
        previousPeriodCheckins,
        trendMetric,
      ],
    );

  const trendAxisMax =
    trendMetric === "RPE"
      ? 10
      : trendMetric ===
          "Physical Feeling"
        ? 5
        : trendMetric ===
            "Performance Quality"
          ? 4
          : 3;

  const trendAxisLabels =
    [
      trendAxisMax,
      trendAxisMax * 0.75,
      trendAxisMax * 0.5,
      trendAxisMax * 0.25,
      0,
    ].map(
      (value) =>
        Number.isInteger(value)
          ? value
          : Number(
              value.toFixed(1),
            ),
    );

  function createTrendPoints(
    points:
      typeof trendData,
  ) {
    if (
      points.length === 0
    ) {
      return "";
    }

    return points
      .map(
        (point, index) => {
          const x =
            points.length === 1
              ? 250
              : (
                  index /
                  (
                    points.length -
                    1
                  )
                ) *
                500;

          const normalized =
            Math.max(
              0,
              Math.min(
                1,
                point.value /
                  trendAxisMax,
              ),
            );

          const y =
            105 -
            normalized * 95;

          return `${x},${y}`;
        },
      )
      .join(" ");
  }

  function getTrendPointPosition(
    value: number,
    index: number,
    length: number,
  ) {
    const x =
      length === 1
        ? 250
        : (
            index /
            (
              length -
              1
            )
          ) *
          500;

    const normalized =
      Math.max(
        0,
        Math.min(
          1,
          value /
            trendAxisMax,
        ),
      );

    const y =
      105 -
      normalized * 95;

    return {
      x,
      y,
    };
  }

  const trendPoints =
    createTrendPoints(
      trendData,
    );

  const previousTrendPoints =
    createTrendPoints(
      previousTrendData,
    );

  const currentTrendAverage =
    trendData.length > 0
      ? trendData.reduce(
          (total, point) =>
            total +
            point.value,
          0,
        ) /
        trendData.length
      : null;

  const previousTrendAverage =
    previousTrendData.length >
    0
      ? previousTrendData.reduce(
          (total, point) =>
            total +
            point.value,
          0,
        ) /
        previousTrendData.length
      : null;

  const trendInsight =
    currentTrendAverage === null
      ? `No recent ${trendMetric.toLowerCase()} data available.`
      : previousTrendAverage ===
          null
        ? `Current ${trendMetric.toLowerCase()} data is available, but there is not enough previous-period data for comparison.`
        : Math.abs(
              currentTrendAverage -
                previousTrendAverage,
            ) < 0.05
          ? `${trendMetric} is approximately unchanged compared with the previous 4 weeks.`
          : currentTrendAverage >
              previousTrendAverage
            ? `${trendMetric} is higher than during the previous 4 weeks.`
            : `${trendMetric} is lower than during the previous 4 weeks.`;
  const checkinInsight =
    useMemo(() => {
      const topDifficulty =
        unexpectedDifficulty[0];

      const topUnusual =
        unusualResponses[0];

      if (
        topDifficulty &&
        topUnusual
      ) {
        return `${topDifficulty.label} was harder than expected in ${topDifficulty.percentage}% of recent sessions. ${topUnusual.athlete} currently shows the strongest review signal: ${topUnusual.signal.toLowerCase()}.`;
      }

      if (topDifficulty) {
        return `${topDifficulty.label} was harder than expected in ${topDifficulty.percentage}% of recent sessions across ${topDifficulty.athletes} athlete${topDifficulty.athletes === 1 ? "" : "s"}.`;
      }

      if (topUnusual) {
        return `${topUnusual.athlete} currently shows a check-in signal worth reviewing: ${topUnusual.signal.toLowerCase()} (${topUnusual.detail.toLowerCase()}).`;
      }

      if (currentPeriodCheckins.length > 0) {
        return "Recent check-ins do not currently show a repeated difficulty or athlete-level review signal.";
      }

      return "No recent check-in data is available for this analysis period.";
    }, [
      unexpectedDifficulty,
      unusualResponses,
      currentPeriodCheckins,
    ]);

  const formatChange = (
    value: number | null,
    suffix = "",
  ) => {
    if (value === null) {
      return "No previous-period comparison";
    }

    if (value === 0) {
      return "No change vs previous 4 weeks";
    }

    const arrow = value > 0 ? "↑" : "↓";

    return `${arrow} ${Math.abs(value)}${suffix} vs previous 4 weeks`;
  };

  const factors =
    summary.performanceFactors
      .slice(0, 6)
      .map((factor) => ({
        ...factor,
        value: factor.percentage,
        icon:
          getPerformanceFactorIcon(
            factor.label,
          ),
      }));

  const difficultyEasierEnd =
    summary.difficulty.easier * 3.6;

  const difficultyExpectedEnd =
    difficultyEasierEnd +
    summary.difficulty.expected * 3.6;

  const difficultyHarderEnd =
    difficultyExpectedEnd +
    summary.difficulty.harder * 3.6;

  const difficultyMuchHarderEnd =
    Math.min(
      360,
      difficultyHarderEnd +
        summary.difficulty.muchHarder * 3.6,
    );

  const difficultyGradient =
    summary.totalSessions === 0
      ? "conic-gradient(#e2e8f0 0deg 360deg)"
      : `conic-gradient(
          #22c55e 0deg ${difficultyEasierEnd}deg,
          #3b82f6 ${difficultyEasierEnd}deg ${difficultyExpectedEnd}deg,
          #f97316 ${difficultyExpectedEnd}deg ${difficultyHarderEnd}deg,
          #ef4444 ${difficultyHarderEnd}deg ${difficultyMuchHarderEnd}deg,
          #e2e8f0 ${difficultyMuchHarderEnd}deg 360deg
        )`;

  const painChange =
    summary.painReports -
    comparison.previous.painReports;

  const stressChange =
    summary.stressReports -
    comparison.previous.stressReports;

  const formatCountChange = (
    value: number,
  ) => {
    if (value === 0) {
      return "No change vs previous period";
    }

    return `${
      value > 0 ? "↑" : "↓"
    } ${Math.abs(value)} vs previous period`;
  };

  const metrics = [
    {
      label: "Avg RPE",
      value:
        summary.averageRpe !== null
          ? summary.averageRpe.toFixed(1)
          : "—",
      suffix: "/10",
      detail: formatChange(
        comparison.changes.averageRpe,
      ),
      icon: CircleUserRound,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Goal Achieved",
      value:
        summary.goalAchievedPercentage !== null
          ? `${summary.goalAchievedPercentage}%`
          : "—",
      detail: formatChange(
        comparison.changes.goalAchieved,
        "%",
      ),
      icon: Target,
      style: "bg-green-50 text-green-600",
    },
    {
      label: "Stable / Improved",
      value:
        summary.stableOrImprovedPercentage !== null
          ? `${summary.stableOrImprovedPercentage}%`
          : "—",
      detail: formatChange(
        comparison.changes.stableOrImproved,
        "%",
      ),
      icon: Activity,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Sessions to Review",
      value: String(
        summary.sessionsToReview,
      ),
      detail:
        comparison.changes.sessionsToReview === 0
          ? "No change vs previous 4 weeks"
          : `${
              comparison.changes.sessionsToReview > 0
                ? "↑"
                : "↓"
            } ${Math.abs(
              comparison.changes.sessionsToReview,
            )} vs previous 4 weeks`,
      icon: TrendingDown,
      style: "bg-red-50 text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading Check-In Analysis...
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Reading athlete check-ins from Supabase.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Check-In Analysis could not be loaded
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.athleteIds.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-left text-xs text-yellow-900">
          <p>DEBUG athleteIds: {JSON.stringify(data?.athleteIds ?? [])}</p>
          <p>DEBUG athletes: {JSON.stringify(data?.athletes ?? [])}</p>
          <p>DEBUG checkins: {data?.checkins.length ?? 0}</p>
        </div>
        <p className="text-sm font-bold">
          No athletes connected
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Connect athletes to this coach before analysing check-ins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">


      <section className="grid grid-cols-4 gap-2">
        {metrics.map(({ label, value, suffix, detail, icon: Icon, style }) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-white px-3 py-2 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style}`}
              >
                <Icon className="h-3.5 w-3.5" />
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
        <section className="rounded-2xl border border-border bg-white p-2.5 shadow-sm">
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
            {(["RPE", "Physical Feeling", "Performance Quality", "Goal Achievement"] as const).map(
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

          {trendMode === "average" ? (
            <>
              <div className="relative mt-3 h-36">
                <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
                  {trendAxisLabels.map((value) => (
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
                  {previousTrendPoints && (
                    <polyline
                      points={
                        previousTrendPoints
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-300"
                    />
                  )}

                  {trendPoints && (
                    <polyline
                      points={
                        trendPoints
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-violet-600"
                    />
                  )}

                  {trendData.map(
                    (
                      point,
                      index,
                    ) => {
                      const {
                        x,
                        y,
                      } =
                        getTrendPointPosition(
                          point.value,
                          index,
                          trendData.length,
                        );

                      return (
                        <circle
                          key={
                            point.date
                          }
                          cx={x}
                          cy={y}
                          r="2.8"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-violet-600"
                        />
                      );
                    },
                  )}
                </svg>

                <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[7px] text-muted-foreground">
                  {trendData.length > 0 ? (
                    trendData.map((point) => (
                      <span key={point.date}>
                        {point.label}
                      </span>
                    ))
                  ) : (
                    <span>No recent {trendMetric} data</span>
                  )}
                </div>
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
                {trendInsight}
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-orange-100 bg-orange-50/40 px-2.5 py-2">
                <p className="text-[8px] font-semibold text-orange-700">
                  {summary.mostReportedPainArea
                  ? `${summary.mostReportedPainArea.count} reports`
                  : "No reports"} differ from their recent response pattern
                </p>

                <p className="mt-0.5 text-[7px] text-muted-foreground">
                  These are changes worth inspecting, not automatic problems.
                </p>
              </div>

              {unusualResponses.map((item) => (
                <button
                  key={item.athlete}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left transition hover:bg-muted/20"
                >
                  <div>
                    <p className="text-[9px] font-semibold">
                      {item.athlete}
                    </p>

                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                      {item.signal}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[7px] font-semibold ${item.style}`}
                    >
                      {item.detail}
                    </span>

                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              ))}

              <button
                type="button"
                className="text-[8px] font-semibold text-violet-600"
              >
                View all unusual responses →
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-2.5 shadow-sm">
          <h3 className="text-xs font-bold">
            2. Was training harder than expected?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Intended difficulty compared with athlete perception
          </p>

          <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-4">
            <div
              className="relative grid h-24 w-24 place-items-center rounded-full"
              style={{
                background:
                  difficultyGradient,
              }}
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-base font-bold">
                  {summary.totalSessions}
                </p>
                  <p className="text-[7px] text-muted-foreground">
                    Sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                [
                  "Easier than expected",
                  `${summary.difficulty.easier}%`,
                  "text-green-600",
                ],
                [
                  "As expected",
                  `${summary.difficulty.expected}%`,
                  "text-blue-600",
                ],
                [
                  "Harder than expected",
                  `${summary.difficulty.harder}%`,
                  "text-orange-600",
                ],
                [
                  "Much harder",
                  `${summary.difficulty.muchHarder}%`,
                  "text-red-600",
                ],
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

        <section className="rounded-2xl border border-border bg-white p-2.5 shadow-sm">
          <h3 className="text-xs font-bold">
            3. Did training work as intended?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Goal achievement × performance quality
          </p>

          <div className="mt-3">
            <div className="grid grid-cols-[72px_repeat(4,1fr)] gap-1.5 text-center">
              <div />

              {[
                "Improved",
                "Stable",
                "Declined",
                "Can't judge",
              ].map((label) => (
                <div
                  key={label}
                  className="px-1 pb-1 text-[6px] font-medium leading-tight text-muted-foreground"
                >
                  {label}
                </div>
              ))}

              {matrix.map((row, rowIndex) => (
                <>
                  <div
                    key={`label-${rowIndex}`}
                    className="flex items-center pr-1 text-left text-[7px] font-semibold leading-tight"
                  >
                    {["Achieved", "Partly achieved", "Not achieved"][rowIndex]}
                  </div>

                  {row.map((cell, cellIndex) => (
                    <button
                      key={`${rowIndex}-${cellIndex}`}
                      type="button"
                      className={`rounded-lg border border-white px-1.5 py-1.5 text-center ${cell.style}`}
                    >
                      <p className="text-[11px] font-bold leading-none">{cell.value}</p>
                      {cell.count > 0 && (
                        <p className="mt-1 text-[6px] leading-none opacity-70">
                          {cell.count} sessions
                        </p>
                      )}
                    </button>
                  ))}
                </>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-red-50 px-2.5 py-1.5">
            <div>
              <p className="text-[8px] font-semibold text-red-700">
                {summary.sessionsToReview} sessions worth reviewing
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

      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-2xl border border-border bg-white p-2.5 shadow-sm">
          <h3 className="text-xs font-bold">
            4. Frequently Reported Performance Factors
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Factors athletes say influenced their performance
          </p>

          <div className="mt-2.5 space-y-1.5">
            {factors.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center">
                <p className="text-[8px] font-semibold">
                  No performance factors reported
                </p>

                <p className="mt-1 text-[7px] text-muted-foreground">
                  Factors will appear here when athletes report them in check-ins.
                </p>
              </div>
            )}

            {factors.map(({ label, value, count, icon: Icon }) => (
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
                    style={{
                      width: `${Math.min(value, 100)}%`,
                    }}
                    className="h-full rounded-full bg-violet-500"
                  />
                </div>

                <span
                  className="text-right text-[8px] font-semibold"
                  title={`${count} sessions`}
                >
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

        <section className="rounded-2xl border border-border bg-white p-2.5 shadow-sm">
          <h3 className="text-xs font-bold">
            5. Body & Mental Signals
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Important signals reported through check-ins
          </p>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-2.5">
              <HeartPulse className="h-4 w-4 text-red-500" />
              <p className="mt-2 text-lg font-bold">
                {summary.painReports}
              </p>
              <p className="text-[8px] font-semibold">Pain reports</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                {formatCountChange(
                  painChange,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-2.5">
              <Brain className="h-4 w-4 text-violet-600" />
              <p className="mt-2 text-lg font-bold">
                {summary.stressReports}
              </p>
              <p className="text-[8px] font-semibold">Stress reports</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                {formatCountChange(
                  stressChange,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-2.5">
              <Activity className="h-4 w-4 text-orange-600" />
              <p className="mt-2 text-sm font-bold">
                {summary.mostReportedPainArea?.area ?? "—"}
              </p>
              <p className="text-[8px] font-semibold">Most reported area</p>
              <p className="mt-1 text-[7px] text-muted-foreground">
                {summary.mostReportedPainArea
                  ? `${summary.mostReportedPainArea.count} reports`
                  : "No reports"}
              </p>
            </div>
          </div>

          {(summary.painReports > 0 ||
            summary.stressReports > 0) && (
            <div className="mt-1.5 rounded-lg border border-orange-100 bg-orange-50/50 p-1.5 text-[7px] text-orange-800">
              {summary.painReports > 0 &&
              summary.stressReports > 0
                ? `${summary.painReports} pain reports and ${summary.stressReports} stress-related reports were recorded during the current period.`
                : summary.painReports > 0
                  ? `${summary.painReports} pain reports were recorded during the current period.`
                  : `${summary.stressReports} stress-related reports were recorded during the current period.`}
            </div>
          )}
        </section>


      </div>


      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-orange-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            AI Coach Insight
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            {checkinInsight}
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




























