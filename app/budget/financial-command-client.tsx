"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KpiCard, kpiContainerVariants } from "@/components/budget/kpi-card"
import { formatCurrency } from "@/lib/formatters"
import { RoiTable, computeClientROI } from "@/components/budget/roi-table"
import { ExpenseList } from "@/components/budget/expense-list"
import { SubscriptionCardList } from "@/components/budget/subscription-card"
import { FinanceChart } from "@/components/budget/finance-chart"
import type { Expense, Subscription, Lead } from "@/types/database"

// ─── Month label helper ──────────────────────────────────────────────────────
const monthNames: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function getMonthLabel(month: string): string {
    const m = month.slice(5, 7)
    const y = month.slice(2, 4)
    return `${monthNames[m] ?? m}/${y}`
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface FinancialCommandClientProps {
    months: string[]
    currentMonth: string
    expensesByMonth: Record<string, Expense[]>
    subscriptions: Subscription[]
    wonDeals: Lead[]
    allExpenses6m: Expense[]
    tableNotFound: boolean
}

export function FinancialCommandClient({
    months,
    currentMonth,
    expensesByMonth,
    subscriptions,
    wonDeals,
    allExpenses6m,
    tableNotFound,
}: FinancialCommandClientProps) {
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)

    // ─── Compute data for selected month ─────────────────────────────────────
    const selectedExpenses = expensesByMonth[selectedMonth] ?? []
    const totalExpenses = selectedExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Active subscriptions cost added to expenses total
    const activeSubsTotal = subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + Number(s.amount), 0)

    const totalDespesas = totalExpenses + activeSubsTotal

    // Revenue from won deals (FECHAMENTO stage) — all-time for now, since we don't have deal close date
    const totalReceita = wonDeals.reduce((sum, d) => sum + (d.estimated_value ?? 0), 0)

    const lucro = totalReceita - totalDespesas
    const margem = totalReceita > 0 ? (lucro / totalReceita) * 100 : 0

    // ─── Previous month for trend ────────────────────────────────────────────
    const selectedIdx = months.indexOf(selectedMonth)
    const prevMonth = selectedIdx > 0 ? months[selectedIdx - 1] : null
    const prevExpenses = prevMonth ? (expensesByMonth[prevMonth] ?? []) : []
    const prevTotalExpenses = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const prevTotalDespesas = prevTotalExpenses + activeSubsTotal

    const despesasTrend = prevTotalDespesas > 0
        ? ((totalDespesas - prevTotalDespesas) / prevTotalDespesas) * 100
        : null

    // Revenue trend: simplified — no monthly revenue breakdown available
    const receitaTrend: number | null = null

    // ─── ROI per client ──────────────────────────────────────────────────────
    const dealsByCompany: Record<string, number> = {}
    for (const deal of wonDeals) {
        const company = deal.company_name ?? 'Desconhecido'
        dealsByCompany[company] = (dealsByCompany[company] ?? 0) + (deal.estimated_value ?? 0)
    }
    const clientROI = computeClientROI(dealsByCompany, totalDespesas)

    // ─── Chart data: revenue + expenses per month ────────────────────────────
    const chartData = months.map((month) => {
        const monthExpenses = expensesByMonth[month] ?? []
        const monthExpTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0) + activeSubsTotal
        // Revenue is flat across months since we don't have per-month deal data
        const monthReceita = totalReceita / months.length
        return { month, receita: monthReceita, despesas: monthExpTotal }
    })

    // ─── Margin color ────────────────────────────────────────────────────────
    const margemColor = margem > 30
        ? '--accent-primary'
        : margem > 10
            ? '--status-warning'
            : '--status-error'

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6 lg:p-8">

                {/* ─── SECTION 1: Page Header ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        <h1
                            className="font-['Space_Grotesk'] font-bold text-2xl tracking-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            // COMANDO FINANCEIRO
                        </h1>
                        <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Saúde operacional, margens e ROI por cliente
                        </p>
                    </div>

                    {/* Month selector pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {months.map((month) => {
                            const isActive = month === selectedMonth
                            return (
                                <button
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                    className="font-mono text-[11px] px-3 py-1.5 rounded-sm transition-all duration-150"
                                    style={{
                                        backgroundColor: isActive
                                            ? 'var(--accent-primary)'
                                            : 'transparent',
                                        color: isActive
                                            ? 'var(--surface-page, #0A0A0A)'
                                            : 'var(--text-secondary)',
                                        border: isActive
                                            ? 'none'
                                            : '1px solid var(--border-default)',
                                        fontWeight: isActive ? 700 : 400,
                                    }}
                                >
                                    {getMonthLabel(month)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* TABLE_NOT_FOUND warning */}
                {tableNotFound && (
                    <div
                        className="mb-6 px-4 py-3 border border-[var(--status-warning,#f59e0b)]/30 bg-[var(--status-warning,#f59e0b)]/5 rounded-sm"
                    >
                        <p className="font-mono text-[11px] text-[var(--status-warning,#f59e0b)]">
                            // TABELAS NÃO ENCONTRADAS — Execute 008_financials.sql no Supabase Dashboard
                        </p>
                    </div>
                )}

                {/* ─── SECTION 2: KPI Bar ─────────────────────────────────── */}
                <motion.div
                    variants={kpiContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
                >
                    <KpiCard
                        label="RECEITA BRUTA"
                        value={totalReceita}
                        format="currency"
                        colorVar="--accent-primary"
                        trend={receitaTrend}
                        useTicker
                    />
                    <KpiCard
                        label="DESPESAS TOTAIS"
                        value={totalDespesas}
                        format="currency"
                        colorVar="--status-error"
                        trend={despesasTrend}
                    />
                    <KpiCard
                        label="LUCRO LÍQUIDO"
                        value={lucro}
                        format="currency"
                        colorVar={lucro >= 0 ? '--accent-primary' : '--status-error'}
                        trend={null}
                        useTicker
                    />
                    <KpiCard
                        label="MARGEM"
                        value={margem}
                        format="percent"
                        colorVar={margemColor}
                        trend={null}
                    />
                </motion.div>

                {/* ─── SECTION 3: ROI por Cliente ─────────────────────────── */}
                <div className="mb-8">
                    <p
                        className="font-mono text-[11px] uppercase tracking-wider mb-4"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        // ROI POR CLIENTE — ANÁLISE TÁTICA
                    </p>
                    <RoiTable clients={clientROI} />
                </div>

                {/* ─── SECTION 4: Two Column (Expenses + Subscriptions) ──── */}
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-8">
                    {/* LEFT: Expenses */}
                    <div>
                        <p
                            className="font-mono text-[11px] uppercase tracking-wider mb-3"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            // DESPESAS DO MÊS — {getMonthLabel(selectedMonth)}
                        </p>
                        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                            <ExpenseList expenses={selectedExpenses} />
                        </div>
                    </div>

                    {/* RIGHT: Subscriptions */}
                    <div>
                        <p
                            className="font-mono text-[11px] uppercase tracking-wider mb-3"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            // ASSINATURAS & CUSTOS FIXOS
                        </p>
                        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                            <SubscriptionCardList subscriptions={subscriptions} />
                        </div>
                    </div>
                </div>

                {/* ─── SECTION 5: Finance Chart ───────────────────────────── */}
                <div className="mb-8">
                    <p
                        className="font-mono text-[11px] uppercase tracking-wider mb-4"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        // EVOLUÇÃO FINANCEIRA — 6 MESES
                    </p>
                    <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                        <FinanceChart data={chartData} />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
