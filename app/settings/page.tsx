import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getProfile } from "@/lib/actions/profile"
import { SettingsClient } from "@/app/settings/settings-client"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const { data: profile, error } = await getProfile()

    if (error || !profile) {
        return (
            <DashboardLayout>
                <div
                    className="p-8 font-mono text-sm"
                    style={{ color: 'var(--destructive)' }}
                >
                    // FALHA AO CARREGAR PERFIL — tente fazer login novamente
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div
                className="min-h-screen"
                style={{ background: 'var(--surface-page)' }}
            >
                {/* Tactical grid */}
                <div
                    className="fixed inset-0 pointer-events-none pl-14"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(162,230,53,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(162,230,53,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        zIndex: 0,
                    }}
                />

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                    {/* ── Page header ── */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="w-1.5 h-6 rounded-sm"
                                style={{ background: 'var(--accent-primary)' }}
                            />
                            <h1
                                className="font-bold text-2xl uppercase tracking-[0.15em]"
                                style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-space-grotesk, Space Grotesk, sans-serif)' }}
                            >
                                // OPERATOR_CONFIG
                            </h1>
                        </div>
                        <p
                            className="font-mono text-xs ml-[18px]"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Gerencie identidade, acesso e configurações do sistema
                        </p>
                    </div>

                    {/* ── Two-column layout ── */}
                    <SettingsClient initialProfile={profile} />
                </div>
            </div>
        </DashboardLayout>
    )
}
