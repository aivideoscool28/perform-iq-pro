import type {
  CoachCheckin,
} from "./CheckinAnalysisData";

export type CheckinSummary = {
  totalSessions: number;

  averageRpe: number | null;

  goalAchievedPercentage: number | null;

  stableOrImprovedPercentage: number | null;

  sessionsToReview: number;

  difficulty: {
    easier: number;
    expected: number;
    harder: number;
    muchHarder: number;
  };

  performanceFactors: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;

  painReports: number;

  stressReports: number;

  mostReportedPainArea: {
    area: string;
    count: number;
  } | null;
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

export function calculateCheckinSummary(
  checkins: CoachCheckin[],
): CheckinSummary {
  const sessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true,
    );

  /*
  ---------------------------------------------------------------------------
  RPE
  ---------------------------------------------------------------------------
  */
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

  /*
  ---------------------------------------------------------------------------
  SESSION GOAL
  ---------------------------------------------------------------------------
  */
  const goalAnswered =
    sessions.filter(
      (checkin) =>
        checkin.session_goal_achieved ===
          "Ja" ||
        checkin.session_goal_achieved ===
          "Teilweise" ||
        checkin.session_goal_achieved ===
          "Nein",
    );

  const goalsAchieved =
    goalAnswered.filter(
      (checkin) =>
        checkin.session_goal_achieved ===
        "Ja",
    ).length;

  /*
  ---------------------------------------------------------------------------
  PERFORMANCE QUALITY
  ---------------------------------------------------------------------------
  */
  const performanceAnswered =
    sessions.filter(
      (checkin) =>
        checkin.performance_quality ===
          "Besser geworden" ||
        checkin.performance_quality ===
          "Stabil geblieben" ||
        checkin.performance_quality ===
          "Etwas abgefallen" ||
        checkin.performance_quality ===
          "Stark abgefallen",
    );

  const stableOrImproved =
    performanceAnswered.filter(
      (checkin) =>
        checkin.performance_quality ===
          "Besser geworden" ||
        checkin.performance_quality ===
          "Stabil geblieben",
    ).length;

  /*
  ---------------------------------------------------------------------------
  SESSIONS TO REVIEW

  Important:
  This is deliberately transparent/simple math.

  Review when:
  - goal = Nein
  OR
  - performance = Stark abgefallen

  We do NOT automatically mark every high-RPE session as problematic.
  ---------------------------------------------------------------------------
  */
  const sessionsToReview =
    sessions.filter(
      (checkin) =>
        checkin.session_goal_achieved ===
          "Nein" ||
        checkin.performance_quality ===
          "Stark abgefallen",
    ).length;

  /*
  ---------------------------------------------------------------------------
  EXPECTED DIFFICULTY
  ---------------------------------------------------------------------------
  */
  const difficultyAnswered =
    sessions.filter(
      (checkin) =>
        typeof checkin.expected_difficulty ===
        "string",
    );

  const difficultyTotal =
    difficultyAnswered.length;

  const easier =
    difficultyAnswered.filter(
      (checkin) =>
        checkin.expected_difficulty ===
        "Leichter als erwartet",
    ).length;

  const expected =
    difficultyAnswered.filter(
      (checkin) =>
        checkin.expected_difficulty ===
        "Wie erwartet",
    ).length;

  const harder =
    difficultyAnswered.filter(
      (checkin) =>
        checkin.expected_difficulty ===
        "Schwerer als erwartet",
    ).length;

  const muchHarder =
    difficultyAnswered.filter(
      (checkin) =>
        checkin.expected_difficulty ===
        "Deutlich schwerer als erwartet",
    ).length;

  /*
  ---------------------------------------------------------------------------
  PERFORMANCE FACTORS

  Question 9 allows multiple answers.

  Therefore this percentage means:

  sessions mentioning factor
  ÷
  all sessions with a factor answer

  Multiple factor percentages are therefore NOT expected to add to 100%.
  ---------------------------------------------------------------------------
  */
  const factorSessions =
    sessions.filter(
      (checkin) =>
        Array.isArray(
          checkin.performance_factors,
        ) &&
        checkin.performance_factors.length >
          0,
    );

  const factorCounts =
    new Map<string, number>();

  for (
    const checkin of factorSessions
  ) {
    if (
      !Array.isArray(
        checkin.performance_factors,
      )
    ) {
      continue;
    }

    for (
      const rawFactor of
        checkin.performance_factors
    ) {
      if (
        typeof rawFactor !==
        "string"
      ) {
        continue;
      }

      if (
        rawFactor ===
        "Nichts Besonderes"
      ) {
        continue;
      }

      factorCounts.set(
        rawFactor,
        (
          factorCounts.get(
            rawFactor,
          ) ?? 0
        ) + 1,
      );
    }
  }

  const performanceFactors =
    [...factorCounts.entries()]
      .map(
        ([label, count]) => ({
          label,
          count,

          percentage:
            percentage(
              count,
              factorSessions.length,
            ),
        }),
      )
      .sort(
        (a, b) =>
          b.count - a.count,
      );

  /*
  ---------------------------------------------------------------------------
  BODY + MENTAL SIGNALS
  ---------------------------------------------------------------------------
  */
  const painReports =
    sessions.filter(
      (checkin) =>
        checkin.has_pain === true,
    ).length;

  const stressReports =
    sessions.filter(
      (checkin) =>
        checkin.mental_state ===
          "Gestresst / unter Druck" ||
        (
          Array.isArray(
            checkin.performance_factors,
          ) &&
          checkin.performance_factors.includes(
            "Stress / Druck",
          )
        ),
    ).length;

  const painAreas =
    new Map<string, number>();

  for (const checkin of sessions) {
    if (
      checkin.has_pain !== true ||
      !checkin.pain_area
    ) {
      continue;
    }

    painAreas.set(
      checkin.pain_area,
      (
        painAreas.get(
          checkin.pain_area,
        ) ?? 0
      ) + 1,
    );
  }

  const mostReportedPainArea =
    [...painAreas.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
      .map(
        ([area, count]) => ({
          area,
          count,
        }),
      )[0] ?? null;

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

    difficulty: {
      easier:
        percentage(
          easier,
          difficultyTotal,
        ),

      expected:
        percentage(
          expected,
          difficultyTotal,
        ),

      harder:
        percentage(
          harder,
          difficultyTotal,
        ),

      muchHarder:
        percentage(
          muchHarder,
          difficultyTotal,
        ),
    },

    performanceFactors,

    painReports,

    stressReports,

    mostReportedPainArea,
  };
}

