"use client"

import { motion } from "framer-motion"
import { NumberTicker } from "@/components/ui/number-ticker"

// Stagger for the 4 stat cards
const statsContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
}

const statsItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

interface AgentCommandHeaderProps {
    totalAgents: number
    messagesToday: number
    responseRate: number
    n8nCount: number
}

export function AgentCommandHeader({
    totalAgents,
    messagesToday,
    responseRate,
    n8nCount,
}: AgentCommandHeaderProps) {
    return (
        <motion.div
            variants={statsContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
            {/* TOTAL DE AGENTES */}
            <motion.div
                variants={statsItemVariants}
                className="bg-[var(--surface-card)] border border-[var(--border-default)] p-3"
            >
                <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    TOTAL DE AGENTES
                </p>
                <p className="font-mono font-bold text-2xl text-[var(--text-primary)] leading-none">
                    <NumberTicker value={totalAgents} className="font-mono font-bold text-2xl" />
                </p>
            </motion.div>

            {/* MENSAGENS HOJE */}
            <motion.div
                variants={statsItemVariants}
                className="bg-[var(--surface-card)] border border-[var(--border-default)] p-3"
            >
                <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    MENSAGENS HOJE
                </p>
                <p className="font-mono font-bold text-2xl text-[var(--text-primary)] leading-none">
                    <NumberTicker value={messagesToday} className="font-mono font-bold text-2xl" />
                </p>
            </motion.div>

            {/* TAXA DE RESPOSTA */}
            <motion.div
                variants={statsItemVariants}
                className="bg-[var(--surface-card)] border border-[var(--border-default)] p-3"
            >
                <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    TAXA DE RESPOSTA
                </p>
                <p className="font-mono font-bold text-2xl text-[var(--text-primary)] leading-none">
                    {responseRate}%
                </p>
            </motion.div>

            {/* AUTOMAÇÕES N8N */}
            <motion.div
                variants={statsItemVariants}
                className="bg-[var(--surface-card)] border border-[var(--border-default)] p-3"
            >
                <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    AUTOMAÇÕES N8N
                </p>
                <p className="font-mono font-bold text-2xl text-[var(--text-primary)] leading-none">
                    {n8nCount > 0 ? (
                        <NumberTicker value={n8nCount} className="font-mono font-bold text-2xl" />
                    ) : (
                        <span className="text-[var(--text-secondary)] text-sm font-normal">
                            // AGUARDANDO N8N
                        </span>
                    )}
                </p>
            </motion.div>
        </motion.div>
    )
}
