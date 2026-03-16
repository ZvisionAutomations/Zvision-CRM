"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type CharacterSet = string[] | readonly string[]

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[]

const getRandomInt = (max: number): number => Math.floor(Math.random() * max)

interface HyperTextProps {
  /** The text content to be animated */
  children: string
  /** Optional className for styling */
  className?: string
  /** Duration of the animation in milliseconds */
  duration?: number
  /** Delay before animation starts in milliseconds */
  delay?: number
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet
  /** Optional inline style */
  style?: React.CSSProperties
}

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  style,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(() =>
    children.split("")
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const iterationCount = useRef(0)

  // Re-sync displayText when children changes (e.g. user name loads async)
  useEffect(() => {
    setDisplayText(children.split(""))
    iterationCount.current = 0
    setIsAnimating(true)
  }, [children])

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0
      setIsAnimating(true)
    }
  }

  // Trigger scramble animation on mount
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsAnimating(true)
    }, delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  // Handle scramble animation frames
  useEffect(() => {
    let animationFrameId: number | null = null

    if (isAnimating) {
      const maxIterations = children.length
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        iterationCount.current = progress * maxIterations

        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            letter === " "
              ? letter
              : index <= iterationCount.current
                ? children[index]
                : characterSet[getRandomInt(characterSet.length)]
          )
        )

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [children, duration, isAnimating, characterSet])

  return (
    <div
      className={cn("overflow-hidden font-bold", className)}
      style={style}
      onMouseEnter={handleAnimationTrigger}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span
            key={index}
            className={cn("font-mono", letter === " " ? "inline-block w-3" : "inline")}
          >
            {(letter ?? "").toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
