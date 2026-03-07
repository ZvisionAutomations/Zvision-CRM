'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Lead, PipelineStage } from '@/src/types/database'

// Helper: busca company_id do usuário autenticado
async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Não autorizado')

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) throw new Error('Perfil não encontrado')

    return { supabase, user, company_id: profile.company_id, role: profile.role }
}

const createLeadSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    company_name: z.string().min(1, 'Empresa obrigatória'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    company_website: z.string().url().optional().or(z.literal('')),
    company_linkedin: z.string().optional(),
    estimated_value: z.number().positive().optional(),
    pipeline_stage: z.enum([
        'NOVO_LEAD', 'QUALIFICACAO', 'REUNIAO_BRIEFING',
        'REUNIAO_PROPOSTA', 'FECHAMENTO', 'KIA'
    ]).default('NOVO_LEAD'),
})

export async function getLeads(filters?: {
    stage?: PipelineStage
    search?: string
    assignedTo?: string
    page?: number
    limit?: number
}) {
    try {
        const { supabase, company_id } = await getAuthContext()
        const page = filters?.page ?? 1
        const limit = Math.min(filters?.limit ?? 50, 100)
        const from = (page - 1) * limit

        let query = supabase
            .from('leads')
            .select('*, assigned_user:users(id, name, avatar_url)', { count: 'exact' })
            .eq('company_id', company_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1)

        if (filters?.stage) query = query.eq('pipeline_stage', filters.stage)
        if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
        if (filters?.search) {
            query = query.or(
                `name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
            )
        }

        const { data, error, count } = await query
        if (error) throw error

        return { leads: data as Lead[], total: count ?? 0, page, limit }
    } catch (error) {
        console.error('[getLeads] Falha:', error)
        throw new Error('Falha ao buscar leads')
    }
}

export async function getLeadById(id: string) {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .eq('company_id', company_id)
            .is('deleted_at', null)
            .single()

        if (error) throw error
        return data as Lead
    } catch (error) {
        console.error('[getLeadById] Falha:', { id, error })
        throw new Error('Lead não encontrado')
    }
}

export async function createLead(rawData: unknown) {
    try {
        const { supabase, company_id } = await getAuthContext()
        const data = createLeadSchema.parse(rawData)

        const { data: lead, error } = await supabase
            .from('leads')
            .insert({ ...data, company_id })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/missoes')
        revalidatePath('/dashboard')
        return lead as Lead
    } catch (error) {
        console.error('[createLead] Falha:', error)
        throw error
    }
}

export async function updateLeadStage(id: string, newStage: PipelineStage) {
    try {
        const { supabase, company_id, user } = await getAuthContext()

        // Busca stage atual para registrar no activity log
        const { data: current } = await supabase
            .from('leads')
            .select('pipeline_stage, company_name')
            .eq('id', id)
            .eq('company_id', company_id)
            .single()

        if (!current) throw new Error('Lead não encontrado')

        // Atualiza stage
        const { data: lead, error } = await supabase
            .from('leads')
            .update({ pipeline_stage: newStage })
            .eq('id', id)
            .eq('company_id', company_id)
            .select()
            .single()

        if (error) throw error

        // Registra activity
        await supabase.from('activities').insert({
            company_id,
            lead_id: id,
            user_id: user.id,
            type: 'STAGE_CHANGE',
            title: `Missão avançou para ${newStage.replace('_', ' ')}`,
            metadata: { from: current.pipeline_stage, to: newStage },
        })

        revalidatePath('/missoes')
        return lead as Lead
    } catch (error) {
        console.error('[updateLeadStage] Falha:', { id, newStage, error })
        throw new Error('Falha ao mover lead')
    }
}

export async function updateLead(id: string, rawData: unknown) {
    try {
        const { supabase, company_id } = await getAuthContext()
        const data = createLeadSchema.partial().parse(rawData)

        const { data: lead, error } = await supabase
            .from('leads')
            .update(data)
            .eq('id', id)
            .eq('company_id', company_id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/missoes')
        revalidatePath('/dashboard')
        return lead as Lead
    } catch (error) {
        console.error('[updateLead] Falha:', { id, error })
        throw new Error('Falha ao atualizar lead')
    }
}

export async function deleteLead(id: string) {
    try {
        const { supabase, company_id } = await getAuthContext()

        // Soft delete — nunca DELETE físico
        const { error } = await supabase
            .from('leads')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('company_id', company_id)

        if (error) throw error

        revalidatePath('/missoes')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('[deleteLead] Falha:', { id, error })
        throw new Error('Falha ao remover lead')
    }
}
