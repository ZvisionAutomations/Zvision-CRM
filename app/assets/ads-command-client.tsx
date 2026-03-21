"use client"

import { useState, useOptimistic, useTransition } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KpiCard, kpiContainerVariants, formatCurrency } from "@/components/ads/kpi-bar"
import { CampaignTable } from "@/components/ads/campaign-table"
import { ChannelPerformance } from "@/components/ads/channel-performance"
import { UtmList } from "@/components/ads/utm-list"
import type { UtmEntry } from "@/components/ads/utm-list"
import { ConversionFunnel } from "@/components/ads/conversion-funnel"
import { toggleCampaignStatus } from "@/lib/actions/ads"
import type { Campaign, CampaignPlatform } from "@/types/database"

// ─── Filter types ────────────────────────────────────────────────────────────
type PlatformFilter = 'all' | CampaignPlatform
type PeriodFilter = '7d' | '30d' | '90d'

// ─── Props ───────────────────────────────────────────────────────────────────

interface AdsCommandClientProps {
    campaigns: Campaign[]
    tableNotFound: boolean
}

export function AdsCommandClient({ campaigns: initialCampaigns, tableNotFound }: AdsCommandClientProps) {
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')
    const [optimisticCampaigns, setOptimisticCampaigns] = useOptimistic(initialCampaigns)
    const [, startTransition] = useTransition()

    // ─── Filter campaigns ──────────────────────────────────────────────────
    const filtered = optimisticCampaigns.filter((c) => {
        if (platformFilter !== 'all' && c.platform !== platformFilter) return false
        return true
    })

    // ─── Aggregate KPIs ────────────────────────────────────────────────────
    const totalSpend = filtered.reduce((sum, c) => sum + Number(c.spend), 0)
    const totalLeads = filtered.reduce((sum, c) => sum + c.leads, 0)
    const totalClicks = filtered.reduce((sum, c) => sum + c.clicks, 0)
    const totalRevenue = filtered.reduce((sum, c) => sum + Number(c.revenue), 0)

    const cplMedio = totalLeads > 0 ? totalSpend / totalLeads : 0
    const roasMedio = totalSpend > 0 ? totalRevenue / totalSpend : 0
    const taxaConversao = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0

    // ─── CPL color rule ────────────────────────────────────────────────────
    const cplColor = cplMedio < 50
        ? '--accent-primary'
        : cplMedio <= 150
            ? '--status-warning'
            : '--status-error'

    // ─── ROAS color rule ───────────────────────────────────────────────────
    const roasColor = roasMedio > 3
        ? '--accent-primary'
        : roasMedio >= 1
            ? '--status-warning'
            : '--status-error'

    // ─── Conversion rate color rule ────────────────────────────────────────
    const convColor = taxaConversao > 5
        ? '--accent-primary'
        : taxaConversao >= 2
            ? '--status-warning'
            : '--status-error'

    // ─── Channel performance data ──────────────────────────────────────────
    const metaCampaigns = filtered.filter((c) => c.platform === 'meta')
    const googleCampaigns = filtered.filter((c) => c.platform === 'google')

    const metaSpend = metaCampaigns.reduce((sum, c) => sum + Number(c.spend), 0)
    const googleSpend = googleCampaigns.reduce((sum, c) => sum + Number(c.spend), 0)
    const metaLeads = metaCampaigns.reduce((sum, c) => sum + c.leads, 0)
    const googleLeads = googleCampaigns.reduce((sum, c) => sum + c.leads, 0)

    // ─── UTM data (derived from campaigns) ─────────────────────────────────
    const utmEntries: UtmEntry[] = filtered
        .filter((c) => c.utm_source && c.utm_campaign)
        .map((c) => ({
            source: c.utm_source ?? '',
            medium: c.utm_medium ?? '',
            campaign: c.utm_campaign ?? '',
            leads: c.leads,
            cpl: c.leads > 0 ? Number(c.spend) / c.leads : 0,
            dailyActivity: (c.daily_spend ?? []).slice(-7),
        }))
        .sort((a, b) => b.leads - a.leads)

    // ─── Funnel data (aggregate) ───────────────────────────────────────────
    const funnelData = {
        impressoes: filtered.reduce((sum, c) => sum + c.impressions, 0),
        cliques: totalClicks,
        leads: totalLeads,
        qualificados: filtered.reduce((sum, c) => sum + c.qualified_leads, 0),
        fechamentos: filtered.reduce((sum, c) => sum + c.conversions, 0),
    }

    // ─── Toggle campaign status handler ────────────────────────────────────
    function handleToggleStatus(id: string, currentStatus: string) {
        startTransition(async () => {
            setOptimisticCampaigns((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, status: currentStatus === 'active' ? 'paused' as const : 'active' as const }
                        : c
                )
            )
            await toggleCampaignStatus(id, currentStatus)
        })
    }

    // ─── Trend placeholders (no previous period data yet) ──────────────────
    const spendTrend: number | null = null
    const leadsTrend: number | null = null
    const cplTrend: number | null = null
    const roasTrend: number | null = null
    const convTrend: number | null = null

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6 lg:p-8">

                {/* ─── Page Header ──────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        <h1
                            className="font-['Space_Grotesk'] font-bold text-2xl tracking-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            // CENTRAL DE ANÚNCIOS
                        </h1>
                        <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Inteligência de performance por campanha
                        </p>
                    </div>

                    {/* Filter pills */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Platform filter */}
                        <div className="flex items-center gap-1.5">
                            {(['all', 'meta', 'google'] as const).map((p) => {
                                const isActive = p === platformFilter
                                const label = p === 'all' ? 'TODOS' : p.toUpperCase()
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPlatformFilter(p)}
                                        className="font-mono text-[11px] px-3 py-1.5 rounded-sm transition-all duration-150"
                                        style={{
                                            backgroundColor: isActive
                                                ? 'var(--accent-primary)'
                                                : 'transparent',
                                            color: isActive
                                                ? 'var(--surface-page, #0A0A0A)'
                                                : 'var(--text-secondary)',
                                            border: isActive
                                                ? 'none'
                                                : '1px solid var(--border-default)',
                                            fontWeight: isActive ? 700 : 400,
                                        }}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Period filter */}
                        <div className="flex items-center gap-1.5">
                            {(['7d', '30d', '90d'] as const).map((p) => {
                                const isActive = p === periodFilter
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPeriodFilter(p)}
                                        className="font-mono text-[11px] px-3 py-1.5 rounded-sm transition-all duration-150"
                                        style={{
                                            backgroundColor: isActive
                                                ? 'var(--accent-primary)'
                                                : 'transparent',
                                            color: isActive
                                                ? 'var(--surface-page, #0A0A0A)'
                                                : 'var(--text-secondary)',
                                            border: isActive
                                                ? 'none'
                                                : '1px solid var(--border-default)',
                                            fontWeight: isActive ? 700 : 400,
                                        }}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* TABLE_NOT_FOUND warning */}
                {tableNotFound && (
                    <div className="mb-6 px-4 py-3 border border-[var(--status-warning,#f59e0b)]/30 bg-[var(--status-warning,#f59e0b)]/5 rounded-sm">
                        <p className="font-mono text-[11px] text-[var(--status-warning,#f59e0b)]">
                            // TABELA NÃO ENCONTRADA — Execute 009_campaigns.sql no Supabase Dashboard
                        </p>
                    </div>
                )}

                {/* ─── SECTION 1: KPI Bar ───────────────────────────────── */}
                <motion.div
                    variants={kpiContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8"
                >
                    <KpiCard
                        label="INVESTIMENTO TOTAL"
                        value={totalSpend}
                        format="currency"
                        colorVar="--text-primary"
                        trend={spendTrend}
                    />
                    <KpiCard
                        label="LEADS GERADOS"
                        value={totalLeads}
                        format="number"
                        colorVar="--accent-primary"
                        trend={leadsTrend}
                        useTicker
                    />
                    <KpiCard
                        label="CPL MÉDIO"
                        value={cplMedio}
                        format="currency"
                        colorVar={cplColor}
                        trend={cplTrend}
                    />
                    <KpiCard
                        label="ROAS MÉDIO"
                        value={roasMedio}
                        format="roas"
                        colorVar={roasColor}
                        trend={roasTrend}
                    />
                    <KpiCard
                        label="TAXA DE CONVERSÃO"
                        value={taxaConversao}
                        format="percent"
                        colorVar={convColor}
                        trend={convTrend}
                    />
                </motion.div>

                {/* ─── SECTION 2: Campaign Table ────────────────────────── */}
                <div className="mb-8">
                    <p
                        className="font-mono text-[11px] uppercase tracking-wider mb-4"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        // MISSÕES DE AQUISIÇÃO ATIVAS
                    </p>
                    <CampaignTable
                        campaigns={filtered}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>

                {/* ─── SECTION 3: Two Column (Channels + UTMs) ──────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-8">
                    {/* LEFT: Channel Performance */}
                    <div>
                        <p
                            className="font-mono text-[11px] uppercase tracking-wider mb-3"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            // PERFORMANCE POR CANAL
                        </p>
                        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                            <ChannelPerformance
                                metaSpend={metaSpend}
                                googleSpend={googleSpend}
                                metaLeads={metaLeads}
                                googleLeads={googleLeads}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Top UTMs */}
                    <div>
                        <p
                            className="font-mono text-[11px] uppercase tracking-wider mb-3"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            // TOP UTMs
                        </p>
                        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                            <UtmList entries={utmEntries} />
                        </div>
                    </div>
                </div>

                {/* ─── SECTION 4: Conversion Funnel ─────────────────────── */}
                <div className="mb-8">
                    <p
                        className="font-mono text-[11px] uppercase tracking-wider mb-4"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        // FUNIL DE CONVERSÃO — ATRIBUIÇÃO
                    </p>
                    <div className="bg-[var(--surface-card)] border border-[var(--border-default)] p-4">
                        <ConversionFunnel data={funnelData} />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
