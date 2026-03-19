"use client"

import { useState, useCallback } from 'react'
import { updateAgentStatus } from '@/lib/actions/agents'
import { toast } from 'sonner'
import type { Agent, AgentStatus } from '@/types/database'

interface UseAgentsReturn {
    agents: Agent[]
    isUpdating: Record<string, boolean>
    toggleAgentStatus: (id: string, currentStatus: AgentStatus) => Promise<void>
}

export function useAgents(initialAgents: Agent[]): UseAgentsReturn {
    const [agents, setAgents] = useState<Agent[]>(initialAgents)
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

    const toggleAgentStatus = useCallback(async (id: string, currentStatus: AgentStatus) => {
        // Only active/paused can be toggled; error state is read-only
        const newStatus: AgentStatus = currentStatus === 'active' ? 'paused' : 'active'

        // Optimistic update
        setAgents(prev =>
            prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
        )
        setIsUpdating(prev => ({ ...prev, [id]: true }))

        const { success, error } = await updateAgentStatus(id, newStatus)

        setIsUpdating(prev => ({ ...prev, [id]: false }))

        if (!success) {
            // Revert on error
            setAgents(prev =>
                prev.map(a => a.id === id ? { ...a, status: currentStatus } : a)
            )
            toast.error('// FALHA AO ATUALIZAR AGENTE', {
                description: error ?? 'Tente novamente',
                style: { fontFamily: 'var(--font-mono)', color: 'var(--destructive)' },
            })
        }
    }, [])

    return { agents, isUpdating, toggleAgentStatus }
}
