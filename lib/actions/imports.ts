'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import type { Import } from '@/types/database'

async function getAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll() { return [] }, setAll() {} } }
    )
}

async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('Não autorizado')

    const admin = await getAdminClient()
    const { data: profile, error: profileError } = await admin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) throw new Error('Perfil não encontrado')
    return { supabase, user, company_id: profile.company_id as string }
}

export interface CreateImportInput {
    filename: string
    total_rows: number
}

export async function createImportRecord(input: CreateImportInput): Promise<{ id: string; error?: string }> {
    try {
        const { supabase, user, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('imports')
            .insert({
                company_id,
                user_id: user.id,
                filename: input.filename,
                status: 'PROCESSING',
                total_rows: input.total_rows,
                processed_rows: 0,
            })
            .select('id')
            .single()

        if (error) throw error
        return { id: data.id as string }
    } catch (err) {
        console.error('[createImportRecord]', err)
        return { id: '', error: 'Falha ao criar registro de importação' }
    }
}

export interface UpdateImportInput {
    id: string
    processed_rows: number
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
    error_log?: unknown
}

export async function updateImportRecord(input: UpdateImportInput): Promise<{ error?: string }> {
    try {
        const { supabase } = await getAuthContext()

        const { error } = await supabase
            .from('imports')
            .update({
                processed_rows: input.processed_rows,
                status: input.status,
                error_log: input.error_log ?? null,
            })
            .eq('id', input.id)

        if (error) throw error
        return {}
    } catch (err) {
        console.error('[updateImportRecord]', err)
        return { error: 'Falha ao atualizar registro' }
    }
}

export async function getRecentImports(): Promise<{ imports: Import[]; error?: string }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('imports')
            .select('*')
            .eq('company_id', company_id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error
        return { imports: (data ?? []) as Import[] }
    } catch (err) {
        console.error('[getRecentImports]', err)
        return { imports: [], error: 'Falha ao buscar histórico' }
    }
}
