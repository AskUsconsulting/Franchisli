-- ─── Communication ────────────────────────────────────────────────────────────

-- HQ announcements (all-network or location-specific)
CREATE TABLE IF NOT EXISTS announcements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  body             TEXT NOT NULL,
  author           TEXT NOT NULL DEFAULT 'HQ',
  target_type      TEXT NOT NULL DEFAULT 'all',       -- 'all' | 'specific'
  target_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  priority         TEXT NOT NULL DEFAULT 'normal',    -- 'normal' | 'urgent'
  is_pinned        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id  UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  location_id      UUID REFERENCES locations(id) ON DELETE CASCADE,
  read_by          TEXT NOT NULL,
  read_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, location_id)
);

-- Threaded HQ ↔ location messages
CREATE TABLE IF NOT EXISTS message_threads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          TEXT NOT NULL,
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thread_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id        UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender           TEXT NOT NULL,
  body             TEXT NOT NULL,
  is_hq            BOOLEAN NOT NULL DEFAULT true,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bulletin board / newsfeed
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author           TEXT NOT NULL,
  title            TEXT,
  body             TEXT NOT NULL,
  post_type        TEXT NOT NULL DEFAULT 'news',      -- 'news' | 'alert' | 'celebration' | 'reminder'
  location_id      UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_posts      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_announcements"      ON announcements       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ann_reads"          ON announcement_reads  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_threads"            ON message_threads     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_thread_messages"    ON thread_messages     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_bulletin_posts"     ON bulletin_posts      FOR ALL USING (true) WITH CHECK (true);

-- ── Seed data ──────────────────────────────────────────────────────────────────

INSERT INTO announcements (id, title, body, author, target_type, target_location_id, priority, is_pinned, created_at) VALUES
  ('b8000001-0000-0000-0000-000000000001', 'New Summer Menu Launch — June 15',
   'All locations must update menu boards and POS by June 15. New items include the Peach Lemonade Freeze and the Summer BBQ Wrap. Training materials are in the SOP library.',
   'HQ', 'all', NULL, 'urgent', true,
   NOW() - INTERVAL '2 days'),
  ('b8000001-0000-0000-0000-000000000002', 'Updated Food Safety Policy v2.3',
   'The revised Food Safety Policy (v2.3) is now live in the Documents library. All locations must complete acknowledgment by June 5. Key changes: temperature logging frequency increased to every 2 hours.',
   'HQ', 'all', NULL, 'urgent', false,
   NOW() - INTERVAL '4 days'),
  ('b8000001-0000-0000-0000-000000000003', 'Q2 Audit Schedule Released',
   'Q2 surprise audits will begin June 1. Locations will be notified 24 hours before. Review the inspection checklist in the SOP library to ensure readiness.',
   'HQ', 'all', NULL, 'normal', false,
   NOW() - INTERVAL '6 days'),
  ('b8000001-0000-0000-0000-000000000004', 'Action Required: Decatur Compliance Issues',
   'Following the May 15 surprise audit at Decatur, immediate corrective action is required for 2 critical findings. Please review the Findings tab in Audits and submit resolution plans by May 30.',
   'HQ', 'specific', 'a0000000-0000-0000-0000-000000000004', 'urgent', false,
   NOW() - INTERVAL '13 days');

INSERT INTO announcement_reads (announcement_id, location_id, read_by, read_at) VALUES
  ('b8000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Downtown Manager', NOW() - INTERVAL '1 day'),
  ('b8000001-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Buckhead Manager', NOW() - INTERVAL '1 day'),
  ('b8000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Downtown Manager', NOW() - INTERVAL '3 days'),
  ('b8000001-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Midtown Manager', NOW() - INTERVAL '3 days'),
  ('b8000001-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Decatur Manager', NOW() - INTERVAL '12 days');

