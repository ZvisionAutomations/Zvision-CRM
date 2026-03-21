"use client"

import { useState } from "react"
import { TrendingUp, Target, Zap, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlanceCard } from "@/components/dashboard/glance-card"
import LeadIntelPanel from "@/components/LeadIntelPanel"
import type { Lead, PipelineStage } from "@/types/database"
import type { LeadSparklines } from "@/lib/actions/leads"

// Mapeamento de stage para label tatico
const STAGE_LABELS: Record<PipelineStage, string> = {
  NOVO_LEAD:         "NOVO ALVO",
  QUALIFICACAO:      "QUALIFICACAO",
  REUNIAO_BRIEFING:  "BRIEFING",
  REUNIAO_PROPOSTA:  "PROPOSTA",
  FECHAMENTO:        "FECHAMENTO",
  KIA:               "KIA",
}

// Cor do indicador de sinal
const SIGNAL_COLORS: Record<string, string> = {
  ALTO:  "bg-lime",
  MEDIO: "bg-amber-500",
  BAIXO: "bg-red-500",
}

const ZERO_12 = (): number[] => Array(12).fill(0)

export function PulseDashboardClient({
  leads,
  total,
  sparklines,
}: {
  leads: Lead[]
  total: number
  sparklines?: LeadSparklines
}) {
  const [selectedLead, setSelectedLead] = useState<{ id: string; name: string } | null>(null)

  // Metricas calculadas dos dados reais do Supabase
  const totalValuation = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0)
  const iaBriefingsScanned = leads.filter((l) => l.ai_briefing !== null).length
  const wonLeads = leads.filter((l) => l.pipeline_stage === "FECHAMENTO").length
  const newLeadsToday = leads.filter((l) => {
    const created = new Date(l.created_at)
    const today = new Date()
    return created.toDateString() === today.toDateString()
  }).length

  // Alvos ativos ordenados por signal_strength (ALTO primeiro)
  const activeLeads = leads
    .filter((l) => l.pipeline_stage !== "KIA" && l.pipeline_stage !== "FECHAMENTO")
    .sort((a, b) => {
      const order: Record<string, number> = { ALTO: 0, MEDIO: 1, BAIXO: 2 }
      return (order[a.signal_strength] ?? 1) - (order[b.signal_strength] ?? 1)
    })
    .slice(0, 8)

  // Snapshot do pipeline por estagio
  const pipelineSnapshot = (Object.keys(STAGE_LABELS) as PipelineStage[]).reduce(
    (acc, stage) => ({ ...acc, [stage]: 0 }),
    {} as Record<PipelineStage, number>
  )
  leads.forEach((l) => { pipelineSnapshot[l.pipeline_stage]++ })

  const glanceCards = [
    {
      title: "Valuation em Pipeline",
      value: totalValuation,
      prefix: "R$ ",
      suffix: "",
      change: 0,
      sparklineData: sparklines?.valuationByWeek ?? ZERO_12(),
    },
    {
      title: "Alvos no Radar",
      value: total,
      prefix: "",
      suffix: "",
      change: newLeadsToday,
      sparklineData: sparklines?.leadsByWeek ?? ZERO_12(),
    },
    {
      title: "Briefings IA Gerados",
      value: total > 0 ? Number(((iaBriefingsScanned / total) * 100).toFixed(1)) : 0,
      suffix: "%",
      change: 0,
      sparklineData: sparklines?.briefingsByWeek ?? ZERO_12(),
    },
    {
      title: "Missoes Fechadas",
      value: wonLeads,
      change: 0,
      sparklineData: sparklines?.wonByWeek ?? ZERO_12(),
    },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-[2px]">
            Visao Geral em Tempo Real
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px]">Comando Central</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitore a operacao e gerencie seus alvos ativos
        </p>
      </div>

      {/* Glance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {glanceCards.map((card) => (
          <GlanceCard
            key={card.title}
            title={card.title}
            value={card.value}
            prefix={card.prefix}
            suffix={card.suffix}
            change={card.change}
            sparklineData={card.sparklineData}
          />
        ))}
      </div>

      {/* Conteudo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Alvos Ativos */}
        <div className="lg:col-span-2 bg-card border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-lime" />
              <span className="text-xs font-mono uppercase tracking-[2px] text-muted-foreground">Alvos Ativos</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{activeLeads.length} de {total}</span>
          </div>

          {activeLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative corner-brackets border border-[var(--border-default)] px-8 py-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  // RADAR_VAZIO
                </p>
                <p className="font-mono text-[11px] text-muted-foreground opacity-60 mt-1">
                  Nenhum alvo ativo no momento
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead({ id: lead.id, name: lead.name })}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-hover)] transition-all duration-150 text-left group"
                >
                  <div className={cn(
                    "w-1.5 h-1.5 shrink-0",
                    SIGNAL_COLORS[lead.signal_strength] ?? "bg-muted"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{lead.name}</span>
                      {lead.ai_briefing && (
                        <Zap className="w-3 h-3 text-accent-ai shrink-0" aria-label="Briefing IA disponivel" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{lead.company_name}</span>
                      <span className="text-xs font-mono text-muted-foreground opacity-60">
                        {STAGE_LABELS[lead.pipeline_stage]}
                      </span>
                    </div>
                  </div>
                  {lead.estimated_value ? (
                    <span className="text-xs font-mono text-lime shrink-0">
                      R$ {lead.estimated_value.toLocaleString("pt-BR")}
                    </span>
                  ) : null}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <div className="flex flex-col gap-4">
          {/* Pipeline snapshot */}
          <div className="bg-card border border-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <TrendingUp className="w-3.5 h-3.5 text-lime" />
              <span className="text-xs font-mono uppercase tracking-[2px] text-muted-foreground">Pipeline</span>
            </div>
            <div className="p-4 space-y-2">
              {(Object.entries(pipelineSnapshot) as [PipelineStage, number][]).map(([stage, count]) => {
                if (stage === "KIA") return null
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{STAGE_LABELS[stage]}</span>
                      <span className="text-xs font-mono">{count}</span>
                    </div>
                    <div className="h-1 bg-muted overflow-hidden">
                      <div
                        className="h-full bg-lime transition-all duration-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Destaques rapidos */}
          <div className="bg-card border border-border p-4 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-3.5 h-3.5 text-lime" />
              <span className="text-xs font-mono uppercase tracking-[2px] text-muted-foreground">Destaques</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Novos hoje</span>
                <span className="text-xs font-mono text-lime">{newLeadsToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Com briefing IA</span>
                <span className="text-xs font-mono">{iaBriefingsScanned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">KIA (perdidos)</span>
                <span className="text-xs font-mono text-destructive">{pipelineSnapshot.KIA}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-lime" />
                  <span className="text-xs text-muted-foreground">Missoes fechadas</span>
                </div>
                <span className="text-xs font-mono text-lime">{wonLeads}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Intel Panel */}
      {selectedLead && (
        <LeadIntelPanel
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </div>
  )
}
