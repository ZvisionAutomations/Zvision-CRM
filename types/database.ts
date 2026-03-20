export type PipelineStage =
    | 'NOVO_LEAD'
    | 'QUALIFICACAO'
    | 'REUNIAO_BRIEFING'
    | 'REUNIAO_PROPOSTA'
    | 'FECHAMENTO'
    | 'KIA'

export type SignalStrength = 'ALTO' | 'MEDIO' | 'BAIXO'

export type ActivityType =
    | 'STAGE_CHANGE'
    | 'NOTE'
    | 'EMAIL'
    | 'MEETING'
    | 'CALL'
    | 'AI_BRIEFING'

export interface Company {
    id: string
    name: string
    slug: string
    plan: string
    created_at: string
}

export interface User {
    id: string
    company_id: string
    name: string | null
    email: string
    role: 'admin' | 'operator'
    avatar_url: string | null
    created_at: string
}

export interface Lead {
    id: string
    company_id: string
    name: string
    email: string | null
    phone: string | null
    company_name: string
    company_website: string | null
    company_linkedin: string | null
    estimated_value: number | null
    pipeline_stage: PipelineStage
    signal_strength: SignalStrength
    win_probability: number
    ai_briefing: string | null
    ai_briefing_generated_at: string | null
    assigned_to: string | null
    deleted_at: string | null
    created_at: string
    updated_at: string
}

export interface Activity {
    id: string
    company_id: string
    lead_id: string
    user_id: string | null
    type: ActivityType
    title: string
    description: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

export interface Import {
    id: string
    company_id: string
    user_id: string | null
    filename: string
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
    total_rows: number | null
    processed_rows: number
    error_log: unknown | null
    created_at: string
}

export interface ApiKey {
    id: string
    company_id: string
    user_id: string
    label: string
    key_hash: string
    key_preview: string
    is_active: boolean
    expires_at: string | null
    last_used_at: string | null
    created_at: string
}

export type FlowType = 'internal' | 'client'
export type FlowStatus = 'active' | 'paused' | 'error'

// ─── Agent types (CA-4 — Agent Command Center) ────────────────────────────────

export type AgentType = 'sdr' | 'atendente' | 'qualificador' | 'whatsapp' | 'n8n'
export type AgentPlatform = 'interno' | 'whatsapp' | 'n8n'
export type AgentStatus = 'active' | 'paused' | 'error'

export interface AgentMetrics {
    mensagens?: number
    taxa_resposta?: number
    leads_qualificados?: number
    [key: string]: number | undefined
}

export interface Agent {
    id: string
    company_id: string
    name: string
    type: AgentType
    platform: AgentPlatform
    status: AgentStatus
    client_name: string | null
    is_internal: boolean
    metrics: AgentMetrics
    activity_history: number[]
    last_active_at: string
    created_at: string
}

// ─── Financial types (CA-3 — Financial Command Center) ───────────────────────

export type ExpenseCategory = 'ferramenta' | 'operacao' | 'pessoal' | 'marketing'

export interface Expense {
    id: string
    company_id: string
    name: string
    amount: number
    category: ExpenseCategory
    month: string
    created_at: string
}

export type SubscriptionBillingCycle = 'mensal' | 'anual'
export type SubscriptionCategory = 'ia' | 'infra' | 'marketing' | 'vendas'
export type SubscriptionStatus = 'active' | 'cancelled'

export interface Subscription {
    id: string
    company_id: string
    name: string
    amount: number
    billing_cycle: SubscriptionBillingCycle
    category: SubscriptionCategory
    status: SubscriptionStatus
    next_billing_date: string | null
    created_at: string
}

export interface FlowMetrics {
    execucoes?: number
    taxa_sucesso?: number
    leads_processados?: number
    [key: string]: number | undefined
}

export interface Flow {
    id: string
    company_id: string
    name: string
    type: FlowType
    status: FlowStatus
    metrics: FlowMetrics
    execution_history: number[]
    last_run_at: string
    created_at: string
}
