import { shiftDate } from "./dates";
export function assertQueriesSucceeded(results: readonly { error: unknown }[]) {
  if (results.some((result) => result.error))
    throw new Error("Dashboard konnte nicht geladen werden. Bitte erneut versuchen.");
}
export function computeStreakFromCheckins(
  rows: Array<{ checkin_date: string; is_rest_day: boolean | null }>,
  today: string,
) {
  const map = new Map(rows.map((row) => [row.checkin_date, !!row.is_rest_day]));
  let streak = 0,
    missed = 0;
  for (let i = 0; i < 365; i++) {
    const date = shiftDate(today, -i);
    if (map.has(date)) {
      if (!map.get(date)) streak++;
      missed = 0;
    } else if (i > 0 && ++missed > 2) break;
  }
  return streak;
}
