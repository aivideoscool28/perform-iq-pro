import type {
  CoachCheckin,
} from "../check-in/CheckinAnalysisData";

export type ComparableSession = {
  key: string;
  date: string;
  workoutType: string;

  checkins: CoachCheckin[];

  athletes: number;

  goalAchievementPercentage:
    number | null;

  stableOrImprovedPercentage:
    number | null;

  averageRpe:
    number | null;

  harderThanExpectedPercentage:
    number | null;

  contextFactors: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
};

export type AthleteDistribution = {
  improved: number;
  similar: number;
  declined: number;
} | null;

export type SessionComparisonRow = {
  metric: string;

  sessionA: string;
  sessionADetail?: string;

  sessionB: string;
  sessionBDetail?: string;

  change: string;
  changeStyle: string;

  distribution:
    AthleteDistribution;
};

export type SessionComparisonSection = {
  title: string;
  subtitle: string;

  tone:
    | "violet"
    | "orange"
    | "green";

  rows:
    SessionComparisonRow[];
};

export type SessionPair = {
  sessionA:
    ComparableSession;

  sessionB:
    ComparableSession;

  athleteOverlap: number;

  comparisonSections:
    SessionComparisonSection[];

  sharedContext: Array<{
    label: string;
    value: string;
  }>;

  interpretation: string;

  summary: {
    outcome: string;
    demand: string;
    context: string;
  };
};

function percentage(
  part: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (
      part /
      total
    ) *
      100,
  );
}

function average(
  values: number[],
) {
  if (
    values.length ===
    0
  ) {
    return null;
  }

  return (
    Math.round(
      (
        values.reduce(
          (
            sum,
            value,
          ) =>
            sum +
            value,
          0,
        ) /
        values.length
      ) *
        10,
    ) /
    10
  );
}

function goalValue(
  value:
    string | null,
) {
  if (value === "Ja") {
    return 3;
  }

  if (
    value ===
    "Teilweise"
  ) {
    return 2;
  }

  if (
    value ===
    "Nein"
  ) {
    return 1;
  }

  return null;
}

function performanceValue(
  value:
    string | null,
) {
  if (
    value ===
    "Besser geworden"
  ) {
    return 4;
  }

  if (
    value ===
    "Stabil geblieben"
  ) {
    return 3;
  }

  if (
    value ===
    "Etwas abgefallen"
  ) {
    return 2;
  }

  if (
    value ===
    "Stark abgefallen"
  ) {
    return 1;
  }

  return null;
}

function calculateContextFactors(
  checkins:
    CoachCheckin[],
) {
  const answered =
    checkins.filter(
      (checkin) =>
        Array.isArray(
          checkin.performance_factors,
        ) &&
        checkin
          .performance_factors
          .length > 0,
    );

  const counts =
    new Map<
      string,
      number
    >();

  for (
    const checkin of
      answered
  ) {
    if (
      !Array.isArray(
        checkin.performance_factors,
      )
    ) {
      continue;
    }

    for (
      const raw of
        checkin.performance_factors
    ) {
      if (
        typeof raw !==
        "string"
      ) {
        continue;
      }

      const label =
        raw.trim();

      if (
        label.length ===
          0 ||
        label ===
          "Nichts Besonderes"
      ) {
        continue;
      }

      counts.set(
        label,
        (
          counts.get(
            label,
          ) ?? 0
        ) + 1,
      );
    }
  }

  return [
    ...counts.entries(),
  ]
    .map(
      ([
        label,
        count,
      ]) => ({
        label,

        count,

        percentage:
          answered.length >
          0
            ? percentage(
                count,
                answered.length,
              )
            : 0,
      }),
    )
    .sort(
      (a, b) =>
        b.count -
        a.count,
    );
}

