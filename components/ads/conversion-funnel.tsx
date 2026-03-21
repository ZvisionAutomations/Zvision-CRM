"use client"

import { motion } from "framer-motion"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FunnelData {
    impressoes: number
    cliques: number
    leads: number
    qualificados: number
    fechamentos: number
}

interface ConversionFunnelProps {
    data: FunnelData
}

interface FunnelStage {
    label: string
    value: number
    nextValue: number | undefined
}

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
}

const stageVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

// Opacity decreases per stage for visual funnel effect
const STAGE_OPACITIES = [1.0, 0.825, 0.65, 0.475, 0.3] as const

export function ConversionFunnel({ data }: ConversionFunnelProps) {
    const stages: FunnelStage[] = [
        { label: 'IMPRESSÕES', value: data.impressoes, nextValue: data.cliques },
        { label: 'CLIQUES', value: data.cliques, nextValue: data.leads },
        { label: 'LEADS', value: data.leads, nextValue: data.qualificados },
        { label: 'QUALIFICADOS', value: data.qualificados, nextValue: data.fechamentos },
        { label: 'FECHAMENTOS', value: data.fechamentos, nextValue: undefined },
    ]

    const allZero = stages.every((s) => s.value === 0)

    if (allZero) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-8 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // DADOS DE FUNIL INDISPONÍVEIS
                </p>
            </div>
        )
    }

    const maxValue = data.impressoes

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-stretch gap-2 lg:flex-nowrap"
        >
            {stages.map((stage, index) => {
                const barWidth = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
                const opacity = STAGE_OPACITIES[index]

                const conversionRate = stage.nextValue !== undefined && stage.value > 0
                    ? ((stage.nextValue / stage.value) * 100).toFixed(1)
                    : null

                return (
                    <div key={stage.label} className="flex flex-1 items-center min-w-[120px]">
                        <motion.div
                            className="flex flex-1 flex-col"
                            variants={stageVariants}
                        >
                            {/* Label */}
                            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                {stage.label}
                            </span>

                            {/* Value */}
                            <span className="font-mono font-bold text-[24px] text-[var(--text-primary)] mb-2">
                                {stage.value.toLocaleString('pt-BR')}
                            </span>

                            {/* Bar */}
                            <div className="h-3 bg-[var(--surface-elevated)] rounded-[2px] overflow-hidden">
                                <div
                                    className="h-full bg-[var(--accent-primary)] rounded-[2px]"
                                    style={{
                                        width: `${barWidth}%`,
                                        opacity,
                                        transition: 'width 0.6s ease',
                                    }}
                                />
                            </div>

                            {/* Conversion rate to next stage */}
                            {stage.nextValue !== undefined && (
                                <span className="font-mono text-[9px] text-[var(--accent-primary)] mt-1">
                                    {conversionRate !== null ? `↓ ${conversionRate}%` : '—'}
                                </span>
                            )}
                        </motion.div>

                        {/* Connector between stages */}
                        {index < stages.length - 1 && (
                            <span className="hidden lg:block font-mono text-[var(--text-secondary)] text-[10px] self-center mx-1">
                                »
                            </span>
                        )}
                    </div>
                )
            })}
        </motion.div>
    )
}
