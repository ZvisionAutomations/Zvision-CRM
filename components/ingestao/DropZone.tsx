"use client"

import React, { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IngestaoState } from "@/hooks/useIngestao"

interface DropZoneProps {
    state: IngestaoState
    fileName: string | null
    importedCount: number
    onFile: (file: File) => void
    onReset: () => void
}

export function DropZone({ state, fileName, importedCount, onFile, onReset }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onFile(file)
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) onFile(file)
    }

    // ── COMPLETE state ────────────────────────────────────────────────────────
    if (state === 'complete') {
        return (
            <motion.div
                key="complete"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="relative flex flex-col items-center justify-center gap-4 rounded-xl border p-12 text-center"
                style={{
                    background: 'rgba(162,230,53,0.04)',
                    borderColor: 'var(--border-bright)',
                }}
            >
                {/* Corner ornaments */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: 'var(--accent-primary)' }} />
                <span className="absolute top-3 right-3 w-3 h-3 border-t border-r" style={{ borderColor: 'var(--accent-primary)' }} />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l" style={{ borderColor: 'var(--accent-primary)' }} />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: 'var(--accent-primary)' }} />

                <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--accent-primary)' }} />
                <div
                    className="font-mono font-bold leading-none"
                    style={{ fontSize: '4rem', color: 'var(--accent-primary)' }}
                >
                    {importedCount}
                </div>
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    // INGESTÃO CONCLUÍDA
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="mt-2 font-mono text-xs gap-2 border-white/10 text-foreground/70 hover:text-white hover:bg-white/5"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    NOVA INGESTÃO
                </Button>
            </motion.div>
        )
    }

    // ── PARSING / UPLOADING state: compact bar ────────────────────────────────
    if (state === 'parsing' || state === 'uploading') {
        return (
            <motion.div
                key="processing"
                initial={{ height: 'auto' }}
                animate={{ height: '120px' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="relative overflow-hidden rounded-xl border flex items-center justify-center"
                style={{ borderColor: 'var(--accent-primary)', background: 'rgba(162,230,53,0.03)' }}
            >
                {/* Border beam animation */}
                <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
                        opacity: 0.15,
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="z-10 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: 'var(--accent-primary)' }}
                        />
                        <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--accent-primary)' }}>
                            {state === 'parsing' ? '// PARSING DATA STREAM...' : '// UPLOADING TO SUPABASE...'}
                        </span>
                    </div>
                    {fileName && (
                        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-xs">{fileName}</span>
                    )}
                </div>
            </motion.div>
        )
    }

    // ── ERROR state ───────────────────────────────────────────────────────────
    if (state === 'error') {
        return (
            <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center"
                style={{ borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.03)' }}
            >
                <span className="font-mono text-xs" style={{ color: 'var(--destructive)' }}>// FALHA NA INGESTÃO — VERIFIQUE O LOG</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="font-mono text-xs gap-2 border-white/10 text-foreground/70 hover:text-white hover:bg-white/5"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    TENTAR NOVAMENTE
                </Button>
            </motion.div>
        )
    }

    // ── IDLE state ────────────────────────────────────────────────────────────
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all max-w-[480px] mx-auto"
                style={{
                    borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(162,230,53,0.4)',
                    background: isDragging ? 'rgba(162,230,53,0.06)' : 'rgba(17,17,17,0.8)',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                />

                {/* Corner ornaments */}
                <span
                    className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 transition-all"
                    style={{ borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(162,230,53,0.4)' }}
                />
                <span
                    className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 transition-all"
                    style={{ borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(162,230,53,0.4)' }}
                />
                <span
                    className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 transition-all"
                    style={{ borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(162,230,53,0.4)' }}
                />
                <span
                    className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 transition-all"
                    style={{ borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(162,230,53,0.4)' }}
                />

                <div
                    className="w-16 h-16 rounded-full border flex items-center justify-center mb-5 transition-all"
                    style={{
                        borderColor: isDragging ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                        background: 'var(--surface-page)',
                    }}
                >
                    <UploadCloud
                        className={`w-7 h-7 transition-all ${isDragging ? 'scale-110' : ''}`}
                        style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    />
                </div>

                <h3
                    className="font-mono font-semibold text-sm tracking-[0.15em] uppercase mb-2"
                    style={{ color: 'rgba(240,240,240,0.9)' }}
                >
                    // DROP EXCEL OR CSV FILE
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    XLSX · XLS · CSV · MAX 5MB
                </p>
            </motion.div>
        </AnimatePresence>
    )
}
