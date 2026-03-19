-- AGENTS TABLE — Agent Command Center (CA-4)
-- Each agent belongs to a company, typed by role and platform

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'sdr', 'atendente', 'qualificador', 'whatsapp', 'n8n'
  )),
  platform TEXT NOT NULL DEFAULT 'interno'
    CHECK (platform IN ('interno', 'whatsapp', 'n8n')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'error')),
  client_name TEXT,
  is_internal BOOLEAN DEFAULT true,
  metrics JSONB DEFAULT '{}',
  activity_history INTEGER[] DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Company-scoped isolation: users see only their company's agents
CREATE POLICY "agents_company_isolation" ON agents
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Seed data: 3 internal + 4 client agents (2 per client)
INSERT INTO agents (company_id, name, type, platform, status, client_name, is_internal, metrics, activity_history, last_active_at) VALUES
  -- Internal agents
  (
    (SELECT id FROM companies LIMIT 1),
    'Agente SDR Alpha',
    'sdr',
    'interno',
    'active',
    NULL,
    true,
    '{"mensagens": 1847, "taxa_resposta": 94, "leads_qualificados": 312}',
    '{245, 267, 289, 312, 298, 334, 321}',
    NOW() - INTERVAL '3 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'Atendente Central',
    'atendente',
    'whatsapp',
    'active',
    NULL,
    true,
    '{"mensagens": 3421, "taxa_resposta": 98}',
    '{410, 445, 398, 467, 489, 512, 484}',
    NOW() - INTERVAL '1 minute'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'Qualificador Beta',
    'qualificador',
    'interno',
    'paused',
    NULL,
    true,
    '{"mensagens": 876, "taxa_resposta": 87, "leads_qualificados": 156}',
    '{120, 134, 98, 45, 0, 0, 0}',
    NOW() - INTERVAL '4 hours'
  ),
  -- Client agents — TechCorp Brasil
  (
    (SELECT id FROM companies LIMIT 1),
    'Bot Vendas TechCorp',
    'sdr',
    'whatsapp',
    'active',
    'TechCorp Brasil',
    false,
    '{"mensagens": 2134, "taxa_resposta": 91, "leads_qualificados": 189}',
    '{198, 212, 234, 256, 278, 245, 267}',
    NOW() - INTERVAL '7 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'Suporte TechCorp',
    'atendente',
    'whatsapp',
    'error',
    'TechCorp Brasil',
    false,
    '{"mensagens": 567, "taxa_resposta": 34}',
    '{89, 67, 45, 23, 12, 3, 0}',
    NOW() - INTERVAL '2 hours'
  ),
  -- Client agents — Grupo Meridian
  (
    (SELECT id FROM companies LIMIT 1),
    'SDR Meridian Prime',
    'sdr',
    'interno',
    'active',
    'Grupo Meridian',
    false,
    '{"mensagens": 1456, "taxa_resposta": 96, "leads_qualificados": 234}',
    '{178, 189, 201, 234, 256, 223, 245}',
    NOW() - INTERVAL '12 minutes'
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    'Qualificador Meridian',
    'qualificador',
    'interno',
    'active',
    'Grupo Meridian',
    false,
    '{"mensagens": 923, "taxa_resposta": 89, "leads_qualificados": 167}',
    '{98, 112, 134, 156, 178, 145, 167}',
    NOW() - INTERVAL '25 minutes'
  );
