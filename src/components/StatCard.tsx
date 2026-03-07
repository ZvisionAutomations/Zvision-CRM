import React from "react"
import { motion } from "framer-motion"

interface StatCardProps {
    title: string
    value: string
    unit?: string
    trendValue: string
    trendDirection: "up" | "down" | "neutral"
    icon?: React.ReactNode
    progress?: number
}

export default function StatCard({ title, value, unit, trendValue, trendDirection, icon, progress }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative bg-[#0d0d10]/80 border border-white/5 rounded-xl p-5 overflow-hidden glass-panel"
        >
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {icon && <div className="text-slate-500 group-hover:text-primary transition-colors">{icon}</div>}
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{title}</span>
                    </div>
                    <span
                        className={`text-xs font-mono px-2 py-0.5 rounded border ${trendDirection === "up" ? "text-primary border-primary/20 bg-primary/10" :
                                trendDirection === "down" ? "text-red-500 border-red-500/20 bg-red-500/10" :
                                    "text-slate-400 border-white/10 bg-white/5"
                            }`}
                    >
                        {trendDirection === "up" ? "+" : ""}{trendValue}
                    </span>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-slate-100 tracking-tight glow-text-subtle">{value}</span>
                    {unit && <span className="text-slate-600 text-[10px] font-mono">{unit}</span>}
                </div>

                {progress !== undefined && (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full bg-primary"
                        />
                    </div>
                )}
            </div>

            {/* Scanline decorative corner */}
            <div className="absolute bottom-0 right-0 w-8 h-8 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 0V100H0" stroke="var(--accent-primary)" strokeWidth="4" />
                </svg>
            </div>
        </motion.div>
    )
}
