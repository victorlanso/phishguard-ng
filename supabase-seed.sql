-- ============================================================
-- PhishGuard NG – Complete Database Schema + Seed Data
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'champion', 'admin', 'super_admin')),
  points INTEGER DEFAULT 0,
  last_tip_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- Content (tips & quizzes)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('tip', 'quiz')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'pcm')),
  title TEXT,
  body TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress on content
CREATE TABLE IF NOT EXISTS user_content_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER,
  UNIQUE(user_id, content_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source TEXT CHECK (source IN ('email', 'whatsapp', 'sms', 'other')),
  message_text TEXT,
  screenshot_url TEXT,
  suspected_type TEXT,
  note TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved', 'false_positive')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('email', 'whatsapp', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  landing_page_html TEXT,
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed')),
  scheduled_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign results
CREATE TABLE IF NOT EXISTS campaign_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  reported BOOLEAN DEFAULT false,
  submitted_data BOOLEAN DEFAULT false,
  interacted_at TIMESTAMPTZ,
  UNIQUE(campaign_id, user_id)
);

-- Points log
CREATE TABLE IF NOT EXISTS points_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_reports_org_id ON reports(org_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign ON campaign_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_points_log_user ON points_log(user_id);

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users policies
CREATE POLICY "Users can view same org"
  ON users FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Reports policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own reports or admins see all"
  ON reports FOR SELECT
  USING (
    user_id = auth.uid() OR
    (org_id = get_user_org_id() AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'champion', 'super_admin')
    ))
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    org_id = get_user_org_id() AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'champion', 'super_admin')
    )
  );

-- Content is readable by authenticated users
CREATE POLICY "Authenticated users can read content"
  ON content_items FOR SELECT
  TO authenticated
  USING (active = true);

-- Points
CREATE POLICY "Users can view own points"
  ON points_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own points"
  ON points_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Templates readable by authenticated
CREATE POLICY "Authenticated can read templates"
  ON templates FOR SELECT
  TO authenticated
  USING (active = true);

-- ------------------------------------------------------------
-- 4. STORAGE BUCKET (run in Supabase Dashboard → Storage)
-- ------------------------------------------------------------
-- Create a public bucket named: report-screenshots
-- Or run this if you have the storage schema available:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-screenshots', 'report-screenshots', true);

-- ------------------------------------------------------------
-- 5. SEED DATA
-- ------------------------------------------------------------

-- Demo organization
INSERT INTO organizations (id, name, slug, plan)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Demo Nigeria Ltd',
  'demo-nigeria',
  'starter'
) ON CONFLICT (slug) DO NOTHING;

-- Sample content (tips)
INSERT INTO content_items (type, language, title, body, tags) VALUES
('tip', 'en', 'WhatsApp “Boss” Scam',
 'If someone claiming to be your boss messages you on WhatsApp asking for an urgent transfer, call them on the number you already know. Never use the number inside the message.',
 ARRAY['whatsapp', 'bec', 'smishing']),

('tip', 'pcm', 'WhatsApp “Boss” Scam',
 'If person wey claim say e be your boss message you for WhatsApp ask for money transfer sharp sharp, call am for the number wey you sabi before you send anything. No use the number wey dey inside the message.',
 ARRAY['whatsapp', 'bec', 'smishing']),

('tip', 'en', 'Fake FIRS / Tax Message',
 'FIRS will never ask you to click a link and pay tax through a random website. Always go directly to the official FIRS portal yourself.',
 ARRAY['phishing', 'government']),

('tip', 'pcm', 'Fake FIRS / Tax Message',
 'FIRS no dey ask anybody make dem click link come pay tax for strange website. Always enter the official FIRS website by yourself.',
 ARRAY['phishing', 'government']),

('tip', 'en', 'Supplier Invoice BEC',
 'Before paying any new bank account details from a supplier, call the supplier on a known phone number to confirm. Email alone is not enough.',
 ARRAY['bec', 'finance']),

('tip', 'en', 'Fake Bank Alert',
 'Your bank will never ask for your OTP, PIN, or BVN through email or SMS. If you receive such a message, report it and delete it.',
 ARRAY['phishing', 'banking']);

-- Sample quiz
INSERT INTO content_items (type, language, title, body, options, correct_answer, tags) VALUES
('quiz', 'en', 'Urgent WhatsApp Transfer',
 'Your “MD” sends a WhatsApp message at 11:45pm asking you to transfer ₦1.2 million urgently to a new contractor. What should you do first?',
 '["Transfer immediately", "Reply and ask for more details", "Call the MD on the number you already have", "Ignore the message"]',
 'Call the MD on the number you already have',
 ARRAY['bec', 'whatsapp']);

-- Sample templates
INSERT INTO templates (name, channel, subject, body, difficulty, tags) VALUES
('Fake FIRS Tax Demand', 'email',
 'Urgent: Outstanding Tax Liability – Action Required',
 'Dear {{name}},

Our records show that you have an outstanding tax liability of ₦287,450.

Click the link below to view details and make payment to avoid penalties:
[Pay Now]

FIRS Compliance Unit',
 'medium', ARRAY['government', 'phishing']),

('CEO Fraud / BEC Payment', 'email',
 'Urgent Payment Request – Confidential',
 'Hi {{name}},

I’m in a meeting and need you to process an urgent payment of ₦1,850,000 to a new vendor today.

Account details:
Bank: Zenith Bank
Account Name: Global Supplies Ltd
Account Number: 1234567890

Please confirm once done.
Regards,
{{fake_ceo_name}}',
 'hard', ARRAY['bec', 'finance']),

('WhatsApp Boss Transfer Scam', 'whatsapp',
 NULL,
 'Good morning {{name}},

This is {{boss_name}}. I’m in a meeting and my phone is almost dead.

Please help me transfer ₦320,000 to this account urgently:

Bank: GTBank
Account: 0123456789
Name: James Okoro

Send me the receipt when done. Thanks.',
 'easy', ARRAY['whatsapp', 'bec']),

('Fake Bank Account Restriction', 'sms',
 NULL,
 'ALERT: Your account has been temporarily restricted due to unusual activity.

Click here to verify your identity and restore access: [link]

Ignore if this wasn’t you. – First Bank Security',
 'medium', ARRAY['banking', 'smishing']);

-- ------------------------------------------------------------
-- DONE
-- After running this:
-- 1. Create a user via Supabase Auth
-- 2. Insert a matching row into the users table with the correct org_id and role
-- 3. Create the "report-screenshots" storage bucket (public)
-- ------------------------------------------------------------
