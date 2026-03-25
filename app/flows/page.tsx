import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AgentsGrid } from "@/components/agents/agents-grid"
import { AgentCommandHeader } from "@/components/agents/agent-command-header"
import { getAgents } from "@/lib/actions/agents"
import type { Agent } from "@/types/database"

export const dynamic = 'force-dynamic'

// Server component — fetches agents, renders the Agent Command Center
export default async function AgentsPage() {
    const { agents, error } = await getAgents()

    // Count by status for header counters
    const activeCount = agents.filter((a: Agent) => a.status === "active").length
    const pausedCount = agents.filter((a: Agent) => a.status === "paused").length
    const errorCount = agents.filter((a: Agent) => a.status === "error").length

    // Stats for global bar
    const totalAgents = agents.length
    const messagesToday = agents.reduce(
        (sum: number, a: Agent) => sum + (a.metrics.mensagens ?? 0),
        0
    )
    const avgResponseRate =
        agents.length > 0
            ? Math.round(
                agents.reduce(
                    (sum: number, a: Agent) => sum + (a.metrics.taxa_resposta ?? 0),
                    0
                ) / agents.length
            )
            : 0
    // N8N workflows count — placeholder until n8n integration
    const n8nCount = agents.filter((a: Agent) => a.type === "n8n").length

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
                {/* Layer 1 — Global Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-[var(--text-primary)] leading-tight">
                            // CENTRO DE COMANDO — AGENTES
                        </h1>
                        <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-1">
                            Monitoramento e controle de agentes de automação
                        </p>
                    </div>

                    {/* Status counters */}
                    <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                            {activeCount} ATIVOS
                        </span>
                        <div className="w-px h-4 bg-[var(--border-default)]" />
                        <span className="font-mono font-bold text-sm text-[var(--text-secondary)]">
                            {pausedCount} PAUSADOS
                        </span>
                        <div className="w-px h-4 bg-[var(--border-default)]" />
                        <span className="font-mono font-bold text-sm text-[var(--status-error)]">
                            {errorCount} ERRO
                        </span>
                    </div>
                </div>

                {/* Layer 2 — Global Stats Bar */}
                <AgentCommandHeader
                    totalAgents={totalAgents}
                    messagesToday={messagesToday}
                    responseRate={avgResponseRate}
                    n8nCount={n8nCount}
                />

                {/* DB not migrated yet — informational banner */}
                {error === "TABLE_NOT_FOUND" && (
                    <div className="mb-6 px-4 py-3 border border-[var(--border-default)] bg-[var(--surface-elevated)]">
                        <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                            // TABELA NÃO ENCONTRADA — aplique{" "}
                            <code className="text-[var(--accent-primary)]">
                                supabase/migrations/007_agents.sql
                            </code>{" "}
                            no dashboard Supabase para ativar esta tela.
                        </p>
                    </div>
                )}

                {/* Layer 3 — Two Column Layout */}
                <AgentsGrid initialAgents={agents} />
            </div>
        </DashboardLayout>
    )
}
