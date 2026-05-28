-- ============================================================
-- Franchisli — Operations & Daily Execution Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ─── Locations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  region      TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','onboarding')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_all" ON locations FOR ALL USING (TRUE);

-- ─── Checklist Templates ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('opening','closing','daily','custom')),
  location_id  UUID REFERENCES locations(id),   -- NULL = applies to all
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklists_all" ON checklists FOR ALL USING (TRUE);

-- ─── Checklist Items (template rows) ─────────────────────────
CREATE TABLE IF NOT EXISTS checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID REFERENCES checklists(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  category      TEXT,
  item_order    INTEGER NOT NULL DEFAULT 0,
  required      BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_items_all" ON checklist_items FOR ALL USING (TRUE);

-- ─── Checklist Runs (daily submissions) ──────────────────────
CREATE TABLE IF NOT EXISTS checklist_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID REFERENCES checklists(id),
  location_id   UUID REFERENCES locations(id),
  submitted_by  TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  shift         TEXT CHECK (shift IN ('morning','afternoon','evening','closing')),
  status        TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','flagged')),
  notes         TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checklist_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_runs_all" ON checklist_runs FOR ALL USING (TRUE);

-- ─── Run Item Completions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_run_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID REFERENCES checklist_runs(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES checklist_items(id),
  completed     BOOLEAN DEFAULT FALSE,
  completed_by  TEXT,
  completed_at  TIMESTAMPTZ,
  notes         TEXT
);

ALTER TABLE checklist_run_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_run_items_all" ON checklist_run_items FOR ALL USING (TRUE);

-- ─── Procedures ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procedures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('opening','closing','emergency','general')),
  location_id  UUID REFERENCES locations(id),   -- NULL = all locations
  steps        JSONB NOT NULL DEFAULT '[]',      -- [{order, title, description, required}]
  version      INTEGER DEFAULT 1,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   TEXT,
  updated_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "procedures_all" ON procedures FOR ALL USING (TRUE);

-- ─── Shift Handover Notes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS shift_handover_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID REFERENCES locations(id),
  written_by   TEXT NOT NULL,
  from_shift   TEXT NOT NULL CHECK (from_shift IN ('morning','afternoon','evening')),
  to_shift     TEXT NOT NULL CHECK (to_shift   IN ('morning','afternoon','evening')),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  summary      TEXT NOT NULL,
  items        JSONB DEFAULT '[]',  -- [{type:'issue'|'note'|'followup', text, resolved}]
  is_read      BOOLEAN DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shift_handover_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handover_notes_all" ON shift_handover_notes FOR ALL USING (TRUE);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Locations
INSERT INTO locations (id, name, address, region, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Downtown Atlanta',  '100 Peachtree St NW, Atlanta, GA', 'Metro Atlanta', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'Buckhead',          '3500 Lenox Rd NE, Atlanta, GA',   'Metro Atlanta', 'active'),
  ('a0000000-0000-0000-0000-000000000003', 'Midtown',           '800 Spring St NW, Atlanta, GA',   'Metro Atlanta', 'active'),
  ('a0000000-0000-0000-0000-000000000004', 'Decatur',           '101 E Court Sq, Decatur, GA',     'Metro Atlanta', 'active'),
  ('a0000000-0000-0000-0000-000000000005', 'Marietta',          '50 N Park Square NE, Marietta',   'North Georgia', 'active'),
  ('a0000000-0000-0000-0000-000000000006', 'Smyrna',            '2740 Atlanta Rd SE, Smyrna, GA',  'North Georgia', 'onboarding')
ON CONFLICT (id) DO NOTHING;

-- Checklist Templates
INSERT INTO checklists (id, title, type, location_id, created_by) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Daily Opening Checklist', 'opening', NULL, 'Abiel'),
  ('c0000000-0000-0000-0000-000000000002', 'Daily Closing Checklist', 'closing', NULL, 'Abiel'),
  ('c0000000-0000-0000-0000-000000000003', 'Daily Task Checklist',    'daily',   NULL, 'Abiel')
ON CONFLICT (id) DO NOTHING;

-- Opening Checklist Items
INSERT INTO checklist_items (checklist_id, text, category, item_order, required) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Unlock all entry doors and deactivate alarm',           'Security',    1,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Check overnight voicemails and emails',                 'Admin',       2,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Inspect restrooms — restock supplies as needed',        'Facilities',  3,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Check all equipment is operational (POS, printers)',    'Equipment',   4,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Review daily specials and update menu boards',          'Operations',  5,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Count opening cash drawer and verify amount',           'Finance',     6,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Brief opening staff on day priorities',                 'Staff',       7,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Verify inventory levels — flag any shortages',          'Inventory',   8,  TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Inspect exterior — signage, parking, cleanliness',      'Facilities',  9,  FALSE),
  ('c0000000-0000-0000-0000-000000000001', 'Confirm all staff are clocked in and in position',      'Staff',       10, TRUE);

-- Closing Checklist Items
INSERT INTO checklist_items (checklist_id, text, category, item_order, required) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'Complete end-of-day sales reconciliation',              'Finance',     1,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Count and secure cash drawers',                         'Finance',     2,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Process final transactions and close POS',              'Equipment',   3,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Clean and sanitize all customer-facing surfaces',       'Facilities',  4,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Secure all food/inventory — check refrigeration temps', 'Inventory',   5,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Take out all trash and recycling',                      'Facilities',  6,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Set overnight alarm and lock all entry points',         'Security',    7,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Confirm all staff are clocked out',                     'Staff',       8,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Write shift handover note for opening team',            'Admin',       9,  TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'Submit end-of-day report in system',                    'Admin',       10, TRUE);

