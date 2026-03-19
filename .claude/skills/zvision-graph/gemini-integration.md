---
name: gemini-integration
description: Como integrar a API Gemini no Zvision — modelo, chave, streaming, rate limits
type: node
---

# Gemini Integration

O Zvision usa o modelo `gemini-2.0-flash` via `@google/generative-ai` SDK.
A chave de API fica em `.env.local` como `GEMINI_API_KEY` — nunca exposta no client.

## Configuração

A chamada acontece em `lib/actions/gemini.ts` como server action.
Usa [[fluxo-de-dados]] para montar o input com dados do lead antes de chamar a API.
O retorno é um `ReadableStream` para alimentar o [[typewriter-effect]].

## Modelo e Parâmetros

- Modelo: `gemini-2.0-flash` — rápido, suficiente para briefings táticos
- `maxOutputTokens`: 400 — equivale a ~300 palavras, suficiente para o formato
- `temperature`: 0.7 — criativo mas consistente
- Streaming obrigatório — não espera resposta completa

## Rate Limiting

Rate limit simples in-memory: máximo 10 chamadas por minuto.
Se exceder: estado `// AGUARDANDO SLOT DE ANÁLISE` no [[screen-lead-intel-panel]].

## Cache

Briefing gerado é salvo em `leads.ai_briefing` + `leads.briefing_generated_at`.
Se cache existe e tem menos de 24h: usa cache, zero chamada API.
Ver [[lead-briefing-prompt]] para a estrutura completa do prompt.
