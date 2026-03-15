'use server'

import { createServerClient } from '@supabase/ssr'

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

export async function dumpUsers() {
    const supabaseAdmin = await getAdminClient()
    const { data, error } = await supabaseAdmin.from('users').select('*')
    console.log('[DEBUG dumpUsers] users list:', data)
    console.log('[DEBUG dumpUsers] error:', error)

    // Also check auth.users directly
    const { data: auth, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    console.log('[DEBUG dumpUsers] auth list:', auth.users.map(u => ({ id: u.id, email: u.email })))

    return { data, auth: auth.users.map(u => ({ id: u.id, email: u.email })) }
}
