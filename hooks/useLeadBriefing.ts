import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseLeadBriefingResult {
    briefing: string
    isGenerating: boolean
    error: string | null
    generatedAt: string | null
    regenerate: () => void
}

export function useLeadBriefing(leadId: string | null): UseLeadBriefingResult {
    const [briefing, setBriefing] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [generatedAt, setGeneratedAt] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const hasTriedGeneration = useRef(false)

    const generate = useCallback(async (forceRegenerate = false) => {
        if (!leadId) return

        // Abort previous request if still running
        abortRef.current?.abort()
        const abortController = new AbortController()
        abortRef.current = abortController

        setBriefing('')
        setError(null)
        setIsGenerating(true)

        try {
            // Step 1: Check Supabase cache first (client-side)
            if (!forceRegenerate) {
                const supabase = createClient()
                const { data: lead } = await supabase
                    .from('leads')
                    .select('ai_briefing, ai_briefing_generated_at')
                    .eq('id', leadId)
                    .single()

                if (lead?.ai_briefing && lead.ai_briefing_generated_at) {
                    const generatedTime = new Date(lead.ai_briefing_generated_at).getTime()
                    const twentyFourHours = 24 * 60 * 60 * 1000
                    if (Date.now() - generatedTime < twentyFourHours) {
                        // Use cache — show instantly, no typewriter
                        setBriefing(lead.ai_briefing)
                        setGeneratedAt(lead.ai_briefing_generated_at)
                        setIsGenerating(false)
                        return
                    }
                }
            }

            // Step 2: Call streaming API
            const response = await fetch('/api/briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, forceRegenerate }),
                signal: abortController.signal,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error ?? '// FALHA NA CONEXÃO — TENTE NOVAMENTE')
            }

            // Check if response is JSON (cached) or stream
            const contentType = response.headers.get('content-type') ?? ''
            if (contentType.includes('application/json')) {
                const data = await response.json()
                setBriefing(data.briefing)
                setGeneratedAt(data.generatedAt)
                setIsGenerating(false)
                return
            }

            // Step 3: Read stream — each chunk appended (typewriter effect)
            const reader = response.body?.getReader()
            if (!reader) throw new Error('// FALHA NA CONEXÃO — TENTE NOVAMENTE')

            const decoder = new TextDecoder()
            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                if (abortController.signal.aborted) break

                const chunkText = decoder.decode(value, { stream: true })
                accumulated += chunkText
                setBriefing(accumulated)
            }

            setGeneratedAt(new Date().toISOString())
            setIsGenerating(false)
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return
            const message = err instanceof Error
                ? err.message
                : '// FALHA NA CONEXÃO — TENTE NOVAMENTE'
            setError(message)
            setIsGenerating(false)
        }
    }, [leadId])

    // Auto-generate on mount (only once per leadId)
    useEffect(() => {
        hasTriedGeneration.current = false
        setBriefing('')
        setError(null)
        setGeneratedAt(null)

        if (leadId) {
            hasTriedGeneration.current = true
            generate(false)
        }

        return () => {
            abortRef.current?.abort()
        }
    }, [leadId, generate])

    const regenerate = useCallback(() => {
        generate(true)
    }, [generate])

    return { briefing, isGenerating, error, generatedAt, regenerate }
}
