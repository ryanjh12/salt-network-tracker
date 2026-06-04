-- ============================================================
-- Salt Network Church Onboarding Tracker — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- CHURCHES TABLE
-- ============================================================
create table if not exists churches (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  city            text not null,
  state           text not null,
  lead_pastor     text not null,
  contact_email   text,
  other_key_leaders jsonb default '[]'::jsonb,
  notes           text,
  current_phase   text not null default 'discovery',
  current_step    integer not null default 0,
  last_activity_date timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- STEP HISTORY TABLE
-- ============================================================
create table if not exists step_history (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid not null references churches(id) on delete cascade,
  phase        text not null,
  step_index   integer not null,
  step_name    text not null,
  completed_at timestamptz not null,
  note         text,
  created_at   timestamptz default now()
);

-- ============================================================
-- MEETING NOTES TABLE
-- ============================================================
create table if not exists meeting_notes (
  id             uuid primary key default gen_random_uuid(),
  church_id      uuid not null references churches(id) on delete cascade,
  date           date not null,
  title          text not null,
  body           text,
  transcript_url text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_churches_last_activity on churches(last_activity_date desc);
create index if not exists idx_step_history_church    on step_history(church_id, completed_at desc);
create index if not exists idx_meeting_notes_church   on meeting_notes(church_id, date desc);

-- ============================================================
-- ROW LEVEL SECURITY — open for anon reads/writes
-- (For a private internal tool this is fine; add auth later if needed)
-- ============================================================
alter table churches      enable row level security;
alter table step_history  enable row level security;
alter table meeting_notes enable row level security;

create policy "Allow all for anon" on churches
  for all using (true) with check (true);

create policy "Allow all for anon" on step_history
  for all using (true) with check (true);

create policy "Allow all for anon" on meeting_notes
  for all using (true) with check (true);

-- ============================================================
-- SAMPLE DATA (optional — delete if not needed)
-- ============================================================
-- insert into churches (name, city, state, lead_pastor, contact_email, current_phase, current_step, notes)
-- values
--   ('Crossroads Community Church', 'Austin', 'TX', 'Pastor Mike Johnson', 'mike@crossroads.org', 'discovery', 2, 'Strong college ministry presence on UT campus.'),
--   ('Calvary Chapel', 'Dallas', 'TX', 'Pastor James Lee', 'james@calvary.org', 'discovery', 0, 'Referred by network church in Houston.'),
--   ('The Bridge Church', 'Nashville', 'TN', 'Pastor David Chen', 'david@thebridge.org', 'assimilation', 3, 'Moving quickly through assimilation.');
