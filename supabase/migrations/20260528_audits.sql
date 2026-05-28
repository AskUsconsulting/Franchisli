-- ============================================================
-- Franchisli — Inspections & Audits Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ─── Audit Templates ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'standard',
  is_active   BOOLEAN DEFAULT TRUE,
  version     INTEGER DEFAULT 1,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_templates_all" ON audit_templates FOR ALL USING (TRUE);

-- ─── Template Sections ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES audit_templates(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  weight        NUMERIC DEFAULT 1,
  section_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_sections_all" ON audit_sections FOR ALL USING (TRUE);

-- ─── Template Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id     UUID REFERENCES audit_sections(id) ON DELETE CASCADE,
  text           TEXT NOT NULL,
  description    TEXT,
  points         INTEGER NOT NULL DEFAULT 5,
  is_critical    BOOLEAN DEFAULT FALSE,
  photo_required BOOLEAN DEFAULT FALSE,
  item_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_items_all" ON audit_items FOR ALL USING (TRUE);

-- ─── Audits (instances) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS audits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id      UUID REFERENCES audit_templates(id),
  location_id      UUID REFERENCES locations(id),
  auditor_name     TEXT NOT NULL,
  audit_type       TEXT NOT NULL CHECK (audit_type IN ('scheduled','surprise','self')),
  status           TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','reviewed')),
  scheduled_date   DATE,
  conducted_date   DATE DEFAULT CURRENT_DATE,
  score            NUMERIC,
  grade            TEXT,
  critical_failures INTEGER DEFAULT 0,
  notes            TEXT,
  submitted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audits_all" ON audits FOR ALL USING (TRUE);

-- ─── Audit Responses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id      UUID REFERENCES audits(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES audit_items(id),
  response      TEXT CHECK (response IN ('pass','fail','na')),
  points_earned INTEGER DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_responses_all" ON audit_responses FOR ALL USING (TRUE);

-- ─── Audit Photos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID REFERENCES audits(id) ON DELETE CASCADE,
  response_id UUID REFERENCES audit_responses(id) ON DELETE SET NULL,
  item_id     UUID REFERENCES audit_items(id),
  storage_url TEXT NOT NULL,
  caption     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_photos_all" ON audit_photos FOR ALL USING (TRUE);

-- ─── Audit Findings (failed item follow-ups) ─────────────────
CREATE TABLE IF NOT EXISTS audit_findings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID REFERENCES audits(id),
  item_id     UUID REFERENCES audit_items(id),
  location_id UUID REFERENCES locations(id),
  description TEXT NOT NULL,
  severity    TEXT NOT NULL CHECK (severity IN ('critical','major','minor')),
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','escalated')),
  due_date    DATE,
  assigned_to TEXT,
  resolution  TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_findings_all" ON audit_findings FOR ALL USING (TRUE);

-- ─── Finding Updates (comments/history) ──────────────────────
CREATE TABLE IF NOT EXISTS finding_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id  UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  note        TEXT NOT NULL,
  status_change TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE finding_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finding_updates_all" ON finding_updates FOR ALL USING (TRUE);

-- ─── Supabase Storage Bucket (run separately if needed) ──────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audit-photos', 'audit-photos', false);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Audit Template
INSERT INTO audit_templates (id, name, description, category, created_by) VALUES (
  'at000000-0000-0000-0000-000000000001',
  'Standard Franchise Inspection',
  'Comprehensive audit covering food safety, operations, brand standards, and facilities.',
  'standard',
  'Abiel'
) ON CONFLICT (id) DO NOTHING;

-- Sections
INSERT INTO audit_sections (id, template_id, title, description, weight, section_order) VALUES
  ('as000000-0000-0000-0000-000000000001', 'at000000-0000-0000-0000-000000000001', 'Food Safety & Hygiene',       'Temperature controls, handling, storage', 25, 1),
  ('as000000-0000-0000-0000-000000000002', 'at000000-0000-0000-0000-000000000001', 'Cleanliness & Sanitation',    'All surfaces, equipment, and restrooms',  20, 2),
  ('as000000-0000-0000-0000-000000000003', 'at000000-0000-0000-0000-000000000001', 'Brand Standards',             'Signage, uniforms, marketing materials',  15, 3),
  ('as000000-0000-0000-0000-000000000004', 'at000000-0000-0000-0000-000000000001', 'Customer Experience',         'Service quality and environment',         20, 4),
  ('as000000-0000-0000-0000-000000000005', 'at000000-0000-0000-0000-000000000001', 'Operations & Compliance',     'Procedures, documentation, staff',        20, 5)
ON CONFLICT (id) DO NOTHING;

-- Food Safety Items
INSERT INTO audit_items (section_id, text, points, is_critical, photo_required, item_order) VALUES
  ('as000000-0000-0000-0000-000000000001', 'Refrigerator temps at or below 40°F — verified with thermometer', 10, TRUE,  TRUE,  1),
  ('as000000-0000-0000-0000-000000000001', 'Freezer temps at or below 0°F',                                   10, TRUE,  FALSE, 2),
  ('as000000-0000-0000-0000-000000000001', 'All food items correctly labeled and dated',                       8,  FALSE, FALSE, 3),
  ('as000000-0000-0000-0000-000000000001', 'No expired food items found on premises',                          10, TRUE,  TRUE,  4),
  ('as000000-0000-0000-0000-000000000001', 'Staff following proper hand washing procedures',                   8,  TRUE,  FALSE, 5),
  ('as000000-0000-0000-0000-000000000001', 'Food stored properly — covered, off floor, separated',             8,  FALSE, TRUE,  6);

-- Cleanliness Items
INSERT INTO audit_items (section_id, text, points, is_critical, photo_required, item_order) VALUES
  ('as000000-0000-0000-0000-000000000002', 'All customer-facing surfaces clean and sanitized',     8,  FALSE, TRUE,  1),
  ('as000000-0000-0000-0000-000000000002', 'Restrooms clean, stocked, and no maintenance issues',  8,  FALSE, TRUE,  2),
  ('as000000-0000-0000-0000-000000000002', 'Floors clean and free of debris or spills',            6,  FALSE, FALSE, 3),
  ('as000000-0000-0000-0000-000000000002', 'Trash receptacles emptied and liners in place',        5,  FALSE, FALSE, 4),
  ('as000000-0000-0000-0000-000000000002', 'Kitchen equipment sanitized per schedule',             8,  TRUE,  TRUE,  5);

-- Brand Standards Items
INSERT INTO audit_items (section_id, text, points, is_critical, photo_required, item_order) VALUES
  ('as000000-0000-0000-0000-000000000003', 'Exterior signage clean, lit, and undamaged',       6,  FALSE, TRUE,  1),
  ('as000000-0000-0000-0000-000000000003', 'All staff in correct uniform with name badges',    6,  FALSE, FALSE, 2),
  ('as000000-0000-0000-0000-000000000003', 'Menu boards current, correct pricing displayed',   6,  FALSE, TRUE,  3),
  ('as000000-0000-0000-0000-000000000003', 'Marketing materials current — no outdated promos', 4,  FALSE, FALSE, 4);

-- Customer Experience Items
INSERT INTO audit_items (section_id, text, points, is_critical, photo_required, item_order) VALUES
  ('as000000-0000-0000-0000-000000000004', 'Staff greeting customers within 30 seconds',        8,  FALSE, FALSE, 1),
  ('as000000-0000-0000-0000-000000000004', 'Wait times within acceptable range (< 5 min)',      8,  FALSE, FALSE, 2),
  ('as000000-0000-0000-0000-000000000004', 'Customer seating area clean and welcoming',         6,  FALSE, TRUE,  3),
  ('as000000-0000-0000-0000-000000000004', 'No unresolved customer complaints on record',       6,  FALSE, FALSE, 4);

-- Operations Items
INSERT INTO audit_items (section_id, text, points, is_critical, photo_required, item_order) VALUES
  ('as000000-0000-0000-0000-000000000005', 'Opening and closing checklists completed daily',   8,  FALSE, FALSE, 1),
  ('as000000-0000-0000-0000-000000000005', 'Temperature logs filled out and up to date',       8,  TRUE,  TRUE,  2),
  ('as000000-0000-0000-0000-000000000005', 'Staff certifications current (food handler cards)', 8, TRUE,  FALSE, 3),
  ('as000000-0000-0000-0000-000000000005', 'Cash handling procedures followed correctly',      6,  FALSE, FALSE, 4),
  ('as000000-0000-0000-0000-000000000005', 'Incident log maintained and up to date',           4,  FALSE, FALSE, 5);

-- Sample Audits
INSERT INTO audits (id, template_id, location_id, auditor_name, audit_type, status, conducted_date, score, grade, critical_failures, submitted_at) VALUES
  ('au000000-0000-0000-0000-000000000001', 'at000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Marki', 'scheduled', 'submitted', CURRENT_DATE - 7,  97, 'A', 0, NOW() - INTERVAL '7 days'),
  ('au000000-0000-0000-0000-000000000002', 'at000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Marki', 'scheduled', 'submitted', CURRENT_DATE - 9,  91, 'A', 0, NOW() - INTERVAL '9 days'),
  ('au000000-0000-0000-0000-000000000003', 'at000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Third', 'surprise',  'submitted', CURRENT_DATE - 13, 74, 'C', 2, NOW() - INTERVAL '13 days'),
  ('au000000-0000-0000-0000-000000000004', 'at000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Marki', 'scheduled', 'submitted', CURRENT_DATE - 14, 88, 'B', 0, NOW() - INTERVAL '14 days'),
  ('au000000-0000-0000-0000-000000000005', 'at000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Third', 'scheduled', 'submitted', CURRENT_DATE - 20, 95, 'A', 0, NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Sample Findings from Decatur audit (critical failures)
INSERT INTO audit_findings (id, audit_id, location_id, item_id, description, severity, status, due_date, assigned_to) VALUES
  (
    'af000000-0000-0000-0000-000000000001',
    'au000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    (SELECT id FROM audit_items WHERE text = 'Temperature logs filled out and up to date' LIMIT 1),
    'Temperature logs not filled out for 3 consecutive days. Critical compliance failure.',
    'critical', 'in_progress', CURRENT_DATE + 7, 'Tanya R.'
  ),
  (
    'af000000-0000-0000-0000-000000000002',
    'au000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    (SELECT id FROM audit_items WHERE text = 'No expired food items found on premises' LIMIT 1),
    'Two items found past use-by date in walk-in cooler. Discarded on site.',
    'critical', 'resolved', CURRENT_DATE - 10, 'Tanya R.'
  ),
  (
    'af000000-0000-0000-0000-000000000003',
    'au000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    (SELECT id FROM audit_items WHERE text = 'Restrooms clean, stocked, and no maintenance issues' LIMIT 1),
    'Restroom hand dryer not working. Towels not restocked.',
    'major', 'open', CURRENT_DATE + 3, 'Tanya R.'
  )
ON CONFLICT (id) DO NOTHING;
