'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import type { Campaign } from '@/types/database'

// Admin client — used ONLY for initial profile lookup (RLS recursion bypass)
function getAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )
}

async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('UNAUTHORIZED')

    const supabaseAdmin = getAdminClient()
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) throw new Error('COMPANY_NOT_FOUND')

    return { supabase, user, company_id: profile.company_id as string }
}

// TODO: Replace mock data with Meta Marketing API
// GET https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/campaigns

// TODO: Replace mock data with Google Ads API
// GET https://googleads.googleapis.com/v14/customers/{CUSTOMER_ID}/googleAds:search

// Fetch all campaigns for the authenticated user's company
export async function getCampaigns(): Promise<{ campaigns: Campaign[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('campaigns')
            .select('id, company_id, name, platform, platform_subtype, status, utm_source, utm_medium, utm_campaign, budget, spend, impressions, clicks, leads, qualified_leads, conversions, revenue, daily_spend, period_start, period_end, created_at')
            .eq('company_id', company_id)
            .order('status', { ascending: true })
            .order('spend', { ascending: false })
            .limit(100)

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { campaigns: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { campaigns: (data ?? []) as Campaign[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { campaigns: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getCampaigns] Falha:', err)
        return { campaigns: [], error: 'Falha ao buscar campanhas' }
    }
}

// Toggle campaign status (active ↔ paused)
export async function toggleCampaignStatus(
    campaignId: string,
    currentStatus: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'

        const { error } = await supabase
            .from('campaigns')
            .update({ status: newStatus })
            .eq('id', campaignId)
            .eq('company_id', company_id)

        if (error) throw error

        return { success: true, error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { success: false, error: 'UNAUTHORIZED' }
        }
        console.error('[toggleCampaignStatus] Falha:', err)
        return { success: false, error: 'Falha ao alterar status' }
    }
}
