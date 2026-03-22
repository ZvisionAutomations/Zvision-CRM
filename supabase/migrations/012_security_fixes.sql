-- Migration 012: Security hardening — RLS policies
-- Fixes: companies table missing policy, all tables missing WITH CHECK clauses
-- Uses get_auth_company_id() SECURITY DEFINER function (created in 004)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. COMPANIES TABLE — RLS enabled but NO policy existed
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "companies_self_read" ON companies
  FOR SELECT
  USING (id = public.get_auth_company_id());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. UPGRADE POLICIES — Add WITH CHECK for write protection
--    Tables from 004 (leads, activities, imports) already have USING via
--    get_auth_company_id(). We DROP + recreate to add WITH CHECK.
-- ═══════════════════════════════════════════════════════════════════════════════

-- leads
DROP POLICY IF EXISTS "leads_company_isolation" ON leads;
CREATE POLICY "leads_company_isolation" ON leads
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- activities
DROP POLICY IF EXISTS "activities_company_isolation" ON activities;
CREATE POLICY "activities_company_isolation" ON activities
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- imports
DROP POLICY IF EXISTS "imports_company_isolation" ON imports;
CREATE POLICY "imports_company_isolation" ON imports
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. UPGRADE POLICIES — Tables from 005-009 (still using subquery pattern)
--    Migrate to get_auth_company_id() + add WITH CHECK
-- ═══════════════════════════════════════════════════════════════════════════════

-- api_keys
DROP POLICY IF EXISTS "api_keys_company_isolation" ON api_keys;
CREATE POLICY "api_keys_company_isolation" ON api_keys
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- flows
DROP POLICY IF EXISTS "flows_company_isolation" ON flows;
CREATE POLICY "flows_company_isolation" ON flows
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- agents
DROP POLICY IF EXISTS "agents_company_isolation" ON agents;
CREATE POLICY "agents_company_isolation" ON agents
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- expenses
DROP POLICY IF EXISTS "expenses_company_isolation" ON expenses;
CREATE POLICY "expenses_company_isolation" ON expenses
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- subscriptions
DROP POLICY IF EXISTS "subscriptions_company_isolation" ON subscriptions;
CREATE POLICY "subscriptions_company_isolation" ON subscriptions
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- campaigns
DROP POLICY IF EXISTS "campaigns_company_isolation" ON campaigns;
CREATE POLICY "campaigns_company_isolation" ON campaigns
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. RATE LIMITS TABLE — serverless-safe rate limiting via Supabase
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limits_lookup
  ON rate_limits(identifier, action, created_at);

-- No RLS needed — accessed only via service role (admin client)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
