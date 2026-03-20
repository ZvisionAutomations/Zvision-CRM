import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// ─── Rate Limiter (in-memory) ────────────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(companyId: string): boolean {
    const now = Date.now()
    const timestamps = rateLimitMap.get(companyId) ?? []
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    rateLimitMap.set(companyId, recent)
    return recent.length < RATE_LIMIT_MAX
}

function recordRateLimitHit(companyId: string): void {
    const timestamps = rateLimitMap.get(companyId) ?? []
    timestamps.push(Date.now())
    rateLimitMap.set(companyId, timestamps)
}

// ─── Auth ────────────────────────────────────────────────────────────────────
async function getAuthContext() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { /* Server Component context — safe to ignore */ }
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    )

    const { data: profile } = await adminClient
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return { adminClient, company_id: profile.company_id }
}

// ─── Prompt builder (from [[lead-briefing-prompt]]) ─────────────────────────
function buildPrompt(lead: {
    name: string
    company_name: string
    company_website: string | null
    pipeline_stage: string
}): string {
    return `Você é um analista de inteligência de vendas de elite.
Analise o seguinte lead e gere um briefing tático conciso.

Empresa: ${lead.company_name}
Nome do contato: ${lead.name}
Website: ${lead.company_website ?? 'não informado'}
Estágio atual: ${lead.pipeline_stage}

Responda EXATAMENTE neste formato:

// ANÁLISE DE ALVO: ${lead.company_name.toUpperCase()}

PERFIL OPERACIONAL
[2-3 frases sobre o que a empresa faz, posição de mercado]

VETOR DE ENTRADA
[Principal dor ou oportunidade baseada no estágio e perfil]

INTELIGÊNCIA DE CAMPO
[Insight específico: sinal de contratação, tech stack, notícia recente]

RECOMENDAÇÃO TÁTICA
[Próximo movimento concreto — o que dizer, qual ângulo, o que evitar]

NÍVEL DE PRIORIDADE: [CRÍTICO / ALTO / MÉDIO / BAIXO]
Justificativa: [uma frase]

Seja específico, direto, sem rodeios.
Máximo 300 palavras. Linguagem de operações táticas.`
}

// ─── POST /api/briefing ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY não configurada' },
            { status: 500 }
        )
    }

    const auth = await getAuthContext()
    if (!auth) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { adminClient, company_id } = auth
    const body = await request.json()
    const leadId: string | undefined = body.leadId
    const forceRegenerate: boolean = body.forceRegenerate === true

    if (!leadId) {
        return NextResponse.json({ error: 'leadId obrigatório' }, { status: 400 })
    }

    // Rate limit check
    if (!checkRateLimit(company_id)) {
        return NextResponse.json(
            { error: '// AGUARDANDO SLOT DE ANÁLISE' },
            { status: 429 }
        )
    }

    // Fetch lead
    const { data: lead, error: leadError } = await adminClient
        .from('leads')
        .select('id, name, company_name, company_website, pipeline_stage, ai_briefing, ai_briefing_generated_at')
        .eq('id', leadId)
        .eq('company_id', company_id)
        .single()

    if (leadError || !lead) {
        return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Insufficient data check
    if (!lead.company_name || lead.company_name.trim() === '') {
        return NextResponse.json(
            { error: '// DADOS INSUFICIENTES PARA ANÁLISE' },
            { status: 422 }
        )
    }

    // Cache check (skip if force regenerate)
    if (!forceRegenerate && lead.ai_briefing && lead.ai_briefing_generated_at) {
        const generatedAt = new Date(lead.ai_briefing_generated_at).getTime()
        const twentyFourHours = 24 * 60 * 60 * 1000
        if (Date.now() - generatedAt < twentyFourHours) {
            return NextResponse.json({
                briefing: lead.ai_briefing,
                generatedAt: lead.ai_briefing_generated_at,
                cached: true,
            })
        }
    }

    // Record rate limit hit
    recordRateLimitHit(company_id)

    // Stream from Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.7,
        },
    })

    const prompt = buildPrompt(lead)

    try {
        const streamResult = await model.generateContentStream(prompt)
        let fullText = ''

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()
                try {
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text()
                        fullText += chunkText
                        controller.enqueue(encoder.encode(chunkText))
                    }
                    controller.close()

                    // Persist to cache after stream completes
                    await adminClient
                        .from('leads')
                        .update({
                            ai_briefing: fullText,
                            ai_briefing_generated_at: new Date().toISOString(),
                        })
                        .eq('id', leadId)
                } catch (err) {
                    controller.error(err)
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        })
    } catch (err) {
        console.error('Gemini error:', err)
        const message = err instanceof Error ? err.message : String(err)
        const status = (err as { status?: number }).status

        return new Response(
            JSON.stringify({
                error: message,
                status: status ?? 'unknown',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