function createSession(
  date: string,
  workoutType: string,
  checkins:
    CoachCheckin[],
): ComparableSession {
  const goalAnswered =
    checkins.filter(
      (checkin) =>
        goalValue(
          checkin.session_goal_achieved,
        ) !== null,
    );

  const achieved =
    goalAnswered.filter(
      (checkin) =>
        checkin.session_goal_achieved ===
        "Ja",
    ).length;

  const qualityAnswered =
    checkins.filter(
      (checkin) =>
        performanceValue(
          checkin.performance_quality,
        ) !== null,
    );

  const stableOrImproved =
    qualityAnswered.filter(
      (checkin) => {
        const value =
          performanceValue(
            checkin.performance_quality,
          );

        return (
          value !== null &&
          value >= 3
        );
      },
    ).length;

  const rpeValues =
    checkins
      .map(
        (checkin) =>
          checkin.rpe,
      )
      .filter(
        (
          value,
        ): value is number =>
          typeof value ===
          "number",
      );

  const difficultyAnswered =
    checkins.filter(
      (checkin) =>
        checkin.expected_difficulty ===
          "Leichter als erwartet" ||
        checkin.expected_difficulty ===
          "Wie erwartet" ||
        checkin.expected_difficulty ===
          "Schwerer als erwartet" ||
        checkin.expected_difficulty ===
          "Deutlich schwerer als erwartet",
    );

  const harder =
    difficultyAnswered.filter(
      (checkin) =>
        checkin.expected_difficulty ===
          "Schwerer als erwartet" ||
        checkin.expected_difficulty ===
          "Deutlich schwerer als erwartet",
    ).length;

  return {
    key:
      `${date}::${workoutType}`,

    date,

    workoutType,

    checkins,

    athletes:
      new Set(
        checkins.map(
          (checkin) =>
            checkin.user_id,
        ),
      ).size,

    goalAchievementPercentage:
      goalAnswered.length >
      0
        ? percentage(
            achieved,
            goalAnswered.length,
          )
        : null,

    stableOrImprovedPercentage:
      qualityAnswered.length >
      0
        ? percentage(
            stableOrImproved,
            qualityAnswered.length,
          )
        : null,

    averageRpe:
      average(
        rpeValues,
      ),

    harderThanExpectedPercentage:
      difficultyAnswered.length >
      0
        ? percentage(
            harder,
            difficultyAnswered.length,
          )
        : null,

    contextFactors:
      calculateContextFactors(
        checkins,
      ),
  };
}

