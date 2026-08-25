import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import {
  getCoachCheckinData,
  type CoachCheckinData,
} from "./check-in/CheckinAnalysisData";

import {
  calculatePerformanceQualityDistribution,
  calculateTrainingContextFactors,
  calculateTrainingResponseSummary,
  calculateTrainingResponseTrend,
  calculateTrainingSessionsToReview,
  type TrainingContextFactor,
} from "./TrainingResponseCalculations";

import {
  compareTrainingTypes,
} from "./TrainingResponseComparisons";


function getContextIcon(
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
    normalized.includes("weather") ||
    normalized.includes("hitze") ||
    normalized.includes("heat")
  ) {
    return ThermometerSun;
  }

  if (
    normalized.includes("wettkampf") ||
    normalized.includes("competition") ||
    normalized.includes("nerv")
  ) {
    return Zap;
  }

  return Activity;
}


function getQualityStyle(
  label: string,
) {
  if (
    label === "Stable / improved"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    label === "Mostly stable"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    label === "Some decline"
  ) {
    return "bg-orange-50 text-orange-700";
  }

  if (
    label === "More decline"
  ) {
    return "bg-red-50 text-red-600";
  }

  if (
    label === "Mixed"
  ) {
    return "bg-orange-50 text-orange-700";
  }

  return "bg-slate-50 text-slate-500";
}


function getComparisonStyle(
  tone:
    | "positive"
    | "negative"
    | "neutral"
    | "insufficient",
) {
  if (tone === "positive") {
    return "text-green-600";
  }

  if (tone === "negative") {
    return "text-red-500";
  }

  return "text-muted-foreground";
}


function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(
      `${date.slice(
        0,
        10,
      )}T12:00:00`,
    ),
  );
}