INSERT INTO message_threads (id, subject, location_id, last_message_at, created_at) VALUES
  ('b9000001-0000-0000-0000-000000000001', 'Critical Findings — Immediate Action Required',
   'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '8 days', NOW() - INTERVAL '13 days'),
  ('b9000001-0000-0000-0000-000000000002', 'Summer Menu Prep Questions',
   'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  ('b9000001-0000-0000-0000-000000000003', 'Equipment Maintenance Request — Fryer',
   'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days');

INSERT INTO thread_messages (thread_id, sender, body, is_hq, read_at, created_at) VALUES
  ('b9000001-0000-0000-0000-000000000001', 'HQ', 'Hi Decatur team, we''ve reviewed the audit findings and need immediate corrective action on the two critical failures. Please submit your action plan by May 22.', true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '13 days'),
  ('b9000001-0000-0000-0000-000000000001', 'Decatur Manager', 'Understood. We''ve already restocked the handwashing stations and ordered new temperature log sheets. Will submit full plan tomorrow.', false, NULL, NOW() - INTERVAL '12 days'),
  ('b9000001-0000-0000-0000-000000000001', 'HQ', 'Thanks for the quick response. Please also schedule a deep clean for the kitchen equipment by end of week.', true, NULL, NOW() - INTERVAL '8 days'),
  ('b9000001-0000-0000-0000-000000000002', 'HQ', 'Hey Buckhead, wanted to check in on your summer menu prep. Do you have enough stock ordered for the new items?', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  ('b9000001-0000-0000-0000-000000000002', 'Buckhead Manager', 'We''ve got everything except the peach syrup — vendor says it''s backordered until June 10. Can we substitute lemonade items until then?', false, NULL, NOW() - INTERVAL '1 day'),
  ('b9000001-0000-0000-0000-000000000003', 'Marietta Manager', 'Hi HQ, our #2 fryer has been running hot and we think it needs servicing before summer rush. Can we get a maintenance tech out this week?', false, NULL, NOW() - INTERVAL '5 days'),
  ('b9000001-0000-0000-0000-000000000003', 'HQ', 'On it. I''ve contacted our service partner — they can be there Thursday morning. Please have the fryer cool and accessible by 9am.', true, NULL, NOW() - INTERVAL '3 days');

INSERT INTO bulletin_posts (author, title, body, post_type, location_id, created_at) VALUES
  ('HQ', 'June All-Hands Meeting — June 3 at 2pm', 'All managers are invited to join the virtual all-hands meeting on June 3 at 2:00pm ET. Agenda: Q2 results, summer prep, and team recognition. Zoom link will be emailed Monday.', 'news', NULL, NOW() - INTERVAL '1 day'),
  ('HQ', 'Urgent: Price Update Effective June 1', 'Per the updated franchise pricing schedule, all combo prices increase by $0.25 starting June 1. Please update your POS systems by May 31 EOD. Contact support if you need help.', 'alert', NULL, NOW() - INTERVAL '2 days'),
  ('Marki', '🎉 Downtown Atlanta hits 97% — Outstanding!', 'Congratulations to the Downtown Atlanta team for scoring 97% on their May audit — a new network high! Great work from the whole team.', 'celebration', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days'),
  ('HQ', 'Reminder: Q1 Inventory Counts Due', 'All locations must submit Q1 inventory count reports by May 31. Use the form in the Operations tab. Late submissions will affect your compliance score.', 'reminder', NULL, NOW() - INTERVAL '9 days'),
  ('Third', 'Marietta Expansion — Coming Fall 2026', 'Excited to share that we are planning a second Marietta location for Fall 2026. More details at the June all-hands. Great things ahead!', 'news', NULL, NOW() - INTERVAL '11 days'),
  ('HQ', 'New Hire Orientation Materials Updated', 'The new hire packet in the Documents library has been updated with the latest brand standards and safety protocols. Please use these for all new staff starting June 1.', 'news', NULL, NOW() - INTERVAL '14 days');
