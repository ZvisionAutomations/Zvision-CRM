"use client"

import { motion } from "framer-motion"
import { SparklineChart } from "./sparkline-chart"
import { ShineBorder } from "@/components/ui/shine-border"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Flow, FlowStatus } from "@/types/database"
import {
    Zap,
    GitBranch,
    Bot,
    Users,
    ArrowUpDown,
} from "lucide-react"

// Stagger item variants — parent FlowsGrid supplies the container
export const flowCardItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface FlowCardProps {
    flow: Flow
    isUpdating: boolean
    onToggle: (id: string, currentStatus: FlowStatus) => void
}

// Icon map — keyed by flow name keywords
function getFlowIcon(name: string) {
    const lower = name.toLowerCase()
    if (lower.includes('scoring') || lower.includes('engine')) return Zap
    if (lower.includes('pipeline') || lower.includes('stage') || lower.includes('sync')) return ArrowUpDown
    if (lower.includes('ai') || lower.includes('briefing') || lower.includes('generator')) return Bot
    if (lower.includes('onboarding') || lower.includes('sequence') || lower.includes('drip')) return Users
    return GitBranch
}

function formatLastRun(lastRunAt: string): string {
    try {
        return formatDistanceToNow(new Date(lastRunAt), { addSuffix: true, locale: ptBR })
    } catch {
        return "Desconhecido"
    }
}

function generateFlowId(id: string): string {
    return `#FL-${id.slice(-4).toUpperCase()}`
}

export function FlowCard({ flow, isUpdating, onToggle }: FlowCardProps) {
    const Icon = getFlowIcon(flow.name)
    const isError = flow.status === 'error'
    const isActive = flow.status === 'active'
    const sparklineVariant: 'healthy' | 'error' = isError ? 'error' : 'healthy'

    const metricEntries = Object.entries(flow.metrics ?? {})
        .filter(([, v]) => v !== undefined && v !== null)
        .slice(0, 2)

    const metricLabels: Record<string, string> = {
        execucoes: 'EXECUÇÕES',
        taxa_sucesso: 'TAXA DE SUCESSO',
        leads_processados: 'LEADS PROCESSADOS',
    }

    const canToggle = flow.status !== 'error'

    return (
        <motion.div
            variants={flowCardItemVariants}
            // CP-2 hover microinteraction: translateY(-2px) + neon border glow
            whileHover={{
                y: -2,
                boxShadow: "0 0 0 1px var(--accent-primary), 0 4px 20px rgba(162,230,53,0.15)",
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            }}
            whileTap={{
                y: 0,
                scale: 0.995,
                transition: { duration: 0.1 },
            }}
            className="relative bg-[var(--surface-card)] border border-[var(--border-default)] group overflow-hidden"
            style={{ padding: "20px" }}
        >
            {/* ShineBorder for error state — animated border sweep draws attention */}
            {isError && (
                <ShineBorder
                    borderWidth={1}
                    duration={6}
                    shineColor={["#ef4444", "#ff6b6b", "#ef4444"]}
                />
            )}

            {/* Corner ornaments — appear on hover via opacity transition */}
            <span
                className="absolute top-0 left-0 w-3 h-3 border-t border-l opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none"
                style={{ borderColor: "var(--accent-primary)" }}
            />
            <span
                className="absolute bottom-0 right-0 w-3 h-3 border-b border-r opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none"
                style={{ borderColor: "var(--accent-primary)" }}
            />

            {/* Ambient hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card Header */}
            <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Icon square 36×36 */}
                    <div
                        className="w-9 h-9 flex items-center justify-center border border-[var(--border-default)] bg-[var(--surface-elevated)] shrink-0"
                        aria-hidden="true"
                    >
                        <Icon className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
                    </div>
                    <div>
                        <p className="font-['Space_Grotesk'] font-semibold text-base text-[var(--text-primary)] leading-tight">
                            {flow.name}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {generateFlowId(flow.id)}
                        </p>
                    </div>
                </div>

                {/* Toggle switch — h-5 w-9, rounded-full thumb, neon glow when active */}
                <button
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Toggle ${flow.name}`}
                    disabled={!canToggle || isUpdating}
                    onClick={() => canToggle && onToggle(flow.id, flow.status)}
                    className={cn(
                        "relative w-9 h-5 shrink-0 transition-all duration-200 focus:outline-none rounded-full",
                        !canToggle && "opacity-40 cursor-not-allowed",
                        isUpdating && "opacity-60"
                    )}
                >
                    {/* Track */}
                    <span
                        className={cn(
                            "absolute inset-0 rounded-full transition-colors duration-200",
                            isActive ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-elevated)]"
                        )}
                        style={isActive ? { boxShadow: "0 0 6px rgba(162,230,53,0.5)" } : undefined}
                    />
                    {/* Thumb 16px */}
                    <span
                        className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                            isActive ? "translate-x-[18px]" : "translate-x-0.5"
                        )}
                    />
                </button>
            </div>

            {/* Card Body — metrics with gap-1 between label and value */}
            {metricEntries.length > 0 && (
                <div className="relative z-10 flex gap-6 mb-3">
                    {metricEntries.map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                            <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)]">
                                {metricLabels[key] ?? key.toUpperCase()}
                            </p>
                            <p className="font-mono font-bold text-[22px] text-[var(--text-primary)] leading-none">
                                {key === 'taxa_sucesso' ? `${value}%` : value?.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Sparkline — gap-3 (mb-4) between metrics and sparkline */}
            {flow.execution_history && flow.execution_history.length >= 2 && (
                <div className="relative z-10 w-full mb-4">
                    <SparklineChart
                        data={flow.execution_history}
                        variant={sparklineVariant}
                    />
                </div>
            )}

            {/* Card Footer */}
            <div className="relative z-10 flex items-center justify-between">
                {/* Status dot + label */}
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isActive && "bg-[var(--accent-primary)] pulse-live",
                            flow.status === 'paused' && "bg-[var(--text-secondary)]",
                            isError && "bg-[var(--status-error)] pulse-live"
                        )}
                        style={isActive ? { boxShadow: "0 0 4px rgba(162,230,53,0.7)" } : undefined}
                        aria-hidden="true"
                    />
                    <span
                        className={cn(
                            "font-mono text-[10px] uppercase tracking-widest",
                            isActive && "text-[var(--accent-primary)]",
                            flow.status === 'paused' && "text-[var(--text-secondary)]",
                            isError && "text-[var(--status-error)]"
                        )}
                    >
                        {flow.status === 'active' ? '● ATIVO' : flow.status === 'paused' ? '● PAUSADO' : '● ERRO'}
                    </span>
                </div>

                {/* "Última execução" — consistent Brazilian Portuguese */}
                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    Última execução: {formatLastRun(flow.last_run_at)}
                </span>
            </div>
        </motion.div>
    )
}
