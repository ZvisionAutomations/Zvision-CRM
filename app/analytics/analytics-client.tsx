"use client"

import type { Lead, PipelineStage } from "@/types/database"
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"

const STAGE_ORDER: PipelineStage[] = [
  "NOVO_LEAD",
  "QUALIFICACAO",
  "REUNIAO_BRIEFING",
  "REUNIAO_PROPOSTA",
  "FECHAMENTO",
]

const STAGE_LABELS: Record<PipelineStage, string> = {
  NOVO_LEAD:         "NOVO ALVO",
  QUALIFICACAO:      "QUALIFIC.",
  REUNIAO_BRIEFING:  "BRIEFING",
  REUNIAO_PROPOSTA:  "PROPOSTA",
  FECHAMENTO:        "FECHADO",
  KIA:               "KIA",
}

interface AnalyticsClientProps {
  leads: Lead[]
}

export function AnalyticsClient({ leads }: AnalyticsClientProps) {
  // Snapshot por estagio
  const stageCount = STAGE_ORDER.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<PipelineStage, number>)
  const kiaCount = leads.filter((l) => l.pipeline_stage === "KIA").length
  leads.forEach((l) => {
    if (stageCount[l.pipeline_stage] !== undefined) stageCount[l.pipeline_stage]++
  })

  const totalActive = leads.filter((l) => l.pipeline_stage !== "KIA").length
  const totalValuation = leads
    .filter((l) => l.pipeline_stage !== "KIA")
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0)
  const avgValue = totalActive > 0
    ? Math.round(totalValuation / totalActive)
    : 0
  const conversionRate = leads.length > 0
    ? ((stageCount.FECHAMENTO / leads.length) * 100).toFixed(1)
    : "0.0"
  const iaAdoption = leads.length > 0
    ? ((leads.filter((l) => l.ai_briefing).length / leads.length) * 100).toFixed(1)
    : "0.0"

  // Dados para o bar chart
  const chartData = STAGE_ORDER.map((stage) => ({
    name: STAGE_LABELS[stage],
    count: stageCount[stage],
    isLast: stage === "FECHAMENTO",
  }))

  // Distribuicao de signal strength
  const signalDist = {
    ALTO:  leads.filter((l) => l.signal_strength === "ALTO").length,
    MEDIO: leads.filter((l) => l.signal_strength === "MEDIO").length,
    BAIXO: leads.filter((l) => l.signal_strength === "BAIXO").length,
  }

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 0,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--foreground)",
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-lime" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Total de Alvos</span>
          </div>
          <p className="text-2xl font-mono font-semibold">{leads.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{kiaCount} KIA (perdidos)</p>
        </div>

        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-lime" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Valuation</span>
          </div>
          <p className="text-2xl font-mono font-semibold">
            R$ {(totalValuation / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Media R$ {avgValue.toLocaleString("pt-BR")} por alvo
          </p>
        </div>

        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-lime" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Taxa Conversao</span>
          </div>
          <p className="text-2xl font-mono font-semibold text-lime">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stageCount.FECHAMENTO} missoes fechadas
          </p>
        </div>

        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-ai)]" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Adocao IA</span>
          </div>
          <p className="text-2xl font-mono font-semibold">{iaAdoption}%</p>
          <p className="text-xs text-muted-foreground mt-1">briefings gerados</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Funil de pipeline */}
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-3.5 h-3.5 text-lime" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              // FUNIL DE PIPELINE
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [value, "Alvos"]}
                  cursor={{ fill: "rgba(162,230,53,0.05)" }}
                />
                <Bar dataKey="count">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isLast ? "var(--accent-primary)" : "rgba(162,230,53,0.25)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuicao de sinal */}
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-3.5 h-3.5 text-lime" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              // FORCA DE SINAL
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: "ALTO", count: signalDist.ALTO, color: "bg-[var(--accent-primary)]" },
              { label: "MEDIO", count: signalDist.MEDIO, color: "bg-[var(--status-warning)]" },
              { label: "BAIXO", count: signalDist.BAIXO, color: "bg-[var(--destructive)]" },
            ].map(({ label, count, color }) => {
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{label}</span>
                    <span className="text-xs font-mono">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 bg-muted overflow-hidden">
                    <div className={"h-full " + color + " transition-all duration-500"} style={{ width: pct + "%" }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resumo stage count */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            {STAGE_ORDER.map((stage) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{STAGE_LABELS[stage]}</span>
                <span className="text-xs font-mono">{stageCount[stage]}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-destructive">KIA</span>
              <span className="text-xs font-mono text-destructive">{kiaCount}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
