-- ============================================================
-- AETHER ATHLETE IQ
-- TRAINING TEMPLATE LIBRARY
-- ============================================================

create table if not exists public.coach_training_templates (
  id uuid primary key default gen_random_uuid(),

  -- NULL for official Aether templates.
  -- Coach UUID for coach-created templates.
  coach_id uuid references auth.users(id) on delete cascade,

  template_type text not null default 'coach'
    check (template_type in ('aether', 'coach')),

  name text not null,
  description text,

  category text not null,
  discipline text,

  intensity text,
  duration_minutes integer,

  session_goal text,
  coach_note text,

  exercises jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
coach_training_templates_coach_idx
on public.coach_training_templates(coach_id);

create index if not exists
coach_training_templates_category_idx
on public.coach_training_templates(category);


-- One copy of every official Aether template
create unique index if not exists
coach_training_templates_aether_name_unique
on public.coach_training_templates(name)
where template_type = 'aether';


-- ============================================================
-- UPDATED AT
-- ============================================================

drop trigger if exists
coach_training_templates_set_updated_at
on public.coach_training_templates;

create trigger coach_training_templates_set_updated_at
before update on public.coach_training_templates
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.coach_training_templates
enable row level security;


drop policy if exists
"Coaches can view Aether and own templates"
on public.coach_training_templates;

create policy
"Coaches can view Aether and own templates"
on public.coach_training_templates
for select
to authenticated
using (
  template_type = 'aether'
  or coach_id = auth.uid()
);


drop policy if exists
"Coaches can create own templates"
on public.coach_training_templates;

create policy
"Coaches can create own templates"
on public.coach_training_templates
for insert
to authenticated
with check (
  coach_id = auth.uid()
  and template_type = 'coach'
);


drop policy if exists
"Coaches can update own templates"
on public.coach_training_templates;

create policy
"Coaches can update own templates"
on public.coach_training_templates
for update
to authenticated
using (
  coach_id = auth.uid()
  and template_type = 'coach'
)
with check (
  coach_id = auth.uid()
  and template_type = 'coach'
);


drop policy if exists
"Coaches can delete own templates"
on public.coach_training_templates;

create policy
"Coaches can delete own templates"
on public.coach_training_templates
for delete
to authenticated
using (
  coach_id = auth.uid()
  and template_type = 'coach'
);


-- ============================================================
-- OFFICIAL AETHER TEMPLATES
-- ============================================================


-- ------------------------------------------------------------
-- 1. ACCELERATION
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Acceleration',
  'High-quality acceleration session focused on projection, first-step rhythm and early acceleration mechanics.',
  'Sprint',
  'Sprint',
  'High',
  75,
  'Develop effective acceleration mechanics and maintain high quality across short accelerations.',
  'Adjust repetition count and recovery according to athlete level and training phase.',
  '[
    {
      "section": "Warm-up",
      "name": "Dynamic Sprint Warm-up",
      "details": "Mobility, activation and progressive running drills.",
      "rest": ""
    },
    {
      "section": "Preparation",
      "name": "Wall Acceleration Drill",
      "details": "3 x 5 controlled switches per side with strong posture.",
      "rest": "45 sec"
    },
    {
      "section": "Main",
      "name": "20m Block Starts",
      "details": "4 repetitions focused on projection and first-step rhythm.",
      "rest": "3 min"
    },
    {
      "section": "Main",
      "name": "30m Accelerations",
      "details": "4 high-quality repetitions from a three-point or block start.",
      "rest": "4 min"
    },
    {
      "section": "Cool-down",
      "name": "Easy Cool-down",
      "details": "Easy movement followed by mobility.",
      "rest": ""
    }
  ]'::jsonb
)
on conflict do nothing;


-- ------------------------------------------------------------
-- 2. MAX VELOCITY
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Max Velocity',
  'Maximum-speed session focused on upright sprint mechanics, rhythm and high-quality exposure.',
  'Sprint',
  'Sprint',
  'High',
  80,
  'Develop maximum-velocity sprinting while maintaining relaxed and technically stable mechanics.',
  'Keep repetitions low enough that sprint quality remains high.',
  '[
    {
      "section": "Warm-up",
      "name": "Sprint Mobility + Activation",
      "details": "Dynamic mobility, activation and progressive buildups.",
      "rest": ""
    },
    {
      "section": "Drills",
      "name": "Upright Sprint Drills",
      "details": "Technical drills emphasizing posture, rhythm and front-side mechanics.",
      "rest": "60 sec"
    },
    {
      "section": "Main",
      "name": "Flying 20m",
      "details": "4 repetitions with a controlled buildup into a 20m maximal-speed zone.",
      "rest": "5 min"
    },
    {
      "section": "Main",
      "name": "Flying 30m",
      "details": "2-3 repetitions with full recovery and relaxed high-speed mechanics.",
      "rest": "6 min"
    },
    {
      "section": "Cool-down",
      "name": "Easy Cool-down",
      "details": "Low-intensity movement and mobility.",
      "rest": ""
    }
  ]'::jsonb
)
on conflict do nothing;


