"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X, Target, Clock, TrendingUp, Activity,
    Terminal, Database, Zap, ChevronRight, RefreshCw,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Lead, Activity as ActivityType, PipelineStage, ActivityType as ActivityKind } from "@/types/database"
import { useLeadBriefing } from "@/hooks/useLeadBriefing"

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeadIntelPanelProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    leadName: string
}

// ─── Stage display map ────────────────────────────────────────────────────────
const STAGE_LABELS: Record<PipelineStage, string> = {
    NOVO_LEAD:         "NOVO ALVO",
    QUALIFICACAO:      "QUALIFICAÇÃO",
    REUNIAO_BRIEFING:  "BRIEFING",
    REUNIAO_PROPOSTA:  "PROPOSTA",
    FECHAMENTO:        "FECHAMENTO",
    KIA:               "KIA",
}

// Tactical green for stages that are active, red for KIA
const STAGE_COLORS: Record<PipelineStage, string> = {
    NOVO_LEAD:         "var(--accent-primary)",
    QUALIFICACAO:      "var(--accent-primary)",
    REUNIAO_BRIEFING:  "var(--accent-primary)",
    REUNIAO_PROPOSTA:  "var(--accent-primary)",
    FECHAMENTO:        "var(--accent-primary)",
    KIA:               "#ef4444",
}

// ─── Activity type badges ─────────────────────────────────────────────────────
const ACTIVITY_LABELS: Record<ActivityKind, string> = {
    STAGE_CHANGE: "ESTÁGIO",
    NOTE:         "NOTA",
    EMAIL:        "EMAIL",
    MEETING:      "REUNIÃO",
    CALL:         "CHAMADA",
    AI_BRIEFING:  "IA",
}

const ACTIVITY_COLORS: Record<ActivityKind, string> = {
    STAGE_CHANGE: "var(--accent-primary)",
    NOTE:         "var(--accent-primary)",
    EMAIL:        "var(--accent-ai)",
    MEETING:      "#f59e0b",
    CALL:         "#22c55e",
    AI_BRIEFING:  "var(--accent-ai)",
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
function formatCurrency(val: number | null): string {
    if (val === null) return "N/A"
    if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000)     return `R$ ${(val / 1_000).toFixed(0)}K`
    return `R$ ${val.toLocaleString("pt-BR")}`
}

function relativeTime(date: string): string {
    return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true })
}

function absoluteTime(date: string): string {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

// ─── Skeleton placeholder ─────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 animate-pulse">
            <div className="w-12 h-3 bg-white/10 rounded shrink-0 mt-1" />
            <div className="flex-1 space-y-1.5">
                <div className="w-16 h-2.5 bg-white/10 rounded" />
                <div className="w-full h-3 bg-white/5 rounded" />
            </div>
        </div>
    )
}

