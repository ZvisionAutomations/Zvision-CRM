'use server'

import { createServerClient } from '@supabase/ssr'
import type { Expense, Subscription, Lead } from '@/types/database'

// Admin client bypasses RLS — mirrors flows.ts / agents.ts pattern
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

export interface MonthlyFinancialData {
    expenses: Expense[]
    subscriptions: Subscription[]
    wonDeals: Lead[]
    error: string | null
}

// Fetch expenses for a given month (YYYY-MM-01 format)
export async function getExpensesByMonth(month: string): Promise<{ expenses: Expense[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('expenses')
            .select('*')
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
        console.error('[getExpensesByMonth] Falha:', err)
        return { expenses: [], error: 'Falha ao buscar despesas' }
    }
}

// Fetch all expenses for last 6 months (for chart)
export async function getExpensesLast6Months(): Promise<{ expenses: Expense[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        // Calculate 6 months ago from current date
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        sixMonthsAgo.setDate(1)
        const startDate = sixMonthsAgo.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('expenses')
            .select('*')
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
        console.error('[getExpensesLast6Months] Falha:', err)
        return { expenses: [], error: 'Falha ao buscar despesas' }
    }
}

// Fetch all subscriptions
export async function getSubscriptions(): Promise<{ subscriptions: Subscription[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
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
        console.error('[getSubscriptions] Falha:', err)
        return { subscriptions: [], error: 'Falha ao buscar assinaturas' }
    }
}

// Fetch won deals (FECHAMENTO stage) grouped by company for ROI calculation
// Revenue = sum of estimated_value where pipeline_stage = 'FECHAMENTO'
export async function getWonDeals(): Promise<{ deals: Lead[]; error: string | null }> {
    try {
        const supabase = getAdminClient()

        const { data, error } = await supabase
            .from('leads')
            .select('id, company_name, estimated_value, pipeline_stage, created_at')
            .eq('pipeline_stage', 'FECHAMENTO')
            .is('deleted_at', null)
            .order('company_name', { ascending: true })

        if (error) {
            throw error
        }

        return { deals: (data ?? []) as Lead[], error: null }
    } catch (err) {
        console.error('[getWonDeals] Falha:', err)
        return { deals: [], error: 'Falha ao buscar deals ganhos' }
    }
}
