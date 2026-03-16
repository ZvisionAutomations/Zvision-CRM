"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useIngestao } from "@/hooks/useIngestao"
import { DropZone } from "@/components/ingestao/DropZone"
import { TerminalLog } from "@/components/ingestao/TerminalLog"
import { RecentUploads } from "@/components/ingestao/RecentUploads"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function IngestaoPage() {
    const { state, log, importedCount, fileName, processFile, resetToIdle } = useIngestao()
    // Bumped after each completed upload to trigger RecentUploads refetch
    const [refreshKey, setRefreshKey] = useState(0)

    function handleReset() {
        resetToIdle()
        // Refetch recent uploads when going back to idle from complete
        setRefreshKey(k => k + 1)
    }

    // Trigger RecentUploads refetch when upload completes
    const prevStateRef = React.useRef(state)
    React.useEffect(() => {
        if (prevStateRef.current === 'uploading' && state === 'complete') {
            setRefreshKey(k => k + 1)
        }
        prevStateRef.current = state
    }, [state])

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span
                            className="w-1.5 h-6 rounded-sm"
                            style={{ background: 'var(--accent-primary)' }}
                        />
                        <h1
                            className="font-mono font-bold text-xl uppercase tracking-[0.2em]"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            // INGESTÃO DE DADOS
                        </h1>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground ml-[18px] tracking-wide">
                        // Importe leads em massa via planilha — CSV ou XLSX
                    </p>
                </motion.div>

                {/* Column mapping reference */}
                <motion.details
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8 group"
                >
                    <summary
                        className="font-mono text-[11px] uppercase tracking-widest cursor-pointer select-none list-none flex items-center gap-2"
                        style={{ color: 'rgba(240,240,240,0.35)' }}
                    >
                        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                        // MAPEAMENTO DE COLUNAS SUPORTADAS
                    </summary>
                    <div
                        className="mt-3 rounded-lg border p-4 grid grid-cols-2 gap-x-8 gap-y-1"
                        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}
                    >
                        {[
                            ['nome, name, contato', 'name'],
                            ['empresa, company, organizacao', 'company_name'],
                            ['email, e-mail', 'email'],
                            ['telefone, phone, tel', 'phone'],
                            ['website, site, url', 'company_website'],
                            ['linkedin', 'company_linkedin'],
                            ['valor, valuation, value', 'estimated_value'],
                            ['etapa, stage, pipeline', 'pipeline_stage'],
                        ].map(([csv, db]) => (
                            <div key={db} className="flex items-center gap-2 font-mono text-[10px]">
                                <span className="text-muted-foreground truncate">{csv}</span>
                                <span className="text-muted-foreground/60">→</span>
                                <span style={{ color: 'var(--accent-primary)' }}>{db}</span>
                            </div>
                        ))}
                    </div>
                </motion.details>

                {/* Drop zone */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-6"
                >
                    <DropZone
                        state={state}
                        fileName={fileName}
                        importedCount={importedCount}
                        onFile={processFile}
                        onReset={handleReset}
                    />
                </motion.div>

                {/* Terminal log — only visible when log has entries */}
                <AnimatePresence>
                    {log.length > 0 && (
                        <motion.div
                            key="terminal"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="mb-8 overflow-hidden"
                        >
                            <TerminalLog entries={log} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div
                    className="my-8 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                />

                {/* Recent uploads */}
                <RecentUploads refreshKey={refreshKey} />

            </div>
        </DashboardLayout>
    )
}
