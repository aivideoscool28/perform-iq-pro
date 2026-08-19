/*
===============================================================================
                    ATHLETIC IQ — ATHLETE CONTEXT SYSTEM
===============================================================================

WHY THIS FILE EXISTS

Gemini should not behave like a generic chatbot that knows nothing about the
athlete.

Athletic IQ already stores useful athlete information in Supabase, for example:

- Profile and disciplines
- Goals and experience
- Recent workouts
- Daily Check-Ins
- Previous Workout Analyses

Before an Athletic IQ AI feature asks Gemini for an answer, this file can load
the RELEVANT information about the currently logged-in athlete.

The basic architecture is:

Supabase
   ↓
athlete-context.server.ts
   ↓
Relevant athlete information
   ↓
Athletic IQ AI feature
   ↓
AI Gateway
   ↓
Gemini

IMPORTANT:
Supabase is Athletic IQ's permanent memory.
Gemini is NOT the permanent memory.

This file is the layer that retrieves useful information from that memory.

We also do NOT want to simply send everything stored about an athlete to Gemini.
Later, the "purpose" will help Athletic IQ choose different context depending
on whether Gemini is being used for AI Coach, Workout Analysis, Video Analysis,
etc.

For now, this is the first foundation of that system.
===============================================================================
*/


// Tells the context system WHY athlete information is being requested.
//
// Later this allows Athletic IQ to select different information for different
// AI tasks.
//
// Example:
// AI Coach may need recent workouts + check-ins + conversation history.
// Workout Analysis may mainly need today's workout + check-in.
// Video Analysis may need discipline + goals + relevant technique history.
export type AthleteContextPurpose =
  | "ai-coach"
  | "workout-analysis"
  | "video-analysis";


// Temporary flexible Supabase client type.
//
// This lets the function receive the authenticated Supabase client that already
// exists inside Athletic IQ's server functions.
//
// Later we can replace "any" with a proper generated Supabase TypeScript type.
type SupabaseClientLike = any;


/*
loadAthleteContext()

This is the main function of the Athlete Context System.

It receives:

1. supabase
   → Used to read Athletic IQ's permanent data.

2. userId
   → Identifies the currently authenticated athlete.
   → This is important so we retrieve the CORRECT athlete's information.

3. purpose
   → Describes what the athlete context will eventually be used for.

The function then loads several useful categories of athlete information
at the same time and returns them in one structured object.
*/
function buildPurposeProfile(
  profile: any,
  purpose: AthleteContextPurpose,
) {
  if (!profile) return null;

  const coreProfile = {
    id: profile.id,
    age: profile.age,
    disciplines: profile.disciplines,
    experience: profile.experience,
    goal_text: profile.goal_text,
    current_focus: profile.current_focus,
  };

  switch (purpose) {
    case "ai-coach":
      return {
        ...coreProfile,
        training_days_per_week: profile.training_days_per_week,
        training_setup: profile.training_setup,
        injuries: profile.injuries,
      };

    case "workout-analysis":
      return {
        ...coreProfile,
        injuries: profile.injuries,
      };

    case "video-analysis":
      return {
        id: profile.id,
        age: profile.age,
        disciplines: profile.disciplines,
        experience: profile.experience,
        current_focus: profile.current_focus,
      };
  }
}

