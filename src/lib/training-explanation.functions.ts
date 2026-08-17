import { buildTrainingExplanationPrompt } from "../prompts/training-explanation.prompt";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi } from "@/lib/ai-gateway.server";

const ExerciseSchema = z.object({
  section: z.string().optional(),
  name: z.string(),
  details: z.string().optional(),
  rest: z.string().optional(),
});

const ExplainTrainingInputSchema = z.object({
  workoutId: z.string().uuid(),
});

export const explainPlannedWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    ExplainTrainingInputSchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Load the coach-prescribed workout.
    const { data: workout, error: workoutError } = await supabase
      .from("planned_workouts")
      .select(`
        id,
        athlete_id,
        workout_date,
        title,
        discipline,
        duration_minutes,
        session_goal,
        coach_note,
        exercises,
        status
      `)
      .eq("id", data.workoutId)
      .eq("athlete_id", userId)
      .single();

    if (workoutError || !workout) {
      throw new Error(
        workoutError?.message ?? "Geplantes Training nicht gefunden.",
      );
    }

    // 2. Normalize the exercises stored as JSON.
    const parsedExercises = z
      .array(ExerciseSchema)
      .safeParse(workout.exercises);

    const exercises = parsedExercises.success
      ? parsedExercises.data
      : [];

    // 3. Load a small amount of recent athlete history.
    // These are secondary context only.
    const [{ data: recentBoards }, { data: recentCheckins }] =
      await Promise.all([
        supabase
          .from("analysis_boards")
          .select(`
            positives,
            negatives,
            improvements,
            created_at,
            workout_id
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),

        supabase
          .from("daily_checkins")
          .select(`
            checkin_date,
            discipline,
            ai_summary
          `)
          .eq("user_id", userId)
          .not("ai_summary", "is", null)
          .order("checkin_date", { ascending: false })
          .limit(3),
      ]);

    const workoutHistory =
      (recentBoards ?? []).map((board) => ({
        date: board.created_at,
        positives: Array.isArray(board.positives)
          ? board.positives
          : [],
        negatives: Array.isArray(board.negatives)
          ? board.negatives
          : [],
        improvements: Array.isArray(board.improvements)
          ? board.improvements
          : [],
      }));

    const checkinHistory =
      (recentCheckins ?? [])
        .filter((checkin) => checkin.ai_summary)
        .map((checkin) => ({
          date: checkin.checkin_date,
          discipline: checkin.discipline,
          summary: checkin.ai_summary,
        }));
    // 4. Build the Athletic IQ training-explanation prompt.
    const prompt = buildTrainingExplanationPrompt({
      workout,
      exercises,
      workoutHistory,
      checkinHistory,
    });

    // 5. Ask Athletic IQ's existing AI gateway.
    const ai = await callAi({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Follow the Athletic IQ training-explanation rules exactly. The coach's prescribed workout is fixed and must never be modified.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = ai?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error(
        "Athletic IQ konnte keine Trainingserklärung erstellen.",
      );
    }

    const explanation = reply.trim();

    return {
      explanation,
      workoutId: workout.id,
    };
  });

