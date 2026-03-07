import React from "react"
import { motion } from "framer-motion"
import { Clock, ShieldAlert, Crosshair, MessageSquare, Archive } from "lucide-react"

export type ActivityType = "intel" | "alert" | "target" | "comms" | "system"

export interface ActivityItem {
    id: string
    time: string
    type: ActivityType
    title: string
    description: React.ReactNode
    tags?: string[]
}

interface ActivityTimelineProps {
    title?: string
    activities: ActivityItem[]
}

export default function ActivityTimeline({ title, activities }: ActivityTimelineProps) {
    const getIcon = (type: ActivityType) => {
        switch (type) {
            case "intel": return <Clock className="w-3 h-3" />
            case "alert": return <ShieldAlert className="w-3 h-3" />
            case "target": return <Crosshair className="w-3 h-3" />
            case "comms": return <MessageSquare className="w-3 h-3" />
            case "system": return <Archive className="w-3 h-3" />
            default: return <Clock className="w-3 h-3" />
        }
    }

    const getColor = (type: ActivityType) => {
        switch (type) {
            case "intel": return "text-blue-400 bg-blue-500/10 border-blue-500/20"
            case "alert": return "text-red-500 bg-red-500/10 border-red-500/20"
            case "target": return "text-primary bg-primary/10 border-primary/20"
            case "comms": return "text-amber-400 bg-amber-400/10 border-amber-400/20"
            case "system": return "text-slate-400 bg-white/5 border-white/10"
            default: return "text-slate-400 bg-white/5 border-white/10"
        }
    }

    return (
        <div className="glass-panel border border-white/5 rounded-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-[#0d0d10]/50 backdrop-blur-sm flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-neon"></div>
                    <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase font-mono">{title || "REAL-TIME INTEL FEED"}</h3>
                </div>
            </div>

            <div className="flex-1 p-0 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none z-0"></div>

                <div className="divide-y divide-white/5 relative z-10">
                    {activities.map((activity, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={activity.id}
                            className="p-4 hover:bg-white/5 flex gap-4 items-start transition-colors group cursor-default"
                        >
                            <div className="text-[10px] text-slate-600 font-bold pt-1 tabular-nums shrink-0 font-mono tracking-tighter">
                                {activity.time}
                            </div>

                            <div className="space-y-2 flex-1 relative">
                                {/* Connecting line for timeline visual */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-[-21px] top-6 bottom-[-24px] w-[1px] bg-white/5 group-hover:bg-primary/20 transition-colors"></div>
                                )}

                                <div className="flex items-center gap-2">
                                    <span className={`p-1.5 rounded-full border ${getColor(activity.type)}`}>
                                        {getIcon(activity.type)}
                                    </span>
                                    <h4 className="text-xs font-bold text-slate-200 tracking-wide">{activity.title}</h4>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                                    {activity.description}
                                </p>

                                {activity.tags && activity.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {activity.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[9px] bg-[#0d0d10] px-2 py-0.5 rounded text-slate-500 uppercase font-bold border border-white/5 tracking-tighter"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
