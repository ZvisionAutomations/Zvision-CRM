-- ============================================================================
-- 009_campaigns.sql — Central de Anúncios (CA-2)
-- Creates campaigns table with funnel metrics and seed data
-- ============================================================================

-- ─── Table ──────────────────────────────────────────────────────────────────
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
    platform_subtype TEXT CHECK (platform_subtype IN (
        'feed', 'stories', 'reels', 'search', 'display', 'youtube'
    )),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'ended')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    budget DECIMAL(10,2),
    spend DECIMAL(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    qualified_leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    daily_spend INTEGER[] DEFAULT '{}',
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_company_isolation" ON campaigns
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- ─── Seed Data ──────────────────────────────────────────────────────────────
-- Uses the first company from companies table
DO $$
DECLARE
    _cid UUID;
BEGIN
    SELECT id INTO _cid FROM companies LIMIT 1;

    -- 1. Meta Ads — Feed SDR (active, high performer)
    INSERT INTO campaigns (
        company_id, name, platform, platform_subtype, status,
        utm_source, utm_medium, utm_campaign,
        budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue,
        daily_spend, period_start, period_end
    ) VALUES (
        _cid, 'SDR Prospecção Ativa — Feed', 'meta', 'feed', 'active',
        'meta', 'cpc', 'sdr-prospeccao-feed-mar26',
        8000.00, 6240.00, 184000, 5520, 276, 138, 41, 32800.00,
        ARRAY[180,195,210,220,215,205,198,225,230,210,195,190,200,215,225,235,220,210,205,198,215,225,230,220,215,210,205,218,225,230],
        '2026-03-01', '2026-03-31'
    );

    -- 2. Meta Ads — Stories Awareness (active, medium performer)
    INSERT INTO campaigns (
        company_id, name, platform, platform_subtype, status,
        utm_source, utm_medium, utm_campaign,
        budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue,
        daily_spend, period_start, period_end
    ) VALUES (
        _cid, 'Awareness Institucional — Stories', 'meta', 'stories', 'active',
        'meta', 'cpm', 'awareness-stories-mar26',
        5000.00, 3850.00, 320000, 6400, 128, 38, 9, 5400.00,
        ARRAY[120,125,130,128,135,140,132,125,128,130,135,138,142,130,128,125,130,132,128,125,130,135,128,130,125,128,132,130,128,125],
        '2026-03-01', '2026-03-31'
    );

    -- 3. Meta Ads — Reels Retargeting (paused, was burning money — ROAS < 1x)
    INSERT INTO campaigns (
        company_id, name, platform, platform_subtype, status,
        utm_source, utm_medium, utm_campaign,
        budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue,
        daily_spend, period_start, period_end
    ) VALUES (
        _cid, 'Retargeting Visitantes — Reels', 'meta', 'reels', 'paused',
        'meta', 'cpc', 'retargeting-reels-fev26',
        4000.00, 3600.00, 95000, 1900, 38, 8, 2, 1600.00,
        ARRAY[150,155,160,148,145,140,135,130,125,120,115,110,108,105,100,95,90,88,85,80,0,0,0,0,0,0,0,0,0,0],
        '2026-02-01', '2026-02-28'
    );

    -- 4. Google Ads — Search Branded (active, best ROAS)
    INSERT INTO campaigns (
        company_id, name, platform, platform_subtype, status,
        utm_source, utm_medium, utm_campaign,
        budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue,
        daily_spend, period_start, period_end
    ) VALUES (
        _cid, 'Busca Marca — Search Branded', 'google', 'search', 'active',
        'google', 'cpc', 'search-branded-mar26',
        3000.00, 2180.00, 42000, 3360, 201, 121, 36, 28800.00,
        ARRAY[70,72,75,78,72,68,70,74,76,72,70,68,72,75,78,80,76,74,72,70,74,76,72,70,68,72,75,74,72,70],
        '2026-03-01', '2026-03-31'
    );

    -- 5. Google Ads — Display Prospecting (ended, completed campaign)
    INSERT INTO campaigns (
        company_id, name, platform, platform_subtype, status,
        utm_source, utm_medium, utm_campaign,
        budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue,
        daily_spend, period_start, period_end
    ) VALUES (
        _cid, 'Prospecção Display — GDN', 'google', 'display', 'ended',
        'google', 'cpm', 'display-prospeccao-fev26',
        6000.00, 5800.00, 580000, 4640, 93, 28, 7, 5600.00,
        ARRAY[190,195,200,198,195,192,188,195,200,198,196,194,192,190,195,198,200,196,194,192,195,198,196,194,192,190,195,198,196,194],
        '2026-02-01', '2026-02-28'
    );

END $$;
