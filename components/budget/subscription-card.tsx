"use client"

import { motion } from "framer-motion"
import type { Subscription, SubscriptionCategory } from "@/types/database"
import { formatCurrency } from "./kpi-card"

// ─── Category labels ─────────────────────────────────────────────────────────
const categoryLabels: Record<SubscriptionCategory, string> = {
    ia: 'IA',
    infra: 'INFRA',
    marketing: 'MARKETING',
    vendas: 'VENDAS',
}

const categoryColors: Record<SubscriptionCategory, string> = {
    ia: 'var(--accent-ai, #00D4FF)',
    infra: 'var(--text-secondary)',
    marketing: 'var(--accent-primary)',
    vendas: 'var(--status-warning, #f59e0b)',
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
}

const cardVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface SubscriptionCardListProps {
    subscriptions: Subscription[]
}

export function SubscriptionCardList({ subscriptions }: SubscriptionCardListProps) {
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active')
    const totalMonthly = activeSubscriptions.reduce((sum, s) => sum + Number(s.amount), 0)
    const projectedAnnual = totalMonthly * 12

    if (subscriptions.length === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-6 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // NENHUMA ASSINATURA REGISTRADA
                </p>
            </div>
        )
    }

    return (
        <div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
            >
                {subscriptions.map((sub) => {
                    const catColor = categoryColors[sub.category as SubscriptionCategory]
                    const isActive = sub.status === 'active'
                    const nextBilling = sub.next_billing_date
                        ? new Date(sub.next_billing_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                        })
                        : null

                    return (
                        <motion.div
                            key={sub.id}
                            variants={cardVariants}
                            className="bg-[var(--surface-elevated)] border border-[var(--border-default)] p-3 rounded-[4px] transition-colors hover:border-[var(--accent-primary)]/20"
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                {/* Tool name */}
                                <span className="font-['Space_Grotesk'] font-semibold text-[13px] text-[var(--text-primary)]">
                                    {sub.name}
                                </span>

                                {/* Status dot */}
                                <span
                                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                                    style={{
                                        backgroundColor: isActive
                                            ? 'var(--accent-primary)'
                                            : 'var(--status-error, #ef4444)',
                                        boxShadow: isActive
                                            ? '0 0 4px rgba(162,230,53,0.5)'
                                            : '0 0 4px rgba(239,68,68,0.5)',
                                    }}
                                />
                            </div>

                            {/* Price */}
                            <p className="font-mono font-bold text-sm text-[var(--text-primary)] mb-2">
                                {formatCurrency(Number(sub.amount))}
                            </p>

                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Billing badge */}
                                <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[var(--surface-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                                    {sub.billing_cycle === 'mensal' ? 'MENSAL' : 'ANUAL'}
                                </span>

                                {/* Category badge */}
                                <span
                                    className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${catColor} 15%, transparent)`,
                                        color: catColor,
                                    }}
                                >
                                    {categoryLabels[sub.category as SubscriptionCategory]}
                                </span>

                                {/* Next billing date */}
                                {nextBilling && (
                                    <span className="font-mono text-[10px] text-[var(--text-secondary)] ml-auto">
                                        Próx: {nextBilling}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Bottom summary */}
            <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                        Total fixo mensal
                    </span>
                    <span
                        className="font-mono font-bold text-sm"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        {formatCurrency(totalMonthly)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                        PROJEÇÃO ANUAL
                    </span>
                    <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                        {formatCurrency(projectedAnnual)}
                    </span>
                </div>
            </div>
        </div>
    )
}
