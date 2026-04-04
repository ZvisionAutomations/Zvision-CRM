import React from "react"
import Link from "next/link"
import { Shield, Zap, Users } from "lucide-react"

function Logo() {
    return (
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded shadow-sm flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
                <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl text-white tracking-[4px] font-mono">ZVISION</span>
        </Link>
    )
}

const testimonial = {
    quote: "Cada lead é uma missão. Cada fechamento é uma vitória.",
    author: "Sistema Zvision",
    role: "CRM de Inteligência Tática",
}

const stats = [
    { value: "R$ 2.4M", label: "Pipeline Ativo" },
    { value: "94%", label: "Taxa Briefing IA" },
    { value: "< 2min", label: "Intel por Lead" },
]

const features = [
    { icon: Shield, label: "Isolamento por empresa" },
    { icon: Zap, label: "Briefing em 2 minutos" },
    { icon: Users, label: "Multi-operador" },
]

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Rich left panel - hidden on mobile */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-border"
                style={{
                    backgroundColor: 'var(--surface-page)',
                    backgroundImage: `
            repeating-linear-gradient(rgba(162, 230, 53, 0.03) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(90deg, rgba(162, 230, 53, 0.03) 0 1px, transparent 1px 40px)
          `
                }}
            >
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Logo />

                    {/* Main content - Testimonial */}
                    <div className="space-y-8">
                        <blockquote className="space-y-4">
                            <p className="text-2xl font-medium leading-relaxed text-white text-balance font-mono">
                                "{testimonial.quote}"
                            </p>
                            <footer className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded flex items-center justify-center font-mono text-sm border" style={{ background: 'var(--surface-elevated)', color: 'var(--accent-primary)', borderColor: 'var(--border)' }}>
                                    SZ
                                </div>
                                <div>
                                    <p className="font-mono text-white text-sm uppercase tracking-wide">{testimonial.author}</p>
                                    <p className="text-sm text-zinc-500 font-mono">{testimonial.role}</p>
                                </div>
                            </footer>
                        </blockquote>

                        {/* Stats */}
                        <div className="flex gap-8 pt-8 border-t border-border">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-primary)' }}>{stat.value}</p>
                                    <p className="text-sm font-mono mt-1 text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex gap-6">
                        {features.map((feature) => (
                            <div key={feature.label} className="flex items-center gap-2 text-zinc-500">
                                <feature.icon className="w-4 h-4 text-lime" />
                                <span className="text-sm font-mono">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <main className="flex-1 flex flex-col border-l border-border" style={{ backgroundColor: 'var(--surface-page)', backgroundImage: 'repeating-linear-gradient(rgba(162, 230, 53, 0.03) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(162, 230, 53, 0.03) 0 1px, transparent 1px 40px)' }}>
                {/* Mobile header with logo */}
                <div className="lg:hidden p-6 pb-0">
                    <Logo />
                </div>

                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
