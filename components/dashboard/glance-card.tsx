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

      <div className="relative z-10">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>

        <div className="flex items-baseline gap-1 md:gap-2 mb-3 md:mb-4">
          <span className="text-lg sm:text-2xl md:text-4xl font-mono font-semibold tracking-tighter">
            {prefix}
            {useNumberTicker ? (
              <NumberTicker
                value={value}
                className="text-lg sm:text-2xl md:text-4xl font-mono font-semibold tracking-tighter"
              />
            ) : (
              formatCompactNumber(value)
            )}
            {suffix}
          </span>
          <div
            className={cn(
              "flex items-center gap-0.5 text-sm font-medium",
              isPositive ? "text-[var(--accent-primary)]" : "text-destructive"
            )}
          >
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>

        <div className="h-12 -mx-2 mt-2">
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
    </motion.div>
  )
}
