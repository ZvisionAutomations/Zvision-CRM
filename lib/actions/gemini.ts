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

    await adminClient
        .from('leads')
        .update({
            ai_briefing: null,
            ai_briefing_generated_at: null,
        })
        .eq('id', leadId)
}
