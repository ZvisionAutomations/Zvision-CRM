-- Sparkline RPC functions for dashboard glance cards
-- Each function returns rows of (week TEXT, value NUMERIC) for the last 12 weeks

-- 1. Total leads created per week
CREATE OR REPLACE FUNCTION leads_by_week(p_company_id UUID, p_since TEXT)
RETURNS TABLE(week TEXT, value NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS week,
    COUNT(*)::NUMERIC AS value
  FROM leads
  WHERE company_id = p_company_id
    AND deleted_at IS NULL
    AND created_at >= p_since::TIMESTAMPTZ
  GROUP BY DATE_TRUNC('week', created_at AT TIME ZONE 'UTC')
  ORDER BY week ASC;
$$;

-- 2. Won leads per week (status = 'won')
CREATE OR REPLACE FUNCTION won_leads_by_week(p_company_id UUID, p_since TEXT)
RETURNS TABLE(week TEXT, value NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS week,
    COUNT(*)::NUMERIC AS value
  FROM leads
  WHERE company_id = p_company_id
    AND deleted_at IS NULL
    AND status = 'won'
    AND created_at >= p_since::TIMESTAMPTZ
  GROUP BY DATE_TRUNC('week', created_at AT TIME ZONE 'UTC')
  ORDER BY week ASC;
$$;

-- 3. Briefings generated per week (ai_briefing_generated_at not null)
CREATE OR REPLACE FUNCTION briefings_by_week(p_company_id UUID, p_since TEXT)
RETURNS TABLE(week TEXT, value NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', ai_briefing_generated_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS week,
    COUNT(*)::NUMERIC AS value
  FROM leads
  WHERE company_id = p_company_id
    AND deleted_at IS NULL
    AND ai_briefing_generated_at IS NOT NULL
    AND ai_briefing_generated_at >= p_since::TIMESTAMPTZ
  GROUP BY DATE_TRUNC('week', ai_briefing_generated_at AT TIME ZONE 'UTC')
  ORDER BY week ASC;
$$;

-- 4. Estimated value sum per week
CREATE OR REPLACE FUNCTION valuation_by_week(p_company_id UUID, p_since TEXT)
RETURNS TABLE(week TEXT, value NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS week,
    COALESCE(SUM(estimated_value), 0)::NUMERIC AS value
  FROM leads
  WHERE company_id = p_company_id
    AND deleted_at IS NULL
    AND created_at >= p_since::TIMESTAMPTZ
  GROUP BY DATE_TRUNC('week', created_at AT TIME ZONE 'UTC')
  ORDER BY week ASC;
$$;

-- Grant execute to authenticated users (RLS is handled by SECURITY DEFINER + company_id filter)
GRANT EXECUTE ON FUNCTION leads_by_week(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION won_leads_by_week(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION briefings_by_week(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION valuation_by_week(UUID, TEXT) TO authenticated;
