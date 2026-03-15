'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    const supabaseAdmin = await getAdminClient()
    const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) throw new Error('Perfil não encontrado')

    return { supabase, user, profile, supabaseAdmin }
}

export async function getProfile() {
    try {
        const { profile } = await getAuthContext()
        return { data: profile }
    } catch (error: any) {
        console.error('[getProfile] Erro:', error)
        return { error: error.message }
    }
}

const updateProfileSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
})

export async function updateProfile(rawData: unknown) {
    try {
        const { user, supabaseAdmin } = await getAuthContext()
        const data = updateProfileSchema.parse(rawData)

        // Atualiza a tabela public.users ignorando RLS
        const { error } = await supabaseAdmin
            .from('users')
            .update({ name: data.name })
            .eq('id', user.id)

        if (error) throw error

        // Atualiza os metadados do auth.users opcionalmente
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: { name: data.name }
        })

        revalidatePath('/settings')
        revalidatePath('/dashboard')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('[updateProfile] Erro:', error)
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: 'Falha ao atualizar o perfil' }
    }
}
