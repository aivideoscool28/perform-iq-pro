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
        goal_text
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
        duration_min,
        rpe,
        has_pain,
        pain_note,
        satisfaction,
        sleep_hours,
        sleep_quality,
        overall_feeling,
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

    profile: profile ?? null,

    recentWorkouts: workouts ?? [],

    recentCheckins: checkins ?? [],

    recentWorkoutAnalyses: analyses ?? [],
  };
}