export function buildComparableSessions(
  checkins:
    CoachCheckin[],
): ComparableSession[] {
  const grouped =
    new Map<
      string,
      {
        date: string;
        workoutType: string;
        rows:
          CoachCheckin[];
      }
    >();

  for (
    const checkin of
      checkins
  ) {
    if (
      checkin.is_rest_day ===
      true ||
      typeof checkin.workout_type !==
        "string" ||
      checkin.workout_type
        .trim()
        .length === 0
    ) {
      continue;
    }

    const date =
      checkin.checkin_date.slice(
        0,
        10,
      );

    const workoutType =
      checkin.workout_type.trim();

    const key =
      `${date}::${workoutType}`;

    const current =
      grouped.get(
        key,
      ) ?? {
        date,
        workoutType,
        rows: [],
      };

    current.rows.push(
      checkin,
    );

    grouped.set(
      key,
      current,
    );
  }

  return [
    ...grouped.values(),
  ]
    .map(
      ({
        date,
        workoutType,
        rows,
      }) =>
        createSession(
          date,
          workoutType,
          rows,
        ),
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

function getAthleteOverlap(
  sessionA:
    ComparableSession,
  sessionB:
    ComparableSession,
) {
  const a =
    new Set(
      sessionA.checkins.map(
        (checkin) =>
          checkin.user_id,
      ),
    );

  return new Set(
    sessionB.checkins
      .map(
        (checkin) =>
          checkin.user_id,
      )
      .filter(
        (athleteId) =>
          a.has(
            athleteId,
          ),
      ),
  ).size;
}

export function selectBestComparablePair(
  sessions:
    ComparableSession[],
): {
  sessionA:
    ComparableSession;
  sessionB:
    ComparableSession;
} | null {
  const byType =
    new Map<
      string,
      ComparableSession[]
    >();

  for (
    const session of
      sessions
  ) {
    const existing =
      byType.get(
        session.workoutType,
      ) ?? [];

    existing.push(
      session,
    );

    byType.set(
      session.workoutType,
      existing,
    );
  }

  let best:
    {
      sessionA:
        ComparableSession;
      sessionB:
        ComparableSession;
      overlap: number;
      recency: number;
    } |
    null = null;

  for (
    const typeSessions of
      byType.values()
  ) {
    if (
      typeSessions.length <
      2
    ) {
      continue;
    }

    const sorted =
      [...typeSessions].sort(
        (a, b) =>
          new Date(
            b.date,
          ).getTime() -
          new Date(
            a.date,
          ).getTime(),
      );

    for (
      let i = 0;
      i <
      sorted.length -
        1;
      i += 1
    ) {
      for (
        let j =
          i + 1;
        j <
        sorted.length;
        j += 1
      ) {
        const newer =
          sorted[i];

        const older =
          sorted[j];

        const overlap =
          getAthleteOverlap(
            older,
            newer,
          );

        const recency =
          new Date(
            newer.date,
          ).getTime();

        if (
          !best ||
          overlap >
            best.overlap ||
          (
            overlap ===
              best.overlap &&
            recency >
              best.recency
          )
        ) {
          best = {
            sessionA:
              older,

            sessionB:
              newer,

            overlap,

            recency,
          };
        }
      }
    }
  }

  if (!best) {
    return null;
  }

  return {
    sessionA:
      best.sessionA,

    sessionB:
      best.sessionB,
  };
}

function athleteDistribution(
  sessionA:
    ComparableSession,
  sessionB:
    ComparableSession,
  metric:
    "goal" |
    "quality",
): AthleteDistribution {
  const aByAthlete =
    new Map(
      sessionA.checkins.map(
        (checkin) => [
          checkin.user_id,
          checkin,
        ],
      ),
    );

  let improved = 0;
  let similar = 0;
  let declined = 0;

  for (
    const b of
      sessionB.checkins
  ) {
    const a =
      aByAthlete.get(
        b.user_id,
      );

    if (!a) {
      continue;
    }

    const valueA =
      metric === "goal"
        ? goalValue(
            a.session_goal_achieved,
          )
        : performanceValue(
            a.performance_quality,
          );

    const valueB =
      metric === "goal"
        ? goalValue(
            b.session_goal_achieved,
          )
        : performanceValue(
            b.performance_quality,
          );

    if (
      valueA === null ||
      valueB === null
    ) {
      continue;
    }

    if (
      valueB >
      valueA
    ) {
      improved += 1;
    } else if (
      valueB <
      valueA
    ) {
      declined += 1;
    } else {
      similar += 1;
    }
  }

  if (
    improved +
      similar +
      declined ===
    0
  ) {
    return null;
  }

  return {
    improved,
    similar,
    declined,
  };
}

function formatPercentChange(
  a: number | null,
  b: number | null,
) {
  if (
    a === null ||
    b === null
  ) {
    return {
      text: "—",
      style:
        "text-muted-foreground",
    };
  }

  const change =
    b - a;

  if (
    change === 0
  ) {
    return {
      text: "→ 0%",
      style:
        "text-slate-500",
    };
  }

  return {
    text:
      `${
        change > 0
          ? "↑"
          : "↓"
      } ${Math.abs(
        change,
      )}%`,

    style:
      change > 0
        ? "text-green-600"
        : "text-red-500",
  };
}

function formatRpeChange(
  a: number | null,
  b: number | null,
) {
  if (
    a === null ||
    b === null
  ) {
    return {
      text: "—",
      style:
        "text-muted-foreground",
    };
  }

  const change =
    Math.round(
      (
        b -
        a
      ) *
        10,
    ) /
    10;

  if (
    change === 0
  ) {
    return {
      text: "→ 0",
      style:
        "text-slate-500",
    };
  }

  return {
    text:
      `${
        change > 0
          ? "↑"
          : "↓"
      } ${Math.abs(
        change,
      )}`,

    style:
      "text-orange-600",
  };
}

function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      `${date}T12:00:00`,
    ),
  );
}

