import { z } from "zod";
export const timeZoneSchema = z
  .string()
  .max(80)
  .refine((zone) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone }).format();
      return true;
    } catch {
      return false;
    }
  }, "Invalid timezone");
export const dateSchema = z.iso.date();
export function calendarDate(
  date = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
