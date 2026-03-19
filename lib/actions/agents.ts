'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { Agent, AgentStatus } from '@/types/database'

// Admin client bypasses RLS — mirrors pattern from flows.ts
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

export async function getAgents(): Promise<{ agents: Agent[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            // Table doesn't exist yet — return empty gracefully
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { agents: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { agents: (data ?? []) as Agent[], error: null }
    } catch (err) {
        console.error('[getAgents] Falha:', err)
        return { agents: [], error: 'Falha ao buscar agentes' }
    }
}

export async function updateAgentStatus(
    id: string,
    status: AgentStatus
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { error } = await supabase
            .from('agents')
            .update({ status, last_active_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/flows')
        return { success: true, error: null }
    } catch (err) {
        console.error('[updateAgentStatus] Falha:', err)
        return { success: false, error: 'Falha ao atualizar status do agente' }
    }
}