-- Daily Task Checklist Items
INSERT INTO checklist_items (checklist_id, text, category, item_order, required) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'Review and respond to customer feedback/reviews',       'Customer',    1,  TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'Update inventory tracking spreadsheet',                 'Inventory',   2,  TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'Check and reply to franchisee messages',                'Admin',       3,  TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'Review daily sales vs target',                          'Finance',     4,  TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'Post daily social media update (if applicable)',        'Marketing',   5,  FALSE),
  ('c0000000-0000-0000-0000-000000000003', 'Check equipment maintenance log',                      'Equipment',   6,  FALSE);

-- Opening Procedure
INSERT INTO procedures (id, title, type, location_id, steps, created_by) VALUES (
  'p0000000-0000-0000-0000-000000000001',
  'Standard Opening Procedure',
  'opening',
  NULL,
  '[
    {"order":1,"title":"Arrival & Security","description":"Arrive at least 30 minutes before opening. Inspect the exterior for any damage or tampering. Deactivate the alarm — code is in your manager credentials. Unlock all entry doors in sequence: back entrance first, then front.","required":true},
    {"order":2,"title":"Systems Check","description":"Power on all equipment: POS terminals, printers, display screens, and any kitchen equipment. Run a test transaction on the POS to confirm payment processing is live. Check that Wi-Fi and internet are connected.","required":true},
    {"order":3,"title":"Cash Management","description":"Retrieve the opening cash float from the safe. Count each denomination and verify the total matches the expected opening amount ($300). Record the count in the daily log. Place the float in the assigned register.","required":true},
    {"order":4,"title":"Inventory Spot Check","description":"Walk the floor and back-of-house. Check that refrigeration units are at correct temps (35–38°F for refrigerators, 0°F for freezers). Flag any items below par levels in the inventory app. Note any spoilage.","required":true},
    {"order":5,"title":"Facility Inspection","description":"Inspect restrooms — restock paper towels, soap, and toilet paper as needed. Check that all customer-facing areas are clean. Inspect seating, tables, floors, and windows. Spot clean anything that needs attention.","required":true},
    {"order":6,"title":"Staff Briefing","description":"Gather opening staff for a 5-minute briefing. Cover: daily specials or promotions, any known maintenance issues, staffing for the day, and any action items from the previous closing team handover note.","required":true},
    {"order":7,"title":"Open for Business","description":"Unlock the front entrance at your scheduled opening time. Flip the sign to OPEN. Ensure a staff member is positioned at the front to greet customers. Start the day.","required":true}
  ]',
  'Abiel'
) ON CONFLICT (id) DO NOTHING;

