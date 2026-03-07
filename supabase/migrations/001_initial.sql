-- COMPANIES
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'operator',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_company_isolation" ON users
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_linkedin TEXT,
  estimated_value DECIMAL(12,2),
  pipeline_stage TEXT DEFAULT 'NOVO_LEAD',
  signal_strength TEXT DEFAULT 'MEDIO',
  win_probability DECIMAL(5,2) DEFAULT 0,
  ai_briefing TEXT,
  ai_briefing_generated_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_company_isolation" ON leads
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX idx_leads_deleted ON leads(deleted_at);

-- ACTIVITIES
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_company_isolation" ON activities
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));
CREATE INDEX idx_activities_lead_id ON activities(lead_id);

-- IMPORTS
CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  status TEXT DEFAULT 'PROCESSING',
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imports_company_isolation" ON imports
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- FUNÇÃO: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
