"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "./kpi-bar"

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface ChannelPerformanceProps {
    metaSpend: number
    googleSpend: number
    metaLeads: number
    googleLeads: number
}

interface BarRowProps {
    label: string
    value: number
    total: number
    isLeader: boolean
    formatValue: (v: number) => string
    accentColor?: boolean
}

function BarRow({ label, value, total, isLeader, formatValue, accentColor }: BarRowProps) {
    const pct = total > 0 ? (value / total) * 100 : 0

    return (
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[11px] uppercase w-16 shrink-0 text-[var(--text-primary)]">
                {label}
            </span>

            <div className="flex-1 h-8 bg-[var(--surface-elevated)] rounded-[2px] overflow-hidden relative">
                <div
                    className="absolute inset-y-0 left-0 rounded-[2px]"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: isLeader
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                        opacity: isLeader ? 1 : 0.4,
                        transition: 'width 0.6s ease',
                    }}
                />
            </div>

            <span
                className="font-mono text-[12px] font-bold w-24 text-right shrink-0"
                style={{ color: accentColor ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
                {formatValue(value)}
            </span>

            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--surface-elevated)] text-[var(--text-secondary)] shrink-0">
                {pct.toFixed(0)}%
            </span>
        </motion.div>
    )
}

export function ChannelPerformance({ metaSpend, googleSpend, metaLeads, googleLeads }: ChannelPerformanceProps) {
    const totalSpend = metaSpend + googleSpend
    const totalLeads = metaLeads + googleLeads

    if (totalSpend === 0 && totalLeads === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-6 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // DADOS INSUFICIENTES
                </p>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Spend distribution */}
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    DISTRIBUIÇÃO DE INVESTIMENTO
                </p>
                <BarRow
                    label="META"
                    value={metaSpend}
                    total={totalSpend}
                    isLeader={metaSpend >= googleSpend}
                    formatValue={formatCurrency}
                />
                <BarRow
                    label="GOOGLE"
                    value={googleSpend}
                    total={totalSpend}
                    isLeader={googleSpend > metaSpend}
                    formatValue={formatCurrency}
                />
            </div>

            {/* Leads distribution */}
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    LEADS POR CANAL
                </p>
                <BarRow
                    label="META"
                    value={metaLeads}
                    total={totalLeads}
                    isLeader={metaLeads >= googleLeads}
                    formatValue={(v) => String(v)}
                    accentColor
                />
                <BarRow
                    label="GOOGLE"
                    value={googleLeads}
                    total={totalLeads}
                    isLeader={googleLeads > metaLeads}
                    formatValue={(v) => String(v)}
                    accentColor
                />
            </div>
        </motion.div>
    )
}
