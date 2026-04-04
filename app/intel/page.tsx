"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import LeadIntelPanel from "@/components/LeadIntelPanel"
import { getLeads } from "@/lib/actions/leads"
import type { Lead, PipelineStage, SignalStrength } from "@/types/database"
import { Target, Search, Filter, Zap, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGE_LABELS: Record<PipelineStage, string> = {
  NOVO_LEAD:         "NOVO ALVO",
  QUALIFICACAO:      "QUALIFICACAO",
  REUNIAO_BRIEFING:  "BRIEFING",
  REUNIAO_PROPOSTA:  "PROPOSTA",
  FECHAMENTO:        "FECHAMENTO",
  KIA:               "KIA",
}

const SIGNAL_BG: Record<SignalStrength, string> = {
  ALTO:  'var(--accent-primary)',
  MEDIO: 'var(--status-warning)',
  BAIXO: 'var(--status-error)',
}

const STAGE_FILTER_OPTIONS: Array<{ value: PipelineStage | "ALL"; label: string }> = [
  { value: "ALL",               label: "TODOS" },
  { value: "NOVO_LEAD",         label: "NOVO ALVO" },
  { value: "QUALIFICACAO",      label: "QUALIFICACAO" },
  { value: "REUNIAO_BRIEFING",  label: "BRIEFING" },
  { value: "REUNIAO_PROPOSTA",  label: "PROPOSTA" },
  { value: "FECHAMENTO",        label: "FECHAMENTO" },
]

export default function IntelPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<PipelineStage | "ALL">("ALL")
  const [selectedLead, setSelectedLead] = useState<{ id: string; name: string } | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getLeads({
        search: search || undefined,
        stage: stageFilter !== "ALL" ? stageFilter : undefined,
        limit: 50,
      })
      setLeads(result.leads)
      setTotal(result.total)
    } catch {
      // silently fail — middleware already handles unauth
    } finally {
      setLoading(false)
    }
  }, [search, stageFilter])

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300)
    return () => clearTimeout(t)
  }, [fetchLeads])

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            // BASE DE ALVOS
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px]" style={{ fontFamily: 'var(--font-space-grotesk, Space Grotesk, sans-serif)' }}>
                INTEL — ALVOS
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {total} alvos no radar // <span style={{ color: 'var(--accent-primary)' }}>LIVE</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-card border border-border text-sm font-mono focus:outline-none focus:border-lime/50 placeholder:text-muted-foreground"
            />
          </div>

          {/* Filtro de stage */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1" />
            {STAGE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStageFilter(opt.value as PipelineStage | "ALL")}
                className={cn(
                  "px-2 py-1 text-xs font-mono whitespace-nowrap transition-colors",
                  stageFilter === opt.value
                    ? "bg-lime text-background"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-lime/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de leads */}
        <div className="bg-card border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-lime" />
              <span className="text-xs font-mono uppercase tracking-[2px] text-muted-foreground">
                // ALVOS IDENTIFICADOS
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{leads.length} exibidos</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-4 h-4 border border-lime border-t-transparent animate-spin" />
              <span className="ml-3 text-xs font-mono text-muted-foreground">ESCANEANDO RADAR...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative corner-brackets border border-[var(--border-default)] px-8 py-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  // INTEL_VAZIO
                </p>
                <p className="font-mono text-[11px] text-muted-foreground opacity-60 mt-1">
                  Nenhum alvo encontrado com os filtros atuais
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header da tabela */}
              <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground w-6" />
                <span className="text-xs font-mono text-muted-foreground uppercase">Contato</span>
                <span className="text-xs font-mono text-muted-foreground uppercase">Empresa</span>
                <span className="text-xs font-mono text-muted-foreground uppercase">Stage</span>
                <span className="text-xs font-mono text-muted-foreground uppercase">Valor</span>
                <span className="text-xs font-mono text-muted-foreground uppercase w-6" />
              </div>

              <div className="divide-y divide-border">
                {leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead({ id: lead.id, name: lead.name })}
                    className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 md:gap-4 px-4 py-3 hover:bg-surface-hover transition-colors text-left group items-center"
                  >
                    {/* Sinal */}
                    <span
                      className="hidden md:inline-flex items-center justify-center w-5 h-5 text-[9px] font-mono font-bold text-background"
                      style={{ background: SIGNAL_BG[lead.signal_strength] }}
                    >
                      {lead.signal_strength[0]}
                    </span>

                    {/* Nome */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="md:hidden w-1.5 h-1.5 shrink-0 bg-lime" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">{lead.name}</span>
                          {lead.ai_briefing && (
                            <Zap className="w-3 h-3 text-accent-ai shrink-0" aria-label="Briefing IA" />
                          )}
                        </div>
                        {lead.email && (
                          <span className="text-xs text-muted-foreground truncate block">{lead.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Empresa */}
                    <div className="hidden md:block min-w-0">
                      <span className="text-sm truncate block">{lead.company_name}</span>
                      {lead.company_website && (
                        <span className="text-xs text-muted-foreground truncate block">{lead.company_website}</span>
                      )}
                    </div>

                    {/* Stage */}
                    <span className="hidden md:inline text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {STAGE_LABELS[lead.pipeline_stage]}
                    </span>

                    {/* Valor */}
                    <span className="hidden md:inline text-xs font-mono text-lime whitespace-nowrap">
                      {lead.estimated_value
                        ? "R$ " + lead.estimated_value.toLocaleString("pt-BR")
                        : "—"}
                    </span>

                    {/* Seta */}
                    <span className="hidden md:inline text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedLead && (
        <LeadIntelPanel
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </DashboardLayout>
  )
}