-- ------------------------------------------------------------
-- 3. SPEED ENDURANCE
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Speed Endurance',
  'Sprint session designed to maintain high running quality across longer fast repetitions.',
  'Sprint',
  'Sprint',
  'High',
  90,
  'Improve the ability to maintain sprint quality under increasing fatigue.',
  'Volume and distances should match athlete age, training history and current preparation phase.',
  '[
    {
      "section": "Warm-up",
      "name": "Dynamic Sprint Warm-up",
      "details": "Mobility, drills and progressive accelerations.",
      "rest": ""
    },
    {
      "section": "Preparation",
      "name": "Progressive 60m Runs",
      "details": "3 progressive runs preparing for faster work.",
      "rest": "2 min"
    },
    {
      "section": "Main",
      "name": "120m Fast Runs",
      "details": "3 repetitions at controlled high intensity while maintaining mechanics.",
      "rest": "7 min"
    },
    {
      "section": "Main",
      "name": "80m Quality Sprint",
      "details": "2 repetitions focused on maintaining posture and rhythm.",
      "rest": "6 min"
    },
    {
      "section": "Cool-down",
      "name": "Recovery Jog + Mobility",
      "details": "Easy recovery movement and mobility.",
      "rest": ""
    }
  ]'::jsonb
)
on conflict do nothing;


-- ------------------------------------------------------------
-- 4. HURDLE TECHNIQUE
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Hurdle Technique',
  'Technical hurdle session focused on rhythm, take-off position and efficient clearance.',
  'Hurdles',
  'Hurdles',
  'Moderate',
  80,
  'Develop repeatable hurdle rhythm and technically efficient clearance mechanics.',
  'Adjust hurdle height and spacing according to athlete age and technical level.',
  '[
    {
      "section": "Warm-up",
      "name": "Hurdle Mobility",
      "details": "Dynamic mobility emphasizing hips, ankles and hurdle-specific positions.",
      "rest": ""
    },
    {
      "section": "Drills",
      "name": "Lead-Leg Drill",
      "details": "Controlled repetitions emphasizing active lead-leg action.",
      "rest": "45 sec"
    },
    {
      "section": "Drills",
      "name": "Trail-Leg Drill",
      "details": "Controlled repetitions emphasizing compact trail-leg recovery.",
      "rest": "45 sec"
    },
    {
      "section": "Main",
      "name": "3-Hurdle Rhythm Runs",
      "details": "4-6 repetitions with technical focus and consistent rhythm.",
      "rest": "3 min"
    },
    {
      "section": "Main",
      "name": "5-Hurdle Runs",
      "details": "3 quality repetitions integrating rhythm and speed.",
      "rest": "5 min"
    }
  ]'::jsonb
)
on conflict do nothing;


-- ------------------------------------------------------------
-- 5. STRENGTH + PLYOMETRICS
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Sprint Strength + Plyometrics',
  'General sprint-strength session combining strength work with controlled plyometric exercises.',
  'Strength',
  'Sprint / Hurdles',
  'Moderate',
  75,
  'Develop general force-production qualities relevant to sprinting and hurdling.',
  'Exercise selection and load must be appropriate for athlete age, experience and supervision.',
  '[
    {
      "section": "Warm-up",
      "name": "Strength Preparation",
      "details": "Mobility, activation and low-level movement preparation.",
      "rest": ""
    },
    {
      "section": "Plyometrics",
      "name": "Pogo Jumps",
      "details": "3 x 10 controlled contacts emphasizing stiffness and rhythm.",
      "rest": "60 sec"
    },
    {
      "section": "Plyometrics",
      "name": "Standing Bounds",
      "details": "3 x 5 controlled bounds with quality landings.",
      "rest": "90 sec"
    },
    {
      "section": "Strength",
      "name": "Lower-Body Strength",
      "details": "3 sets of an appropriate squat or squat-pattern exercise.",
      "rest": "2-3 min"
    },
    {
      "section": "Strength",
      "name": "Posterior Chain Exercise",
      "details": "3 controlled sets of an appropriate posterior-chain exercise.",
      "rest": "2 min"
    }
  ]'::jsonb
)
on conflict do nothing;


-- ------------------------------------------------------------
-- 6. RECOVERY + MOBILITY
-- ------------------------------------------------------------

insert into public.coach_training_templates (
  coach_id,
  template_type,
  name,
  description,
  category,
  discipline,
  intensity,
  duration_minutes,
  session_goal,
  coach_note,
  exercises
)
values (
  null,
  'aether',
  'Recovery + Mobility',
  'Low-intensity recovery session combining easy movement, mobility and controlled activation.',
  'Mobility',
  'Sprint / Hurdles',
  'Low',
  45,
  'Support recovery while maintaining comfortable movement quality.',
  'Keep the session low intensity and adapt it to how the athletes are responding that day.',
  '[
    {
      "section": "Recovery",
      "name": "Easy Movement",
      "details": "8-12 minutes of easy jogging, cycling or similar low-intensity movement.",
      "rest": ""
    },
    {
      "section": "Mobility",
      "name": "Hip Mobility",
      "details": "Controlled dynamic hip mobility sequence.",
      "rest": ""
    },
    {
      "section": "Mobility",
      "name": "Ankle Mobility",
      "details": "Controlled ankle mobility exercises.",
      "rest": ""
    },
    {
      "section": "Activation",
      "name": "Light Glute Activation",
      "details": "Low-load activation exercises performed comfortably.",
      "rest": "30 sec"
    },
    {
      "section": "Finish",
      "name": "Breathing + Reset",
      "details": "Easy breathing and relaxed movement to finish.",
      "rest": ""
    }
  ]'::jsonb
)
on conflict do nothing;
