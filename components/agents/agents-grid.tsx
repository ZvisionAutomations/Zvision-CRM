"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronDown } from "lucide-react"
import { AgentCard, agentCardItemVariants } from "./agent-card"
import { useAgents } from "@/hooks/useAgents"
import { cn } from "@/lib/utils"
import type { Agent, AgentStatus } from "@/types/database"

// Stagger container — each AgentCard consumes agentCardItemVariants
const agentsContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
}

interface AgentsGridProps {
    initialAgents: Agent[]
}

// Group client agents by client_name
function groupByClient(agents: Agent[]): Record<string, Agent[]> {
    const groups: Record<string, Agent[]> = {}
    for (const agent of agents) {
        const key = agent.client_name ?? "Sem cliente"
        if (!groups[key]) groups[key] = []
        groups[key].push(agent)
    }
    return groups
}

// Get overall status for a client group
function getGroupStatus(agents: Agent[]): AgentStatus {
    if (agents.some(a => a.status === "error")) return "error"
    if (agents.every(a => a.status === "paused")) return "paused"
    return "active"
}

export function AgentsGrid({ initialAgents }: AgentsGridProps) {
    const { agents, isUpdating, toggleAgentStatus } = useAgents(initialAgents)

    const internalAgents = agents.filter(a => a.is_internal)
    const clientAgents = agents.filter(a => !a.is_internal)
    const clientGroups = groupByClient(clientAgents)

    const handleToggle = (id: string, currentStatus: AgentStatus) => {
        toggleAgentStatus(id, currentStatus)
    }

    if (agents.length === 0) {
        return <EmptyState />
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN — Internal agents */}
            <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent-primary)] mb-4">
                    // OPERAÇÃO INTERNA
                </p>
                {internalAgents.length === 0 ? (
                    <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                        Nenhum agente interno registrado
                    </p>
                ) : (
                    <motion.div
                        variants={agentsContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-4"
                    >
                        {internalAgents.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                isUpdating={isUpdating[agent.id] ?? false}
                                onToggle={handleToggle}
                            />
                        ))}
                    </motion.div>
                )}

                {/* N8N Section — Internal */}
                <N8NPlaceholder />
            </div>

            {/* RIGHT COLUMN — Client agents */}
            <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                    // CLIENTES
                </p>
                {Object.keys(clientGroups).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative corner-brackets px-6 py-8 text-center border border-[var(--border-default)]">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
                                // NENHUM AGENTE DE CLIENTE CONFIGURADO
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {Object.entries(clientGroups).map(([clientName, clientAgentList]) => (
                            <ClientSection
                                key={clientName}
                                clientName={clientName}
                                agents={clientAgentList}
                                isUpdating={isUpdating}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                )}

                {/* N8N Section — Clients */}
                <N8NPlaceholder />
            </div>
        </div>
    )
}

// ─── Client drill-down section ────────────────────────────────────────────────

interface ClientSectionProps {
    clientName: string
    agents: Agent[]
    isUpdating: Record<string, boolean>
    onToggle: (id: string, currentStatus: AgentStatus) => void
}

function ClientSection({ clientName, agents, isUpdating, onToggle }: ClientSectionProps) {
    const [expanded, setExpanded] = useState(true)
    const groupStatus = getGroupStatus(agents)

    return (
        <div className="border border-[var(--border-default)] bg-[var(--surface-card)]">
            {/* Client Header — clickable to expand/collapse */}
            <button
                onClick={() => setExpanded(prev => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-elevated)] transition-colors duration-150"
            >
                {expanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                )}

                <span className="font-['Space_Grotesk'] font-semibold text-sm text-[var(--text-primary)]">
                    {clientName}
                </span>

                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-elevated)] px-1.5 py-0.5 border border-[var(--border-default)]">
                    {agents.length} {agents.length === 1 ? "agente" : "agentes"}
                </span>

                {/* Overall status dot */}
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full ml-auto shrink-0",
                        groupStatus === "active" && "bg-[var(--accent-primary)]",
                        groupStatus === "paused" && "bg-[var(--text-secondary)]",
                        groupStatus === "error" && "bg-[var(--status-error)]"
                    )}
                    style={groupStatus === "active" ? { boxShadow: "0 0 4px rgba(162,230,53,0.7)" } : undefined}
                />
            </button>

            {/* Expanded content — CSS height transition */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-4 pb-4 flex flex-col gap-4">
                    {agents.map(agent => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            isUpdating={isUpdating[agent.id] ?? false}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── N8N Placeholder ──────────────────────────────────────────────────────────

function N8NPlaceholder() {
    return (
        <div
            className="mt-6 border border-dashed border-[var(--accent-primary)]/20 rounded px-4 py-4 flex flex-col items-center justify-center gap-2"
        >
            {/* Corner brackets */}
            <div className="relative w-full flex flex-col items-center py-4">
                <span
                    className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none"
                    style={{ borderColor: "rgba(162,230,53,0.2)" }}
                />
                <span
                    className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none"
                    style={{ borderColor: "rgba(162,230,53,0.2)" }}
                />

                <p className="font-mono text-[11px] text-[var(--text-secondary)] text-center">
                    // N8N — AGUARDANDO CONEXÃO
                </p>
                <p className="font-mono text-[11px] text-[var(--text-secondary)] opacity-60 text-center mt-1">
                    Configure a integração N8N nas configurações
                </p>
            </div>
        </div>
    )
}

// ─── Empty state — no agents at all ───────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="relative corner-brackets px-8 py-10 text-center border border-[var(--border-default)]">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                    // NENHUM AGENTE REGISTRADO
                </p>
                <p className="font-mono text-[11px] text-[var(--text-secondary)] opacity-60">
                    Os agentes aparecerão aqui quando configurados
                </p>
            </div>
        </div>
    )
}
