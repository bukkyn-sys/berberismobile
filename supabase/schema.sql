-- ============================================================
-- Berberis Capital — Supabase Database Schema
-- Run this in your Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('mentee', 'mentor', 'admin');
create type user_tier as enum ('free', 'standard', 'ultra');
create type career_stage as enum ('university', 'graduate', 'analyst', 'associate_plus');
create type session_type as enum ('group', 'one_to_one');
create type session_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type subscription_status as enum ('active', 'past_due', 'cancelled', 'trialing');
create type question_category as enum ('accounting', 'dcf', 'lbo', 'comps', 'market', 'behavioural');
create type question_difficulty as enum ('uni_spring', 'graduate', 'analyst', 'associate_plus');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'mentee',
  tier user_tier not null default 'free',
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles (one per user)
create table public.profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  career_stage career_stage,
  current_firm text,
  job_title text,
  target_role text,
  target_division text,
  university text,
  year_of_study int,
  goals text,
  bio text,
  avatar_url text,
  is_founding_member boolean not null default false
);

-- Mentors (one per user with mentor role)
create table public.mentors (
  user_id uuid references public.users(id) on delete cascade primary key,
  firm text not null,
  seniority text not null,
  expertise_areas text[] not null default '{}',
  availability text,
  bio text,
  rating_avg numeric(3,2) not null default 0,
  total_hours numeric(8,2) not null default 0,
  session_count int not null default 0,
  is_top_mentor boolean not null default false,
  top_mentor_since timestamptz,
  is_founding_mentor boolean not null default false
);

-- Mentor Sessions
create table public.mentor_sessions (
  id uuid primary key default uuid_generate_v4(),
  mentor_id uuid references public.users(id) on delete cascade not null,
  mentee_ids uuid[] not null,
  session_type session_type not null,
  scheduled_at timestamptz not null,
  duration_mins int not null default 60,
  status session_status not null default 'scheduled',
  cal_event_id text,
  notes text,
  action_items text
);

-- Mentor Ratings
create table public.mentor_ratings (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.mentor_sessions(id) on delete cascade not null,
  mentor_id uuid references public.users(id) on delete cascade not null,
  mentee_id uuid references public.users(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);

-- Interview Questions
create table public.interview_questions (
  id uuid primary key default uuid_generate_v4(),
  category question_category not null,
  difficulty question_difficulty not null,
  question_text text not null,
  model_answer text not null,
  hints text,
  created_at timestamptz not null default now()
);

-- Interview Attempts
create table public.interview_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  question_id uuid references public.interview_questions(id) on delete cascade not null,
  user_answer text,
  score int check (score between 0 and 100),
  time_taken_seconds int,
  created_at timestamptz not null default now()
);

-- Flashcard Decks
create table public.flashcard_decks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null,
  is_premium boolean not null default false
);

-- Flashcards
create table public.flashcards (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid references public.flashcard_decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  difficulty int not null default 3 check (difficulty between 1 and 5)
);

-- User Flashcard Progress (SM-2 spaced repetition)
create table public.user_flashcard_progress (
  user_id uuid references public.users(id) on delete cascade,
  flashcard_id uuid references public.flashcards(id) on delete cascade,
  ease_factor numeric(4,2) not null default 2.5,
  interval_days int not null default 1,
  repetitions int not null default 0,
  next_review_at timestamptz not null default now(),
  primary key (user_id, flashcard_id)
);

-- Lateral Moves
create table public.lateral_moves (
  id uuid primary key default uuid_generate_v4(),
  person_name text not null,
  from_firm text not null,
  from_role text not null,
  to_firm text not null,
  to_role text not null,
  division text,
  seniority text,
  date_moved date,
  source text,
  is_verified boolean not null default false
);

