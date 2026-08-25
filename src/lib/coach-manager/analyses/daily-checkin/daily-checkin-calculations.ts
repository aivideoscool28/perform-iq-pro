import type {
  DailyCheckinForAnalysis,
  DistributionResult,
  PercentageResult,
} from "./daily-checkin-data";

/**
 * DAILY CHECK-IN CALCULATIONS
 *
 * Transparent calculations from athlete-reported Check-In data.
 *
 * Architecture:
 * Code calculates factual numbers.
 * AI interprets those numbers later.
 */

export const EXPECTED_DIFFICULTY_ANSWERS = [
  "Leichter als erwartet",
  "Wie erwartet",
  "Schwerer als erwartet",
  "Deutlich schwerer als erwartet",
] as const;

export const PERFORMANCE_QUALITY_ANSWERS = [
  "Besser geworden",
  "Stabil geblieben",
  "Etwas abgefallen",
  "Stark abgefallen",
] as const;

export const GOAL_ANSWERS = [
  "Ja",
  "Teilweise",
  "Nein",
] as const;

export const PAIN_SEVERITY_ANSWERS = [
  "Leicht",
  "Mittel",
  "Stark",
] as const;

export const MENTAL_STATE_ANSWERS = [
  "Fokussiert & selbstbewusst",
  "Normal",
  "Abgelenkt",
  "Gestresst / unter Druck",
  "Wenig Motivation",
  "Sonstiges",
] as const;

export const PERFORMANCE_FACTOR_ANSWERS = [
  "Nichts Besonderes",
  "Schlechter Schlaf",
  "Stress / Druck",
  "Wetter",
  "Schule / Arbeit",
  "Wettkampfnervosität",
  "Trainingsbedingungen",
  "Sonstiges",
] as const;

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function round(value: number, decimals = 1) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function calculatePercentage(
  count: number,
  total: number,
): number | null {
  if (total === 0) return null;
  return round((count / total) * 100);
}

function percentageResult(
  count: number,
  total: number,
): PercentageResult {
  return {
    count,
    total,
    percentage: calculatePercentage(count, total),
  };
}

function getTrainingSessions(
  checkins: DailyCheckinForAnalysis[],
) {
  return checkins.filter(
    (checkin) => checkin.is_rest_day !== true,
  );
}

/* -------------------------------------------------------
   QUESTION 2 — AVERAGE RPE
------------------------------------------------------- */

export function calculateAverageRpe(
  checkins: DailyCheckinForAnalysis[],
): number | null {
  const values = getTrainingSessions(checkins)
    .map((checkin) => checkin.rpe)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        value >= 1 &&
        value <= 10,
    );

  if (values.length === 0) return null;

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return round(total / values.length);
}

/* -------------------------------------------------------
   QUESTION 5 — GOAL ACHIEVED
------------------------------------------------------- */

export function calculateGoalAchievedRate(
  checkins: DailyCheckinForAnalysis[],
): PercentageResult {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      GOAL_ANSWERS.includes(
        checkin.session_goal_achieved as
          (typeof GOAL_ANSWERS)[number],
      ),
  );

  const achieved = valid.filter(
    (checkin) =>
      checkin.session_goal_achieved === "Ja",
  );

  return percentageResult(
    achieved.length,
    valid.length,
  );
}

/* -------------------------------------------------------
   QUESTION 4 — STABLE OR IMPROVED
------------------------------------------------------- */

export function calculateStableOrImprovedRate(
  checkins: DailyCheckinForAnalysis[],
): PercentageResult {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      PERFORMANCE_QUALITY_ANSWERS.includes(
        checkin.performance_quality as
          (typeof PERFORMANCE_QUALITY_ANSWERS)[number],
      ),
  );

  const stableOrImproved = valid.filter(
    (checkin) =>
      checkin.performance_quality === "Besser geworden" ||
      checkin.performance_quality === "Stabil geblieben",
  );

  return percentageResult(
    stableOrImproved.length,
    valid.length,
  );
}

/* -------------------------------------------------------
   QUESTION 3 — EXPECTED DIFFICULTY
------------------------------------------------------- */

