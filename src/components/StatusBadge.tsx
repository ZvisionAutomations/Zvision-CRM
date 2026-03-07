import React from "react"

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral"

interface StatusBadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    pulse?: boolean
    className?: string
}

export default function StatusBadge({ children, variant = "default", pulse = false, className = "" }: StatusBadgeProps) {
    const getColors = () => {
        switch (variant) {
            case "success":
                return "text-primary bg-primary/10 border-primary/20"
            case "warning":
                return "text-amber-400 bg-amber-400/10 border-amber-400/20"
            case "danger":
                return "text-red-500 bg-red-500/10 border-red-500/20"
            case "neutral":
                return "text-slate-400 bg-white/5 border-white/10"
            case "default":
            default:
                return "text-blue-400 bg-blue-500/10 border-blue-500/20"
        }
    }

    const colors = getColors()

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono border uppercase tracking-widest ${colors} ${className}`}
        >
            {pulse && (
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-primary' :
                    variant === 'warning' ? 'bg-amber-400' :
                        variant === 'danger' ? 'bg-red-500' :
                            variant === 'neutral' ? 'bg-slate-400' : 'bg-blue-400'
                    } animate-pulse relative`} />
            )}
            {children}
        </span>
    )
}
