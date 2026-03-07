"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bot, Shield, Zap, Target, Database, Terminal } from "lucide-react"
import { useTypewriter } from "@/hooks/useTypewriter"

interface LeadIntelPanelProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    leadName: string
}

export default function LeadIntelPanel({ isOpen, onClose, leadId, leadName }: LeadIntelPanelProps) {
    // Dados simulados do briefing
    const baseIntelText = `[INÍCIO DO RELATÓRIO DE INTELIGÊNCIA]

ALVO ATUAL: ${leadName}
ID_HEX: ${leadId}
NÍVEL DE AMEAÇA COMERCIAL: BAIXO
PROBABILIDADE DE CONVERSÃO: 82.4%

-> ANÁLISE DE VETOR:
A empresa demonstrou vazamentos de ineficiência operacional no setor logístico. 
Tentativas anteriores de otimização falharam por falta de centralização de dados.
Nossa solução Cyber-Core preenche exatamente esta lacuna.

-> PONTOS CRÍTICOS (DORES IDENTIFICADAS):
1. Tempo de resposta ao cliente acima de 48h (Crítico)
2. Retenção de leads caindo 15% ao trimestre
3. Sistemas legado sem interoperabilidade

-> RECOMENDAÇÃO TÁTICA:
Ataque direto apresentando o módulo de Automação de Retenção. Focar em ROI imediato e redução de atrito. Evite mencionar custos de implantação até a fase 3.

[FIM DO RELATÓRIO - SCRIBED BY ZVISION AI]`

    // Only run typewriter when modal is open and animation finishes opening
    const [shouldType, setShouldType] = useState(false)

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => setShouldType(true), 400)
        } else {
            timer = setTimeout(() => setShouldType(false), 0)
        }
        return () => clearTimeout(timer)
    }, [isOpen])

    const { displayedText, isTyping } = useTypewriter(shouldType ? baseIntelText : "", 30)

    // Block background scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-[#050506]/80 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg z-50 flex flex-col glass-sidebar border-l border-primary/20 shadow-[-10px_0_30px_rgba(162,230,53,0.05)] bg-[#0d0d10]"
                    >
                        {/* Header HUD */}
                        <header className="p-5 border-b border-primary/20 bg-primary/5 flex items-start justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>

                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded bg-background-dark border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(162,230,53,0.15)] relative">
                                    <Bot className="w-6 h-6 text-primary" />
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-100 uppercase tracking-wider">Briefing Tático IA</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono text-primary border border-primary/30 px-1.5 rounded bg-primary/10">NÍVEL OMEGA</span>
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{leadId}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                aria-label="Fechar Briefing"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        {/* Quick Stats Strip */}
                        <div className="grid grid-cols-3 border-b border-white/5 bg-black/20">
                            <div className="p-3 border-r border-white/5 text-center">
                                <Shield className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                <span className="block text-[10px] font-mono text-slate-400 uppercase">Defesa</span>
                                <strong className="text-xs font-mono text-slate-200">BAIXA</strong>
                            </div>
                            <div className="p-3 border-r border-white/5 text-center">
                                <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                                <span className="block text-[10px] font-mono text-slate-400 uppercase">Atrito</span>
                                <strong className="text-xs font-mono text-yellow-500">MÉDIO</strong>
                            </div>
                            <div className="p-3 text-center">
                                <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                                <span className="block text-[10px] font-mono text-slate-400 uppercase">Conv.</span>
                                <strong className="text-xs font-mono text-primary">ALTA</strong>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                            <div className="absolute inset-0 pointer-events-none opacity-20 tactical-grid"></div>

                            {/* Typewriter Output */}
                            <div className="relative z-10 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {displayedText}
                                {isTyping && <span className="inline-block w-2 bg-primary h-4 ml-1 animate-pulse align-middle"></span>}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <footer className="p-5 border-t border-white/5 bg-background-dark flex gap-3">
                            <button className="flex-1 py-3 bg-primary text-background-dark font-bold text-[11px] font-mono tracking-widest uppercase rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                <Terminal className="w-4 h-4" />
                                Copiar Padrão de Ataque
                            </button>
                            <button className="px-5 py-3 border border-white/10 text-slate-400 hover:text-slate-100 hover:border-slate-500 font-bold text-[11px] font-mono uppercase rounded transition-colors flex items-center justify-center">
                                <Database className="w-4 h-4" />
                            </button>
                        </footer>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    )
}
