import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="h-8 w-48 bg-[var(--surface-elevated)] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[var(--surface-card)] border border-[var(--border-default)] rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[var(--surface-card)] border border-[var(--border-default)] rounded animate-pulse" />
      </div>
    </DashboardLayout>
  )
}
