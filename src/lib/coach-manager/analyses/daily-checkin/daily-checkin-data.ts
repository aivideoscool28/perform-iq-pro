/**
 * DAILY CHECK-IN ANALYSIS DATA
 *
 * Purpose:
 * Defines the data used by Coach Manager Daily Check-In calculations.
 *
 * This file contains NO analysis and NO AI.
 */

export type DailyCheckinForAnalysis = {
  id?: string;
  user_id?: string;
  checkin_date: string;

  is_rest_day?: boolean | null;

  discipline?: string | null;
  workout_type?: string | null;

  // Question 2
  rpe?: number | null;

  // Question 3
  expected_difficulty?: string | null;

  // Question 4
  performance_quality?: string | null;

  // Question 5
  session_goal_achieved?: string | null;

  // Question 6
  physical_feeling?: number | null;

  // Question 7
  mental_state?: string | null;

  // Question 8
  has_pain?: boolean | null;
  pain_area?: string | null;
  pain_severity?: string | null;

  // Question 9
  performance_factors?: string[] | null;
};

export type PercentageResult = {
  count: number;
  total: number;
  percentage: number | null;
};

export type DistributionResult = PercentageResult & {
  label: string;
};

export type ComparisonCell = {
  goal: string;
  performance: string;
  count: number;
  percentage: number | null;
};

export type GoalPerformanceComparison = {
  totalSessions: number;
  cells: ComparisonCell[];
};