/*
=============================================================================
SECTION 2 — UNEXPECTED DIFFICULTY BY TRAINING TYPE
=============================================================================

For every workout type:

unexpected sessions
=
"Schwerer als erwartet"
OR
"Deutlich schwerer als erwartet"

percentage
=
unexpected sessions
÷
all sessions of that workout type that answered Question 3
× 100

This means:

31% Speed Endurance

does NOT mean that 31% of all difficult sessions were Speed Endurance.

It means:

31% of answered Speed Endurance sessions were harder than expected.

That makes the number much more useful to a coach.
=============================================================================
*/

export type UnexpectedDifficultyItem = {
  label: string;
  percentage: number;
  athletes: number;
  sessions: number;
};

export function calculateUnexpectedDifficulty(
  checkins: CoachCheckin[],
): UnexpectedDifficultyItem[] {
  const validSessions =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true &&
        typeof checkin.workout_type === "string" &&
        checkin.workout_type.trim().length > 0 &&
        (
          checkin.expected_difficulty === "Leichter als erwartet" ||
          checkin.expected_difficulty === "Wie erwartet" ||
          checkin.expected_difficulty === "Schwerer als erwartet" ||
          checkin.expected_difficulty === "Deutlich schwerer als erwartet"
        ),
    );

  const workoutTypes =
    new Map<
      string,
      {
        answered: number;
        unexpected: number;
        athletes: Set<string>;
      }
    >();

  for (const checkin of validSessions) {
    const workoutType =
      checkin.workout_type!.trim();

    const current =
      workoutTypes.get(workoutType) ?? {
        answered: 0,
        unexpected: 0,
        athletes: new Set<string>(),
      };

    current.answered += 1;

    const wasUnexpected =
      checkin.expected_difficulty ===
        "Schwerer als erwartet" ||
      checkin.expected_difficulty ===
        "Deutlich schwerer als erwartet";

    if (wasUnexpected) {
      current.unexpected += 1;
      current.athletes.add(
        checkin.user_id,
      );
    }

    workoutTypes.set(
      workoutType,
      current,
    );
  }

  return [...workoutTypes.entries()]
    .map(
      ([
        label,
        values,
      ]) => ({
        label,

        percentage:
          values.answered > 0
            ? Math.round(
                (
                  values.unexpected /
                  values.answered
                ) * 100,
              )
            : 0,

        athletes:
          values.athletes.size,

        sessions:
          values.unexpected,
      }),
    )
    .filter(
      (item) =>
        item.sessions > 0,
    )
    .sort(
      (a, b) =>
        b.percentage -
          a.percentage ||
        b.sessions -
          a.sessions,
    )
    .slice(
      0,
      5,
    );
}


