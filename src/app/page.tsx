"use client";

import { Bell, DollarSign, Filter, Target, TrendingUp, TrendingDown, Grid, ListTodo, UploadCloud, Settings } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const revenueData = [
  { time: '00:00', revenue: 120 },
  { time: '04:00', revenue: 190 },
  { time: '08:00', revenue: 150 },
  { time: '12:00', revenue: 250 },
  { time: '16:00', revenue: 220 },
  { time: '20:00', revenue: 300 },
  { time: '24:00', revenue: 280 },
];

const clientData = [
  { day: 'Mon', inbound: 45, outbound: 28 },
  { day: 'Tue', inbound: 59, outbound: 48 },
  { day: 'Wed', inbound: 80, outbound: 40 },
  { day: 'Thu', inbound: 81, outbound: 19 },
  { day: 'Fri', inbound: 56, outbound: 86 },
  { day: 'Sat', inbound: 55, outbound: 27 },
  { day: 'Sun', inbound: 40, outbound: 90 },
];

const activeTargets = [
  { initials: 'AC', name: 'Arasaka Corp', desc: 'Cyber-Sec Infrastructure', value: '$240k', risk: 'ALTO', color: 'bg-primary', hoverColor: 'group-hover:text-primary' },
  { initials: 'MT', name: 'Militech Intl', desc: 'Defense Contracts', value: '$850k', risk: 'MÉDIO', color: 'bg-yellow-500', hoverColor: 'group-hover:text-primary' },
  { initials: 'BT', name: 'Biotechnica', desc: 'Organic Processors', value: '$120k', risk: 'ALTO', color: 'bg-primary', hoverColor: 'group-hover:text-primary' },
  { initials: 'KV', name: 'Kang Tao', desc: 'Smart Weaponry', value: '$440k', risk: 'BAIXO', color: 'bg-red-500', hoverColor: 'group-hover:text-primary' },
  { initials: 'NE', name: 'Night Corp', desc: 'Urban Planning', value: '$900k', risk: 'ALTO', color: 'bg-primary', hoverColor: 'group-hover:text-primary' },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#E5E5E5] font-sans antialiased overflow-hidden relative">
      {/* Scanline Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-40 mix-blend-overlay"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      ></div>

      {/* Sidebar Navigation */}
      <aside className="w-16 h-full glass-panel border-l-0 border-t-0 border-b-0 rounded-none flex flex-col items-center py-6 gap-8 z-40 border-r border-[#A2E635]/30 relative bg-[#141414]/60">
        <div className="w-10 h-10 rounded bg-[#A2E635]/20 flex items-center justify-center border border-[#A2E635]/40 shadow-[0_0_5px_rgba(162,230,53,0.3)] mb-4">
          <Target className="text-[#A2E635]" size={24} />
        </div>

        <nav className="flex flex-col gap-6 w-full">
          <button className="group relative w-full h-12 flex items-center justify-center text-[#A2E635] bg-[#A2E635]/10 border-l-2 border-[#A2E635] transition-all duration-300 shadow-[0_0_5px_rgba(162,230,53,0.3)]">
            <Grid className="group-hover:scale-110 transition-transform" />
            <div className="absolute left-14 bg-black border border-[#A2E635] text-[#A2E635] px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">DASHBOARD</div>
          </button>

          <button className="group relative w-full h-12 flex items-center justify-center text-[#6B7280] hover:text-[#A2E635] transition-colors">
            <ListTodo className="group-hover:scale-110 transition-transform" />
            <div className="absolute left-14 bg-black border border-[#A2E635] text-[#A2E635] px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">PIPELINE</div>
          </button>

          <button className="group relative w-full h-12 flex items-center justify-center text-[#6B7280] hover:text-[#A2E635] transition-colors">
            <UploadCloud className="group-hover:scale-110 transition-transform" />
            <div className="absolute left-14 bg-black border border-[#A2E635] text-[#A2E635] px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">DADOS</div>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-6 w-full items-center">
          <button className="group relative w-full h-12 flex items-center justify-center text-[#6B7280] hover:text-[#A2E635] transition-colors">
            <Settings className="group-hover:rotate-90 transition-transform" />
            <div className="absolute left-14 bg-black border border-[#A2E635] text-[#A2E635] px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">AJUSTES</div>
          </button>
          <div className="w-8 h-8 rounded-full bg-cover border border-[#6B7280] opacity-60 hover:opacity-100 hover:border-[#A2E635] transition-all cursor-pointer bg-gray-600"></div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(162, 230, 53, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(162, 230, 53, 0.05) 1px, transparent 1px)'
        }}>

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 glass-panel border-l-0 border-t-0 rounded-none z-30 shrink-0 bg-[#141414]/60">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-widest text-white uppercase">PAINEL DE CONTROLE</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A2E635]/20 text-[#A2E635] border border-[#A2E635]/30 animate-pulse">LIVE FEED ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-[#6B7280]">SYS_STATUS</span>
              <span className="text-xs font-mono text-[#A2E635]">OPTIMAL</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-[#6B7280]">NET_VERSION</span>
              <span className="text-xs font-mono text-white">v.2.0.77</span>
            </div>
            <button className="p-2 text-[#6B7280] hover:text-white transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-12 gap-6 pb-20">

          {/* ROI Cards Row */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="glass-panel p-5 rounded-sm relative group hover:border-[#A2E635]/50 transition-colors bg-[#141414]/60">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <DollarSign className="text-[#A2E635]" size={30} />
              </div>
              <p className="text-xs font-mono text-[#6B7280] mb-1">RECEITA TOTAL</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">$1,240,500</h2>
                <span className="text-sm font-mono text-[#A2E635] flex items-center mb-1">
                  <TrendingUp size={16} className="mr-1" />+12.5%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-0.5 mt-4 overflow-hidden">
                <div className="bg-[#A2E635] h-full w-[75%] shadow-[0_0_10px_#A2E635]"></div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-sm relative group hover:border-[#A2E635]/50 transition-colors bg-[#141414]/60">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <Filter className="text-[#A2E635]" size={30} />
              </div>
              <p className="text-xs font-mono text-[#6B7280] mb-1">PIPELINE ATIVO</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">42 NEGÓCIOS</h2>
                <span className="text-sm font-mono text-[#A2E635] flex items-center mb-1">
                  <TrendingUp size={16} className="mr-1" />+8.0%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-0.5 mt-4 overflow-hidden">
                <div className="bg-[#A2E635] h-full w-[45%] shadow-[0_0_10px_#A2E635]"></div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-sm relative group hover:border-[#A2E635]/50 transition-colors bg-[#141414]/60">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <Target className="text-red-500" size={30} />
              </div>
              <p className="text-xs font-mono text-[#6B7280] mb-1">TAXA DE CONVERSÃO</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">68%</h2>
                <span className="text-sm font-mono text-red-500 flex items-center mb-1">
                  <TrendingDown size={16} className="mr-1" />-2.1%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-0.5 mt-4 overflow-hidden">
                <div className="bg-red-500 h-full w-[68%] shadow-[0_0_10px_#EF4444]"></div>
              </div>
            </div>

          </div>

          {/* Chart Section */}
          <div className="col-span-12 lg:col-span-8 glass-panel rounded-sm flex flex-col relative overflow-hidden group bg-[#141414]/60">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#A2E635]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#A2E635]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#A2E635]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#A2E635]"></div>

            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-mono text-[#A2E635] tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#A2E635] rounded-full animate-pulse"></span> FLUXOS INTERNOS ZVISION
              </h3>
              <div className="flex gap-2">
                <button className="text-[10px] font-mono px-2 py-1 bg-[#A2E635]/20 text-[#A2E635] border border-[#A2E635]/30 rounded hover:bg-[#A2E635]/30">1H</button>
                <button className="text-[10px] font-mono px-2 py-1 bg-white/5 text-[#6B7280] border border-white/10 rounded hover:bg-white/10">24H</button>
                <button className="text-[10px] font-mono px-2 py-1 bg-white/5 text-[#6B7280] border border-white/10 rounded hover:bg-white/10">7D</button>
              </div>
            </div>

            <div className="relative flex-1 p-4 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A2E635" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A2E635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#A2E635', color: '#fff' }}
                    itemStyle={{ color: '#A2E635' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#A2E635" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Targets List */}
          <div className="col-span-12 lg:col-span-4 glass-panel rounded-sm flex flex-col bg-[#141414]/60">
            <div className="p-4 border-b border-white/5 bg-black/20">
              <h3 className="text-sm font-mono text-white tracking-wider uppercase">ALVOS ATIVOS</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {activeTargets.map((target, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3 rounded hover:bg-white/5 border border-transparent hover:border-[#A2E635]/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">{target.initials}</div>
                    <div>
                      <h4 className={`text-sm font-bold text-white transition-colors ${target.hoverColor}`}>{target.name}</h4>
                      <p className="text-[10px] font-mono text-[#6B7280]">{target.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#A2E635]">{target.value}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${target.color}`}></span>
                      <span className="text-[10px] font-mono text-[#6B7280] uppercase">{target.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Chart */}
          <div className="col-span-12 glass-panel rounded-sm flex flex-col h-64 relative group bg-[#141414]/60">
            <div className="absolute bottom-0 right-0 p-2 z-10">
              <span className="text-[10px] font-mono text-[#6B7280]">DATA_DENSITY: 98%</span>
            </div>
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-mono text-white tracking-wider uppercase">FLUXO DE CLIENTES [TRÁFEGO]</h3>
            </div>
            <div className="relative flex-1 p-4 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis stroke="transparent" tick={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#A2E635', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ top: -10 }} />
                  <Line type="monotone" dataKey="inbound" stroke="#A2E635" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#A2E635' }} />
                  <Line type="monotone" dataKey="outbound" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
