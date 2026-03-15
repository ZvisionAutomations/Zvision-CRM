import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PulseDashboardClient } from "@/components/dashboard/pulse-dashboard-client"
import { getLeads } from "@/lib/actions/leads"

export default async function PulseDashboard() {
  const { leads, total } = await getLeads({ limit: 100 })

  return (
    <DashboardLayout>
      <PulseDashboardClient leads={leads} total={total} />
    </DashboardLayout>
  )
}