-- Subscriptions
create table public.subscriptions (
  user_id uuid references public.users(id) on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier user_tier not null default 'free',
  status subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  is_annual boolean not null default false,
  is_student boolean not null default false,
  is_founding boolean not null default false
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  session_id uuid references public.mentor_sessions(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- Session Caps
create table public.session_caps (
  user_id uuid references public.users(id) on delete cascade primary key,
  billing_period_start timestamptz not null,
  sessions_used int not null default 0,
  sessions_limit int not null default 3
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_mentor_sessions_mentor_id on public.mentor_sessions(mentor_id);
create index idx_mentor_sessions_scheduled_at on public.mentor_sessions(scheduled_at);
create index idx_mentor_sessions_status on public.mentor_sessions(status);
create index idx_mentor_ratings_mentor_id on public.mentor_ratings(mentor_id);
create index idx_interview_attempts_user_id on public.interview_attempts(user_id);
create index idx_interview_attempts_question_id on public.interview_attempts(question_id);
create index idx_flashcards_deck_id on public.flashcards(deck_id);
create index idx_user_flashcard_progress_next_review on public.user_flashcard_progress(next_review_at);
create index idx_lateral_moves_date_moved on public.lateral_moves(date_moved desc);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_recipient_id on public.messages(recipient_id);
create index idx_messages_created_at on public.messages(created_at desc);
create index idx_mentors_is_top_mentor on public.mentors(is_top_mentor);
create index idx_mentors_rating_avg on public.mentors(rating_avg desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.mentors enable row level security;
alter table public.mentor_sessions enable row level security;
alter table public.mentor_ratings enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_attempts enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.user_flashcard_progress enable row level security;
alter table public.lateral_moves enable row level security;
alter table public.subscriptions enable row level security;
alter table public.messages enable row level security;
alter table public.session_caps enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- users: can only read/update own row
create policy "Users can read own row" on public.users for select using (auth.uid() = id);
create policy "Users can update own row" on public.users for update using (auth.uid() = id);

-- profiles: own row read/write; mentor profiles readable by paid users
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Paid users can read mentor profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.tier in ('standard', 'ultra') and s.status = 'active'
    )
  );

-- mentors: public read (name, firm, rating shown to all paid); full detail for paid only
create policy "Paid users can view mentor directory" on public.mentors
  for select using (
    exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.tier in ('standard', 'ultra') and s.status = 'active'
    )
  );
create policy "Mentors can update own record" on public.mentors
  for update using (auth.uid() = user_id);
create policy "Mentors can insert own record" on public.mentors
  for insert with check (auth.uid() = user_id);

-- mentor_sessions: participants only
create policy "Session participants can read sessions" on public.mentor_sessions
  for select using (
    auth.uid() = mentor_id or auth.uid() = any(mentee_ids)
  );

-- mentor_ratings: mentee can insert their own rating; mentor can read ratings about them
create policy "Mentees can insert ratings" on public.mentor_ratings
  for insert with check (auth.uid() = mentee_id);
create policy "Users can read ratings they're involved in" on public.mentor_ratings
  for select using (auth.uid() = mentee_id or auth.uid() = mentor_id);

-- interview_questions: readable by all authenticated users
create policy "All auth users can read questions" on public.interview_questions
  for select using (auth.uid() is not null);

-- interview_attempts: own rows only
create policy "Users can read own attempts" on public.interview_attempts
  for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on public.interview_attempts
  for insert with check (auth.uid() = user_id);

-- flashcard_decks: free decks visible to all; premium decks to paid only
create policy "All auth users can read free decks" on public.flashcard_decks
  for select using (
    auth.uid() is not null and (
      not is_premium or
      exists (
        select 1 from public.subscriptions s
        where s.user_id = auth.uid() and s.tier in ('standard', 'ultra') and s.status = 'active'
      )
    )
  );

-- flashcards: visible if deck is accessible
create policy "Users can read flashcards in accessible decks" on public.flashcards
  for select using (
    exists (
      select 1 from public.flashcard_decks d where d.id = deck_id and (
        not d.is_premium or
        exists (
          select 1 from public.subscriptions s
          where s.user_id = auth.uid() and s.tier in ('standard', 'ultra') and s.status = 'active'
        )
      )
    )
  );

-- user_flashcard_progress: own rows
create policy "Users can manage own flashcard progress" on public.user_flashcard_progress
  for all using (auth.uid() = user_id);

-- lateral_moves: free users read only; filters for paid
create policy "All auth users can read lateral moves" on public.lateral_moves
  for select using (auth.uid() is not null);

-- subscriptions: own row only
create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- messages: sender or recipient
create policy "Users can read own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Paid users can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.tier in ('standard', 'ultra') and s.status = 'active'
    )
  );

-- session_caps: own row
create policy "Users can read own session cap" on public.session_caps
  for select using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create user row and profile when auth.users is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.profiles (user_id)
  values (new.id);

  insert into public.subscriptions (user_id, tier, status)
  values (new.id, 'free', 'active');

  insert into public.session_caps (user_id, billing_period_start, sessions_used, sessions_limit)
  values (new.id, now(), 0, 0);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on users
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- Recalculate mentor rating_avg after a new rating is inserted
create or replace function public.update_mentor_rating()
returns trigger language plpgsql security definer as $$
begin
  update public.mentors
  set
    rating_avg = (select avg(rating) from public.mentor_ratings where mentor_id = new.mentor_id),
    session_count = session_count + 1
  where user_id = new.mentor_id;
  return new;
end;
$$;

create trigger after_mentor_rating_insert
  after insert on public.mentor_ratings
  for each row execute procedure public.update_mentor_rating();