// ─── Corner Brackets ornament ─────────────────────────────────────────────────
function CornerBrackets({ children, className }: { children: React.ReactNode; className?: string }) {
    const bracketStyle = "absolute w-3 h-3 pointer-events-none"
    const borderColor = "rgba(0,212,255,0.25)"
    return (
        <div className={`relative ${className ?? ""}`}>
            {/* top-left */}
            <div className={`${bracketStyle} top-0 left-0`} style={{ borderTop: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}` }} />
            {/* top-right */}
            <div className={`${bracketStyle} top-0 right-0`} style={{ borderTop: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}` }} />
            {/* bottom-left */}
            <div className={`${bracketStyle} bottom-0 left-0`} style={{ borderBottom: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}` }} />
            {/* bottom-right */}
            <div className={`${bracketStyle} bottom-0 right-0`} style={{ borderBottom: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}` }} />
            {children}
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LeadIntelPanel({ isOpen, onClose, leadId, leadName }: LeadIntelPanelProps) {
    const [lead, setLead]               = useState<Lead | null>(null)
    const [activities, setActivities]   = useState<ActivityType[]>([])
    const [activityCount, setActivityCount] = useState<number>(0)
    const [loadingLead, setLoadingLead] = useState(false)
    const [loadingActs, setLoadingActs] = useState(false)

    // AI Briefing hook — only active when panel is open
    const {
        briefing,
        isGenerating,
        error: briefingError,
        generatedAt,
        regenerate,
    } = useLeadBriefing(isOpen ? leadId : null)

    // Determine if lead has insufficient data (no company_name)
    const hasInsufficientData = lead !== null && (!lead.company_name || lead.company_name.trim() === "")

    // ── Escape key ──────────────────────────────────────────────────────────
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
    }, [onClose])

    useEffect(() => {
        if (isOpen) document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, handleKeyDown])

    // ── Block body scroll ───────────────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto"
        return () => { document.body.style.overflow = "auto" }
    }, [isOpen])

    // ── Fetch lead + activities when panel opens ────────────────────────────
    useEffect(() => {
        if (!isOpen || !leadId) {
            setLead(null)
            setActivities([])
            setActivityCount(0)
            return
        }

        const supabase = createClient()

        // Fetch lead row
        const fetchLead = async () => {
            setLoadingLead(true)
            try {
                const { data, error } = await supabase
                    .from("leads")
                    .select("*")
                    .eq("id", leadId)
                    .single()
                if (error) throw error
                setLead(data as Lead)
            } finally {
                setLoadingLead(false)
            }
        }

        // Fetch activity log
        const fetchActivities = async () => {
            setLoadingActs(true)
            try {
                const { data, error, count } = await supabase
                    .from("activities")
                    .select("*", { count: "exact" })
                    .eq("lead_id", leadId)
                    .order("created_at", { ascending: false })
                    .limit(20)
                if (error) throw error
                setActivities((data ?? []) as ActivityType[])
                setActivityCount(count ?? 0)
            } finally {
                setLoadingActs(false)
            }
        }

        fetchLead()
        fetchActivities()

        // ── Realtime subscription for new activities ──────────────────────
        const channel = supabase
            .channel(`activities:lead:${leadId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "activities", filter: `lead_id=eq.${leadId}` },
                (payload: RealtimePostgresInsertPayload<ActivityType>) => {
                    setActivities((prev) => [payload.new, ...prev])
                    setActivityCount((prev) => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isOpen, leadId])

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/70"
                        style={{ backdropFilter: "blur(2px)" }}
                    />

                    {/* Slide-over panel — 520px wide */}
                    <motion.div
                        initial={{ x: 520, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 520, opacity: 0 }}
                        transition={{
                            x:       { duration: 0.3,  ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                        }}
                        className="fixed top-0 right-0 h-full z-50 flex flex-col border-l bg-[#0d0d10]"
                        style={{
                            width: "520px",
                            maxWidth: "100vw",
                            borderColor: "rgba(162,230,53,0.15)",
                            boxShadow: "-12px 0 40px rgba(0,0,0,0.6), -2px 0 0 rgba(162,230,53,0.08)",
                        }}
                    >
                        {/* ── HEADER ──────────────────────────────────────────────────────── */}
                        <header
                            className="px-5 py-4 border-b flex items-start justify-between relative overflow-hidden shrink-0"
                            style={{ borderColor: "rgba(162,230,53,0.12)", background: "rgba(162,230,53,0.03)" }}
                        >
                            {/* ambient glow */}
                            <div
                                className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                                style={{ background: "radial-gradient(circle, rgba(162,230,53,0.08) 0%, transparent 70%)" }}
                            />

                            <div className="flex items-center gap-3 min-w-0">
                                {/* Live status dot — pulse-live: opacity 1→0.4→1, 2s infinite */}
                                <span
                                    className="w-2 h-2 rounded-full shrink-0 pulse-live"
                                    style={{ background: "var(--accent-primary)" }}
                                />
                                <div className="min-w-0">
                                    {loadingLead ? (
                                        <div className="h-5 w-48 bg-white/10 rounded animate-pulse mb-1" />
                                    ) : (
                                        <h2
                                            className="text-base font-bold truncate leading-tight"
                                            style={{ fontFamily: "Space Grotesk, sans-serif", color: "#F0F0F0" }}
                                        >
                                            {lead?.name ?? leadName}
                                        </h2>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {loadingLead ? (
                                            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                                        ) : (
                                            <>
                                                <span
                                                    className="text-[10px] font-mono truncate"
                                                    style={{ color: "rgba(240,240,240,0.45)" }}
                                                >
                                                    {lead?.company_name}
                                                </span>
                                                {lead && (
                                                    <span
                                                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-[2px]"
                                                        style={{
                                                            color: STAGE_COLORS[lead.pipeline_stage],
                                                            border: `1px solid ${STAGE_COLORS[lead.pipeline_stage]}40`,
                                                            background: `${STAGE_COLORS[lead.pipeline_stage]}10`,
                                                        }}
                                                    >
                                                        {STAGE_LABELS[lead.pipeline_stage]}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-1.5 rounded transition-colors shrink-0 ml-2"
                                style={{ color: "rgba(240,240,240,0.4)" }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#ef4444"
                                    e.currentTarget.style.background = "rgba(239,68,68,0.1)"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgba(240,240,240,0.4)"
                                    e.currentTarget.style.background = "transparent"
                                }}
                                aria-label="Fechar painel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </header>

                        {/* ── STATS GRID 2×2 ──────────────────────────────────────────────── */}
                        <div
                            className="grid grid-cols-2 border-b shrink-0"
                            style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                            {/* Conversion probability */}
                            <StatCell
                                icon={<TrendingUp className="w-3 h-3" />}
                                label="Probabilidade"
                                loading={loadingLead}
                                borderRight
                                borderBottom
                            >
                                {lead && (
                                    <div>
                                        <span
                                            className="text-[22px] font-mono font-bold"
                                            style={{ color: "var(--accent-primary)" }}
                                        >
                                            {lead.win_probability}%
                                        </span>
                                        {/* thin progress bar */}
                                        <div className="mt-1.5 h-0.5 w-full bg-white/10 overflow-hidden rounded-full">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${lead.win_probability}%`,
                                                    background: "var(--accent-primary)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </StatCell>

                            {/* Deal value */}
                            <StatCell
                                icon={<Target className="w-3 h-3" />}
                                label="Valuation"
                                loading={loadingLead}
                                borderBottom
                            >
                                {lead && (
                                    <span
                                        className="text-[22px] font-mono font-bold"
                                        style={{ color: "var(--accent-primary)", fontFamily: "JetBrains Mono, monospace" }}
                                    >
                                        {formatCurrency(lead.estimated_value)}
                                    </span>
                                )}
                            </StatCell>

                            {/* Last contact */}
                            <StatCell
                                icon={<Clock className="w-3 h-3" />}
                                label="Último Contato"
                                loading={loadingLead}
                                borderRight
                            >
                                {lead && (
                                    <span
                                        className="text-xs font-mono"
                                        title={absoluteTime(lead.updated_at)}
                                        style={{ color: "rgba(240,240,240,0.7)", cursor: "help" }}
                                    >
                                        {relativeTime(lead.updated_at)}
                                    </span>
                                )}
                            </StatCell>

                            {/* Total interactions */}
                            <StatCell
                                icon={<Activity className="w-3 h-3" />}
                                label="Interações"
                                loading={loadingActs}
                            >
                                <span
                                    className="text-[22px] font-mono font-bold"
                                    style={{ color: "rgba(240,240,240,0.9)" }}
                                >
                                    {activityCount}
                                </span>
                            </StatCell>
                        </div>

                        {/* ── SCROLLABLE BODY ──────────────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(162,230,53,0.2) transparent" }}>

                            {/* ── AI BRIEFING SECTION ───────────────────────────────────────── */}
                            <section className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-3 h-3" style={{ color: "var(--accent-ai)" }} />
                                    <span
                                        className="text-[10px] font-mono uppercase tracking-widest"
                                        style={{ color: "var(--accent-ai)", opacity: 0.8 }}
                                    >
                                        // BRIEFING IA
                                    </span>
                                    {generatedAt && !isGenerating && (
                                        <span
                                            className="text-[9px] font-mono ml-auto"
                                            style={{ color: "rgba(240,240,240,0.25)" }}
                                        >
                                            {relativeTime(generatedAt)}
                                        </span>
                                    )}
                                </div>

                                {/* STATE 5: Insufficient data */}
                                {hasInsufficientData ? (
                                    <div
                                        className="rounded border p-4 flex items-center gap-3"
                                        style={{
                                            borderColor: "rgba(0,212,255,0.12)",
                                            background: "rgba(0,212,255,0.02)",
                                        }}
                                    >
                                        <span
                                            className="text-[10px] font-mono"
                                            style={{ color: "rgba(240,240,240,0.35)" }}
                                        >
                                            // DADOS INSUFICIENTES PARA ANÁLISE
                                        </span>
                                    </div>

                                /* STATE 4: Error */
                                ) : briefingError ? (
                                    <div
                                        className="rounded border p-4 space-y-3"
                                        style={{
                                            borderColor: "rgba(239,68,68,0.15)",
                                            background: "rgba(239,68,68,0.03)",
                                        }}
                                    >
                                        <span
                                            className="text-[10px] font-mono block"
                                            style={{ color: "rgba(240,240,240,0.35)" }}
                                        >
                                            {briefingError}
                                        </span>
                                        <button
                                            onClick={regenerate}
                                            className="text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded border transition-colors hover:opacity-80"
                                            style={{
                                                color: "var(--accent-ai)",
                                                borderColor: "rgba(0,212,255,0.2)",
                                                background: "rgba(0,212,255,0.05)",
                                            }}
                                        >
                                            // TENTAR NOVAMENTE
                                        </button>
                                    </div>

                                /* STATE 1: Loading (generating started, no content yet) */
                                ) : isGenerating && !briefing ? (
                                    <CornerBrackets>
                                        <div
                                            className="rounded p-4 space-y-3"
                                            style={{ background: "rgba(0,212,255,0.03)" }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full shrink-0 pulse-live"
                                                    style={{ background: "var(--accent-ai)" }}
                                                />
                                                <span
                                                    className="text-[11px] font-mono"
                                                    style={{ color: "var(--accent-ai)" }}
                                                >
                                                    // IA PROCESSANDO ALVO
                                                </span>
                                            </div>
                                            {/* Shimmer bar */}
                                            <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.1)" }}>
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: "40%",
                                                        background: "var(--accent-ai)",
                                                        animation: "shimmer 1.5s ease-in-out infinite",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </CornerBrackets>

                                /* STATE 2: Streaming (generating, content arriving) */
                                ) : isGenerating && briefing ? (
                                    <CornerBrackets>
                                        <div
                                            className="rounded p-4 relative overflow-hidden"
                                            style={{ background: "rgba(0,212,255,0.03)" }}
                                        >
                                            <div
                                                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                                                style={{ background: "radial-gradient(circle at top right, rgba(0,212,255,0.06) 0%, transparent 70%)" }}
                                            />
                                            <p
                                                className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap relative z-10"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                {briefing}
                                                <span
                                                    className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse"
                                                    style={{ background: "var(--accent-ai)" }}
                                                />
                                            </p>
                                        </div>
                                    </CornerBrackets>

                                /* STATE 3: Complete (briefing ready) */
                                ) : briefing ? (
                                    <CornerBrackets>
                                        <div
                                            className="rounded p-4 relative overflow-hidden"
                                            style={{ background: "rgba(0,212,255,0.03)" }}
                                        >
                                            <div
                                                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                                                style={{ background: "radial-gradient(circle at top right, rgba(0,212,255,0.06) 0%, transparent 70%)" }}
                                            />
                                            <p
                                                className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap relative z-10"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                {briefing}
                                            </p>
                                            {/* Footer: regenerate + timestamp */}
                                            <div className="flex items-center justify-between mt-4 pt-3 relative z-10" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                                                <button
                                                    onClick={regenerate}
                                                    className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors hover:opacity-80"
                                                    style={{
                                                        color: "var(--accent-ai)",
                                                        borderColor: "rgba(0,212,255,0.15)",
                                                        background: "transparent",
                                                    }}
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    // REGENERAR
                                                </button>
                                                {generatedAt && (
                                                    <span
                                                        className="text-[10px] font-mono"
                                                        style={{ color: "rgba(240,240,240,0.25)" }}
                                                    >
                                                        Gerado {relativeTime(generatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CornerBrackets>

                                /* Default: waiting / initial state */
                                ) : (
                                    <div
                                        className="rounded border p-4 flex items-center gap-3"
                                        style={{
                                            borderColor: "rgba(0,212,255,0.12)",
                                            background: "rgba(0,212,255,0.02)",
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full shrink-0 pulse-live"
                                            style={{ background: "var(--accent-ai)" }}
                                        />
                                        <span
                                            className="text-[10px] font-mono"
                                            style={{ color: "rgba(0,212,255,0.5)" }}
                                        >
                                            // AGUARDANDO ANÁLISE
                                        </span>
                                    </div>
                                )}
                            </section>

                            {/* ── ACTIVITY LOG ──────────────────────────────────────────────── */}
                            <section className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChevronRight className="w-3 h-3" style={{ color: "var(--accent-primary)" }} />
                                    <span
                                        className="text-[10px] font-mono uppercase tracking-widest"
                                        style={{ color: "rgba(240,240,240,0.4)" }}
                                    >
                                        Log de Atividade
                                    </span>
                                </div>

                                {loadingActs ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : activities.length === 0 ? (
                                    <p
                                        className="text-[11px] font-mono py-4 text-center"
                                        style={{ color: "rgba(240,240,240,0.25)" }}
                                    >
                                        // SEM REGISTROS DE INTEL
                                    </p>
                                ) : (
                                    <div>
                                        {activities.map((act) => (
                                            <div
                                                key={act.id}
                                                className="flex items-start gap-3 py-2.5 border-b last:border-b-0"
                                                style={{ borderColor: "rgba(255,255,255,0.04)" }}
                                            >
                                                {/* timestamp */}
                                                <span
                                                    className="text-[9px] font-mono shrink-0 mt-0.5 w-14 text-right leading-tight"
                                                    style={{ color: "rgba(240,240,240,0.3)" }}
                                                    title={absoluteTime(act.created_at)}
                                                >
                                                    {relativeTime(act.created_at)}
                                                </span>

                                                {/* type badge */}
                                                <span
                                                    className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-[2px] mt-0.5"
                                                    style={{
                                                        color: ACTIVITY_COLORS[act.type],
                                                        border: `1px solid ${ACTIVITY_COLORS[act.type]}40`,
                                                        background: `${ACTIVITY_COLORS[act.type]}10`,
                                                    }}
                                                >
                                                    {ACTIVITY_LABELS[act.type]}
                                                </span>

                                                {/* description */}
                                                <span
                                                    className="text-[11px] leading-relaxed"
                                                    style={{ color: "rgba(240,240,240,0.65)" }}
                                                >
                                                    {act.title}
                                                    {act.description && (
                                                        <span className="block text-[10px] mt-0.5" style={{ color: "rgba(240,240,240,0.35)" }}>
                                                            {act.description}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* ── FOOTER ACTIONS ───────────────────────────────────────────────── */}
                        <footer
                            className="px-4 py-3 border-t flex gap-2 shrink-0"
                            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}
                        >
                            <button
                                className="flex-1 py-2.5 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded transition-opacity hover:opacity-80"
                                style={{
                                    background: "var(--accent-primary)",
                                    color: "#0A0A0A",
                                }}
                                onClick={() => {
                                    if (briefing) {
                                        navigator.clipboard.writeText(briefing).catch(() => null)
                                    }
                                }}
                            >
                                <Terminal className="w-3.5 h-3.5" />
                                Copiar Briefing
                            </button>
                            <button
                                className="px-4 py-2.5 rounded transition-colors flex items-center justify-center"
                                style={{
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(240,240,240,0.4)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "rgba(240,240,240,0.9)"
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgba(240,240,240,0.4)"
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                                }}
                                aria-label="Ver ficha completa"
                            >
                                <Database className="w-3.5 h-3.5" />
                            </button>
                        </footer>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    )
}

// ─── StatCell sub-component ───────────────────────────────────────────────────
interface StatCellProps {
    icon: React.ReactNode
    label: string
    loading: boolean
    borderRight?: boolean
    borderBottom?: boolean
    children?: React.ReactNode
}

function StatCell({ icon, label, loading, borderRight, borderBottom, children }: StatCellProps) {
    return (
        <div
            className="p-3 flex flex-col gap-1"
            style={{
                borderRight:  borderRight  ? "1px solid rgba(255,255,255,0.05)" : undefined,
                borderBottom: borderBottom ? "1px solid rgba(255,255,255,0.05)" : undefined,
            }}
        >
            <div className="flex items-center gap-1.5" style={{ color: "rgba(240,240,240,0.35)" }}>
                {icon}
                <span className="text-[9px] font-mono uppercase tracking-widest">{label}</span>
            </div>
            {loading ? (
                <div className="h-5 w-20 bg-white/10 rounded animate-pulse mt-0.5" />
            ) : (
                children
            )}
        </div>
    )
}
