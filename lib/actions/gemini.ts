'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'

// ─── Clear briefing cache (used before regeneration) ────────────────────────
export async function clearBriefingCache(leadId: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Não autorizado')

    const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )

    // Fetch company_id for ownership verification
    const { data: profile } = await adminClient
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) throw new Error('Perfil não encontrado')

    // Verify lead belongs to user's company before clearing cache
    const { data: lead } = await adminClient
        .from('leads')
        .select('id')
        .eq('id', leadId)
        .eq('company_id', profile.company_id)
        .single()

    if (!lead) throw new Error('Lead não encontrado ou sem permissão')

    await adminClient
        .from('leads')
        .update({
            ai_briefing: null,
            ai_briefing_generated_at: null,
        })
        .eq('id', leadId)
        .eq('company_id', profile.company_id)
}
