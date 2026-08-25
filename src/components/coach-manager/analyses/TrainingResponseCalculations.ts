import type {
  CoachCheckin,
} from "./check-in/CheckinAnalysisData";

export type TrainingResponseSummary = {
  totalSessions: number;
  averageRpe: number | null;
  goalAchievedPercentage: number | null;
  stableOrImprovedPercentage: number | null;
  sessionsToReview: number;
};

export type TrainingTypeResponse = {
  label: string;
  sessions: number;
  athletes: number;

  goalAchievementPercentage: number | null;
  averageRpe: number | null;

  improvedPercentage: number;
  stablePercentage: number;
  declinedPercentage: number;
  unknownPercentage: number;

  stableOrImprovedPercentage: number | null;

  qualityLabel:
    | "Stable / improved"
    | "Mostly stable"
    | "Mixed"
    | "Some decline"
    | "More decline"
    | "Insufficient data";
};

export type TrainingSessionToReview = {
  athleteId: string;
  workoutType: string;
  date: string;
  goalAchievement: string | null;
  rpe: number | null;
  performanceQuality: string | null;
  reasons: string[];
};

export type PerformanceQualityDistribution = {
  improved: number;
  stable: number;
  declined: number;
  unknown: number;
};

function percentage(
  part: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (part / total) * 100,
  );
}

function average(
  values: number[],
) {
  if (values.length === 0) {
    return null;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return Math.round(
    (total / values.length) * 10,
  ) / 10;
}

function isValidGoal(
  value: string | null,
) {
  return (
    value === "Ja" ||
    value === "Teilweise" ||
    value === "Nein"
  );
}

function getPerformanceCategory(
  value: string | null,
):
  | "improved"
  | "stable"
  | "declined"
  | "unknown"
  | null {
  if (
    value ===
    "Besser geworden"
  ) {
    return "improved";
  }

  if (
    value ===
    "Stabil geblieben"
  ) {
    return "stable";
  }

  if (
    value ===
      "Etwas abgefallen" ||
    value ===
      "Stark abgefallen"
  ) {
    return "declined";
  }

  if (
    value ===
    "Kann ich nicht beurteilen"
  ) {
    return "unknown";
  }

  return null;
}

function getQualityLabel(
  distribution:
    PerformanceQualityDistribution,
): TrainingTypeResponse["qualityLabel"] {
  const evaluable =
    distribution.improved +
    distribution.stable +
    distribution.declined;

  if (evaluable === 0) {
    return "Insufficient data";
  }

  const stableOrImproved =
    distribution.improved +
    distribution.stable;

  const stableOrImprovedPercentage =
    percentage(
      stableOrImproved,
      evaluable,
    );

  const declinedPercentage =
    percentage(
      distribution.declined,
      evaluable,
    );

  if (
    stableOrImprovedPercentage >= 80
  ) {
    return "Stable / improved";
  }

  if (
    stableOrImprovedPercentage >= 65
  ) {
    return "Mostly stable";
  }

  if (
    declinedPercentage >= 50
  ) {
    return "More decline";
  }

  if (
    declinedPercentage >= 30
  ) {
    return "Some decline";
  }

  return "Mixed";
}

export function calculateTrainingResponseSummary(
  checkins: CoachCheckin[],
): TrainingResponseSummary {
  const sessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true,
    );

  const rpeValues =
    sessions
      .map(
        (checkin) =>
          checkin.rpe,
      )
      .filter(
        (value): value is number =>
          typeof value === "number",
      );

  const goalAnswered =
    sessions.filter(
      (checkin) =>
        isValidGoal(
          checkin.session_goal_achieved,
        ),
    );

  const goalsAchieved =
    goalAnswered.filter(
      (checkin) =>
        checkin.session_goal_achieved ===
        "Ja",
    ).length;

  const performanceAnswered =
    sessions.filter(
      (checkin) => {
        const category =
          getPerformanceCategory(
            checkin.performance_quality,
          );

        return (
          category === "improved" ||
          category === "stable" ||
          category === "declined"
        );
      },
    );

  const stableOrImproved =
    performanceAnswered.filter(
      (checkin) => {
        const category =
          getPerformanceCategory(
            checkin.performance_quality,
          );

        return (
          category === "improved" ||
          category === "stable"
        );
      },
    ).length;

  const sessionsToReview =
    calculateTrainingSessionsToReview(
      sessions,
    ).length;

  return {
    totalSessions:
      sessions.length,

    averageRpe:
      average(rpeValues),

    goalAchievedPercentage:
      goalAnswered.length > 0
        ? percentage(
            goalsAchieved,
            goalAnswered.length,
          )
        : null,

    stableOrImprovedPercentage:
      performanceAnswered.length > 0
        ? percentage(
            stableOrImproved,
            performanceAnswered.length,
          )
        : null,

    sessionsToReview,
  };
}

