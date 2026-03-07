"use client"

import { useEffect, useState, Suspense } from "react"
import { motion, useAnimation } from "framer-motion"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <SplineFallback />
})

function SplineFallback() {
    return (
        <div className="w-[200px] h-[200px] flex items-center justify-center relative">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-full h-full"
            >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_rgba(162,230,53,0.5)]">
                    <polygon points="50,10 90,90 10,90" fill="none" stroke="#A2E635" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="#A2E635" strokeWidth="1" opacity="0.4" />
                </svg>
            </motion.div>
        </div>
    )
}

// Terminal Logs state
const logs = [
    { text: "Estabelecendo conexão segura com nó_delta_09...", delay: 0.2 },
    { text: "Desacoplando chaves de API do cofre_quântico_7...", delay: 0.8 },
    { text: "Carregando matriz do pipeline [||||||||||||] 84%", delay: 1.5 },
    { text: "Verificando integridade do núcleo tático... Sucesso", delay: 2.2 },
]

export default function BootSequence() {
    const router = useRouter()
    const controls = useAnimation()

    const [visibleLogs, setVisibleLogs] = useState<number[]>([])
    const [splineLoaded, setSplineLoaded] = useState(false)
    const [showFallback, setShowFallback] = useState(false)

    useEffect(() => {
        // Enforce 3s max load time for Spline
        const splineTimeout = setTimeout(() => {
            if (!splineLoaded) {
                setShowFallback(true)
            }
        }, 3000)

        // Reveal logs over time
        logs.forEach((log, index) => {
            setTimeout(() => {
                setVisibleLogs(prev => [...prev, index])
            }, log.delay * 1000)
        })

        // Start main animation sequence
        controls.start("visible")
        return () => clearTimeout(splineTimeout)
    }, [controls, splineLoaded])

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center tactical-grid bg-background select-none overflow-hidden">
            {/* UI Frame */}
            <div className="absolute top-0 left-0 w-full h-full border-[12px] border-primary/5 pointer-events-none z-20"></div>

            <div className="absolute top-4 left-4 flex gap-4 text-primary/40">
                <span className="material-symbols-outlined text-sm">security</span>
                <span className="font-mono text-[10px] tracking-widest uppercase">Criptografia: AES-256-GCM</span>
            </div>

            <div className="absolute top-4 right-4 flex gap-4 text-primary/40">
                <span className="font-mono text-[10px] tracking-widest uppercase">Sistema: V4.0.2 // ESTÁVEL</span>
                <span className="material-symbols-outlined text-sm">radar</span>
            </div>

            <div className="absolute bottom-4 left-4 text-primary/40">
                <span className="font-mono text-[10px] tracking-widest uppercase">LAT: 37.7749 // LONG: -122.4194</span>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col items-center max-w-xl w-full px-8 relative z-30">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-12 flex flex-col items-center"
                >
                    <div className="relative mb-0 flex items-center justify-center h-[200px] w-[200px]">
                        {showFallback ? (
                            <SplineFallback />
                        ) : (
                            <Suspense fallback={<SplineFallback />}>
                                <div className="absolute inset-0 z-10 scale-[0.6] flex items-center justify-center pointer-events-none">
                                    <Spline
                                        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                                        onLoad={() => setSplineLoaded(true)}
                                    />
                                </div>
                            </Suspense>
                        )}
                        <div className="absolute inset-x-0 bottom-4 bg-primary/20 blur-2xl rounded-full h-8 w-24 mx-auto"></div>
                    </div>
                    <h1 className="text-7xl font-bold tracking-[0.2em] text-slate-100 dark:text-white uppercase font-display relative z-20 -mt-8">ZVISION</h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-px bg-primary/50 mt-4 mx-auto"
                    />
                </motion.div>

                {/* Terminal Diagnostics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full bg-slate-900/50 dark:bg-primary/5 border border-primary/10 rounded-lg p-6 font-mono mb-12"
                >
                    <div className="flex items-center gap-2 mb-4 border-b border-primary/10 pb-2">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 rounded-full bg-primary/80"
                        />
                        <span className="text-[10px] text-primary/60 uppercase tracking-tighter">Matriz de Diagnóstico Iniciada</span>
                    </div>

                    <div className="space-y-2">
                        {logs.map((log, index) => (
                            visibleLogs.includes(index) && (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-primary/40 text-[10px] pt-1">0{index + 1}</span>
                                    <p className="text-slate-400 dark:text-slate-400 text-xs leading-relaxed uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: log.text.replace(/([^ ]+\.\.\.|\[\|.*?\|\] \d+%|Sucesso)/, '<span class="text-primary/80">$1</span>') }}>
                                    </p>
                                </motion.div>
                            )
                        ))}
                    </div>
                </motion.div>

                {/* Progress Bar Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Sequência de Inicialização</span>
                            <span className="text-xs font-bold text-slate-100 dark:text-white uppercase tracking-tighter font-display">CRM TÁTICO CYBER-CORE</span>
                        </div>
                    </div>
                    <div className="relative h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                            onAnimationComplete={() => {
                                // Redirect user to dashboard exactly after progress bar finishes
                                router.push("/dashboard")
                            }}
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-[8px] font-mono text-primary/40 uppercase">Setor 7-G</span>
                        <span className="text-[8px] font-mono text-primary/40 uppercase">Sincronização do Kernel Ativa</span>
                    </div>
                </motion.div>
            </div>

            {/* Screen Overlay Texture */}
            <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-20"></div>
        </div>
    )
}