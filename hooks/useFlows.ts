"use client"

import { useState, useCallback } from 'react'
import { updateFlowStatus } from '@/lib/actions/flows'
import { toast } from 'sonner'
import type { Flow, FlowStatus } from '@/types/database'

interface UseFlowsReturn {
    flows: Flow[]
    isUpdating: Record<string, boolean>
    toggleFlowStatus: (id: string, currentStatus: FlowStatus) => Promise<void>
}

export function useFlows(initialFlows: Flow[]): UseFlowsReturn {
    const [flows, setFlows] = useState<Flow[]>(initialFlows)
    // Track per-id update state for UI feedback
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

    const toggleFlowStatus = useCallback(async (id: string, currentStatus: FlowStatus) => {
        // Only active/paused can be toggled; error state is read-only from UI
        const newStatus: FlowStatus = currentStatus === 'active' ? 'paused' : 'active'

        // Optimistic update
        setFlows(prev =>
            prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
        )
        setIsUpdating(prev => ({ ...prev, [id]: true }))

        const { success, error } = await updateFlowStatus(id, newStatus)

        setIsUpdating(prev => ({ ...prev, [id]: false }))

        if (!success) {
            // Revert on error
            setFlows(prev =>
                prev.map(f => f.id === id ? { ...f, status: currentStatus } : f)
            )
            toast.error('// FALHA AO ATUALIZAR STATUS', {
                description: error ?? 'Tente novamente',
                style: { fontFamily: 'var(--font-mono)', color: 'var(--destructive)' },
            })
        }
    }, [])

    return { flows, isUpdating, toggleFlowStatus }
}
