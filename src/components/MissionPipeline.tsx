"use client"

import React, { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { MoreHorizontal, Target, Shield, Clock } from "lucide-react"

type LeadStatus = 'NOVO LEAD' | 'QUALIFICAÇÃO' | 'REUNIÃO BRIEFING' | 'REUNIÃO PROPOSTA' | 'FECHAMENTO'

interface Lead {
    id: string
    name: string
    company: string
    value: string
    status: LeadStatus
    confidence: number
    lastActive: string
}

const COLUMNS: LeadStatus[] = [
    'NOVO LEAD',
    'QUALIFICAÇÃO',
    'REUNIÃO BRIEFING',
    'REUNIÃO PROPOSTA',
    'FECHAMENTO'
]

const INITIAL_DATA: Lead[] = [
    { id: 'L-101', name: 'Alvo Alpha', company: 'Indústrias Weyland', value: 'R$ 1.5M', status: 'NOVO LEAD', confidence: 45, lastActive: '2h' },
    { id: 'L-102', name: 'Alvo Bravo', company: 'Sistemas CyberDyne', value: 'R$ 800K', status: 'QUALIFICAÇÃO', confidence: 65, lastActive: '5h' },
    { id: 'L-103', name: 'Alvo Charlie', company: 'Tyrell Corp', value: 'R$ 2.4M', status: 'REUNIÃO BRIEFING', confidence: 82, lastActive: '1d' },
    { id: 'L-104', name: 'Alvo Delta', company: 'Tecnologias Oscorp', value: 'R$ 450K', status: 'REUNIÃO PROPOSTA', confidence: 91, lastActive: '4h' },
]

export default function MissionPipeline() {
    const [leads, setLeads] = useState<Lead[]>(INITIAL_DATA)

    // Para evitar render issues com Droppable em strict mode
    const [isBrowser, setIsBrowser] = useState(false)
    React.useEffect(() => {
        setIsBrowser(true)
    }, [])

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const newLeads = Array.from(leads)
        const draggedLeadIndex = newLeads.findIndex(l => l.id === draggableId)
        const draggedLead = newLeads[draggedLeadIndex]

        // Remove from array temporarily
        newLeads.splice(draggedLeadIndex, 1)

        // Update status based on the column dropped
        draggedLead.status = destination.droppableId as LeadStatus

        // In a real app we would splice it back into the right visual index,
        // but here we just append it and sorting handles grouping for now.
        newLeads.splice(destination.index, 0, draggedLead)

        setLeads(newLeads)
    }

    if (!isBrowser) return null

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-widest text-slate-100 uppercase">Mission Pipeline</h2>
                    <p className="text-[10px] font-mono text-primary flex items-center gap-2 mt-1 uppercase">
                        <Target className="w-3 h-3" />
                        Engajamento Tático Ativo
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 bg-[#0d0d10] border border-white/10 rounded-lg flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Valuation Total</span>
                        <span className="font-mono text-primary font-bold">R$ 5.15M</span>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 flex items-center gap-2 rounded text-xs font-bold font-mono tracking-widest uppercase transition-colors">
                        + INJETAR LEAD
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map((columnId) => {
                        const columnLeads = leads.filter(l => l.status === columnId)

                        return (
                            <div key={columnId} className="flex-shrink-0 w-80 flex flex-col bg-[#0d0d10]/40 border border-white/5 rounded-lg backdrop-blur-sm overflow-hidden h-full">
                                {/* Cabeçalho da Coluna */}
                                <div className="p-4 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-primary font-mono uppercase tracking-widest">{columnId}</h3>
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
                                                {columnLeads.map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`
                                  group relative p-4 mb-3 rounded-lg border 
                                  ${snapshot.isDragging ? 'bg-[#141418] border-primary/50 shadow-neon scale-105' : 'bg-[#141418]/80 border-white/10 hover:border-primary/30'}
                                  transition-all
                                `}
                                                            >
                                                                {snapshot.isDragging && (
                                                                    <div className="absolute inset-0 bg-primary/5 rounded-lg active-glow pointer-events-none"></div>
                                                                )}
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                                        <span className="text-[10px] font-mono text-slate-500">{lead.id}</span>
                                                                    </div>
                                                                    <button className="text-slate-500 hover:text-primary transition-colors">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <h4 className="font-bold text-slate-100 text-sm mb-1">{lead.company}</h4>
                                                                <p className="text-xs text-slate-400 mb-4">{lead.name}</p>

                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                                                        <span className="text-slate-500 uppercase">Valuation</span>
                                                                        <span className="text-primary font-bold">{lead.value}</span>
                                                                    </div>

                                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: `${lead.confidence}%` }}></div>
                                                                    </div>

                                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                                                        <div className="flex items-center gap-1.5 text-slate-500">
                                                                            <Shield className="w-3 h-3" />
                                                                            <span className="text-[9px] font-mono uppercase">{lead.confidence}% Conf.</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-slate-500">
                                                                            <Clock className="w-3 h-3" />
                                                                            <span className="text-[9px] font-mono">{lead.lastActive}</span>
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
        </div>
    )
}
