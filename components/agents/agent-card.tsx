"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Agent, AgentStatus } from "@/types/database"
import {
    Target,
    MessageCircle,
    Filter,
    Smartphone,
    Zap,
} from "lucide-react"

// Stagger item variants — parent supplies the container
export const agentCardItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface AgentCardProps {
    agent: Agent
    isUpdating: boolean
    onToggle: (id: string, currentStatus: AgentStatus) => void
}

// Icon map by agent type
const agentIconMap = {
    sdr: Target,
    atendente: MessageCircle,
    qualificador: Filter,
    whatsapp: Smartphone,
    n8n: Zap,
} as const

// Type badge labels
const typeBadgeLabels: Record<Agent["type"], string> = {
    sdr: "SDR",
    atendente: "ATENDENTE",
    qualificador: "QUALIFICADOR",
    whatsapp: "WHATSAPP",
    n8n: "N8N",
}

// Platform badge labels
const platformBadgeLabels: Record<Agent["platform"], string> = {
    interno: "INTERNO",
    whatsapp: "WHATSAPP",
    n8n: "N8N",
}

function formatLastActive(lastActiveAt: string): string {
    try {
        return formatDistanceToNow(new Date(lastActiveAt), { addSuffix: false, locale: ptBR })
    } catch {
        return "Desconhecido"
    }
}

function generateAgentId(id: string): string {
    return `#AG-${id.slice(-4).toUpperCase()}`
}

export function AgentCard({ agent, isUpdating, onToggle }: AgentCardProps) {
    const Icon = agentIconMap[agent.type]
    const isError = agent.status === "error"
    const isActive = agent.status === "active"
    const isPaused = agent.status === "paused"
    const canToggle = agent.status !== "error"

    // Show leads_qualificados only for SDR/qualificador types
    const showLeadsQual = agent.type === "sdr" || agent.type === "qualificador"

    return (
        <motion.div
            variants={agentCardItemVariants}
            whileHover={{
                y: -2,
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
            {/* Corner ornaments — appear on hover */}
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

            {/* Hover border glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(162,230,53,0.25)" }}
            />

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
                        <div className="flex items-center gap-2">
                            <p className="font-['Space_Grotesk'] font-semibold text-base text-[var(--text-primary)] leading-tight">
                                {agent.name}
                            </p>
                            {/* Type badge */}
                            <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border border-[var(--border-default)]">
                                {typeBadgeLabels[agent.type]}
                            </span>
                        </div>
                        <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {generateAgentId(agent.id)}
                        </p>
                    </div>
                </div>

                {/* Toggle switch */}
                <button
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Toggle ${agent.name}`}
                    disabled={!canToggle || isUpdating}
                    onClick={() => canToggle && onToggle(agent.id, agent.status)}
                    className={cn(
                        "relative w-9 h-5 shrink-0 transition-all duration-200 focus:outline-none rounded-full",
                        !canToggle && "opacity-40 cursor-not-allowed",
                        isUpdating && "opacity-60"
                    )}
                >
                    <span
                        className={cn(
                            "absolute inset-0 rounded-full transition-colors duration-200",
                            isActive ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-elevated)]"
                        )}
                        style={isActive ? { boxShadow: "0 0 6px rgba(162,230,53,0.5)" } : undefined}
                    />
                    <span
                        className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                            isActive ? "translate-x-[18px]" : "translate-x-0.5"
                        )}
                    />
                </button>
            </div>

            {/* Card Body — 3 metrics side by side */}
            <div className="relative z-10 flex gap-6 mb-3">
                <div className="flex flex-col gap-1">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)]">
                        MENSAGENS
                    </p>
                    <p className="font-mono font-bold text-xl text-[var(--text-primary)] leading-none">
                        {agent.metrics.mensagens?.toLocaleString("pt-BR") ?? "0"}
                    </p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)]">
                        TAXA RESP.
                    </p>
                    <p className="font-mono font-bold text-xl text-[var(--text-primary)] leading-none">
                        {agent.metrics.taxa_resposta != null ? `${agent.metrics.taxa_resposta}%` : "—"}
                    </p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)]">
                        LEADS QUAL.
                    </p>
                    <p className="font-mono font-bold text-xl text-[var(--text-primary)] leading-none">
                        {showLeadsQual
                            ? (agent.metrics.leads_qualificados?.toLocaleString("pt-BR") ?? "0")
                            : "—"}
                    </p>
                </div>
            </div>

            {/* Sparkline — pure SVG, 7 data points */}
            {agent.activity_history && agent.activity_history.length >= 2 && (
                <div className="relative z-10 w-full mb-4">
                    <AgentSparkline
                        data={agent.activity_history}
                        status={agent.status}
                    />
                </div>
            )}

            {/* Card Footer */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Status dot + label */}
                    <div className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive && "bg-[var(--accent-primary)] pulse-live",
                                isPaused && "bg-[var(--text-secondary)]",
                                isError && "bg-[var(--status-error)] pulse-live"
                            )}
                            style={isActive ? { boxShadow: "0 0 4px rgba(162,230,53,0.7)" } : undefined}
                            aria-hidden="true"
                        />
                        <span
                            className={cn(
                                "font-mono text-[10px] uppercase tracking-widest",
                                isActive && "text-[var(--accent-primary)]",
                                isPaused && "text-[var(--text-secondary)]",
                                isError && "text-[var(--status-error)]"
                            )}
                        >
                            {isActive ? "● ATIVO" : isPaused ? "● PAUSADO" : "● ERRO"}
                        </span>
                    </div>

                    {/* Platform badge */}
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-1.5 py-0.5 border border-[var(--border-default)]">
                        {platformBadgeLabels[agent.platform]}
                    </span>
                </div>

                {/* Last activity */}
                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    Última atividade: {formatLastActive(agent.last_active_at)} atrás
                </span>
            </div>
        </motion.div>
    )
}

// ─── AgentSparkline — variant that supports muted color for paused agents ─────
// Reuses the same SVG approach as SparklineChart but with status-aware coloring

interface AgentSparklineProps {
    data: number[]
    status: AgentStatus
}

function AgentSparkline({ data, status }: AgentSparklineProps) {
    if (!data || data.length < 2) return null

    const width = 100
    const height = 24

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * (height - 4) - 2
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })

    const pointsStr = points.join(" ")

    // Color based on agent status
    const stroke =
        status === "error"
            ? "var(--destructive)"
            : status === "paused"
                ? "var(--text-secondary)"
                : "var(--accent-primary)"

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            width="100%"
            height={height}
            aria-hidden="true"
        >
            <polyline
                points={pointsStr}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}
