-- FLOWS TABLE — Automation flows monitor
-- Each flow belongs to a company, type: internal | client

CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internal', 'client')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'error')),
  metrics JSONB DEFAULT '{}',
  execution_history INTEGER[] DEFAULT '{}',
  last_run_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

-- Company-scoped isolation: users see only their company's flows
CREATE POLICY "flows_company_isolation" ON flows
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Seed data: 3 internal + 2 client flows for company "Miguel Hub"
-- Replace company_id if different from your setup
INSERT INTO flows (company_id, name, type, status, metrics, execution_history, last_run_at) VALUES
  (
    (SELECT id FROM companies LIMIT 1),
    'Lead Scoring Engine',
    'internal',
    'active',
    '{"execucoes": 1284, "taxa_sucesso": 98, "leads_processados": 412}',
    '{210, 245, 198, 267, 289, 312, 284}',
    NOW() - INTERVAL '2 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'Pipeline Stage Sync',
    'internal',
    'active',
    '{"execucoes": 876, "taxa_sucesso": 100, "leads_processados": 203}',
    '{120, 134, 98, 145, 167, 189, 156}',
    NOW() - INTERVAL '8 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'AI Briefing Generator',
    'internal',
    'paused',
    '{"execucoes": 543, "taxa_sucesso": 94, "leads_processados": 89}',
    '{67, 72, 45, 0, 0, 0, 0}',
    NOW() - INTERVAL '3 hours'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'NovaTech — Onboarding Sequence',
    'client',
    'active',
    '{"execucoes": 234, "taxa_sucesso": 97, "leads_processados": 78}',
    '{28, 35, 42, 31, 48, 39, 44}',
    NOW() - INTERVAL '15 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'CapitalGroup — Follow-up Drip',
    'client',
    'error',
    '{"execucoes": 89, "taxa_sucesso": 61, "leads_processados": 12}',
    '{18, 22, 14, 8, 3, 1, 0}',
    NOW() - INTERVAL '2 hours'
  );
