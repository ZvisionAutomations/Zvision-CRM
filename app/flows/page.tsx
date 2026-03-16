import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FlowsGrid } from "@/components/flows/flows-grid"
import { getFlows } from "@/lib/actions/flows"
import type { Flow } from "@/types/database"

// Server component — fetches initial flows, passes to client grid
export default async function FlowsPage() {
    const { flows, error } = await getFlows()

    // Count active and paused for header counters
    const activeCount = flows.filter((f: Flow) => f.status === 'active').length
    const pausedCount = flows.filter((f: Flow) => f.status === 'paused').length

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
                {/* Page Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1
                            className="font-['Space_Grotesk'] font-bold text-2xl text-[var(--text-primary)] leading-tight"
                        >
                            // AUTOMATION_FLOWS
                        </h1>
                        <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-1">
                            Monitor e controle de automações ativas do sistema
                        </p>
                    </div>

                    {/* Active / Paused counters — only show when data is present */}
                    {flows.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                                    {activeCount} ATIVOS
                                </span>
                            </div>
                            <div className="w-px h-4 bg-[var(--border-default)]" />
                            <div className="text-right">
                                <span className="font-mono font-bold text-sm text-[var(--text-secondary)]">
                                    {pausedCount} PAUSADOS
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* DB not migrated yet — informational banner */}
                {error === 'TABLE_NOT_FOUND' && (
                    <div className="mb-6 px-4 py-3 border border-[var(--border-default)] bg-[var(--surface-elevated)]">
                        <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                            // TABELA NÃO ENCONTRADA — aplique{" "}
                            <code className="text-[var(--accent-primary)]">
                                supabase/migrations/006_flows.sql
                            </code>{" "}
                            no dashboard Supabase para ativar esta tela.
                        </p>
                    </div>
                )}

                {/* Flows grid — client component with stagger + toggle */}
                <FlowsGrid initialFlows={flows} />
            </div>
        </DashboardLayout>
    )
}
