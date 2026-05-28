-- ─── Training & Reporting ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_modules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  description        TEXT,
  category           TEXT NOT NULL DEFAULT 'general',  -- 'food_safety' | 'brand' | 'operations' | 'hr' | 'emergency'
  is_required        BOOLEAN NOT NULL DEFAULT true,
  estimated_minutes  INTEGER NOT NULL DEFAULT 30,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  location_id   UUID NOT NULL REFERENCES locations(id)  ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  score         INTEGER,
  UNIQUE(module_id, location_id, employee_name)
);

ALTER TABLE training_modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_training_modules"     ON training_modules     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_training_completions" ON training_completions FOR ALL USING (true) WITH CHECK (true);

-- ── Seed training modules ─────────────────────────────────────────────────────

INSERT INTO training_modules (id, name, description, category, is_required, estimated_minutes) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'Food Safety Certification', 'ServSafe-aligned food safety fundamentals for all food handlers.', 'food_safety', true,  60),
  ('tm000001-0000-0000-0000-000000000002', 'Brand Standards & Identity', 'Brand guidelines, uniform standards, and customer experience expectations.', 'brand', true, 45),
  ('tm000001-0000-0000-0000-000000000003', 'Opening & Closing Procedures', 'Step-by-step procedures for daily open and close.', 'operations', true, 30),
  ('tm000001-0000-0000-0000-000000000004', 'Customer Service Excellence', 'SMILE protocol, complaint handling, and upselling techniques.', 'hr', true, 45),
  ('tm000001-0000-0000-0000-000000000005', 'Emergency Response Training', 'Fire evacuation, medical emergency, and active threat protocols.', 'emergency', true, 30);

-- ── Seed completions ──────────────────────────────────────────────────────────
-- Downtown Atlanta — fully compliant
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Marcus Williams', NOW() - INTERVAL '60 days', 95),
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Jasmine Carter',  NOW() - INTERVAL '58 days', 92),
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Tyrone Johnson',  NOW() - INTERVAL '55 days', 88),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Marcus Williams', NOW() - INTERVAL '59 days', 97),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Jasmine Carter',  NOW() - INTERVAL '57 days', 94),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Marcus Williams', NOW() - INTERVAL '57 days', 100),
  ('tm000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Jasmine Carter',  NOW() - INTERVAL '56 days', 91),
  ('tm000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Marcus Williams', NOW() - INTERVAL '54 days', 96);

-- Buckhead — mostly compliant
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Priya Patel',     NOW() - INTERVAL '45 days', 90),
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Andre Thompson',  NOW() - INTERVAL '44 days', 85),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Priya Patel',     NOW() - INTERVAL '43 days', 93),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Priya Patel',     NOW() - INTERVAL '42 days', 98),
  ('tm000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Priya Patel',     NOW() - INTERVAL '41 days', 89);

-- Midtown
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'DeShawn Taylor',  NOW() - INTERVAL '40 days', 87),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'DeShawn Taylor',  NOW() - INTERVAL '39 days', 91),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'DeShawn Taylor',  NOW() - INTERVAL '38 days', 95),
  ('tm000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'DeShawn Taylor',  NOW() - INTERVAL '36 days', 90);

-- Decatur — partially compliant (compliance issues)
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Kwame Asante',    NOW() - INTERVAL '30 days', 78),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Kwame Asante',    NOW() - INTERVAL '28 days', 82);

-- Marietta — strong compliance
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Tanya Brooks',    NOW() - INTERVAL '50 days', 94),
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Mike Nguyen',     NOW() - INTERVAL '48 days', 91),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'Tanya Brooks',    NOW() - INTERVAL '49 days', 96),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'Tanya Brooks',    NOW() - INTERVAL '47 days', 99),
  ('tm000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Tanya Brooks',    NOW() - INTERVAL '46 days', 93),
  ('tm000001-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Tanya Brooks',    NOW() - INTERVAL '45 days', 97);

-- Smyrna — partial
INSERT INTO training_completions (module_id, location_id, employee_name, completed_at, score) VALUES
  ('tm000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'Carlos Rivera',   NOW() - INTERVAL '35 days', 83),
  ('tm000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'Carlos Rivera',   NOW() - INTERVAL '33 days', 86),
  ('tm000001-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'Carlos Rivera',   NOW() - INTERVAL '31 days', 88);
