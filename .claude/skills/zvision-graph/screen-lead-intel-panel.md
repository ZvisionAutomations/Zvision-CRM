---
name: screen-lead-intel-panel
description: Specs completas do LeadIntelPanel — slide-over 520px, layout, seções, estados do briefing IA
type: node
---

# Screen: LeadIntelPanel

Slide-over que abre da direita ao clicar em qualquer lead.
Arquivo: `components/LeadIntelPanel.tsx`

## Dimensões e Animação

- Largura: 520px (desktop) / 100vw (mobile)
- Entry: `x: 520 → 0`, `opacity: 0 → 1`, duration 0.3s, `cubic-bezier(0.4, 0, 0.2, 1)`
- Exit: `x: 0 → 520`, `opacity: 1 → 0`, duration 0.25s
- Backdrop: `opacity: 0 → 1` simultâneo com entry, `backdrop-blur-sm`
- Usa `AnimatePresence` do Framer Motion para mount/unmount

## Seções (top → bottom)

1. **Header** — nome do lead, empresa, badge de estágio, botão fechar
2. **Briefing IA** — seção principal, ocupa maior parte do painel
3. **Stats Grid** — 2x2 grid com métricas do lead
4. **Activity Log** — timeline de atividades

## Seção Briefing IA — Estados

### Loading (API chamando)
- Dot `pulse-live` + label `// IA PROCESSANDO ALVO` em accent mono 11px
- Shimmer bar animada abaixo

### Streaming (typewriter ativo)
- Texto em `font-mono text-[12px] text-[var(--text-secondary)] whitespace-pre-wrap`
- Cursor `▊` com `animate-pulse` appendado ao final
- Ver [[typewriter-effect]] para implementação

### Completo
- Texto completo renderizado
- Footer: botão `// REGENERAR` + timestamp `Gerado há Xs`

### Erro
- `// FALHA NA CONEXÃO — TENTE NOVAMENTE` em text-muted mono
- Botão retry

### Dados Insuficientes
- `// DADOS INSUFICIENTES PARA ANÁLISE` em text-muted mono

## Corner Brackets

A seção de Briefing IA tem `corner-brackets` aplicado — ornamento tático.
