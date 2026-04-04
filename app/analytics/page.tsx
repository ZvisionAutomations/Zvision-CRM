import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getLeads } from "@/lib/actions/leads"
import { AnalyticsClient } from "./analytics-client"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const { leads } = await getLeads({ limit: 1000 })

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            // ANALISE DE PIPELINE
          </p>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px]" style={{ fontFamily: 'var(--font-space-grotesk, Space Grotesk, sans-serif)' }}>
            MÉTRICAS TÁTICAS
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            // PERFORMANCE DO PIPELINE — DADOS REAIS
          </p>
        </div>

        <AnalyticsClient leads={leads} />
      </div>
    </DashboardLayout>
  )
}
