-- FINANCIAL TABLES — Expenses + Subscriptions for Financial Command Center (CA-3)

-- ─── EXPENSES TABLE ──────────────────────────────────────────────────────────

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'ferramenta', 'operacao', 'pessoal', 'marketing'
  )),
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_company_isolation" ON expenses
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- ─── SUBSCRIPTIONS TABLE ─────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('mensal', 'anual')),
  category TEXT NOT NULL CHECK (category IN ('ia', 'infra', 'marketing', 'vendas')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled')),
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_company_isolation" ON subscriptions
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- ─── SEED: EXPENSES (6 months Oct 2025 – Mar 2026, growing trend) ───────────

INSERT INTO expenses (company_id, name, amount, category, month) VALUES
  -- Outubro 2025
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       890.00,  'ferramenta', '2025-10-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1200.00, 'ferramenta', '2025-10-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         2500.00, 'pessoal',    '2025-10-01'),
  ((SELECT id FROM companies LIMIT 1), 'Google Ads',             1800.00, 'marketing',  '2025-10-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   750.00,  'operacao',   '2025-10-01'),
  -- Novembro 2025
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       890.00,  'ferramenta', '2025-11-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1350.00, 'ferramenta', '2025-11-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         2800.00, 'pessoal',    '2025-11-01'),
  ((SELECT id FROM companies LIMIT 1), 'Google Ads',             2100.00, 'marketing',  '2025-11-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   750.00,  'operacao',   '2025-11-01'),
  ((SELECT id FROM companies LIMIT 1), 'Material de Escritório', 320.00,  'operacao',   '2025-11-01'),
  -- Dezembro 2025
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       950.00,  'ferramenta', '2025-12-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1350.00, 'ferramenta', '2025-12-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         3200.00, 'pessoal',    '2025-12-01'),
  ((SELECT id FROM companies LIMIT 1), 'Meta Ads',               2400.00, 'marketing',  '2025-12-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   750.00,  'operacao',   '2025-12-01'),
  ((SELECT id FROM companies LIMIT 1), 'Confraternização',       1100.00, 'pessoal',    '2025-12-01'),
  -- Janeiro 2026
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       950.00,  'ferramenta', '2026-01-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1500.00, 'ferramenta', '2026-01-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         3500.00, 'pessoal',    '2026-01-01'),
  ((SELECT id FROM companies LIMIT 1), 'Google Ads',             2600.00, 'marketing',  '2026-01-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   850.00,  'operacao',   '2026-01-01'),
  ((SELECT id FROM companies LIMIT 1), 'Treinamento Equipe',     900.00,  'pessoal',    '2026-01-01'),
  -- Fevereiro 2026
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       1050.00, 'ferramenta', '2026-02-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1500.00, 'ferramenta', '2026-02-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         3800.00, 'pessoal',    '2026-02-01'),
  ((SELECT id FROM companies LIMIT 1), 'Meta Ads',               3000.00, 'marketing',  '2026-02-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   850.00,  'operacao',   '2026-02-01'),
  ((SELECT id FROM companies LIMIT 1), 'Consultoria Jurídica',   1200.00, 'operacao',   '2026-02-01'),
  -- Março 2026
  ((SELECT id FROM companies LIMIT 1), 'Hospedagem Cloud',       1100.00, 'ferramenta', '2026-03-01'),
  ((SELECT id FROM companies LIMIT 1), 'Licenças Software',      1650.00, 'ferramenta', '2026-03-01'),
  ((SELECT id FROM companies LIMIT 1), 'Freelancer Dev',         4000.00, 'pessoal',    '2026-03-01'),
  ((SELECT id FROM companies LIMIT 1), 'Google Ads',             3200.00, 'marketing',  '2026-03-01'),
  ((SELECT id FROM companies LIMIT 1), 'Meta Ads',               1800.00, 'marketing',  '2026-03-01'),
  ((SELECT id FROM companies LIMIT 1), 'Escritório Coworking',   950.00,  'operacao',   '2026-03-01');

-- ─── SEED: SUBSCRIPTIONS ────────────────────────────────────────────────────

INSERT INTO subscriptions (company_id, name, amount, billing_cycle, category, status, next_billing_date) VALUES
  ((SELECT id FROM companies LIMIT 1), 'Claude API',            150.00, 'mensal', 'ia',        'active',    '2026-04-05'),
  ((SELECT id FROM companies LIMIT 1), 'Gemini API',            89.00,  'mensal', 'ia',        'active',    '2026-04-10'),
  ((SELECT id FROM companies LIMIT 1), 'Supabase',              125.00, 'mensal', 'infra',     'active',    '2026-04-01'),
  ((SELECT id FROM companies LIMIT 1), 'Vercel',                99.00,  'mensal', 'infra',     'active',    '2026-04-15'),
  ((SELECT id FROM companies LIMIT 1), 'N8N',                   79.00,  'mensal', 'infra',     'active',    '2026-04-08'),
  ((SELECT id FROM companies LIMIT 1), 'WhatsApp Business',     299.00, 'mensal', 'marketing', 'active',    '2026-04-01'),
  ((SELECT id FROM companies LIMIT 1), 'Google Ads Tools',      199.00, 'mensal', 'marketing', 'active',    '2026-04-12'),
  ((SELECT id FROM companies LIMIT 1), 'Notion',                45.00,  'mensal', 'vendas',    'cancelled', NULL);
