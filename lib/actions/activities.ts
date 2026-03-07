'use server'

import { createClient } from '@/lib/supabase/server'
import type { Activity, ActivityType } from '@/src/types/database'

async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')
    const { data: profile } = await supabase
        .from('users').select('company_id').eq('id', user.id).single()
    if (!profile) throw new Error('Perfil não encontrado')
    return { supabase, user, company_id: profile.company_id }
}

export async function getActivitiesByLead(leadId: string) {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('activities')
            .select('*, user:users(id, name, avatar_url)')
            .eq('lead_id', leadId)
            .eq('company_id', company_id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        return data as Activity[]
    } catch (error) {
        console.error('[getActivitiesByLead] Falha:', { leadId, error })
        throw new Error('Falha ao buscar atividades')
    }
}

export async function createActivity(
    leadId: string,
    type: ActivityType,
    title: string,
    description?: string,
    metadata?: Record<string, unknown>
) {
    try {
        const { supabase, user, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('activities')
            .insert({
                lead_id: leadId, company_id, user_id: user.id,
                type, title, description, metadata
            })
            .select()
            .single()

        if (error) throw error
        return data as Activity
    } catch (error) {
        console.error('[createActivity] Falha:', { leadId, type, error })
        throw new Error('Falha ao registrar atividade')
    }
}