export function calculatePerformanceQualityDistribution(
  checkins: CoachCheckin[],
): PerformanceQualityDistribution {
  const sessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true,
    );

  const counts = {
    improved: 0,
    stable: 0,
    declined: 0,
    unknown: 0,
  };

  for (const checkin of sessions) {
    const category =
      getPerformanceCategory(
        checkin.performance_quality,
      );

    if (!category) {
      continue;
    }

    counts[category] += 1;
  }

  const total =
    counts.improved +
    counts.stable +
    counts.declined +
    counts.unknown;

  if (total === 0) {
    return counts;
  }

  return {
    improved:
      percentage(
        counts.improved,
        total,
      ),

    stable:
      percentage(
        counts.stable,
        total,
      ),

    declined:
      percentage(
        counts.declined,
        total,
      ),

    unknown:
      percentage(
        counts.unknown,
        total,
      ),
  };
}

export function calculateTrainingSessionsToReview(
  checkins: CoachCheckin[],
): TrainingSessionToReview[] {
  return checkins
    .filter(
      (checkin) =>
        checkin.is_rest_day !== true,
    )
    .map(
      (checkin) => {
        const reasons:
          string[] = [];

        if (
          checkin.session_goal_achieved ===
          "Nein"
        ) {
          reasons.push(
            "Goal not achieved",
          );
        }

        if (
          checkin.performance_quality ===
          "Stark abgefallen"
        ) {
          reasons.push(
            "Performance strongly declined",
          );
        }

        return {
          athleteId:
            checkin.user_id,

          workoutType:
            typeof checkin.workout_type ===
              "string" &&
            checkin.workout_type.trim()
              .length > 0
              ? checkin.workout_type.trim()
              : "Unknown training",

          date:
            checkin.checkin_date,

          goalAchievement:
            checkin.session_goal_achieved,

          rpe:
            checkin.rpe,

          performanceQuality:
            checkin.performance_quality,

          reasons,
        };
      },
    )
    .filter(
      (session) =>
        session.reasons.length > 0,
    )
    .sort(
      (a, b) =>
        new Date(
          b.date,
        ).getTime() -
        new Date(
          a.date,
        ).getTime(),
    );
}

