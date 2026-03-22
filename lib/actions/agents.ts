'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { Agent, AgentStatus } from '@/types/database'

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

export async function getAgents(): Promise<{ agents: Agent[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('company_id', company_id)
            .order('created_at', { ascending: true })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { agents: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { agents: (data ?? []) as Agent[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { agents: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getAgents] Falha:', err)
        return { agents: [], error: 'Falha ao buscar agentes' }
    }
}

export async function updateAgentStatus(
    id: string,
    status: AgentStatus
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { error } = await supabase
            .from('agents')
            .update({ status, last_active_at: new Date().toISOString() })
            .eq('id', id)
            .eq('company_id', company_id)

        if (error) throw error

        revalidatePath('/flows')
        return { success: true, error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { success: false, error: 'UNAUTHORIZED' }
        }
        console.error('[updateAgentStatus] Falha:', err)
        return { success: false, error: 'Falha ao atualizar status do agente' }
    }
}
