'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import type { ApiKey } from '@/types/database'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    return { supabase, user, company_id: profile.company_id as string, admin }
}

// ── Crypto: generate + hash ───────────────────────────────────────────────────
// Raw key is returned ONCE to the client on creation — never stored.
// We store only the last-4-char preview and a SHA-256 hex hash.
// Note: bcrypt is not available without native modules in Edge runtime.
// SHA-256 via WebCrypto is used as a server-side hash here.

async function hashKey(rawKey: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(rawKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateRawKey(): string {
    // Format: zvk_<32 random hex chars>
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    return `zvk_${hex}`
}

// ── Public actions ────────────────────────────────────────────────────────────

export async function getApiKeys(): Promise<{ keys: ApiKey[]; error?: string }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('api_keys')
            .select('id, label, key_preview, is_active, created_at, last_used_at, expires_at, company_id, user_id')
            .eq('company_id', company_id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { keys: (data ?? []) as ApiKey[] }
    } catch (err) {
        console.error('[getApiKeys]', err)
        return { keys: [], error: 'Falha ao buscar chaves' }
    }
}

export interface CreateApiKeyResult {
    key?: ApiKey
    rawKey?: string   // shown ONCE — never stored
    error?: string
}

export async function createApiKey(label: string): Promise<CreateApiKeyResult> {
    try {
        if (!label.trim()) return { error: 'Label é obrigatório' }

        const { supabase, user, company_id } = await getAuthContext()
        const rawKey = generateRawKey()
        const keyHash = await hashKey(rawKey)
        const keyPreview = `****${rawKey.slice(-4).toUpperCase()}`

        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                company_id,
                user_id: user.id,
                label: label.trim(),
                key_hash: keyHash,
                key_preview: keyPreview,
                is_active: true,
                expires_at: null,
            })
            .select()
            .single()

        if (error) throw error
        revalidatePath('/settings')
        return { key: data as ApiKey, rawKey }
    } catch (err) {
        console.error('[createApiKey]', err)
        return { error: 'Falha ao criar chave' }
    }
}

export async function revokeApiKey(id: string): Promise<{ error?: string }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', id)
            .eq('company_id', company_id)

        if (error) throw error
        revalidatePath('/settings')
        return {}
    } catch (err) {
        console.error('[revokeApiKey]', err)
        return { error: 'Falha ao revogar chave' }
    }
}

export async function deleteApiKey(id: string): Promise<{ error?: string }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', id)
            .eq('company_id', company_id)

        if (error) throw error
        revalidatePath('/settings')
        return {}
    } catch (err) {
        console.error('[deleteApiKey]', err)
        return { error: 'Falha ao deletar chave' }
    }
}
