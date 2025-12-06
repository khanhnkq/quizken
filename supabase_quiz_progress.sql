-- Create the table for storing quiz progress
create table if not exists public.quiz_progress (
  user_id uuid references auth.users not null,
  quiz_id uuid references public.quizzes not null,
  quiz_title text, -- Store title for resume UI

  -- Progress Data
  current_question int default 0,
  user_answers jsonb default '[]'::jsonb, -- Array of selected indices
  total_questions int not null,
  start_time bigint, -- Timestamp for expiration logic

  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (user_id, quiz_id)
);

-- Enable RLS
alter table public.quiz_progress enable row level security;

-- Policies
create policy "Users can view their own progress"
  on public.quiz_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert/update their own progress"
  on public.quiz_progress for all
  using (auth.uid() = user_id);
