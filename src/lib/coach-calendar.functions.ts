import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCoachManagerAuth } from "@/integrations/supabase/coach-manager-auth-middleware";

const CalendarEventTypeSchema = z.enum([
  "competition",
  "training_camp",
  "testing",
  "meeting",
  "reminder",
  "other",
]);

const CalendarEventInputSchema = z.object({
  title: z.string().min(1).max(160),

  eventDate: z.string().min(10).max(10),

  eventType: CalendarEventTypeSchema,

  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),

  location: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CoachCalendarEventType =
  z.infer<typeof CalendarEventTypeSchema>;

export type CoachCalendarEventInput =
  z.infer<typeof CalendarEventInputSchema>;

export type CoachCalendarEvent = {
  id: string;
  coach_id: string;

  title: string;
  event_date: string;
  event_type: CoachCalendarEventType;

  start_time: string | null;
  end_time: string | null;

  location: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
};

/**
 * Load coach calendar events between two dates.
 */
export const fetchCoachCalendarEvents = createServerFn({
  method: "GET",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        startDate: z.string(),
        endDate: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: events, error } = await supabase
      .from("coach_calendar_events")
      .select("*")
      .eq("coach_id", userId)
      .gte("event_date", data.startDate)
      .lte("event_date", data.endDate)
      .order("event_date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    return (events ?? []) as CoachCalendarEvent[];
  });

/**
 * Create an important calendar date.
 */
export const createCoachCalendarEvent = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    CalendarEventInputSchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: event, error } = await supabase
      .from("coach_calendar_events")
      .insert({
        coach_id: userId,

        title: data.title,
        event_date: data.eventDate,
        event_type: data.eventType,

        start_time: data.startTime ?? null,
        end_time: data.endTime ?? null,

        location: data.location ?? null,
        notes: data.notes ?? null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return event as CoachCalendarEvent;
  });

/**
 * Update one coach-owned calendar event.
 */
export const updateCoachCalendarEvent = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        eventId: z.string().uuid(),
        event: CalendarEventInputSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const input = data.event;

    const { data: event, error } = await supabase
      .from("coach_calendar_events")
      .update({
        title: input.title,
        event_date: input.eventDate,
        event_type: input.eventType,

        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,

        location: input.location ?? null,
        notes: input.notes ?? null,

        updated_at: new Date().toISOString(),
      })
      .eq("id", data.eventId)
      .eq("coach_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return event as CoachCalendarEvent;
  });

/**
 * Delete one coach-owned calendar event.
 */
export const deleteCoachCalendarEvent = createServerFn({
  method: "POST",
})
  .middleware([requireCoachManagerAuth])
  .inputValidator((input) =>
    z
      .object({
        eventId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("coach_calendar_events")
      .delete()
      .eq("id", data.eventId)
      .eq("coach_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      eventId: data.eventId,
    };
  });