export function calculateTrainingTypeResponses(
  checkins: CoachCheckin[],
): TrainingTypeResponse[] {
  const validSessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true &&
        typeof checkin.workout_type ===
          "string" &&
        checkin.workout_type.trim()
          .length > 0,
    );

  const grouped =
    new Map<
      string,
      CoachCheckin[]
    >();

  for (const checkin of validSessions) {
    const workoutType =
      checkin.workout_type!.trim();

    const existing =
      grouped.get(
        workoutType,
      ) ?? [];

    existing.push(
      checkin,
    );

    grouped.set(
      workoutType,
      existing,
    );
  }

  return [...grouped.entries()]
    .map(
      ([
        label,
        sessions,
      ]) => {
        const athleteIds =
          new Set(
            sessions.map(
              (session) =>
                session.user_id,
            ),
          );

        const rpeValues =
          sessions
            .map(
              (session) =>
                session.rpe,
            )
            .filter(
              (
                value,
              ): value is number =>
                typeof value ===
                "number",
            );

        const goalAnswered =
          sessions.filter(
            (session) =>
              isValidGoal(
                session.session_goal_achieved,
              ),
          );

        const goalsAchieved =
          goalAnswered.filter(
            (session) =>
              session.session_goal_achieved ===
              "Ja",
          ).length;

        const rawDistribution = {
          improved: 0,
          stable: 0,
          declined: 0,
          unknown: 0,
        };

        for (
          const session of sessions
        ) {
          const category =
            getPerformanceCategory(
              session.performance_quality,
            );

          if (!category) {
            continue;
          }

          rawDistribution[
            category
          ] += 1;
        }

        const distributionTotal =
          rawDistribution.improved +
          rawDistribution.stable +
          rawDistribution.declined +
          rawDistribution.unknown;

        const distribution =
          distributionTotal > 0
            ? {
                improved:
                  percentage(
                    rawDistribution.improved,
                    distributionTotal,
                  ),

                stable:
                  percentage(
                    rawDistribution.stable,
                    distributionTotal,
                  ),

                declined:
                  percentage(
                    rawDistribution.declined,
                    distributionTotal,
                  ),

                unknown:
                  percentage(
                    rawDistribution.unknown,
                    distributionTotal,
                  ),
              }
            : {
                improved: 0,
                stable: 0,
                declined: 0,
                unknown: 0,
              };

        const evaluablePerformance =
          rawDistribution.improved +
          rawDistribution.stable +
          rawDistribution.declined;

        const stableOrImproved =
          rawDistribution.improved +
          rawDistribution.stable;

        return {
          label,

          sessions:
            sessions.length,

          athletes:
            athleteIds.size,

          goalAchievementPercentage:
            goalAnswered.length > 0
              ? percentage(
                  goalsAchieved,
                  goalAnswered.length,
                )
              : null,

          averageRpe:
            average(
              rpeValues,
            ),

          improvedPercentage:
            distribution.improved,

          stablePercentage:
            distribution.stable,

          declinedPercentage:
            distribution.declined,

          unknownPercentage:
            distribution.unknown,

          stableOrImprovedPercentage:
            evaluablePerformance >
            0
              ? percentage(
                  stableOrImproved,
                  evaluablePerformance,
                )
              : null,

          qualityLabel:
            getQualityLabel(
              distribution,
            ),
        };
      },
    )
    .sort(
      (a, b) =>
        b.sessions -
        a.sessions,
    );
}




/*
=============================================================================
SECTION 5 — TRAINING RESPONSE TREND

Goal:
- goal    = percentage of answered sessions with goal achieved
- quality = percentage of evaluable sessions stable or improved
- rpe     = average athlete RPE

We keep categorical athlete responses categorical in the UI instead of
inventing an artificial "performance score".
=============================================================================
*/

export type TrainingResponseTrendMetric =
  | "goal"
  | "quality"
  | "rpe";

export type TrainingResponseTrendPoint = {
  date: string;
  label: string;
  value: number;
  sessions: number;
};

