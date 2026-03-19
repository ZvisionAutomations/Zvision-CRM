---
name: fluxo-de-dados
description: Como os dados do lead fluem do Supabase até o prompt do Gemini e de volta para cache
type: node
---

# Fluxo de Dados — Lead → Gemini → Cache

Descreve o pipeline completo de dados para geração de briefings.

## Input: Lead → Prompt

Dados extraídos da tabela `leads` no Supabase:
- `name` — nome do contato
- `company` — nome da empresa (obrigatório para análise)
- `website` — URL do site (opcional, enriquece o briefing)
- `stage` — estágio atual no pipeline
- `notes` — notas existentes do operador

Esses campos alimentam o [[lead-briefing-prompt]] antes de chamar [[gemini-integration]].

## Cache: Gemini → Supabase

Após geração, o briefing é persistido:

```sql
UPDATE leads SET
  ai_briefing = $1,
  briefing_generated_at = NOW()
WHERE id = $2
```

## Cache Check (hook)

Antes de qualquer chamada API, `useLeadBriefing` verifica:
1. `leads.ai_briefing` não é null
2. `leads.briefing_generated_at` é menos de 24h atrás

Se ambos verdadeiros: usa cache. Zero chamada API.
Ver [[typewriter-effect]] — cache é exibido instantaneamente sem animação de cursor.
