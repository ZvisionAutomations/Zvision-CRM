'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import type { Expense, Subscription, Lead } from '@/types/database'

// Admin client — used ONLY for initial profile lookup (RLS recursion bypass)
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

async function getAuthContext() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('UNAUTHORIZED')

    const supabaseAdmin = getAdminClient()
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) throw new Error('COMPANY_NOT_FOUND')

    return { supabase, user, company_id: profile.company_id as string }
}

export interface MonthlyFinancialData {
    expenses: Expense[]
    subscriptions: Subscription[]
    wonDeals: Lead[]
    error: string | null
}

// Fetch expenses for a given month (YYYY-MM-01 format)
export async function getExpensesByMonth(month: string): Promise<{ expenses: Expense[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('company_id', company_id)
            .eq('month', month)
            .order('category', { ascending: true })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { expenses: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { expenses: (data ?? []) as Expense[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { expenses: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getExpensesByMonth] Falha:', err)
        return { expenses: [], error: 'Falha ao buscar despesas' }
    }
}

// Fetch all expenses for last 6 months (for chart)
export async function getExpensesLast6Months(): Promise<{ expenses: Expense[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        // Calculate 6 months ago from current date
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        sixMonthsAgo.setDate(1)
        const startDate = sixMonthsAgo.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('company_id', company_id)
            .gte('month', startDate)
            .order('month', { ascending: true })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { expenses: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { expenses: (data ?? []) as Expense[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { expenses: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getExpensesLast6Months] Falha:', err)
        return { expenses: [], error: 'Falha ao buscar despesas' }
    }
}

// Fetch all subscriptions
export async function getSubscriptions(): Promise<{ subscriptions: Subscription[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('company_id', company_id)
            .order('status', { ascending: true })
            .order('category', { ascending: true })

        if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                return { subscriptions: [], error: 'TABLE_NOT_FOUND' }
            }
            throw error
        }

        return { subscriptions: (data ?? []) as Subscription[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { subscriptions: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getSubscriptions] Falha:', err)
        return { subscriptions: [], error: 'Falha ao buscar assinaturas' }
    }
}

// Fetch won deals (FECHAMENTO stage) for ROI calculation — scoped to company
export async function getWonDeals(): Promise<{ deals: Lead[]; error: string | null }> {
    try {
        const { supabase, company_id } = await getAuthContext()

        const { data, error } = await supabase
            .from('leads')
            .select('id, company_name, estimated_value, pipeline_stage, created_at')
            .eq('company_id', company_id)
            .eq('pipeline_stage', 'FECHAMENTO')
            .is('deleted_at', null)
            .order('company_name', { ascending: true })

        if (error) {
            throw error
        }

        return { deals: (data ?? []) as Lead[], error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return { deals: [], error: 'UNAUTHORIZED' }
        }
        console.error('[getWonDeals] Falha:', err)
        return { deals: [], error: 'Falha ao buscar deals ganhos' }
    }
}
