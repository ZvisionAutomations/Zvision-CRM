'use server'

import { createServerClient } from '@supabase/ssr'

// Supabase-based rate limiter — works across serverless instances
// Uses a lightweight rate_limits table with automatic cleanup

function getAdminClient() {
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

export async function checkRateLimit(
    identifier: string,
    action: string,
    maxRequests: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const supabase = getAdminClient()
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

    // Count recent requests within window
    const { count, error } = await supabase
        .from('rate_limits')
        .select('id', { count: 'exact', head: true })
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('created_at', windowStart)

    if (error) {
        // If table doesn't exist yet, allow (graceful degradation)
        console.error('[checkRateLimit]', error)
        return { allowed: true, remaining: maxRequests }
    }

    const used = count ?? 0
    const remaining = Math.max(0, maxRequests - used)

    return { allowed: used < maxRequests, remaining }
}

export async function recordRateLimitHit(
    identifier: string,
    action: string
): Promise<void> {
    const supabase = getAdminClient()

    const { error } = await supabase
        .from('rate_limits')
        .insert({ identifier, action })

    if (error) {
        console.error('[recordRateLimitHit]', error)
    }
}

// Cleanup old entries (call periodically or via cron)
export async function cleanupRateLimits(): Promise<void> {
    const supabase = getAdminClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    await supabase
        .from('rate_limits')
        .delete()
        .lt('created_at', oneHourAgo)
}
