"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "./kpi-bar"

export interface UtmEntry {
    source: string
    medium: string
    campaign: string
    leads: number
    cpl: number
    dailyActivity: number[]
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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

function getCplColor(cpl: number): string {
    if (cpl < 50) return 'var(--accent-primary)'
    if (cpl <= 150) return 'var(--status-warning, #f59e0b)'
    return 'var(--status-error, #ef4444)'
}

// ─── Mini Sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
    if (data.length < 2) return null

    const width = 60
    const height = 24
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = range > 0
            ? height - ((value - min) / range) * height
            : height / 2
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
            <polyline
                points={points}
                fill="none"
                stroke="var(--accent-primary, #A2E635)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

interface UtmListProps {
    entries: UtmEntry[]
}

export function UtmList({ entries }: UtmListProps) {
    const top5 = entries.slice(0, 5)

    if (top5.length === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-6 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // NENHUM UTM RASTREADO
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
            {top5.map((entry, idx) => (
                <motion.div
                    key={`${entry.source}-${entry.campaign}`}
                    variants={itemVariants}
                    className="flex items-start justify-between gap-3 py-3 px-2 transition-colors hover:bg-[var(--surface-elevated)]/50"
                    style={{
                        borderBottom: idx < top5.length - 1
                            ? '1px solid var(--border-default)'
                            : 'none',
                    }}
                >
                    {/* LEFT: UTM info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] text-[var(--text-secondary)] truncate mb-1">
                            {entry.source} / {entry.medium} / {entry.campaign}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[16px] text-[var(--accent-primary)]">
                                {entry.leads}
                                <span className="text-[var(--text-secondary)] text-[10px] font-normal ml-1">
                                    leads
                                </span>
                            </span>
                            <span
                                className="font-mono text-[12px]"
                                style={{ color: getCplColor(entry.cpl) }}
                            >
                                CPL {formatCurrency(entry.cpl)}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT: Sparkline */}
                    <Sparkline data={entry.dailyActivity} />
                </motion.div>
            ))}
        </motion.div>
    )
}
