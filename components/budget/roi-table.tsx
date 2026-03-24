"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/formatters"

interface ClientROI {
    name: string
    mrr: number
    custoOp: number
    lucro: number
    margem: number
    status: 'LUCRATIVO' | 'ATENÇÃO' | 'PREJUÍZO'
}

interface RoiTableProps {
    clients: ClientROI[]
}

// ─── Corner brackets for PREJUÍZO rows ───────────────────────────────────────
function CornerBrackets() {
    return (
        <>
            {/* Top-left */}
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[var(--status-error,#ef4444)]" />
            {/* Top-right */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[var(--status-error,#ef4444)]" />
            {/* Bottom-left */}
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[var(--status-error,#ef4444)]" />
            {/* Bottom-right */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--status-error,#ef4444)]" />
        </>
    )
}

const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
}

function getMargemBadgeStyle(margem: number): { bg: string; text: string } {
    if (margem > 40) return { bg: 'var(--accent-primary)', text: 'var(--surface-page, #0A0A0A)' }
    if (margem > 20) return { bg: 'var(--status-warning, #f59e0b)', text: 'var(--surface-page, #0A0A0A)' }
    return { bg: 'var(--status-error, #ef4444)', text: '#fff' }
}

function getStatusBadge(status: ClientROI['status']): { bg: string; text: string; label: string } {
    switch (status) {
        case 'LUCRATIVO':
            return { bg: 'var(--accent-primary)', text: 'var(--surface-page, #0A0A0A)', label: 'LUCRATIVO' }
        case 'ATENÇÃO':
            return { bg: 'var(--status-warning, #f59e0b)', text: 'var(--surface-page, #0A0A0A)', label: 'ATENÇÃO' }
        case 'PREJUÍZO':
            return { bg: 'var(--status-error, #ef4444)', text: '#fff', label: 'PREJUÍZO' }
    }
}

export function RoiTable({ clients }: RoiTableProps) {
    if (clients.length === 0) {
        return (
            <div className="relative border border-[var(--border-default)] p-8 flex items-center justify-center">
                {/* Corner brackets */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[var(--accent-primary)]" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--accent-primary)]" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[var(--accent-primary)]" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--accent-primary)]" />
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
                    // NENHUM CLIENTE ATIVO PARA ANÁLISE
                </p>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
        >
            {/* Header row */}
            <div
                className="grid gap-3 px-3 py-2"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr' }}
            >
                {['CLIENTE', 'MRR', 'CUSTO OP.', 'LUCRO', 'MARGEM %', 'STATUS'].map((col) => (
                    <p key={col} className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)]">
                        {col}
                    </p>
                ))}
            </div>

            {/* Data rows */}
            {clients.map((client) => {
                const margemStyle = getMargemBadgeStyle(client.margem)
                const statusBadge = getStatusBadge(client.status)
                const isPrejuizo = client.status === 'PREJUÍZO'

                return (
                    <motion.div
                        key={client.name}
                        variants={rowVariants}
                        className="relative grid gap-3 items-center bg-[var(--surface-card)] border border-[var(--border-default)] px-3 py-3 rounded-[4px] transition-all duration-200 hover:border-[var(--accent-primary)]/25 hover:-translate-y-[1px]"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr' }}
                    >
                        {isPrejuizo && <CornerBrackets />}

                        {/* CLIENTE */}
                        <p className="font-['Space_Grotesk'] font-semibold text-[13px] text-[var(--text-primary)] truncate">
                            {client.name}
                        </p>

                        {/* MRR */}
                        <p className="font-mono font-bold text-[13px] text-[var(--accent-primary)]">
                            {formatCurrency(client.mrr)}
                        </p>

                        {/* CUSTO OP. */}
                        <p className="font-mono text-[13px] text-[var(--text-primary)]">
                            {formatCurrency(client.custoOp)}
                        </p>

                        {/* LUCRO */}
                        <p
                            className="font-mono font-bold text-[13px]"
                            style={{
                                color: client.lucro >= 0
                                    ? 'var(--accent-primary)'
                                    : 'var(--status-error, #ef4444)',
                            }}
                        >
                            {formatCurrency(client.lucro)}
                        </p>

                        {/* MARGEM % pill */}
                        <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm font-mono text-[11px] font-bold w-fit"
                            style={{
                                backgroundColor: margemStyle.bg,
                                color: margemStyle.text,
                            }}
                        >
                            {client.margem.toFixed(1)}%
                        </span>

                        {/* STATUS badge */}
                        <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider w-fit"
                            style={{
                                backgroundColor: statusBadge.bg,
                                color: statusBadge.text,
                            }}
                        >
                            {statusBadge.label}
                        </span>
                    </motion.div>
                )
            })}
        </motion.div>
    )
}

// ─── Helper: compute ROI data from deals and expenses ────────────────────────
export interface ClientROIData {
    name: string
    mrr: number
    custoOp: number
    lucro: number
    margem: number
    status: 'LUCRATIVO' | 'ATENÇÃO' | 'PREJUÍZO'
}

export function computeClientROI(
    dealsByCompany: Record<string, number>,
    totalExpenses: number
): ClientROIData[] {
    const companyNames = Object.keys(dealsByCompany)
    if (companyNames.length === 0) return []

    const activeClients = companyNames.length
    const costPerClient = totalExpenses / activeClients

    return companyNames.map((name) => {
        const mrr = dealsByCompany[name]
        const custoOp = costPerClient
        const lucro = mrr - custoOp
        const margem = mrr > 0 ? (lucro / mrr) * 100 : 0
        const status: ClientROIData['status'] =
            margem > 20 ? 'LUCRATIVO' : margem > 0 ? 'ATENÇÃO' : 'PREJUÍZO'

        return { name, mrr, custoOp, lucro, margem, status }
    }).sort((a, b) => b.margem - a.margem)
}