export function compareSessionPair(
  sessionA:
    ComparableSession,
  sessionB:
    ComparableSession,
): SessionPair {
  const goalChange =
    formatPercentChange(
      sessionA.goalAchievementPercentage,
      sessionB.goalAchievementPercentage,
    );

  const qualityChange =
    formatPercentChange(
      sessionA.stableOrImprovedPercentage,
      sessionB.stableOrImprovedPercentage,
    );

  const rpeChange =
    formatRpeChange(
      sessionA.averageRpe,
      sessionB.averageRpe,
    );

  const difficultyChange =
    formatPercentChange(
      sessionA.harderThanExpectedPercentage,
      sessionB.harderThanExpectedPercentage,
    );

  const overlap =
    getAthleteOverlap(
      sessionA,
      sessionB,
    );

  const comparisonSections:
    SessionComparisonSection[] = [
      {
        title:
          "OUTCOME",

        subtitle:
          "What athletes reported",

        tone:
          "violet",

        rows: [
          {
            metric:
              "Goal Achievement",

            sessionA:
              sessionA.goalAchievementPercentage !==
              null
                ? `${sessionA.goalAchievementPercentage}%`
                : "—",

            sessionADetail:
              `${sessionA.athletes} athlete responses`,

            sessionB:
              sessionB.goalAchievementPercentage !==
              null
                ? `${sessionB.goalAchievementPercentage}%`
                : "—",

            sessionBDetail:
              `${sessionB.athletes} athlete responses`,

            change:
              goalChange.text,

            changeStyle:
              goalChange.style,

            distribution:
              athleteDistribution(
                sessionA,
                sessionB,
                "goal",
              ),
          },

          {
            metric:
              "Stable / Improved",

            sessionA:
              sessionA.stableOrImprovedPercentage !==
              null
                ? `${sessionA.stableOrImprovedPercentage}%`
                : "—",

            sessionADetail:
              "Performance quality",

            sessionB:
              sessionB.stableOrImprovedPercentage !==
              null
                ? `${sessionB.stableOrImprovedPercentage}%`
                : "—",

            sessionBDetail:
              "Performance quality",

            change:
              qualityChange.text,

            changeStyle:
              qualityChange.style,

            distribution:
              athleteDistribution(
                sessionA,
                sessionB,
                "quality",
              ),
          },
        ],
      },

      {
        title:
          "TRAINING RESPONSE",

        subtitle:
          "How demanding athletes experienced the session",

        tone:
          "orange",

        rows: [
          {
            metric:
              "Average RPE",

            sessionA:
              sessionA.averageRpe !==
              null
                ? `${sessionA.averageRpe.toFixed(
                    1,
                  )} /10`
                : "—",

            sessionADetail:
              "Athlete-reported effort",

            sessionB:
              sessionB.averageRpe !==
              null
                ? `${sessionB.averageRpe.toFixed(
                    1,
                  )} /10`
                : "—",

            sessionBDetail:
              "Athlete-reported effort",

            change:
              rpeChange.text,

            changeStyle:
              rpeChange.style,

            distribution:
              null,
          },

          {
            metric:
              "Harder Than Expected",

            sessionA:
              sessionA.harderThanExpectedPercentage !==
              null
                ? `${sessionA.harderThanExpectedPercentage}%`
                : "—",

            sessionADetail:
              "Harder / much harder responses",

            sessionB:
              sessionB.harderThanExpectedPercentage !==
              null
                ? `${sessionB.harderThanExpectedPercentage}%`
                : "—",

            sessionBDetail:
              "Harder / much harder responses",

            change:
              difficultyChange.text,

            changeStyle:
              difficultyChange.style,

            distribution:
              null,
          },
        ],
      },
    ];

  const topA =
    sessionA.contextFactors[0];

  const topB =
    sessionB.contextFactors[0];

  const sharedContext = [
    {
      label:
        "Same training type",

      value:
        sessionA.workoutType,
    },

    {
      label:
        "Athlete overlap",

      value:
        `${overlap} athletes`,
    },

    {
      label:
        "Session A responses",

      value:
        `${sessionA.athletes}`,
    },

    {
      label:
        "Session B responses",

      value:
        `${sessionB.athletes}`,
    },

    {
      label:
        "Time between sessions",

      value:
        `${Math.round(
          Math.abs(
            new Date(
              sessionB.date,
            ).getTime() -
              new Date(
                sessionA.date,
              ).getTime(),
          ) /
            (
              1000 *
              60 *
              60 *
              24
            ),
        )} days`,
    },
  ];

  const outcomeSignals:
    string[] = [];

  if (
    sessionA.goalAchievementPercentage !==
      null &&
    sessionB.goalAchievementPercentage !==
      null
  ) {
    const change =
      sessionB.goalAchievementPercentage -
      sessionA.goalAchievementPercentage;

    if (
      Math.abs(
        change,
      ) >= 5
    ) {
      outcomeSignals.push(
        `goal achievement ${
          change > 0
            ? "increased"
            : "decreased"
        } by ${Math.abs(
          change,
        )} percentage points`,
      );
    }
  }

  if (
    sessionA.averageRpe !==
      null &&
    sessionB.averageRpe !==
      null
  ) {
    const change =
      Math.round(
        (
          sessionB.averageRpe -
          sessionA.averageRpe
        ) *
          10,
      ) /
      10;

    if (
      Math.abs(
        change,
      ) >= 0.5
    ) {
      outcomeSignals.push(
        `average RPE ${
          change > 0
            ? "increased"
            : "decreased"
        } by ${Math.abs(
          change,
        )}`,
      );
    }
  }

  if (
    sessionA.stableOrImprovedPercentage !==
      null &&
    sessionB.stableOrImprovedPercentage !==
      null
  ) {
    const change =
      sessionB.stableOrImprovedPercentage -
      sessionA.stableOrImprovedPercentage;

    if (
      Math.abs(
        change,
      ) >= 10
    ) {
      outcomeSignals.push(
        `${
          change > 0
            ? "more"
            : "fewer"
        } athletes reported stable or improved performance`,
      );
    }
  }

  const interpretation =
    outcomeSignals.length >
    0
      ? `The ${formatDate(
          sessionB.date,
        )} ${sessionB.workoutType} session differed from the ${formatDate(
          sessionA.date,
        )} session: ${outcomeSignals.join(
          "; ",
        )}.`
      : `The two ${sessionA.workoutType} sessions show broadly similar athlete-reported responses across the available measures.`;

  const outcomeSummary =
    sessionA.goalAchievementPercentage !==
      null &&
    sessionB.goalAchievementPercentage !==
      null
      ? `Goal achievement changed from ${sessionA.goalAchievementPercentage}% to ${sessionB.goalAchievementPercentage}%.`
      : "Goal-achievement comparison is limited by missing responses.";

  const demandSummary =
    sessionA.averageRpe !==
      null &&
    sessionB.averageRpe !==
      null
      ? `Average RPE changed from ${sessionA.averageRpe.toFixed(
          1,
        )} to ${sessionB.averageRpe.toFixed(
          1,
        )}.`
      : "RPE comparison is limited by missing responses.";

  const contextSummary =
    topA || topB
      ? `Most reported context: ${
          topA
            ? `${formatDate(
                sessionA.date,
              )}: ${topA.label}`
            : "none in Session A"
        }; ${
          topB
            ? `${formatDate(
                sessionB.date,
              )}: ${topB.label}`
            : "none in Session B"
        }.`
      : "No additional performance factors were reported in either session.";

  return {
    sessionA,
    sessionB,

    athleteOverlap:
      overlap,

    comparisonSections,

    sharedContext,

    interpretation,

    summary: {
      outcome:
        outcomeSummary,

      demand:
        demandSummary,

      context:
        contextSummary,
    },
  };
}