-- Closing Procedure
INSERT INTO procedures (id, title, type, location_id, steps, created_by) VALUES (
  'p0000000-0000-0000-0000-000000000002',
  'Standard Closing Procedure',
  'closing',
  NULL,
  '[
    {"order":1,"title":"Last Customer & Soft Close","description":"Begin soft-close activities 30 minutes before close. Inform remaining customers of closing time. Stop seating new customers 15 minutes before close. Begin cleaning back-of-house while maintaining front-of-house standards.","required":true},
    {"order":2,"title":"Cash Reconciliation","description":"Run end-of-day report on the POS. Count each cash drawer independently. Compare actual totals to system totals. Any variance over $10 must be documented and reported. Complete the daily reconciliation form.","required":true},
    {"order":3,"title":"POS Closeout","description":"Complete all pending transactions. Process any refunds or voids with manager approval. Print the end-of-day Z report and file it. Back up the day''s transaction data. Power down POS terminals.","required":true},
    {"order":4,"title":"Cleaning & Sanitization","description":"Deep clean all surfaces per the sanitation schedule. Sanitize all customer-contact areas. Mop floors. Clean and sanitize restrooms. Empty all trash cans and replace liners. Clean equipment per manufacturer guidelines.","required":true},
    {"order":5,"title":"Inventory & Refrigeration","description":"Conduct a closing inventory count for high-value items. Verify all refrigeration and freezer doors are sealed. Check that all hot-holding equipment is off. Label and date any prepared food items. Dispose of items past hold time.","required":true},
    {"order":6,"title":"Handover Note","description":"Write a clear shift handover note for the opening team covering: any equipment issues, customer incidents, inventory shortages, action items, and any other relevant notes. Submit in the Franchisli system.","required":true},
    {"order":7,"title":"Security & Lockup","description":"Confirm all staff are clocked out. Secure all cash in the safe. Set the overnight alarm. Do a final walkthrough — check all windows are closed, appliances are off, and back exits are locked. Lock the front entrance.","required":true}
  ]',
  'Abiel'
) ON CONFLICT (id) DO NOTHING;

-- Sample Checklist Runs (today)
INSERT INTO checklist_runs (id, checklist_id, location_id, submitted_by, date, shift, status, completed_at) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Marcus J.', CURRENT_DATE, 'morning',  'completed', NOW() - INTERVAL '4 hours'),
  ('r0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Sandra K.', CURRENT_DATE, 'morning',  'completed', NOW() - INTERVAL '3 hours'),
  ('r0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Derek L.',  CURRENT_DATE, 'morning',  'in_progress', NULL),
  ('r0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Tanya R.',  CURRENT_DATE, 'morning',  'flagged',  NULL),
  ('r0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'James P.',  CURRENT_DATE, 'morning',  'completed', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Sample Handover Notes
INSERT INTO shift_handover_notes (id, location_id, written_by, from_shift, to_shift, date, summary, items, is_read) VALUES
(
  'h0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Marcus J.',
  'evening', 'morning',
  CURRENT_DATE - 1,
  'Smooth close. POS Printer on register 2 is jamming intermittently — tech coming tomorrow. Cash reconciled, $2 overage documented.',
  '[
    {"type":"issue",    "text":"POS Printer (Register 2) jamming — service call booked for tomorrow 10am","resolved":false},
    {"type":"note",     "text":"Customer group of 12 arriving 11am — confirm reservation setup","resolved":false},
    {"type":"followup", "text":"Reach out to beverage supplier re: delayed order","resolved":false}
  ]',
  FALSE
),
(
  'h0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'Sandra K.',
  'evening', 'morning',
  CURRENT_DATE - 1,
  'Great day — hit daily target. Restroom sink in unit 2 is draining slowly, submitted maintenance request.',
  '[
    {"type":"issue",    "text":"Restroom sink draining slowly — maintenance request #2241 submitted","resolved":false},
    {"type":"note",     "text":"New staff member Maya starts Monday — paperwork in the manager folder","resolved":false}
  ]',
  TRUE
),
(
  'h0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'Tanya R.',
  'afternoon', 'evening',
  CURRENT_DATE,
  'Slow afternoon. Health inspector visited unannounced — passed but noted temperature log needs more detail. Need follow-up.',
  '[
    {"type":"issue",    "text":"Health inspector flagged temperature log detail — update format ASAP","resolved":false},
    {"type":"followup", "text":"Review and update temp logging procedure with all staff this week","resolved":false},
    {"type":"note",     "text":"Freezer unit running slightly warm (2°F above spec) — monitoring","resolved":false}
  ]',
  FALSE
)
ON CONFLICT (id) DO NOTHING;
