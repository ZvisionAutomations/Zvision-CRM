import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users').select('company_id').eq('id', user.id).single()
        if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 403 })

        // Busca o lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', params.id)
            .eq('company_id', profile.company_id)
            .is('deleted_at', null)
            .single()

        if (leadError || !lead) {
            return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
        }

        // Tenta scraping via Apify (se token disponível)
        let scrapedData = ''
        if (process.env.APIFY_TOKEN && lead.company_website) {
            try {
                const apifyRes = await fetch(
                    `https://api.apify.com/v2/acts/apify~website-content-crawler/run-sync-get-dataset-items` +
                    `?token=${process.env.APIFY_TOKEN}&maxCrawlPages=3`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ startUrls: [{ url: lead.company_website }] }),
                        signal: AbortSignal.timeout(30000),
                    }
                )
                if (apifyRes.ok) {
                    const pages = await apifyRes.json()
                    scrapedData = pages.slice(0, 3)
                        .map((p: { text?: string }) => p.text ?? '').join('\n\n').slice(0, 3000)
                }
            } catch (apifyError) {
                console.warn('[briefing] Apify indisponível, usando dados do lead:', apifyError)
            }
        }

        // Gera briefing via IA interna
        const prompt = `Você é um analista de inteligência tática de vendas B2B.
Gere um briefing conciso e acionável para o operador de vendas sobre este lead.

DADOS DO LEAD:
- Nome: ${lead.name}
- Empresa: ${lead.company_name}
- Website: ${lead.company_website ?? 'Não informado'}
- LinkedIn: ${lead.company_linkedin ?? 'Não informado'}
- Valor estimado: ${lead.estimated_value ? `R$ ${lead.estimated_value.toLocaleString('pt-BR')}` : 'Não informado'}
${scrapedData ? `\nCONTEÚDO DO SITE:\n${scrapedData}` : ''}

FORMATO DO BRIEFING (máximo 200 palavras):
1. O que a empresa faz (2 linhas)
2. Dores prováveis que nosso serviço resolve
3. Ângulo de abordagem recomendado
4. Recomendação tática: como iniciar o contato

Seja direto, tático e específico. Sem introduções genéricas.`

        const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7,
                    },
                }),
            }
        )

        const aiData = await aiRes.json()
        const briefing = aiData.candidates?.[0]?.content?.parts?.[0]?.text
            ?? 'Briefing indisponível.'

        // Salva no lead
        await supabase
            .from('leads')
            .update({
                ai_briefing: briefing,
                ai_briefing_generated_at: new Date().toISOString(),
            })
            .eq('id', params.id)

        // Registra activity
        await supabase.from('activities').insert({
            company_id: profile.company_id,
            lead_id: params.id,
            user_id: user.id,
            type: 'AI_BRIEFING',
            title: 'Briefing de IA gerado',
            description: 'Análise tática gerada automaticamente.',
        })

        return NextResponse.json({ briefing, generated_at: new Date().toISOString() })
    } catch (error) {
        console.error('[briefing/route] Falha:', { id: params.id, error })
        return NextResponse.json(
            { error: 'Falha ao gerar briefing. Tente novamente.' },
            { status: 500 }
        )
    }
}