export function calculateExpectedDifficultyDistribution(
  checkins: DailyCheckinForAnalysis[],
): DistributionResult[] {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      EXPECTED_DIFFICULTY_ANSWERS.includes(
        checkin.expected_difficulty as
          (typeof EXPECTED_DIFFICULTY_ANSWERS)[number],
      ),
  );

  return EXPECTED_DIFFICULTY_ANSWERS.map((label) => {
    const count = valid.filter(
      (checkin) =>
        checkin.expected_difficulty === label,
    ).length;

    return {
      label,
      ...percentageResult(count, valid.length),
    };
  });
}

export function calculateUnexpectedDifficultyRate(
  checkins: DailyCheckinForAnalysis[],
): PercentageResult {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      EXPECTED_DIFFICULTY_ANSWERS.includes(
        checkin.expected_difficulty as
          (typeof EXPECTED_DIFFICULTY_ANSWERS)[number],
      ),
  );

  const unexpected = valid.filter(
    (checkin) =>
      checkin.expected_difficulty === "Schwerer als erwartet" ||
      checkin.expected_difficulty === "Deutlich schwerer als erwartet",
  );

  return percentageResult(
    unexpected.length,
    valid.length,
  );
}

/* -------------------------------------------------------
   QUESTION 6 — PHYSICAL FEELING
------------------------------------------------------- */

export function calculateAveragePhysicalFeeling(
  checkins: DailyCheckinForAnalysis[],
): number | null {
  const values = getTrainingSessions(checkins)
    .map((checkin) => checkin.physical_feeling)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        value >= 1 &&
        value <= 5,
    );

  if (values.length === 0) return null;

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return round(total / values.length);
}

/* -------------------------------------------------------
   QUESTION 8 — PAIN
------------------------------------------------------- */

export function calculatePainRate(
  checkins: DailyCheckinForAnalysis[],
): PercentageResult {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      typeof checkin.has_pain === "boolean",
  );

  const painSessions = valid.filter(
    (checkin) => checkin.has_pain === true,
  );

  return percentageResult(
    painSessions.length,
    valid.length,
  );
}

export function calculatePainSeverityDistribution(
  checkins: DailyCheckinForAnalysis[],
): DistributionResult[] {
  const validPainSessions =
    getTrainingSessions(checkins).filter(
      (checkin) =>
        checkin.has_pain === true &&
        PAIN_SEVERITY_ANSWERS.includes(
          checkin.pain_severity as
            (typeof PAIN_SEVERITY_ANSWERS)[number],
        ),
    );

  return PAIN_SEVERITY_ANSWERS.map((label) => {
    const count = validPainSessions.filter(
      (checkin) =>
        checkin.pain_severity === label,
    ).length;

    return {
      label,
      ...percentageResult(
        count,
        validPainSessions.length,
      ),
    };
  });
}

/* -------------------------------------------------------
   QUESTION 7 — MENTAL STATE
------------------------------------------------------- */

export function calculateMentalStateDistribution(
  checkins: DailyCheckinForAnalysis[],
): DistributionResult[] {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      MENTAL_STATE_ANSWERS.includes(
        checkin.mental_state as
          (typeof MENTAL_STATE_ANSWERS)[number],
      ),
  );

  return MENTAL_STATE_ANSWERS.map((label) => {
    const count = valid.filter(
      (checkin) =>
        checkin.mental_state === label,
    ).length;

    return {
      label,
      ...percentageResult(count, valid.length),
    };
  });
}

/* -------------------------------------------------------
   QUESTION 9 — PERFORMANCE FACTORS
------------------------------------------------------- */

/**
 * Q9 allows multiple answers.
 *
 * factor percentage =
 * sessions containing factor
 * /
 * sessions answering Q9
 * x 100
 *
 * Because Q9 is multi-select, percentages can total > 100%.
 */
export function calculatePerformanceFactorDistribution(
  checkins: DailyCheckinForAnalysis[],
): DistributionResult[] {
  const valid = getTrainingSessions(checkins).filter(
    (checkin) =>
      Array.isArray(checkin.performance_factors) &&
      checkin.performance_factors.length > 0,
  );

  return PERFORMANCE_FACTOR_ANSWERS.map((label) => {
    const count = valid.filter(
      (checkin) =>
        checkin.performance_factors?.includes(label),
    ).length;

    return {
      label,
      ...percentageResult(count, valid.length),
    };
  });
}
