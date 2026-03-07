"use client"

import React, { useState, useEffect } from "react"
import { ShieldAlert } from "lucide-react"

export function BootScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0)
    const [logs, setLogs] = useState<string[]>([])
    const [isVisible, setIsVisible] = useState(true)

    const systemLogs = [
        "INITIALIZING SYSTEM ARCHITECTURE...",
        "LOADING CORE MODULES: [OK]",
        "ESTABLISHING SECURE UPLINK...",
        "UPLINK_STATUS: CONNECTED (LATENCY: 12ms)",
        "MOUNTING AI SENTIMENT ENGINE...",
        "AI_ENGINE: ONLINE",
        "DECRYPTING DASHBOARD DATA...",
        "DATA DECRYPTION: [OK]",
        "SYSTEM READY."
    ]

    useEffect(() => {
        // Simulate boot progress
        const duration = 2500
        const interval = 50
        const steps = duration / interval
        let currentStep = 0

        const timer = setInterval(() => {
            currentStep++

            // Add a bit of randomness to progress
            const currentProgress = Math.min(((currentStep / steps) * 100) + (Math.random() * 5), 100)
            setProgress(currentProgress)

            // Add logs based on progress
            const logIndex = Math.floor((currentProgress / 100) * systemLogs.length)
            if (logIndex > logs.length && logIndex <= systemLogs.length) {
                setLogs(systemLogs.slice(0, logIndex))
            }

            if (currentStep >= steps) {
                clearInterval(timer)
                setTimeout(() => {
                    setIsVisible(false)
                    setTimeout(onComplete, 500) // Call onComplete after fade out
                }, 300)
            }
        }, interval)

        return () => clearInterval(timer)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 bg-[#050506] flex items-center justify-center tactical-grid animate-out fade-out duration-500 fill-mode-forwards">

            {/* Corner Metadata */}
            <div className="absolute top-6 left-6 text-[9px] font-mono text-[#4b5563] tracking-widest leading-loose">
                SYSTEM ARCHITECTURE<br />
                <span className="text-[#9ca3af]">X-CORE_v9.4.2</span>
            </div>
            <div className="absolute top-6 right-6 text-[9px] font-mono text-[#4b5563] tracking-widest leading-loose text-right">
                DEPLOYMENT STATUS<br />
                <span className="text-[#A2E635]">STABLE_PRODUCTION</span>
            </div>
            <div className="absolute bottom-6 right-6 text-[9px] font-mono text-[#4b5563] tracking-widest text-right">
                COORD: 37.7749° N, 122.4194° W<br />
                SECURE SERVER: US-WEST-1
            </div>

            <div className="flex flex-col items-center w-full max-w-[400px]">

                {/* Glowing Logo */}
                <div className="w-[72px] h-[72px] rounded-xl bg-[#A2E635] flex items-center justify-center mb-6 animate-logo-glow">
                    <ShieldAlert className="w-8 h-8 text-[#050506] fill-current" />
                </div>

                {/* Titles */}
                <h1 className="font-mono font-bold text-4xl text-[#e8e8e8] tracking-[8px] mb-2">ZVISION</h1>
                <p className="font-mono text-[11px] text-[#A2E635] tracking-[4px] mb-12">CYBER-CORE PRD</p>

                {/* Progress Bar */}
                <div className="w-[320px] mb-2 flex justify-end">
                    <span className="font-mono text-[#A2E635] text-[10px]">{Math.floor(progress)}%</span>
                </div>
                <div className="w-[320px] h-[3px] bg-[#141418] rounded-full overflow-hidden mb-12 shadow-[0_0_8px_rgba(162,230,53,0.1)]">
                    <div
                        className="h-full bg-[#A2E635] shadow-neon transition-all duration-75 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Diagnostic Log Panel */}
                <div className="absolute bottom-6 left-6 w-[320px] h-[120px] bg-[rgba(13,13,16,0.9)] border border-white/5 rounded-[4px] p-3 overflow-hidden flex flex-col justify-end">
                    <div className="absolute top-2 left-3 font-mono text-[8px] text-[#4b5563] tracking-widest border-b border-white/5 pb-1 w-[calc(100%-24px)]">
                        DIAGNOSTIC_LOG
                    </div>
                    <div className="space-y-1 mt-6">
                        {logs.map((log, i) => {
                            const isLast = i === logs.length - 1;
                            const isError = log.includes("ERROR");
                            const isOk = log.includes("[OK]");

                            let color = "text-[#9ca3af]";
                            if (isOk) color = "text-[#22c55e]";
                            if (isError) color = "text-[#ef4444]";
                            if (isLast && !isOk && !isError) color = "text-[#f59e0b]"; // Amber for current active process

                            return (
                                <div key={i} className={`font-mono text-[9px] ${color} animate-slide-up flex gap-2`}>
                                    <span className={isLast ? "opacity-100" : "opacity-30"}>{isLast ? ">>" : ">"}</span>
                                    {log}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
