"use client"

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { formatCurrency, formatRoas } from "@/lib/formatters"
import { kpiContainerVariants, kpiItemVariants } from "@/lib/motion-presets"

export { kpiContainerVariants, kpiItemVariants }

interface KpiCardProps {
    label: string
    value: number
    format: 'currency' | 'percent' | 'number' | 'roas'
    colorVar: string
    trend: number | null
    useTicker?: boolean
}

export function KpiCard({ label, value, format, colorVar, trend, useTicker = false }: KpiCardProps) {
    const displayValue = format === 'currency'
        ? formatCurrency(value)
        : format === 'percent'
            ? `${value.toFixed(1)}%`
            : format === 'roas'
                ? formatRoas(value)
                : value.toLocaleString('pt-BR')

    return (
        <motion.div
            variants={kpiItemVariants}
            className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4 group"
        >
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                {label}
            </p>

            <div className="flex items-baseline gap-2">
                <span
                    className="font-mono font-bold text-2xl leading-none"
                    style={{ color: `var(${colorVar})` }}
                >
                    {useTicker && format === 'currency' ? (
                        <>
                            R$&nbsp;
                            <NumberTicker
                                value={Math.round(value)}
                                className="font-mono font-bold text-2xl"
                            />
                        </>
                    ) : useTicker && format === 'number' ? (
                        <NumberTicker
                            value={value}
                            className="font-mono font-bold text-2xl"
                        />
                    ) : (
                        displayValue
                    )}
                </span>

                {trend !== null && (
                    <span
                        className="flex items-center gap-0.5 text-xs font-mono font-medium"
                        style={{
                            color: trend >= 0
                                ? 'var(--accent-primary)'
                                : 'var(--status-error, #ef4444)',
                        }}
                    >
                        {trend >= 0 ? (
                            <ArrowUp className="w-3 h-3" />
                        ) : (
                            <ArrowDown className="w-3 h-3" />
                        )}
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                )}
            </div>
        </motion.div>
    )
}