function TrainingTypeResponseTable({
  comparisons,
}: {
  comparisons:
    ReturnType<
      typeof compareTrainingTypes
    >;
}) {
  const strongestDifference =
    comparisons.find(
      (item) =>
        item.comparisonTone ===
        "negative",
    ) ??
    comparisons[0] ??
    null;

  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">
            Main comparison
          </p>

          <h3 className="mt-1 text-sm font-bold">
            Which training types stand out?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Compare goal achievement, athlete-reported performance quality
            and RPE with recent similar sessions.
          </p>
        </div>

        <button
          type="button"
          className="text-[8px] font-semibold text-violet-600"
        >
          View detailed comparison →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[160px_130px_165px_85px_1fr] gap-3 border-b border-border pb-2 text-[7px] font-semibold text-muted-foreground">
        <span>Training type</span>
        <span>Goal achievement</span>
        <span>Performance quality</span>
        <span>Avg RPE</span>
        <span>
          Compared with recent similar sessions
        </span>
      </div>

      {comparisons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center">
          <p className="text-[8px] font-semibold">
            No training-response data available
          </p>

          <p className="mt-1 text-[7px] text-muted-foreground">
            Training types will appear when athletes complete post-training check-ins.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {comparisons.map(
            (item) => (
              <button
                key={
                  item.label
                }
                type="button"
                className="grid w-full grid-cols-[160px_130px_165px_85px_1fr] items-center gap-3 py-3 text-left transition hover:bg-muted/15"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-50">
                    <Activity className="h-3.5 w-3.5 text-violet-600" />
                  </div>

                  <div>
                    <span className="text-[8px] font-semibold">
                      {item.label}
                    </span>

                    <p className="mt-0.5 text-[6px] text-muted-foreground">
                      {item.current.sessions} responses ·{" "}
                      {item.current.athletes} athletes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      style={{
                        width: `${
                          item.current.goalAchievementPercentage ??
                          0
                        }%`,
                      }}
                      className={[
                        "h-full rounded-full",
                        (
                          item.current.goalAchievementPercentage ??
                          0
                        ) >= 80
                          ? "bg-green-500"
                          : (
                                item.current.goalAchievementPercentage ??
                                0
                              ) >= 70
                            ? "bg-blue-500"
                            : (
                                  item.current.goalAchievementPercentage ??
                                  0
                                ) >= 60
                              ? "bg-orange-500"
                              : "bg-red-500",
                      ].join(
                        " ",
                      )}
                    />
                  </div>

                  <span className="text-[8px] font-bold">
                    {item.current.goalAchievementPercentage !==
                    null
                      ? `${item.current.goalAchievementPercentage}%`
                      : "—"}
                  </span>
                </div>

                <span
                  className={`w-fit rounded-full px-2 py-1 text-[7px] font-semibold ${getQualityStyle(
                    item.current
                      .qualityLabel,
                  )}`}
                >
                  {
                    item.current
                      .qualityLabel
                  }
                </span>

                <span className="text-[8px] font-semibold">
                  {item.current
                    .averageRpe !==
                  null
                    ? item.current.averageRpe.toFixed(
                        1,
                      )
                    : "—"}
                </span>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[7px] font-medium ${getComparisonStyle(
                      item.comparisonTone,
                    )}`}
                  >
                    {
                      item.comparisonLabel
                    }
                  </span>

                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ),
          )}
        </div>
      )}

      {strongestDifference && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2">
          <div>
            <p className="text-[8px] font-semibold text-orange-800">
              {strongestDifference.label} currently stands out
            </p>

            <p className="mt-0.5 text-[7px] text-muted-foreground">
              {
                strongestDifference.comparisonLabel
              }
            </p>
          </div>

          <button
            type="button"
            className="text-[8px] font-semibold text-orange-700"
          >
            Review sessions →
          </button>
        </div>
      )}
    </section>
  );
}


export function TrainingResponse() {
  const [
    metric,
    setMetric,
  ] = useState<
    "goal" | "quality" | "rpe"
  >("goal");

  const [
    data,
    setData,
  ] =
    useState<CoachCheckinData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCoachCheckinData();

        if (!cancelled) {
          setData(result);
        }
      } catch (
        loadError
      ) {
        console.error(
          "Could not load Training Response:",
          loadError,
        );

        if (!cancelled) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Could not load Training Response.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
          new Date(
            today,
          );

        start.setDate(
          start.getDate() -
            27,
        );

        return (
          data?.checkins ??
          []
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
              date >= start &&
              date <= today &&
              checkin.is_rest_day !==
                true
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

        const end =
          new Date(
            today,
          );

        end.setDate(
          end.getDate() -
            28,
        );

        const start =
          new Date(
            today,
          );

        start.setDate(
          start.getDate() -
            55,
        );

        return (
          data?.checkins ??
          []
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
              date >= start &&
              date <= end &&
              checkin.is_rest_day !==
                true
            );
          },
        );
      },
      [data],
    );

  const summary =
    useMemo(
      () =>
        calculateTrainingResponseSummary(
          currentPeriodCheckins,
        ),
      [
        currentPeriodCheckins,
      ],
    );

  const previousSummary =
    useMemo(
      () =>
        calculateTrainingResponseSummary(
          previousPeriodCheckins,
        ),
      [
        previousPeriodCheckins,
      ],
    );

  const comparisons =
    useMemo(
      () =>
        compareTrainingTypes(
          currentPeriodCheckins,
          previousPeriodCheckins,
        ),
      [
        currentPeriodCheckins,
        previousPeriodCheckins,
      ],
    );

  const sessionsToReview =
    useMemo(
      () =>
        calculateTrainingSessionsToReview(
          currentPeriodCheckins,
        ),
      [
        currentPeriodCheckins,
      ],
    );

  const distribution =
    useMemo(
      () =>
        calculatePerformanceQualityDistribution(
          currentPeriodCheckins,
        ),
      [
        currentPeriodCheckins,
      ],
    );

  const contextFactors =
    useMemo(
      () =>
        calculateTrainingContextFactors(
          currentPeriodCheckins,
        ),
      [
        currentPeriodCheckins,
      ],
    );

  const trendData =
    useMemo(
      () =>
        calculateTrainingResponseTrend(
          currentPeriodCheckins,
          metric,
        ),
      [
        currentPeriodCheckins,
        metric,
      ],
    );

  const previousTrendData =
    useMemo(
      () =>
        calculateTrainingResponseTrend(
          previousPeriodCheckins,
          metric,
        ),
      [
        previousPeriodCheckins,
        metric,
      ],
    );

  function change(
    current:
      number | null,
    previous:
      number | null,
    decimals = 0,
  ) {
    if (
      current === null ||
      previous === null
    ) {
      return null;
    }

    const factor =
      10 ** decimals;

    return (
      Math.round(
        (
          current -
          previous
        ) *
          factor,
      ) / factor
    );
  }

  function formatChange(
    value:
      number | null,
    suffix = "",
  ) {
    if (value === null) {
      return "No previous-period comparison";
    }

    if (value === 0) {
      return "No change vs previous 4 weeks";
    }

    return `${
      value > 0
        ? "↑"
        : "↓"
    } ${Math.abs(
      value,
    )}${suffix} vs previous 4 weeks`;
  }

  const goalChange =
    change(
      summary.goalAchievedPercentage,
      previousSummary.goalAchievedPercentage,
    );

  const rpeChange =
    change(
      summary.averageRpe,
      previousSummary.averageRpe,
      1,
    );

  const stableChange =
    change(
      summary.stableOrImprovedPercentage,
      previousSummary.stableOrImprovedPercentage,
    );

  const reviewChange =
    summary.sessionsToReview -
    previousSummary.sessionsToReview;

  const topMetrics = [
    {
      label:
        "Sessions analyzed",

      value:
        String(
          summary.totalSessions,
        ),

      detail:
        "Current 4 weeks",

      icon:
        CircleCheck,

      style:
        "bg-violet-50 text-violet-600",
    },

    {
      label:
        "Goal achievement",

      value:
        summary.goalAchievedPercentage !==
        null
          ? `${summary.goalAchievedPercentage}%`
          : "—",

      detail:
        formatChange(
          goalChange,
          "%",
        ),

      icon:
        Target,

      style:
        "bg-green-50 text-green-600",
    },

    {
      label:
        "Avg RPE",

      value:
        summary.averageRpe !==
        null
          ? summary.averageRpe.toFixed(
              1,
            )
          : "—",

      suffix:
        "/10",

      detail:
        formatChange(
          rpeChange,
        ),

      icon:
        Activity,

      style:
        "bg-orange-50 text-orange-600",
    },

    {
      label:
        "Stable / Improved",

      value:
        summary.stableOrImprovedPercentage !==
        null
          ? `${summary.stableOrImprovedPercentage}%`
          : "—",

      detail:
        formatChange(
          stableChange,
          "%",
        ),

      icon:
        Zap,

      style:
        "bg-blue-50 text-blue-600",
    },

    {
      label:
        "Sessions to review",

      value:
        String(
          summary.sessionsToReview,
        ),

      detail:
        reviewChange === 0
          ? "No change vs previous 4 weeks"
          : `${
              reviewChange > 0
                ? "↑"
                : "↓"
            } ${Math.abs(
              reviewChange,
            )} vs previous 4 weeks`,

      icon:
        AlertTriangle,

      style:
        "bg-red-50 text-red-600",
    },
  ];

  const trendAxisMax =
    metric === "rpe"
      ? 10
      : 100;

  const trendAxisLabels =
    [
      trendAxisMax,
      trendAxisMax *
        0.75,
      trendAxisMax *
        0.5,
      trendAxisMax *
        0.25,
      0,
    ].map(
      (value) =>
        Number.isInteger(
          value,
        )
          ? value
          : Number(
              value.toFixed(
                1,
              ),
            ),
    );

  function getTrendPosition(
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
      normalized *
        95;

    return {
      x,
      y,
    };
  }

  function createTrendPoints(
    points:
      typeof trendData,
  ) {
    return points
      .map(
        (
          point,
          index,
        ) => {
          const {
            x,
            y,
          } =
            getTrendPosition(
              point.value,
              index,
              points.length,
            );

          return `${x},${y}`;
        },
      )
      .join(" ");
  }

  const trendPoints =
    createTrendPoints(
      trendData,
    );

  const previousTrendPoints =
    createTrendPoints(
      previousTrendData,
    );

  const strongestComparison =
    comparisons.find(
      (item) =>
        item.comparisonTone ===
        "negative",
    ) ??
    comparisons[0] ??
    null;

  const interpretation =
    useMemo(
      () => {
        if (
          !strongestComparison
        ) {
          return "There is not enough recent training-response data to identify a training type that stands out.";
        }

        if (
          strongestComparison.previous ===
          null
        ) {
          return `${strongestComparison.label} has current response data, but there are not enough recent similar sessions for a reliable comparison yet.`;
        }

        const signals:
          string[] = [];

        const {
          goalAchievement,
          averageRpe,
          declined,
        } =
          strongestComparison.changes;

        if (
          goalAchievement !==
            null &&
          goalAchievement <=
            -10
        ) {
          signals.push(
            "lower goal achievement",
          );
        }

        if (
          averageRpe !==
            null &&
          averageRpe >=
            0.7
        ) {
          signals.push(
            "higher RPE",
          );
        }

        if (
          declined !==
            null &&
          declined >= 10
        ) {
          signals.push(
            "more declining performance responses",
          );
        }

        if (
          signals.length >=
          2
        ) {
          return `${strongestComparison.label} shows the clearest difference from recent comparable sessions: ${signals.join(
            ", ",
          )}.`;
        }

        return `${strongestComparison.label} is currently ${strongestComparison.comparisonLabel.toLowerCase()}.`;
      },
      [
        strongestComparison,
      ],
    );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading Training Response...
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Reading athlete post-training responses from Supabase.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Training Response could not be loaded
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (
    !data ||
    data.athleteIds.length ===
      0
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold">
          No athletes connected
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Connect athletes to this coach before analysing training responses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-5 gap-2.5">
        {topMetrics.map(
          ({
            label,
            value,
            suffix,
            detail,
            icon:
              Icon,
            style,
          }) => (
            <article
              key={
                label
              }
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
                    {
                      label
                    }
                  </p>

                  <div className="mt-0.5 flex items-baseline gap-1">
                    <p className="text-xl font-bold">
                      {
                        value
                      }
                    </p>

                    {suffix && (
                      <span className="text-[9px] text-muted-foreground">
                        {
                          suffix
                        }
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-0.5 text-[7px] ${style.split(
                      " ",
                    )[1]}`}
                  >
                    {
                      detail
                    }
                  </p>
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <TrainingTypeResponseTable
        comparisons={
          comparisons
        }
      />

      <div className="grid grid-cols-[1fr_1.08fr_0.92fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            1. How are training responses changing over time?
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Athlete-reported response over the selected period
          </p>

          <div className="mt-3 flex gap-1">
            {[
              [
                "goal",
                "Goal Achievement",
              ],
              [
                "quality",
                "Performance Quality",
              ],
              [
                "rpe",
                "RPE",
              ],
            ].map(
              ([
                id,
                label,
              ]) => (
                <button
                  key={
                    id
                  }
                  type="button"
                  onClick={() =>
                    setMetric(
                      id as
                        | "goal"
                        | "quality"
                        | "rpe",
                    )
                  }
                  className={[
                    "rounded-lg border px-2.5 py-1 text-[7px] font-semibold",
                    metric ===
                    id
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-border text-muted-foreground",
                  ].join(
                    " ",
                  )}
                >
                  {
                    label
                  }
                </button>
              ),
            )}
          </div>

          <div className="relative mt-3 h-40">
            <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
              {trendAxisLabels.map(
                (
                  value,
                ) => (
                  <div
                    key={
                      value
                    }
                    className="flex items-center gap-2"
                  >
                    <span className="w-7 text-[7px] text-muted-foreground">
                      {
                        value
                      }
                      {metric !==
                        "rpe" &&
                        "%"}
                    </span>

                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                ),
              )}
            </div>

            <svg
              viewBox="0 0 500 120"
              className="absolute left-8 top-1 h-[108px] w-[calc(100%-32px)]"
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
                    getTrendPosition(
                      point.value,
                      index,
                      trendData.length,
                    );

                  return (
                    <circle
                      key={
                        point.date
                      }
                      cx={
                        x
                      }
                      cy={
                        y
                      }
                      r="2.3"
                      fill="white"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-violet-600"
                    />
                  );
                },
              )}
            </svg>

            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[7px] text-muted-foreground">
              {trendData.length >
              0 ? (
                trendData.map(
                  (
                    point,
                  ) => (
                    <span
                      key={
                        point.date
                      }
                    >
                      {
                        point.label
                      }
                    </span>
                  ),
                )
              ) : (
                <span>
                  No recent data
                </span>
              )}
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
              <span className="text-green-600">
                Improved{" "}
                {
                  distribution.improved
                }
                %
              </span>

              <span className="text-muted-foreground">
                Stable{" "}
                {
                  distribution.stable
                }
                %
              </span>

              <span className="text-red-500">
                Declined{" "}
                {
                  distribution.declined
                }
                %
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            2. Sessions worth investigating
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Goal missed or performance strongly declined
          </p>

          <div className="mt-3 divide-y divide-border/60">
            {sessionsToReview
              .slice(
                0,
                5,
              )
              .map(
                (
                  session,
                ) => (
                  <button
                    key={`${session.athleteId}-${session.workoutType}-${session.date}`}
                    type="button"
                    className="flex w-full items-center gap-2 py-2 text-left"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50">
                      <Activity className="h-4 w-4 text-violet-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-semibold">
                        {
                          session.workoutType
                        }
                      </p>

                      <p className="text-[7px] text-muted-foreground">
                        {formatDate(
                          session.date,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[7px] text-muted-foreground">
                        Goal{" "}
                        {
                          session.goalAchievement ??
                          "—"
                        }{" "}
                        · RPE{" "}
                        {
                          session.rpe ??
                          "—"
                        }
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[7px] font-semibold text-red-600">
                        {
                          session.reasons[0]
                        }
                      </span>
                    </div>

                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ),
              )}

            {sessionsToReview.length ===
              0 && (
              <div className="py-5 text-center">
                <p className="text-[8px] font-semibold">
                  No sessions currently require review
                </p>

                <p className="mt-1 text-[7px] text-muted-foreground">
                  No goal-missed or strongly declining sessions were found.
                </p>
              </div>
            )}
          </div>

          {sessionsToReview.length >
            5 && (
            <button
              type="button"
              className="mt-2 text-[8px] font-semibold text-violet-600"
            >
              View all{" "}
              {
                sessionsToReview.length
              }{" "}
              sessions →
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            3. Context reported with these responses
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Athlete-reported context, not proven causes
          </p>

          <div className="mt-3 divide-y divide-border/60">
            {contextFactors
              .slice(
                0,
                5,
              )
              .map(
                (
                  factor:
                    TrainingContextFactor,
                ) => {
                  const Icon =
                    getContextIcon(
                      factor.label,
                    );

                  return (
                    <div
                      key={
                        factor.label
                      }
                      className="flex items-start gap-2 py-2.5"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50">
                        <Icon className="h-4 w-4 text-violet-600" />
                      </div>

                      <div>
                        <p className="text-[8px] font-semibold">
                          {
                            factor.label
                          }
                        </p>

                        <p className="mt-0.5 text-[7px] leading-relaxed text-muted-foreground">
                          Reported in{" "}
                          {
                            factor.count
                          }{" "}
                          review session
                          {factor.count ===
                          1
                            ? ""
                            : "s"}{" "}
                          across{" "}
                          {
                            factor.athletes
                          }{" "}
                          athlete
                          {factor.athletes ===
                          1
                            ? ""
                            : "s"}.
                        </p>
                      </div>
                    </div>
                  );
                },
              )}

            {contextFactors.length ===
              0 && (
              <div className="py-5 text-center">
                <p className="text-[8px] font-semibold">
                  No additional context reported
                </p>

                <p className="mt-1 text-[7px] text-muted-foreground">
                  Athlete-reported factors will appear here when present.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-blue-50/30 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            Athletic IQ Interpretation
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            {
              interpretation
            }
          </p>

          <p className="mt-1 text-[7px] text-muted-foreground">
            This is a pattern to investigate, not evidence that the training type caused the response.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
        >
          View evidence →
        </button>
      </section>

      <p className="text-center text-[7px] text-muted-foreground">
        Athletic IQ uses athlete-reported responses. Review individual athletes
        and session context before making training changes.
      </p>
    </div>
  );
}
