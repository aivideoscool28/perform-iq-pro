alter table public.video_analyses
add column if not exists detected_movement text,
add column if not exists overall_reasoning text,
add column if not exists overall_recommendation text,
add column if not exists findings jsonb,
add column if not exists kpis jsonb,
add column if not exists score_breakdown jsonb;