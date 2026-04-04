"use client"

import React from "react"
import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { NumberTicker } from "@/components/ui/number-ticker"

interface GlanceCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change: number
  sparklineData: number[]
  className?: string
  /** When true, renders a live-counting NumberTicker instead of static formatted number */
  useNumberTicker?: boolean
}

import { formatCompactNumber } from "@/lib/formatters"
import { glanceCardContainerVariants, glanceCardItemVariants } from "@/lib/motion-presets"

export { glanceCardContainerVariants, glanceCardItemVariants }

export function GlanceCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  sparklineData,
  className,
  useNumberTicker = false,
}: GlanceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt on mouse move
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const chartData = sparklineData.map((v, index) => ({ value: v, index }))
  const isPositive = change >= 0

  return (
    // glanceCardItemVariants consumed by the parent motion.div stagger container
    <motion.div
      variants={glanceCardItemVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // whileHover: lift + neon border glow | whileTap: tactile press
      whileHover={{
        y: -2,
        boxShadow: "var(--shadow-neon-sm), 0 4px 16px rgba(0,0,0,0.4)",
        borderColor: "var(--border-bright)",
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      }}
      whileTap={{
        y: 0,
        scale: 0.99,
        transition: { duration: 0.1 },
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative p-4 md:p-6 bg-card border border-border overflow-hidden group cursor-default",
        className
      )}
    >
      {/* Ambient hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Label — JetBrains Mono uppercase 9px, letter-spacing 2px */}
        <p
          className="font-mono uppercase text-[9px] text-muted-foreground mb-3"
          style={{ letterSpacing: '2px' }}
        >
          {title}
        </p>

        <div className="flex items-baseline gap-1 md:gap-2 mb-3 md:mb-4">
          {/* Value — JetBrains Mono 700, 28–32px */}
          <span className="text-[28px] md:text-[32px] font-mono font-bold tracking-tight leading-none">
            {prefix}
            {useNumberTicker ? (
              <NumberTicker
                value={value}
                className="text-[28px] md:text-[32px] font-mono font-bold tracking-tight"
              />
            ) : (
              formatCompactNumber(value)
            )}
            {suffix}
          </span>
          {/* Trend arrow */}
          <div
            className="flex items-center gap-0.5 text-[11px] font-mono font-medium"
            style={{ color: isPositive ? 'var(--accent-primary)' : 'var(--status-error)' }}
          >
            {isPositive ? '↑' : '↓'}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>

        <div className="h-12 -mx-2 mt-auto mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--card)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s+/g, "-")})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intensity bar — 2px footer, accent for positive / error for negative */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: isPositive ? 'var(--accent-primary)' : 'var(--status-error)',
          boxShadow: isPositive ? '0 0 6px rgba(162,230,53,0.5)' : '0 0 6px rgba(239,68,68,0.5)',
        }}
      />
    </motion.div>
  )
}
