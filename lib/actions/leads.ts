'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Lead, PipelineStage } from '@/types/database'

import { createServerClient } from '@supabase/ssr'

// Helper para bypass de RLS apenas na leitura do profile inicial
async function getAdminClient() {
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

// Helper: busca company_id do usuário autenticado
async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Não autorizado')

    // Lemos o profile ignorando RLS para evitar o erro de loop "Perfil não encontrado"
    const supabaseAdmin = await getAdminClient()
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) throw new Error('Perfil não encontrado no banco de dados')

    return { supabase, user, company_id: profile.company_id, role: profile.role }
}

const createLeadSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    company_name: z.string().min(1, 'Empresa obrigatória'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    company_website: z.string().url().optional().or(z.literal('')),
    company_linkedin: z.string().optional(),
    estimated_value: z.number().min(0).optional(),
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
        const limit = Math.min(filters?.limit ?? 50, 1000)
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

export async function importLeadsBatch(leadsRawData: unknown[]) {
    try {
        const { supabase, company_id, user } = await getAuthContext()

        const errors: any[] = []
        // Valida e filtra os dados crus para garantir que estão seguros
        const validLeads = leadsRawData.reduce<any[]>((acc, raw, index) => {
            const result = createLeadSchema.safeParse(raw)
            if (result.success) {
                acc.push({ ...result.data, company_id })
            } else {
                errors.push(`Row ${index + 1}: ${result.error.errors[0]?.message}`)
            }
            return acc
        }, [])

        if (validLeads.length === 0) {
            console.error('All rows failed schema validation. Errors:', errors.slice(0, 5))
            return { error: `Nenhum registro aprovado pelo validador. Erro na 1ª linha: ${errors[0] || 'Desconhecido'}` }
        }

        // Inserting in batches of 100 to avoid payload limits
        const BATCH_SIZE = 100
        let firstInsertedId = null

        for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
            const batch = validLeads.slice(i, i + BATCH_SIZE)
            const { data, error } = await supabase
                .from('leads')
                .insert(batch)
                .select('id')

            if (error) throw error
            if (i === 0 && data?.[0]) firstInsertedId = data[0].id
        }

        // Opcional: Registrar a atividade de importação na trilha de auditoria
        if (firstInsertedId) {
            await supabase.from('activities').insert({
                company_id,
                lead_id: firstInsertedId, // Amarra a atividade ao primeiro lead (ou cria log no sistema geral)
                user_id: user.id,
                type: 'NOTE',
                title: `Ingestão Massiva CCT concluída`,
                description: `Importação de ${validLeads.length} alvos para o radar.`,
            }).select().single() // Ignore error on activity for now if fails
        }

        revalidatePath('/missoes')
        revalidatePath('/dashboard')
        return { success: true, count: validLeads.length }
    } catch (error: any) {
        console.error('[importLeadsBatch] Falha:', error)
        return { error: 'Erro crítico ao processar lote no Supabase.' }
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
