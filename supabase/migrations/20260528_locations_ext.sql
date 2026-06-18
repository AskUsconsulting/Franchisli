-- ─── Location Management extensions ──────────────────────────────────────────
-- Extends the base `locations` table created in 20260528_operations.sql

CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#2c4fa3',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS region_id        UUID REFERENCES regions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS email            TEXT,
  ADD COLUMN IF NOT EXISTS manager_name     TEXT,
  ADD COLUMN IF NOT EXISTS franchisee_name  TEXT,
  ADD COLUMN IF NOT EXISTS open_date        DATE,
  ADD COLUMN IF NOT EXISTS square_footage   INTEGER,
  ADD COLUMN IF NOT EXISTS seats            INTEGER;

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_regions" ON regions FOR ALL USING (true) WITH CHECK (true);

-- ── Seed regions ───────────────────────────────────────────────────────────────

INSERT INTO regions (id, name, description, color) VALUES
  ('b7000001-0000-0000-0000-000000000001', 'Metro Core',   'Downtown, Buckhead, Midtown, Decatur',  '#2c4fa3'),
  ('b7000001-0000-0000-0000-000000000002', 'North Metro',  'Marietta and Smyrna corridors',          '#16a34a');

-- ── Update location details ───────────────────────────────────────────────────

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000001',
  phone            = '(404) 555-0101',
  email            = 'downtown@franchisli.com',
  manager_name     = 'Marcus Williams',
  franchisee_name  = 'Sarah Chen',
  open_date        = '2021-03-15',
  square_footage   = 2800,
  seats            = 48
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000001',
  phone            = '(404) 555-0202',
  email            = 'buckhead@franchisli.com',
  manager_name     = 'Priya Patel',
  franchisee_name  = 'James Okonkwo',
  open_date        = '2021-09-01',
  square_footage   = 3200,
  seats            = 56
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000001',
  phone            = '(404) 555-0303',
  email            = 'midtown@franchisli.com',
  manager_name     = 'DeShawn Taylor',
  franchisee_name  = 'Maria Lopez',
  open_date        = '2022-01-20',
  square_footage   = 2400,
  seats            = 40
WHERE id = 'a0000000-0000-0000-0000-000000000003';

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000001',
  phone            = '(404) 555-0404',
  email            = 'decatur@franchisli.com',
  manager_name     = 'Kwame Asante',
  franchisee_name  = 'Robert Kim',
  open_date        = '2022-06-10',
  square_footage   = 2200,
  seats            = 36
WHERE id = 'a0000000-0000-0000-0000-000000000004';

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000002',
  phone            = '(770) 555-0505',
  email            = 'marietta@franchisli.com',
  manager_name     = 'Tanya Brooks',
  franchisee_name  = 'David Park',
  open_date        = '2022-11-05',
  square_footage   = 3000,
  seats            = 52
WHERE id = 'a0000000-0000-0000-0000-000000000005';

UPDATE locations SET
  region_id        = 'b7000001-0000-0000-0000-000000000002',
  phone            = '(770) 555-0606',
  email            = 'smyrna@franchisli.com',
  manager_name     = 'Carlos Rivera',
  franchisee_name  = 'Lisa Thompson',
  open_date        = '2023-02-28',
  square_footage   = 2600,
  seats            = 44
WHERE id = 'a0000000-0000-0000-0000-000000000006';
