"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getRecentImports } from "@/lib/actions/imports"
import type { Import } from "@/types/database"

interface RecentUploadsProps {
    // Bump this to trigger a refetch after a successful upload
    refreshKey: number
}

type StatusVariant = 'COMPLETED' | 'FAILED' | 'PROCESSING'

const STATUS_LABELS: Record<StatusVariant, string> = {
    COMPLETED:  'COMPLETO',
    FAILED:     'ERRO',
    PROCESSING: 'PARCIAL',
}

const STATUS_COLORS: Record<StatusVariant, string> = {
    COMPLETED:  'var(--accent-primary)',
    FAILED:     '#FF4444',
    PROCESSING: '#F59E0B',
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0 animate-pulse">
            <div className="h-3 w-36 rounded bg-white/10" />
            <div className="h-3 w-12 rounded bg-white/10 ml-auto" />
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-5 w-16 rounded bg-white/10" />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variant = (['COMPLETED', 'FAILED', 'PROCESSING'].includes(status)
        ? status
        : 'PROCESSING') as StatusVariant

    return (
        <span
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border"
            style={{
                color: STATUS_COLORS[variant],
                borderColor: STATUS_COLORS[variant],
                background: `${STATUS_COLORS[variant]}15`,
            }}
        >
            {STATUS_LABELS[variant]}
        </span>
    )
}

export function RecentUploads({ refreshKey }: RecentUploadsProps) {
    const [imports, setImports] = useState<Import[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const fetchImports = useCallback(async () => {
        setIsLoading(true)
        setFetchError(null)
        const { imports: data, error } = await getRecentImports()
        if (error) setFetchError(error)
        else setImports(data)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        fetchImports()
    }, [fetchImports, refreshKey])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    // HISTÓRICO DE INGESTÕES
                </span>
                {!isLoading && (
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                        {imports.length} registros
                    </span>
                )}
            </div>

            {/* Table header */}
            <div
                className="grid grid-cols-[1fr_80px_120px_96px] gap-4 px-4 py-2 border-b font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60"
                style={{ borderColor: 'rgba(255,255,255,0.04)', background: '#0A0A0A' }}
            >
                <span>Arquivo</span>
                <span className="text-right">Linhas</span>
                <span>Importado</span>
                <span>Status</span>
            </div>

            {/* Rows */}
            <div>
                {isLoading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : fetchError ? (
                    <div className="px-4 py-6 text-center font-mono text-[11px] text-muted-foreground/60">
                        // ERRO AO CARREGAR HISTÓRICO
                    </div>
                ) : imports.length === 0 ? (
                    <div className="px-4 py-8 text-center font-mono text-[11px] text-muted-foreground/60">
                        // NENHUMA INGESTÃO REGISTRADA
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {imports.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.04 }}
                                className="grid grid-cols-[1fr_80px_120px_96px] gap-4 px-4 py-3 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors"
                            >
                                <span
                                    className="font-mono text-xs text-foreground/70 truncate"
                                    title={item.filename}
                                >
                                    {item.filename}
                                </span>
                                <span className="font-mono text-xs text-right" style={{ color: 'var(--accent-primary)' }}>
                                    {item.processed_rows ?? item.total_rows ?? '—'}
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(item.created_at), {
                                        addSuffix: true,
                                        locale: ptBR,
                                    })}
                                </span>
                                <StatusBadge status={item.status} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    )
}
