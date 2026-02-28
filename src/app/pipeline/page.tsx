import React from 'react';
import { LayoutDashboard, View, Users, BarChart3, Settings, Shield, Network, Search, Bell, ChevronDown, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Pipeline() {
    return (
        <div className="flex h-screen w-full bg-[#050505] text-[#E5E5E5] font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex flex-col border-r border-[#A2E635]/10 bg-[#050505]/80 backdrop-blur-xl shrink-0 z-40">
                <div className="p-6 flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#A2E635]/20 flex items-center justify-center border border-[#A2E635]/30 shadow-[0_0_5px_rgba(162,230,53,0.3)]">
                            <Shield className="text-[#A2E635]" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-bold leading-tight uppercase tracking-wider">Zvision</h1>
                            <p className="text-[#A2E635]/60 text-xs font-medium uppercase tracking-widest">Cyber-Core</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2 flex-1">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#A2E635]/5 hover:text-[#A2E635] transition-colors">
                            <LayoutDashboard size={20} />
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link href="/pipeline" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#A2E635]/10 text-[#A2E635] border border-[#A2E635]/20 shadow-[0_0_5px_rgba(162,230,53,0.1)]">
                            <View size={20} />
                            <span className="text-sm font-medium">Pipeline</span>
                        </Link>
                        <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#A2E635]/5 hover:text-[#A2E635] transition-colors">
                            <Users size={20} />
                            <span className="text-sm font-medium">Clientes</span>
                        </Link>
                        <Link href="/relatorios" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#A2E635]/5 hover:text-[#A2E635] transition-colors">
                            <BarChart3 size={20} />
                            <span className="text-sm font-medium">Relatórios</span>
                        </Link>

                        <div className="mt-auto">
                            <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#A2E635]/5 hover:text-[#A2E635] transition-colors">
                                <Settings size={20} />
                                <span className="text-sm font-medium">Configurações</span>
                            </Link>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative" style={{
                backgroundSize: '40px 40px',
                backgroundImage: 'linear-gradient(to right, rgba(162, 230, 53, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(162, 230, 53, 0.05) 1px, transparent 1px)'
            }}>

                {/* Header */}
                <header className="h-20 border-b border-[#A2E635]/10 bg-[#050505]/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Network className="text-[#A2E635]" size={24} />
                            <h2 className="text-xl font-bold tracking-tight uppercase text-white">Pipeline de Vendas</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-[#A2E635]/10 px-3 py-1 rounded-full border border-[#A2E635]/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A2E635] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A2E635]"></span>
                            </span>
                            <span className="text-[10px] font-mono text-[#A2E635] font-bold uppercase tracking-widest leading-none">System Status: Live</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-[#A2E635]/5 border border-[#A2E635]/10 rounded-lg px-3 py-2 w-64 focus-within:border-[#A2E635]/40 transition-all">
                            <Search className="text-slate-500" size={18} />
                            <input className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full ml-2" placeholder="Search data points..." type="text" />
                        </div>
                        <button className="p-2 rounded-lg bg-[#A2E635]/5 border border-[#A2E635]/10 text-slate-400 hover:text-[#A2E635] transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-lg bg-[#A2E635]/20 border border-[#A2E635]/30 flex items-center justify-center overflow-hidden bg-gray-600 cursor-pointer">
                        </div>
                    </div>
                </header>

                {/* Filters Bar */}
                <div className="px-8 py-4 flex items-center justify-between bg-[#111] border-b border-[#A2E635]/5 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#A2E635]/5 border border-[#A2E635]/10 text-xs font-medium text-slate-400 hover:border-[#A2E635]/30">
                            Setor <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#A2E635]/5 border border-[#A2E635]/10 text-xs font-medium text-slate-400 hover:border-[#A2E635]/30">
                            Valor <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#A2E635]/5 border border-[#A2E635]/10 text-xs font-medium text-slate-400 hover:border-[#A2E635]/30">
                            Prioridade <ChevronDown size={14} />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#A2E635] text-[#050505] font-bold text-sm tracking-wide hover:brightness-110 shadow-[0_0_20px_rgba(162,230,53,0.2)] transition-all uppercase">
                        <PlusCircle size={18} />
                        Novo Card
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto p-8 flex gap-6 z-20">

                    {/* Column 1 */}
                    <div className="min-w-[300px] w-1/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                Lead Frio
                            </h3>
                            <span className="text-xs font-mono text-slate-600">02</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">NX</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Nexus Quantum Core</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 145.000</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-tighter">Cold Intake</span>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">SC</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Shadow Cryptic Ltd</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 48.200</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-tighter">New Lead</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="min-w-[300px] w-1/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Contato Inicial
                            </h3>
                            <span className="text-xs font-mono text-slate-600">01</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">VS</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Vector Systems</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 210.000</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/30 text-blue-400 border border-blue-500/20 uppercase tracking-tighter">In Meeting</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="min-w-[300px] w-1/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Negociação
                            </h3>
                            <span className="text-xs font-mono text-slate-600">02</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="glass-panel p-4 rounded-xl border-l-[3px] border-l-amber-500 flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">OB</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Omni-Bank Digital</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 890.500</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/30 text-amber-400 border border-amber-500/20 uppercase tracking-tighter">Reviewing</span>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">TK</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Tekno Global</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 325.000</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/30 text-amber-400 border border-amber-500/20 uppercase tracking-tighter">Drafting</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 4 */}
                    <div className="min-w-[300px] w-1/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Aprovação
                            </h3>
                            <span className="text-xs font-mono text-slate-600">01</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#A2E635]/10 border border-[#A2E635]/20 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">ZN</div>
                                    <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Zenith Networks</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 542.000</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/30 text-purple-400 border border-purple-500/20 uppercase tracking-tighter">Final Approv</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 5 */}
                    <div className="min-w-[300px] w-1/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm text-[#A2E635] uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#A2E635]"></span>
                                Contrato Fechado
                            </h3>
                            <span className="text-xs font-mono text-slate-600">01</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 group bg-[#A2E635]/10 border-[#A2E635]/20 hover:border-[#A2E635] transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#A2E635]/20 border border-[#A2E635]/30 flex items-center justify-center text-[10px] font-bold text-[#A2E635]">GL</div>
                                        <h4 className="text-sm font-semibold truncate group-hover:text-[#A2E635] transition-colors">Grid-Lock Sec</h4>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[#A2E635] font-bold text-base">R$ 1.2M</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A2E635]/20 text-[#A2E635] border border-[#A2E635]/40 uppercase tracking-tighter">Success</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            {/* Decorative Overlays */}
            <div className="fixed bottom-4 left-4 pointer-events-none opacity-20 z-50">
                <div className="text-[8px] font-mono text-[#A2E635] leading-tight">
                    DECRYPTION ACTIVE...<br />
                    SECURE_RELAY_V2.0<br />
                    LATENCY: 12ms<br />
                    ENCRYPTION: AES-256
                </div>
            </div>
            <div className="fixed top-24 right-4 pointer-events-none opacity-10 z-50">
                <div className="flex flex-col gap-1 items-end">
                    <div className="w-32 h-1 bg-[#A2E635]/40 rounded-full"></div>
                    <div className="w-24 h-1 bg-[#A2E635]/20 rounded-full"></div>
                    <div className="w-40 h-1 bg-[#A2E635]/40 rounded-full"></div>
                </div>
            </div>

        </div>
    );
}
