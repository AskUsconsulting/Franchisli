-- ─── Document & Knowledge Management ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  description             TEXT,
  category_id             UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  doc_type                TEXT NOT NULL DEFAULT 'sop',       -- 'sop' | 'brand_standard' | 'policy'
  content                 TEXT,                               -- markdown body for inline viewer
  file_url                TEXT,                               -- external PDF link
  version                 TEXT NOT NULL DEFAULT '1.0',
  status                  TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'draft' | 'archived'
  requires_acknowledgment BOOLEAN NOT NULL DEFAULT false,
  created_by              TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  acknowledged_by TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, location_id)
);

-- RLS
ALTER TABLE document_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_doc_categories"    ON document_categories   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_documents"         ON documents              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_policy_acks"       ON policy_acknowledgments FOR ALL USING (true) WITH CHECK (true);

-- ── Seed data ──────────────────────────────────────────────────────────────────

INSERT INTO document_categories (id, name, slug, description) VALUES
  ('dc000001-0000-0000-0000-000000000001', 'Operations',    'operations',    'Day-to-day operational procedures'),
  ('dc000001-0000-0000-0000-000000000002', 'Food Safety',   'food-safety',   'Food handling, storage, and sanitation standards'),
  ('dc000001-0000-0000-0000-000000000003', 'Brand',         'brand',         'Brand identity and marketing standards'),
  ('dc000001-0000-0000-0000-000000000004', 'HR & Staff',    'hr',            'Employee policies and HR procedures'),
  ('dc000001-0000-0000-0000-000000000005', 'Emergency',     'emergency',     'Emergency response and safety protocols');