/*
=============================================================================
SECTION 3 — GOAL ACHIEVEMENT × PERFORMANCE QUALITY
=============================================================================

Rows:
- Ja
- Teilweise
- Nein

Columns:
- Improved
- Stable
- Declined
- Can't judge

Question 5 "Weiß ich nicht" is excluded from the matrix because the athlete
did not provide an evaluable goal-achievement answer.

Performance mapping:

"Besser geworden"
-> Improved

"Stabil geblieben"
-> Stable

"Etwas abgefallen"
OR
"Stark abgefallen"
-> Declined

"Kann ich nicht beurteilen"
-> Can't judge

Each cell percentage is:

sessions in cell
÷
all sessions included in this matrix
× 100
=============================================================================
*/

export type GoalPerformanceMatrixCell = {
  value: string;
  count: number;
  percentage: number;
  style: string;
};

export type GoalPerformanceMatrix =
  GoalPerformanceMatrixCell[][];

export function calculateGoalPerformanceMatrix(
  checkins: CoachCheckin[],
): GoalPerformanceMatrix {
  const goalValues = [
    "Ja",
    "Teilweise",
    "Nein",
  ] as const;

  type PerformanceColumn =
    | "improved"
    | "stable"
    | "declined"
    | "unknown";

  function getPerformanceColumn(
    value: string | null,
  ): PerformanceColumn | null {
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

  const eligible =
    checkins.filter(
      (checkin) =>
        checkin.is_rest_day !== true &&
        goalValues.includes(
          checkin.session_goal_achieved as
            (typeof goalValues)[number],
        ) &&
        getPerformanceColumn(
          checkin.performance_quality,
        ) !== null,
    );

  const total =
    eligible.length;

  const styles: Record<
    string,
    string[]
  > = {
    Ja: [
      "bg-green-100 text-green-800",
      "bg-green-50 text-green-700",
      "bg-orange-50 text-orange-700",
      "bg-slate-50 text-slate-500",
    ],

    Teilweise: [
      "bg-blue-50 text-blue-700",
      "bg-blue-50 text-blue-700",
      "bg-orange-50 text-orange-700",
      "bg-slate-50 text-slate-500",
    ],

    Nein: [
      "bg-orange-50 text-orange-700",
      "bg-orange-50 text-orange-700",
      "bg-red-100 text-red-700",
      "bg-slate-50 text-slate-500",
    ],
  };

  const columns:
    PerformanceColumn[] = [
      "improved",
      "stable",
      "declined",
      "unknown",
    ];

  return goalValues.map(
    (goal) =>
      columns.map(
        (
          column,
          columnIndex,
        ) => {
          const count =
            eligible.filter(
              (checkin) =>
                checkin.session_goal_achieved ===
                  goal &&
                getPerformanceColumn(
                  checkin.performance_quality,
                ) === column,
            ).length;

          const cellPercentage =
            total > 0
              ? Math.round(
                  (
                    count /
                    total
                  ) * 100,
                )
              : 0;

          return {
            value:
              count > 0
                ? `${cellPercentage}%`
                : "—",

            count,

            percentage:
              cellPercentage,

            style:
              styles[goal][
                columnIndex
              ],
          };
        },
      ),
  );
}

export type UnusualResponseItem = {
  athleteId: string;
  signal: string;
  detail: string;
  style: string;
};

export function calculateUnusualResponses(
  checkins: CoachCheckin[],
): UnusualResponseItem[] {
  const byAthlete = new Map<string, CoachCheckin[]>();

  for (const checkin of checkins) {
    const existing =
      byAthlete.get(checkin.user_id) ?? [];

    existing.push(checkin);
    byAthlete.set(checkin.user_id, existing);
  }

  const responses: UnusualResponseItem[] = [];

  for (const [athleteId, athleteCheckins] of byAthlete) {
    const sorted = [...athleteCheckins].sort(
      (a, b) =>
        new Date(b.checkin_date).getTime() -
        new Date(a.checkin_date).getTime(),
    );

    const recent = sorted.slice(0, 4);

    const highRpe = recent.filter(
      (checkin) =>
        checkin.rpe !== null &&
        checkin.rpe >= 8,
    );

    const harderThanExpected = recent.filter(
      (checkin) => {
        const value =
          checkin.expected_difficulty
            ?.trim()
            .toLowerCase() ?? "";

        return (
          value.includes("harder") ||
          value.includes("schwerer")
        );
      },
    );

    const poorPerformance = recent.filter(
      (checkin) => {
        const value =
          checkin.performance_quality
            ?.trim()
            .toLowerCase() ?? "";

        return (
          value.includes("poor") ||
          value.includes("schlecht") ||
          value.includes("declined")
        );
      },
    );

    const painReports = recent.filter(
      (checkin) =>
        checkin.has_pain === true,
    );

    if (painReports.length >= 2) {
      responses.push({
        athleteId,
        signal: "Repeated pain reports",
        detail: `${painReports.length} recent sessions`,
        style: "bg-red-50 text-red-700",
      });

      continue;
    }

    if (harderThanExpected.length >= 2) {
      responses.push({
        athleteId,
        signal: "Training harder than expected",
        detail: `Repeated ${harderThanExpected.length} times`,
        style: "bg-orange-50 text-orange-700",
      });

      continue;
    }

    if (highRpe.length >= 2) {
      responses.push({
        athleteId,
        signal: "Repeated high RPE",
        detail: `${highRpe.length} recent sessions`,
        style: "bg-orange-50 text-orange-700",
      });

      continue;
    }

    if (poorPerformance.length >= 2) {
      responses.push({
        athleteId,
        signal: "Performance quality declined",
        detail: `${poorPerformance.length} recent sessions`,
        style: "bg-red-50 text-red-700",
      });
    }
  }

  return responses.slice(0, 5);
}

export type CheckinTrendMetric =
  | "RPE"
  | "Physical Feeling"
  | "Performance Quality"
  | "Goal Achievement";


export type CheckinTrendPoint = {
  date: string;
  label: string;
  value: number;
};

function getTrendValue(
  checkin: CoachCheckin,
  metric: CheckinTrendMetric,
): number | null {
  if (metric === "RPE") {
    return typeof checkin.rpe === "number"
      ? checkin.rpe
      : null;
  }

  if (metric === "Physical Feeling") {
    return typeof checkin.physical_feeling === "number"
      ? checkin.physical_feeling
      : null;
  }

  if (metric === "Performance Quality") {
    switch (checkin.performance_quality) {
      case "Besser geworden":
        return 4;

      case "Stabil geblieben":
        return 3;

      case "Etwas abgefallen":
        return 2;

      case "Stark abgefallen":
        return 1;

      default:
        return null;
    }
  }

  if (metric === "Goal Achievement") {
    switch (checkin.session_goal_achieved) {
      case "Ja":
        return 3;

      case "Teilweise":
        return 2;

      case "Nein":
        return 1;

      default:
        return null;
    }
  }

  return null;
}

export function calculateCheckinTrend(
  checkins: CoachCheckin[],
  metric: CheckinTrendMetric = "RPE",
): CheckinTrendPoint[] {
  const grouped =
    new Map<string, number[]>();

  for (const checkin of checkins) {
    const value =
      getTrendValue(
        checkin,
        metric,
      );

    if (value === null) {
      continue;
    }

    const date =
      checkin.checkin_date.slice(
        0,
        10,
      );

    const existing =
      grouped.get(date) ?? [];

    existing.push(value);

    grouped.set(
      date,
      existing,
    );
  }

  return [...grouped.entries()]
    .sort(
      ([a], [b]) =>
        new Date(a).getTime() -
        new Date(b).getTime(),
    )
    .slice(-5)
    .map(
      ([date, values]) => {
        const average =
          values.reduce(
            (total, value) =>
              total + value,
            0,
          ) / values.length;

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

          value:
            Math.round(
              average * 10,
            ) / 10,
        };
      },
    );
}



