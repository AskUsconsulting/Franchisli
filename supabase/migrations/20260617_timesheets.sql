-- ============================================================
-- Timesheets — employees log hours, owners review/approve
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists timesheets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  employee_name text,
  location_id   uuid references locations(id) on delete set null,
  work_date     date not null default current_date,
  clock_in      text,           -- "09:00"
  clock_out     text,           -- "17:30"
  hours         numeric,        -- computed total hours
  notes         text,
  status        text not null default 'submitted' check (status in ('submitted','approved','rejected')),
  created_at    timestamptz not null default now()
);

alter table timesheets enable row level security;

-- Employees can read/insert their own; service_role (admin client) handles all server-side
create policy "timesheets_own_select" on timesheets for select using (auth.uid() = user_id);
create policy "timesheets_own_insert" on timesheets for insert with check (auth.uid() = user_id);

grant all on public.timesheets to service_role;

create index if not exists timesheets_user_idx on timesheets(user_id);
create index if not exists timesheets_date_idx on timesheets(work_date);
