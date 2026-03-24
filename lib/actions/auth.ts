'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const registerSchema = z.object({
    fullName: z.string().min(1, 'Nome completo é obrigatório'),
    email: z.string().email('Endereço de e-mail inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

// Helper para criar o cliente Admin do Supabase (ignora RLS)
async function getAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase Configuration is missing (Service Role Key)')
    }

    // Criamos um client server-side genérico que não depende dos cookies do usuário e usa a Service Role Key
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )
}

export async function registerUser(rawData: unknown) {
    try {
        const data = registerSchema.parse(rawData)

        // 1. Instanciar o cliente Admin
        const supabaseAdmin = await getAdminClient()

        // 2. Criar o usuário no Auth (bypassa confirmação de e-mail por padrão usando admin api, 
        // mas vamos configurar para que ele envie se configurado no painel)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true, // Já confirma o e-mail logo no cadastro (opcional, define como true para facilitar o login imediato se desejar, mas setamos true para auto-confirmar caso a config deixe)
            user_metadata: {
                name: data.fullName
            }
        })

        if (authError) {
            console.error('[auth.admin.createUser]', authError)
            return { error: authError.message }
        }

        const userId = authData.user.id

        // 3. Criar a Empresa Mestre (Company)
        const companyName = `${data.fullName.split(' ')[0]} Hub`
        const companySlug = `empresa-${userId.split('-')[0]}`

        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
                name: companyName,
                slug: companySlug,
                plan: 'free'
            })
            .select()
            .single()

        if (companyError) {
            console.error('[companies.insert]', companyError)
            // Tenta deletar o usuário do auth para não ficar pendente
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return { error: 'Falha ao criar o perfil de empresa.' }
        }

        // 4. Criar o Perfil de Usuário
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                company_id: company.id,
                email: data.email,
                name: data.fullName,
                role: 'admin'
            })

        if (userError) {
            console.error('[users.insert]', userError)
            return { error: 'Falha ao vincular o usuário à empresa.' }
        }

        return { success: true }

    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return { error: e.errors[0].message }
        }
        const message = e instanceof Error ? e.message : 'Erro desconhecido ao cadastrar usuário'
        return { error: message }
    }
}
