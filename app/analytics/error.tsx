'use client'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="font-mono text-[11px] text-[var(--status-error)] uppercase tracking-wider mb-2">
          // FALHA NO CARREGAMENTO
        </p>
        <p className="font-mono text-[10px] text-[var(--text-muted)] mb-4">
          {error.message || 'Erro inesperado'}
        </p>
        <button
          onClick={reset}
          className="font-mono text-[11px] uppercase tracking-wider px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-bright)] hover:text-[var(--accent-primary)] transition-colors"
        >
          // TENTAR NOVAMENTE
        </button>
      </div>
    </DashboardLayout>
  )
}
