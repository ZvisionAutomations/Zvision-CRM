"use client"

import { motion } from "framer-motion"
import { FlowCard, flowCardItemVariants } from "./flow-card"
import { useFlows } from "@/hooks/useFlows"
import type { Flow, FlowStatus } from "@/types/database"

// Stagger container — each FlowCard consumes flowCardItemVariants
const flowsContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
}

interface FlowsGridProps {
    initialFlows: Flow[]
}

export function FlowsGrid({ initialFlows }: FlowsGridProps) {
    const { flows, isUpdating, toggleFlowStatus } = useFlows(initialFlows)

    const internalFlows = flows.filter(f => f.type === 'internal')
    const clientFlows = flows.filter(f => f.type === 'client')

    const handleToggle = (id: string, currentStatus: FlowStatus) => {
        toggleFlowStatus(id, currentStatus)
    }

    if (flows.length === 0) {
        return <EmptyState />
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Internal flows column */}
            <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent-primary)] mb-4">
                    // FLUXOS INTERNOS
                </p>
                {internalFlows.length === 0 ? (
                    <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                        Nenhum fluxo interno registrado
                    </p>
                ) : (
                    <motion.div
                        variants={flowsContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-4"
                    >
                        {internalFlows.map(flow => (
                            <FlowCard
                                key={flow.id}
                                flow={flow}
                                isUpdating={isUpdating[flow.id] ?? false}
                                onToggle={handleToggle}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Client flows column */}
            <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
                    // FLUXOS DE CLIENTES
                </p>
                {clientFlows.length === 0 ? (
                    <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                        Nenhum fluxo de cliente registrado
                    </p>
                ) : (
                    <motion.div
                        variants={flowsContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-4"
                    >
                        {clientFlows.map(flow => (
                            <FlowCard
                                key={flow.id}
                                flow={flow}
                                isUpdating={isUpdating[flow.id] ?? false}
                                onToggle={handleToggle}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="relative corner-brackets px-8 py-10 text-center border border-[var(--border-default)]">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                    // NENHUMA AUTOMAÇÃO REGISTRADA
                </p>
                <p className="font-mono text-[11px] text-[var(--text-secondary)] opacity-60">
                    Os fluxos aparecerão aqui quando configurados
                </p>
            </div>
        </div>
    )
}
