'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { Flow, FlowStatus } from '@/types/database'

// Admin client bypasses RLS — used for initial data fetch
// (mirrors the pattern from leads.ts)
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

export async function getFlows(): Promise<{ flows: Flow[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('flows')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            // Table doesn't exist yet — return empty gracefully
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { flows: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { flows: (data ?? []) as Flow[], error: null }
    } catch (err) {
        console.error('[getFlows] Falha:', err)
        return { flows: [], error: 'Falha ao buscar fluxos' }
    }
}

export async function updateFlowStatus(
    id: string,
    status: FlowStatus
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { error } = await supabase
            .from('flows')
            .update({ status })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/flows')
        return { success: true, error: null }
    } catch (err) {
        console.error('[updateFlowStatus] Falha:', err)
        return { success: false, error: 'Falha ao atualizar status' }
    }
}