-- SOPs
INSERT INTO documents (id, title, description, category_id, doc_type, version, status, requires_acknowledgment, created_by, content, created_at, updated_at) VALUES
  ('do000001-0000-0000-0000-000000000001',
   'Opening Procedures Checklist',
   'Step-by-step opening procedures for all franchise locations.',
   'dc000001-0000-0000-0000-000000000001', 'sop', '2.1', 'active', false, 'HQ',
   '## Opening Procedures

**Start time:** 60 minutes before open

### 1. Exterior
- Check parking lot for trash/debris
- Verify signage is illuminated
- Unlock and inspect entrance doors

### 2. Kitchen Setup
- Turn on all equipment in correct order (see Equipment Guide)
- Verify refrigerators are at correct temp (≤41°F)
- Check prep stations are stocked

### 3. POS & Cash
- Boot POS systems and verify connectivity
- Count opening cash drawer (standard $150)
- Test all payment terminals

### 4. Staff Briefing
- Review daily specials and 86 items
- Assign stations for the shift
- Confirm health check for all staff

### 5. Final Walkthrough
- Complete opening checklist in the Operations tab
- Submit checklist by open time',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000002',
   'Closing Procedures Checklist',
   'Complete closing procedures including cleaning, cash reconciliation, and security.',
   'dc000001-0000-0000-0000-000000000001', 'sop', '2.0', 'active', false, 'HQ',
   '## Closing Procedures

**Start time:** 30 minutes before close

### 1. Kitchen Shutdown
- Complete all food prep area cleaning
- Turn off equipment in reverse order
- Document final temperature logs

### 2. Cash Reconciliation
- Count all drawers and reconcile with POS
- Prepare deposit bag
- Complete cash reconciliation form

### 3. Cleaning
- Deep clean all surfaces
- Mop floors (kitchen first, then dining)
- Empty all trash and replace liners

### 4. Security
- Verify all windows and back doors locked
- Set alarm system
- Complete closing checklist in Operations tab',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000003',
   'Food Safety & Temperature Standards',
   'HACCP-based food safety procedures including temperature monitoring and safe handling.',
   'dc000001-0000-0000-0000-000000000002', 'sop', '3.2', 'active', true, 'HQ',
   '## Food Safety Standards

### Temperature Requirements
| Item | Storage Temp | Action Temp |
|------|-------------|-------------|
| Raw meat | ≤41°F | Discard >50°F |
| Cooked items | ≥165°F | Reheat if <135°F |
| Frozen | ≤0°F | Discard if >10°F |

### Temperature Logging
- Check and log every **2 hours** (updated May 2026)
- Use calibrated probe thermometer
- Document in temperature log sheet

### Cross-Contamination Prevention
- Color-coded cutting boards (red: raw meat, green: produce, yellow: poultry)
- Separate storage zones for allergens
- Always wash hands between handling different proteins

### Illness Protocols
- Staff with symptoms must be sent home immediately
- No bare-hand contact with ready-to-eat foods
- Notify HQ if any foodborne illness is reported',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '4 days'),

  ('do000001-0000-0000-0000-000000000004',
   'Customer Service Standards',
   'Brand-approved customer service scripts, complaint handling, and experience guidelines.',
   'dc000001-0000-0000-0000-000000000003', 'sop', '1.5', 'active', false, 'HQ',
   '## Customer Service Standards

### Greeting (SMILE Protocol)
- **S**mile and make eye contact
- **M**ake a welcoming statement ("Welcome to Franchisli!")
- **I**nvite them to order when ready
- **L**isten actively and repeat the order back
- **E**nd with a warm close ("Enjoy your meal, see you soon!")

### Complaint Handling
1. Listen without interrupting
2. Apologize sincerely ("I''m so sorry about that")
3. Offer a solution (remake, refund, or comp item)
4. Escalate to manager if needed
5. Document in the incident log

### Wait Time Standards
- Counter service: ≤3 minutes
- Drive-through: ≤2 minutes
- Notify guest if wait will exceed standard',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000005',
   'Cash Handling Procedures',
   'POS usage, cash drawer management, and end-of-day reconciliation.',
   'dc000001-0000-0000-0000-000000000001', 'sop', '1.8', 'active', false, 'HQ', NULL,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000006',
   'Inventory Management & Ordering',
   'Par levels, ordering schedule, and inventory count procedures.',
   'dc000001-0000-0000-0000-000000000001', 'sop', '2.3', 'active', false, 'HQ', NULL,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000007',
   'Emergency Response Procedures',
   'Fire, medical emergency, power outage, and active threat protocols.',
   'dc000001-0000-0000-0000-000000000005', 'sop', '1.2', 'active', true, 'HQ', NULL,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('do000001-0000-0000-0000-000000000008',
   'New Employee Onboarding Guide',
   'Complete onboarding checklist and training plan for new hires.',
   'dc000001-0000-0000-0000-000000000004', 'sop', '3.0', 'active', false, 'HQ', NULL,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days');

-- Brand Standards
INSERT INTO documents (id, title, description, category_id, doc_type, version, status, requires_acknowledgment, created_by, created_at, updated_at) VALUES
  ('do000001-0000-0000-0000-000000000009',
   'Brand Identity & Logo Usage',
   'Official logo files, usage rules, and brand color palette.',
   'dc000001-0000-0000-0000-000000000003', 'brand_standard', '4.0', 'active', false, 'HQ',
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('do000001-0000-0000-0000-00000000000A',
   'Uniform & Appearance Standards',
   'Staff uniform requirements, grooming standards, and approved accessories.',
   'dc000001-0000-0000-0000-000000000003', 'brand_standard', '2.1', 'active', false, 'HQ',
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('do000001-0000-0000-0000-00000000000B',
   'Store Design & Signage Standards',
   'Interior layout requirements, approved signage specifications, and décor guidelines.',
   'dc000001-0000-0000-0000-000000000003', 'brand_standard', '3.5', 'active', false, 'HQ',
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('do000001-0000-0000-0000-00000000000C',
   'Social Media & Marketing Guidelines',
   'Approved messaging, hashtags, posting schedule, and content rules for franchise-owned accounts.',
   'dc000001-0000-0000-0000-000000000003', 'brand_standard', '1.4', 'active', false, 'HQ',
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days');

-- Policies
INSERT INTO documents (id, title, description, category_id, doc_type, version, status, requires_acknowledgment, created_by, created_at, updated_at) VALUES
  ('do000001-0000-0000-0000-00000000000D',
   'Food Safety Compliance Policy v2.3',
   'Mandatory food safety compliance requirements updated May 2026. All locations must acknowledge.',
   'dc000001-0000-0000-0000-000000000002', 'policy', '2.3', 'active', true, 'HQ',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('do000001-0000-0000-0000-00000000000E',
   'Employee Code of Conduct',
   'Workplace behavior, disciplinary procedures, and franchise employee expectations.',
   'dc000001-0000-0000-0000-000000000004', 'policy', '1.6', 'active', true, 'HQ',
   NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days'),
  ('do000001-0000-0000-0000-00000000000F',
   'Franchise Operations Agreement',
   'Core franchise operations requirements, royalty schedule, and compliance obligations.',
   'dc000001-0000-0000-0000-000000000001', 'policy', '5.0', 'active', true, 'HQ',
   NOW() - INTERVAL '365 days', NOW() - INTERVAL '90 days'),
  ('do000001-0000-0000-0000-000000000010',
   'Health & Safety Policy',
   'Workplace health and safety requirements, incident reporting, and OSHA compliance.',
   'dc000001-0000-0000-0000-000000000005', 'policy', '2.0', 'active', true, 'HQ',
   NOW() - INTERVAL '180 days', NOW() - INTERVAL '30 days');

-- Policy acknowledgments
INSERT INTO policy_acknowledgments (document_id, location_id, acknowledged_by, acknowledged_at) VALUES
  ('do000001-0000-0000-0000-00000000000E', 'a0000000-0000-0000-0000-000000000001', 'Downtown Manager', NOW() - INTERVAL '25 days'),
  ('do000001-0000-0000-0000-00000000000E', 'a0000000-0000-0000-0000-000000000002', 'Buckhead Manager', NOW() - INTERVAL '24 days'),
  ('do000001-0000-0000-0000-00000000000E', 'a0000000-0000-0000-0000-000000000003', 'Midtown Manager', NOW() - INTERVAL '23 days'),
  ('do000001-0000-0000-0000-00000000000E', 'a0000000-0000-0000-0000-000000000005', 'Marietta Manager', NOW() - INTERVAL '22 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000001', 'Downtown Manager', NOW() - INTERVAL '80 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000002', 'Buckhead Manager', NOW() - INTERVAL '79 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000003', 'Midtown Manager', NOW() - INTERVAL '78 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000004', 'Decatur Manager', NOW() - INTERVAL '77 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000005', 'Marietta Manager', NOW() - INTERVAL '76 days'),
  ('do000001-0000-0000-0000-00000000000F', 'a0000000-0000-0000-0000-000000000006', 'Smyrna Manager', NOW() - INTERVAL '75 days'),
  ('do000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Downtown Manager', NOW() - INTERVAL '20 days'),
  ('do000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Buckhead Manager', NOW() - INTERVAL '19 days'),
  ('do000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'Decatur Manager', NOW() - INTERVAL '18 days'),
  ('do000001-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006', 'Smyrna Manager', NOW() - INTERVAL '17 days');
