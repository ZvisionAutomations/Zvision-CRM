'use server'

import { createServerClient } from '@supabase/ssr'
import type { Campaign } from '@/types/database'

// Admin client bypasses RLS — mirrors budget.ts / flows.ts pattern
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

// TODO: Replace mock data with Meta Marketing API
// GET https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/campaigns

// TODO: Replace mock data with Google Ads API
// GET https://googleads.googleapis.com/v14/customers/{CUSTOMER_ID}/googleAds:search

// Fetch all campaigns
export async function getCampaigns(): Promise<{ campaigns: Campaign[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('status', { ascending: true })
            .order('spend', { ascending: false })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { campaigns: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { campaigns: (data ?? []) as Campaign[], error: null }
    } catch (err) {
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
        const supabase = getAdminClient()
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'

        const { error } = await supabase
            .from('campaigns')
            .update({ status: newStatus })
            .eq('id', campaignId)

        if (error) throw error

        return { success: true, error: null }
    } catch (err) {
        console.error('[toggleCampaignStatus] Falha:', err)
        return { success: false, error: 'Falha ao alterar status' }
    }
}
