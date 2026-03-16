"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { LogEntry, LogLevel } from "@/hooks/useIngestao"

interface TerminalLogProps {
    entries: LogEntry[]
}

const LEVEL_COLORS: Record<LogLevel, string> = {
    ok:   '#A2E635',   // accent-primary
    skip: '#F59E0B',   // warning amber
    err:  '#FF4444',   // error red
    done: '#A2E635',   // accent-primary bold
    info: 'rgba(240,240,240,0.5)', // text-secondary
}

const LEVEL_PREFIX: Record<LogLevel, string> = {
    ok:   '[OK]  ',
    skip: '[SKIP]',
    err:  '[ERR] ',
    done: '[DONE]',
    info: '>>    ',
}

function LogLine({ entry, isOld }: { entry: LogEntry; isOld: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: isOld ? 0.4 : 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-start gap-2 py-0.5 px-3 text-[11px] font-mono leading-5"
        >
            <span
                className={entry.level === 'done' ? 'font-bold' : 'font-normal'}
                style={{ color: LEVEL_COLORS[entry.level], flexShrink: 0, letterSpacing: '0.05em' }}
            >
                {LEVEL_PREFIX[entry.level]}
            </span>
            <span
                className={entry.level === 'done' ? 'font-bold' : 'font-normal'}
                style={{ color: LEVEL_COLORS[entry.level] }}
            >
                {entry.message}
            </span>
        </motion.div>
    )
}

export function TerminalLog({ entries }: TerminalLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [entries.length])

    if (entries.length === 0) return null

    // Last 200 entries — older ones (>100) get faded
    const displayed = entries.slice(-200)
    const fadeThreshold = Math.max(0, displayed.length - 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0A0A0A' }}
        >
            {/* Header bar */}
            <div
                className="flex items-center gap-2 px-3 py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}
            >
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                    // TERMINAL — INGESTÃO LOG
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                    {entries.length} linhas
                </span>
            </div>

            {/* Log lines — tactical-scroll */}
            <div
                className="max-h-[280px] overflow-y-auto py-2"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(162,230,53,0.3) transparent',
                }}
            >
                <AnimatePresence initial={false}>
                    {displayed.map((entry, i) => (
                        <LogLine
                            key={entry.id}
                            entry={entry}
                            isOld={i < fadeThreshold}
                        />
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </motion.div>
    )
}
