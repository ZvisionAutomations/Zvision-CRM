---
name: ui-audit-checklist
description: Checklist de conformidade com a identidade Zvision antes de entregar qualquer tela
---

# UI Audit Checklist

Antes de entregar qualquer tela, verificar todos os pontos. Sprint 1 todas as 7 telas passaram neste checklist via revisao com Playwright.

## Identidade Visual

- [ ] Background usa `#0A0A0A` (surface-page) — nao cinza, nao outro preto
- [ ] Cards usam `#111111` (surface-card)
- [ ] Grid tatico visivel no background — `rgba(162,230,53,0.03)` a 40px
- [ ] Nenhuma cor fora da paleta de [[tokens-de-cor]]
- [ ] Verde `#A2E635` apenas em CTAs e dados criticos
- [ ] Azul `#00D4FF` apenas em elementos AI/agentes

## Tipografia

- [ ] Titulos e UI em Space Grotesk
- [ ] Dados, metricas, labels e badges em JetBrains Mono
- [ ] Sem mistura de fontes fora deste padrao

## Tom e Vocabulario

- [ ] "Target" em vez de "Cliente"
- [ ] "Intel" em vez de "Notas"
- [ ] ">>" em vez de "→"
- [ ] Tom operacional em todos os textos

## Componentes

- [ ] Cards com corner ornaments onde aplicavel
- [ ] Bordas usando `rgba(255,255,255,0.06)` — nao bordas solidas
- [ ] Estados hover com feedback visual sutil
- [ ] Animacoes com Framer Motion (nao CSS puro para transicoes complexas)

## Dados

- [ ] Todos os dados vem do Supabase (nao mock data em producao)
- [ ] Estados de loading implementados
- [ ] Estados de erro tratados

## Responsividade

- [ ] Testado em mobile (375px)
- [ ] Testado em desktop (1280px+)

## Como Usar

Rodar revisao visual com Playwright via [[ralph-loop]] antes de marcar qualquer tela como concluida.
