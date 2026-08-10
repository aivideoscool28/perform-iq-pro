-- =========================================================
-- ATHLETIC IQ — AI COACH CONVERSATION STORAGE
-- =========================================================

-- 1. One row = one AI Coach conversation
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- 2. One row = one message inside a conversation
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.ai_conversations(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role text not null
    check (role in ('user', 'assistant')),

  content text not null,

  created_at timestamptz not null default now()
);


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;


-- Athletes can only read their own conversations
create policy "Users can view own AI conversations"
on public.ai_conversations
for select
using (auth.uid() = user_id);


-- Athletes can only create their own conversations
create policy "Users can create own AI conversations"
on public.ai_conversations
for insert
with check (auth.uid() = user_id);


-- Athletes can only update their own conversations
create policy "Users can update own AI conversations"
on public.ai_conversations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Athletes can only delete their own conversations
create policy "Users can delete own AI conversations"
on public.ai_conversations
for delete
using (auth.uid() = user_id);


-- Messages
create policy "Users can view own AI messages"
on public.ai_messages
for select
using (auth.uid() = user_id);


create policy "Users can create own AI messages"
on public.ai_messages
for insert
with check (auth.uid() = user_id);


create policy "Users can update own AI messages"
on public.ai_messages
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


create policy "Users can delete own AI messages"
on public.ai_messages
for delete
using (auth.uid() = user_id);


-- Useful indexes
create index if not exists ai_conversations_user_id_idx
on public.ai_conversations(user_id);

create index if not exists ai_messages_conversation_id_idx
on public.ai_messages(conversation_id);

create index if not exists ai_messages_user_id_idx
on public.ai_messages(user_id);