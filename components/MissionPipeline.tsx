"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { MoreHorizontal, Target, Shield, Clock, Loader2 } from "lucide-react"
import type { Lead, PipelineStage } from '@/types/database'
import { getLeads, updateLeadStage } from "@/lib/actions/leads"
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { NewLeadDialog } from "@/components/dashboard/new-lead-dialog"
import { ImportLeadsDialog } from "@/components/dashboard/import-leads-dialog"
import LeadIntelPanel from "@/components/LeadIntelPanel"
import { formatCompactCurrency } from "@/lib/formatters"

const COLUMNS: PipelineStage[] = [
    'NOVO_LEAD',
    'QUALIFICACAO',
    'REUNIAO_BRIEFING',
    'REUNIAO_PROPOSTA',
    'FECHAMENTO'
]

// Helpers para formatação na UI
const columnLabels: Record<PipelineStage, string> = {
    'NOVO_LEAD': 'NOVO LEAD',
    'QUALIFICACAO': 'QUALIFICAÇÃO',
    'REUNIAO_BRIEFING': 'REUNIÃO BRIEFING',
    'REUNIAO_PROPOSTA': 'REUNIÃO PROPOSTA',
    'FECHAMENTO': 'FECHAMENTO',
    'KIA': 'KIA'
}

