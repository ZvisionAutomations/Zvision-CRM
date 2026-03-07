"use client"

import React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Crosshair, Target, Activity, Terminal } from "lucide-react"

import StatCard from "@/components/StatCard"
import DataTable from "@/components/DataTable"
import ActivityTimeline from "@/components/ActivityTimeline"

// Dados fictícios baseados no pedido
const revenueData = [
    { name: 'SEM-01', total: 1200 },
    { name: 'SEM-02', total: 2100 },
    { name: 'SEM-03', total: 1800 },
    { name: 'SEM-04', total: 3200 },
    { name: 'SEM-05', total: 4300 },
]

const recentTargets = [
    { id: "TGT-884", empresa: "Tecnologia Viper S.A.", status: "Lead Quente", valor: "R$ 450.000", conf: "82%" },
    { id: "TGT-102", empresa: "Nexus Engenharia", status: "Em Análise", valor: "R$ 1.200.000", conf: "45%" },
    { id: "TGT-933", empresa: "Sistemas Aegis Ltda.", status: "Negociação", valor: "R$ 890.000", conf: "91%" },
    { id: "TGT-404", empresa: "Indústrias Nova", status: "Falha Crítica", valor: "R$ 220.000", conf: "12%" },
    { id: "TGT-777", empresa: "Logística Sombra", status: "Sucesso", valor: "R$ 670.000", conf: "99%" },
]

const recentActivities = [
    { id: "act-1", time: "10:45", type: "intel" as const, title: "Briefing Atualizado", description: "Overture Security relatou novas dores logísticas na filial sul. Probabilidade aumentada em 12%." },
    { id: "act-2", time: "09:30", type: "target" as const, title: "Alvo Engajado", description: "CMD. SHEPARD iniciou protocolo de contato inicial com Sistemas Aegis Ltda.", tags: ["Ataque Direto", "Prioridade Alfa"] },
    { id: "act-3", time: "08:15", type: "alert" as const, title: "Alerta de Fuga", description: "Indústrias Nova demonstrando padrão de resposta lento (>72h). Risco de perda iminente." },
    { id: "act-4", time: "07:00", type: "system" as const, title: "Sincronização de DB", description: "Supabase completou sync. 14 novos leads injetados no Pipeline de Reconhecimento." },
]

export default function Dashboard() {
    return (
        <>
            {/* Main Content */}
            {/* Bento Grid layout */}
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-6 overflow-y-auto z-10 relative">
                <div className="tactical-grid absolute inset-0 pointer-events-none opacity-50 z-0"></div>

                {/* Stat Cards Row */}
                <div className="md:col-span-3 md:row-span-1">
                    <StatCard
                        title="Receita Prevista"
                        value="R$ 4.2M"
                        unit="BRL"
                        trendValue="12.4%"
                        trendDirection="up"
                        progress={72}
                        icon={<Crosshair className="w-4 h-4" />}
                    />
                </div>
                <div className="md:col-span-3 md:row-span-1">
                    <StatCard
                        title="Oportunidades"
                        value="128"
                        unit="ATIVAS"
                        trendValue="5.1%"
                        trendDirection="up"
                        progress={45}
                        icon={<Target className="w-4 h-4" />}
                    />
                </div>
                <div className="md:col-span-3 md:row-span-1">
                    <StatCard
                        title="Win Rate"
                        value="64%"
                        unit="RAZÃO"
                        trendValue="2.4%"
                        trendDirection="down"
                        progress={64}
                        icon={<Activity className="w-4 h-4" />}
                    />
                </div>
                <div className="md:col-span-3 md:row-span-1">
                    <StatCard
                        title="Sistemas"
                        value="99.9%"
                        unit="UPTIME"
                        trendValue="0.0%"
                        trendDirection="neutral"
                        progress={100}
                        icon={<Terminal className="w-4 h-4" />}
                    />
                </div>

                {/* Gráfico Principal */}
                <div className="md:col-span-8 md:row-span-5 glass-panel p-6 flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-8 relative">
                        <div>
                            <h3 className="text-slate-100 text-lg font-bold">Fluxos Zvision</h3>
                            <p className="text-slate-500 text-xs font-mono">Métricas de Velocidade Tática</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* LIVE FEED animado solicitado no corner superior direito do gráfico */}
                            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/20 rounded text-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">LIVE FEED</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono rounded">30D</button>
                                <button className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono rounded hover:bg-white/10">90D</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-full relative z-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    fontFamily="monospace"
                                    tick={{ fill: '#9ca3af' }}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value}`}
                                    fontFamily="monospace"
                                    tick={{ fill: '#9ca3af' }}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(5,5,6,0.9)',
                                        border: '1px solid rgba(162,230,53,0.3)',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--accent-primary)"
                                    strokeWidth={2}     /* 2px thickness as requested */
                                    fillOpacity={1}
                                    fill="url(#cyberGradient)"
                                    activeDot={{ r: 6, fill: '#0d0d10', stroke: 'var(--accent-primary)', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Table */}
                <div className="md:col-span-4 md:row-span-3 relative z-20">
                    <DataTable
                        title="ALVOS TÁTICOS ATIVOS"
                        statusKey="status"
                        columns={[
                            { key: "id", title: "ID" },
                            { key: "empresa", title: "Empresa" },
                            { key: "valor", title: "Valuation" },
                            { key: "conf", title: "Confiança" },
                            { key: "status", title: "Status" },
                        ]}
                        data={recentTargets}
                        onRowClick={() => console.log("clicked")}
                    />
                </div>

                {/* Activity Timeline */}
                <div className="md:col-span-4 md:row-span-2 relative z-20">
                    <ActivityTimeline
                        title="LOG DE ATIVIDADE"
                        activities={recentActivities}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-4 flex gap-2 z-50">
                <div className="bg-[#0d0d10]/80 backdrop-blur-md border border-white/5 px-4 py-2 rounded-lg flex items-center gap-3">
                    <Terminal className="text-primary w-4 h-4" />
                    <span className="text-[10px] font-mono text-slate-400 tracking-tighter">CONEXÃO SEGURA [AES-256]</span>
                </div>
            </div>
        </>
    )
}
