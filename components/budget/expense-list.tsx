"use client"

import { motion } from "framer-motion"
import { Cloud, Monitor, Users, Megaphone } from "lucide-react"
import type { Expense, ExpenseCategory } from "@/types/database"
import { formatCurrency } from "./kpi-card"

// ─── Category config ─────────────────────────────────────────────────────────
const categoryConfig: Record<ExpenseCategory, {
    icon: typeof Cloud
    label: string
    badgeColor: string
}> = {
    ferramenta: { icon: Monitor, label: 'FERRAMENTA', badgeColor: 'var(--accent-ai, #00D4FF)' },
    operacao: { icon: Cloud, label: 'OPERAÇÃO', badgeColor: 'var(--text-secondary)' },
    pessoal: { icon: Users, label: 'PESSOAL', badgeColor: 'var(--status-warning, #f59e0b)' },
    marketing: { icon: Megaphone, label: 'MARKETING', badgeColor: 'var(--accent-primary)' },
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, x: -4 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface ExpenseListProps {
    expenses: Expense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Group by category for visual organization
    const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
        const key = exp.category
        if (!acc[key]) acc[key] = []
        acc[key].push(exp)
        return acc
    }, {})

    // Flatten grouped for display — keeps category grouping visible
    const sortedExpenses = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, items]) => items)

    if (sortedExpenses.length === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-6 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // NENHUMA DESPESA REGISTRADA
                </p>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="space-y-0">
                {sortedExpenses.map((expense, idx) => {
                    const config = categoryConfig[expense.category as ExpenseCategory]
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={expense.id}
                            variants={itemVariants}
                            className="flex items-center gap-3 py-3 px-2 transition-colors hover:bg-[var(--surface-elevated)]/50"
                            style={{
                                borderBottom: idx < sortedExpenses.length - 1
                                    ? '1px solid var(--border-default)'
                                    : 'none',
                            }}
                        >
                            {/* Icon */}
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" style={{ color: config.badgeColor }} />
                            </div>

                            {/* Name */}
                            <span className="font-['Space_Grotesk'] font-medium text-[13px] text-[var(--text-primary)] flex-1 truncate">
                                {expense.name}
                            </span>

                            {/* Category badge */}
                            <span
                                className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${config.badgeColor} 15%, transparent)`,
                                    color: config.badgeColor,
                                }}
                            >
                                {config.label}
                            </span>

                            {/* Amount */}
                            <span className="font-mono font-bold text-[13px] text-[var(--text-primary)] shrink-0 text-right min-w-[100px]">
                                {formatCurrency(Number(expense.amount))}
                            </span>
                        </motion.div>
                    )
                })}
            </div>

            {/* TOTAL row */}
            <div
                className="flex items-center justify-between px-2 py-3 mt-1"
                style={{ borderTop: '1px solid var(--accent-primary, #A2E635)' }}
            >
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                    TOTAL
                </span>
                <span
                    className="font-mono font-bold text-base"
                    style={{ color: 'var(--accent-primary)' }}
                >
                    {formatCurrency(total)}
                </span>
            </div>
        </motion.div>
    )
}
