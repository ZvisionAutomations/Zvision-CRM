'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { Flow, FlowStatus } from '@/types/database'

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

export async function getFlows(): Promise<{ flows: Flow[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('flows')
            .select('*')
            .eq('company_id', company_id)
            .order('created_at', { ascending: true })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { flows: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { flows: (data ?? []) as Flow[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { flows: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getFlows] Falha:', err)
        return { flows: [], error: 'Falha ao buscar fluxos' }
    }
}

export async function updateFlowStatus(
    id: string,
    status: FlowStatus
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { error } = await supabase
            .from('flows')
            .update({ status })
            .eq('id', id)
            .eq('company_id', company_id)

        if (error) throw error

        revalidatePath('/flows')
        return { success: true, error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { success: false, error: 'UNAUTHORIZED' }
        }
        console.error('[updateFlowStatus] Falha:', err)
        return { success: false, error: 'Falha ao atualizar status' }
    }
}
