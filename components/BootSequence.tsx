"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal } from "lucide-react"

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [text, setText] = useState("")
    const [step, setStep] = useState(0)

    const sequence = [
        "INITIALIZING ZVISION CYBER-CORE...",
        "ESTABLISHING SECURE CONNECTION...",
        "LOADING TACTICAL ASSETS...",
        "ACCESS GRANTED."
    ]

    useEffect(() => {
        if (step >= sequence.length) {
            setTimeout(onComplete, 500)
            return
        }

        let currentText = ""
        let currentIndex = 0
        const targetText = sequence[step]

        const interval = setInterval(() => {
            if (currentIndex <= targetText.length) {
                currentText = targetText.slice(0, currentIndex)
                setText(currentText)
                currentIndex++
            } else {
                clearInterval(interval)
                setTimeout(() => setStep(s => s + 1), 300)
            }
        }, 30)

        return () => clearInterval(interval)
    }, [step, onComplete])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center font-mono"
            >
                <div className="w-full max-w-md p-6">
                    <div className="flex items-center gap-3 mb-6 text-lime">
                        <Terminal className="w-6 h-6 animate-pulse" />
                        <span className="text-xl font-bold tracking-widest">BOOT SEQUENCE</span>
                    </div>
                    <div className="space-y-2 text-sm text-lime/80 h-32">
                        {sequence.slice(0, step).map((line, i) => (
                            <div key={i} className="opacity-100">{line}</div>
                        ))}
                        {step < sequence.length && (
                            <div className="flex items-center">
                                <span>{text}</span>
                                <span className="w-2 h-4 bg-lime ml-1 animate-pulse" />
                            </div>
                        )}
                    </div>

                    <div className="mt-8 border border-lime/20 h-1 w-full bg-black/50 overflow-hidden">
                        <motion.div
                            className="h-full bg-lime shadow-[0_0_10px_rgba(162,230,53,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step + 1) / sequence.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
