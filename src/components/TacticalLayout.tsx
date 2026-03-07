"use client"

import { useState } from "react"
import { ChevronRight, Monitor, Settings, Shield, Target, Users, Bell, RefreshCw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface TacticalLayoutProps {
    children: React.ReactNode
}

export default function TacticalLayout({ children }: TacticalLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        { id: "overview", icon: Monitor, label: "CENTRAL DE COMANDO", path: "/dashboard" },
        { id: "operations", icon: Target, label: "MISSÕES ATIVAS", path: "/pipeline" },
        { id: "agents", icon: Users, label: "REDE DE AGENTES", path: "/dashboard/agents" },
        { id: "intelligence", icon: Shield, label: "INTEL & BRIEFINGS", path: "/dashboard/intel" },
        { id: "systems", icon: Settings, label: "SISTEMAS", path: "/dashboard/systems" },
    ]

    const currentItem = navItems.find((item) => pathname?.startsWith(item.path)) || navItems[0]

    return (
        <div className="flex h-screen w-full bg-background-dark text-slate-100 font-display overflow-hidden">
            {/* Sidebar */}
            <div
                className={`${sidebarCollapsed ? "w-16" : "w-72"} bg-[#0d0d10] border-r border-white/5 transition-all duration-300 relative z-50 h-full flex flex-col`}
            >
                <div className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
                            <h1 className="text-primary font-bold text-lg tracking-wider">ZVISION OPS</h1>
                            <p className="text-slate-500 font-mono text-[10px] uppercase">v2.1.7 CYBER-CORE</p>
                        </div>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        >
                            <ChevronRight
                                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
                            />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => router.push(item.path)}
                                className={`w-full flex items-center gap-3 p-3 rounded transition-all ${currentItem.id === item.id
                                    ? "bg-primary text-background-dark font-bold shadow-neon"
                                    : "text-slate-400 hover:text-primary hover:bg-primary/10 font-medium"
                                    }`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!sidebarCollapsed && <span className="text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    {!sidebarCollapsed && (
                        <div className="mt-8 p-4 bg-background-dark border border-white/5 rounded-md relative overflow-hidden glass-panel">
                            <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-neon"></div>
                                    <span className="text-[10px] text-slate-200 font-bold tracking-widest uppercase font-mono">SYSTEM ONLINE</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono space-y-1">
                                    <div>UPTIME: 04:12:44:33</div>
                                    <div>AGENTS: 847 ACTIVE</div>
                                    <div>MISSIONS: 23 ONGOING</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background-dark relative">
                {/* Top Header */}
                <div className="h-16 bg-[#0d0d10] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-10 glass-panel">
                    <div className="flex items-center gap-4 truncate">
                        <div className="text-xs text-slate-500 tracking-widest uppercase font-mono">
                            TACTICAL COMMAND / <span className="text-primary font-bold">{currentItem.label}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] text-slate-500 font-mono hidden sm:block uppercase tracking-tighter">LAST SYNC: 14:26:48 GMT-0300</div>
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Dashboard Content Area */}
                <div className="flex-1 overflow-auto custom-scrollbar relative z-0">
                    {children}
                </div>
            </div>
        </div>
    )
}