export function calculateTrainingResponseTrend(
  checkins: CoachCheckin[],
  metric: TrainingResponseTrendMetric,
): TrainingResponseTrendPoint[] {
  const byDate =
    new Map<
      string,
      CoachCheckin[]
    >();

  for (const checkin of checkins) {
    if (checkin.is_rest_day === true) {
      continue;
    }

    const date =
      checkin.checkin_date.slice(
        0,
        10,
      );

    const existing =
      byDate.get(date) ?? [];

    existing.push(checkin);

    byDate.set(
      date,
      existing,
    );
  }

  return [...byDate.entries()]
    .sort(
      ([a], [b]) =>
        new Date(a).getTime() -
        new Date(b).getTime(),
    )
    .slice(-5)
    .map(
      ([date, sessions]) => {
        let value:
          number | null = null;

        if (metric === "rpe") {
          const rpeValues =
            sessions
              .map(
                (session) =>
                  session.rpe,
              )
              .filter(
                (
                  item,
                ): item is number =>
                  typeof item ===
                  "number",
              );

          value =
            average(
              rpeValues,
            );
        }

        if (metric === "goal") {
          const answered =
            sessions.filter(
              (session) =>
                isValidGoal(
                  session.session_goal_achieved,
                ),
            );

          const achieved =
            answered.filter(
              (session) =>
                session.session_goal_achieved ===
                "Ja",
            ).length;

          value =
            answered.length > 0
              ? percentage(
                  achieved,
                  answered.length,
                )
              : null;
        }

        if (metric === "quality") {
          const evaluable =
            sessions.filter(
              (session) => {
                const category =
                  getPerformanceCategory(
                    session.performance_quality,
                  );

                return (
                  category ===
                    "improved" ||
                  category ===
                    "stable" ||
                  category ===
                    "declined"
                );
              },
            );

          const stableOrImproved =
            evaluable.filter(
              (session) => {
                const category =
                  getPerformanceCategory(
                    session.performance_quality,
                  );

                return (
                  category ===
                    "improved" ||
                  category ===
                    "stable"
                );
              },
            ).length;

          value =
            evaluable.length > 0
              ? percentage(
                  stableOrImproved,
                  evaluable.length,
                )
              : null;
        }

        if (value === null) {
          return null;
        }

        return {
          date,

          label:
            new Intl.DateTimeFormat(
              "en",
              {
                month: "short",
                day: "numeric",
              },
            ).format(
              new Date(
                `${date}T12:00:00`,
              ),
            ),

          value,

          sessions:
            sessions.length,
        };
      },
    )
    .filter(
      (
        point,
      ): point is TrainingResponseTrendPoint =>
        point !== null,
    );
}

/*
=============================================================================
SECTION 6 — CONTEXT REPORTED WITH REVIEW SESSIONS

Important:
These are athlete-reported factors occurring alongside sessions already
selected for review.

They are NOT treated as proven causes.
=============================================================================
*/

export type TrainingContextFactor = {
  label: string;
  count: number;
  percentage: number;
  athletes: number;
};

export function calculateTrainingContextFactors(
  checkins: CoachCheckin[],
): TrainingContextFactor[] {
  const reviewSessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true &&
        (
          checkin.session_goal_achieved ===
            "Nein" ||
          checkin.performance_quality ===
            "Stark abgefallen"
        ),
    );

  const sessionsWithFactors =
    reviewSessions.filter(
      (checkin) =>
        Array.isArray(
          checkin.performance_factors,
        ) &&
        checkin.performance_factors.length >
          0,
    );

  const factorMap =
    new Map<
      string,
      {
        count: number;
        athletes: Set<string>;
      }
    >();

  for (
    const session of
      sessionsWithFactors
  ) {
    if (
      !Array.isArray(
        session.performance_factors,
      )
    ) {
      continue;
    }

    for (
      const rawFactor of
        session.performance_factors
    ) {
      if (
        typeof rawFactor !==
        "string"
      ) {
        continue;
      }

      const factor =
        rawFactor.trim();

      if (
        factor.length === 0 ||
        factor ===
          "Nichts Besonderes"
      ) {
        continue;
      }

      const current =
        factorMap.get(
          factor,
        ) ?? {
          count: 0,
          athletes:
            new Set<string>(),
        };

      current.count += 1;

      current.athletes.add(
        session.user_id,
      );

      factorMap.set(
        factor,
        current,
      );
    }
  }

  return [...factorMap.entries()]
    .map(
      ([
        label,
        values,
      ]) => ({
        label,

        count:
          values.count,

        percentage:
          sessionsWithFactors.length >
          0
            ? percentage(
                values.count,
                sessionsWithFactors.length,
              )
            : 0,

        athletes:
          values.athletes.size,
      }),
    )
    .sort(
      (a, b) =>
        b.count -
          a.count ||
        a.label.localeCompare(
          b.label,
        ),
    );
}
