import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PulseDashboardClient } from "@/components/dashboard/pulse-dashboard-client"
import { getLeads, getLeadSparklines } from "@/lib/actions/leads"

export default async function PulseDashboard() {
  const [{ leads, total }, sparklines] = await Promise.all([
    getLeads({ limit: 100 }),
    getLeadSparklines(),
  ])

  return (
    <DashboardLayout>
      <PulseDashboardClient leads={leads} total={total} sparklines={sparklines} />
    </DashboardLayout>
  )
}
