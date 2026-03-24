-- Migration 013_performance_indexes.sql

-- leads: most queried columns
CREATE INDEX IF NOT EXISTS idx_leads_created_at
  ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_company_deleted
  ON leads(company_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_leads_company_assigned
  ON leads(company_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_leads_company_stage
  ON leads(company_id, pipeline_stage);

-- activities: compound filter
CREATE INDEX IF NOT EXISTS idx_activities_lead_company
  ON activities(lead_id, company_id);

-- financial tables
CREATE INDEX IF NOT EXISTS idx_expenses_company_month
  ON expenses(company_id, month);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company
  ON subscriptions(company_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_company
  ON campaigns(company_id);
