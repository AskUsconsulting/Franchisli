-- ============================================================
-- Tasks table
-- ============================================================
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  assignee   text,
  location   text,
  due_date   date,
  priority   text default 'medium' check (priority in ('high','medium','low')),
  category   text,
  status     text default 'open' check (status in ('open','in_progress','completed','overdue')),
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "tasks_all" on tasks for all using (true) with check (true);
grant all on public.tasks to service_role;

-- ============================================================
-- Franchisees table
-- ============================================================
create table if not exists franchisees (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  email             text,
  phone             text,
  join_date         date,
  status            text default 'onboarding' check (status in ('active','onboarding','attention','inactive')),
  compliance_score  integer default 100,
  created_at        timestamptz default now()
);
alter table franchisees enable row level security;
create policy "franchisees_all" on franchisees for all using (true) with check (true);
grant all on public.franchisees to service_role;

-- ============================================================
-- Add business_name to profiles
-- ============================================================
alter table profiles add column if not exists business_name text;

-- ============================================================
-- Grant service_role access to existing tables
-- ============================================================
grant all on public.profiles to service_role;
grant all on public.locations to service_role;
grant all on public.access_codes to service_role;
grant all on public.employee_invites to service_role;
