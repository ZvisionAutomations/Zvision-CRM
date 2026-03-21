"use client"

import { motion } from "framer-motion"
import { Eye, Pause, Play } from "lucide-react"
import type { Campaign } from "@/types/database"
import { formatCurrency } from "./kpi-bar"

// ─── Corner brackets for burning-money rows (ROAS < 1) ──────────────────────
function CornerBrackets() {
    return (
        <>
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[var(--status-error,#ef4444)]" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[var(--status-error,#ef4444)]" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[var(--status-error,#ef4444)]" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--status-error,#ef4444)]" />
        </>
    )
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
}

const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
}

const GRID_COLS = '2.5fr 0.8fr 0.7fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr'

function getCplColor(cpl: number): string {
    if (cpl < 50) return 'var(--accent-primary)'
    if (cpl <= 150) return 'var(--status-warning, #f59e0b)'
    return 'var(--status-error, #ef4444)'
}

function getRoasColor(roas: number): string {
    if (roas > 3) return 'var(--accent-primary)'
    if (roas >= 1) return 'var(--status-warning, #f59e0b)'
    return 'var(--status-error, #ef4444)'
}

interface CampaignTableProps {
    campaigns: Campaign[]
    onToggleStatus: (id: string, currentStatus: string) => void
}

export function CampaignTable({ campaigns, onToggleStatus }: CampaignTableProps) {
    if (campaigns.length === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-8 flex items-center justify-center">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // NENHUMA CAMPANHA REGISTRADA
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
                className="grid gap-3 px-3 py-2 hidden lg:grid"
                style={{ gridTemplateColumns: GRID_COLS }}
            >
                {['CAMPANHA', 'PLATAFORMA', 'STATUS', 'INVESTIMENTO', 'LEADS', 'CPL', 'ROAS', 'AÇÕES'].map((col) => (
                    <p key={col} className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)]">
                        {col}
                    </p>
                ))}
            </div>

            {/* Data rows */}
            {campaigns.map((campaign) => {
                const cpl = campaign.leads > 0 ? Number(campaign.spend) / campaign.leads : 0
                const roas = Number(campaign.spend) > 0 ? Number(campaign.revenue) / Number(campaign.spend) : 0
                const isBurning = roas < 1 && Number(campaign.spend) > 0

                const utmString = campaign.utm_source
                    ? `utm_source=${campaign.utm_source}&utm_medium=${campaign.utm_medium ?? ''}&utm_campaign=${campaign.utm_campaign ?? ''}`
                    : null

                return (
                    <motion.div
                        key={campaign.id}
                        variants={rowVariants}
                        className="relative bg-[var(--surface-card)] border border-[var(--border-default)] px-3 py-3 rounded-[4px] transition-all duration-200 hover:border-[var(--accent-primary)]/25 hover:-translate-y-[1px]"
                    >
                        {isBurning && <CornerBrackets />}

                        {/* Desktop: CSS Grid */}
                        <div
                            className="hidden lg:grid gap-3 items-center"
                            style={{ gridTemplateColumns: GRID_COLS }}
                        >
                            {/* CAMPANHA */}
                            <div className="min-w-0">
                                <p className="font-['Space_Grotesk'] font-semibold text-[14px] text-[var(--text-primary)] truncate">
                                    {campaign.name}
                                </p>
                                {utmString && (
                                    <p className="font-mono text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                                        {utmString}
                                    </p>
                                )}
                            </div>

                            {/* PLATAFORMA */}
                            <div>
                                <span
                                    className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-sm inline-block"
                                    style={{
                                        backgroundColor: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                                        color: 'var(--accent-primary)',
                                    }}
                                >
                                    {campaign.platform.toUpperCase()}
                                </span>
                                {campaign.platform_subtype && (
                                    <p className="font-mono text-[8px] text-[var(--text-secondary)] uppercase mt-0.5">
                                        {campaign.platform_subtype.toUpperCase()}
                                    </p>
                                )}
                            </div>

                            {/* STATUS */}
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{
                                        backgroundColor: campaign.status === 'active'
                                            ? 'var(--accent-primary)'
                                            : campaign.status === 'paused'
                                                ? 'var(--text-secondary)'
                                                : 'var(--status-error, #ef4444)',
                                        boxShadow: campaign.status === 'active'
                                            ? '0 0 4px rgba(162,230,53,0.5)'
                                            : 'none',
                                    }}
                                />
                                <span className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                                    {campaign.status === 'active' ? 'ATIVA' : campaign.status === 'paused' ? 'PAUSADA' : 'ENCERRADA'}
                                </span>
                            </div>

                            {/* INVESTIMENTO */}
                            <p className="font-mono font-bold text-[13px] text-[var(--text-primary)]">
                                {formatCurrency(Number(campaign.spend))}
                            </p>

                            {/* LEADS */}
                            <p className="font-mono font-bold text-[13px] text-[var(--accent-primary)]">
                                {campaign.leads}
                            </p>

                            {/* CPL */}
                            <p
                                className="font-mono text-[13px]"
                                style={{ color: campaign.leads > 0 ? getCplColor(cpl) : 'var(--text-secondary)' }}
                            >
                                {campaign.leads > 0 ? formatCurrency(cpl) : '—'}
                            </p>

                            {/* ROAS */}
                            <p
                                className="font-mono text-[13px]"
                                style={{ color: Number(campaign.spend) > 0 ? getRoasColor(roas) : 'var(--text-secondary)' }}
                            >
                                {Number(campaign.spend) > 0 ? `${roas.toFixed(1)}x` : '—'}
                            </p>

                            {/* AÇÕES */}
                            <div className="flex items-center gap-1">
                                <button
                                    className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                                    title="Ver detalhes UTM"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                {campaign.status !== 'ended' && (
                                    <button
                                        onClick={() => onToggleStatus(campaign.id, campaign.status)}
                                        className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                                        title={campaign.status === 'active' ? 'Pausar campanha' : 'Retomar campanha'}
                                    >
                                        {campaign.status === 'active' ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mobile: stacked layout */}
                        <div className="lg:hidden space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-['Space_Grotesk'] font-semibold text-[14px] text-[var(--text-primary)] truncate">
                                        {campaign.name}
                                    </p>
                                    {utmString && (
                                        <p className="font-mono text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                                            {utmString}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-sm shrink-0"
                                    style={{
                                        backgroundColor: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                                        color: 'var(--accent-primary)',
                                    }}
                                >
                                    {campaign.platform.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="font-mono text-[12px] text-[var(--text-primary)]">
                                    {formatCurrency(Number(campaign.spend))}
                                </span>
                                <span className="font-mono text-[12px] text-[var(--accent-primary)]">
                                    {campaign.leads} leads
                                </span>
                                <span
                                    className="font-mono text-[12px]"
                                    style={{ color: Number(campaign.spend) > 0 ? getRoasColor(roas) : 'var(--text-secondary)' }}
                                >
                                    ROAS {Number(campaign.spend) > 0 ? `${roas.toFixed(1)}x` : '—'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </motion.div>
    )
}