export async function loadAthleteContext({
  supabase,
  userId,
  purpose,
}: {
  supabase: SupabaseClientLike;
  userId: string;
  purpose: AthleteContextPurpose;
}) {

  /*
  Promise.all runs these database requests together instead of waiting for:

  profile → then workouts → then check-ins → then analyses.

  This is faster because Supabase can retrieve them in parallel.
  */
  const [
    { data: profile, error: profileError },
    { data: workouts, error: workoutsError },
    { data: checkins, error: checkinsError },
    { data: analyses, error: analysesError },
  ] = await Promise.all([

    /*
    ---------------------------------------------------------------------------
    ATHLETE PROFILE
    ---------------------------------------------------------------------------

    Loads relatively stable information describing the athlete.

    This helps Gemini understand WHO it is helping.

    Example:
    Discipline: Sprint
    Goal: Improve acceleration
    Experience: Intermediate
    Training setup: Club
    */
    supabase
      .from("profiles")
      .select(
        `
        id,
        age,
        disciplines,
        goals,
        experience,
        training_days_per_week,
        training_setup,
        injuries,
        goal_text,
        goal_motivation,
        current_focus,
        favourite_athlete
        `,
      )
      .eq("id", userId)
      .maybeSingle(),


    /*
    ---------------------------------------------------------------------------
    RECENT WORKOUTS
    ---------------------------------------------------------------------------

    Loads the athlete's five most recent workouts.

    We deliberately do NOT load the athlete's entire workout history.

    Recent training is usually more relevant for current AI decisions and
    limiting the amount of data helps with speed, token usage and relevance.
    */
    supabase
      .from("workouts")
      .select(
        `
        id,
        workout_date,
        workout_type,
        raw_input,
        exercises,
        duration_minutes,
        intensity,
        summary,
        created_at
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),


    /*
    ---------------------------------------------------------------------------
    RECENT DAILY CHECK-INS
    ---------------------------------------------------------------------------

    Loads the five most recent check-ins.

    These can help Athletic IQ understand how recent training felt to the
    athlete, including things such as:

    - RPE / difficulty
    - Pain
    - Satisfaction
    - Sleep
    - Overall feeling

    This is useful because two athletes can complete the same workout but
    experience it very differently.
    */
    supabase
      .from("daily_checkins")
      .select(
        `
        checkin_date,
        discipline,
        is_rest_day,
        workout_type,
        session_details,
        performance_results,
        duration_min,
        rpe,
        expected_difficulty,
        performance_quality,
        session_goal_achieved,
        session_goal_note,
        physical_feeling,
        mental_state,
        has_pain,
        pain_note,
        pain_area,
        pain_severity,
        performance_factors,
        extra_note,
        context_summary,
        ai_summary
        `,
      )
      .eq("user_id", userId)
      .order("checkin_date", { ascending: false })
      .limit(5),


    /*
    ---------------------------------------------------------------------------
    RECENT WORKOUT ANALYSES
    ---------------------------------------------------------------------------

    Loads findings from the athlete's five most recent Workout Analyses.

    This allows future AI features to potentially understand recurring:

    - Strengths
    - Weaknesses
    - Areas for improvement

    instead of treating every workout as if Athletic IQ has never seen the
    athlete before.
    */
    supabase
      .from("analysis_boards")
      .select(
        `
        id,
        workout_id,
        positives,
        negatives,
        improvements,
        created_at
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);


  /*
  ---------------------------------------------------------------------------
  ERROR CHECKING
  ---------------------------------------------------------------------------

  If one part of the context fails to load, we log exactly which part failed.

  This will make debugging easier later.

  For example:
  The profile might load correctly while Daily Check-Ins fail because of a
  database/query problem.
  */

  if (profileError) {
    console.error("Athlete context profile error:", profileError);
  }

  if (workoutsError) {
    console.error("Athlete context workouts error:", workoutsError);
  }

  if (checkinsError) {
    console.error("Athlete context check-ins error:", checkinsError);
  }

  if (analysesError) {
    console.error("Athlete context analyses error:", analysesError);
  }


  /*
  ---------------------------------------------------------------------------
  FINAL ATHLETE CONTEXT
  ---------------------------------------------------------------------------

  Everything is returned in one predictable structure.

  An AI feature will eventually be able to request athlete context and receive:

  {
    purpose,
    profile,
    recentWorkouts,
    recentCheckins,
    recentWorkoutAnalyses
  }

  Example:

  AI Coach asks for context
        ↓
  loadAthleteContext(...)
        ↓
  Supabase retrieves the athlete's information
        ↓
  Context returned
        ↓
  Relevant context can be added to the Athletic IQ prompt
        ↓
  Gemini receives personalized information

  NOTE:
  We are NOT sending anything to Gemini inside this file.

  This file's responsibility is only to RETRIEVE and ORGANIZE athlete data.
  The AI Gateway remains responsible for communicating with Gemini.
  */

  return {
    purpose,

    profile: buildPurposeProfile(profile, purpose),

    recentWorkouts: workouts ?? [],

    recentCheckins: checkins ?? [],

    recentWorkoutAnalyses: analyses ?? [],
  };
}
/*
===============================================================================
                    SMART WORKOUT MATCHING
===============================================================================

Purpose:
Find the most relevant previous workout for historical comparison.

Important:
- New workouts should preferably have workout_type stored directly.
- Older workouts may have workout_type = null.
- For older workouts, Athletic IQ falls back to athletics-specific keywords.
- If no comparable workout exists, return null.
- The AI can still answer; it just must not invent a comparison.
===============================================================================
*/

type WorkoutContextRecord = {
  id: string;
  workout_date: string;
  workout_type?: string | null;
  raw_input?: string | null;
  summary?: string | null;
  exercises?: unknown;
  duration_minutes?: number | null;
  intensity?: string | null;
  created_at?: string | null;
};


/*
Athletics-specific vocabulary.

Instead of writing many separate if-statements, each workout category has
a list of words or phrases that may indicate that workout type.

If athletes/coaches later use new terminology, we can simply add another
keyword to the appropriate list.
*/
const WORKOUT_TYPE_KEYWORDS: Record<string, string[]> = {
  block_start: [
    "block start",
    "blockstart",
    "startblock",
    "startblöcke",
    "starting blocks",
    "reaktion",
    "reaction",
  ],

  acceleration: [
    "acceleration",
    "beschleunigung",
    "beschleunigungslauf",
    "beschleunigungsläufe",
    "drive phase",
  ],

  max_velocity: [
    "max velocity",
    "top speed",
    "maximalgeschwindigkeit",
    "flying 20",
    "fly 20",
    "fliegend",
  ],

  speed_endurance: [
    "speed endurance",
    "schnelligkeitsausdauer",
    "tempo endurance",
  ],

  hurdle_technique: [
    "hurdle technique",
    "hürdentechnik",
    "lead leg",
    "trail leg",
    "schwungbein",
    "nachziehbein",
  ],

  hurdle_rhythm: [
    "hurdle rhythm",
    "hürdenrhythmus",
    "3 step",
    "3-step",
    "dreier rhythmus",
    "zwischenhürden",
  ],

  strength: [
    "strength",
    "kraft",
    "krafttraining",
    "squat",
    "kniebeuge",
    "deadlift",
    "kreuzheben",
    "gym",
  ],

  recovery: [
    "recovery",
    "regeneration",
    "mobility",
    "regenerationstraining",
  ],
};


/*
Try to determine the workout type.

Priority:
1. Use the explicit workout_type stored in Supabase.
2. If it is missing, inspect summary + raw_input + exercises.
3. Count keyword matches.
4. Return the category with the highest score.
*/
function inferWorkoutType(
  workout: WorkoutContextRecord,
): string | null {

  // Best and most reliable case.
  if (workout.workout_type) {
    return workout.workout_type.toLowerCase();
  }

  // Fallback for older workout records.
  const text = `
    ${workout.summary ?? ""}
    ${workout.raw_input ?? ""}
    ${JSON.stringify(workout.exercises ?? [])}
  `.toLowerCase();

  let bestType: string | null = null;
  let bestScore = 0;

  for (const [workoutType, keywords] of Object.entries(
    WORKOUT_TYPE_KEYWORDS,
  )) {
    let score = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestType = workoutType;
    }
  }

  return bestType;
}


/*
Find the most relevant previous workout.

Rules:
1. Do not compare a workout with itself.
2. Only use workouts that happened before the current workout.
3. Prefer the same workout type.
4. Among matching workouts, use the most recent one.
5. If none match, return null.
*/
export function getRelevantPreviousWorkout(
  currentWorkout: WorkoutContextRecord,
  workouts: WorkoutContextRecord[],
): WorkoutContextRecord | null {

  const currentType = inferWorkoutType(currentWorkout);

  // If we cannot identify the current workout type,
  // we cannot make a reliable historical comparison.
  if (!currentType) {
    return null;
  }

  const previousMatches = workouts
    .filter(
      (workout) =>
        workout.id !== currentWorkout.id,
    )
    .filter(
      (workout) =>
        workout.workout_date < currentWorkout.workout_date,
    )
    .filter(
      (workout) =>
        inferWorkoutType(workout) === currentType,
    )
    .sort(
      (a, b) =>
        new Date(b.workout_date).getTime() -
        new Date(a.workout_date).getTime(),
    );

  return previousMatches[0] ?? null;
}

/*
===============================================================================
                    WORKOUT ANALYSIS MATCHING
===============================================================================

A workout and its Workout Analysis are connected through:

workouts.id
        ↓
analysis_boards.workout_id

These helpers allow the Context System to retrieve:

CURRENT WORKOUT
→ current analysis

PREVIOUS SIMILAR WORKOUT
→ previous analysis

This prepares Athletic IQ for evidence-based historical comparison.
===============================================================================
*/

type WorkoutAnalysisContextRecord = {
  id: string;
  workout_id: string;
  positives?: string[] | null;
  negatives?: string[] | null;
  improvements?: string[] | null;
  created_at?: string | null;
};


/*
Find the Workout Analysis that belongs to a specific workout.

If no analysis exists, return null.
*/
export function getWorkoutAnalysisForWorkout(
  workoutId: string,
  analyses: WorkoutAnalysisContextRecord[],
): WorkoutAnalysisContextRecord | null {
  return (
    analyses.find(
      (analysis) =>
        analysis.workout_id === workoutId,
    ) ?? null
  );
}


/*
Build the first structured workout-comparison context.

This does NOT ask Gemini to compare anything yet.

It only prepares the correct evidence:

- current workout
- current analysis
- previous similar workout
- previous analysis
*/
export function buildWorkoutComparisonContext(
  currentWorkout: WorkoutContextRecord,
  workouts: WorkoutContextRecord[],
  analyses: WorkoutAnalysisContextRecord[],
) {
  const previousWorkout =
    getRelevantPreviousWorkout(
      currentWorkout,
      workouts,
    );

  const currentAnalysis =
    getWorkoutAnalysisForWorkout(
      currentWorkout.id,
      analyses,
    );

  const previousAnalysis =
    previousWorkout
      ? getWorkoutAnalysisForWorkout(
          previousWorkout.id,
          analyses,
        )
      : null;

  return {
    currentWorkout,
    currentAnalysis,
    previousWorkout,
    previousAnalysis,
  };
}