export default function MissionPipeline() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<{ id: string; name: string } | null>(null)

    // Para evitar render issues com Droppable em strict mode
    const [isBrowser, setIsBrowser] = useState(false)

    const fetchLeads = useCallback(async () => {
        try {
            const { leads: data } = await getLeads({ limit: 1000 })
            setLeads(data)
        } catch (error) {
            console.error("Failed to load leads:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        setIsBrowser(true)
        fetchLeads()
    }, [fetchLeads])

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const newLeads = Array.from(leads)
        const draggedLeadIndex = newLeads.findIndex(l => l.id === draggableId)
        const draggedLead = newLeads[draggedLeadIndex]

        // Remove from array temporarily
        newLeads.splice(draggedLeadIndex, 1)

        // Optimistic UI Update
        const previousStage = draggedLead.pipeline_stage
        const newStage = destination.droppableId as PipelineStage
        draggedLead.pipeline_stage = newStage

        newLeads.splice(destination.index, 0, draggedLead)
        setLeads(newLeads)

        // Call Server Action
        try {
            await updateLeadStage(draggableId, newStage)
        } catch (error) {
            console.error("Failed to update status", error)
            // Revert on failure
            const revertedLeads = Array.from(newLeads)
            const revertIndex = revertedLeads.findIndex(l => l.id === draggableId)
            revertedLeads.splice(revertIndex, 1)
            draggedLead.pipeline_stage = previousStage
            revertedLeads.splice(source.index, 0, draggedLead)
            setLeads(revertedLeads)
        }
    }

    // All hooks must be called before conditional returns (Rules of Hooks)
    const formatCurrency = formatCompactCurrency

    const { totalValuation, leadsByStage } = useMemo(() => {
        const totalValuation = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
        const leadsByStage = leads.reduce<Record<string, Lead[]>>((acc, lead) => {
            const stage = lead.pipeline_stage
            if (!acc[stage]) acc[stage] = []
            acc[stage].push(lead)
            return acc
        }, {})
        return { totalValuation, leadsByStage }
    }, [leads])

    if (!isBrowser) return null

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col min-w-0 h-full p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="h-8 w-64 bg-white/5 animate-pulse rounded"></div>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase">// Mission Pipeline</h2>
                    <p className="text-[10px] font-mono text-primary flex items-center gap-2 mt-1 uppercase">
                        <Target className="w-3 h-3" />
                        Engajamento Tático Ativo
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 bg-[#0d0d10] border border-white/10 rounded-lg flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Valuation Total</span>
                        <span className="font-mono text-primary font-bold">{formatCurrency(totalValuation)}</span>
                    </div>
                    <ImportLeadsDialog onSuccess={fetchLeads} />
                    <NewLeadDialog onSuccess={fetchLeads} />
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map((columnId) => {
                        const columnLeads = leadsByStage[columnId] ?? []

                        return (
                            <div key={columnId} className="flex-shrink-0 w-80 flex flex-col bg-[#0d0d10]/40 border border-white/5 rounded-lg backdrop-blur-sm overflow-hidden h-full">
                                {/* Cabeçalho da Coluna */}
                                <div className="p-4 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-primary font-mono uppercase tracking-widest">{columnLabels[columnId as PipelineStage] || columnId}</h3>
                                    <span className="bg-primary/20 text-primary text-[10px] font-mono px-2 py-0.5 rounded-full border border-primary/30">
                                        {columnLeads.length}
                                    </span>
                                </div>

                                {/* Área Dropável */}
                                <div className="flex-1 p-3 overflow-y-auto">
                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`min-h-[150px] h-full ${snapshot.isDraggingOver ? 'bg-primary/5 rounded' : ''} transition-colors`}
                                            >
                                                {columnLeads.filter(l => l.pipeline_stage === columnId).map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            // CSS-only hover/tap for DnD cards — motion.div conflicts with @hello-pangea/dnd
                                                            // onDragStart signature. CSS transitions are equally fast (<200ms) for this use case.
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => {
                                                                    // Only open panel on click, not on drag end
                                                                    if (!snapshot.isDragging) {
                                                                        setSelectedLead({ id: lead.id, name: lead.name })
                                                                    }
                                                                }}
                                                                className={`
                                  group relative p-4 mb-3 rounded-[4px] border cursor-pointer
                                  transition-all duration-200
                                  ${snapshot.isDragging
                                    ? 'bg-[#141418] border-[rgba(162,230,53,0.5)] shadow-[0_0_8px_rgba(162,230,53,0.25),0_0_16px_rgba(162,230,53,0.10)] scale-105'
                                    : 'bg-[#141418]/80 border-white/10 hover:-translate-y-0.5 hover:border-[rgba(162,230,53,0.35)] hover:shadow-[0_0_8px_rgba(162,230,53,0.25),0_0_16px_rgba(162,230,53,0.10)] active:scale-[0.99] active:translate-y-0'}
                                `}
                                                            >
                                                                {snapshot.isDragging && (
                                                                    <div className="absolute inset-0 bg-[rgba(162,230,53,0.03)] rounded-[4px] pointer-events-none"></div>
                                                                )}
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] pulse-live"></div>
                                                                        <span className="text-[10px] font-mono text-muted-foreground">#{lead.id.slice(0, 8).toUpperCase()}</span>
                                                                    </div>
                                                                    <button
                                                                        className="text-muted-foreground hover:text-primary transition-colors"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <h4 className="font-bold text-foreground text-sm mb-1">{lead.company_name}</h4>
                                                                <p className="text-xs text-muted-foreground mb-4">{lead.name}</p>

                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                                                        <span className="text-muted-foreground uppercase">Valuation</span>
                                                                        <span className="text-primary font-bold">{formatCurrency(lead.estimated_value)}</span>
                                                                    </div>

                                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: `${lead.win_probability}%` }}></div>
                                                                    </div>

                                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                            <Shield className="w-3 h-3" />
                                                                            <span className="text-[9px] font-mono uppercase">{lead.win_probability}% Conv.</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                                            <Clock className="w-3 h-3" />
                                                                            <span className="text-[9px] font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-16">
                                                                                {formatDistanceToNow(new Date(lead.updated_at), { locale: ptBR, addSuffix: false })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        )
                    })}
                </DragDropContext>
            </div>

            {/* Lead Intel Panel — slide-over from right */}
            <LeadIntelPanel
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                leadId={selectedLead?.id ?? ""}
                leadName={selectedLead?.name ?? ""}
            />
        </div>
    )
}
