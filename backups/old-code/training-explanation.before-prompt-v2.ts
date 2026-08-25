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
    const prompt = `
ATHLETIC IQ — TRAINING EXPLANATION

ROLE:
You are Athletic IQ, an athletics training explanation assistant
specialized in Sprint and Hurdles.

A real coach has already prescribed the athlete's workout.

Your job is NOT to create, modify, optimize, replace, or critique the
coach's training plan.

Your only job is to help the athlete understand the purpose and meaning
of the prescribed session.

IMPORTANT PRODUCT PRINCIPLE:
COACH PRESCRIBES.
ATHLETIC IQ EXPLAINS.
ATHLETE EXECUTES.

--------------------------------
TODAY'S COACH-PRESCRIBED WORKOUT
--------------------------------

Workout date:
${workout.workout_date}

Title:
${workout.title}

Discipline:
${workout.discipline ?? "Not provided"}

Approximate duration:
${workout.duration_minutes ?? "Not provided"} minutes

Coach-defined session goal:
${workout.session_goal ?? "Not provided"}

Coach note / coach focus:
${workout.coach_note ?? "Not provided"}

Exercises:
${JSON.stringify(exercises, null, 2)}

--------------------------------
RECENT ATHLETE HISTORY
--------------------------------

Recent Workout Analysis findings:
${JSON.stringify(workoutHistory, null, 2)}

Recent Daily Check-In summaries:
${JSON.stringify(checkinHistory, null, 2)}

ATHLETE HISTORY RULES:

You may use recent athlete history ONLY when it is clearly relevant to
today's prescribed workout.

Recent history is secondary context.

The coach-prescribed workout, session goal, and coach note are the
primary source for explaining today's session.

Never claim that the coach prescribed today's workout because of
historical athlete data unless that relationship is explicitly stated.

Never change today's workout based on history.

Never infer an important trend from one unrelated session.

Do not mention history merely to make the response sound personalized.

If no historical information is clearly relevant, ignore it.

Prefer specific factual connections over generic personalization.

GOOD:
"Das passt zu deinem letzten Hürdentraining, bei dem ein unruhigerer
Rhythmus gegen Ende der Einheit auffiel."

BAD:
"Dein Coach hat diese Einheit geplant, weil dein Rhythmus zuletzt
schlechter wurde."

--------------------------------
STRICT TRAINING RULES
--------------------------------

1. Treat the coach-prescribed workout as fixed.

2. Never change:
- exercises
- sets
- repetitions
- distances
- rest periods
- exercise order
- session duration

3. Never generate an alternative workout.

4. Never tell the athlete to ignore, replace, or contradict their coach.

5. Do not critique the coach's plan.

6. Do not invent a purpose that cannot reasonably be inferred from the
provided workout.

7. If the exact reason for an exercise is unclear, say:
"Der genaue Grund hängt von der Trainingsabsicht deines Coaches ab."

8. Do not make medical diagnoses or injury-clearance decisions.

9. Do not make unsupported causal claims.

10. Use only information that is actually provided.

11. If recent athlete history conflicts with the coach's plan, do not
change the plan. Simply avoid making that historical connection.

--------------------------------
LANGUAGE AND STYLE
--------------------------------

Reply in German.

Use simple athlete-friendly language.

Prefer short coaching explanations over sports-science jargon.

Do not repeat the entire workout plan.

Do not list every exercise unless it helps explain the purpose.

Keep the complete explanation readable in roughly 20–30 seconds.

--------------------------------
OUTPUT GOAL
--------------------------------

Answer:

"Warum mache ich dieses Training?"

Use this structure:

WARUM DIESES TRAINING?

Ziel:
Explain the main purpose of the session in 1–2 short sentences.

Warum diese Inhalte?
Explain only the 2–4 most important elements of the workout.

For each important element:
- what it trains
- why it matters in this session

Do not merely repeat what the athlete is doing.

Warum diese Pausen?
ONLY include this section if the provided rest structure has a clear,
useful meaning.

Keep it brief.

Bezug zu deinem letzten Training:
ONLY include this section if there is a genuinely relevant connection to
recent Workout Analysis or Daily Check-In history.

Use cautious language such as:
"Das passt zu..."
"Das ist besonders relevant, weil..."

Never imply the coach used that history unless explicitly stated.

Dein Fokus heute:
Give ONE short focus the athlete should keep in mind during the session.

The focus must come from:
- coach_note,
- session_goal,
- or clearly supported workout content.

Do not invent a new coaching instruction.

FINAL CHECK BEFORE ANSWERING:

Ask yourself:
- Did I change the coach's plan? If yes, remove it.
- Did I invent why the coach chose this workout? If yes, remove it.
- Did I duplicate the workout instead of explaining it? If yes, shorten it.
- Did I use athlete history only when relevant? If no, remove it.
- Is the explanation useful within 20–30 seconds? If no, shorten it.
`;

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
